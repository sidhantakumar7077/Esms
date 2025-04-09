import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import { TextStyles, appStyles } from '../../Constants/Fonts';
import { Images } from '../../Constants/Images';
import { moderateScale } from '../../Constants/PixelRatio';
import { Colors } from '../../Constants/Colors';


const issuedBooks = [
    { name: 'A seed Tells farmer Story', author: 'Harry', BookNo: '89637', issuedDate: '22/12/2023', returnDate: '20/12/2023', dueReturnDate: '21/12/2023', status: 'Returned' },
    { name: 'A seed Tells farmer Story', author: 'Harry', BookNo: '89637', issuedDate: '22/12/2023', returnDate: '20/12/2023', dueReturnDate: '21/12/2023', status: 'Returned' },
    { name: 'A seed Tells farmer Story', author: 'Harry', BookNo: '89637', issuedDate: '22/12/2023', returnDate: '20/12/2023', dueReturnDate: '21/12/2023', status: 'Returned' },
    { name: 'A seed Tells farmer Story', author: 'Harry', BookNo: '89637', issuedDate: '22/12/2023', returnDate: null, dueReturnDate: '21/12/2023', status: 'Not Returned' },
    { name: 'A seed Tells farmer Story', author: 'Harry', BookNo: '89637', issuedDate: '22/12/2023', returnDate: null, dueReturnDate: '21/12/2023', status: 'Not Returned' },
    { name: 'A seed Tells farmer Story', author: 'Harry', BookNo: '89637', issuedDate: '22/12/2023', returnDate: null, dueReturnDate: '21/12/2023', status: 'Not Returned' },
    { name: 'A seed Tells farmer Story', author: 'Harry', BookNo: '89637', issuedDate: '22/12/2023', returnDate: '19/12/2023', dueReturnDate: '21/12/2023', status: 'Returned' },
    { name: 'A seed Tells farmer Story', author: 'Harry', BookNo: '89637', issuedDate: '22/12/2023', returnDate: '19/12/2023', dueReturnDate: '21/12/2023', status: 'Returned' },
    { name: 'A seed Tells farmer Story', author: 'Harry', BookNo: '89637', issuedDate: '22/12/2023', returnDate: '19/12/2023', dueReturnDate: '21/12/2023', status: 'Returned' },
    { name: 'A seed Tells farmer Story', author: 'Harry', BookNo: '89637', issuedDate: '22/12/2023', returnDate: '19/12/2023', dueReturnDate: '21/12/2023', status: 'Returned' },
];
const IssuedBooks = () => {
    return (
        <View>
            <BackHeader
                title='Library'
                onBackIconPress={() => {
                    NavigationService.navigate('Home');
                }}
            />
            <TouchableOpacity
                onPress={() => NavigationService.navigate('LibraryBooks')}
                style={styles.booksIconWraper}>
                <Image
                    source={Images.books}
                    style={{
                        height: moderateScale(20),
                        width: moderateScale(20),
                        resizeMode: 'stretch',
                        tintColor: Colors.white2
                        // marginTop:-15
                    }}
                />
                <Text style={{ ...TextStyles.title, color: Colors.white2, marginTop: 0, marginLeft: 10 }}>Books</Text>
            </TouchableOpacity>
            <ScrollView style={{
                backgroundColor: Colors.white2,
                width: '100%',
            }}>
                <View style={appStyles.main}>
                    <View style={{ flexDirection: 'row', marginTop: 5, alignSelf: 'center' }}>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={TextStyles.headerText}>Your Issused books are here!</Text>
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
                        {issuedBooks.map((item, index) => {
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
                        })}
                        {/* </ScrollView> */}

                    </View>

                </View>
            </ScrollView>
        </View>
    )
}

export default IssuedBooks

const styles = StyleSheet.create({
    booksIconWraper: {
        position: 'absolute',
        flexDirection: 'row',
        top: 58,
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