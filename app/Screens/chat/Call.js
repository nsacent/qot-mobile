import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';


const Call = ({ navigation }) => {


    const [show, setshow] = React.useState(true);

    return (
        <SafeAreaView style={{ backgroundColor: COLORS.secondary, flex: 1 }}>
            <View style={GlobalStyleSheet.container}>
                <View style={{ paddingTop: 20 }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                    >
                        <Image
                            style={{ width: 18, height: 18, tintColor: '#fff' }}
                            source={IMAGES.arrowleft}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{ paddingTop: 30, alignItems: 'center' }}>
                    <Text style={{ ...FONTS.fontSemiBold, ...FONTS.h3, color: COLORS.white }}>Mr. Lily Learns</Text>
                    <Text style={{ ...FONTS.h4, ...FONTS.fontMedium, color: COLORS.white, opacity: .4, marginTop: 20 }}>15:30</Text>
                </View>
                <View style={{ position: 'absolute', top: 350, left: 0, right: 0, alignItems: 'center' }}>
                    <Image
                        style={{ width: 180, height: 180, borderRadius: 100 }}
                        source={IMAGES.Small4}
                    />
                </View>
            </View>
            <View style={{ position: 'absolute', bottom: 30, left: 0, right: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 20 }}>
                    <TouchableOpacity>
                        <View style={GlobalStyleSheet.background}>
                            <Image
                                style={[GlobalStyleSheet.image, { tintColor: COLORS.white }]}
                                source={IMAGES.volume}
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('SingleChat')}
                    >
                        <View style={[GlobalStyleSheet.background, { backgroundColor: 'red', height: 60, width: 60 }]}>
                            <Image
                                style={{ tintColor: COLORS.white, width: 25, height: 25, resizeMode: 'contain' }}
                                source={IMAGES.phone}
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setshow(!show)
                        }}
                    >
                        <View style={GlobalStyleSheet.background}>
                            <Image
                                style={[GlobalStyleSheet.image, { tintColor: COLORS.white }]}
                                source={
                                    show
                                        ?
                                        IMAGES.audio
                                        :
                                        IMAGES.audiomute
                                }
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Call;