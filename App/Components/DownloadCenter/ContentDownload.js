import { ActivityIndicator, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Colors } from '../../Constants/Colors'
import { TextStyles, appStyles } from '../../Constants/Fonts'
import { Images } from '../../Constants/Images'
import { maxWidth, moderateScale, screenHeight, screenWidth } from '../../Constants/PixelRatio'
import UseApi from '../../ApiConfig'
import { useSelector } from 'react-redux'
import { useTheme } from '@react-navigation/native'

// const contents = [
//     { title: 'Title1', shareDate: '12/06/24', validUpto: '13/06/24', shareBy: 'Super Admin (9000)', descriptoin: 'description...' },
//     { title: 'Title1', shareDate: '12/06/24', validUpto: '13/06/24', shareBy: 'Super Admin (9000)', descriptoin: 'description...' },
//     { title: 'Title1', shareDate: '12/06/24', validUpto: '13/06/24', shareBy: 'Super Admin (9000)', descriptoin: 'description...' },
//     { title: 'Title1', shareDate: '12/06/24', validUpto: '13/06/24', shareBy: 'Super Admin (9000)', descriptoin: 'description...' },
//     { title: 'Title1', shareDate: '12/06/24', validUpto: '13/06/24', shareBy: 'Super Admin (9000)', descriptoin: 'description...' },
//     { title: 'Title1', shareDate: '12/06/24', validUpto: '13/06/24', shareBy: 'Super Admin (9000)', descriptoin: 'description...' },
// ]

const ContentDownload = () => {
    const { Request } = UseApi();
    const {colors} = useTheme();
    const { userData, profileData } = useSelector(state => state.User);
    const [loading, setLoading] = useState(false);
    const [contents, setContents] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [currMeterial, setCurrMeterial] = useState(null);


    useEffect(() => {
        getContents();
    }, []);

    const getContents = async () => {
        setLoading(true);
        let params = {
            student_id: userData?.id,
            role: 'student',
            type: '1',
            class_id:userData?.class_id,
            section_id:userData?.section_id
        }

        let data;
        try {
            data = await Request('share-list', 'POST', params);
        } catch (err) {
            console.log('err2....', err);
        }
   
        if (data?.status && data?.data) {
            setContents(data?.data);
        }
        setLoading(false);
    }

    return (
        <View style={{ backgroundColor: colors.background }}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background, minHeight: screenHeight - 155 }}>
                <View style={{ marginBottom: 100 }}>
                    {contents.map((item, index) => {
                        return (
                            <View key={index} style={{ ...appStyles.card, width: '92%',backgroundColor: colors.background, borderColor: colors.lightBlck, borderWidth: 0.5 }}>
                                <View style={{ ...appStyles.titleRow, backgroundColor: colors.lightGreen }}>
                                    <Text style={{ ...TextStyles.title2, color: colors.text }}>{item.title}</Text>
                                    {<View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 2 }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setOpenModal(true);
                                                setCurrMeterial(item);
                                            }}
                                        >
                                            <Image
                                                source={Images.eye}
                                                style={{
                                                    height: 20,
                                                    width: 20,
                                                    tintColor:colors.text
                                                }}
                                            />
                                        </TouchableOpacity>
                                    </View>}
                                </View>
                                <View style={{ padding: 15, paddingTop: 5 }}>
                                    <View style={appStyles.itmRow}>
                                        <Text style={{ ...TextStyles.keyText, color: colors.text }}>Share Date</Text>
                                        <Text style={{ ...TextStyles.valueText, color: colors.text }}>{item.share_date}</Text>
                                    </View>
                                    <View style={appStyles.itmRow}>
                                        <Text style={{ ...TextStyles.keyText, color: colors.text }}>Valid Upto</Text>
                                        <Text style={{ ...TextStyles.valueText, color: colors.text }}>{item.valid_upto || 'NA'}</Text>
                                    </View>
                                    <View style={appStyles.itmRow}>
                                        <Text style={{ ...TextStyles.keyText, color: colors.text }}>Share By</Text>
                                        <Text style={{ ...TextStyles.valueText, color: colors.text }}>{item.share_by || 'NA'}</Text>
                                    </View>
                                    <View style={appStyles.itmRow}>
                                        <Text style={{ ...TextStyles.keyText, color: colors.text }}>Description</Text>
                                        <Text style={{ ...TextStyles.valueText, color: colors.text }} numberOfLines={1}>{item.description || 'NA'}</Text>
                                    </View>
                                </View>
                            </View>
                        )
                    })}
                </View>

                <Modal
                    visible={openModal}
                    transparent
                >
                    <View style={styles.modal}>
                        <View style={{...styles.popup,backgroundColor:colors.background,borderColor: colors.lightBlck, borderWidth: 0.5 }}>
                            <View>
                                <Text style={{ ...TextStyles.title2, textAlign: 'center',color:colors.text }}>Content</Text>
                                <TouchableOpacity onPress={() => setOpenModal(false)}
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
                            <View style={{ marginTop: 20 }}>
                                <Text style={{...TextStyles.title2,color:colors.text}}>{currMeterial?.upload_doc[0]?.vid_title}</Text>
                                <View style={{...appStyles.itmRow,marginTop:10}}>
                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>Share Date</Text>
                                    <Text style={{ ...TextStyles.valueText, color: colors.text }}>{currMeterial?.share_date}</Text>
                                </View>
                                <View style={appStyles.itmRow}>
                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>Valid Upto</Text>
                                    <Text style={{ ...TextStyles.valueText, color: colors.text }}>{currMeterial?.valid_upto || 'NA'}</Text>
                                </View>
                                <View style={appStyles.itmRow}>
                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>Share By</Text>
                                    <Text style={{ ...TextStyles.valueText, color: colors.text }}>{currMeterial?.share_by || 'NA'}</Text>
                                </View>
                                <View style={appStyles.itmRow}>
                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>Description</Text>
                                    <Text style={{ ...TextStyles.valueText, color: colors.text }} numberOfLines={1}>{currMeterial?.description || 'NA'}</Text>
                                </View>
                                <View style={appStyles.itmRow}>
                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>Video Url</Text>
                                    <Text style={{ ...TextStyles.valueText, color: colors.text }}
                                        numberOfLines={1}
                                        onPress={() => Linking.openURL(currMeterial?.upload_doc[0]?.vid_url)}
                                    >{currMeterial?.upload_doc[0]?.vid_url || 'NA'}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>

                {loading && <ActivityIndicator size={28} style={{ marginTop: screenHeight / 3 }} />}

                {!loading && contents.length == 0 && <View style={{ marginTop: screenHeight / 4, alignItems: 'center' }}>
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
                </View>}
            </ScrollView>
        </View>
    )
}

export default ContentDownload

const styles = StyleSheet.create({
    modal: {
        backgroundColor: Colors.semiTransparent,
        height: screenHeight,
        alignItems: 'center',
        justifyContent: 'center'
    },
    popup: {
        minHeight: screenHeight / 3,
        width: screenWidth * 0.9,
        maxWidth: maxWidth,
        backgroundColor: Colors.white2,
        padding: 10
    },
})