import React, { useState } from 'react';
import { View, Text, SafeAreaView, Image, TextInput, TouchableOpacity } from 'react-native'
import { useTheme } from '@react-navigation/native'
import Header from '../../../layout/Header';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import { IMAGES } from '../../../constants/theme';
import LanguageoptionSheet from '../../../components/BottomSheet/LanguageoptionSheet';
import Button from '../../../components/Button/Button';

const Language = () => {

    const { colors } = useTheme();

    const moresheet = React.useRef();

    const [Language, setLanguage] = useState('English');

    return (
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <Header
                title="Select Language"
                leftIcon={"back"}
                titleLeft
            />
            <View style={[GlobalStyleSheet.container, { marginTop: 15, flex: 1 }]}>
                <View>
                    <View
                        style={[
                            GlobalStyleSheet.shadow2, {

                                borderColor: colors.border,
                                alignItems: 'center',
                                flexDirection: 'row',
                                backgroundColor: colors.card,
                                height: 48,
                                paddingLeft: 20,
                                marginBottom: 15,
                            },
                        ]}
                    >
                        <Image
                            style={[GlobalStyleSheet.inputimage, { tintColor: colors.title, left: 'auto', right: 15, }]}
                            source={IMAGES.downaeeowsmall}
                        />

                        <TextInput
                            editable={false}
                            style={[GlobalStyleSheet.input, { color: colors.title, }]}
                            value={Language}
                            placeholderTextColor={colors.border}
                        />
                    </View>
                    <TouchableOpacity style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0 }}
                        onPress={() => moresheet.current.openSheet()}
                    ></TouchableOpacity>
                </View>
            </View>
            <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                <Button
                    title="Save"
                />
            </View>
            <LanguageoptionSheet
                ref={moresheet}
                setLanguage={setLanguage}
            />
        </SafeAreaView>
    )
}

export default Language