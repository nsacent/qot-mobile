import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    AppState,
    Linking,
    SafeAreaView,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const DEFAULTS = {
    verification: true,
    messages: true,
    listing_approvals: true,
    listing_rejections: true,
    favorites: true,
    followers: true,
    reviews: true,
    reports: true,
    renewals: true,
    marketing: false,
};

const OPTIONS = [
    ['messages', 'Messages & offers', 'New chats, price offers and offer decisions'],
    ['listing_approvals', 'Ad approvals', 'When QOT approves one of your ads'],
    ['listing_rejections', 'Ad rejections', 'When an ad needs your attention'],
    ['favorites', 'Saved ad alerts', 'When someone saves one of your ads'],
    ['followers', 'New followers', 'When someone starts following your profile'],
    ['reviews', 'Seller reviews', 'When a buyer reviews your seller profile'],
    ['verification', 'Verification', 'Important account verification updates'],
    ['renewals', 'Ad renewals', 'Reminders before your ads expire'],
    ['reports', 'Reports and safety', 'Updates about reports you submit'],
    ['marketing', 'QOT offers', 'Occasional product news and promotions'],
];

const pushDetails = (status) => {
    if (status === 'registered') return {
        icon: 'bell',
        title: 'Device alerts are on',
        detail: 'QOT can alert this phone about messages and important updates.',
        color: '#18864B',
        background: '#EAF8F0',
        action: 'Enabled',
    };
    if (status === 'permission_denied') return {
        icon: 'bell-off',
        title: 'Device alerts are blocked',
        detail: 'Open your phone settings and allow notifications for QOT.',
        color: '#B42318',
        background: '#FFF0F0',
        action: 'Open settings',
    };
    if (status === 'development_build_required') return {
        icon: 'smartphone',
        title: 'Push alerts need the installed app',
        detail: 'Expo Go can show the app, but remote alerts work in the installed QOT build.',
        color: '#2457C5',
        background: '#E9F2FF',
        action: 'Expo Go',
    };
    if (status === 'physical_device_required') return {
        icon: 'smartphone',
        title: 'Use a physical phone',
        detail: 'Device alerts are unavailable in an emulator or browser.',
        color: '#A15C00',
        background: '#FFF3D6',
        action: 'Unavailable',
    };
    if (status === 'project_not_configured') return {
        icon: 'alert-circle',
        title: 'Device alerts are not ready',
        detail: 'QOT push notification setup needs to be completed for this build.',
        color: '#A15C00',
        background: '#FFF3D6',
        action: 'Not ready',
    };
    if (status === 'error') return {
        icon: 'refresh-cw',
        title: 'Device alerts could not connect',
        detail: 'Check your connection and try enabling alerts again.',
        color: '#B42318',
        background: '#FFF0F0',
        action: 'Try again',
    };
    return {
        icon: 'bell',
        title: status === 'registering' ? 'Checking device alerts…' : 'Enable device alerts',
        detail: 'Get messages, ad decisions and saved-search updates when QOT is closed.',
        color: COLORS.primary,
        background: '#FFF2E8',
        action: status === 'registering' ? 'Checking…' : 'Enable',
    };
};

