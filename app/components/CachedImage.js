import React from 'react';
import { Image as ExpoImage } from 'expo-image';

const CachedImage = ({
    resizeMode = 'cover',
    recyclingKey,
    cacheVersion,
    transition = 160,
    source,
    ...props
}) => {
    const versionedSource = source?.uri && cacheVersion
        ? {
            ...source,
            cacheKey: `${source.uri}::${cacheVersion}`,
        }
        : source;

    return (
        <ExpoImage
            {...props}
            source={versionedSource}
            contentFit={resizeMode}
            cachePolicy="memory-disk"
            transition={transition}
            recyclingKey={recyclingKey ? String(recyclingKey) : undefined}
        />
    );
};

export default React.memo(CachedImage);
