// src/screens/VideoList/Index.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Images } from '../../Constants/Images';
import NavigationService from '../../Services/Navigation';

const { width } = Dimensions.get('window');

// ✅ always 2 items per row
const NUM_COLUMNS = 2;
const CARD_MARGIN = 14;
const CARD_WIDTH =
  (width - CARD_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

// const API_URL =
//   'https://esmsv2.scriptlab.in/api/apicontroller/video-tutorial-list';

const X_API_KEY = '123123';

// default thumbnail
const DEFAULT_THUMB = require('../../Assets/Images/video_placeholder1.png');

// helper: check if url is an image
const isImageUrl = url => {
  if (!url || typeof url !== 'string') return false;
  const clean = url.split('?')[0].toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp)$/i.test(clean);
};

const Index = ({ navigation }) => {

  const { userData } = useSelector(state => state.User);
  const { colors } = useTheme();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchVideos = async () => {
    const storedApiBase = await AsyncStorage.getItem('api_base_url');
    const API_URL = `${storedApiBase}video-tutorial-list`;
    // console.log("Base Url", storedApiBase);          // https://ssec.esms.live/api/apicontroller/
    try {
      setError(null);

      if (!userData?.id) {
        setError('User ID not found');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const formData = new FormData();
      formData.append('user_id', String(userData.id));

      const res = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-API-KEY': X_API_KEY,
        },
      });

      if (res.data?.status && Array.isArray(res.data.data)) {
        setVideos(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to load videos');
        // console.log("Error -=-=-=", res.data);
      }
    } catch (e) {
      // console.log('Fetch videos error:', e?.message, e?.response?.data);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVideos();
  }, []);

  const renderItem = ({ item }) => {
    let thumbnailUrl = null;
    if (isImageUrl(item.thumbnail)) thumbnailUrl = item.thumbnail;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => NavigationService.navigate('VideoPlayer', { video: item })}
      >
        <View style={styles.cardInner}>
          {/* Thumbnail */}
          <View style={styles.thumbnailWrapper}>
            {/* <Image
              source={thumbnailUrl ? { uri: thumbnailUrl } : DEFAULT_THUMB}
              style={styles.thumbnail}
              resizeMode="cover"
            /> */}
            <LinearGradient
              colors={['#7ff685ff', 'rgba(60, 98, 43, 1)ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.thumbnail}
            />
            <Icon
              name="play-circle-outline"
              size={48}
              color="#f32419cc"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: [{ translateX: -24 }, { translateY: -24 }],
              }}
            />
          </View>

          {/* Title */}
          <Text numberOfLines={2} style={styles.title}>
            {item.title || 'Untitled'}
          </Text>

          {/* Date row */}
          {item.date ? (
            <View style={styles.dateRow}>
              <Icon
                name="event"
                size={13}
                color="#9ca3af"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 8, color: colors.primary }}>
          Loading tutorials...
        </Text>
      </View>
    );
  }

  if (error && videos.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12, color: colors.primary }}>{error}</Text>
        <TouchableOpacity onPress={fetchVideos} style={styles.retryBtn}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.headerShadow}>
        <LinearGradient
          colors={[colors.lightGreen, colors.lightGreen]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Image
                source={Images.rightArrow}
                style={{
                  height: 22,
                  width: 22,
                  tintColor: '#000000ff',
                  transform: [{ rotate: '180deg' }]
                }}
              />
              {/* <Icon name="arrow-back-ios-new" size={20} color="#000000ff" /> */}
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Tutorials</Text>
              <Text style={styles.headerSubtitle}>
                Watch your assigned lessons
              </Text>
            </View>
          </View>

          <View style={styles.counterPill}>
            <Text style={styles.counterNumber}>{videos.length}</Text>
            <Text style={styles.counterLabel}>Videos</Text>
          </View>
        </LinearGradient>
      </View>

      {/* LIST */}
      <View style={styles.listContainer}>
        <FlatList
          data={videos}
          key={NUM_COLUMNS}
          keyExtractor={(item, index) =>
            item.id?.toString() || item.video_id?.toString() || String(index)
          }
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={styles.row}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={
            videos.length === 0 && !loading ? styles.emptyContainer : null
          }
          ListEmptyComponent={
            !loading && (
              <Text style={{ textAlign: 'center', marginTop: 20 }}>
                No videos found
              </Text>
            )
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* Header */
  headerShadow: {
    marginBottom: 12,
    elevation: 4,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    // backgroundColor: 'rgba(15, 23, 42, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    color: '#000203ff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#000000ff',
    fontSize: 11,
    marginTop: 2,
  },
  counterPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  counterNumber: {
    color: '#191818ff',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 20,
  },
  counterLabel: {
    color: '#030a07ff',
    fontSize: 11,
  },

  /* List & cards */
  listContainer: {
    flex: 1,
    paddingHorizontal: CARD_MARGIN,
    paddingTop: 15,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    // marginBottom: CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: CARD_MARGIN,
  },
  cardInner: {
    borderRadius: 20,
    // padding: 10,
  },
  thumbnailWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#dfe6e9',
  },
  thumbnail: {
    width: '100%',
    height: 110,
  },
  title: {
    marginTop: 10,
    fontWeight: '600',
    fontSize: 14,
    color: '#111827',
    paddingHorizontal: 8,
  },
  dateRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#6b7280',
  },

  /* States */
  center: {
    flex: 1,
    backgroundColor: '#edfaf0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtn: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#22c55e',
  },
  retryText: {
    color: '#000',
    fontWeight: '600',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default Index;