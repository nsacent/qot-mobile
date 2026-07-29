import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {
    ensureCurrentDeviceTracked,
    getSignedInDevices,
    signOutDevice,
    signOutOtherDevices,
} from '../api/account';
import { COLORS, FONTS } from '../constants/theme';
import { formatRelativeTime } from '../utils/formatters';

const deviceIcon = (platform) => platform === 'web' ? 'monitor' : 'smartphone';

const SignedInDevices = () => {
    const { colors } = useTheme();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [workingId, setWorkingId] = useState('');
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setError('');
        try {
            await ensureCurrentDeviceTracked();
            setDevices(await getSignedInDevices());
        } catch (requestError) {
            setError(requestError.message || 'Signed-in devices could not be loaded.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const removeDevice = (device) => {
        Alert.alert(
            'Sign out this device?',
            `${device.device_name || device.device_model || 'This device'} will need to sign in again.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign out',
                    style: 'destructive',
                    onPress: async () => {
                        setWorkingId(device.id);
                        setError('');
                        try {
                            await signOutDevice(device.id);
                            setDevices((current) => current.filter((item) => item.id !== device.id));
                        } catch (requestError) {
                            setError(requestError.message || 'This device could not be signed out.');
                        } finally {
                            setWorkingId('');
                        }
                    },
                },
            ],
        );
    };

    const removeOthers = () => {
        Alert.alert(
            'Sign out all other devices?',
            'Your current phone will stay signed in. Every other device will need to sign in again.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign out others',
                    style: 'destructive',
                    onPress: async () => {
                        setWorkingId('others');
                        setError('');
                        try {
                            await signOutOtherDevices();
                            setDevices((current) => current.filter((item) => item.is_current));
                        } catch (requestError) {
                            setError(requestError.message || 'Other devices could not be signed out.');
                        } finally {
                            setWorkingId('');
                        }
                    },
                },
            ],
        );
    };

    if (loading) {
        return (
            <View style={{ minHeight: 86, borderRadius: 16, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 7 }]}>Checking signed-in devices…</Text>
            </View>
        );
    }

    return (
        <View>
            {Boolean(error) && (
                <TouchableOpacity onPress={load} style={{ borderRadius: 12, borderWidth: 1, borderColor: '#F8B4B4', backgroundColor: '#FFF0F0', padding: 11, marginBottom: 9, flexDirection: 'row', alignItems: 'center' }}>
                    <FeatherIcon name="alert-circle" size={16} color="#B42318" />
                    <Text style={[FONTS.fontXs, { color: '#B42318', flex: 1, marginLeft: 8 }]}>{error} Tap to retry.</Text>
                </TouchableOpacity>
            )}
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' }}>
                {devices.map((device, index) => (
                    <View key={device.id} style={{ minHeight: 82, flexDirection: 'row', alignItems: 'center', padding: 13, backgroundColor: colors.card, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border }}>
                        <View style={{ height: 40, width: 40, borderRadius: 12, backgroundColor: device.is_current ? '#EAF8F0' : `${COLORS.primary}10`, alignItems: 'center', justifyContent: 'center' }}>
                            <FeatherIcon name={deviceIcon(device.platform)} size={18} color={device.is_current ? '#18864B' : COLORS.primary} />
                        </View>
                        <View style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, flexShrink: 1 }]}>{device.device_name || device.device_model || (device.platform === 'web' ? 'Web browser' : 'Mobile device')}</Text>
                                {device.is_current && (
                                    <View style={{ marginLeft: 7, borderRadius: 7, backgroundColor: '#EAF8F0', paddingHorizontal: 6, paddingVertical: 3 }}>
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#18864B', fontSize: 8 }]}>THIS DEVICE</Text>
                                    </View>
                                )}
                            </View>
                            <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.text, marginTop: 3 }]}>{[device.device_model, device.os_name, device.os_version].filter(Boolean).join(' · ') || 'Device details unavailable'}</Text>
                            <Text style={[FONTS.fontXs, { color: colors.textLight, fontSize: 9, marginTop: 2 }]}>Active {formatRelativeTime(device.last_seen_at).toLowerCase()}</Text>
                        </View>
                        {!device.is_current && (
                            <TouchableOpacity disabled={Boolean(workingId)} onPress={() => removeDevice(device)} style={{ minHeight: 35, borderRadius: 10, borderWidth: 1, borderColor: '#F3B4B4', paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center' }}>
                                {workingId === device.id ? <ActivityIndicator size="small" color="#B42318" /> : <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#B42318' }]}>Sign out</Text>}
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
                {!devices.length && (
                    <View style={{ minHeight: 76, padding: 14, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={[FONTS.fontXs, { color: colors.text }]}>No active devices found.</Text>
                    </View>
                )}
            </View>
            {devices.filter((item) => !item.is_current).length > 0 && (
                <TouchableOpacity disabled={Boolean(workingId)} onPress={removeOthers} style={{ minHeight: 43, borderRadius: 11, borderWidth: 1, borderColor: '#F3B4B4', backgroundColor: '#FFF7F7', marginTop: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {workingId === 'others' ? <ActivityIndicator size="small" color="#B42318" /> : <FeatherIcon name="log-out" size={15} color="#B42318" />}
                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#B42318', marginLeft: 7 }]}>Sign out all other devices</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default SignedInDevices;
