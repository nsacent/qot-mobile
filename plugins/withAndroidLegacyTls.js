const fs = require('fs');
const path = require('path');
const {
    withAndroidManifest,
    withDangerousMod,
} = require('@expo/config-plugins');

const NETWORK_SECURITY_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="false">api.qot.ug</domain>
        <trust-anchors>
            <certificates src="system" />
            <certificates src="@raw/isrg_root_x1" />
        </trust-anchors>
    </domain-config>
</network-security-config>
`;

const withManifestReference = (config) => withAndroidManifest(config, (nextConfig) => {
    const application = nextConfig.modResults.manifest.application?.[0];
    if (!application?.$) {
        throw new Error('Android application manifest is unavailable.');
    }

    application.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    application.$['android:usesCleartextTraffic'] = 'false';
    return nextConfig;
});

const withNetworkSecurityResources = (config) => withDangerousMod(config, [
    'android',
    async (nextConfig) => {
        const resourcesRoot = path.join(
            nextConfig.modRequest.platformProjectRoot,
            'app',
            'src',
            'main',
            'res',
        );
        const xmlDirectory = path.join(resourcesRoot, 'xml');
        const rawDirectory = path.join(resourcesRoot, 'raw');
        const sourceCertificate = path.join(
            nextConfig.modRequest.projectRoot,
            'assets',
            'certs',
            'isrg-root-x1.pem',
        );

        fs.mkdirSync(xmlDirectory, { recursive: true });
        fs.mkdirSync(rawDirectory, { recursive: true });
        fs.writeFileSync(
            path.join(xmlDirectory, 'network_security_config.xml'),
            NETWORK_SECURITY_CONFIG,
        );
        fs.copyFileSync(
            sourceCertificate,
            path.join(rawDirectory, 'isrg_root_x1.pem'),
        );
        return nextConfig;
    },
]);

module.exports = (config) => withNetworkSecurityResources(withManifestReference(config));
