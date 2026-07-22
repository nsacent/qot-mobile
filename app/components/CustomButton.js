import React from "react";
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity,
  View
} from "react-native";
import { COLORS, FONTS, SIZES } from "../constants/theme";
import { useTheme } from "@react-navigation/native";


const CustomButton = (props) => {
  
  const theme = useTheme();

  return (
    <TouchableOpacity
        disabled={props.disabled}
        activeOpacity={.75}
        style={[
          {...styles.button},
          props.btnSm && {
            height: 40
          },
          props.color && {
            backgroundColor: props.color,
            elevation:0,
            shadowOpacity:0
          },
          props.btnLight && {
            backgroundColor:'#E6E6E6',
            elevation:0
          },
          props.disabled && {
            backgroundColor:'#C9C9C9',
            elevation:0
          },
          props.outline && {
            backgroundColor: 'transparent',
            elevation : 0,
            shadowOpacity:0,
            borderWidth:1,
            borderColor: props.color ? props.color : COLORS.primary
          },
          theme.dark && props.color === COLORS.secondary && {
            backgroundColor:COLORS.primary,
          },
          theme.dark && props.outline && props.color === COLORS.secondary && {
            backgroundColor: 'transparent',
            borderColor:COLORS.primary,
          },
          props.style && {
            ...props.style,
          }
        ]}
        onPress={()=> props.onPress ? props.onPress() : ""}
    >
      {props.icon ?
        <View
          style={{
            position:'absolute',
            left:20,
          }}
        >
          {props.icon}
        </View>
        :
        null
      }

        <Text style={[
          {
            ...FONTS.fontLg,
            ...FONTS.fontTitle,
            color:COLORS.white,
          },
          props.btnLight && {color:'#646464'},
          props.textColor && {color:props.textColor},
          props.outline && {color:props.color ? theme.dark && props.color === COLORS.secondary ? COLORS.primary : props.color : COLORS.primary}
          ]}>{props.title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({

    button:{
        height: 50,
        backgroundColor:COLORS.primary,
        alignItems:'center',
        paddingHorizontal:20,
        justifyContent:'center',
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 8,
        borderRadius:SIZES.radius,
    }

})

export default CustomButton;
