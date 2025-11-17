import React, { useState, useRef, useEffect } from 'react';
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

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIDEO_HEIGHT = (width * 9) / 16;

const VideoPlayer = ({ route }) => {

    const { video } = route.params || {};
    const videoUrl = video?.video_link;

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

    // Tap video: show/hide controls
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

        // Seek to same position we had in inline mode
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
        // Seek both players to keep them in sync
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

    // 👇 HANDLE ANDROID BACK BUTTON
    useEffect(() => {
        const onBackPress = () => {
            if (isFullscreen) {
                // If we are in fullscreen, exit fullscreen instead of leaving the screen
                exitFullscreen();
                return true; // prevent default back behaviour
            }
            return false; // not fullscreen -> let navigation handle back
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
            {/* Center controls */}
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
                    activeOpacity={0.8}
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

            {/* Bottom bar */}
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

                {/* Mute */}
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

                {/* Fullscreen */}
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

    return (
        <View style={styles.root}>
            {/* normal screen content */}
            <ScrollView
                style={styles.container}
                scrollEnabled={!isFullscreen}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <LinearGradient
                    colors={['#2bb36a', '#edfaf0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                >
                    <View style={styles.videoCardWrapper}>
                        <TouchableWithoutFeedback onPress={toggleControls}>
                            <View style={styles.videoWrapper}>
                                {videoUrl ? (
                                    <>
                                        <Video
                                            ref={inlineVideoRef}
                                            source={{ uri: videoUrl }}
                                            style={styles.video}
                                            resizeMode="contain"
                                            paused={paused || isFullscreen} // pause inline when fullscreen
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

                                        {controlsVisible && !isFullscreen && renderControls()}
                                    </>
                                ) : (
                                    <View style={[styles.video, styles.noVideo]}>
                                        <Text style={{ color: '#fff' }}>No video URL</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </LinearGradient>

                {error && <Text style={styles.errorText}>{error}</Text>}

                {/* Info card */}
                <View style={styles.infoCard}>
                    <Text style={styles.title}>{video?.title || 'Untitled video'}</Text>

                    {video?.date ? <Text style={styles.dateText}>{video.date}</Text> : null}

                    {video?.description ? (
                        <>
                            <Text style={styles.sectionHeader}>Description</Text>
                            <Text style={styles.description}>{video.description}</Text>
                        </>
                    ) : null}
                </View>
            </ScrollView>

            {/* FULLSCREEN OVERLAY */}
            {isFullscreen && (
                <View style={styles.fullscreenOverlay}>
                    <TouchableWithoutFeedback onPress={toggleControls}>
                        <View style={styles.fullscreenInner}>
                            <Video
                                ref={fullscreenVideoRef}
                                source={{ uri: videoUrl }}
                                style={styles.fullscreenVideo}
                                resizeMode="cover" // fill the whole landscape screen
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
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
        backgroundColor: '#edfaf0',
    },

    /** INLINE VIDEO **/
    videoCardWrapper: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
    },
    videoWrapper: {
        width: '100%',
        height: VIDEO_HEIGHT,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: '#000',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 10,
        elevation: 6,
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

    /** INFO CARD **/
    infoCard: {
        margin: 16,
        marginTop: 8,
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
    },
    dateText: {
        marginTop: 4,
        fontSize: 13,
        color: '#666',
    },
    sectionHeader: {
        marginTop: 16,
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    description: {
        marginTop: 6,
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
    errorText: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        color: '#c0392b',
    },
});

export default VideoPlayer;