import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    StatusBar,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Animated,
    Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Colors } from '../../Constants/Colors';
import { textSize } from '../../Constants/PixelRatio';
import { Images } from '../../Constants/Images';
import UseApi from '../../ApiConfig';
import Toast from 'react-native-simple-toast';
import { useDispatch, useSelector } from 'react-redux';
import { setDefultSetting } from '../../Redux/reducer/User';

const SchoolCodeScreen = () => {

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();
    const [schoolCode, setSchoolCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState('');
    const { Request } = UseApi();
    const dispatch = useDispatch();
    const { defultSetting } = useSelector(state => state.User);

    // gentle logo float
    const float = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(float, { toValue: -6, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(float, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            ]),
        ).start();
    }, [float]);

    const canSubmit = useMemo(() => schoolCode.trim().length > 0 && !loading, [schoolCode, loading]);

    const fetchData = async (baseUrl) => {
        try {
            setLoading(true);

            const resp = await fetch(`${baseUrl}get-settings`, {
                method: 'GET',
                headers: {
                    'X-API-KEY': '123123',
                    'Accept': 'application/json',
                },
            });

            const text = await resp.text();
            let data = null;
            try { data = text ? JSON.parse(text) : null; } catch (e) {
                console.log('Settings JSON parse error:', e, text);
            }

            if (data?.statusCode === 200 && data.status) {
                console.log("Settings fetched successfully:", data);
                dispatch(setDefultSetting(data));
            } else {
                const msg = data?.message || 'Failed to load settings.';
                Toast.show(msg);
            }
        } catch (err) {
            console.log('API Error:', err);
            Toast.show('Unable to load settings');
        } finally {
            setLoading(false);
        }
    };

    const verifySchoolCode = async () => {
        const value = schoolCode.trim().toUpperCase();
        setErrorText('');
        if (!value) {
            Toast.show('Please enter school code');
            setErrorText('School code is required.');
            return;
        }

        try {
            setLoading(true);

            const form = new FormData();
            form.append('school_code', value);

            const resp = await fetch('https://www.esms.live/erp-school-list.php', {
                method: 'POST',
                body: form, // don't set Content-Type manually for FormData in RN
            });

            const text = await resp.text();
            let json = null;
            try { json = text ? JSON.parse(text) : null; } catch { }

            if (!resp.ok) {
                console.log('School Code Raw:', text);
                throw new Error(`HTTP ${resp.status}`);
            }

            const ok = json?.success === true || json?.status === true;
            if (!ok || !json?.data?.school_url) {
                const msg = json?.message || 'Invalid School Code';
                setErrorText(msg);
                Toast.show(msg);
                return;
            }

            const data = json.data;
            await AsyncStorage.setItem('school_data', JSON.stringify(data));
            await AsyncStorage.setItem('school_code', value);

            const host = String(data.school_url || '').trim().replace(/\/+$/, '') || 'https://esmsv2.scriptlab.in';
            await AsyncStorage.setItem('api_base_url', `${host}/api/apicontroller/`);
            await AsyncStorage.setItem('image_base_url', `${host}/`);
            const baseUrl = `${host}/api/apicontroller/`;
            await fetchData(baseUrl);

            Toast.show('School verified');
            navigation.replace('Login');
        } catch (err) {
            console.error('School Code Error:', err);
            setErrorText('Something went wrong. Please try again.');
            Toast.show('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const getSchoolCode = async () => {
        const value = await AsyncStorage.getItem('school_code');
        setSchoolCode(value || '');
        // console.log("School code from storage:",value, !!value);
    };

    useEffect(() => {
        if (isFocused) {
            getSchoolCode();
        }
    }, [isFocused]);

    return (
        <SafeAreaView style={[styles.safe, { paddingBottom: insets.bottom }]}>
            <StatusBar backgroundColor={Colors.black} barStyle="light-content" />

            {/* Background gradient (unchanged) */}
            <LinearGradient
                colors={['#FFF7F0', '#FDF2E9', '#FFFFFF']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative blobs (unchanged) */}
            <View style={[styles.blob, styles.blobTopLeft]} />
            <View style={[styles.blob, styles.blobBottomRight]} />
            <View style={[styles.dots]} pointerEvents="none" />

            {/* Curved gradient header (unchanged) */}
            <LinearGradient
                colors={[Colors.Green1, Colors.Green1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <LinearGradient
                    colors={['rgba(255,255,255,0.35)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0.8 }}
                    style={StyleSheet.absoluteFill}
                />
                <Animated.View style={{ transform: [{ translateY: float }], alignItems: 'center' }}>
                    <Image source={Images.logoImage} style={styles.headerLogo} />
                </Animated.View>
                <Text style={styles.headerTitle}>Welcome</Text>
                <Text style={styles.headerSubtitle}>Enter your school code to continue</Text>
            </LinearGradient>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* BODY -> centered vertically */}
                <View style={styles.body}>
                    {/* CARD -> reverted to the earlier solid design and centered */}
                    <View style={styles.card}>
                        <Text style={styles.label}>School Code</Text>
                        <TextInput
                            value={schoolCode}
                            onChangeText={(t) => {
                                setErrorText('');
                                setSchoolCode(t.toUpperCase());
                            }}
                            placeholder="e.g. ABC123"
                            placeholderTextColor="#9BA0A6"
                            style={[styles.input, !!errorText && styles.inputError]}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            returnKeyType="done"
                            onSubmitEditing={verifySchoolCode}
                            editable={!loading}
                            accessibilityLabel="School code"
                            maxLength={32}
                        />

                        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

                        <TouchableOpacity
                            onPress={verifySchoolCode}
                            style={[styles.button, !canSubmit && styles.buttonDisabled]}
                            activeOpacity={0.9}
                            disabled={!canSubmit}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color={Colors.btnText || '#fff'} />
                            ) : (
                                <Text style={styles.buttonText}>Continue</Text>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.helper}>
                            Don’t know it? Ask your administrator or check your welcome email.
                        </Text>
                    </View>

                    <Text style={styles.footerText}>
                        Need help? <Text style={styles.footerLink}>Contact support</Text>
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SchoolCodeScreen;

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.white,
    },

    /* HEADER (unchanged) */
    header: {
        height: 210,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 12,
        justifyContent: 'flex-end',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    headerLogo: {
        width: 160,
        height: 64,
        resizeMode: 'contain',
        marginBottom: 8,
        alignSelf: 'center',
    },
    headerTitle: {
        textAlign: 'center',
        color: '#ffffff',
        fontWeight: '800',
        fontSize: textSize(20),
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
        marginBottom: 16,
        fontSize: textSize(12),
    },

    /* BODY -> center content */
    body: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
        // justifyContent: 'center', // <— centers vertically
        marginTop: 140
    },

    /* CARD -> previous solid style */
    card: {
        width: '100%',
        backgroundColor: Colors.inputBackground || '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },

    label: {
        fontSize: textSize(12),
        color: '#6B7280',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        width: '100%',
        height: 52,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: textSize(15),
        backgroundColor: '#FFFFFF',
        color: Colors.black,
        borderColor: '#E5E7EB',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        color: '#EF4444',
        marginTop: 8,
        marginBottom: 4,
        fontSize: textSize(12),
    },

    button: {
        marginTop: 14,
        backgroundColor: Colors.Green1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: Colors.btnText,
        fontSize: textSize(16),
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    helper: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: textSize(12),
        marginTop: 12,
    },

    footerText: {
        marginTop: 18,
        color: '#6B7280',
        fontSize: textSize(12),
    },
    footerLink: {
        color: Colors.Green1,
        fontWeight: '700',
    },

    /* BACKGROUND DECOR (unchanged) */
    blob: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        opacity: 0.25,
    },
    blobTopLeft: {
        top: 70,
        left: -40,
        backgroundColor: '#FFD6B8',
    },
    blobBottomRight: {
        bottom: -70,
        right: -70,
        backgroundColor: '#FFD6B8',
    },
    dots: {
        position: 'absolute',
        right: 16,
        top: 230,
        width: 90,
        height: 90,
        backgroundColor: 'transparent',
    },
});
