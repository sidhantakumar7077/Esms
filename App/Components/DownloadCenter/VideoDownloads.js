import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
// import { Colors } from 'react-native/Libraries/NewAppScreen'
import { maxWidth, moderateScale, screenHeight, screenWidth } from '../../Constants/PixelRatio'
import { Images } from '../../Constants/Images'
import { TextStyles, appStyles } from '../../Constants/Fonts'
import YouTubePlayer from 'react-native-youtube-iframe';
import UseApi from '../../ApiConfig'
import { useSelector } from 'react-redux'
import { Colors } from '../../Constants/Colors'
import WebView from 'react-native-webview'
import { useTheme } from '@react-navigation/native'

const contents = [
    { title: 'Title1', shareBy: 'Super Admin (9000)', descriptoin: 'description...' },
    { title: 'Title1', shareBy: 'Super Admin (9000)', descriptoin: 'description...' },
    { title: 'Title1', shareBy: 'Super Admin (9000)', descriptoin: 'description...' },
    { title: 'Title1', shareBy: 'Super Admin (9000)', descriptoin: 'description...' },
    { title: 'Title1', shareBy: 'Super Admin (9000)', descriptoin: 'description...' },
    { title: 'Title1', shareBy: 'Super Admin (9000)', descriptoin: 'description...' },
]

const VideoDownloads = () => {
    const [playVideo, setPlayVideo] = useState(false);
    const { Request } = UseApi();
    const { colors } = useTheme();
    const { userData, profileData } = useSelector(state => state.User);
    const [loading, setLoading] = useState(false);
    const [videos, setVideos] = useState([]);
    const [currMeterial, setCurrMeterial] = useState(null);
    const [currVideoId, setCurrVideoId] = useState(null);

    useEffect(() => {
        getVideos();
    }, []);

    const getVideos = async () => {
        setLoading(true);
        let params = {
            // student_id: userData?.id,
            // role: 'student',
            // type: '2',
            // class_id:userData?.class_id,
            // section_id:userData?.section_id
            user_id: userData?.id,
            role: 'student',
            type: '1'
        }

        let data;
        try {
            data = await Request('share-list', 'POST', params);
        } catch (err) {
            console.log('err2....', err);
        }

        if (data?.status && data?.data) {
            setVideos(data?.data);
            console.log("Video Data", data?.data);
        }
        setLoading(false);
    }

    return (
        <View style={{ backgroundColor: colors.background }}>
            <ScrollView showsVerticalScrollIndicator={false}
                style={{ backgroundColor: colors.background, minHeight: screenHeight - 155 }}>
                <View style={{ marginBottom: 100 }}>
                    {videos.map((item, index) => {
                        return (
                            <View key={index} style={{ ...appStyles.card, width: '92%', backgroundColor: colors.background, borderColor: colors.lightBlck, borderWidth: 0.5 }}>
                                <View style={{ ...appStyles.titleRow, backgroundColor: colors.lightGreen }}>
                                    <Text style={{ ...TextStyles.title2, color: colors.text }}>{item.title}</Text>
                                    {item.video_link && (
                                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 2 }}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setCurrMeterial(item);
                                                    setPlayVideo(true);
                                                    let arr = item.video_link.split('=');
                                                    let videoId = arr[arr.length - 1];
                                                    console.log('videoId...', videoId);
                                                    setCurrVideoId(videoId)
                                                }}
                                            >
                                                <Image source={Images.eye} style={{ height: 20, width: 20, tintColor: colors.text }} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                                <View style={{ padding: 15, paddingTop: 5 }}>
                                    <View style={appStyles.itmRow}>
                                        <Text style={{ ...TextStyles.keyText, color: colors.text }}>Created By</Text>
                                        <Text style={{ ...TextStyles.valueText, color: colors.text }}>{item.created_by || 'NA'}</Text>
                                    </View>
                                    <View style={appStyles.itmRow}>
                                        <Text style={{ ...TextStyles.keyText, color: colors.text }}>Description</Text>
                                        <Text style={{ ...TextStyles.valueText, color: colors.text }}>{item.description || 'NA'}</Text>
                                    </View>
                                </View>
                            </View>
                        )
                    })}
                </View>

                {/* {loading && <ActivityIndicator size={28} style={{ marginTop: screenHeight / 3 }} />} */}

                {/* {!loading && assignments.length == 0 && <View style={{ marginTop: screenHeight / 4, alignItems: 'center' }}>
                    <Image
                        source={Images.NoDataFound}
                        style={{
                            height: moderateScale(60),
                            width: moderateScale(60),
                            opacity: 0.5
                            // marginTop:-15
                        }}
                    />
                    <Text style={{ fontSize: moderateScale(14), marginTop: 10 }}>No records found!</Text>
                </View>} */}

                <Modal
                    visible={playVideo}
                    transparent
                >
                    <View style={styles.modal}>
                        <View style={{ ...styles.popup, backgroundColor: colors.background, borderColor: colors.lightBlck, borderWidth: 0.5 }}>
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ ...TextStyles.title2, textAlign: 'center', color: colors.text }}>Video</Text>
                                <TouchableOpacity onPress={() => setPlayVideo(false)}
                                    style={{ position: 'absolute', right: 0, top: 0, padding: 5 }}
                                >
                                    <Image
                                        source={Images.close}
                                        style={{
                                            height: moderateScale(12),
                                            width: moderateScale(12),
                                            marginTop: 2,
                                            tintColor: colors.text,
                                        }}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View>
                                <Text style={{ ...TextStyles.title2, color: colors.text }}>{currMeterial?.vid_title}</Text>
                                {/* <View style={{marginTop:10}}>
                                    {<YouTubePlayer
                                        height={220}
                                        play={false}
                                        // videoId={"1SnPKhCdlsU"}
                                        videoId={currVideoId}
                                        // videoId={'eXOhN0lWub1hthj'}
                                        webViewProps={{
                                            // Add any additional WebView props here
                                        }}
                                    />}
                                </View> */}
                                <View style={styles.container}>
                                    <WebView
                                        source={{ uri: currMeterial?.video_link }}
                                        // source={{ uri: `https://www.youtube.com/embed/${'1SnPKhCdlsU'}?autoplay=1&rel=0&showinfo=0&controls=0`}}
                                        style={styles.video}
                                    // allowsFullscreenVideo={true}
                                    />
                                </View>
                                <View style={{ ...appStyles.itmRow, marginTop: 20 }}>
                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>Created By</Text>
                                    <Text style={TextStyles.valueText}>{currMeterial?.created_by || 'NA'}</Text>
                                </View>
                                <View style={appStyles.itmRow}>
                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>Description</Text>
                                    <Text style={{ ...TextStyles.valueText, color: colors.text }}>{currMeterial?.description || 'NA'}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>

            </ScrollView>
        </View>
    )
}

export default VideoDownloads

const styles = StyleSheet.create({
    modal: {
        backgroundColor: Colors.semiTransparent,
        height: screenHeight,
        alignItems: 'center',
        justifyContent: 'center'
    },
    popup: {
        minHeight: screenHeight / 1.8,
        width: screenWidth * 0.9,
        maxWidth: maxWidth,
        backgroundColor: Colors.white2,
        padding: 10,
        // marginTop: 400
    },
    container: {
        // flex: 1,
        marginTop: 20,
        height: 450
    },
    video: {
        // flex: 1,
        height: 100
    },
})