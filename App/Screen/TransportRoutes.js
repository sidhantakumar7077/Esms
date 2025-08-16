import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import BackHeader from '../Components/BackHeader';
import NavigationService from '../Services/Navigation';
import { Colors } from '../Constants/Colors';
import { TextStyles, appStyles } from '../Constants/Fonts';
import TitleHeader from '../Components/TitleHeader';
import { Images } from '../Constants/Images';
import { moderateScale, screenHeight } from '../Constants/PixelRatio';
import database from '@react-native-firebase/database';
import { useDispatch, useSelector } from 'react-redux';
import UseApi from '../ApiConfig';
// import { Dropdown } from 'react-native-element-dropdown';
import { setVehicleDetails } from '../Redux/reducer/User';
import { useTheme, useNavigation } from '@react-navigation/native';
import moment from 'moment';
// import LinearGradient from 'react-native-linear-gradient';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const stopagesData = [
    { name: 'Brooklyn East', distance: '10 km', pickupTime: '6:00 PM' },
    { name: 'Brooklyn North', distance: '10 km', pickupTime: '6:20 PM' },
    { name: 'Brooklyn South', distance: '20 km', pickupTime: '6:40 PM' },
    { name: 'Brooklyn Central', distance: '40 km', pickupTime: '7:10 PM' },
    { name: 'Manhattan', distance: '10 km', pickupTime: '7:30 PM' },
    { name: 'Railway Station', distance: '30 km', pickupTime: '8:10 PM' },
];
const TransportRoutes = () => {

    const navigation = useNavigation();
    const { userData, vehicleDetails } = useSelector(state => state.User);
    const dispatch = useDispatch();
    const { Request } = UseApi();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    // const [vehicleDetails, setVehicleDetails] = useState(null);
    const [stopages, setStopages] = useState([]);
    const [origin, setOrigin] = useState(null);
    const [isTowordSchool, setIsTowordSchool] = useState(null);
    const [routeDirection, setRouteDirection] = useState(null);
    const [selectRouteErr, setSelectRouteErr] = useState('');
    const [destination, setDestination] = useState(null);
    const [routeDetails, setRouteDetails] = useState(null);

    const getRouteDetails = async () => {
        setLoading(true);
        try {
            const params = {
                user_id: userData.id,
            };

            const response = await Request('studentRoute', 'POST', params);

            if (response.statusCode === 200) {
                setLoading(false);
                // console.log("response.data", response.route_list);
                setRouteDetails(response.route_list);
                setStopages(response.route_list.pickup_point);
            } else {
                setRouteDetails(null);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching route details:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        getRouteDetails();
        // getDrivingDetails();
    }, [isTowordSchool]);

    const getDrivingDetails = async () => {
        if (userData.type == 'driver') {
            setRouteDirection(isTowordSchool);
        }
        setLoading(true);
        let params = {
            id: userData.type == 'driver' ? userData.id : userData.driver_id,
            // toWardsSchool:userData.type == 'driver' ? isTowordSchool : ''
        }
        if (userData.type == 'driver') {
            params = { ...params, toWardsSchool: isTowordSchool }
        }

        let data;
        try {
            data = await Request('pickDetails', 'POST', params);
        } catch (err) {
            console.log('err2....', err);
        }
        if (data.status) {
            if (data.data?.route_list) {
                setStopages(data.data?.route_list);
            }
            if (data.data?.vehicle_details?.length > 0) {
                dispatch(setVehicleDetails(data?.data?.vehicle_details[0]));
            }
            if (data?.data && userData.type == 'student') {
                setRouteDirection(data?.data?.toWardsSchool);
            }
        }
        setLoading(false);
    }

    const createUserLoaction = () => {
        // const reference = database().ref('/users/123');
        database()
            .ref('/users/124/location')
            .set({
                latitude: 22.7749,
                longitude: 88.4194,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            })
            .then(() => console.log('Data set.'));
    }

    return (
        <View>
            <BackHeader
                title='Transport'
                onBackIconPress={() => {
                    NavigationService.navigate('Home');
                }}
            />
            <ScrollView style={{
                backgroundColor: colors.background,
                width: '100%',
            }}>
                <View style={{ ...appStyles.main, backgroundColor: colors.background }}>
                    <TitleHeader
                        title={'Your Transport Route is here!'}
                        image={Images.transportRoutes}
                        imageStyle={{
                            height: moderateScale(70),
                            width: moderateScale(120),
                        }}
                    />
                    <View style={{ ...appStyles.card, backgroundColor: colors.background, borderColor: colors.lightBlck, borderWidth: 0.5 }}>
                        <View style={{ ...appStyles.titleRow, backgroundColor: colors.lightGreen }}>
                            <Text style={{ ...TextStyles.title2, color: colors.text }}>{routeDetails?.route_title}</Text>
                        </View>
                        <View style={{ padding: 15, paddingTop: 10 }}>
                            <View style={styles.titleRow}>
                                <Text style={{ ...TextStyles.keyText, color: colors.text }}>Vehicle Number</Text>
                                <Text style={{ ...TextStyles.valueText, color: colors.text }}>{routeDetails?.vehicle_no || 'NA'}</Text>
                            </View>
                            <View style={styles.titleRow}>
                                <Text style={{ ...TextStyles.keyText, color: colors.text }}>Vehicle Model</Text>
                                <Text style={{ ...TextStyles.valueText, color: colors.text }}>{routeDetails?.vehicle_model || 'NA'}</Text>
                            </View>
                            <View style={styles.titleRow}>
                                <Text style={{ ...TextStyles.keyText, color: colors.text }}>Driver Name</Text>
                                <Text style={{ ...TextStyles.valueText, color: colors.text }}>{routeDetails?.driver_name}</Text>
                            </View>
                            <View style={styles.titleRow}>
                                <Text style={{ ...TextStyles.keyText, color: colors.text }}>Driver Contact</Text>
                                <Text style={{ ...TextStyles.valueText, color: colors.text }}>{routeDetails?.driver_contact || 'NA'}</Text>
                            </View>
                            {/* <View style={styles.titleRow}>
                                <Text style={{ ...TextStyles.keyText, color: colors.text }}>Driver Licence</Text>
                                <Text style={{ ...TextStyles.valueText, color: colors.text }}>{routeDetails?.driver_licence || 'NA'}</Text>
                            </View>
                            <View style={styles.titleRow}>
                                <Text style={TextStyles.keyText}>Made</Text>
                                <Text style={TextStyles.valueText}>2020</Text>
                            </View> */}
                        </View>
                    </View>
                    {/* View My location button */}
                    {/* <View style={{ ...appStyles.card, paddingVertical: 10, backgroundColor: colors.background, borderColor: colors.lightBlck, borderWidth: 0.5 }}>
                        <TouchableOpacity style={{ ...styles.btn, backgroundColor: colors.text }} onPress={() => navigation.navigate('LocationTracking')}>
                            <Text style={{ color: colors.background, fontSize: 17 }}>View My Location</Text>
                        </TouchableOpacity>
                    </View> */}

                    {/* {userData?.type == 'driver' && <View style={appStyles.card}>
                        <View style={{ flexDirection: 'row', columnGap: 5, paddingHorizontal: 10 }}>
                            <Image
                                source={Images.address}
                                style={{
                                    height: moderateScale(12),
                                    width: moderateScale(12),
                                    marginTop: 12,
                                    tintColor: Colors.green2,
                                }}
                            />
                            <Dropdown
                                style={styles.dropdown}
                                maxHeight={screenHeight / 2}
                                itemTextStyle={{ marginVertical: -8 }}
                                // selectedTextStyle={{}}
                                // placeholderStyle={{}}
                                labelField={'name'}
                                valueField={'id'}
                                data={stopages}
                                value={origin}
                                placeholder='Select Origin'
                                onChange={(item) => {
                                    setOrigin(item.id)
                                }}
                            />
                        </View>
                        <View style={{ borderBottomWidth: 1, marginHorizontal: 10 }} />
                        <View style={{ flexDirection: 'row', paddingHorizontal: 10, columnGap: 5 }}>
                            <Image
                                source={Images.address}
                                style={{
                                    height: moderateScale(12),
                                    width: moderateScale(12),
                                    marginTop: 12,
                                    // resizeMode: 'stretch',
                                    tintColor: Colors.red1,
                                }}
                            />
                            <Dropdown
                                style={styles.dropdown}
                                maxHeight={screenHeight / 2}
                                itemTextStyle={{ marginVertical: -8 }}
                                // selectedTextStyle={{}}
                                // placeholderStyle={{}}
                                labelField={'name'}
                                valueField={'id'}
                                data={stopages}
                                value={destination}
                                placeholder='Select Destination'
                                onChange={(item) => {
                                    setDestination(item.id)
                                }}
                            />
                        </View>
                    </View>} */}

                    {/* <TouchableOpacity style={styles.btn}
                        onPress={() => createUserLoaction()}
                    >
                        <Text style={{ color: Colors.white, fontSize: 17 }}>Create User location</Text>
                    </TouchableOpacity> */}

                    {stopages?.length > 0 &&
                        <View style={{ marginTop: 20 }}>
                            <Text style={{ ...TextStyles.title3, marginVertical: 10 }}>Current Route</Text>
                            {/* <View style={{ marginTop: 10 }}>
                            {!loading && stopages.map((item, index) => {
                                return (
                                    <View style={{ flexDirection: 'row' }}>
                                        <View style={{ flex: 1, alignItems: 'center' }}>
                                            <View style={{ ...styles.circle, backgroundColor: index == 0 ? Colors.green2 : Colors.lightBlck2 }}>
                                                <Image
                                                    source={Images.address}
                                                    style={{
                                                        height: moderateScale(8),
                                                        width: moderateScale(8),
                                                        resizeMode: 'stretch',
                                                        tintColor: index == 0 ? Colors.white : Colors.black,
                                                    }}
                                                />
                                            </View>
                                            {index != stopages.length - 1 && <View style={styles.verticalLine} />}
                                        </View>
                                        <View style={{ flex: 10, flexDirection: 'row', marginBottom: 15 }}>
                                            <View style={styles.horizontalLine} />
                                            <View style={[styles.stopageCard, routeDetails?.route_pickup_point_id === item.pickup_point_id && { backgroundColor: '#b0dd35' }]}>
                                                <View style={appStyles.titleRow}>
                                                    <Text style={TextStyles.title2}>{item.pickup_point}</Text>
                                                </View>
                                                <View style={{ padding: 15, paddingTop: 5 }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                                        <View style={{ flexDirection: 'row', columnGap: 10 }}>
                                                            <Image
                                                                source={Images.distance}
                                                                style={{
                                                                    height: moderateScale(12),
                                                                    width: moderateScale(12),
                                                                    resizeMode: 'stretch',
                                                                }}
                                                            />
                                                            <Text style={{ ...TextStyles.keyText, flex: null, marginTop: -2 }}>Distance</Text>
                                                        </View>
                                                        <Text style={{ ...TextStyles.valueText, marginTop: 0, flex: null }}>{item.destination_distance + " km" || 'NA'}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                                        <View style={{ flexDirection: 'row', columnGap: 10 }}>
                                                            <Image
                                                                source={Images.clock}
                                                                style={{
                                                                    height: moderateScale(12),
                                                                    width: moderateScale(12),
                                                                    resizeMode: 'stretch',
                                                                }}
                                                            />
                                                            <Text style={{ ...TextStyles.keyText, flex: null, marginTop: -2 }}>pickup Time</Text>
                                                        </View>
                                                        <Text style={{ ...TextStyles.valueText, marginTop: 0, flex: null }}>{moment(item.pickup_time, 'HH:mm:ss').format('hh:mm A') || 'NA'}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                )
                            })}
                        </View> */}
                            <View style={{ marginTop: 10 }}>
                                <FlatList
                                    data={stopages}
                                    keyExtractor={(item) => item.id.toString()}
                                    scrollEnabled={false}
                                    renderItem={({ item, index }) => {
                                        const isFirst = index === 0;
                                        const isLast = index === stopages.length - 1;
                                        const pickupIndex = stopages.findIndex(
                                            x => x.pickup_point_id === routeDetails?.route_pickup_point_id
                                        );
                                        const isInRoute = index >= pickupIndex;

                                        const number = isInRoute && !isFirst && !isLast ? index - pickupIndex + 1 : null;

                                        return (
                                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 15 }}>
                                                {/* Left Indicator */}
                                                <View style={{ alignItems: 'center', width: 40 }}>
                                                    <View
                                                        style={{
                                                            height: 26,
                                                            width: 26,
                                                            borderRadius: 13,
                                                            borderWidth: 2,
                                                            borderColor: isInRoute ? '#FFA726' : '#C5C5C5',
                                                            backgroundColor: isInRoute ? '#FFA726' : '#fff',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        {isFirst ? (
                                                            <FontAwesome name="map-marker" size={16} color="#FFA726" />
                                                        ) : isLast ? (
                                                            <FontAwesome5 name="hotel" size={12} color="#fff" />
                                                        ) : index === pickupIndex ? (
                                                            <FontAwesome6 name="person" size={14} color="#fff" />
                                                        ) : isInRoute ? (
                                                            <Text style={{ fontSize: 12, color: '#fff', fontWeight: 'bold' }}>{number}</Text>
                                                        ) : null}
                                                    </View>

                                                    {!isLast && (
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                width: 2,
                                                                backgroundColor: index >= pickupIndex ? '#FFA726' : '#DADADA',
                                                            }}
                                                        />
                                                    )}
                                                </View>

                                                {/* Right Content */}
                                                <View style={{ flex: 1, marginLeft: 7 }}>
                                                    <Text
                                                        style={{
                                                            fontSize: 16,
                                                            fontWeight: 'bold',
                                                            color:
                                                                routeDetails?.route_pickup_point_id === item.pickup_point_id
                                                                    ? '#91062b'
                                                                    : '#222',
                                                            textTransform: 'capitalize',
                                                        }}
                                                    >
                                                        {item.pickup_point}
                                                    </Text>
                                                    <Text style={{ fontSize: 14, color: '#444' }}>
                                                        Distance: {item.destination_distance + ' km' || 'NA'}
                                                    </Text>
                                                    <Text style={{ fontSize: 14, color: '#444' }}>
                                                        Pickup Time: {moment(item.pickup_time, 'HH:mm:ss').format('hh:mm A') || 'NA'}
                                                    </Text>
                                                    {!isLast && (
                                                        <View
                                                            style={{
                                                                width: '100%',
                                                                alignSelf: 'center',
                                                                height: 1.5,
                                                                backgroundColor: '#EAEAEA',
                                                                marginVertical: 14,
                                                            }}
                                                        />
                                                    )}
                                                </View>
                                            </View>
                                        );
                                    }}
                                />
                            </View>
                        </View>
                    }
                    {loading && <ActivityIndicator size={28} style={{ marginTop: 130 }} />}
                </View>
            </ScrollView>
        </View>
    )
}

export default TransportRoutes

const styles = StyleSheet.create({
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: 5
    },
    circle: {
        borderRadius: moderateScale(20),
        backgroundColor: Colors.greyText,
        padding: moderateScale(3),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.3
        // opacity:0.8
    },
    verticalLine: {
        width: 2.5,
        height: 108,
        backgroundColor: Colors.greyText,
        opacity: 0.7
    },
    horizontalLine: {
        height: 2.5,
        width: moderateScale(30),
        marginTop: 10,
        backgroundColor: Colors.greyText,
        flex: 1,
        opacity: 0.7
    },
    stopageCard: {
        // padding: 10,
        borderRadius: 15,
        backgroundColor: Colors.white2,
        elevation: 10,
        flex: 8,
    },
    btn: {
        backgroundColor: Colors.btnBlackBackground,
        // backgroundColor:'#000000',
        paddingHorizontal: moderateScale(25),
        paddingVertical: 10,
        marginTop: 20,
        borderRadius: moderateScale(15),
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '50%',
        alignSelf: 'center'
    },
    dropdown: {
        // borderWidth: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 20,
        // paddingVertical:5,
        width: '100%'
    }
})