import { Image, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Images } from '../Constants/Images'
import { Colors } from '../Constants/Colors'
import { moderateScale } from '../Constants/PixelRatio'
import { FONTS } from '../Constants/Fonts'

const BackHeader = (props) => {
    return (
        <View>
            <StatusBar
                translucent={true}
                // backgroundColor="transparent"
                backgroundColor="black"
                barStyle="light-content"
            />
            <View style={styles.header}>
                <Pressable
                    onPress={props.onBackIconPress}
                    // style={{marginLeft:moderateScale(10)}}
                >
                    <Image
                        source={Images.rightArrow}
                        style={styles.backIcon}
                    />
                </Pressable>
                <Text style={styles.title}>{props.title}</Text>
            </View>
        </View>
    )
}

export default BackHeader

const styles = StyleSheet.create({
    title: {
        color: Colors.white,
        fontSize: moderateScale(16),
        fontFamily: FONTS.bold,
        marginLeft: moderateScale(30)
    },
    header: {
        backgroundColor: Colors.black,
        paddingVertical: 15,
        paddingHorizontal:15,
        // marginHorizontal: 5,
        flexDirection: 'row',
        // marginTop:40
        marginTop:StatusBar.currentHeight || 0
    },
    backIcon:{
        height: 22,
        width: 22,
        tintColor: Colors.white,
        transform: [{ rotate: '180deg' }]
    }
})