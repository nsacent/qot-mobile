import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

const LOCATION_KEY = 'qot.lastBuyerLocation';
const CITY_COORDINATES_KEY = 'qot.cityCoordinates';

const KNOWN_CITY_COORDINATES = {
    arua: { latitude: 3.03, longitude: 30.91 },
    entebbe: { latitude: 0.05, longitude: 32.46 },
    'fort portal': { latitude: 0.67, longitude: 30.27 },
    gulu: { latitude: 2.77, longitude: 32.30 },
    hoima: { latitude: 1.43, longitude: 31.35 },
    jinja: { latitude: 0.45, longitude: 33.20 },
    kabale: { latitude: -1.25, longitude: 29.99 },
    kampala: { latitude: 0.35, longitude: 32.58 },
    kasese: { latitude: 0.18, longitude: 30.08 },
    lira: { latitude: 2.25, longitude: 32.90 },
    masaka: { latitude: -0.34, longitude: 31.74 },
    mbale: { latitude: 1.08, longitude: 34.18 },
    mbarara: { latitude: -0.61, longitude: 30.65 },
    moroto: { latitude: 2.53, longitude: 34.67 },
    mukono: { latitude: 0.35, longitude: 32.76 },
    soroti: { latitude: 1.71, longitude: 33.61 },
    tororo: { latitude: 0.69, longitude: 34.18 },
    wakiso: { latitude: 0.40, longitude: 32.48 },
};

const normaliseCity = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\b(city|municipality|municipal|district|division|town|county|sub-?county)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const radians = (degrees) => degrees * (Math.PI / 180);

export const distanceInKm = (from, to) => {
    if (!from || !to) return null;
    const earthRadius = 6371;
    const latitudeDelta = radians(to.latitude - from.latitude);
    const longitudeDelta = radians(to.longitude - from.longitude);
    const firstLatitude = radians(from.latitude);
    const secondLatitude = radians(to.latitude);
    const haversine = (
        Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2
    );
    return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

export const formatDistance = (distance) => {
    const value = Number(distance);
    if (!Number.isFinite(value)) return '';
    if (value < 1) return 'Less than 1 km away';
    if (value < 10) return `${value.toFixed(1)} km away`;
    return `${Math.round(value).toLocaleString()} km away`;
};

const waitForAndroidPosition = (timeoutMs = 30000) => new Promise((resolve, reject) => {
    let subscription = null;
    let settled = false;
    let lastError = null;

    const finish = (location, error = null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        subscription?.remove();
        if (location) resolve(location);
        else reject(error || new Error('Android could not obtain a location fix.'));
    };

    const timeout = setTimeout(() => {
        finish(null, lastError || new Error('Android took too long to find your location.'));
    }, timeoutMs);

    Location.watchPositionAsync(
        {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 1000,
            distanceInterval: 0,
            // Do not let Expo gate a GPS fix on Android's network provider.
            mayShowUserSettingsDialog: false,
        },
        (location) => finish(location),
        (message) => { lastError = new Error(message || 'Android location is temporarily unavailable.'); },
    )
        .then((value) => {
            subscription = value;
            if (settled) subscription.remove();
        })
        .catch((error) => finish(null, error));
});

const storedLocationAsResult = async (maxAgeMs) => {
    try {
        const raw = await AsyncStorage.getItem(LOCATION_KEY);
        const location = raw ? JSON.parse(raw) : null;
        const capturedAt = new Date(location?.captured_at).getTime();
        if (!Number.isFinite(location?.latitude) || !Number.isFinite(location?.longitude)) return null;
        if (!Number.isFinite(capturedAt) || Date.now() - capturedAt > maxAgeMs) return null;
        return {
            coords: {
                latitude: location.latitude,
                longitude: location.longitude,
            },
            timestamp: capturedAt,
        };
    } catch {
        return null;
    }
};

export const requestBuyerLocation = async () => {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) throw new Error('Turn on location services to find nearby ads.');

    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
        throw new Error('Allow location access to sort ads near you. You can change this in phone settings.');
    }

    if (Platform.OS === 'android' && permission.android?.accuracy === 'coarse') {
        throw new Error('Turn on Precise location for QOT in phone settings, then try again.');
    }

    let result = await Location.getLastKnownPositionAsync({
        maxAge: 2 * 60 * 1000,
        requiredAccuracy: 2500,
    }).catch(() => null);

    if (!result && Platform.OS !== 'android') {
        result = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            mayShowUserSettingsDialog: true,
        });
    }

    if (!result && Platform.OS === 'android') {
        let providerError = null;

        // Android's balanced request can return "location unavailable" even
        // when GPS is on. Force a GPS-priority fix before trying cached data.
        try {
            result = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
                mayShowUserSettingsDialog: false,
            });
        } catch (error) {
            providerError = error;
        }

        if (!result) {
            try {
                result = await waitForAndroidPosition();
            } catch (error) {
                providerError = error;
            }
        }

        if (!result) {
            await Location.enableNetworkProviderAsync().catch(() => null);
            result = await Location.getLastKnownPositionAsync({
                maxAge: 10 * 60 * 1000,
                requiredAccuracy: 5000,
            }).catch(() => null);
        }

        if (!result) result = await storedLocationAsResult(15 * 60 * 1000);

        if (!result) {
            const detail = String(providerError?.message || '').trim();
            throw new Error(detail
                ? `Android could not get your current location (${detail}). Turn on Location and Precise location, then try again.`
                : 'Android could not get your current location. Turn on Location and Precise location, then try again.');
        }
    }

    const location = {
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
        captured_at: new Date().toISOString(),
    };
    await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(location));
    return location;
};

