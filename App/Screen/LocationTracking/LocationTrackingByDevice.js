// src/screens/LocationTrackingByDevice.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    StatusBar,
    StyleSheet,
    Text,
    View,
    FlatList,
} from 'react-native';
import MapView, {
    Marker,
    PROVIDER_GOOGLE,
    Circle,
    AnimatedRegion,
} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GOOGLE_MAPS_APIKEY } from '../../../App';

// import BusIcon from '../../Assets/Images/bus.png';
import BusIcon from '../../Assets/Images/cab.png';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const IMEI = '359097370181391';
const REFRESH_MS = 5000;
const AUTH_URL = 'https://esmsv2.scriptlab.in/api/live-location/generate-location-tracking-access-token';
const FENCE_URL = 'https://esmsv2.scriptlab.in/api/live-location/get-fence-list';
const LIVE_URL = 'https://open.iopgps.com/api/device/location';
// ──────────────────────────────────────────────────────────────────────────────

// Helpers: bearing + distance
const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;
// Bearing from (lat1,lng1) -> (lat2,lng2), in degrees [0..360)
function bearingBetween(lat1, lng1, lat2, lng2) {
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δλ = toRad(lng2 - lng1);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
        Math.cos(φ1) * Math.sin(φ2) -
        Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    const deg = (toDeg(θ) + 360) % 360;
    return deg;
}
// Rough haversine distance in meters (for jitter guard)
function haversineMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const LocationTrackingByDevice = () => {
    const insets = useSafeAreaInsets();

    const { userData } = useSelector((state) => state.User || { User: {} });
    const USER_ID = String(userData?.student_id || '0');

    const [token, setToken] = useState(null);
    const tokenRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);
    const [addr, setAddr] = useState(null);
    const [updatedAt, setUpdatedAt] = useState(null);

    const [fences, setFences] = useState([]);
    const mapRef = useRef(null);

    const intervalRef = useRef(null);
    const controllersRef = useRef(new Set()); // AbortController instances

    // Single AnimatedRegion instance to avoid re-mounting marker (blinking)
    const busPositionRef = useRef(
        new AnimatedRegion({
            latitude: 0,
            longitude: 0,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
        })
    );
    const [hasBusPosition, setHasBusPosition] = useState(false);

    // Heading the marker should face (degrees from north)
    const [headingDeg, setHeadingDeg] = useState(0);
    const prevPosRef = useRef(null);

    const region = useMemo(() => {
        if (lat == null || lng == null) return null;
        return { latitude: lat, longitude: lng, latitudeDelta: 0.012, longitudeDelta: 0.012 };
    }, [lat, lng]);

    const fallbackRegion = useMemo(() => {
        if (!fences.length) return null;
        return {
            latitude: fences[0].lat,
            longitude: fences[0].lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        };
    }, [fences]);

    const currentFenceId = useMemo(() => {
        if (lat == null || lng == null || !fences.length) return null;
        let bestId = null;
        let bestDist = Infinity;
        fences.forEach((f) => {
            const dLat = lat - f.lat;
            const dLng = lng - f.lng;
            const dist2 = dLat * dLat + dLng * dLng;
            if (dist2 < bestDist) {
                bestDist = dist2;
                bestId = f.id;
            }
        });
        return bestId;
    }, [lat, lng, fences]);

    const currentIndex = useMemo(
        () => fences.findIndex((f) => f.id === currentFenceId),
        [fences, currentFenceId]
    );

    const startFence = fences[0];
    const endFence = fences[fences.length - 1];

    const waypoints = useMemo(
        () =>
            fences.length > 2
                ? fences.slice(1, -1).map((f) => ({ latitude: f.lat, longitude: f.lng }))
                : [],
        [fences]
    );

    // ─── helpers to manage AbortControllers ─────────────────────────────────────
    const makeController = () => {
        const c = new AbortController();
        controllersRef.current.add(c);
        return c;
    };
    const releaseController = (c) => controllersRef.current.delete(c);
    const abortAll = () => {
        controllersRef.current.forEach((c) => c.abort());
        controllersRef.current.clear();
    };

    const parseFenceSetting = (setting) => {
        if (!setting) return null;
        const parts = setting
            .replace(/,/g, ' ')
            .trim()
            .split(/\s+/)
            .map(Number)
            .filter((n) => !Number.isNaN(n));

        if (parts.length !== 3) return null;
        const [lngVal, latVal, r] = parts; // “87.672553 21.999158 100” -> lng lat radius
        return { lat: latVal, lng: lngVal, radius: r };
    };

    // ─── API calls ──────────────────────────────────────────────────────────────
    const fetchToken = async (signal) => {
        const body = new URLSearchParams();
        body.append('user_id', USER_ID);

        const { data } = await axios.post(AUTH_URL, body.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 15000,
            signal,
        });

        if (!data || data.code !== 0 || !data.accessToken) throw new Error('Auth failed');

        setToken(data.accessToken);
        tokenRef.current = data.accessToken;
        return data.accessToken;
    };

    const fetchFences = async (accessToken, signal) => {
        try {
            const { data } = await axios.get(FENCE_URL, {
                params: { accessToken, user_id: USER_ID },
                timeout: 15000,
                signal,
            });

            const list = (data && data.data && data.data.routList) || [];
            const parsed = list
                .map((f) => {
                    const p = parseFenceSetting(f.setting);
                    return p ? { id: f.fenceId, name: f.fenceName, ...p } : null;
                })
                .filter(Boolean);

            setFences(parsed);
        } catch (e) {
            if (axios.isCancel(e)) return;
            const status = e?.response?.status;
            const body = e?.response?.data ? JSON.stringify(e.response.data) : e?.message;
            setError(`Fence list error${status ? ` (${status})` : ''}: ${body}`);
        }
    };

    const fetchLive = async (accessToken, signal) => {
        try {
            const { data } = await axios.get(LIVE_URL, {
                params: { accessToken, imei: IMEI },
                timeout: 15000,
                headers: { Accept: 'application/json' },
                signal,
            });

            const code = typeof data?.code === 'string' ? Number(data.code) : data?.code;
            if (code !== 0) throw new Error(`Live location failed (code ${code ?? 'unknown'})`);

            const latNum = Number(data?.lat);
            const lngNum = Number(data?.lng);
            if (!isFinite(latNum) || !isFinite(lngNum)) throw new Error(`Bad coordinates: lat=${data?.lat} lng=${data?.lng}`);

            // Compute heading from previous to current (with small movement guard)
            const prev = prevPosRef.current;
            if (prev && Number.isFinite(prev.lat) && Number.isFinite(prev.lng)) {
                const moved = haversineMeters(prev.lat, prev.lng, latNum, lngNum);
                if (moved > 5) { // ignore micro-jitter under ~5m
                    const brg = bearingBetween(prev.lat, prev.lng, latNum, lngNum);
                    setHeadingDeg(brg);
                }
            }
            prevPosRef.current = { lat: latNum, lng: lngNum };

            setLat(latNum);
            setLng(lngNum);
            setAddr(data?.address || null);
            setUpdatedAt(data?.gpsTime || null);

            // smooth bus animation without recreating AnimatedRegion (avoids blinking)
            if (!hasBusPosition) {
                busPositionRef.current.setValue({
                    latitude: latNum,
                    longitude: lngNum,
                    latitudeDelta: 0.012,
                    longitudeDelta: 0.012,
                });
                setHasBusPosition(true);
            } else {
                busPositionRef.current
                    .timing({
                        latitude: latNum,
                        longitude: lngNum,
                        duration: 800,
                        useNativeDriver: false,
                    })
                    .start();
            }
        } catch (e) {
            if (axios.isCancel(e)) return;
            const status = e?.response?.status;
            const body = e?.response?.data ? JSON.stringify(e.response.data) : e?.message;
            setError(`Live location error${status ? ` (${status})` : ''}: ${body}`);
            throw e;
        }
    };

    // ─── Start/stop based on screen focus ───────────────────────────────────────
    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const start = async () => {
                setLoading(true);
                setError(null);

                try {
                    const bootCtrl = makeController();

                    // 1) get token
                    const tk = await fetchToken(bootCtrl.signal);

                    // 2) in parallel: fetch fences + live location (faster first paint)
                    await Promise.all([
                        fetchFences(tk, bootCtrl.signal),
                        fetchLive(tk, bootCtrl.signal),
                    ]);

                    releaseController(bootCtrl);
                } catch (e) {
                    if (!axios.isCancel(e)) {
                        setError(e?.message || 'Initialization failed');
                    }
                } finally {
                    if (isActive) setLoading(false);
                }

                // periodic refresh (live only)
                intervalRef.current = setInterval(async () => {
                    try {
                        const loopCtrl = makeController();
                        const tk = tokenRef.current;
                        if (!tk) {
                            releaseController(loopCtrl);
                            return;
                        }
                        await fetchLive(tk, loopCtrl.signal);
                        releaseController(loopCtrl);
                    } catch (e) {
                        if (!axios.isCancel(e)) {
                            setError(e?.message || 'Refresh failed');
                        }
                    }
                }, REFRESH_MS);
            };

            start();

            return () => {
                isActive = false;
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                abortAll();
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [USER_ID, IMEI])
    );

    const mapInitial = region || fallbackRegion;

    // ─── list item for stops ────────────────────────────────────────────────────
    const renderStop = ({ item, index }) => {
        const isCurrent = currentFenceId === item.id;
        const isPast = currentIndex !== -1 && index < currentIndex;
        const isFuture = currentIndex !== -1 && index > currentIndex;

        return (
            <View style={styles.stopRow}>
                {/* timeline column */}
                <View style={styles.timelineCol}>
                    {index !== 0 && (
                        <View
                            style={[
                                styles.timelineLine,
                                isPast && styles.timelineLinePast,
                                isFuture && styles.timelineLineFuture,
                            ]}
                        />
                    )}

                    {isCurrent ? (
                        <View style={styles.timelineBusCircle}>
                            <Text style={styles.timelineBusIcon}>🚌</Text>
                        </View>
                    ) : (
                        <View
                            style={[
                                styles.timelineDot,
                                isPast && styles.timelineDotPast,
                                isFuture && styles.timelineDotFuture,
                            ]}
                        />
                    )}

                    {index !== fences.length - 1 && (
                        <View
                            style={[
                                styles.timelineLine,
                                isPast && styles.timelineLinePast,
                                isFuture && styles.timelineLineFuture,
                            ]}
                        />
                    )}
                </View>

                {/* stop info */}
                <View style={styles.stopCard}>
                    <View style={styles.stopCardHeader}>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.stopName,
                                isCurrent && styles.stopNameCurrent,
                                isPast && styles.stopNamePast,
                            ]}
                        >
                            {item.name}
                        </Text>

                        {isCurrent && (
                            <View style={styles.chipCurrent}>
                                <Text style={styles.chipCurrentText}>Live</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.stopMeta}>
                        Stop {index + 1} of {fences.length}
                    </Text>
                </View>
            </View>
        );
    };

    const startName = startFence?.name || 'Start';
    const endName = endFence?.name || 'Destination';

    return (
        <View
            style={[
                styles.safe,
                { paddingTop: insets.top, paddingBottom: insets.bottom },
            ]}
        >
            <StatusBar barStyle="dark-content" />

            <View style={styles.body}>
                {/* Top 50% – Map */}
                <View style={styles.mapContainer}>
                    {mapInitial ? (
                        <MapView
                            ref={(r) => (mapRef.current = r)}
                            style={styles.map}
                            initialRegion={mapInitial}
                            provider={PROVIDER_GOOGLE}
                        >
                            {/* Road-snapped route */}
                            {startFence && endFence && GOOGLE_MAPS_APIKEY && (
                                <MapViewDirections
                                    origin={{ latitude: startFence.lat, longitude: startFence.lng }}
                                    destination={{ latitude: endFence.lat, longitude: endFence.lng }}
                                    waypoints={waypoints}
                                    apikey={GOOGLE_MAPS_APIKEY}
                                    strokeWidth={3}
                                    strokeColor="#111827"
                                    lineCap="round"
                                    lineJoin="round"
                                    optimizeWaypoints={false}
                                />
                            )}

                            {/* Start pin */}
                            {startFence && (
                                <Marker
                                    coordinate={{ latitude: startFence.lat, longitude: startFence.lng }}
                                    anchor={{ x: 0.5, y: 1 }}
                                >
                                    <View style={styles.pinWrapper}>
                                        <View style={[styles.pinCircle, styles.pinCircleStart]}>
                                            <Text style={styles.pinCircleText}>Start</Text>
                                        </View>
                                        <View style={[styles.pinPointer, styles.pinPointerStart]} />
                                    </View>
                                </Marker>
                            )}

                            {/* End pin */}
                            {endFence && (
                                <Marker
                                    coordinate={{ latitude: endFence.lat, longitude: endFence.lng }}
                                    anchor={{ x: 0.5, y: 1 }}
                                >
                                    <View style={styles.pinWrapper}>
                                        <View style={[styles.pinCircle, styles.pinCircleEnd]}>
                                            <Text style={styles.pinCircleText}>End</Text>
                                        </View>
                                        <View style={[styles.pinPointer, styles.pinPointerEnd]} />
                                    </View>
                                </Marker>
                            )}

                            {/* Live bus marker (animated + heading-based rotation, non-blinking) */}
                            {hasBusPosition && (
                                <Marker.Animated
                                    coordinate={busPositionRef.current}
                                    anchor={{ x: 0.5, y: 0.5 }}
                                    flat
                                    rotation={headingDeg}     // 👈 faces movement direction
                                    image={BusIcon}
                                    tracksViewChanges={false}
                                />
                            )}

                            {/* Geofence circles */}
                            {fences.map((f) => (
                                <Circle
                                    key={`fence-${f.id}`}
                                    center={{ latitude: f.lat, longitude: f.lng }}
                                    radius={f.radius}
                                    strokeWidth={2}
                                    strokeColor="rgba(236, 8, 8, 0.92)"
                                    fillColor="rgba(204, 70, 55, 0.1)"
                                    style={{ zIndex: -1 }}
                                />
                            ))}
                        </MapView>
                    ) : (
                        <View style={styles.loading}>
                            {loading ? (
                                <>
                                    <ActivityIndicator size="large" />
                                    <Text style={styles.loadingText}>Fetching live location…</Text>
                                </>
                            ) : (
                                <Text style={styles.loadingText}>Location not available.</Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Bottom 50% – route list */}
                <View style={styles.listContainer}>
                    <View style={styles.sheetHandle} />

                    <View style={styles.routeHeader}>
                        <View style={styles.routeTitleRow}>
                            <Text style={styles.routeNumber}>Route</Text>
                            <View style={styles.routeBadge}>
                                <Text style={styles.routeBadgeText}>{fences.length || 0} Stops</Text>
                            </View>
                        </View>

                        <Text style={styles.routeDirection} numberOfLines={1}>
                            {startName}  ➜  {endName}
                        </Text>
                    </View>

                    <FlatList
                        data={fences}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderStop}
                        contentContainerStyle={styles.stopListContent}
                        showsVerticalScrollIndicator={false}
                    />

                    {!!error && <Text style={styles.error}>{error}</Text>}
                </View>
            </View>
        </View>
    );
};

export default LocationTrackingByDevice;

// ─── styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },

    body: { flex: 1 },

    mapContainer: { flex: 1.2, backgroundColor: '#e5e7eb', overflow: 'hidden' },
    map: { flex: 1 },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        gap: 10,
    },
    loadingText: { color: '#4b5563' },

    // bottom sheet
    listContainer: {
        flex: 0.9,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
        elevation: 8,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#d1d5db',
        alignSelf: 'center',
        marginBottom: 8,
    },

    routeHeader: { marginBottom: 8 },
    routeTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    routeNumber: { color: '#111827', fontWeight: '700', fontSize: 16 },
    routeBadge: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    routeBadgeText: { color: '#1d4ed8', fontSize: 12, fontWeight: '600' },
    routeDirection: { color: '#374151', marginTop: 4, fontSize: 13, fontWeight: '500' },

    stopListContent: { paddingTop: 6, paddingBottom: 4 },

    // timeline column (continuous lines)
    stopRow: {
        flexDirection: 'row',
    },
    timelineCol: { width: 32, alignItems: 'center' },
    timelineLine: { width: 2, flex: 1, backgroundColor: '#e5e7eb' },
    timelineLinePast: { backgroundColor: '#22c55e' },
    timelineLineFuture: { backgroundColor: '#d1d5db' },

    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#d1d5db',
        backgroundColor: '#ffffff',
    },
    timelineDotPast: { borderColor: '#22c55e', backgroundColor: '#bbf7d0' },
    timelineDotFuture: { borderColor: '#d1d5db' },

    // bus icon in timeline for current stop
    timelineBusCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fef3c7',
        borderWidth: 1,
        borderColor: '#facc15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timelineBusIcon: {
        fontSize: 14,
    },

    // cards
    stopCard: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginVertical: 6,
    },
    stopCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stopName: { color: '#111827', fontSize: 13, fontWeight: '500' },
    stopNameCurrent: { color: '#b45309', fontWeight: '700' },
    stopNamePast: { color: '#6b7280' },

    stopMeta: { color: '#9ca3af', fontSize: 11, marginTop: 4 },

    chipCurrent: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#facc15',
    },
    chipCurrentText: { color: '#92400e', fontSize: 10, fontWeight: '700' },

    error: { color: '#b91c1c', marginTop: 4, fontSize: 12 },

    // start/end pins
    pinWrapper: {
        alignItems: 'center',
    },
    pinCircle: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pinCircleStart: {
        backgroundColor: '#22c55e',
    },
    pinCircleEnd: {
        backgroundColor: '#ef4444',
    },
    pinCircleText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 12,
    },
    pinPointer: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
    pinPointerStart: {
        borderTopColor: '#22c55e',
    },
    pinPointerEnd: {
        borderTopColor: '#ef4444',
    },
});