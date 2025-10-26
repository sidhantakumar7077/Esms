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
    Dimensions,
    ScrollView,
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
import { useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setDefultSetting } from '../../Redux/reducer/User';

const { height: SCREEN_H } = Dimensions.get('window');

const SchoolCodeScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
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
                Animated.timing(float, { toValue: -8, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
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
                body: form,
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
            // console.error('School Code Error:', err);
            setErrorText('Something went wrong. Please try again.');
            Toast.show('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const getSchoolCode = async () => {
        const value = await AsyncStorage.getItem('school_code');
        setSchoolCode(value || '');
    };

    useEffect(() => {
        if (isFocused) getSchoolCode();
    }, [isFocused]);

    // Proper offset so the input stays above the keyboard
    const keyboardVerticalOffset =
        (Platform.OS === 'ios' ? (insets.top || 0) : 0) + 12;

    // Make hero height a bit smaller on short screens so input has room
    const HERO_HEIGHT = SCREEN_H < 700 ? SCREEN_H * 0.50 : SCREEN_H * 0.54;

    return (
        <SafeAreaView style={[styles.safe]}>
            <StatusBar backgroundColor={Colors.black} barStyle="light-content" />

            {/* Soft background */}
            <LinearGradient
                colors={['#FFF7F0', '#FDF2E9', '#FFFFFF']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={keyboardVerticalOffset}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* HERO / TOP SECTION */}
                    <LinearGradient
                        colors={['#314c61', '#314c61']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.header, { height: HERO_HEIGHT }]}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.35)', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0.8 }}
                            style={StyleSheet.absoluteFill}
                        />

                        {/* Centered floating image */}
                        <Animated.View style={{ transform: [{ translateY: float }] }}>
                            <Image source={Images.schoolCode1} style={styles.heroImage} />
                        </Animated.View>
                        <Text style={styles.heroTitle}>Welcome</Text>
                        <Text style={styles.heroSubtitle}>Enter your school code to continue</Text>
                    </LinearGradient>

                    {/* INPUT AREA */}
                    <View style={[styles.bottomArea, { paddingBottom: Math.max(16, insets.bottom) }]}>
                        <View style={{ marginTop: 8 }}>
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
                        </View>

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
                </ScrollView>
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

    /* HERO */
    header: {
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingHorizontal: 24,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroImage: {
        width: 240,
        height: 240,
        resizeMode: 'contain',
        marginBottom: 12,
    },
    heroTitle: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '800',
        fontSize: textSize(22),
        letterSpacing: 0.3,
    },
    heroSubtitle: {
        textAlign: 'center',
        color: '#fff',
        marginTop: 6,
        fontSize: textSize(13),
    },

    /* BOTTOM AREA */
    bottomArea: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
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
        borderRadius: 14,
        paddingHorizontal: 16,
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
        marginBottom: 2,
        fontSize: textSize(12),
    },

    button: {
        marginTop: 36,
        backgroundColor: '#314c61',
        paddingVertical: 15,
        borderRadius: 14,
        alignItems: 'center',
    },
    buttonDisabled: { opacity: 0.5 },
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
        marginTop: 15,
        marginBottom: 12,
    },
});