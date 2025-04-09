import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BackHeader from '../Components/BackHeader';
import NavigationService from '../Services/Navigation';
import { appStyles } from '../Constants/Fonts';
import TitleHeader from '../Components/TitleHeader';
import { Images } from '../Constants/Images';
import { moderateScale, screenHeight } from '../Constants/PixelRatio';
import { Colors } from '../Constants/Colors';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ContentDownload from '../Components/DownloadCenter/ContentDownload';
import VideoDownloads from '../Components/DownloadCenter/VideoDownloads';
import { useTheme } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

const DownloadCenter = () => {
    const {colors} = useTheme();
    return (
        <View>
            <BackHeader
                title='Download Center'
                onBackIconPress={() => {
                    NavigationService.navigate('Home');
                }}
            />
            <ScrollView
                style={{
                    backgroundColor: colors.background,
                    width: '100%',
                }}>
                <View style={{ width: '92%', alignSelf: 'center' }}>
                    <TitleHeader
                        title={'Your Study Metirials are here!'}
                        image={Images.issuedBooks}
                        imageStyle={{
                            height: moderateScale(65),
                            width: moderateScale(65),
                        }}
                    />
                </View>
                <View style={{marginTop:10, minHeight: screenHeight - 150, borderRadius: 15, backgroundColor: colors.background }}>
                    <Tab.Navigator
                        // initialRouteName='Personal Info'
                        screenOptions={{
                            tabBarLabelStyle: {
                                fontSize: moderateScale(13),
                                fontWeight: '500',
                                textTransform: 'none',
                                borderRadius: 15
                            },
                            tabBarPressColor: 'transparent',
                            tabBarStyle: {
                                backgroundColor: colors.lightGreen,
                                borderTopLeftRadius: 15,
                                borderTopEndRadius: 15,
                                width: '92%',
                                alignSelf: 'center'
                            },
                            tabBarContentContainerStyle: {
                                borderBottomEndRadius: 15,
                            },
                            // tabBarGap: 5,
                            // tabBarActiveTintColor: Colors.tangerine,
                            tabBarInactiveTintColor: colors.text,
                            tabBarIndicatorStyle: { backgroundColor: colors.text },
                            // animationEnabled:false,
                            // tabBarScrollEnabled:true
                        }}
                    >
                        <Tab.Screen name={'CONTENTS'} component={ContentDownload} />
                        <Tab.Screen name={'VIDEOS'} component={VideoDownloads} />
                    </Tab.Navigator>
                </View>
                {/* <View style={{ ...appStyles.main, width: '100%' }}>
                </View> */}
            </ScrollView>
        </View>
    )
}

export default DownloadCenter

const styles = StyleSheet.create({})