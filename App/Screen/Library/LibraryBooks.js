import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import { TextStyles, appStyles } from '../../Constants/Fonts';
import { Images } from '../../Constants/Images';
import { moderateScale } from '../../Constants/PixelRatio';
import { Colors } from '../../Constants/Colors';


const libraryBooks = [
    { name: 'A seed Tells farmer Story', author: 'Harry', subject: 'Hindi', publisher: 'R.K. Publisher', rackNo: '787', Quality: '50', Price: '2340', postDate: '08/12/2023' },
    { name: 'A seed Tells farmer Story', author: 'Harry', subject: 'Hindi', publisher: 'R.K. Publisher', rackNo: '787', Quality: '50', Price: '2340', postDate: '08/12/2023' },
    { name: 'A seed Tells farmer Story', author: 'Harry', subject: 'Hindi', publisher: 'R.K. Publisher', rackNo: '787', Quality: '50', Price: '2340', postDate: '08/12/2023' },
    { name: 'A seed Tells farmer Story', author: 'Harry', subject: 'Hindi', publisher: 'R.K. Publisher', rackNo: '787', Quality: '50', Price: '2340', postDate: '08/12/2023' },
    { name: 'A seed Tells farmer Story', author: 'Harry', subject: 'Hindi', publisher: 'R.K. Publisher', rackNo: '787', Quality: '50', Price: '2340', postDate: '08/12/2023' },
    { name: 'A seed Tells farmer Story', author: 'Harry', subject: 'Hindi', publisher: 'R.K. Publisher', rackNo: '787', Quality: '50', Price: '2340', postDate: '08/12/2023' },
    { name: 'A seed Tells farmer Story', author: 'Harry', subject: 'Hindi', publisher: 'R.K. Publisher', rackNo: '787', Quality: '50', Price: '2340', postDate: '08/12/2023' },
    { name: 'A seed Tells farmer Story', author: 'Harry', subject: 'Hindi', publisher: 'R.K. Publisher', rackNo: '787', Quality: '50', Price: '2340', postDate: '08/12/2023' },
    { name: 'A seed Tells farmer Story', author: 'Harry', subject: 'Hindi', publisher: 'R.K. Publisher', rackNo: '787', Quality: '50', Price: '2340', postDate: '08/12/2023' },
    { name: 'A seed Tells farmer Story', author: 'Harry', subject: 'Hindi', publisher: 'R.K. Publisher', rackNo: '787', Quality: '50', Price: '2340', postDate: '08/12/2023' },
];
const LibraryBooks = () => {
    return (
        <View>
            <BackHeader
                title='Library Books'
                onBackIconPress={() => {
                    NavigationService.navigate('IssuedBooks');
                }}
            />

            <ScrollView style={{
                backgroundColor: Colors.white2,
                width: '100%',
            }}>
                <View style={appStyles.main}>
                    <View style={{ flexDirection: 'row', marginTop: 5, alignSelf: 'center' }}>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={TextStyles.headerText}>Your books are here!</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Image
                                source={Images.issuedBooks}
                                style={{
                                    height: moderateScale(65),
                                    width: moderateScale(120),
                                    resizeMode: 'stretch'
                                    // marginTop:-15
                                }}
                            />
                        </View>
                    </View>
                    <View>
                        {/* <FlatList
                            // style={{backgroundColor:Colors.white2}}
                            data={issuedBooks}
                            renderItem={({ item, index }) => {
                                return (
                                    <View style={appStyles.card}>
                                        <View style={appStyles.titleRow}>
                                            <Text style={TextStyles.title2}>{item.name}</Text>
                                            <View style={{ ...styles.paidType, backgroundColor: item.returnDate ? Colors.Green1 : Colors.red1 }}>
                                                <Text style={{ ...TextStyles.subTitle, color: Colors.white2 }}>{item.status}</Text>
                                            </View>
                                        </View>
                                        <View style={{ padding: 15, paddingTop: 5 }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={styles.keyText}>Author</Text>
                                                <Text style={styles.valueText}>{item.author}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={styles.keyText}>Book No.</Text>
                                                <Text style={styles.valueText}>{item.BookNo}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={styles.keyText}>Issue Date</Text>
                                                <Text style={styles.valueText}>{item.issuedDate}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={styles.keyText}>Return Date</Text>
                                                <Text style={styles.valueText}>{item.returnDate}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={styles.keyText}>Dur Return Date</Text>
                                                <Text style={styles.valueText}>{item.dueReturnDate}</Text>
                                            </View>
                                        </View>
                                    </View>
                                )
                            }}
                        /> */}
                        {/* <ScrollView> */}
                        {libraryBooks.map((item, index) => {
                            return (
                                <View key={index} style={appStyles.card}>
                                    <View style={appStyles.titleRow}>
                                        <Text style={TextStyles.title2}>{item.name}</Text>
                                        {/* <View style={{ ...styles.paidType, backgroundColor: item.returnDate ? Colors.Green1 : Colors.red1 }}>
                                            <Text style={{ ...TextStyles.subTitle, color: Colors.white2 }}>{item.status}</Text>
                                        </View> */}
                                    </View>
                                    <View style={{ padding: 15, paddingTop: 5 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.keyText}>Author</Text>
                                            <Text style={styles.valueText}>{item.author}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.keyText}>Subject</Text>
                                            <Text style={styles.valueText}>{item.subject}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.keyText}>Publisher</Text>
                                            <Text style={styles.valueText}>{item.publisher}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.keyText}>Rack No.</Text>
                                            <Text style={styles.valueText}>{item.rackNo}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.keyText}>Quality</Text>
                                            <Text style={styles.valueText}>{item.Quality}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.keyText}>Price</Text>
                                            <Text style={styles.valueText}>{item.Price}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.keyText}>Post Date</Text>
                                            <Text style={styles.valueText}>{item.postDate}</Text>
                                        </View>
                                    </View>
                                </View>
                            )
                        })}
                        {/* </ScrollView> */}

                    </View>

                </View>
            </ScrollView>
        </View>
    )
}

export default LibraryBooks

const styles = StyleSheet.create({
    booksIconWraper: {
        position: 'absolute',
        flexDirection: 'row',
        top: 15,
        right: 20
    },
    paidType: {
        paddingHorizontal: 10,
        paddingVertical: 1,
        borderRadius: moderateScale(6),
        backgroundColor: Colors.tangerine5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyText: {
        ...TextStyles.keyText,
        flex: 1
    },
    valueText: {
        ...TextStyles.valueText,
        flex: 1.5
    },
})