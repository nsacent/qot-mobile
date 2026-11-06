import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { getInfoAsync } from 'expo-file-system/legacy';

const HEIF_EXTENSION = /\.(?:heic|heics|heif|heifs|hif)$/i;
const HEIF_TYPE = /^image\/(?:x-)?hei[cf](?:-sequence)?$/;
const MAX_PHOTO_DIMENSION = 2560;

export const isHeifPhoto = (asset) => (
    HEIF_TYPE.test(String(asset.mimeType || '').split(';')[0].trim().toLowerCase())
    || [asset.fileName, asset.name, asset.uri].some((name) => (
        HEIF_EXTENSION.test(String(name || '').split(/[?#]/)[0])
    ))
);

export const preparePhotoForUpload = async (asset) => {
    if (!isHeifPhoto(asset)) return asset;

    let context;
    let image;
    try {
        // The picker can return original HEIF bytes even in Compatible mode.
        // Native decoding also applies the photo's orientation before JPEG encoding.
        context = ImageManipulator.manipulate(asset.uri);
        image = await context.renderAsync();
        if (Math.max(image.width, image.height) > MAX_PHOTO_DIMENSION) {
            context.resize(image.width >= image.height
                ? { width: MAX_PHOTO_DIMENSION }
                : { height: MAX_PHOTO_DIMENSION });
            image.release();
            image = null;
            image = await context.renderAsync();
        }

        const converted = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });
        const info = await getInfoAsync(converted.uri);
        if (!info.exists || !info.size) throw new Error('Converted photo is unavailable.');

        const originalName = asset.fileName || asset.name || 'qot-photo';
        const fileName = `${originalName.replace(/\.[^.]+$/, '') || 'qot-photo'}.jpg`;
        return {
            ...asset,
            uri: converted.uri,
            width: converted.width,
            height: converted.height,
            fileName,
            name: fileName,
            mimeType: 'image/jpeg',
            fileSize: info.size,
            size: info.size,
        };
    } catch {
        throw new Error(`${asset.fileName || asset.name || 'This photo'} could not be prepared. Please choose it again or select another photo.`);
    } finally {
        image?.release();
        context?.release();
    }
};

export const preparePhotosForUpload = async (assets) => {
    const prepared = [];
    // Decode one photo at a time to keep memory bounded on iPhones.
    for (const asset of assets) prepared.push(await preparePhotoForUpload(asset));
    return prepared;
};
