import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import BackHeader from '../Components/BackHeader';
import NavigationService from '../Services/Navigation';
import { Colors } from '../Constants/Colors';
import { TextStyles, appStyles } from '../Constants/Fonts';
import TitleHeader from '../Components/TitleHeader';
import { Images } from '../Constants/Images';
import { moderateScale } from '../Constants/PixelRatio';
import { useDispatch, useSelector } from 'react-redux';
import { setVehicleDetails } from '../Redux/reducer/User';
import { useTheme, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// ========= LIVE TRACKING API URLs =========
// const AUTH_URL =
//     'https://esmsv2.scriptlab.in/api/live-location/generate-location-tracking-access-token';
// const FENCE_URL =
//     'https://esmsv2.scriptlab.in/api/live-location/get-fence-list';
// const LIVE_LOCATION_URL = 'https://open.iopgps.com/api/device/location';

const TransportRoutes = () => {
    const navigation = useNavigation();
    const { userData } = useSelector((state) => state.User || { User: {} });
    const USER_ID = String(userData?.student_id || '0');
    const dispatch = useDispatch();
    const { colors } = useTheme();

    const [loading, setLoading] = useState(false);
    const [routeDetails, setRouteDetails] = useState(null); // from deviceDetails
    const [stopages, setStopages] = useState([]);
    const [busLocation, setBusLocation] = useState(null);
    const [nearestStopId, setNearestStopId] = useState(null);

    // --------- 1. Get auth token ----------
    const getAuthToken = async () => {
        const storedImgBase = await AsyncStorage.getItem('image_base_url');
        const AUTH_URL = `${storedImgBase}api/live-location/generate-location-tracking-access-token`

        const formData = new FormData();
        formData.append('user_id', String(USER_ID)); // must match Postman

        const res = await fetch(AUTH_URL, {
            method: 'POST',
            body: formData,
        });

        const json = await res.json();
        console.log('Auth response', json);

        // shape like: { code: 0, accessToken: '...', expiresIn: 7200000 }
        if (json.code === 0 && json.accessToken) {
            return json.accessToken;
        }

        // or sometimes wrapped: { statusCode: 200, status: true, data:{ accessToken } }
        if (json.statusCode === 200 && json.status && json.data?.accessToken) {
            return json.data.accessToken;
        }

        throw new Error(json.message || 'Unable to get access token');
    };

    // --------- 2. Get fence list (route + stops) ----------
    const getFenceList = async (token) => {
        const storedImgBase = await AsyncStorage.getItem('image_base_url');
        const FENCE_URL = `${storedImgBase}api/live-location/get-fence-list`

        const url = `${FENCE_URL}?accessToken=${token}&user_id=${USER_ID}`;
        const res = await fetch(url);
        const json = await res.json();
        console.log('Fence response', json);

        if (json.statusCode === 200 && json.status) {
            const deviceDetails = json.data.deviceDetails;
            const routList = json.data.routList || [];

            setRouteDetails(deviceDetails);
            if (deviceDetails) {
                dispatch(setVehicleDetails(deviceDetails));
            }

            // map fence list to your stopages structure
            const mappedStops = routList.map(fence => {
                // example: "setting": "87.693296 22.005499 100"
                const [lng, lat, radius] = fence.setting.split(' ');
                return {
                    id: fence.fenceId,
                    pickup_point: fence.fenceName,
                    destination_distance: radius, // using radius as a distance placeholder
                    lat: parseFloat(lat),
                    lng: parseFloat(lng),
                    pickup_time: null, // no time in this API
                    pickup_point_id: fence.fenceId,
                };
            });

            setStopages(mappedStops);

            // then use IMEI to fetch live location
            if (deviceDetails?.imei) {
                await getLiveLocation(token, deviceDetails.imei);
            }
        } else {
            throw new Error(json.message || 'Fence list failed');
        }
    };

    // --------- 3. Get live bus location ----------
    const getLiveLocation = async (token, imei) => {
        const LIVE_LOCATION_URL = 'https://open.iopgps.com/api/device/location';
        const url = `${LIVE_LOCATION_URL}?accessToken=${token}&imei=${imei}`;
        const res = await fetch(url);
        const json = await res.json();
        console.log('Live location response', json);

        if (json.code === 0) {
            setBusLocation({
                lat: parseFloat(json.lat),
                lng: parseFloat(json.lng),
                address: json.address,
                gpsTime: json.gpsTime,
            });
        }
    };

    const loadTransportData = async () => {
        try {
            setLoading(true);
            const token = await getAuthToken();
            await getFenceList(token);
        } catch (e) {
            console.log('Error loading transport data: ', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransportData();
    }, []);

    // ---------- Find nearest stop to bus location ----------
    const distanceInMeters = (lat1, lon1, lat2, lon2) => {
        const toRad = (v) => (v * Math.PI) / 180;
        const R = 6371000; // meters
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        if (!busLocation || !stopages.length) {
            setNearestStopId(null);
            return;
        }

        let bestId = null;
        let bestDist = Infinity;

        stopages.forEach(stop => {
            if (
                typeof stop.lat === 'number' &&
                !Number.isNaN(stop.lat) &&
                typeof stop.lng === 'number' &&
                !Number.isNaN(stop.lng)
            ) {
                const d = distanceInMeters(
                    busLocation.lat,
                    busLocation.lng,
                    stop.lat,
                    stop.lng
                );
                if (d < bestDist) {
                    bestDist = d;
                    bestId = stop.id;
                }
            }
        });

        setNearestStopId(bestId);
    }, [busLocation, stopages]);

    return (
        <View>
            <BackHeader
                title="Transport"
                onBackIconPress={() => {
                    NavigationService.navigate('Home');
                }}
            />
            <ScrollView
                style={{
                    backgroundColor: colors.background,
                    width: '100%',
                }}
            >
                <View style={{ ...appStyles.main, backgroundColor: colors.background }}>
                    <TitleHeader
                        title={'Your Transport Route is here!'}
                        image={Images.transportRoutes}
                        imageStyle={{
                            height: moderateScale(70),
                            width: moderateScale(120),
                        }}
                    />

                    {/* Route / vehicle card */}
                    <View
                        style={{
                            ...appStyles.card,
                            backgroundColor: colors.background,
                            borderColor: colors.lightBlck,
                            borderWidth: 0.5,
                        }}
                    >
                        <View
                            style={{
                                ...appStyles.titleRow,
                                backgroundColor: colors.lightGreen,
                            }}
                        >
                            <Text
                                style={{ ...TextStyles.title2, color: colors.text }}
                                numberOfLines={1}
                            >
                                {routeDetails?.route_title || 'Route Info'}
                            </Text>
                        </View>
                        <View style={{ padding: 15, paddingTop: 10 }}>
                            <View style={styles.titleRow}>
                                <Text style={{ ...TextStyles.keyText, color: colors.text }}>
                                    Vehicle Number
                                </Text>
                                <Text style={{ ...TextStyles.valueText, color: colors.text }}>
                                    {routeDetails?.vehicle_no || 'NA'}
                                </Text>
                            </View>
                            <View style={styles.titleRow}>
                                <Text style={{ ...TextStyles.keyText, color: colors.text }}>
                                    Vehicle Model
                                </Text>
                                <Text style={{ ...TextStyles.valueText, color: colors.text }}>
                                    {routeDetails?.vehicle_model || 'NA'}
                                </Text>
                            </View>
                            <View style={styles.titleRow}>
                                <Text style={{ ...TextStyles.keyText, color: colors.text }}>
                                    Driver Name
                                </Text>
                                <Text style={{ ...TextStyles.valueText, color: colors.text }}>
                                    {routeDetails?.driver_name || 'NA'}
                                </Text>
                            </View>
                            <View style={styles.titleRow}>
                                <Text style={{ ...TextStyles.keyText, color: colors.text }}>
                                    Driver Contact
                                </Text>
                                <Text style={{ ...TextStyles.valueText, color: colors.text }}>
                                    {routeDetails?.driver_contact || 'NA'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* View My location button (unchanged) */}
                    <View
                        style={{
                            ...appStyles.card,
                            paddingVertical: 10,
                            backgroundColor: colors.background,
                            borderColor: colors.lightBlck,
                            borderWidth: 0.5,
                        }}
                    >
                        <TouchableOpacity
                            style={{ ...styles.btn, backgroundColor: colors.text }}
                            onPress={() => navigation.navigate('LocationTrackingByDevice')}
                        >
                            <Text style={{ color: colors.background, fontSize: 17 }}>
                                View Bus Location
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Route stopages */}
                    {stopages.length > 0 && (
                        <View style={{ marginTop: 20 }}>
                            <Text style={{ ...TextStyles.title3, marginVertical: 10 }}>
                                Current Route
                            </Text>

                            <View style={{ marginTop: 10 }}>
                                <FlatList
                                    data={stopages}
                                    keyExtractor={item => item.id.toString()}
                                    scrollEnabled={false}
                                    renderItem={({ item, index }) => {
                                        const isFirst = index === 0;
                                        const isLast = index === stopages.length - 1;

                                        const pickupIndex = stopages.findIndex(
                                            x =>
                                                x.pickup_point_id ===
                                                routeDetails?.route_pickup_point_id,
                                        );
                                        const isInRoute =
                                            pickupIndex !== -1 && index >= pickupIndex;
                                        const number =
                                            isInRoute && !isFirst && !isLast
                                                ? index - pickupIndex + 1
                                                : null;

                                        const pickupTime = item.pickup_time
                                            ? moment(item.pickup_time, 'HH:mm:ss').format('hh:mm A')
                                            : 'NA';

                                        const isBusHere = nearestStopId === item.id;

                                        return (
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'flex-start',
                                                    paddingHorizontal: 15,
                                                }}
                                            >
                                                {/* Left Indicator */}
                                                <View style={{ alignItems: 'center', width: 40 }}>
                                                    <View
                                                        style={{
                                                            height: 26,
                                                            width: 26,
                                                            borderRadius: 13,
                                                            borderWidth: 2,
                                                            borderColor: isBusHere
                                                                ? '#2196F3'
                                                                : isInRoute
                                                                    ? '#FFA726'
                                                                    : '#C5C5C5',
                                                            backgroundColor: isBusHere
                                                                ? '#2196F3'
                                                                : isInRoute
                                                                    ? '#FFA726'
                                                                    : '#fff',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        {isBusHere ? (
                                                            <FontAwesome5
                                                                name="bus"
                                                                size={14}
                                                                color="#fff"
                                                            />
                                                        ) : isFirst ? (
                                                            <FontAwesome
                                                                name="map-marker"
                                                                size={16}
                                                                color="#FFA726"
                                                            />
                                                        ) : isLast ? (
                                                            <FontAwesome5
                                                                name="hotel"
                                                                size={12}
                                                                color="#fff"
                                                            />
                                                        ) : index === pickupIndex ? (
                                                            <FontAwesome6
                                                                name="person"
                                                                size={14}
                                                                color="#fff"
                                                            />
                                                        ) : isInRoute ? (
                                                            <Text
                                                                style={{
                                                                    fontSize: 12,
                                                                    color: '#fff',
                                                                    fontWeight: 'bold',
                                                                }}
                                                            >
                                                                {number}
                                                            </Text>
                                                        ) : null}
                                                    </View>

                                                    {!isLast && (
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                width: 2,
                                                                backgroundColor: isInRoute
                                                                    ? '#FFA726'
                                                                    : '#DADADA',
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
                                                                routeDetails?.route_pickup_point_id ===
                                                                    item.pickup_point_id
                                                                    ? '#91062b'
                                                                    : '#222',
                                                            textTransform: 'capitalize',
                                                        }}
                                                    >
                                                        {item.pickup_point}
                                                    </Text>
                                                    {/* <Text style={{ fontSize: 14, color: '#444' }}>
                                                        Distance: {item.destination_distance || 'NA'} m
                                                    </Text> */}
                                                    <Text style={{ fontSize: 14, color: '#444' }}>
                                                        Pickup Time: {pickupTime}
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
                    )}

                    {loading && (
                        <ActivityIndicator size={28} style={{ marginTop: 130 }} />
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default TransportRoutes;

const styles = StyleSheet.create({
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: 5,
    },
    btn: {
        backgroundColor: Colors.btnBlackBackground,
        paddingHorizontal: moderateScale(25),
        paddingVertical: 10,
        marginTop: 20,
        borderRadius: moderateScale(15),
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '50%',
        alignSelf: 'center',
    },
});