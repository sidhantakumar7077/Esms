import { Colors } from "./Colors"
import { maxWidth, moderateScale, screenHeight } from "./PixelRatio"

const FONTS = {
    // bold: 'Montserrat-Bold',
    // semibold: 'Montserrat-SemiBold',
    // regular: 'Montserrat-Light',
    // light: 'Montserrat-Light',
    // medium: 'Montserrat-Medium'

    bold: 'Roboto-Bold',
    semibold: 'Roboto-SemiBold',
    regular: 'Roboto-Light',
    light: 'Roboto-Light',
    medium: 'Roboto-Medium',
    italic: 'Roboto-Italic'
}

const TextStyles = {
    title: {
        fontSize: moderateScale(14),
        color: Colors.black,
        fontWeight: '600',
        marginTop: 15
    },
    title2: {
        fontSize: moderateScale(13),
        color: Colors.black,
        fontWeight: '500',
    },
    title3: {
        fontSize: moderateScale(12),
        color: Colors.black,
        fontWeight: '600',
    },
    subTitle: {
        fontSize: moderateScale(12),
        color: Colors.black,
        fontWeight: '500',
    },
    headerText: {
        fontSize: moderateScale(17),
        fontWeight: '600',
        color: Colors.black,
        // marginLeft: 15
    },
    keyText: {
        fontSize: moderateScale(13),
        color: Colors.black,
        fontWeight: '600',
        // opacity: 0.8,
        marginTop: 3,
        flex: 1
    },
    keyText2: {
        fontSize: moderateScale(10),
        color: Colors.black,
        fontWeight: '600',
        // opacity: 0.8,
        marginTop: 3,
        flex: 1
    },
    valueText: {
        fontSize: moderateScale(11),
        color: Colors.black,
        fontWeight: '500',
        opacity: 0.7,
        marginTop: 3,
        flex:1
    }

}

const appStyles = {
    intput: {
        // height: 46,
        width: '100%',
        borderWidth: 1,
        // backgroundColor: 'white',
        alignSelf: 'center',
        borderRadius: 10,
        paddingLeft: 20,
        paddingRight: 5,
        paddingVertical: 10,
        fontSize: moderateScale(13),
        color: 'black',
    },
    btn: {
        backgroundColor: Colors.btnBlackBackground,
        // backgroundColor:'#000000',
        paddingHorizontal: moderateScale(25),
        paddingVertical: 10,
        borderRadius: moderateScale(15),
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        color: Colors.btnText,
        fontSize: moderateScale(14),
        fontWeight: '500'
    },
    btnText2: {
        color: Colors.btnText,
        fontSize: moderateScale(12),
        fontWeight: '500'
    },
    main: {
        backgroundColor: Colors.white2,
        width: '92%',
        alignSelf: 'center',
        maxWidth: maxWidth,
        minHeight: screenHeight-80,
        marginBottom: 110,
        
    },
    main2: {
        backgroundColor: Colors.white2,
        width: '92%',
        alignSelf: 'center',
        maxWidth: maxWidth,
        // minHeight: screenHeight-80,
        // marginBottom: 10,
        
    },
    card: {
        elevation: 3,
        width: '100%',
        borderRadius: 20,
        backgroundColor: Colors.white2,
        // padding: 10,
        // paddingTop: 0,
        alignSelf: 'center',
        marginTop: 15
    },
    titleRow: {
        // marginHorizontal: -10,
        backgroundColor: Colors.lightGreen2,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 15,
        borderBottomEndRadius: 0,
        borderBottomStartRadius: 0,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    itmRow: {
        flexDirection: 'row',
        marginVertical: 2,
        columnGap:10
    },
    itmcol: {
        marginVertical: 2,
        columnGap:10
    }

}
export {
    FONTS, TextStyles, appStyles
}