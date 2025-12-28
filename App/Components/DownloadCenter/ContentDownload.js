import { ActivityIndicator, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Colors } from '../../Constants/Colors'
import { TextStyles, appStyles } from '../../Constants/Fonts'
import { Images } from '../../Constants/Images'
import { maxWidth, moderateScale, screenHeight, screenWidth } from '../../Constants/PixelRatio'
import UseApi from '../../ApiConfig'
import { useSelector } from 'react-redux'
import { useTheme } from '@react-navigation/native'
import rndownloadFile from '../../Utils/rndownload';

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
    const { colors } = useTheme();
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
            // student_id: userData?.id,
            // role: 'student',
            // type: '1',
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

        // console.log("DownLoad Data", data);
        if (data?.status && data?.data) {
            setContents(data?.data);
            // console.log("Download Data", data?.data);
        }
        setLoading(false);
    }

    const openInBrowser = async (url) => {
        if (!url) return;
        try {
            const can = await Linking.canOpenURL(url);
            if (can) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Invalid Link', 'Unable to open this link.');
            }
        } catch (e) {
            console.log('openInBrowser error:', e);
            Alert.alert('Error', 'Unable to open the link.');
        }
    };

    const onDownloadPress = (url) => {
        if (!url) return;
        Alert.alert('Download', 'Do you want to download this file?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Download', onPress: () => rndownloadFile(url) },
        ]);
    };

    return (
        <View style={{ backgroundColor: colors.background }}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background, minHeight: screenHeight - 155 }}>
                <View style={{ marginBottom: 100 }}>
                    {contents.map((item, index) => {
                        return (
                            <View key={index} style={{ ...appStyles.card, width: '92%', backgroundColor: colors.background, borderColor: colors.lightBlck, borderWidth: 0.5 }}>
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
                                                    tintColor: colors.text
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
                                </View>
                            </View>
                        )
                    })}
                </View>

                <Modal
                    visible={openModal}
                    transparent
                    statusBarTranslucent
                    animationType="fade"
                    onRequestClose={() => setOpenModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        {/* Tap outside to close */}
                        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpenModal(false)} />

                        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
                            {/* Handle */}
                            <View style={styles.handleWrap}>
                                <View style={[styles.handle, { backgroundColor: colors.lightBlck }]} />
                            </View>

                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.headerLeft}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={2}>
                                            {currMeterial?.title || "Content"}
                                        </Text>

                                        <Text style={[styles.headerSub, { color: colors.text }]} numberOfLines={1}>
                                            {currMeterial?.share_by ? `Shared by ${currMeterial.share_by}` : "—"}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setOpenModal(false)}
                                    style={[styles.closeBtn, { borderColor: colors.lightBlck }]}
                                >
                                    <Image source={Images.close} style={{ height: 12, width: 12, tintColor: colors.text }} />
                                </TouchableOpacity>
                            </View>

                            {/* Body */}
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 18 }}
                            >
                                {/* Description */}
                                {currMeterial?.description?.trim() ? (
                                    <View style={[styles.section, { borderColor: colors.lightBlck, backgroundColor: colors.background }]}>
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
                                        <Text style={[styles.sectionText, { color: colors.text }]}>{currMeterial.description}</Text>
                                    </View>
                                ) : null}

                                {/* Attachments */}
                                <View style={[styles.section, { borderColor: colors.lightBlck, backgroundColor: colors.background }]}>
                                    <View style={styles.sectionHeaderRow}>
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Attachments</Text>
                                        <View style={[styles.countBadge, { backgroundColor: colors.lightGreen, borderColor: colors.lightBlck }]}>
                                            <Text style={[styles.countBadgeText, { color: colors.text }]}>
                                                {(currMeterial?.upload_doc || []).length}
                                            </Text>
                                        </View>
                                    </View>

                                    {(currMeterial?.upload_doc || []).map((doc, idx) => {
                                        const isVideo = String(doc?.file_type || "").toLowerCase() === "video";

                                        return (
                                            <View
                                                key={`${doc?.id || idx}`}
                                                style={[
                                                    styles.attachmentCard,
                                                    { borderColor: colors.lightBlck, backgroundColor: colors.background },
                                                ]}
                                            >
                                                <View style={styles.attachmentLeft}>
                                                    <View
                                                        style={[
                                                            styles.fileTypeIcon,
                                                            {
                                                                backgroundColor: isVideo ? colors.primary : colors.lightGreen,
                                                                borderColor: colors.lightBlck,
                                                            },
                                                        ]}
                                                    >
                                                        <Text style={{ fontWeight: "900", fontSize: 12, color: isVideo ? "#fff" : colors.text }}>
                                                            {isVideo ? "VID" : "DOC"}
                                                        </Text>
                                                    </View>

                                                    <View style={{ flex: 1 }}>
                                                        <Text style={[styles.fileTitle, { color: colors.text }]} numberOfLines={2}>
                                                            {doc?.real_name || "Untitled"}
                                                        </Text>

                                                        <Text style={[styles.fileSub, { color: colors.text }]} numberOfLines={1}>
                                                            {(doc?.file_type || "file").toUpperCase()} • {doc?.src || ""}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <TouchableOpacity
                                                    style={[
                                                        styles.actionPill,
                                                        {
                                                            backgroundColor: isVideo ? colors.primary : colors.background,
                                                            borderColor: colors.lightBlck,
                                                        },
                                                    ]}
                                                    onPress={() => {
                                                        if (isVideo) openInBrowser(doc?.src);
                                                        else onDownloadPress(doc?.src);
                                                    }}
                                                >
                                                    <Text style={[styles.actionPillText, { color: isVideo ? "#fff" : colors.text }]}>
                                                        {isVideo ? "Open" : "Download"}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    })}

                                    {(!currMeterial?.upload_doc || currMeterial.upload_doc.length === 0) ? (
                                        <View style={[styles.emptyState, { borderColor: colors.lightBlck }]}>
                                            <Text style={[styles.sectionText, { color: colors.text }]}>No attachments found.</Text>
                                        </View>
                                    ) : null}
                                </View>
                            </ScrollView>

                            {/* Footer */}
                            <View style={[styles.footer, { borderTopColor: colors.lightBlck }]}>
                                <TouchableOpacity
                                    onPress={() => setOpenModal(false)}
                                    style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                                >
                                    <Text style={styles.primaryBtnText}>Close</Text>
                                </TouchableOpacity>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        justifyContent: "flex-end",
    },

    sheet: {
        width: "100%",
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        height: screenHeight * 0.70,
        overflow: "hidden",
        ...Platform.select({
            android: { elevation: 10 },
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.14,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: -8 },
            },
        }),
    },

    handleWrap: {
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: 10,
    },
    handle: {
        width: 66,
        height: 5,
        borderRadius: 999,
        opacity: 0.85,
    },

    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        flex: 1,
        paddingRight: 10,
    },
    headerIcon: {
        height: 44,
        width: 44,
        borderRadius: 14,
        borderWidth: 0.5,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
    },
    headerTitle: {
        fontSize: moderateScale(16),
        fontWeight: "900",
        lineHeight: moderateScale(22),
    },
    headerSub: {
        marginTop: 3,
        fontSize: moderateScale(12),
        fontWeight: "700",
        opacity: 0.75,
    },
    metaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10,
    },
    metaPill: {
        borderWidth: 0.5,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    metaText: {
        fontSize: moderateScale(11),
        fontWeight: "800",
        opacity: 0.95,
    },

    closeBtn: {
        height: 40,
        width: 40,
        borderRadius: 14,
        borderWidth: 0.5,
        alignItems: "center",
        justifyContent: "center",
    },

    section: {
        marginTop: 14,
        marginHorizontal: 16,
        borderWidth: 0.5,
        borderRadius: 16,
        padding: 14,
    },
    sectionHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: moderateScale(13),
        fontWeight: "900",
    },
    sectionText: {
        fontSize: moderateScale(12),
        lineHeight: moderateScale(18),
        fontWeight: "600",
        opacity: 0.85,
    },

    countBadge: {
        borderWidth: 0.5,
        height: 26,
        minWidth: 34,
        paddingHorizontal: 10,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    countBadgeText: {
        fontSize: moderateScale(12),
        fontWeight: "900",
    },

    attachmentCard: {
        borderWidth: 0.5,
        borderRadius: 14,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
    },
    attachmentLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
        paddingRight: 10,
    },
    fileTypeIcon: {
        height: 42,
        width: 42,
        borderRadius: 14,
        borderWidth: 0.5,
        alignItems: "center",
        justifyContent: "center",
    },
    fileTitle: {
        fontSize: moderateScale(13),
        fontWeight: "900",
        lineHeight: moderateScale(18),
    },
    fileSub: {
        marginTop: 4,
        fontSize: moderateScale(11),
        fontWeight: "600",
        opacity: 0.72,
    },

    actionPill: {
        borderWidth: 0.5,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    actionPillText: {
        fontSize: moderateScale(12),
        fontWeight: "900",
    },

    emptyState: {
        borderWidth: 0.5,
        borderRadius: 14,
        padding: 12,
        marginTop: 10,
        alignItems: "center",
    },

    footer: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        borderTopWidth: 0.5,
    },
    primaryBtn: {
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryBtnText: {
        color: "#fff",
        fontSize: moderateScale(14),
        fontWeight: "900",
    },
});