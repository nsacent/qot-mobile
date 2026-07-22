import React, { useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Text, TouchableOpacity, Image, SafeAreaView, Switch } from 'react-native';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { IMAGES, FONTS, SIZES } from '../../constants/theme';

const Notification = () => {

    const { colors } = useTheme();

    const [isEnabled, setIsEnabled] = useState(false);

    const [isEnabled2, setIsEnabled2] = useState(false);

    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    const toggleSwitch2 = () => setIsEnabled2(previousState => !previousState);

    return (
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <Header
                title="Notification"
                leftIcon={'back'}
                titleLeft
            />
            <View style={[GlobalStyleSheet.container, { marginTop: 10 }]}>
                <TouchableOpacity
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 15,
                        borderBottomWidth: 1,
                        borderBlockColor: colors.border,
                        paddingBottom: 10,
                        marginBottom: 20
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={{ ...FONTS.fontSm, ...FONTS.fontSemiBold, fontSize: 15, color: colors.title }}>Recommendations</Text>
                        <View style={{ paddingRight: 20 }}>
                            <Text style={{ ...FONTS.font, color: colors.text }}>Receive recommendations based on your activity</Text>
                        </View>
                    </View>
                    <View>
                        <Switch
                            trackColor={{ false: '#767577', true: 'rgba(110, 78, 212, .2)' }}
                            thumbColor={isEnabled ? '#6E4ED4' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitch}
                            value={isEnabled}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 15,
                        borderBottomWidth: 1,
                        borderBlockColor: colors.border,
                        paddingBottom: 10,
                        marginBottom: 10
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={{ ...FONTS.fontSm, ...FONTS.fontSemiBold, fontSize: 15, color: colors.title }}>Receive updates & Offers</Text>
                        <View style={{ paddingRight: 20 }}>
                            <Text style={{ ...FONTS.font, color: colors.text }}>Get notified for special offers, updates and more</Text>
                        </View>
                    </View>
                    <View>
                        <Switch
                            trackColor={{ false: '#767577', true: 'rgba(110, 78, 212, .2)' }}
                            thumbColor={isEnabled2 ? '#6E4ED4' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitch2}
                            value={isEnabled2}
                        />
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default Notification