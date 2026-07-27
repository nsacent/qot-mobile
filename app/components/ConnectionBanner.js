import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS } from '../constants/theme';

const ConnectionBanner = () => {
    const network = useNetInfo();
    const insets = useSafeAreaInsets();
    const [reconnected, setReconnected] = useState(false);
    const [checking, setChecking] = useState(false);
    const wasOffline = useRef(false);
    const offline = network.isConnected === false || network.isInternetReachable === false;

    useEffect(() => {
        if (offline) {
            wasOffline.current = true;
            setReconnected(false);
            return undefined;
        }

        if (!wasOffline.current || network.isConnected === null) return undefined;
        wasOffline.current = false;
        setReconnected(true);
        const timer = setTimeout(() => setReconnected(false), 2600);
        return () => clearTimeout(timer);
    }, [network.isConnected, offline]);

    const retry = async () => {
        if (checking) return;
        setChecking(true);
        try {
            await NetInfo.refresh();
        } finally {
            setChecking(false);
        }
    };

    if (!offline && !reconnected) return null;

    const connected = reconnected && !offline;
    const color = connected ? '#176B44' : '#9A3412';
    const background = connected ? '#EAF8F0' : '#FFF1E8';
    const border = connected ? '#BDE5CF' : '#FED0B5';
    const statusBarInset = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const safeTop = Math.max(insets.top, statusBarInset) + 8;

    return (
        <View
            accessibilityLiveRegion="polite"
            style={{ position: 'absolute', top: safeTop, left: 10, right: 10, zIndex: 9999, minHeight: 43, borderRadius: 13, borderWidth: 1, borderColor: border, backgroundColor: background, paddingLeft: 12, paddingRight: connected ? 12 : 5, flexDirection: 'row', alignItems: 'center', shadowColor: '#0F172A', shadowOpacity: 0.13, shadowRadius: 9, shadowOffset: { width: 0, height: 3 }, elevation: 8 }}
        >
            <FeatherIcon name={connected ? 'wifi' : 'wifi-off'} size={16} color={color} />
            <View style={{ flex: 1, minWidth: 0, marginLeft: 8 }}>
                <Text style={[FONTS.fontXs, FONTS.fontTitle, { color }]}>{connected ? 'Back online' : 'No internet connection'}</Text>
                {!connected && <Text numberOfLines={1} style={[FONTS.fontXs, { color, opacity: 0.8, fontSize: 8, marginTop: 1 }]}>Some QOT features may not refresh.</Text>}
            </View>
            {!connected && (
                <TouchableOpacity disabled={checking} onPress={retry} style={{ minWidth: 63, height: 34, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                    {checking ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, fontSize: 9 }]}>Retry</Text>}
                </TouchableOpacity>
            )}
        </View>
    );
};

export default ConnectionBanner;
