import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import Header from '../../layout/Header';
import CustomInput from '../../components/Input/CustomInput';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const Inputs = () => {

    const {colors} = useTheme();


    return (
        <SafeAreaView style={{flex:1,backgroundColor:colors.card}}>
            <View
                style={{
                    flex:1,
                    backgroundColor:colors.background,
                }}
            >
                <Header 
                    titleLeft
                    title={'Inputs'}  
                    leftIcon={'back'}
                />
                <ScrollView>
                    <View style={GlobalStyleSheet.container}>
                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>

                            <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                <Text style={{...FONTS.h6,color:colors.title}}>Classic Input</Text>
                            </View>

                            <View style={GlobalStyleSheet.cardBody}>
                                <View style={{marginBottom:10}}>
                                    <CustomInput 
                                        placeholder="Enter Username"
                                        onChangeText={(value)=> console.log(value)}
                                    />
                                </View>
                                <View style={{marginBottom:10}}>
                                    <CustomInput
                                        placeholder="Enter Email"
                                        onChangeText={(value)=> console.log(value)}
                                    />
                                </View>
                                <View style={{marginBottom:10}}>
                                    <CustomInput
                                        type={'password'}
                                        placeholder="Enter Password"
                                        onChangeText={(value)=> console.log(value)}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                            <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                <Text style={{...FONTS.h6,color:colors.title}}>Input with Icon</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <View style={{marginBottom:10}}>
                                    <CustomInput
                                        icon={<FontAwesome style={{opacity:.6}} name={'user'} size={20} color={colors.text}/> }
                                        placeholder="Enter Username"
                                        onChangeText={(value)=> console.log(value)}
                                    />
                                </View>
                                <View style={{marginBottom:10}}>
                                    <CustomInput
                                        icon={<MaterialIcon style={{opacity:.6}} name={'email'} size={20} color={colors.text}/>}
                                        placeholder="Enter Email"
                                        onChangeText={(value)=> console.log(value)}
                                    />
                                </View>
                                <View style={{marginBottom:10}}>
                                    <CustomInput
                                        type={'password'}
                                        icon={<FontAwesome style={{opacity:.6}} name={'lock'} size={20} color={colors.text}/> }
                                        placeholder="Password"
                                        onChangeText={(value)=> console.log(value)}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                            <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                <Text style={{...FONTS.h6,color:colors.title}}>Input with different sizes</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <View style={{marginBottom:10}}>
                                    <CustomInput
                                        inputLg
                                        placeholder="Enter Username"
                                        onChangeText={(value)=> console.log(value)}
                                    />
                                </View>
                                <View style={{marginBottom:10}}>
                                    <CustomInput
                                        placeholder="Enter Username"
                                        onChangeText={(value)=> console.log(value)}
                                    />
                                </View>
                                <View style={{marginBottom:10}}>
                                    <CustomInput
                                        inputSm
                                        placeholder="Enter Username"
                                        onChangeText={(value)=> console.log(value)}
                                    />
                                </View>
                            </View>
                        </View>
                        
                        
                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                            <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                <Text style={{...FONTS.h6,color:colors.title}}>Rounded Input</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <View style={{marginBottom:10}}>
                                    <CustomInput
                                        inputRounded
                                        icon={<FontAwesome style={{opacity:.6}} name={'user'} size={20} color={colors.textLight}/> }
                                        placeholder="Enter Username"
                                        onChangeText={(value)=> console.log(value)}
                                    />
                                </View>
                                <View style={{marginBottom:10}}>
                                    <CustomInput
                                        inputRounded
                                        icon={<MaterialIcon style={{opacity:.6}} name={'email'} size={20} color={colors.textLight}/>}
                                        placeholder="Enter Email"
                                        onChangeText={(value)=> console.log(value)}
                                    />
                                </View>
                                <View style={{marginBottom:10}}>
                                    <CustomInput
                                        inputRounded
                                        type={'password'}
                                        icon={<FontAwesome style={{opacity:.6}} name={'lock'} size={20} color={colors.textLight}/> }
                                        placeholder="Password"
                                        onChangeText={(value)=> console.log(value)}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                            <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                <Text style={{...FONTS.h6,color:colors.title}}>Border Input</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <View style={{marginBottom:10}}>
                                    <CustomInput
                                        inputBorder
                                        icon={<FontAwesome style={{opacity:.6}} name={'user'} size={20} color={colors.textLight}/> }
                                        placeholder="Enter Username"
                                        onChangeText={(value)=> console.log(value)}
                                    />
                                </View>
                                <View style={{marginBottom:10}}>
                                    <CustomInput
                                        inputBorder
                                        icon={<MaterialIcon style={{opacity:.6}} name={'email'} size={20} color={colors.textLight}/>} 
                                        placeholder="Enter Email"
                                        onChangeText={(value)=> console.log(value)}
                                    />
                                </View>
                                <View style={{marginBottom:10}}>
                                    <CustomInput
                                        inputBorder
                                        type={'password'}
                                        icon={<FontAwesome style={{opacity:.6}} name={'lock'} size={20} color={colors.textLight}/> }
                                        placeholder="Password"
                                        onChangeText={(value)=> console.log(value)}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                            <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                <Text style={{...FONTS.h6,color:colors.title}}>Range Slider</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <View style={{marginBottom:15}}>
                                    <MultiSlider
                                        enableLabel
                                        customLabel={() => 
                                            <View style={{
                                                flexDirection:'row',
                                                justifyContent:'space-between',
                                                position:'absolute',
                                                bottom:-4,
                                                width:'100%',
                                            }}>
                                                <Text style={{...FONTS.fontSm,color:colors.text}}>0%</Text>
                                                <Text style={{...FONTS.fontSm,color:colors.text}}>25%</Text>
                                                <Text style={{...FONTS.fontSm,color:colors.text}}>50%</Text>
                                                <Text style={{...FONTS.fontSm,color:colors.text}}>75%</Text>
                                                <Text style={{...FONTS.fontSm,color:colors.text}}>100%</Text>
                                            </View>
                                        }
                                        trackStyle={{height:4,borderRadius:2,backgroundColor:'rgba(142,165,200,.3)'}}
                                        selectedStyle={{
                                            backgroundColor:COLORS.primary,
                                        }}
                                        markerStyle={{
                                            backgroundColor:COLORS.white,
                                            top:1,
                                            height:16,
                                            width:16,
                                            borderWidth:3,
                                            borderColor:COLORS.primary,
                                        }}
                                        sliderLength={SIZES.width - 60 > SIZES.container ? SIZES.container - 60 : SIZES.width - 60}
                                        max={100}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};


export default Inputs;