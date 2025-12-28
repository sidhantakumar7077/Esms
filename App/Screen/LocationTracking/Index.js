import React, { useEffect, useState } from "react";
import {
    View,
    PermissionsAndroid,
    Platform,
    StyleSheet,
    Text,
    ActivityIndicator,
    Button,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import MapViewDirections from "react-native-maps-directions";
import haversine from "haversine";
import { GOOGLE_MAPS_APIKEY } from "../../../App";

export default function LocationTracking() {

    const [distanceToDestination, setDistanceToDestination] = useState(null);
    const [distanceToNextStop, setDistanceToNextStop] = useState(null);
    const [nextStop, setNextStop] = useState(null);
    const [hasTried, setHasTried] = useState(false);

    // Stops between your current location and destination
    const stops = [
        { latitude: 20.294509, longitude: 85.816624, title: "Jaydev Vihar" },
        { latitude: 20.327, longitude: 85.8089, title: "Niladri Vihar" },
    ];

    const initialLocation = {
        latitude: 20.289898,
        longitude: 85.810219,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };
    
    const [location, setLocation] = useState(initialLocation);

    const destination = {
        latitude: 20.368824,
        longitude: 85.838267,
        title: "Patia(Destination)",
    };

    const requestLocationPermission = async () => {
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    const getNearestStop = (currentLocation) => {
        let nearest = null;
        let minDistance = Number.MAX_VALUE;
        for (const stop of stops) {
            const distance = haversine(currentLocation, stop, { unit: "km" });
            if (distance < minDistance) {
                minDistance = distance;
                nearest = stop;
            }
        }
        return nearest;
    };

    const updateDistances = (currentLocation) => {
        const toDest = haversine(currentLocation, destination, { unit: "km" });
        const nearest = getNearestStop(currentLocation);
        const toNext = haversine(currentLocation, nearest, { unit: "km" });

        setDistanceToDestination(toDest.toFixed(2));
        setDistanceToNextStop(toNext.toFixed(2));
        setNextStop(nearest);
    };

    const initLocationTracking = async () => {
        setHasTried(false);
        const granted = await requestLocationPermission();
        if (!granted) {
            setHasTried(true);
            return;
        }

        // First fix
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const current = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };
                setLocation(current);
                updateDistances(current);
                setHasTried(true);
            },
            (error) => {
                console.warn("GPS error:", error.message);
                setHasTried(true);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0, forceRequestLocation: true, showLocationDialog: true }
        );

        // Watch for location changes
        Geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const current = {
                    latitude,
                    longitude,
                    // latitudeDelta: 0.01,
                    // longitudeDelta: 0.01,
                    movingAngle: position.coords?.heading
                };
                setLocation(current);
                updateDistances(current);
            },
            (error) => {
                console.warn("watchPosition error:", error.message);
            },
            {
                enableHighAccuracy: true,
                distanceFilter: 10,
                interval: 5000,
                fastestInterval: 2000,
            }
        );
    };

    useEffect(() => {
        initLocationTracking();
    }, []);

    return (
        <View style={styles.container}>
            {location && hasTried ? (
                <>
                    {location?.latitude && location?.longitude && (
                        <MapView
                            style={styles.map}
                            region={location}
                            showsUserLocation={true}
                        >
                            <Marker coordinate={location} title="You are here" pinColor="blue" />

                            {stops.map((stop, index) => (
                                <Marker
                                    key={index}
                                    coordinate={stop}
                                    title={stop.title}
                                    pinColor="orange"
                                />
                            ))}

                            <Marker
                                coordinate={destination}
                                title={destination.title}
                                pinColor="green"
                            />

                            <MapViewDirections
                                origin={location}
                                destination={destination}
                                waypoints={stops}
                                apikey={GOOGLE_MAPS_APIKEY}
                                strokeWidth={4}
                                strokeColor="blue"
                            />
                        </MapView>
                    )}

                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>🧭 Route Info</Text>
                        <Text>📍 Distance to Destination: {distanceToDestination} km</Text>
                        <Text>🛑 Next Stop: {nextStop?.title || "N/A"}</Text>
                        <Text>↪ Distance to Next Stop: {distanceToNextStop} km</Text>
                    </View>
                </>
            ) : hasTried ? (
                <View style={styles.loadingContainer}>
                    <Text>⚠️ Could not fetch GPS. Using fallback location.</Text>
                    <Button title="Retry" onPress={initLocationTracking} />
                </View>
            ) : (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="blue" />
                    <Text>Fetching your location...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { ...StyleSheet.absoluteFillObject },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    infoCard: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
    },
});