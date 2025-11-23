import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    TouchableWithoutFeedback,
    TouchableOpacity,
    StatusBar,
    BackHandler,
} from 'react-native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Orientation from 'react-native-orientation-locker';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = (width * 9) / 16;

const getYoutubeId = url => {
    if (!url) return null;
    try {
        const reg =
            /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;
        const match = url.match(reg);
        return match ? match[1] : null;
    } catch (e) {
        return null;
    }
};

const VideoPlayer = ({ route, navigation }) => {
    const { video } = route.params || {};
    const videoUrl = video?.video_link;
    const videoType = video?.video_type?.toString?.() || '1';
    const isYoutube = videoType === '2';
    const youtubeId = isYoutube ? getYoutubeId(videoUrl) : null;

    const inlineVideoRef = useRef(null);
    const fullscreenVideoRef = useRef(null);

    const [buffering, setBuffering] = useState(false);
    const [paused, setPaused] = useState(false);
    const [muted, setMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [error, setError] = useState(null);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const hideControlsTimeoutRef = useRef(null);

    const formatTime = secs => {
        if (!secs || isNaN(secs)) return '00:00';
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        return (
            (minutes < 10 ? '0' : '') +
            minutes +
            ':' +
            (seconds < 10 ? '0' : '') +
            seconds
        );
    };

    const startHideControlsTimer = () => {
        if (hideControlsTimeoutRef.current) {
            clearTimeout(hideControlsTimeoutRef.current);
        }
        hideControlsTimeoutRef.current = setTimeout(() => {
            setControlsVisible(false);
        }, 3000);
    };

    const showControls = () => {
        setControlsVisible(true);
        startHideControlsTimer();
    };

    const toggleControls = () => {
        setControlsVisible(prev => {
            const next = !prev;
            if (hideControlsTimeoutRef.current) {
                clearTimeout(hideControlsTimeoutRef.current);
                hideControlsTimeoutRef.current = null;
            }
            if (next) startHideControlsTimer();
            return next;
        });
    };

    const togglePlayPause = () => {
        setPaused(prev => !prev);
        showControls();
    };

    const toggleMute = () => {
        setMuted(prev => !prev);
        showControls();
    };

    const handleProgress = progress => {
        setCurrentTime(progress.currentTime);
    };

    const handleInlineLoad = meta => {
        setDuration(meta.duration);
        setBuffering(false);
    };

    const handleFullscreenLoad = meta => {
        setDuration(meta.duration);
        setBuffering(false);
        if (currentTime > 0 && fullscreenVideoRef.current) {
            fullscreenVideoRef.current.seek(currentTime);
        }
    };

    const handleLoadStart = () => {
        setBuffering(true);
    };

    const handleBuffer = ({ isBuffering }) => {
        setBuffering(isBuffering);
    };

    const handleSeek = value => {
        if (inlineVideoRef.current) {
            inlineVideoRef.current.seek(value);
        }
        if (fullscreenVideoRef.current) {
            fullscreenVideoRef.current.seek(value);
        }
        setCurrentTime(value);
        showControls();
    };

    const handleSkip = seconds => {
        const newTime = Math.min(Math.max(currentTime + seconds, 0), duration);
        handleSeek(newTime);
    };

    const lockToLandscapeSafe = () => {
        if (Orientation && typeof Orientation.lockToLandscape === 'function') {
            Orientation.lockToLandscape();
        }
    };

    const lockToPortraitSafe = () => {
        if (Orientation && typeof Orientation.lockToPortrait === 'function') {
            Orientation.lockToPortrait();
        }
    };

    const enterFullscreen = () => {
        setIsFullscreen(true);
        lockToLandscapeSafe();
        StatusBar.setHidden(true);
        showControls();
    };

    const exitFullscreen = () => {
        setIsFullscreen(false);
        lockToPortraitSafe();
        StatusBar.setHidden(false);
        showControls();
    };

    const handleFullscreenToggle = () => {
        if (isFullscreen) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    };

    useEffect(() => {
        const onBackPress = () => {
            if (isFullscreen) {
                exitFullscreen();
                return true;
            }
            return false;
        };

        const subscription = BackHandler.addEventListener(
            'hardwareBackPress',
            onBackPress,
        );

        return () => {
            subscription.remove();
        };
    }, [isFullscreen]);

    useEffect(() => {
        showControls();
        return () => {
            if (hideControlsTimeoutRef.current) {
                clearTimeout(hideControlsTimeoutRef.current);
            }
            StatusBar.setHidden(false);
            if (
                Orientation &&
                typeof Orientation.unlockAllOrientations === 'function'
            ) {
                Orientation.unlockAllOrientations();
            }
        };
    }, []);

    const renderControls = () => (
        <View style={styles.controlsOverlay}>
            <View style={styles.centerControls}>
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => handleSkip(-10)}
                    activeOpacity={0.7}
                >
                    <Icon name="replay-10" size={30} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.playPauseButton}
                    onPress={togglePlayPause}
                    activeOpacity={0.9}
                >
                    <Icon
                        name={paused ? 'play-arrow' : 'pause'}
                        size={34}
                        color="#2bb36a"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => handleSkip(10)}
                    activeOpacity={0.7}
                >
                    <Icon name="forward-10" size={30} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.bottomControls}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration || 0}
                    minimumTrackTintColor="#2bb36a"
                    maximumTrackTintColor="#ffffff70"
                    thumbTintColor="#2bb36a"
                    value={currentTime}
                    onSlidingComplete={handleSeek}
                />

                <Text style={styles.timeText}>{formatTime(duration)}</Text>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={toggleMute}
                    activeOpacity={0.7}
                >
                    <Icon
                        name={muted ? 'volume-off' : 'volume-up'}
                        size={22}
                        color="#fff"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={handleFullscreenToggle}
                    activeOpacity={0.7}
                >
                    <Icon
                        name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
                        size={22}
                        color="#fff"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    const onYoutubeStateChange = useCallback(state => {
        if (state === 'ended') {
            setPaused(true);
        } else if (state === 'playing') {
            setPaused(false);
        }
    }, []);

    return (
        <View style={styles.root}>
            <ScrollView
                style={styles.container}
                scrollEnabled={!isFullscreen}
            >
                {/* 🔹 all main content lives inside ONE gradient block */}
                <LinearGradient
                    colors={['#1a3b32', '#edfaf0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.7, y: 1 }}
                >
                    <View style={styles.pageContent}>
                        {/* HEADER WITH BACK BUTTON */}
                        <View style={styles.headerBar}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Icon name="arrow-back" size={24} color="#f9fafb" />
                            </TouchableOpacity>

                            <View style={{ flex: 1 }}>
                                <Text style={styles.screenTitle} numberOfLines={1}>
                                    {video?.title || 'Video Tutorial'}
                                </Text>
                                <Text style={styles.screenSubtitle}>
                                    Learn with interactive lessons
                                </Text>
                            </View>
                        </View>

                        {/* VIDEO */}
                        <View style={styles.videoCardWrapper}>
                            <TouchableWithoutFeedback
                                onPress={!isYoutube ? toggleControls : undefined}
                            >
                                <View style={styles.videoWrapper}>
                                    {videoUrl ? (
                                        isYoutube ? (
                                            youtubeId ? (
                                                <YoutubePlayer
                                                    height={VIDEO_HEIGHT}
                                                    width={width - 32}
                                                    videoId={youtubeId}
                                                    play={!paused}
                                                    onChangeState={onYoutubeStateChange}
                                                />
                                            ) : (
                                                <View style={[styles.video, styles.noVideo]}>
                                                    <Text style={{ color: '#fff' }}>
                                                        Invalid YouTube URL
                                                    </Text>
                                                </View>
                                            )
                                        ) : (
                                            <>
                                                <Video
                                                    ref={inlineVideoRef}
                                                    source={{ uri: videoUrl }}
                                                    style={styles.video}
                                                    resizeMode="contain"
                                                    paused={paused || isFullscreen}
                                                    muted={muted}
                                                    onLoadStart={handleLoadStart}
                                                    onBuffer={handleBuffer}
                                                    onLoad={handleInlineLoad}
                                                    onProgress={handleProgress}
                                                    onEnd={() => {
                                                        setPaused(true);
                                                        handleSeek(0);
                                                    }}
                                                    onError={e => {
                                                        console.log('Video error', e);
                                                        setError('Unable to play this video.');
                                                        setBuffering(false);
                                                    }}
                                                />

                                                {buffering && !isFullscreen && (
                                                    <View style={styles.bufferOverlay}>
                                                        <ActivityIndicator size="large" color="#fff" />
                                                    </View>
                                                )}

                                                {controlsVisible &&
                                                    !isFullscreen &&
                                                    renderControls()}
                                            </>
                                        )
                                    ) : (
                                        <View style={[styles.video, styles.noVideo]}>
                                            <Text style={{ color: '#fff' }}>No video URL</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        {/* INFO SECTION – now directly attached under video */}
                        <View style={styles.infoCard}>
                            <View style={styles.metaRow}>
                                <View style={styles.badge}>
                                    <Icon
                                        name={
                                            isYoutube ? 'ondemand-video' : 'play-circle-filled'
                                        }
                                        size={16}
                                        color="#fff"
                                    />
                                    <Text style={styles.badgeText}>
                                        {isYoutube ? 'YouTube video' : 'Offline video'}
                                    </Text>
                                </View>

                                {video?.date ? (
                                    <View style={styles.dateChip}>
                                        <Icon
                                            name="event"
                                            size={14}
                                            color="#64748b"
                                            style={{ marginRight: 4 }}
                                        />
                                        <Text style={styles.dateText}>{video.date}</Text>
                                    </View>
                                ) : null}
                            </View>

                            <Text style={styles.title}>
                                {video?.title || 'Untitled video'}
                            </Text>

                            {video?.description ? (
                            <>
                                <Text style={styles.sectionHeader}>Description</Text>
                                <Text style={styles.description}>
                                    {video.description}
                                    {/* Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. */}
                                </Text>
                            </>
                            ) : null}
                        </View>

                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </View>
                </LinearGradient>
            </ScrollView>

            {/* FULLSCREEN OVERLAY (only for normal video) */}
            {!isYoutube && isFullscreen && (
                <View style={styles.fullscreenOverlay}>
                    <TouchableWithoutFeedback onPress={toggleControls}>
                        <View style={styles.fullscreenInner}>
                            <Video
                                ref={fullscreenVideoRef}
                                source={{ uri: videoUrl }}
                                style={styles.fullscreenVideo}
                                resizeMode="cover"
                                paused={paused}
                                muted={muted}
                                onLoadStart={handleLoadStart}
                                onBuffer={handleBuffer}
                                onLoad={handleFullscreenLoad}
                                onProgress={handleProgress}
                                onEnd={() => {
                                    setPaused(true);
                                    handleSeek(0);
                                    exitFullscreen();
                                }}
                                onError={e => {
                                    console.log('Video error', e);
                                    setError('Unable to play this video.');
                                    setBuffering(false);
                                }}
                            />

                            {buffering && (
                                <View style={styles.bufferOverlay}>
                                    <ActivityIndicator size="large" color="#fff" />
                                </View>
                            )}

                            {controlsVisible && renderControls()}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#edfaf0', // match gradient bottom
    },
    container: {
        flex: 1,
    },
    pageContent: {
        paddingBottom: 24,
    },

    /** HEADER **/
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 10,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
        borderRadius: 999,
    },
    screenTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#f9fafb',
    },
    screenSubtitle: {
        marginTop: 2,
        fontSize: 12,
        color: '#e2f7ea',
    },

    /** INLINE VIDEO **/
    videoCardWrapper: {
        paddingHorizontal: 16,
        paddingTop: 4,
    },
    videoWrapper: {
        width: '100%',
        height: VIDEO_HEIGHT,
        // borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        // shadowColor: '#000',
        // shadowOpacity: 0.25,
        // shadowOffset: { width: 0, height: 8 },
        // shadowRadius: 14,
        // elevation: 8,
    },
    video: {
        width: '100%',
        height: '100%',
    },

    /** FULLSCREEN OVERLAY **/
    fullscreenOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 999,
    },
    fullscreenInner: {
        width: '100%',
        height: '100%',
    },
    fullscreenVideo: {
        width: '100%',
        height: '100%',
    },

    bufferOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0006',
    },
    noVideo: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    /** CONTROLS **/
    controlsOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    centerControls: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playPauseButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#ffffffee',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
    },
    skipButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#0007',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomControls: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingBottom: 6,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    slider: {
        flex: 1,
        marginHorizontal: 8,
    },
    timeText: {
        color: '#fff',
        fontSize: 11,
        minWidth: 44,
        textAlign: 'center',
    },
    iconButton: {
        marginLeft: 4,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },

    /** INFO CARD (now visually part of same section) **/
    infoCard: {
        marginHorizontal: 16,
        marginTop: 14,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 10,
        elevation: 3,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16a34a',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    badgeText: {
        marginLeft: 6,
        color: '#f9fafb',
        fontSize: 11,
        fontWeight: '600',
    },
    dateChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#64748b',
    },
    sectionHeader: {
        marginTop: 14,
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    description: {
        marginTop: 6,
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
    },
    errorText: {
        marginTop: 8,
        paddingHorizontal: 16,
        paddingBottom: 12,
        color: '#c0392b',
    },
});

export default VideoPlayer;