export const getStoredBuyerLocation = async (maxAgeMs = 30 * 60 * 1000) => {
    try {
        const raw = await AsyncStorage.getItem(LOCATION_KEY);
        const location = raw ? JSON.parse(raw) : null;
        const capturedAt = new Date(location?.captured_at).getTime();
        if (!Number.isFinite(location?.latitude) || !Number.isFinite(location?.longitude)) return null;
        if (!Number.isFinite(capturedAt) || Date.now() - capturedAt > maxAgeMs) return null;
        return location;
    } catch {
        return null;
    }
};

const bestNameMatch = (items, candidates) => {
    let bestMatch = null;

    for (const item of items) {
        const itemName = normaliseCity(item?.name || item?.title || item?.label);
        if (!itemName) continue;
        for (const [index, candidate] of candidates.entries()) {
            let score = 0;
            if (candidate === itemName) score = 100 - index;
            else if (
                Math.min(candidate.length, itemName.length) >= 4
                && (candidate.includes(itemName) || itemName.includes(candidate))
            ) score = 70 - index;
            if (score > (bestMatch?.score || 0)) bestMatch = { item, score };
        }
    }

    return bestMatch?.item || null;
};

const reverseGeocodeMarketplacePosition = async (position) => {
    let nativeError = null;
    const useNativeGeocoder = async () => {
        try {
            const nativeAddresses = await Location.reverseGeocodeAsync({
                latitude: position.latitude,
                longitude: position.longitude,
            });
            return nativeAddresses[0] || null;
        } catch (error) {
            nativeError = error;
            return null;
        }
    };

    // Apple provides reliable structured locality fields. Several Android
    // geocoders return incomplete or stale address objects, so Android uses
    // the coordinate-based network lookup first and keeps native as fallback.
    if (Platform.OS !== 'android') {
        const nativeAddress = await useNativeGeocoder();
        if (nativeAddress) return nativeAddress;
    }

    try {
        const params = [
            `latitude=${encodeURIComponent(position.latitude)}`,
            `longitude=${encodeURIComponent(position.longitude)}`,
            'localityLanguage=en',
        ].join('&');
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`);
        if (!response.ok) throw new Error('Network reverse geocoding failed.');
        const result = await response.json();
        const administrative = Array.isArray(result?.localityInfo?.administrative)
            ? result.localityInfo.administrative
            : [];
        const district = administrative.find((item) => /district/i.test(String(item?.description || '')));
        const deepest = [...administrative]
            .filter((item) => Number(item?.adminLevel) >= 6)
            .sort((first, second) => Number(second.adminLevel) - Number(first.adminLevel))[0];
        const administrativeNames = administrative.map((item) => item?.name).filter(Boolean);

        return {
            isoCountryCode: result.countryCode,
            city: result.locality || result.city || district?.name,
            district: deepest?.name || result.locality,
            subregion: district?.name || result.city,
            region: result.principalSubdivision,
            name: result.locality,
            formattedAddress: administrativeNames.join(', '),
        };
    } catch {
        if (Platform.OS === 'android') {
            const nativeAddress = await useNativeGeocoder();
            if (nativeAddress) return nativeAddress;
        }
        throw nativeError || new Error('We found your GPS position but could not identify the area. Choose it manually instead.');
    }
};

export const requestCurrentMarketplaceLocation = async (cities = []) => {
    const position = await requestBuyerLocation();
    const address = await reverseGeocodeMarketplacePosition(position);

    if (address.isoCountryCode && String(address.isoCountryCode).toUpperCase() !== 'UG') {
        throw new Error('Your current location is outside Uganda. Choose a Ugandan city instead.');
    }

    const formattedCandidates = String(address.formattedAddress || '')
        .split(',')
        .map(normaliseCity)
        .filter(Boolean);
    const cityCandidates = [
        address.city,
        address.subregion,
        address.district,
        address.name,
        address.region,
    ].map(normaliseCity).filter(Boolean).concat(formattedCandidates);
    const areaCandidates = [
        address.district,
        address.subregion,
        address.city,
        address.name,
        address.street,
    ].map(normaliseCity).filter(Boolean).concat(formattedCandidates);
    // Resolve the district/city first, then search only its areas. Area names
    // such as "Central Division" exist under many Ugandan districts; searching
    // every area first can pair the current area with an unrelated district.
    let matchedCity = bestNameMatch(cities, cityCandidates);
    const matchedCityName = normaliseCity(matchedCity?.name || matchedCity?.title || matchedCity?.label);
    const scopedAreaCandidates = areaCandidates.filter((candidate) => candidate !== matchedCityName);
    let matchedArea = matchedCity
        ? bestNameMatch(
            (matchedCity.areas || []).map((area) => ({ ...area, city: matchedCity })),
            scopedAreaCandidates,
        )
        : null;

    // If the reverse geocoder omitted the district, an exact area name may
    // still safely identify it, but only when that name belongs to one district.
    if (!matchedCity) {
        const exactAreaCandidates = new Set(areaCandidates);
        const exactAreaMatches = cities.flatMap((city) => (
            (city.areas || [])
                .filter((area) => exactAreaCandidates.has(normaliseCity(area?.name || area?.title || area?.label)))
                .map((area) => ({ ...area, city }))
        ));
        const matchingCityIds = new Set(exactAreaMatches.map((area) => String(area.city?.id || '')));
        if (matchingCityIds.size === 1) {
            matchedArea = bestNameMatch(exactAreaMatches, areaCandidates);
            matchedCity = matchedArea?.city || null;
        }
    }

    if (!matchedCity) {
        const detected = address.city || address.district || address.subregion || address.region;
        throw new Error(detected
            ? `We found ${detected}. Choose the nearest QOT area to continue.`
            : 'We could not match your location. Choose the nearest QOT area instead.');
    }

    if ((matchedCity.areas || []).length && !matchedArea) {
        const detected = address.district || address.subregion || address.name || matchedCity.name;
        throw new Error(`We found ${detected}, but could not confirm the exact ${matchedCity.name} area. Choose your division manually.`);
    }

    return { city: matchedCity, area: matchedArea, position };
};

export const requestCurrentMarketplaceCity = requestCurrentMarketplaceLocation;

const readCityCoordinates = async () => {
    try {
        const raw = await AsyncStorage.getItem(CITY_COORDINATES_KEY);
        return { ...KNOWN_CITY_COORDINATES, ...(raw ? JSON.parse(raw) : {}) };
    } catch {
        return { ...KNOWN_CITY_COORDINATES };
    }
};

export const addDistancesToListings = async (listings, buyerLocation) => {
    if (!buyerLocation) return listings;
    const coordinates = await readCityCoordinates();
    let cacheChanged = false;
    const cityNames = [...new Set(listings.map((item) => normaliseCity(item.city_name || item.location)).filter(Boolean))];

    for (const cityName of cityNames) {
        if (coordinates[cityName]) continue;
        try {
            const results = await Location.geocodeAsync(`${cityName}, Uganda`);
            const match = results[0];
            if (match) {
                coordinates[cityName] = { latitude: match.latitude, longitude: match.longitude };
                cacheChanged = true;
            }
        } catch {
            // Some devices cannot geocode every district. Those ads remain visible after located ads.
        }
    }

    if (cacheChanged) {
        await AsyncStorage.setItem(CITY_COORDINATES_KEY, JSON.stringify(coordinates));
    }

    return listings
        .map((item) => {
            const city = coordinates[normaliseCity(item.city_name || item.location)];
            const distance = city ? distanceInKm(buyerLocation, city) : null;
            return { ...item, distance_km: distance };
        })
        .sort((first, second) => {
            const firstDistance = Number.isFinite(first.distance_km) ? first.distance_km : Number.POSITIVE_INFINITY;
            const secondDistance = Number.isFinite(second.distance_km) ? second.distance_km : Number.POSITIVE_INFINITY;
            return firstDistance - secondDistance;
        });
};

export const distanceToListing = async (listing, buyerLocation) => {
    const [enriched] = await addDistancesToListings([listing], buyerLocation);
    return enriched?.distance_km ?? null;
};
