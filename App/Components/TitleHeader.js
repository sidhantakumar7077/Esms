import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { moderateScale } from '../Constants/PixelRatio'
import { Images } from '../Constants/Images'
import { TextStyles } from '../Constants/Fonts'
import { useTheme } from '@react-navigation/native'

const TitleHeader = ({ title, image, imageStyle }) => {
    const {colors} = useTheme();
    return (
        <View style={{ flexDirection: 'row', marginTop: 5, alignSelf: 'center',backgroundColor:colors.background }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={{...TextStyles.headerText,color:colors.text}}>{title}</Text>
            </View>
            <View style={{ flex: 0.8, alignItems: 'flex-end' }}>
                <Image
                    source={image}
                    style={{
                        height: moderateScale(75),
                        width: moderateScale(120),
                        resizeMode: 'stretch',
                        ...imageStyle
                        // marginTop:-15
                    }}
                />
            </View>
        </View>
    )
}

export default TitleHeader

const styles = StyleSheet.create({})