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
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2; // 2 per row + margins

const API_URL =
  'https://esmsv2.scriptlab.in/api/apicontroller/video-tutorial-list';

const X_API_KEY = '123123'; // your X-API-KEY from Postman

// 🖼 default thumbnail
const DEFAULT_THUMB = require('../../Assets/Images/video_placeholder.jpg');

// helper: check if url is an image (not mp4 / youtube, etc.)
const isImageUrl = url => {
  if (!url || typeof url !== 'string') return false;
  const clean = url.split('?')[0].toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp)$/i.test(clean);
};

const Index = ({ navigation }) => {
  const { userData } = useSelector(state => state.User);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchVideos = async () => {
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

      console.log('Sending payload:', { user_id: String(userData.id) });

      const res = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-API-KEY': X_API_KEY,
        },
      });

      console.log('Video API response:', res.data);

      if (res.data?.status && Array.isArray(res.data.data)) {
        setVideos(res.data.data);
      } else {
        setError(res.data?.message || 'Unexpected response format');
      }
    } catch (e) {
      console.log('Fetch videos error:', e?.message, e?.response?.data);
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
    // Prefer dedicated thumbnail if it’s an image
    let thumbnailUrl = null;
    if (isImageUrl(item.thumbnail)) {
      thumbnailUrl = item.thumbnail;
    }

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('VideoPlayer', { video: item })}
      >
        <LinearGradient
          colors={['#ffffff', '#f4fff9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardInner}
        >
          <View style={styles.thumbnailWrapper}>
            <Image
              source={thumbnailUrl ? { uri: thumbnailUrl } : DEFAULT_THUMB}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>

          <Text numberOfLines={2} style={styles.title}>
            {item.title || 'Untitled'}
          </Text>

          {item.date ? (
            <Text style={styles.dateText}>{item.date}</Text>
          ) : null}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#28a96b" />
        <Text style={{ marginTop: 8 }}>Loading videos...</Text>
      </View>
    );
  }

  if (error && videos.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12 }}>{error}</Text>
        <TouchableOpacity onPress={fetchVideos} style={styles.retryBtn}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* --- HEADER --- */}
      <View style={styles.headerShadow}>
        <LinearGradient
          colors={['#edfaf0', '#c2f5ceff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Left: back button + title */}
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back-ios-new" size={22} color="#000000ff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tutorials</Text>
          </View>
        </LinearGradient>
      </View>

      {/* --- LIST --- */}
      <View style={styles.listContainer}>
        <FlatList
          data={videos}
          keyExtractor={(item, index) =>
            item.id?.toString() || item.video_id?.toString() || String(index)
          }
          numColumns={2}
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
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff', // theme background
  },

  /* Header */
  headerShadow: {
    marginBottom: 12,    // space between header and list
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    color: '#000000ff',
    fontSize: 20,
    fontWeight: '700',
  },
  counterPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  counterNumber: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  counterLabel: {
    color: '#e8fff4',
    fontSize: 11,
  },

  /* List & cards */
  listContainer: {
    flex: 1,
    paddingHorizontal: CARD_MARGIN,
    paddingTop: 4,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    backgroundColor: 'transparent',
  },
  cardInner: {
    borderRadius: 18,
    padding: 10,
  },
  thumbnailWrapper: {
    borderRadius: 14,
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
    color: '#222',
  },
  dateText: {
    marginTop: 4,
    fontSize: 11,
    color: '#7a8c8f',
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
    backgroundColor: '#2bb36a',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default Index;