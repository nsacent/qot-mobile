import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import Header from '../../layout/Header';
import MarketplaceSelectionModal from '../../components/MarketplaceSelectionModal';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { getRegions } from '../../api/marketplace';
import { useAuth } from '../../context/AuthContext';

const TIMEZONES = [
    { id: 'Africa/Kampala', name: 'Uganda — Kampala (EAT)' },
    { id: 'Africa/Nairobi', name: 'Kenya — Nairobi (EAT)' },
    { id: 'Africa/Dar_es_Salaam', name: 'Tanzania — Dar es Salaam (EAT)' },
    { id: 'Africa/Kigali', name: 'Rwanda — Kigali (CAT)' },
    { id: 'Africa/Lagos', name: 'Nigeria — Lagos (WAT)' },
    { id: 'Europe/London', name: 'United Kingdom — London' },
    { id: 'Asia/Dubai', name: 'United Arab Emirates — Dubai' },
    { id: 'America/New_York', name: 'United States — New York' },
];

const localPhone = (phone) => {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits.startsWith('256') ? digits.slice(3) : digits.replace(/^0/, '');
};

const Editprofile = ({ navigation }) => {
    const { colors } = useTheme();
    const { user, updateCurrentUser } = useAuth();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [phone, setPhone] = useState(localPhone(user?.phone));
    const [alternativePhone, setAlternativePhone] = useState(
        localPhone(user?.profile?.alternative_phone),
    );
    const [businessName, setBusinessName] = useState(user?.profile?.business_name || '');
    const [bio, setBio] = useState(user?.profile?.bio || '');
    const [selectedCity, setSelectedCity] = useState(
        user?.profile?.default_city
            ? {
                id: user.profile.default_city,
                name: user.profile.default_city_name,
                region_name: user.profile.default_region_name,
            }
            : null,
    );
    const [selectedArea, setSelectedArea] = useState(
        user?.profile?.default_area
            ? {
                id: user.profile.default_area,
                name: user.profile.default_area_name,
            }
            : null,
    );
    const [timezone, setTimezone] = useState(user?.profile?.timezone || 'Africa/Kampala');
    const [avatar, setAvatar] = useState(null);
    const [cover, setCover] = useState(null);
    const [regions, setRegions] = useState([]);
    const [locationModal, setLocationModal] = useState(false);
    const [timezoneModal, setTimezoneModal] = useState(false);
    const [loadingLocations, setLoadingLocations] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        getRegions()
            .then((data) => active && setRegions(data))
            .catch((requestError) => active && setError(requestError.message))
            .finally(() => active && setLoadingLocations(false));
        return () => { active = false; };
    }, []);

    const locationGroups = useMemo(() => regions.flatMap((region) => {
        const cities = [];
        const areas = [];
        for (const city of region.cities || []) {
            if ((city.areas || []).length) {
                areas.push({
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
                cities.push({
                    ...city,
                    id: `city-${city.id}`,
                    city_id: city.id,
                    region_name: city.region_name || region.name,
                    selection_type: 'city',
                });
            }
        }
        return [
            ...(cities.length ? [{ title: region.name, items: cities }] : []),
            ...areas,
        ];
    }), [regions]);
    const selectedLocationId = selectedArea ? `area-${selectedArea.id}` : selectedCity ? `city-${selectedCity.id}` : null;
    const selectedLocationLabel = selectedArea
        ? `${selectedArea.name}, ${selectedCity?.name || ''}`
        : selectedCity
            ? `${selectedCity.name}${selectedCity.region_name ? `, ${selectedCity.region_name}` : ''}`
            : '';

    const chooseLocation = (item) => {
        if (item.selection_type === 'area') {
            const city = regions.flatMap((region) => region.cities || []).find((candidate) => String(candidate.id) === String(item.city_id));
            setSelectedCity(city || { id: item.city_id, name: item.city_name, region_name: item.region_name });
            setSelectedArea({ id: item.area_id, name: item.name });
        } else {
            const city = regions.flatMap((region) => region.cities || []).find((candidate) => String(candidate.id) === String(item.city_id));
            setSelectedCity(city || { ...item, id: item.city_id });
            setSelectedArea(null);
        }
    };

    const inputStyle = {
        minHeight: 50,
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 11,
        paddingHorizontal: 14,
        backgroundColor: colors.card,
        color: colors.title,
    };

    const pickImage = async (kind) => {
        setError('');
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            setError('Allow QOT to access your photos before choosing an image.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.85,
        });

        if (result.canceled) return;
        const asset = result.assets[0];
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
            setError('Profile images must be 5MB or smaller.');
            return;
        }
        if (kind === 'avatar') setAvatar(asset);
        else setCover(asset);
    };

    const submit = async () => {
        const cleanName = fullName.trim();
        const cleanPhone = phone.replace(/\D/g, '');
        if (!cleanName) {
            setError('Enter your full name.');
            return;
        }
        if (!/^7\d{8}$/.test(cleanPhone)) {
            setError('Enter a valid Uganda mobile number after +256.');
            return;
        }
        const cleanAlternativePhone = alternativePhone.replace(/\D/g, '');
        if (cleanAlternativePhone && !/^7\d{8}$/.test(cleanAlternativePhone)) {
            setError('Enter a valid alternative Uganda mobile number after +256.');
            return;
        }
        if (cleanAlternativePhone && cleanAlternativePhone === cleanPhone) {
            setError('Use a different number from your primary verified phone.');
            return;
        }

        setSaving(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('full_name', cleanName);
            formData.append('phone', `+256${cleanPhone}`);
            formData.append(
                'alternative_phone',
                cleanAlternativePhone ? `+256${cleanAlternativePhone}` : '',
            );
            formData.append('business_name', businessName.trim());
            formData.append('bio', bio.trim());
            formData.append('timezone', timezone);
            if (selectedCity?.id) formData.append('default_city', String(selectedCity.id));
            if (selectedArea?.id) formData.append('default_area', String(selectedArea.id));

            if (avatar) {
                formData.append('avatar', {
                    uri: avatar.uri,
                    name: avatar.fileName || 'qot-profile.jpg',
                    type: avatar.mimeType || 'image/jpeg',
                });
            }
            if (cover) {
                formData.append('cover_photo', {
                    uri: cover.uri,
                    name: cover.fileName || 'qot-cover.jpg',
                    type: cover.mimeType || 'image/jpeg',
                });
            }

            await updateCurrentUser(formData);
            navigation.goBack();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    };

    const timezoneName = TIMEZONES.find((item) => item.id === timezone)?.name || timezone;

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header title="Edit profile" leftIcon="back" titleLeft />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
                    <View style={[GlobalStyleSheet.container, { paddingBottom: 35 }]}>
                        <View style={{ height: 150, borderRadius: 16, overflow: 'hidden', backgroundColor: '#FFF3E8', marginTop: 8 }}>
                            {(cover?.uri || user?.profile?.cover_photo) ? (
                                <Image source={{ uri: cover?.uri || user.profile.cover_photo }} style={{ height: '100%', width: '100%' }} resizeMode="cover" />
                            ) : (
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name="image" size={28} color={COLORS.primary} />
                                    <Text style={[FONTS.fontXs, { color: COLORS.primary, marginTop: 7 }]}>Add a cover photo</Text>
                                </View>
                            )}
                            <TouchableOpacity
                                onPress={() => pickImage('cover')}
                                style={{ position: 'absolute', right: 10, bottom: 10, backgroundColor: 'rgba(18,9,46,.82)', borderRadius: 9, paddingHorizontal: 11, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}
                            >
                                <FeatherIcon name="camera" size={15} color={COLORS.white} />
                                <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.white, marginLeft: 6 }]}>Change cover</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ alignItems: 'center', marginTop: -42, marginBottom: 19 }}>
                            <View style={{ height: 92, width: 92, borderRadius: 46, padding: 4, backgroundColor: colors.background }}>
                                <Image
                                    source={(avatar?.uri || user?.profile?.avatar) ? { uri: avatar?.uri || user.profile.avatar } : IMAGES.user}
                                    style={{ height: 84, width: 84, borderRadius: 42, backgroundColor: '#F1F2F5' }}
                                />
                                <TouchableOpacity
                                    onPress={() => pickImage('avatar')}
                                    style={{ position: 'absolute', right: 0, bottom: 2, height: 31, width: 31, borderRadius: 16, backgroundColor: COLORS.primary, borderWidth: 2, borderColor: colors.background, alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <FeatherIcon name="camera" size={14} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {Boolean(error) && (
                            <View style={{ backgroundColor: '#FDECEC', borderWidth: 1, borderColor: '#F8B4B4', borderRadius: 11, padding: 12, marginBottom: 16, flexDirection: 'row' }}>
                                <FeatherIcon name="alert-circle" size={18} color={COLORS.danger} />
                                <Text style={[FONTS.fontSm, { color: COLORS.danger, flex: 1, marginLeft: 8, lineHeight: 19 }]}>{error}</Text>
                            </View>
                        )}

                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>Full name</Text>
                        <TextInput value={fullName} onChangeText={setFullName} placeholder="Your full name" placeholderTextColor={colors.textLight} style={[inputStyle, { marginBottom: 16 }]} />

                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>Email</Text>
                        <View style={[inputStyle, { marginBottom: 5, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background }]}>
                            <FeatherIcon name="lock" size={16} color={colors.text} />
                            <Text numberOfLines={1} style={[FONTS.font, { color: colors.text, flex: 1, marginLeft: 9 }]}>{user?.email || 'No email added'}</Text>
                        </View>
                        <Text style={[FONTS.fontXs, { color: colors.text, marginBottom: 16 }]}>Your email address cannot be changed.</Text>

                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>Phone number</Text>
                        <View style={[inputStyle, { marginBottom: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0, overflow: 'hidden' }]}>
                            <View style={{ alignSelf: 'stretch', justifyContent: 'center', paddingHorizontal: 13, borderRightWidth: 1, borderRightColor: colors.border, backgroundColor: colors.background }}>
                                <Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>+256</Text>
                            </View>
                            <TextInput
                                value={phone}
                                onChangeText={(value) => setPhone(value.replace(/\D/g, '').slice(0, 9))}
                                keyboardType="phone-pad"
                                placeholder="7XXXXXXXX"
                                placeholderTextColor={colors.textLight}
                                style={[FONTS.font, { color: colors.title, flex: 1, paddingHorizontal: 12 }]}
                            />
                        </View>

                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>Alternative phone <Text style={{ color: colors.text, fontFamily: 'PoppinsRegular' }}>(optional)</Text></Text>
                        <View style={[inputStyle, { marginBottom: 5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0, overflow: 'hidden' }]}>
                            <View style={{ alignSelf: 'stretch', justifyContent: 'center', paddingHorizontal: 13, borderRightWidth: 1, borderRightColor: colors.border, backgroundColor: colors.background }}>
                                <Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>+256</Text>
                            </View>
                            <TextInput
                                value={alternativePhone}
                                onChangeText={(value) => setAlternativePhone(value.replace(/\D/g, '').slice(0, 9))}
                                keyboardType="phone-pad"
                                placeholder="7XXXXXXXX"
                                placeholderTextColor={colors.textLight}
                                style={[FONTS.font, { color: colors.title, flex: 1, paddingHorizontal: 12 }]}
                            />
                        </View>
                        <Text style={[FONTS.fontXs, { color: colors.text, lineHeight: 17, marginBottom: 16 }]}>Shown as another contact option for buyers. It does not need verification and cannot be used to sign in.</Text>

                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>Business name <Text style={{ color: colors.text, fontFamily: 'PoppinsRegular' }}>(optional)</Text></Text>
                        <TextInput value={businessName} onChangeText={setBusinessName} placeholder="Your shop or business" placeholderTextColor={colors.textLight} style={[inputStyle, { marginBottom: 16 }]} />

                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>Bio <Text style={{ color: colors.text, fontFamily: 'PoppinsRegular' }}>(optional)</Text></Text>
                        <TextInput
                            value={bio}
                            onChangeText={setBio}
                            maxLength={500}
                            multiline
                            textAlignVertical="top"
                            placeholder="Tell buyers a little about you"
                            placeholderTextColor={colors.textLight}
                            style={[inputStyle, { minHeight: 100, paddingTop: 13, marginBottom: 16 }]}
                        />

                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>Default ad location</Text>
                        <TouchableOpacity
                            disabled={loadingLocations}
                            onPress={() => setLocationModal(true)}
                            style={[inputStyle, { marginBottom: 16, flexDirection: 'row', alignItems: 'center' }]}
                        >
                            {loadingLocations ? <ActivityIndicator size="small" color={COLORS.primary} /> : <FeatherIcon name="map-pin" size={17} color={COLORS.primary} />}
                            <Text style={[FONTS.font, { color: selectedCity ? colors.title : colors.textLight, flex: 1, marginLeft: 9 }]}>
                                {selectedLocationLabel || 'Choose an area, city or district'}
                            </Text>
                            <FeatherIcon name="chevron-right" size={19} color={colors.text} />
                        </TouchableOpacity>

                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>Timezone</Text>
                        <TouchableOpacity onPress={() => setTimezoneModal(true)} style={[inputStyle, { marginBottom: 22, flexDirection: 'row', alignItems: 'center' }]}>
                            <FeatherIcon name="clock" size={17} color={COLORS.primary} />
                            <Text style={[FONTS.font, { color: colors.title, flex: 1, marginLeft: 9 }]}>{timezoneName}</Text>
                            <FeatherIcon name="chevron-right" size={19} color={colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled={saving}
                            onPress={submit}
                            style={{ height: 52, backgroundColor: saving ? '#FDBA74' : COLORS.primary, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {saving && <ActivityIndicator color={COLORS.white} style={{ marginRight: 9 }} />}
                            <Text style={[FONTS.fontLg, FONTS.fontTitle, { color: COLORS.white }]}>{saving ? 'Saving changes...' : 'Save changes'}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <MarketplaceSelectionModal
                visible={locationModal}
                title="Choose your default location"
                groups={locationGroups}
                selectedId={selectedLocationId}
                onSelect={chooseLocation}
                onClose={() => setLocationModal(false)}
                searchPlaceholder="Search areas, cities and districts"
            />
            <MarketplaceSelectionModal
                visible={timezoneModal}
                title="Choose your timezone"
                groups={[{ title: 'Timezones', items: TIMEZONES }]}
                selectedId={timezone}
                onSelect={(item) => setTimezone(item.id)}
                onClose={() => setTimezoneModal(false)}
                searchPlaceholder="Search timezones"
            />
        </SafeAreaView>
    );
};

export default Editprofile;
