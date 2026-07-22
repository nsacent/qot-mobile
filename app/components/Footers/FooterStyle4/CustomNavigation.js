import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS } from '../../../constants/theme';

import home from '../../../assets/images/icons/home.png';
import search from '../../../assets/images/icons/search.png';
import chat from '../../../assets/images/icons/chat.png';
import profile from '../../../assets/images/icons/user.png';
import addition from '../../../assets/images/icons/addition.png';

const CustomNavigation = ({state,navigation,descriptors}) => {

    const {colors} = useTheme();

    return (
        <>
            <View style={{
                height:65,
                flexDirection:'row',
                position:'absolute',
                left: 10,
                right : 10,
                bottom : 10,
                borderRadius: 12,
                backgroundColor: colors.card,
                shadowColor: "rgba(0,0,0,.6)",
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowOpacity: 0.30,
                shadowRadius: 4.65,

                elevation: 8,
            }}>
                
                {state.routes.map((route, index) => {

                    const { options } = descriptors[route.key];
                    const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                        ? options.title
                        : route.name;

                    const isFocused = state.index === index;
                    
                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate({ name: route.name, merge: true });
                        }

                    }

                    return(
                        <View style={styles.tabItem} key={index}>
                            <TouchableOpacity
                                style={styles.tabLink}
                                onPress={onPress}
                            >
                                <Image
                                    style={{
                                        height:20,
                                        width:20,
                                        resizeMode:'contain',
                                        marginBottom:4,
                                        opacity:isFocused ? 1 : .6,
                                        tintColor:isFocused ? COLORS.primary : colors.text,
                                    }}
                                    source={
                                        label === "Home" ? home :
                                        label === "Search" ? search:
                                        label === "Post" ? addition:
                                        label === "Chat" ? chat :
                                        label === "Profile" && profile
                                    }
                                />
                                <Text style={{...FONTS.fontSm,...FONTS.fontTitle,color:isFocused ? colors.title : colors.text}}>{label}</Text>
                            </TouchableOpacity>
                        </View>
                    )
                })}
            </View>
        </>
    );
};



const styles = StyleSheet.create({
    tabLink:{
        alignItems:'center',
    },
    tabItem:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
    },
    navText:{
        ...FONTS.fontSm,
    }
})


export default CustomNavigation;