import { COLORS, FONTS, SIZES } from "./theme";

export const GlobalStyleSheet = {
    container : {
        paddingHorizontal: 15,
        paddingVertical: 15,
        maxWidth: SIZES.container,
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    formControl: {
        height: 50,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        paddingHorizontal: 15,
    },
    activeInput: {
        borderColor: COLORS.primary,
    },
    label: {
        ...FONTS.font,
        color: COLORS.label,
        marginBottom: 8,
    },
    inputGroup: {
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -5,
    },
    col50: {
        width: '50%',
        paddingHorizontal: 5,
    },
    col33: {
        width: '33.33%',
        paddingHorizontal: 5,
    },
    card: {
        marginBottom: 15,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
    },
    cardHeader: {
        borderBottomWidth: 1,
        borderBottomColors: COLORS.borderColor,
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    cardBody: {
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    shadow: {
        shadowColor: "rgba(0,0,0,.5)",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,

        elevation: 8,
    },
    shadow2: {
        borderWidth: 1,
        borderRadius: SIZES.radius,
        shadowColor: "rgba(0,0,0,.5)",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
    },
    image: {
        width: 20,
        height: 20,
        tintColor: 'red',
        resizeMode: 'contain',
    },
    inputBox: {
        height: 48,
        paddingLeft: 50,
        justifyContent: 'center',
        marginBottom: 15,
    },
    background: {
        //backgroundColor: 'rgba(255,255,255,.1)',
        backgroundColor: 'rgba(0,0,0,.1)',
        height: 50,
        width: 50,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        ...FONTS.font,
        color: 'red',
        marginLeft: 10,
    },
    TouchableOpacity2: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        height: 40,
        justifyContent: 'center',
    },
    followbtn: {
        height: 35,
        paddingHorizontal: 20,
        borderRadius: 4,
        justifyContent: 'center',
        //backgroundColor: COLORS.primary
        backgroundColor: '#EFF3FA'
    },
    followbtnTxt: {
        ...FONTS.font,
        ...FONTS.fontRegular,
        color: COLORS.white,
        textAlign: 'center',
    },
    sharebtnTxt: {
        ...FONTS.font,
        ...FONTS.fontRegular,
        color: COLORS.title,
        textAlign: 'center',
    },
    shadowPrimary: {
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: .5,
        shadowRadius: 5,
    },
    inputSecureIcon: {
        height: 25,
        width: 25,
        opacity: .8,
    },
    inputimage: {
        position: 'absolute',
        left: 15,
        height: 16,
        width: 16,
        resizeMode: 'contain',
        opacity: .8,
    },

}