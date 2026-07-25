import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

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
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

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

export const requestBuyerLocation = async () => {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) throw new Error('Turn on location services to find nearby ads.');

    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
        throw new Error('Allow location access to sort ads near you. You can change this in phone settings.');
    }

    const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
    });
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
