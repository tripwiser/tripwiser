import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Alert, Pressable } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width - 48, 340);
const CARD_HEIGHT = Math.min(height * 0.68, 520);

const YourLikedDestinationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const theme = useTheme();
  // Filter out any undefined or empty cards
  const recommendations = (route.params?.recommendations || []).filter((card: any) => card && Object.keys(card).length > 0);
  const [recommendationIndex, setRecommendationIndex] = useState(0);
  const [likedRecommendations, setLikedRecommendations] = useState<any[]>([]);
  // Remove showDetails state and toggleDetails function

  const onSwiped = (index: number) => {
    setRecommendationIndex(index + 1);
  };

  const onSwipedRight = (index: number) => {
    const rec = recommendations[index];
    console.log('Saving to AsyncStorage:', rec);
    setLikedRecommendations(prev => {
      const updated = prev.length < 5 ? [...prev, rec] : prev;
      AsyncStorage.setItem('top5Destinations', JSON.stringify(updated));
      return updated;
    });
  };

  const onSwipedAll = () => {
    Alert.alert('Done!', 'Your top destinations have been saved.');
    navigation.goBack();
  };

  // Remove showDetails state and toggleDetails function

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>
      <LinearGradient
        colors={['#56CCF2', '#2F80ED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: 0,
        }}
      />
      <View style={[styles.container, { zIndex: 1 }]}> 
        <Text style={styles.header}>Like your dream destinations!</Text>
        <View style={styles.swiperWrapper}>
          <Swiper
            cards={recommendations}
            cardIndex={recommendationIndex}
            renderCard={(card: any) => {
              if (!card || Object.keys(card).length === 0) {
                return (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No card data</Text>
                  </View>
                );
              }
              return (
                <View style={styles.card}> 
                  <View style={styles.imageContainer}>
                    {card?.imageUrl ? (
                      <Image source={{ uri: card.imageUrl }} style={styles.image} />
                    ) : (
                      <View style={styles.fallbackContainer}>
                        <Ionicons name="location" size={48} color="#4F46E5" />
                        <Text style={styles.fallbackText}>{card.name}</Text>
                      </View>
                    )}
                    {/* Gradient overlay for better text readability */}
                    <LinearGradient
                      colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.8)']}
                      style={styles.gradient}
                    />
                    {/* Main content overlay: Only destination name */}
                    <View style={styles.contentOverlay}>
                      <Text style={styles.destinationName} numberOfLines={2}>
                        {card.name}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }}
            onSwiped={onSwiped}
            onSwipedLeft={() => {}}
            onSwipedRight={onSwipedRight}
            onSwipedAll={onSwipedAll}
            stackSize={3}
            backgroundColor={'transparent'}
            disableTopSwipe
            disableBottomSwipe
            cardVerticalMargin={32}
            stackSeparation={15}
            overlayLabels={{
              left: {
                title: 'NOPE',
                style: {
                  label: {
                    backgroundColor: '#EF4444',
                    color: 'white',
                    fontSize: 24,
                    padding: 8,
                    borderRadius: 8,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: -30,
                  },
                },
              },
              right: {
                title: 'LIKE',
                style: {
                  label: {
                    backgroundColor: '#4F46E5',
                    color: 'white',
                    fontSize: 24,
                    padding: 8,
                    borderRadius: 8,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: 30,
                  },
                },
              },
            }}
            animateOverlayLabelsOpacity
            animateCardOpacity
            showSecondCard
            infinite={false}
          />
        </View>
      </View>
      <Text style={styles.counter} pointerEvents="none">
        {recommendationIndex + 1} / {recommendations.length}
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    padding: 16,
    flexDirection: 'column',
    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    marginTop: 32,
    color: '#2C2C2C',
    fontFamily: 'Racing Sans One, Arial',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    alignSelf: 'center',
  },
  toggleText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  swiperWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: CARD_WIDTH,
    alignSelf: 'flex-start',
    marginLeft: -10,
    marginTop: 24,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  imageContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fallbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C2C',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    padding: 12,
    borderRadius: 24,
  },
  emptyText: {
    color: 'red',
    fontWeight: 'bold',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  contentOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
  },
  destinationName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    marginBottom: 16,
    lineHeight: 34,
  },
  detailsContainer: {
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    lineHeight: 22,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  counter: {
    textAlign: 'center',
    fontSize: 16,
    color: '#2C2C2C',
    marginBottom: 12,
    fontWeight: 'bold',
  },
});

export default YourLikedDestinationScreen; 