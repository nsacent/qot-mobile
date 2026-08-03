import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    InteractionManager,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import FeatherIcon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import Header from '../../layout/Header';
import { COLORS, FONTS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import MarketplaceSelectionModal from '../../components/MarketplaceSelectionModal';
import {
    clearListingDraft,
    createListing,
    deleteStagedListingImage,
    getCategories,
    getCategoryFilters,
    getListingDraft,
    getOwnedListing,
    getRegions,
    reorderListingImages,
    saveListingDraft,
    stageListingImage,
    updateListing,
} from '../../api/marketplace';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatters';
import {
    clearLocalListingDraft,
    getLocalListingDraft,
    saveLocalListingDraft,
} from '../../cache/localDraft';
import { requestCurrentMarketplaceLocation } from '../../utils/nearbyAds';
import { hasPrimaryVerification } from '../../utils/verification';

const STEPS = [
    ['grid', 'Category'],
    ['camera', 'Photos'],
    ['edit-3', 'Details'],
    ['eye', 'Review'],
];

const flattenCategories = (categories) => categories.flatMap((category) => (
    category.children?.length ? category.children : [category]
));

const findCity = (regions, id) => regions
    .flatMap((region) => region.cities || [])
    .find((city) => String(city.id) === String(id));

const findArea = (regions, id) => regions
    .flatMap((region) => region.cities || [])
    .flatMap((city) => (city.areas || []).map((area) => ({ ...area, city })))
    .find((area) => String(area.id) === String(id));

const imageKey = (image) => String(image.localKey || image.id || image.uri);

const DraggablePhotoTile = ({ children, disabled, index, itemKey, onDragEnd, onDragStart, onLayout, style }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const active = useSharedValue(0);

    const dragGesture = Gesture.Pan()
        .enabled(!disabled)
        .activateAfterLongPress(180)
        .shouldCancelWhenOutside(false)
        .onStart(() => {
            active.value = 1;
            scale.value = withTiming(1.04, { duration: 120 });
            runOnJS(onDragStart)(itemKey);
        })
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onEnd((event) => {
            runOnJS(onDragEnd)(itemKey, index, event.translationX, event.translationY);
        })
        .onFinalize(() => {
            active.value = 0;
            translateX.value = withTiming(0, { duration: 150 });
            translateY.value = withTiming(0, { duration: 150 });
            scale.value = withTiming(1, { duration: 120 });
            runOnJS(onDragStart)(null);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        zIndex: active.value ? 50 : 1,
        elevation: active.value ? 12 : 0,
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <GestureDetector gesture={dragGesture}>
            <Animated.View onLayout={onLayout} style={[style, animatedStyle]}>
                {children}
            </Animated.View>
        </GestureDetector>
    );
};

const Sell = ({ navigation, route }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const listingId = route?.params?.listingId;
    const isEditing = Boolean(listingId);
    const scrollRef = useRef(null);
    const photoLayoutsRef = useRef({});
    const pendingPhotoActionRef = useRef(null);
    const photoActionQueuedRef = useRef(false);
    const photoActionBusyRef = useRef(false);

    const [step, setStep] = useState(0);
    const [categories, setCategories] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);
    const [categoryFilters, setCategoryFilters] = useState([]);
    const [filterValues, setFilterValues] = useState({});
    const [pendingDraftFilterValues, setPendingDraftFilterValues] = useState({});
    const [categoryModal, setCategoryModal] = useState(false);
    const [locationModal, setLocationModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState('used');
    const [negotiable, setNegotiable] = useState(false);
    const [images, setImages] = useState([]);
    const [removedImageIds, setRemovedImageIds] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [photoSourceOpen, setPhotoSourceOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filtersLoading, setFiltersLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [removingImageId, setRemovingImageId] = useState(null);
    const [error, setError] = useState('');
    const [draftStatus, setDraftStatus] = useState('');
    const [draftReady, setDraftReady] = useState(false);
    const [clearDraftOpen, setClearDraftOpen] = useState(false);
    const [clearDraftLoading, setClearDraftLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [locationMessage, setLocationMessage] = useState(null);
    const [currentLocationSelected, setCurrentLocationSelected] = useState(false);
    const [draggingImageKey, setDraggingImageKey] = useState(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');

        Promise.all([
            getCategories(),
            getRegions(),
            isEditing
                ? getOwnedListing(listingId)
                : getListingDraft().then(async (serverDraft) => {
                    if (serverDraft) return serverDraft;
                    const localDraft = await getLocalListingDraft(user?.id);
                    return localDraft ? { ...localDraft, is_local_cache: true } : null;
                }).catch(async (requestError) => {
                    const localDraft = await getLocalListingDraft(user?.id);
                    if (localDraft) return { ...localDraft, is_local_cache: true };
                    throw requestError;
                }),
        ])
            .then(([categoryData, regionData, existing]) => {
                if (!active) return;
                setCategories(categoryData);
                setRegions(regionData);

                if (isEditing && existing) {
                    const selected = flattenCategories(categoryData).find((item) => String(item.id) === String(existing.category));
                    setSelectedCategory(selected || { id: existing.category, name: existing.category_name, slug: existing.category });
                    const existingCity = findCity(regionData, existing.city) || { id: existing.city, name: existing.city_name };
                    setSelectedCity(existingCity);
                    setSelectedArea(findArea(regionData, existing.area) || (existing.area ? { id: existing.area, name: existing.area_name, city: existingCity } : null));
                    setTitle(existing.title || '');
                    setDescription(existing.description || '');
                    setPrice(String(existing.price || ''));
                    setCondition(existing.condition || 'used');
                    setNegotiable(Boolean(existing.is_negotiable));
                    setPendingDraftFilterValues(Object.fromEntries((existing.attributes || []).map((attribute) => [
                        attribute.filter_key,
                        attribute.value_boolean !== null && attribute.value_boolean !== undefined
                            ? String(attribute.value_boolean)
                            : attribute.value_number ?? attribute.value_text ?? '',
                    ])));
                    setImages((existing.images || []).map((image) => ({
                        id: image.id,
                        existing: true,
                        uri: image.source_image_url || image.image_url || image.image,
                        progress: 100,
                        isPrimary: Boolean(image.is_primary),
                    })).filter((image) => image.uri));
                    setStep(1);
                } else if (existing) {
                    const draftData = existing.data || {};
                    const selected = flattenCategories(categoryData).find((item) => String(item.id) === String(draftData.category));
                    setSelectedCategory(selected || null);
                    setSelectedCity(findCity(regionData, draftData.city) || null);
                    setSelectedArea(findArea(regionData, draftData.area) || null);
                    setTitle(String(draftData.title || ''));
                    setDescription(String(draftData.description || ''));
                    setPrice(String(draftData.price || ''));
                    setCondition(String(draftData.condition || 'used'));
                    setNegotiable(draftData.is_negotiable === true);
                    setPendingDraftFilterValues(draftData.category_filter_values || {});
                    setImages((existing.staged_images || []).map((image) => ({
                        id: image.id,
                        staged: true,
                        uri: image.card_image_url || image.image_url,
                        sourceUri: image.source_image_url || image.image_url,
                        progress: 100,
                    })));
                    setDraftStatus(existing.is_local_cache
                        ? 'Your offline draft has been restored from this device.'
                        : 'Your saved draft has been restored.');
                    setStep(selected ? 1 : 0);
                } else {
                    setSelectedCity(findCity(regionData, user?.profile?.default_city) || null);
                    setSelectedArea(findArea(regionData, user?.profile?.default_area) || null);
                }
            })
            .catch((requestError) => active && setError(requestError.message))
            .finally(() => {
                if (!active) return;
                setLoading(false);
                setDraftReady(true);
            });

        return () => { active = false; };
    }, [isEditing, listingId, user?.profile?.default_area, user?.profile?.default_city]);

    useEffect(() => {
        let active = true;
        if (!selectedCategory?.slug) {
            setCategoryFilters([]);
            setFilterValues({});
            return () => { active = false; };
        }

        setFiltersLoading(true);
        getCategoryFilters(selectedCategory.slug)
            .then((filters) => {
                if (!active) return;
                setCategoryFilters(filters);
                setFilterValues((current) => Object.fromEntries(filters.map((filter) => [
                    filter.key,
                    pendingDraftFilterValues[filter.key] ?? current[filter.key] ?? '',
                ])));
                setPendingDraftFilterValues({});
            })
            .catch(() => active && setCategoryFilters([]))
            .finally(() => active && setFiltersLoading(false));

        return () => { active = false; };
    }, [selectedCategory?.slug]);

    const stagedImageIds = useMemo(
        () => images.filter((image) => image.staged && !image.uploading).map((image) => image.id),
        [images],
    );
    const uploading = images.some((image) => image.uploading);
    const minimumPhotos = Number(selectedCategory?.minimum_photos || 1);
    const maximumPhotos = Number(selectedCategory?.maximum_photos || 8);

    useEffect(() => {
        if (isEditing || !draftReady || uploading || submitting) return undefined;
        const hasContent = Boolean(selectedCategory || images.length || title.trim() || description.trim() || price);
        if (!hasContent) return undefined;

        const timeout = setTimeout(async () => {
            const draftData = {
                category: selectedCategory?.id || '',
                city: selectedCity?.id || '',
                area: selectedArea?.id || '',
                title,
                description,
                price,
                condition,
                is_negotiable: negotiable,
                category_filter_values: filterValues,
            };
            const localDraft = {
                data: draftData,
                staged_images: images
                    .filter((image) => image.staged && !image.uploading)
                    .map((image) => ({
                        id: image.id,
                        card_image_url: image.uri,
                        image_url: image.sourceUri || image.uri,
                        source_image_url: image.sourceUri || image.uri,
                    })),
            };
            try {
                await saveLocalListingDraft(user?.id, localDraft);
                await saveListingDraft(draftData, stagedImageIds);
                setDraftStatus('Draft saved automatically.');
            } catch (requestError) {
                setDraftStatus('Draft saved on this device and can be restored offline.');
            }
        }, 1200);

        return () => clearTimeout(timeout);
    }, [condition, description, draftReady, filterValues, images, isEditing, negotiable, price, selectedArea?.id, selectedCategory?.id, selectedCity?.id, stagedImageIds, submitting, title, uploading, user?.id]);

    const categoryGroups = useMemo(() => categories.map((category) => ({
        title: category.name,
        items: category.children?.length ? category.children : [category],
    })), [categories]);
    const locationGroups = useMemo(() => regions.flatMap((region) => {
        const cityItems = [];
        const areaGroups = [];

        for (const city of region.cities || []) {
            if ((city.areas || []).length) {
                areaGroups.push({
                    title: `${city.name}, ${region.name}`,
                    items: city.areas.map((area) => ({
                        ...area,
                        id: `area-${area.id}`,
                        area_id: area.id,
                        city_id: city.id,
                        city_name: city.name,
                        region_name: region.name,
                        selection_type: 'area',
                    })),
                });
            } else {
                cityItems.push({
                    ...city,
                    id: `city-${city.id}`,
                    city_id: city.id,
                    region_name: city.region_name || region.name,
                    selection_type: 'city',
                });
            }
        }

        return [
            ...(cityItems.length ? [{ title: region.name, items: cityItems }] : []),
            ...areaGroups,
        ];
    }), [regions]);
    const allCities = useMemo(() => regions.flatMap((region) => (
        (region.cities || []).map((city) => ({ ...city, region_name: city.region_name || region.name }))
    )), [regions]);
    const selectedLocationId = selectedArea ? `area-${selectedArea.id}` : selectedCity ? `city-${selectedCity.id}` : null;
    const selectedLocationLabel = selectedArea
        ? `${selectedArea.name}, ${selectedArea.city?.name || selectedCity?.name || ''}`
        : selectedCity
            ? `${selectedCity.name}${selectedCity.region_name ? `, ${selectedCity.region_name}` : ''}`
            : '';

    const chooseLocation = (location) => {
        setCurrentLocationSelected(false);
        if (location.selection_type === 'area') {
            const city = findCity(regions, location.city_id);
            setSelectedCity(city || { id: location.city_id, name: location.city_name, region_name: location.region_name });
            setSelectedArea({ id: location.area_id, name: location.name, city });
        } else {
            setSelectedCity(findCity(regions, location.city_id) || { ...location, id: location.city_id });
            setSelectedArea(null);
        }
        setLocationMessage(null);
    };

    const inputStyle = {
        minHeight: 50,
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 11,
        backgroundColor: colors.card,
        color: colors.title,
        paddingHorizontal: 14,
    };

    const chooseCategory = (category) => {
        if (images.length > Number(category.maximum_photos || 8)) {
            setError(`${category.name} allows a maximum of ${category.maximum_photos || 8} photos. Remove extra photos first.`);
            return;
        }
        setError('');
        setSelectedCategory(category);
        setCategoryModal(false);
    };

    const addSelectedImages = async (assets) => {
        if (!selectedCategory) {
            setError('Choose a category before adding photos so QOT can apply the correct photo limit.');
            setStep(0);
            return;
        }

        if (images.length + assets.length > maximumPhotos) {
            setError(`${selectedCategory.name} allows a maximum of ${maximumPhotos} photos.`);
            return;
        }

        const invalid = assets.find((asset) => (
            (asset.fileSize && asset.fileSize > 8 * 1024 * 1024)
            || (asset.width && asset.height && (Math.min(asset.width, asset.height) < 450 || Math.max(asset.width, asset.height) < 600))
        ));
        if (invalid) {
            setError(invalid.fileSize > 8 * 1024 * 1024
                ? `${invalid.fileName || 'A photo'} is larger than the 8MB limit.`
                : `${invalid.fileName || 'A photo'} is too small. Use at least 600 × 450 pixels.`);
            return;
        }

        setError('');
        if (isEditing) {
            setImages((current) => [...current, ...assets.map((asset) => ({ ...asset, progress: 100 }))].slice(0, maximumPhotos));
            return;
        }

        for (const asset of assets) {
            const localKey = `${Date.now()}-${Math.random()}-${asset.uri}`;
            const pending = { localKey, uri: asset.uri, name: asset.fileName, uploading: true, progress: 1 };
            setImages((current) => [...current, pending]);
            try {
                const uploaded = await stageListingImage(asset, (progress) => {
                    setImages((current) => current.map((image) => image.localKey === localKey ? { ...image, progress } : image));
                });
                setImages((current) => current.map((image) => image.localKey === localKey ? {
                    id: uploaded.id,
                    staged: true,
                    uri: uploaded.card_image_url || uploaded.image_url,
                    sourceUri: uploaded.source_image_url || uploaded.image_url,
                    progress: 100,
                } : image));
            } catch (requestError) {
                setImages((current) => current.filter((image) => image.localKey !== localKey));
                setError(`${asset.fileName || 'Photo'}: ${requestError.message}`);
                break;
            }
        }
    };

    const runPhotoAction = async (action) => {
        if (Platform.OS !== 'web' && photoActionBusyRef.current) return;
        photoActionQueuedRef.current = false;
        if (Platform.OS !== 'web') photoActionBusyRef.current = true;
        setError('');

        try {
            let result;

            if (action === 'camera') {
                if (Platform.OS !== 'web') {
                    let permission = await ImagePicker.getCameraPermissionsAsync();
                    if (!permission.granted && permission.canAskAgain) {
                        permission = await ImagePicker.requestCameraPermissionsAsync();
                    }
                    if (!permission.granted) {
                        setError(permission.canAskAgain
                            ? 'Allow QOT to use your camera before taking an ad photo.'
                            : 'Camera access is blocked. Open your phone settings, choose QOT or Expo Go, then allow Camera access.');
                        return;
                    }
                }

                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    allowsEditing: false,
                    quality: 1,
                    ...(Platform.OS === 'ios' ? {
                        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
                        preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
                    } : {}),
                });
            } else {
                const crop = action === 'crop';
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: crop,
                    ...(crop ? { aspect: [4, 3] } : {
                        allowsMultipleSelection: true,
                        selectionLimit: Math.max(1, maximumPhotos - images.length),
                        orderedSelection: true,
                    }),
                    quality: 1,
                    ...(Platform.OS === 'ios' ? {
                        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
                        preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
                    } : {}),
                });
            }

            if (!result.canceled) await addSelectedImages(result.assets);
        } catch (requestError) {
            const fallback = action === 'camera'
                ? 'The camera could not be opened.'
                : action === 'crop'
                    ? 'The photo cropper could not be opened.'
                    : 'Your photo library could not be opened.';
            setError(requestError.message || fallback);
        } finally {
            if (Platform.OS !== 'web') photoActionBusyRef.current = false;
        }
    };

    const choosePhotoAction = (action) => {
        if (photoActionBusyRef.current || photoActionQueuedRef.current) return;
        photoActionQueuedRef.current = true;

        if (Platform.OS === 'ios') {
            // iOS cannot reliably present ImagePicker while this React Native
            // modal is still dismissing. Queue it for the native onDismiss event.
            pendingPhotoActionRef.current = action;
            setPhotoSourceOpen(false);
            return;
        }

        setPhotoSourceOpen(false);

        if (Platform.OS === 'web') {
            // Browsers require the picker to open in the original button event.
            void runPhotoAction(action);
            return;
        }

        InteractionManager.runAfterInteractions(() => {
            void runPhotoAction(action);
        });
    };

    const handlePhotoSourceDismiss = () => {
        const action = pendingPhotoActionRef.current;
        pendingPhotoActionRef.current = null;
        if (action) void runPhotoAction(action);
    };

    const removeImage = async (image) => {
        if (image.uploading || removingImageId) return;
        setRemovingImageId(image.id || image.uri);
        setError('');
        try {
            if (image.staged) await deleteStagedListingImage(image.id);
            if (image.existing) setRemovedImageIds((current) => [...current, image.id]);
            setImages((current) => current.filter((item) => item !== image));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setRemovingImageId(null);
        }
    };

    const makeMain = (index) => {
        if (index === 0) return;
        setImages((current) => {
            const reordered = [...current];
            const [selected] = reordered.splice(index, 1);
            reordered.unshift(selected);
            return reordered;
        });
        setDraftStatus('Main photo updated. The first photo will appear on your ad.');
    };

    const handlePhotoDrop = (itemKey, fallbackIndex, translationX, translationY) => {
        const sourceIndex = images.findIndex((image) => imageKey(image) === itemKey);
        const actualSourceIndex = sourceIndex >= 0 ? sourceIndex : fallbackIndex;
        const sourceLayout = photoLayoutsRef.current[itemKey];
        if (!sourceLayout || actualSourceIndex < 0) return;

        const dropCenter = {
            x: sourceLayout.x + (sourceLayout.width / 2) + translationX,
            y: sourceLayout.y + (sourceLayout.height / 2) + translationY,
        };
        let targetIndex = actualSourceIndex;
        let nearestDistance = Number.POSITIVE_INFINITY;

        images.forEach((image, index) => {
            const layout = photoLayoutsRef.current[imageKey(image)];
            if (!layout) return;
            const distance = Math.hypot(
                dropCenter.x - (layout.x + (layout.width / 2)),
                dropCenter.y - (layout.y + (layout.height / 2)),
            );
            if (distance < nearestDistance) {
                nearestDistance = distance;
                targetIndex = index;
            }
        });

        if (targetIndex === actualSourceIndex) return;
        setImages((current) => {
            const currentSourceIndex = current.findIndex((image) => imageKey(image) === itemKey);
            if (currentSourceIndex < 0) return current;
            const reordered = [...current];
            const [selected] = reordered.splice(currentSourceIndex, 1);
            reordered.splice(Math.min(targetIndex, reordered.length), 0, selected);
            return reordered;
        });
        setDraftStatus(targetIndex === 0
            ? 'Main photo updated. The first photo will appear on your ad.'
            : 'Photo order updated. Drag any photo into the first position to make it the main photo.');
    };

    const updateFilter = (key, value) => setFilterValues((current) => ({ ...current, [key]: value }));

    const useCurrentLocation = async () => {
        if (locating) return;
        setLocating(true);
        setError('');
        setLocationMessage(null);
        setCurrentLocationSelected(false);
        setSelectedCity(null);
        setSelectedArea(null);
        try {
            const { city, area } = await requestCurrentMarketplaceLocation(allCities);
            const resolvedCity = area?.city || city;
            setSelectedCity(resolvedCity);
            setSelectedArea(area || null);
            setCurrentLocationSelected(true);
            const label = area ? `${area.name}, ${resolvedCity.name}` : resolvedCity.name;
            setDraftStatus(`Current location set to ${label}.`);
            setLocationMessage({ type: 'success', text: `Location set to ${label}.` });
        } catch (locationError) {
            setLocationMessage({
                type: 'error',
                text: locationError.message || 'We could not find your current area. Choose it manually instead.',
            });
        } finally {
            setLocating(false);
        }
    };

    const validateForm = () => {
        if (!selectedCategory) return 'Choose a category to continue.';
        if (uploading) return 'Wait for every photo to finish uploading.';
        if (images.length < minimumPhotos) return `${selectedCategory.name} requires at least ${minimumPhotos} photo${minimumPhotos === 1 ? '' : 's'}.`;
        if (images.length > maximumPhotos) return `${selectedCategory.name} allows a maximum of ${maximumPhotos} photos.`;
        if (title.trim().length < 10) return 'Use an ad title of at least 10 characters.';
        if (description.trim().length < 20) return 'Describe your item using at least 20 characters.';
        if (!price || Number(price.replace(/[^0-9.]/g, '')) <= 0) return 'Enter a valid price greater than zero.';
        if (!selectedCity) return 'Choose the item location.';
        if ((selectedCity.areas || []).length && !selectedArea) return `Choose the specific area within ${selectedCity.name}.`;
        const missing = categoryFilters.find((filter) => filter.is_required && String(filterValues[filter.key] ?? '').trim() === '');
        if (missing) return `${missing.name} is required for this category.`;
        return '';
    };

    const validateStep = () => {
        if (step === 0 && !selectedCategory) return 'Choose a category to continue.';
        if (step === 1) {
            if (uploading) return 'Wait for every photo to finish uploading.';
            if (images.length < minimumPhotos) return `${selectedCategory.name} requires at least ${minimumPhotos} photo${minimumPhotos === 1 ? '' : 's'}.`;
            if (images.length > maximumPhotos) return `${selectedCategory.name} allows a maximum of ${maximumPhotos} photos.`;
        }
        if (step === 2) return validateForm();
        return '';
    };

    const goToStep = (targetStep) => {
        if (targetStep === 3) {
            const validationError = validateForm();
            if (validationError) {
                setError(validationError);
                return;
            }
        }
        setError('');
        setStep(targetStep);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const nextStep = () => {
        const validationError = validateStep();
        if (validationError) {
            setError(validationError);
            return;
        }
        setError('');
        setStep((current) => Math.min(3, current + 1));
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const buildAttributes = () => categoryFilters.flatMap((filter) => {
        const value = String(filterValues[filter.key] ?? '').trim();
        if (!value) return [];
        if (filter.filter_type === 'boolean') return [{ category_filter_id: filter.id, value_boolean: value === 'true' }];
        if (['number', 'range'].includes(filter.filter_type)) return [{ category_filter_id: filter.id, value_number: value }];
        return [{ category_filter_id: filter.id, value_text: value }];
    });

    const submit = async () => {
        if (!hasPrimaryVerification(user)) {
            setError('Verify your phone number before posting or editing an ad.');
            return;
        }
        if (uploading || submitting) return;
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('city', String(selectedCity.id));
            formData.append('area', selectedArea ? String(selectedArea.id) : '');
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            formData.append('price', price.replace(/[^0-9.]/g, ''));
            formData.append('currency', 'UGX');
            formData.append('condition', condition);
            formData.append('is_negotiable', String(negotiable));

            if (isEditing) {
                const requestedImageOrder = [...images];
                const retainedExistingIds = new Set(
                    requestedImageOrder.filter((image) => image.existing).map((image) => Number(image.id)),
                );
                formData.append('attributes', JSON.stringify(buildAttributes()));
                images.filter((image) => !image.existing).forEach((image, index) => {
                    formData.append('images', {
                        uri: image.uri,
                        name: image.fileName || `qot-photo-${index + 1}.jpg`,
                        type: image.mimeType || 'image/jpeg',
                    });
                });
                if (removedImageIds.length) formData.append('remove_image_ids', removedImageIds.join(','));
                await updateListing(listingId, formData);

                const refreshed = await getOwnedListing(listingId);
                const refreshedImages = [...(refreshed.images || [])].sort((a, b) => (
                    Number(a.sort_order || 0) - Number(b.sort_order || 0)
                ));
                const addedImageIds = refreshedImages
                    .map((image) => Number(image.id))
                    .filter((imageId) => !retainedExistingIds.has(imageId));
                let addedIndex = 0;
                const requestedIds = requestedImageOrder.map((image) => {
                    if (image.existing) return Number(image.id);
                    const imageId = addedImageIds[addedIndex];
                    addedIndex += 1;
                    return imageId;
                }).filter(Boolean);

                if (requestedIds.length === refreshedImages.length && requestedIds.length) {
                    await reorderListingImages(listingId, requestedIds);
                }
            } else {
                formData.append('category', String(selectedCategory.id));
                formData.append('attributes', JSON.stringify(buildAttributes()));
                formData.append('staged_image_ids', JSON.stringify(stagedImageIds));
                await createListing(formData);
                setDraftReady(false);
                await clearListingDraft().catch(() => null);
                await clearLocalListingDraft(user?.id).catch(() => null);
            }

            navigation.replace('MyAds', { initialTab: 'ads' });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSubmitting(false);
        }
    };

    const clearDraft = async () => {
        setClearDraftLoading(true);
        setError('');
        try {
            await clearListingDraft();
            await clearLocalListingDraft(user?.id);
            setSelectedCategory(null);
            setSelectedCity(findCity(regions, user?.profile?.default_city) || null);
            setSelectedArea(findArea(regions, user?.profile?.default_area) || null);
            setCurrentLocationSelected(false);
            setCategoryFilters([]);
            setFilterValues({});
            setTitle('');
            setDescription('');
            setPrice('');
            setCondition('used');
            setNegotiable(false);
            setImages([]);
            setStep(0);
            setDraftStatus('Draft cleared. You can start a fresh ad.');
            setClearDraftOpen(false);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setClearDraftLoading(false);
        }
    };

    const renderCategoryStep = () => (
        <>
            <Text style={[FONTS.h5, { color: colors.title }]}>What are you advertising?</Text>
            <Text style={[FONTS.fontSm, { color: colors.text, marginTop: 5, lineHeight: 20 }]}>Choose the most specific category so QOT can apply the correct details and photo limit.</Text>
            <TouchableOpacity
                disabled={isEditing}
                onPress={() => setCategoryModal(true)}
                style={[inputStyle, { marginTop: 19, flexDirection: 'row', alignItems: 'center', opacity: isEditing ? 0.7 : 1 }]}
            >
                <FeatherIcon name="grid" size={19} color={COLORS.primary} />
                <Text style={[FONTS.font, { color: selectedCategory ? colors.title : colors.textLight, flex: 1, marginLeft: 10 }]}>{selectedCategory?.name || 'Choose a category'}</Text>
                <FeatherIcon name={isEditing ? 'lock' : 'chevron-right'} size={isEditing ? 16 : 20} color={colors.text} />
            </TouchableOpacity>
            {selectedCategory && (
                <View style={{ backgroundColor: `${COLORS.primary}10`, borderRadius: 12, padding: 13, marginTop: 12, flexDirection: 'row' }}>
                    <FeatherIcon name="camera" size={18} color={COLORS.primary} />
                    <Text style={[FONTS.fontSm, { color: colors.title, flex: 1, marginLeft: 9 }]}>Upload {minimumPhotos}–{maximumPhotos} clear photos for {selectedCategory.name}.</Text>
                </View>
            )}
            {isEditing && <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 8 }]}>Category cannot be changed after an ad is created.</Text>}
        </>
    );

    const renderPhotoStep = () => (
        <>
            <Text style={[FONTS.h5, { color: colors.title }]}>Add clear photos</Text>
            <Text style={[FONTS.fontSm, { color: colors.text, marginTop: 5, lineHeight: 20 }]}>{selectedCategory?.name} requires {minimumPhotos}–{maximumPhotos} photos. JPG, PNG or WEBP, up to 8MB each.</Text>

            <TouchableOpacity onPress={() => setPhotoSourceOpen(true)} disabled={uploading || images.length >= maximumPhotos} style={{ minHeight: 105, borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.primary, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 17, backgroundColor: `${COLORS.primary}08`, opacity: images.length >= maximumPhotos ? 0.5 : 1 }}>
                <View style={{ height: 43, width: 43, borderRadius: 22, backgroundColor: `${COLORS.primary}14`, alignItems: 'center', justifyContent: 'center' }}>
                    <FeatherIcon name="camera" size={22} color={COLORS.primary} />
                </View>
                <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.primary, marginTop: 8 }]}>{uploading ? 'Optimizing photos...' : 'Add photos'}</Text>
                <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>{images.length}/{maximumPhotos} added</Text>
            </TouchableOpacity>

            {images.length > 1 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingHorizontal: 2 }}>
                    <FeatherIcon name="move" size={14} color={COLORS.primary} />
                    <Text style={[FONTS.fontXs, { color: colors.text, flex: 1, marginLeft: 7 }]}>Hold and drag photos to reorder them. The first photo is the main photo.</Text>
                </View>
            )}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 14 }}>
                {images.map((image, index) => (
                    <DraggablePhotoTile
                        key={imageKey(image)}
                        itemKey={imageKey(image)}
                        index={index}
                        disabled={image.uploading || Boolean(removingImageId)}
                        onDragStart={setDraggingImageKey}
                        onDragEnd={handlePhotoDrop}
                        onLayout={(event) => { photoLayoutsRef.current[imageKey(image)] = event.nativeEvent.layout; }}
                        style={{ width: '48.5%', marginBottom: 11, borderRadius: 13, overflow: 'hidden', backgroundColor: colors.card, borderWidth: draggingImageKey && index === 0 ? 2 : 1, borderColor: index === 0 ? COLORS.primary : colors.borderColor }}
                    >
                        <TouchableOpacity disabled={image.uploading} onPress={() => setPreviewImage(image.sourceUri || image.uri)} activeOpacity={0.88}>
                            <Image source={{ uri: image.uri }} blurRadius={image.uploading ? 12 : 0} style={{ width: '100%', aspectRatio: 4 / 3, backgroundColor: colors.border }} resizeMode="cover" />
                            {index === 0 && !image.uploading && (
                                <View style={{ position: 'absolute', left: 7, top: 7, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: COLORS.primary }}>
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.white, fontSize: 9 }]}>MAIN PHOTO</Text>
                                </View>
                            )}
                            {index === 0 && draggingImageKey && draggingImageKey !== imageKey(image) && (
                                <View pointerEvents="none" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(249,115,22,.78)', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                                    <FeatherIcon name="image" size={21} color={COLORS.white} />
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.white, textAlign: 'center', marginTop: 5 }]}>DROP HERE FOR MAIN</Text>
                                </View>
                            )}
                            {image.uploading && (
                                <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(18,9,46,.48)', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.white }]}>{image.progress || 1}%</Text>
                                    <View style={{ height: 5, width: '100%', borderRadius: 3, backgroundColor: 'rgba(255,255,255,.28)', marginTop: 6, overflow: 'hidden' }}>
                                        <View style={{ height: 5, width: `${image.progress || 1}%`, backgroundColor: COLORS.white }} />
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                        <View style={{ minHeight: 39, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7 }}>
                            {index > 0 && !image.uploading ? (
                                <TouchableOpacity onPress={() => makeMain(index)} style={{ flex: 1, paddingVertical: 8 }}>
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary }]}>Make main</Text>
                                </TouchableOpacity>
                            ) : <View style={{ flex: 1 }} />}
                            <TouchableOpacity disabled={image.uploading || Boolean(removingImageId)} onPress={() => removeImage(image)} hitSlop={8} style={{ height: 29, width: 29, borderRadius: 15, backgroundColor: '#FDECEC', alignItems: 'center', justifyContent: 'center' }}>
                                {removingImageId === (image.id || image.uri) ? <ActivityIndicator size="small" color={COLORS.danger} /> : <FeatherIcon name="trash-2" size={13} color={COLORS.danger} />}
                            </TouchableOpacity>
                        </View>
                    </DraggablePhotoTile>
                ))}
            </View>
        </>
    );

    const renderFilterField = (filter) => {
        const value = String(filterValues[filter.key] ?? '');
        if (filter.filter_type === 'boolean') {
            return (
                <View key={filter.id} style={{ marginBottom: 16 }}>
                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>{filter.name}{filter.is_required ? ' *' : ''}</Text>
                    <View style={{ flexDirection: 'row', gap: 9 }}>
                        {[['true', 'Yes'], ['false', 'No']].map(([optionValue, label]) => (
                            <TouchableOpacity key={optionValue} onPress={() => updateFilter(filter.key, optionValue)} style={{ flex: 1, height: 46, borderRadius: 10, borderWidth: 1, borderColor: value === optionValue ? COLORS.primary : colors.borderColor, backgroundColor: value === optionValue ? `${COLORS.primary}10` : colors.card, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={[FONTS.font, FONTS.fontTitle, { color: value === optionValue ? COLORS.primary : colors.title }]}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        }
        if (filter.options?.length) {
            const label = filter.options.find((option) => String(option.value) === value)?.label;
            return (
                <View key={filter.id} style={{ marginBottom: 16 }}>
                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>{filter.name}{filter.is_required ? ' *' : ''}</Text>
                    <TouchableOpacity onPress={() => setActiveFilter(filter)} style={[inputStyle, { flexDirection: 'row', alignItems: 'center' }]}>
                        <Text style={[FONTS.font, { color: label ? colors.title : colors.textLight, flex: 1 }]}>{label || `Choose ${filter.name.toLowerCase()}`}</Text>
                        <FeatherIcon name="chevron-right" size={19} color={colors.text} />
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View key={filter.id} style={{ marginBottom: 16 }}>
                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>{filter.name}{filter.is_required ? ' *' : ''}</Text>
                <TextInput value={value} onChangeText={(text) => updateFilter(filter.key, text)} keyboardType={['number', 'range'].includes(filter.filter_type) ? 'numeric' : 'default'} placeholder={`Enter ${filter.name.toLowerCase()}`} placeholderTextColor={colors.textLight} style={inputStyle} />
            </View>
        );
    };

    const renderDetailsStep = () => (
        <>
            <Text style={[FONTS.h5, { color: colors.title }]}>Describe your ad</Text>
            <Text style={[FONTS.fontSm, { color: colors.text, marginTop: 5, marginBottom: 18 }]}>Accurate details help serious buyers find and trust your ad.</Text>

            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>Ad title *</Text>
            <TextInput value={title} onChangeText={setTitle} maxLength={150} placeholder="e.g. iPhone 13 Pro Max 256GB" placeholderTextColor={colors.textLight} style={[inputStyle, { marginBottom: 16 }]} />

            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>Description *</Text>
            <TextInput value={description} onChangeText={setDescription} maxLength={3000} multiline textAlignVertical="top" placeholder="Describe the condition, features and anything buyers should know." placeholderTextColor={colors.textLight} style={[inputStyle, { minHeight: 120, paddingTop: 13, marginBottom: 16 }]} />

            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>Price *</Text>
            <View style={[inputStyle, { marginBottom: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0, overflow: 'hidden' }]}>
                <View style={{ alignSelf: 'stretch', justifyContent: 'center', paddingHorizontal: 13, borderRightWidth: 1, borderRightColor: colors.border }}><Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.primary }]}>UGX</Text></View>
                <TextInput value={price} onChangeText={(value) => setPrice(value.replace(/[^0-9]/g, ''))} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textLight} style={[FONTS.font, { color: colors.title, flex: 1, paddingHorizontal: 12 }]} />
            </View>

            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>Location *</Text>
            <TouchableOpacity onPress={() => setLocationModal(true)} style={[inputStyle, { marginBottom: 16, flexDirection: 'row', alignItems: 'center' }]}>
                <FeatherIcon name="map-pin" size={18} color={COLORS.primary} />
                <Text style={[FONTS.font, { color: selectedCity ? colors.title : colors.textLight, flex: 1, marginLeft: 9 }]}>{locating ? 'Finding your current area…' : selectedLocationLabel || 'Choose an area, city or district'}</Text>
                {currentLocationSelected ? (
                    <View style={{ borderRadius: 8, backgroundColor: '#EAF8EF', paddingHorizontal: 7, paddingVertical: 4, marginRight: 7 }}>
                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#16803C', fontSize: 8 }]}>CURRENT</Text>
                    </View>
                ) : null}
                <FeatherIcon name="chevron-right" size={19} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity disabled={locating} onPress={useCurrentLocation} style={{ minHeight: 45, borderRadius: 11, backgroundColor: `${COLORS.primary}0D`, borderWidth: 1, borderColor: `${COLORS.primary}35`, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, marginTop: -7, marginBottom: 16 }}>
                {locating ? <ActivityIndicator size="small" color={COLORS.primary} /> : <FeatherIcon name="crosshair" size={16} color={COLORS.primary} />}
                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary, marginLeft: 8 }]}>{locating ? 'Finding your area…' : 'Use your current location instead'}</Text>
            </TouchableOpacity>
            {locationMessage ? (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', borderRadius: 10, padding: 10, marginTop: -8, marginBottom: 14, backgroundColor: locationMessage.type === 'error' ? '#FDECEC' : '#EAF8EF' }}>
                    <FeatherIcon name={locationMessage.type === 'error' ? 'alert-circle' : 'check-circle'} size={15} color={locationMessage.type === 'error' ? COLORS.danger : '#16803C'} />
                    <Text style={[FONTS.fontXs, { color: locationMessage.type === 'error' ? COLORS.danger : '#16803C', flex: 1, marginLeft: 7, lineHeight: 17 }]}>{locationMessage.text}</Text>
                </View>
            ) : null}
            <Text style={[FONTS.fontXs, { color: colors.textLight, fontSize: 9, marginTop: -10, marginBottom: 15, textAlign: 'center' }]}>QOT saves only the selected area, not your exact coordinates.</Text>

            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>Condition *</Text>
            <View style={{ flexDirection: 'row', gap: 9, marginBottom: 16 }}>
                {['new', 'used'].map((value) => (
                    <TouchableOpacity key={value} onPress={() => setCondition(value)} style={{ flex: 1, height: 46, borderRadius: 10, borderWidth: 1, borderColor: condition === value ? COLORS.primary : colors.borderColor, backgroundColor: condition === value ? `${COLORS.primary}10` : colors.card, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={[FONTS.font, FONTS.fontTitle, { color: condition === value ? COLORS.primary : colors.title, textTransform: 'capitalize' }]}>{value}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 58, marginBottom: 15 }}>
                <View style={{ flex: 1 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>Price is negotiable</Text><Text style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>Buyers can make an offer.</Text></View>
                <Switch value={negotiable} onValueChange={setNegotiable} trackColor={{ false: '#D0D3DA', true: `${COLORS.primary}80` }} thumbColor={negotiable ? COLORS.primary : '#F4F4F4'} />
            </View>

            {filtersLoading ? <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 15 }} /> : categoryFilters.map(renderFilterField)}
        </>
    );

    const renderReviewStep = () => (
        <>
            <Text style={[FONTS.h5, { color: colors.title }]}>Review your ad</Text>
            <Text style={[FONTS.fontSm, { color: colors.text, marginTop: 5, marginBottom: 16 }]}>Check everything before sending it to QOT for approval.</Text>
            <View style={{ borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden' }}>
                {images[0] ? <Image source={{ uri: images[0].sourceUri || images[0].uri }} style={{ width: '100%', aspectRatio: 4 / 3, backgroundColor: colors.border }} resizeMode="cover" /> : null}
                <View style={{ padding: 15 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, flex: 1 }]}>{selectedCategory?.name}</Text><Text style={[FONTS.fontXs, { color: colors.text }]}>{images.length} photos</Text></View>
                    <Text style={[FONTS.h5, { color: colors.title, marginTop: 7 }]}>{title}</Text>
                    <Text style={[FONTS.h4, { color: COLORS.primary, marginTop: 5 }]}>{formatPrice(price, 'UGX')}</Text>
                    {negotiable && <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text, marginTop: 2 }]}>Negotiable</Text>}
                    <View style={{ flexDirection: 'row', marginTop: 11 }}><FeatherIcon name="map-pin" size={14} color={colors.text} /><Text style={[FONTS.fontSm, { color: colors.text, marginLeft: 5 }]}>{selectedLocationLabel || 'Uganda'}</Text></View>
                    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 13 }}><Text style={[FONTS.fontSm, { color: colors.title, lineHeight: 21 }]}>{description}</Text></View>
                    {categoryFilters.flatMap((filter) => {
                        const value = String(filterValues[filter.key] ?? '');
                        if (!value) return [];
                        const display = filter.options?.find((option) => String(option.value) === value)?.label || (filter.filter_type === 'boolean' ? value === 'true' ? 'Yes' : 'No' : value);
                        return [<View key={filter.id} style={{ flexDirection: 'row', marginTop: 9 }}><Text style={[FONTS.fontXs, { color: colors.text, flex: 1 }]}>{filter.name}</Text><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title }]}>{display}</Text></View>];
                    })}
                </View>
            </View>
        </>
    );

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[FONTS.font, { color: colors.text, marginTop: 12 }]}>{isEditing ? 'Loading your ad...' : 'Preparing the ad form...'}</Text>
            </SafeAreaView>
        );
    }

    if (!hasPrimaryVerification(user)) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <Header title={isEditing ? 'Edit ad' : 'Post an ad'} leftIcon="back" titleLeft />
                <View style={[GlobalStyleSheet.container, { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 70 }]}>
                    <View style={{ height: 74, width: 74, borderRadius: 24, backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#F8B4B4', alignItems: 'center', justifyContent: 'center' }}>
                        <FeatherIcon name="shield" size={32} color="#B42318" />
                    </View>
                    <Text style={[FONTS.h5, { color: colors.title, textAlign: 'center', marginTop: 18 }]}>Verify your phone number first</Text>
                    <Text style={[FONTS.fontSm, { color: colors.text, textAlign: 'center', lineHeight: 21, marginTop: 8, maxWidth: 330 }]}>Primary phone verification is required before you can post, edit or manage ads on QOT.</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('VerifyAccount')} style={{ minHeight: 50, borderRadius: 12, backgroundColor: COLORS.primary, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', marginTop: 21 }}>
                        <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.white }]}>Verify phone number</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title={isEditing ? 'Edit ad' : 'Post an ad'} leftIcon="back" titleLeft />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
                    <View style={[GlobalStyleSheet.container, { paddingTop: 10, paddingBottom: 35 }]}>
                        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                            {STEPS.map(([icon, label], index) => (
                                <TouchableOpacity key={label} disabled={index > step} onPress={() => goToStep(index)} style={{ flex: 1, alignItems: 'center' }}>
                                    <View style={{ height: 35, width: 35, borderRadius: 18, backgroundColor: index <= step ? COLORS.primary : colors.border, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name={index < step ? 'check' : icon} size={16} color={index <= step ? COLORS.white : colors.text} /></View>
                                    <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: index === step ? COLORS.primary : colors.text, fontSize: 9, marginTop: 5 }]}>{label}</Text>
                                    {index < STEPS.length - 1 && <View style={{ position: 'absolute', height: 2, left: '68%', right: '-32%', top: 17, backgroundColor: index < step ? COLORS.primary : colors.border }} />}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {!isEditing && Boolean(draftStatus) && (
                            <View style={{ backgroundColor: '#EAF0FF', borderRadius: 10, padding: 10, marginBottom: 13, flexDirection: 'row', alignItems: 'center' }}><FeatherIcon name="save" size={15} color="#2457C5" /><Text style={[FONTS.fontXs, { color: '#2457C5', flex: 1, marginLeft: 7 }]}>{draftStatus}</Text></View>
                        )}
                        {Boolean(error) && (
                            <View style={{ backgroundColor: '#FDECEC', borderWidth: 1, borderColor: '#F8B4B4', borderRadius: 11, padding: 12, marginBottom: 15, flexDirection: 'row' }}><FeatherIcon name="alert-circle" size={18} color={COLORS.danger} /><Text style={[FONTS.fontSm, { color: COLORS.danger, flex: 1, marginLeft: 8, lineHeight: 19 }]}>{error}</Text></View>
                        )}

                        {step === 0 && renderCategoryStep()}
                        {step === 1 && renderPhotoStep()}
                        {step === 2 && renderDetailsStep()}
                        {step === 3 && renderReviewStep()}

                        <View style={{ flexDirection: 'row', gap: 9, marginTop: 23 }}>
                            {step > 0 && <TouchableOpacity disabled={submitting} onPress={() => { setError(''); setStep((current) => current - 1); scrollRef.current?.scrollTo({ y: 0, animated: true }); }} style={{ flex: 1, height: 51, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}><Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>Back</Text></TouchableOpacity>}
                            <TouchableOpacity disabled={submitting || uploading} onPress={step === 3 ? submit : nextStep} style={{ flex: step > 0 ? 1.5 : 1, height: 51, borderRadius: 11, backgroundColor: submitting || uploading ? '#FDBA74' : COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                {(submitting || uploading) && <ActivityIndicator color={COLORS.white} size="small" style={{ marginRight: 8 }} />}
                                <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.white }]}>{submitting ? 'Submitting...' : uploading ? 'Uploading...' : step === 3 ? (isEditing ? 'Save and submit' : 'Submit ad') : 'Continue'}</Text>
                            </TouchableOpacity>
                        </View>

                        {!isEditing && (selectedCategory || images.length || title || description || price) && (
                            <TouchableOpacity onPress={() => setClearDraftOpen(true)} style={{ alignSelf: 'center', padding: 13, marginTop: 5 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.danger }]}>Clear draft</Text></TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <MarketplaceSelectionModal visible={categoryModal} title="Choose a category" groups={categoryGroups} selectedId={selectedCategory?.id} onSelect={chooseCategory} onClose={() => setCategoryModal(false)} searchPlaceholder="Search categories" />
            <MarketplaceSelectionModal visible={locationModal} title="Choose a location" groups={locationGroups} selectedId={selectedLocationId} onSelect={chooseLocation} onClose={() => setLocationModal(false)} searchPlaceholder="Search areas, cities and districts" />
            <MarketplaceSelectionModal visible={Boolean(activeFilter)} title={activeFilter?.name || 'Choose an option'} groups={[{ title: activeFilter?.name || 'Options', items: (activeFilter?.options || []).map((option) => ({ id: option.value, name: option.label })) }]} selectedId={activeFilter ? filterValues[activeFilter.key] : ''} onSelect={(option) => { updateFilter(activeFilter.key, option.id); setActiveFilter(null); }} onClose={() => setActiveFilter(null)} searchPlaceholder="Search options" />

            <Modal visible={photoSourceOpen} transparent animationType="fade" onDismiss={handlePhotoSourceDismiss} onRequestClose={() => setPhotoSourceOpen(false)}>
                <Pressable onPress={() => setPhotoSourceOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(12,16,28,.55)', padding: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 420, borderRadius: 20, padding: 19, backgroundColor: colors.card }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ height: 45, width: 45, borderRadius: 14, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="camera" size={21} color={COLORS.primary} /></View>
                            <View style={{ flex: 1, marginLeft: 11 }}><Text style={[FONTS.h6, { color: colors.title }]}>Add ad photos</Text><Text style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>{maximumPhotos - images.length} photo{maximumPhotos - images.length === 1 ? '' : 's'} remaining</Text></View>
                            <TouchableOpacity onPress={() => setPhotoSourceOpen(false)} style={{ height: 38, width: 38, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="x" size={21} color={colors.text} /></TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
                            <TouchableOpacity onPress={() => choosePhotoAction('camera')} style={{ flex: 1, minHeight: 112, borderRadius: 15, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                                <View style={{ height: 43, width: 43, borderRadius: 14, backgroundColor: '#FFF0E6', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="camera" size={21} color={COLORS.primary} /></View>
                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 9 }]}>Take photo</Text>
                                <Text style={[FONTS.fontXs, { color: colors.text, fontSize: 9, marginTop: 2 }]}>Use your camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => choosePhotoAction('library')} style={{ flex: 1, minHeight: 112, borderRadius: 15, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                                <View style={{ height: 43, width: 43, borderRadius: 14, backgroundColor: '#E9F2FF', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="image" size={21} color="#2457C5" /></View>
                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 9 }]}>Choose photos</Text>
                                <Text style={[FONTS.fontXs, { color: colors.text, fontSize: 9, marginTop: 2 }]}>Select several</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => choosePhotoAction('crop')} style={{ minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: `${COLORS.primary}40`, backgroundColor: `${COLORS.primary}0D`, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginTop: 10 }}>
                            <View style={{ height: 34, width: 34, borderRadius: 11, backgroundColor: `${COLORS.primary}18`, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="crop" size={17} color={COLORS.primary} /></View>
                            <View style={{ flex: 1, marginLeft: 10 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>Choose and crop one photo</Text><Text style={[FONTS.fontXs, { color: colors.text, fontSize: 9, marginTop: 1 }]}>Use your phone's cropper for a clean 4:3 ad photo</Text></View>
                            <FeatherIcon name="chevron-right" size={18} color={COLORS.primary} />
                        </TouchableOpacity>
                        <Text style={[FONTS.fontXs, { color: colors.text, textAlign: 'center', lineHeight: 17, marginTop: 14 }]}>Photos are optimized and watermarked securely after upload.</Text>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal visible={Boolean(previewImage)} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}><Pressable onPress={() => setPreviewImage(null)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.92)', alignItems: 'center', justifyContent: 'center' }}><Image source={previewImage ? { uri: previewImage } : null} resizeMode="contain" style={{ width: '100%', height: '85%' }} /><TouchableOpacity onPress={() => setPreviewImage(null)} style={{ position: 'absolute', right: 18, top: 18, height: 42, width: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,.16)', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="x" size={23} color={COLORS.white} /></TouchableOpacity></Pressable></Modal>

            <Modal visible={clearDraftOpen} transparent animationType="fade" onRequestClose={() => !clearDraftLoading && setClearDraftOpen(false)}><Pressable onPress={() => !clearDraftLoading && setClearDraftOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(12,16,28,.55)', padding: 20, alignItems: 'center', justifyContent: 'center' }}><Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 420, borderRadius: 20, padding: 19, backgroundColor: colors.card }}><View style={{ height: 48, width: 48, borderRadius: 24, backgroundColor: '#FDECEC', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="trash-2" size={21} color={COLORS.danger} /></View><Text style={[FONTS.h5, { color: colors.title, marginTop: 14 }]}>Clear this draft?</Text><Text style={[FONTS.fontSm, { color: colors.text, lineHeight: 20, marginTop: 6 }]}>Your unfinished details and uploaded photos will be removed permanently.</Text><View style={{ flexDirection: 'row', gap: 9, marginTop: 20 }}><TouchableOpacity disabled={clearDraftLoading} onPress={() => setClearDraftOpen(false)} style={{ flex: 1, height: 48, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}><Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>Cancel</Text></TouchableOpacity><TouchableOpacity disabled={clearDraftLoading} onPress={clearDraft} style={{ flex: 1, height: 48, borderRadius: 11, backgroundColor: COLORS.danger, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>{clearDraftLoading && <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 7 }} />}<Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.white }]}>{clearDraftLoading ? 'Clearing...' : 'Clear draft'}</Text></TouchableOpacity></View></Pressable></Pressable></Modal>
        </SafeAreaView>
    );
};

export default Sell;
