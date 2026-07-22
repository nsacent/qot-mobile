import React from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS, IMAGES, SIZES } from '../../../constants/theme';
import Header from '../../../layout/Header';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import Button from '../../../components/Button/Button';


const Location = ({ navigation }) => {

    const { colors } = useTheme();

    return (

        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: colors.card,
            }}
        >
            <Header
                title="Location"
                leftIcon={'back'}
                titleLeft
            />
            <View 
                style={[GlobalStyleSheet.container,{ 
                    backgroundColor: COLORS.primaryLight, 
                    padding: 20, 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    paddingVertical: 30 
                }]}
            >
                <Text style={{
                    ...FONTS.fontSm,
                    color: colors.title,
                }}>
                    Sharing accurate location helps you make a{"\n"} quicker sale
                </Text>
                <View style={{ position: "absolute", right: 20 }}>
                    <Image
                        style={{ height: 30, width: 30,tintColor:colors.title }}
                        source={IMAGES.map}
                    />
                </View>
            </View>
            <View style={[GlobalStyleSheet.container, { paddingVertical: 30, paddingHorizontal: 20 }]}>
                <Text style={{ ...FONTS.fontMedium, fontSize: 18, color: colors.title, textAlign: 'center' }}>What is the location of the car you are selling?</Text>
            </View>

            <View style={[GlobalStyleSheet.container, { flex: 1, paddingHorizontal: 20 }]}>
                <TouchableOpacity
                    style={{
                        borderWidth: 1,
                        borderColor: colors.border,
                        padding: 10,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        backgroundColor: colors.card,
                        borderRadius: SIZES.radius,
                        shadowColor: "rgba(0,0,0,.5)",
                        shadowOffset: {
                            width: 0,
                            height: 5,
                        },
                        shadowOpacity: 0.34,
                        shadowRadius: 6.27,
                        elevation: 10,
                    }}
                >
                    <Image
                        source={IMAGES.mapgps}
                        style={{ width: 15, height: 15, marginRight: 10,tintColor:colors.title}}
                    />
                    <Text style={{ ...FONTS.font, fontSize: 15, color: colors.title }}>Current location: RK puram,Kota</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        borderWidth: 1,
                        borderColor: colors.border,
                        padding: 10,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        backgroundColor: colors.card,
                        borderRadius: SIZES.radius,
                        shadowColor: "rgba(0,0,0,.5)",
                        shadowOffset: {
                            width: 0,
                            height: 5,
                        },
                        shadowOpacity: 0.34,
                        shadowRadius: 6.27,
                        elevation: 10,
                        marginTop: 20
                    }}
                >
                    <Text style={{ ...FONTS.font, fontSize: 15, color: colors.title }}>Somewhere else</Text>
                </TouchableOpacity>
            </View>
            <View style={[GlobalStyleSheet.container, { paddingHorizontal: 20 }]}>
                <Button
                    onPress={() => navigation.navigate('Form')}
                    title={'Continue'}
                />
            </View>

        </SafeAreaView>

    )
}

export default Location;