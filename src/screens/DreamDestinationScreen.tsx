import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Alert } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import AILoadingScreen from '../components/AILoadingScreen';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

const experienceCards = [
  { title: 'Remote Islands', description: '💈 Tropical vibes, crystal-clear waters, and untouched beaches.', imageUrl: 'https://images.unsplash.com/photo-1604414333193-0fbd8c6a86f8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Volcanic Wonders', description: '💈 Explore rumbling volcanoes, hot springs, and dramatic landscapes.', imageUrl: 'https://images.unsplash.com/photo-1591824164086-263204182e64?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Savannah Adventures', description: '💈 Witness wildlife in action during a safari under endless skies.', imageUrl: 'https://images.unsplash.com/photo-1639402479438-d74dc22cca28?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Coastal Bliss', description: '💈 Relaxing beach walks, vibrant sunsets, and ocean views.', imageUrl: 'https://images.unsplash.com/photo-1600585505333-faa0a5267b9f?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Desert Strolls', description: '💈 Experience vast open spaces, starry nights, and ancient ruins.', imageUrl: 'https://images.unsplash.com/photo-1726156372709-7002b0acec5d?q=80&w=663&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Misty Train Rides', description: '💈 Traverse mountain passes, dense forests, and misty valleys.', imageUrl: 'https://images.unsplash.com/photo-1664280562117-c61d0a12670c?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Mountain Trekking', description: '💈 Climb challenging peaks, hike scenic trails, and enjoy panoramic views.', imageUrl: 'https://images.unsplash.com/photo-1596561588102-ba9858523811?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Adventure Caves', description: '💈 Explore underground labyrinths, lantern-lit passages, and dripping stalactites.', imageUrl: 'https://images.unsplash.com/photo-1628047563315-d1e8b8d222b9?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Waterfall Expeditions', description: '💈 Discover hidden waterfalls, swim in natural pools, and enjoy lush surroundings.', imageUrl: 'https://images.unsplash.com/photo-1667658126089-eeb299129dff?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Kayak Adventures', description: '💈 Glide through calm rivers, explore mangroves, and spot wildlife.', imageUrl: 'https://images.unsplash.com/photo-1594643357134-1baf950059e2?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Vineyard Tours', description: '💈 Stroll through vineyards, sample local wines, and enjoy scenic landscapes.', imageUrl: 'https://images.unsplash.com/photo-1609159128331-b1cb4aba45a8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Glacier Hiking', description: '💈 Walk on massive ice fields, see stunning ice formations, and take in textbooks of geology.', imageUrl: 'https://images.unsplash.com/photo-1741660420355-aed07ee9208f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Architectural Marvels', description: '💈 Explore ancient temples, modern wonders, and historic landmarks.', imageUrl: 'https://images.unsplash.com/photo-1672384611483-da4399ebc0ff?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Historical Towns', description: '💈 Wander cobblestone streets, markets, and preserved history in small towns.', imageUrl: 'https://images.unsplash.com/photo-1681025394144-ad0e8ed44b9c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Music Festivals', description: '💈 Attend lively music events, dance under the stars, and meet global travelers.', imageUrl: 'https://images.unsplash.com/photo-1722608274454-dad85273a6a1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Foodie Journeys', description: '💈 Sample local cuisines, visit farm-to-table restaurants, and attend food festivals.', imageUrl: 'https://images.unsplash.com/photo-1751842838798-5b146aa49808?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fEZvb2RpZSUyMEpvdXJuZXlzfGVufDB8fDB8fHww' },
  { title: 'Market Wonders', description: '💈 Shop for handmade crafts, spices, and local produce in bustling markets.', imageUrl: 'https://images.unsplash.com/photo-1728819748487-817bf96f4dba?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Art Galleries', description: '💈 Dive into vibrant art scenes, museums, and creative hubs.', imageUrl: 'https://images.unsplash.com/photo-1614082636396-f8927eb06739?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { title: 'Spa Resort Vacations', description: '💈 Indulge in luxury spas, massage treatments, and tranquil settings.', imageUrl: 'https://plus.unsplash.com/premium_photo-1683120769883-21a953e0aa8d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fFNwYSUyMFJlc29ydCUyMFZhY2F0aW9uc3xlbnwwfHwwfHx8MA%3D%3D' },
  { title: 'Yoga Retreats', description: '💈 Practice yoga in serene settings surrounded by nature and like-minded people.', imageUrl: 'https://images.unsplash.com/photo-1526718583451-e88ebf774771?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTh8fFlvZ2ElMjBSZXRyZWF0c3xlbnwwfHwwfHx8MA%3D%3D' },
  { title: 'Hot Springs Escape', description: '💈 Soak in thermal springs, relax under starry skies, and enjoy a calming retreat.', imageUrl: 'https://images.unsplash.com/photo-1738830707460-4a6043bc489a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fEhvdCUyMFNwcmluZ3MlMjBFc2NhcGV8ZW58MHx8MHx8fDA%3D' },
  { title: 'Beach Retreats', description: '💈 Relax on pristine beaches, build sandcastles, and lounge under palm trees.', imageUrl: 'https://images.unsplash.com/photo-1632171005480-60f38e5a6f33?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTR8fEJlYWNoJTIwUmV0cmVhdHN8ZW58MHx8MHx8fDA%3D' },
  { title: 'Whale Watching', description: '💈 Witness majestic whales migrating through calm waters.', imageUrl: 'https://images.unsplash.com/photo-1602265133556-dcc08d51340c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fFdoYWxlJTIwV2F0Y2hpbmd8ZW58MHx8MHx8fDA%3D' },
  { title: 'Glamping in Deserts', description: '💈 Camp under endless stars, roast marshmallows, and stroll through dunes.', imageUrl: 'https://images.unsplash.com/photo-1662960158221-f76b79584491?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fEdsYW1waW5nJTIwaW4lMjBEZXNlcnRzfGVufDB8fDB8fHww' },
  { title: 'Island Hopping', description: '💈 Explore multiple islands, snorkel with colorful fish, and stay in overwater bungalows.', imageUrl: 'https://images.unsplash.com/photo-1593994603115-deaa40043bae?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fElzbGFuZCUyMEhvcHBpbmd8ZW58MHx8MHx8fDA%3D' },
  { title: 'Cave Camping', description: '💈 Sleep in natural caves, learn about local geology, and wake up to sunrise views.', imageUrl: 'https://images.unsplash.com/photo-1696347826892-8012bbaa55f9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Q2F2ZSUyMENhbXBpbmd8ZW58MHx8MHx8fDA%3D' },
  { title: 'Snowy Escapes', description: '💈 Experience a snow-covered wonderland, try skiing, and hug a snowman.', imageUrl: 'https://images.unsplash.com/photo-1628539783073-82f01150d946?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U25vd3klMjBFc2NhcGVzfGVufDB8fDB8fHww' },
  { title: 'Survival Expeditions', description: '💈 Learn basic survival skills, pitch tents in remote areas, and embrace unpredictability.', imageUrl: 'https://images.unsplash.com/photo-1631001671341-39c60998571c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fFN1cnZpdmFsJTIwRXhwZWRpdGlvbnN8ZW58MHx8MHx8fDA%3D' },
  { title: 'Adventure Road Trips', description: '💈 Hit the open road with no fixed itinerary, discover hidden gems, and create your own route.', imageUrl: 'https://images.unsplash.com/photo-1678488289603-89a24b1d1085?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fEFkdmVudHVyZSUyMFJvYWQlMjBUcmlwc3xlbnwwfHwwfHx8MA%3D%3D' },
  { title: 'Cozy Resorts', description: '💈 Relax in a luxurious resort, meet like-minded travelers, and enjoy all-inclusive experiences.', imageUrl: 'https://images.unsplash.com/photo-1752005993156-a63f250cd92f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fENvenklMjBSZXNvcnRzfGVufDB8fDB8fHww' },
];

const CARD_WIDTH = Math.min(width - 48, 340);
// Decrease card height a little
const CARD_HEIGHT = Math.min(height * 0.68, 520);

const DreamDestinationScreen: React.FC = () => {
  const theme = useTheme();
  const [cardIndex, setCardIndex] = useState(0);
  const [liked, setLiked] = useState<any[]>([]);
  const [disliked, setDisliked] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendationCards, setRecommendationCards] = useState<any[]>([]);
  const [recommendationIndex, setRecommendationIndex] = useState(0);
  const [likedRecommendations, setLikedRecommendations] = useState<any[]>([]);
  const [phase, setPhase] = useState<'experience' | 'recommendation'>('experience');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  // Track if component is mounted
  const isMounted = React.useRef(true);
  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const onSwiped = (index: number) => {
    if (!isMounted.current || !isFocused) return;
    if (phase === 'experience') setCardIndex(index + 1);
    else setRecommendationIndex(index + 1);
  };

  const onSwipedLeft = (index: number) => {
    if (!isMounted.current || !isFocused) return;
    if (phase === 'experience') setDisliked(prev => [...prev, experienceCards[index]]);
    // No-op for recommendations
  };

  const onSwipedRight = async (index: number) => {
    if (!isMounted.current || !isFocused) return;
    if (phase === 'experience') setLiked(prev => [...prev, experienceCards[index]]);
    else {
      // Like a recommendation
      const rec = recommendationCards[index];
      setLikedRecommendations(prev => {
        const updated = prev.length < 5 ? [...prev, rec] : prev;
        AsyncStorage.setItem('top5Destinations', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const onSwipedAll = async () => {
    if (!isMounted.current || !isFocused) return;
    if (phase === 'experience') {
      setLoading(true);
      setTimeout(async () => {
        if (!isMounted.current || !isFocused) return;
        // Fetch recommendations
        const likeTitles = liked.map(card => card.title).join(', ');
        const dislikeTitles = disliked.map(card => card.title).join(', ');
        const prompt = `Suggest 5 travel destinations for someone who likes: ${likeTitles || 'none'} and dislikes: ${dislikeTitles || 'none'}.`;
        try {
          const response = await fetch('http://10.13.185.144:5000/api/ai/recommend-destinations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt,
              preferences: {
                likes: likeTitles || 'Not specified',
                dislikes: dislikeTitles || 'Not specified',
                budget: 'Not specified',
                tripType: 'Not specified',
                duration: 'Not specified',
                interests: 'Not specified',
                climate: 'Not specified'
              }
            }),
          });
          const data = await response.json();
          if (!isMounted.current || !isFocused) return;
          if (data.success && data.destinations) {
            setLoading(false);
            setPhase('recommendation');
            setRecommendationCards(data.destinations);
            setRecommendationIndex(0);
          } else {
            setLoading(false);
            Alert.alert('Recommended Destinations', JSON.stringify(data));
          }
        } catch (error: any) {
          setLoading(false);
          Alert.alert('Error', 'Failed to get recommendations: ' + (error?.message || error));
          console.log('AI fetch error:', error);
        }
      }, 1200); // Show loading for at least 1.2s
    } else {
      // Finished recommendations phase (should not happen now)
      Alert.alert('Done!', 'Your top destinations have been saved.');
    }
  };

  // Add debug log before Swiper
  console.log('RENDER', phase, recommendationCards);

  // No helper, restore original renderCard logic inline for both phases

  return (
    <View style={{ flex: 1 }}>
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
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>
        <View style={[styles.container, { zIndex: 1 }]}> 
          <Text style={styles.header}>
            {phase === 'experience' ? 'What kind of experiences\nexcite you?' : 'Like your dream destinations!'}
          </Text>
          <View style={styles.swiperWrapper}>
            {isFocused && (phase === 'recommendation' ? (
              recommendationCards.length > 0 ? (
                <Swiper
                  key={phase + '-' + recommendationCards.length}
                  cards={recommendationCards}
                  cardIndex={recommendationIndex}
                  renderCard={(card: any) => {
                    if (!card) return null;
                    return (
                      <View style={[styles.card, { borderWidth: 0, borderColor: 'transparent' }, !card?.imageUrl && { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}> 
                        <View style={styles.imageContainer}>
                          {card?.imageUrl ? (
                            <Image source={{ uri: card.imageUrl }} style={styles.image} />
                          ) : (
                            <View style={[styles.image, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', minHeight: 120 }]}> 
                              <Text style={{ color: theme.text, textAlign: 'center', fontWeight: 'bold', fontSize: 22, marginBottom: 8 }}>{card.title || card.name}</Text>
                            </View>
                          )}
                          {/* Gradient overlay for better text readability */}
                          <LinearGradient
                            colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.55)']}
                            style={styles.gradient}
                          />
                          {/* Main content overlay: Only destination name */}
                          <View style={styles.textOverlay}>
                            <Text style={styles.title} numberOfLines={2}>
                              {card.title || card.name}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  }}
                  onSwiped={onSwiped}
                  onSwipedLeft={onSwipedLeft}
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
              ) : (
                <Text style={{ color: theme.text, fontSize: 18, textAlign: 'center', marginTop: 40 }}>No recommendations found.</Text>
              )
            ) : (
              <Swiper
                key={phase + '-' + cardIndex}
                cards={experienceCards}
                cardIndex={cardIndex}
                renderCard={(card: any) => {
                  if (!card) return null;
                  return (
                    <View style={[styles.card, { borderWidth: 0, borderColor: 'transparent' }, !card?.imageUrl && { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}> 
                      <View style={styles.imageContainer}>
                        {card?.imageUrl ? (
                          <Image source={{ uri: card.imageUrl }} style={styles.image} />
                        ) : (
                          <View style={[styles.image, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', minHeight: 120 }]}> 
                            <Text style={{ color: theme.text, textAlign: 'center', fontWeight: 'bold', fontSize: 22, marginBottom: 8 }}>{card.title || card.name}</Text>
                          </View>
                        )}
                        {/* Gradient overlay for better text readability */}
                        <LinearGradient
                          colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.55)']}
                          style={styles.gradient}
                        />
                        {/* Main content overlay: Only destination name */}
                        <View style={styles.textOverlay}>
                          <Text style={styles.title} numberOfLines={2}>
                            {card.title || card.name}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                }}
                onSwiped={onSwiped}
                onSwipedLeft={onSwipedLeft}
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
            ))}
          </View>
          <Text style={styles.counter} pointerEvents="none">
            {phase === 'experience' ? cardIndex + 1 : recommendationIndex + 1} / {phase === 'experience' ? experienceCards.length : recommendationCards.length}
          </Text>
        </View>
      </SafeAreaView>
      {/* Lottie Loading Screen between phases */}
      <AILoadingScreen
        visible={loading}
        title="Finding your dream destinations..."
        subtitle="AI is analyzing your preferences"
      />
    </View>
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
    marginTop: 32, // Shift header down
    color: '#2C2C2C',
    fontFamily: 'Racing Sans One, Arial',
  },
  swiperWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: CARD_WIDTH,
    alignSelf: 'flex-start',
    marginLeft: -10,
    marginTop: 24, // Shift card down
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 28,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  textOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  description: {
    fontSize: 17,
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  counter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    color: '#b0b3b8',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingBottom: 18,
    backgroundColor: 'transparent',
  },
});

export default DreamDestinationScreen; 