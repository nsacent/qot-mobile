import React from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Text, SafeAreaView, Image, TouchableOpacity, TextInput } from 'react-native';
import Header from '../../../layout/Header';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import { COLORS, FONTS, IMAGES } from '../../../constants/theme';
import Button from '../../../components/Button/Button';

const Review = ({ navigation }) => {

    const theme = useTheme();
    const { colors } = theme;

    return (
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <Header
                title="Review your details"
                leftIcon={'back'}
                titleLeft
            />
            <View style={[GlobalStyleSheet.container, { flex: 1 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                    <Image
                        style={{ width: 70, height: 70, borderRadius: 50 }}
                        source={IMAGES.Small5}
                    />
                    <View style={{ marginLeft: 10, borderBottomWidth: 1, borderBottomColor: colors.border, flex: 1 }}>
                        <Text style={[FONTS.font, { color: colors.text }]}>Your name</Text>
                        <View style={{}}>
                            <TextInput
                                style={[FONTS.fontMedium, { padding: 0,color:colors.title }]}
                                defaultValue='Deepesh Gour'
                            />
                        </View>
                    </View>
                </View>
                <View style={{ marginTop: 30 }}>
                    <Text style={[FONTS.fontLg, { color: colors.title }]}>Verified phone number</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 }}>
                        <Image
                            style={{ width: 25, height: 25, resizeMode: 'contain', tintColor: COLORS.success }}
                            source={IMAGES.checkbox}
                        />
                        <Text style={[FONTS.font, { color: colors.title }]}>+910000000000</Text>
                    </View>
                </View>
            </View>
            <View style={[GlobalStyleSheet.container, { paddingBottom: 20, paddingHorizontal: 20 }]}>
                <Button
                    onPress={() =>
                        navigation.navigate('DrawerNavigation', {
                            screen : 'BottomNavigation',
                            params:{
                                screen : 'Home'
                            }
                        })
                    }
                    title="Post Now"
                />
            </View>
        </SafeAreaView>
    )
}

export default Review;