const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const babel = require('@babel/core');

const filename = path.join(__dirname, '../app/utils/photoUpload.js');
const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    filename,
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
});

function loadHelper({ width = 4032, height = 3024, size = 1234567, fail = '' } = {}) {
    const calls = { sources: [], sizes: [], saves: [], imageReleases: 0, contextReleases: 0, active: 0, maxActive: 0 };
    const module = { exports: {} };
    vm.runInNewContext(code, {
        module,
        exports: module.exports,
        require(name) {
            if (name === 'expo-file-system/legacy') return {
                getInfoAsync: async () => ({ exists: fail !== 'missing', size }),
            };
            assert.equal(name, 'expo-image-manipulator');
            return {
                SaveFormat: { JPEG: 'jpeg' },
                ImageManipulator: {
                    manipulate(uri) {
                        calls.sources.push(uri);
                        calls.active += 1;
                        calls.maxActive = Math.max(calls.maxActive, calls.active);
                        let renderedWidth = width;
                        let renderedHeight = height;
                        return {
                            resize(dimensions) {
                                calls.sizes.push({ ...dimensions });
                                const ratio = width / height;
                                renderedWidth = dimensions.width || dimensions.height * ratio;
                                renderedHeight = dimensions.height || dimensions.width / ratio;
                            },
                            async renderAsync() {
                                if (fail === 'decode') throw new Error('Invalid HEIF');
                                return {
                                    width: renderedWidth,
                                    height: renderedHeight,
                                    async saveAsync(options) {
                                        calls.saves.push({ ...options });
                                        if (fail === 'save') throw new Error('Disk full');
                                        return { uri: 'file:///cache/converted.jpg', width: renderedWidth, height: renderedHeight };
                                    },
                                    release() { calls.imageReleases += 1; },
                                };
                            },
                            release() {
                                calls.contextReleases += 1;
                                calls.active -= 1;
                            },
                        };
                    },
                },
            };
        },
    }, { filename });
    return { ...module.exports, calls };
}

test('recognizes iPhone format variants without relying on the supplied MIME type', () => {
    const { isHeifPhoto } = loadHelper();
    for (const asset of [
        { fileName: 'IMG_1234.HEIC' },
        { name: 'IMG_1234.heif', mimeType: 'application/octet-stream' },
        { uri: 'file:///cache/IMG_1234.hif?download=1' },
        { mimeType: 'IMAGE/X-HEIC; charset=binary' },
        { mimeType: 'image/heif-sequence' },
        { fileName: 'burst.heics' },
        { fileName: 'burst.heifs' },
    ]) assert.equal(isHeifPhoto(asset), true);
    assert.equal(isHeifPhoto({ name: 'heic-notes.pdf', mimeType: 'application/pdf' }), false);
});

test('JPEG/PNG photos and documents pass through unchanged', async () => {
    const { preparePhotosForUpload, calls } = loadHelper();
    const assets = [
        { uri: 'file:///a.jpg', fileName: 'a.jpg', mimeType: 'image/jpeg' },
        { uri: 'file:///a.png', fileName: 'a.png', mimeType: 'image/png' },
        { uri: 'file:///a.pdf', name: 'a.pdf', mimeType: 'application/pdf' },
    ];
    const prepared = await preparePhotosForUpload(assets);
    prepared.forEach((asset, index) => assert.equal(asset, assets[index]));
    assert.equal(calls.sources.length, 0);
});

test('encodes HEIF as JPEG and uses the converted file, dimensions and size for upload validation', async () => {
    const { preparePhotoForUpload, calls } = loadHelper();
    const original = { uri: 'file:///IMG_1234.HEIC', fileName: 'my.photo.HEIC', mimeType: 'image/heic', fileSize: 9 * 1024 * 1024 };
    const prepared = await preparePhotoForUpload(original);
    assert.equal(prepared.uri, 'file:///cache/converted.jpg');
    assert.equal(prepared.fileName, 'my.photo.jpg');
    assert.equal(prepared.name, 'my.photo.jpg');
    assert.equal(prepared.mimeType, 'image/jpeg');
    assert.equal(prepared.fileSize, 1234567);
    assert.equal(prepared.size, 1234567);
    assert.equal(prepared.width, 2560);
    assert.equal(prepared.height, 1920);
    assert.deepEqual(calls.saves, [{ format: 'jpeg', compress: 0.9 }]);
    assert.deepEqual(calls.sizes, [{ width: 2560 }]);
    assert.equal(original.mimeType, 'image/heic');
    assert.equal(calls.active, 0);
    assert.equal(calls.imageReleases, 2);
});

test('bounds portrait photos using their decoded orientation', async () => {
    const { preparePhotoForUpload, calls } = loadHelper({ width: 3024, height: 4032 });
    const prepared = await preparePhotoForUpload({ uri: 'file:///portrait.heif', width: 4032, height: 3024 });
    assert.equal(prepared.width, 1920);
    assert.equal(prepared.height, 2560);
    assert.deepEqual(calls.sizes, [{ height: 2560 }]);
});

test('does not upscale small photos or hide the actual size of the JPEG', async () => {
    const size = 6 * 1024 * 1024;
    const { preparePhotoForUpload, calls } = loadHelper({ width: 640, height: 480, size });
    const prepared = await preparePhotoForUpload({ name: 'photo.heif', uri: 'file:///photo.heif' });
    assert.equal(prepared.width, 640);
    assert.equal(prepared.height, 480);
    assert.equal(prepared.fileSize, size);
    assert.equal(calls.sizes.length, 0);
});

for (const fail of ['decode', 'save', 'missing']) {
    test(`does not send an unconverted file after ${fail} failure and releases native resources`, async () => {
        const { preparePhotoForUpload, calls } = loadHelper({ fail });
        await assert.rejects(
            preparePhotoForUpload({ uri: 'file:///broken.heic', fileName: 'broken.heic' }),
            /broken\.heic could not be prepared/,
        );
        assert.equal(calls.contextReleases, 1);
        assert.equal(calls.active, 0);
        if (fail !== 'decode') assert.equal(calls.imageReleases, 2);
    });
}

test('prepares multiple HEIF photos sequentially to bound native memory use', async () => {
    const { preparePhotosForUpload, calls } = loadHelper();
    const prepared = await preparePhotosForUpload([
        { uri: 'file:///first.heic' },
        { uri: 'file:///second.heif' },
    ]);
    assert.equal(prepared.length, 2);
    assert.equal(calls.maxActive, 1);
    assert.equal(calls.contextReleases, 2);
});