const Notification = () => {
    const { colors } = useTheme();
    const { user, updateCurrentUser } = useAuth();
    const { pushStatus, enablePushNotifications } = useNotifications();
    const initialPreferences = useMemo(() => ({
        ...DEFAULTS,
        ...(user?.profile?.notification_preferences || {}),
    }), [user?.profile?.notification_preferences]);
    const [preferences, setPreferences] = useState(initialPreferences);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const devicePush = pushDetails(pushStatus);

    useEffect(() => {
        if (pushStatus !== 'permission_denied') return undefined;
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') enablePushNotifications().catch(() => {});
        });
        return () => subscription.remove();
    }, [enablePushNotifications, pushStatus]);

    const handleDevicePush = async () => {
        if (pushStatus === 'permission_denied') {
            try {
                await Linking.openSettings();
            } catch {
                setError('Open your phone settings and allow notifications for QOT.');
            }
            return;
        }
        if (['registered', 'registering', 'development_build_required', 'physical_device_required', 'project_not_configured'].includes(pushStatus)) return;
        try {
            await enablePushNotifications();
        } catch (requestError) {
            setError(requestError.message || 'Device alerts could not be enabled.');
        }
    };

    const save = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await updateCurrentUser({ profile: { notification_preferences: preferences } });
            setSuccess('Your notification preferences have been saved.');
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header title="Notification preferences" leftIcon="back" titleLeft />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                <View style={GlobalStyleSheet.container}>
                    <Text style={[FONTS.fontSm, { color: colors.text, marginTop: 8, marginBottom: 15, lineHeight: 20 }]}>Choose which QOT updates you want to receive. Essential security messages may still be sent.</Text>

                    <TouchableOpacity
                        onPress={handleDevicePush}
                        activeOpacity={0.84}
                        style={{ minHeight: 94, borderRadius: 16, borderWidth: 1, borderColor: `${devicePush.color}30`, backgroundColor: devicePush.background, padding: 13, flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}
                    >
                        <View style={{ height: 44, width: 44, borderRadius: 14, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
                            {pushStatus === 'registering' ? <ActivityIndicator size="small" color={devicePush.color} /> : <FeatherIcon name={devicePush.icon} size={20} color={devicePush.color} />}
                        </View>
                        <View style={{ flex: 1, minWidth: 0, marginLeft: 11 }}>
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: devicePush.color }]}>{devicePush.title}</Text>
                            <Text style={[FONTS.fontXs, { color: devicePush.color, opacity: 0.82, lineHeight: 17, marginTop: 3 }]}>{devicePush.detail}</Text>
                        </View>
                        <View style={{ minHeight: 34, borderRadius: 10, backgroundColor: colors.card, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center', marginLeft: 7 }}>
                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: devicePush.color, fontSize: 9 }]}>{devicePush.action}</Text>
                        </View>
                    </TouchableOpacity>

                    {Boolean(error || success) && (
                        <View style={{ backgroundColor: error ? '#FDECEC' : '#EAF8F0', borderRadius: 11, padding: 12, marginBottom: 14, flexDirection: 'row' }}>
                            <FeatherIcon name={error ? 'alert-circle' : 'check-circle'} size={18} color={error ? COLORS.danger : '#18864B'} />
                            <Text style={[FONTS.fontSm, { color: error ? COLORS.danger : '#18864B', flex: 1, marginLeft: 8 }]}>{error || success}</Text>
                        </View>
                    )}

                    <View style={{ borderWidth: 1, borderColor: colors.borderColor, borderRadius: 15, overflow: 'hidden' }}>
                        {OPTIONS.map(([key, title, detail], index) => (
                            <View key={key} style={{ minHeight: 72, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, backgroundColor: colors.card, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border }}>
                                <View style={{ flex: 1, paddingVertical: 12, paddingRight: 10 }}>
                                    <Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>{title}</Text>
                                    <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 3, lineHeight: 17 }]}>{detail}</Text>
                                </View>
                                <Switch
                                    value={Boolean(preferences[key])}
                                    onValueChange={(value) => {
                                        setSuccess('');
                                        setPreferences((current) => ({ ...current, [key]: value }));
                                    }}
                                    trackColor={{ false: '#D0D3DA', true: `${COLORS.primary}80` }}
                                    thumbColor={preferences[key] ? COLORS.primary : '#F4F4F4'}
                                />
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity disabled={saving} onPress={save} style={{ height: 51, borderRadius: 11, backgroundColor: saving ? '#FDBA74' : COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 19 }}>
                        {saving && <ActivityIndicator color={COLORS.white} style={{ marginRight: 9 }} />}
                        <Text style={[FONTS.fontLg, FONTS.fontTitle, { color: COLORS.white }]}>{saving ? 'Saving...' : 'Save preferences'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Notification;
