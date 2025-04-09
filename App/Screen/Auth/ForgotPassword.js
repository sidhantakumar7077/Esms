import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import BackHeader from '../../Components/BackHeader'
import NavigationService from '../../Services/Navigation'
import { Images } from '../../Constants/Images'
import { TextStyles, appStyles } from '../../Constants/Fonts'
import { moderateScale, screenHeight } from '../../Constants/PixelRatio'
import { Colors } from '../../Constants/Colors'
import { useSelector } from 'react-redux'

const ForgotPassword = () => {
  const {userData,defultSetting} = useSelector(state => state.User);
    const [usertype, setusertype] = useState('')

    return (
        <ImageBackground
            source={Images.loginBackground}
            style={{ flex: 1 }}
        >

            <ScrollView style={{ ...appStyles.main, backgroundColor: null }}>
                <Image
                            source={{uri: defultSetting?.app_logo}}
                    style={{
                        height: moderateScale(30),
                        width: moderateScale(150),
                        marginTop: screenHeight / 2.8,
                        alignSelf: 'center'
                    }}
                />
                <View style={{ marginTop: 50 }}>
                    <TextInput
                        placeholder='Email'
                        placeholderTextColor={'grey'}
                        style={styles.input}
                    />
                    <Image
                        source={Images.email}
                        style={styles.leftIcon}
                    />
                </View>
                <Text style={{ ...TextStyles.title2, color: Colors.white2, marginTop: 25 }}>I am</Text>
                <View style={{ flexDirection: 'row', columnGap: 10, marginTop: 5 }}>
                    {console.log('usertype...', usertype)}
                    <Pressable
                        onPress={() => setusertype('Student')}
                        style={{
                            ...appStyles.btn,
                            flex: 1,
                            paddingVertical: 5,
                            borderRadius: 0,
                            backgroundColor: usertype == 'Student' ? Colors.green2 : Colors.white2,
                            opacity: usertype == 'Student' ? 1 : 0.7
                        }}>
                        <Text style={{
                            ...appStyles.btnText,
                            color: usertype == 'Student' ? Colors.white2 : Colors.black
                        }}>Student</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setusertype('Parent')}
                        style={{
                            ...appStyles.btn,
                            flex: 1,
                            paddingVertical: 5,
                            borderRadius: 0,
                            backgroundColor: usertype == 'Parent' ? Colors.green2 : Colors.white2,
                            opacity: usertype == 'Parent' ? 1 : 0.7
                        }}                        >
                        <Text style={{
                            ...appStyles.btnText,
                            color: usertype == 'Parent' ? Colors.white2 : Colors.black
                        }}>Parent</Text>
                    </Pressable>
                </View>
                <TouchableOpacity
                    onPress={() => NavigationService.navigate('Login')}
                    style={styles.submitBtn}>
                    <Text style={appStyles.btnText}>Submit</Text>
                    <Image
                        source={Images.rightArrow}
                        style={{
                            height: 16,
                            width: 16,
                            tintColor: Colors.btnText,
                            marginLeft: 5
                        }}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={()=>NavigationService.navigate('Login')}>
                    <Text style={{ ...appStyles.btnText,marginTop:25 }}>LOGIN</Text>
                </TouchableOpacity>

            </ScrollView>

        </ImageBackground>
    )
}

export default ForgotPassword

const styles = StyleSheet.create({
    leftIcon: {
        height: 19,
        width: 19,
        position: 'absolute',
        top: 15,
        left: 15
    },
    input: {
        ...appStyles.intput,
        backgroundColor: Colors.white2,
        paddingLeft: 50,
        borderWidth: null
    },
    submitBtn: {
        ...appStyles.btn,
        flexDirection: 'row',
        marginTop: 30,
        alignSelf: 'flex-end',
        backgroundColor: Colors.tangerine
    }
})