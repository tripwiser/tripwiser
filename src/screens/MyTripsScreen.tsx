import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInDays } from 'date-fns';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useTripStore } from '../state/tripStore';
import { useUserStore } from '../state/userStore';
import { Trip } from '../types';
import { cn } from '../utils/cn';
import { getTemperatureDisplayValue } from '../utils/temperature';
import AdBanner from '../components/AdBanner';
import UpgradePrompt from '../components/UpgradePrompt';
import TrendingDestinations from '../components/TrendingDestinations';
import PersonalizedSuggestion from '../components/PersonalizedSuggestion';
import { getTrendingDestinations, getPersonalizedSuggestion, postDestinationFeedback } from '../services/apiService';

interface Destination {
  id: string;
  name: string;
  imageUrl: string;
}
interface Suggestion {
  id: string;
  name: string;
  imageUrl: string;
  reason?: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  onLongPress: () => void;
  onDelete: () => void;
  onDirectDelete: () => void;
  index: number;
}

const TripCard = React.memo(function TripCard({ trip, onPress, onLongPress, onDelete, onDirectDelete, index }: TripCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>(); // Typed navigation
  const getPackingProgress = useTripStore((state) => state.getPackingProgress);
  const temperatureUnit = useUserStore((state) => state.temperatureUnit);
  const progress = getPackingProgress(trip.id);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const isDeleting = useRef(false);
  const hasSwipedRef = useRef(false);
  
  const daysUntilTrip = differenceInDays(new Date(trip.startDate), new Date());
  const daysUntilEnd = differenceInDays(new Date(trip.endDate), new Date());
  const isUpcoming = daysUntilTrip >= 0;
  
  const getTripStatus = () => {
    const today = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    
    // Set times to compare dates only (not time)
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    if (today < startDate) {
      // Future trip
      const daysToGo = differenceInDays(startDate, today);
      return `${daysToGo} days to go`;
    } else if (today.getTime() === startDate.getTime()) {
      // Trip starts today
      return 'Today!';
    } else if (today > startDate && today <= endDate) {
      // Trip is ongoing
      return 'Ongoing';
    } else {
      // Trip has ended
      return 'Complete';
    }
  };
  
  const getStatusColors = () => {
    const today = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    
    // Set times to compare dates only
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    if (today < startDate) {
      // Future trip
      const daysToGo = differenceInDays(startDate, today);
      if (daysToGo > 7) return ['#4F46E5', '#6366F1']; // Indigo for future trips (>7 days)
      return ['#F59E0B', '#D97706']; // Orange for upcoming trips (≤7 days)
    } else if (today.getTime() === startDate.getTime()) {
      // Trip starts today
      return ['#10B981', '#059669']; // Green for today
    } else if (today > startDate && today <= endDate) {
      // Trip is ongoing
      return ['#10B981', '#059669']; // Green for ongoing trips
    } else {
      // Trip completed
      return ['#6B7280', '#4B5563']; // Grey for completed trips
    }
  };
  
  const getProgressColors = () => {
    return ['#4F46E5', '#6366F1']; // Consistent indigo for all progress bars
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const confirmDelete = () => {
    if (isDeleting.current) return; // Prevent multiple dialogs
    
    isDeleting.current = true;
    
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete "${trip.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            isDeleting.current = false;
            translateX.value = withSpring(0);
            opacity.value = withSpring(1);
          }
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            isDeleting.current = false;
            onDirectDelete();
          },
        },
      ]
    );
  };

  const onPanGestureEvent = (event: any) => {
    const { translationX } = event.nativeEvent;
    
    // Mark that a swipe gesture has started
    if (Math.abs(translationX) > 10) {
      hasSwipedRef.current = true;
    }
    
    // Only allow left swipe
    if (translationX < 0) {
      translateX.value = Math.max(translationX, -200);
      const progress = Math.abs(translationX) / 200;
      opacity.value = Math.max(0.5, 1 - progress);
    }
  };

  const onPanHandlerStateChange = (event: any) => {
    const { state, translationX } = event.nativeEvent;
    
    if (state === State.BEGAN) {
      hasSwipedRef.current = false;
    }
    
    if (state === State.END) {
      const shouldDelete = translationX < -100 && !isDeleting.current && hasSwipedRef.current;
      
      if (shouldDelete) {
        confirmDelete();
      } else {
        translateX.value = withSpring(0);
        opacity.value = withSpring(1);
      }
      
      // Reset swipe flag after a short delay to prevent tap during reset animation
      setTimeout(() => {
        hasSwipedRef.current = false;
      }, 300);
    }
  };

  const handlePress = () => {
    // Don't navigate if user just swiped
    if (!hasSwipedRef.current) {
      onPress();
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(500)}
      className="mx-4 mb-6"
    >
      <PanGestureHandler
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onPanHandlerStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-20, 20]}
      >
        <Animated.View style={animatedStyle}>
          <Pressable
            onPress={handlePress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            className="overflow-hidden"
          >
            {/* Modern Card Design */}
            <View className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-black/8 border border-gray-100/50">
              {/* Gradient Header */}
              <LinearGradient
                colors={getStatusColors() as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-6 py-5"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 mr-4">
                    <Text className="text-2xl font-bold text-white mb-2" numberOfLines={1}>
                      {trip.name}
                    </Text>
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="location" size={16} color="rgba(255,255,255,0.9)" />
                      <Text className="text-white/90 ml-2 font-medium text-base" numberOfLines={1}>
                        {trip.destination}
                      </Text>
                    </View>
                    
                    {/* Date Range */}
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.8)" />
                      <Text className="text-white/80 ml-2 font-medium text-sm">
                        {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Status Badge */}
                  <View className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl">
                    <Text className="text-white font-bold text-sm">
                      {getTripStatus()}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
              
              {/* Content Section */}
              <View className="p-6">
                {/* Progress Section */}
                <View className="mb-6">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-gray-800 font-bold text-lg">Packing Progress</Text>
                    <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-full">
                      <Text className="text-gray-900 font-bold text-sm mr-2">
                        {trip.completed && progress.total === 0 ? "Complete" : `${progress.packed}/${progress.total}`}
                      </Text>
                      <Ionicons 
                        name={progress.percentage === 100 ? "checkmark-circle" : "list-outline"} 
                        size={16} 
                        color={progress.percentage === 100 ? "#10B981" : "#6B7280"} 
                      />
                    </View>
                  </View>
                  
                  {/* Modern Progress Bar */}
                  <View className="bg-gray-100 rounded-full h-3 overflow-hidden">
                    <Animated.View
                      entering={FadeInRight.delay(index * 80 + 200).duration(600)}
                      className="h-full rounded-full"
                      style={{ 
                        width: `${progress.percentage}%`,
                        backgroundColor: '#4F46E5'
                      }}
                    />
                  </View>
                  
                  <Text className="text-gray-500 text-sm mt-2 font-medium">
                    {progress.percentage}% complete
                    {progress.percentage === 100 && " 🎉"}
                  </Text>
                </View>
                
                {/* Weather Section */}
                {trip.weather && (
                  <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100/50">
                    <View className="flex-row items-center">
                      <Text className="text-3xl mr-4">{trip.weather.icon}</Text>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-bold text-lg">
                          {getTemperatureDisplayValue(trip.weather.temperature.min, temperatureUnit).value}{getTemperatureDisplayValue(trip.weather.temperature.min, temperatureUnit).unit} - {getTemperatureDisplayValue(trip.weather.temperature.max, temperatureUnit).value}{getTemperatureDisplayValue(trip.weather.temperature.max, temperatureUnit).unit}
                        </Text>
                        <Text className="text-gray-600 text-sm font-medium" numberOfLines={1}>
                          {trip.weather.description}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
                
                {/* Action Button */}
                <Pressable
                  onPress={() => {
                    navigation.navigate('Itinerary', {
                      tripId: trip.id,
                      tripName: trip.name,
                      destination: trip.destination,
                      startDate: trip.startDate,
                      endDate: trip.endDate,
                    });
                  }}
                  className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl py-4 px-6"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="map-outline" size={20} color="white" />
                    <Text className="text-white font-bold text-base ml-2">Create Itinerary</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
});

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MENU_WIDTH = 280;

export default function MyTripsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  
  const trips = useTripStore((state) => state.trips);
  const deleteTrip = useTripStore((state) => state.deleteTrip);
  const canPerformAction = useUserStore((state) => state.canPerformAction);
  const getEffectiveTier = useUserStore((state) => state.getEffectiveTier);
  const incrementUsage = useUserStore((state) => state.incrementUsage);
  const shouldShowSubscriptionUpsell = useUserStore((state) => state.shouldShowSubscriptionUpsell);
  const fabScale = useSharedValue(1);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string>('createTrip');
  const [trending, setTrending] = useState<Destination[]>([]);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingSuggestion, setLoadingSuggestion] = useState(true);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTrip, setMenuTrip] = useState<Trip | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // In MyTripsScreen, create a map to hold refs for each trip card
  const cardRefs = useRef<{ [tripId: string]: View | null }>({});

  React.useEffect(() => {
    setLoadingTrending(true);
    getTrendingDestinations()
      .then(data => setTrending(data.trending))
      .catch(() => setTrending([]))
      .finally(() => setLoadingTrending(false));
    setLoadingSuggestion(true);
    getPersonalizedSuggestion()
      .then(data => setSuggestion(data.suggestion))
      .catch(() => setSuggestion(null))
      .finally(() => setLoadingSuggestion(false));
  }, []);

  const handleLike = async () => {
    if (!suggestion) return;
    await postDestinationFeedback(suggestion.id, 'like');
    setFeedbackSent(true);
  };
  const handleDislike = async () => {
    if (!suggestion) return;
    await postDestinationFeedback(suggestion.id, 'dislike');
    setFeedbackSent(true);
  };
  
  const currentTier = getEffectiveTier();
  
  const sortedTrips = trips.sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    const now = new Date().getTime();
    
    // Upcoming trips first, then past trips in reverse order
    if (dateA >= now && dateB >= now) {
      return dateA - dateB;
    } else if (dateA < now && dateB < now) {
      return dateB - dateA;
    } else {
      return dateA >= now ? -1 : 1;
    }
  });
  
  const handleFabPress = () => {
    console.log('FAB pressed!');
    fabScale.value = withSpring(0.9, undefined, () => {
      fabScale.value = withSpring(1);
    });
    setShowActionMenu(true);
  };

  const handleCreateTrip = () => {
    // Temporarily bypass subscription check for debugging
    // const { allowed } = canPerformAction('createTrip');
    // 
    // if (!allowed) {
    //   setUpgradeFeature('createTrip');
    //   setShowUpgradePrompt(true);
    //   return;
    // }
    
    // Don't increment usage here - do it after successful save in TripSetupScreen
    navigation.navigate('TripSetup', {});
  };

  const handleCompletedTripDirect = () => {
    const { allowed } = canPerformAction('createTrip');
    
    if (!allowed) {
      setUpgradeFeature('createTrip');
      setShowUpgradePrompt(true);
      return;
    }
    
    // Don't increment usage here - do it after successful save
    navigation.navigate('QuickTripSetup', { mode: 'completed' });
  };

  const handleOnTripChoice = () => {
    const { allowed } = canPerformAction('createTrip');
    
    if (!allowed) {
      setUpgradeFeature('createTrip');
      setShowUpgradePrompt(true);
      return;
    }
    
    Alert.alert(
      'New Trip',
      'What would you like to do?',
      [
        {
          text: 'Packing List',
          onPress: () => navigation.navigate('TripSetup', {}),
        },
        {
          text: 'Travel Journal',
          onPress: () => navigation.navigate('QuickTripSetup', { mode: 'ongoing' }),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };
  
  const showMenu = (trip: Trip) => {
    const ref = cardRefs.current[trip.id];
    if (ref) {
      ref.measureInWindow((x: number, y: number, width: number, height: number) => {
        setMenuPosition({ x, y, width, height });
        setMenuTrip(trip);
        setMenuVisible(true);
      });
    } else {
      setMenuTrip(trip);
      setMenuVisible(true);
    }
  };

  const handleTripPress = (trip: Trip) => {
    // Check if trip is completed
    const today = new Date();
    const endDate = new Date(trip.endDate);
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const isCompleted = today > endDate;
    
    if (isCompleted) {
      // Show menu for completed trips
      Alert.alert(
        'Trip Completed!',
        `What would you like to do with "${trip.name}"?`,
        [
          {
            text: 'Packing List',
            onPress: () => navigation.navigate('PackingList', { tripId: trip.id }),
          },
          {
            text: 'Travel Journal',
            onPress: () => navigation.navigate('Journal', { tripId: trip.id }),
          },
          {
            text: 'View Itinerary',
            onPress: () => navigation.navigate('Itinerary', {
              tripId: trip.id,
              tripName: trip.name,
              destination: trip.destination,
              startDate: trip.startDate,
              endDate: trip.endDate,
            }),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      // Show modern menu for non-completed trips
      showMenu(trip);
    }
  };
  
  const handleTripLongPress = (trip: Trip) => {
    Alert.alert(
      'Trip Options',
      `What would you like to do with "${trip.name}"?`,
      [
        {
          text: 'Packing List',
          onPress: () => navigation.navigate('PackingList', { tripId: trip.id }),
        },
        {
          text: 'Travel Journal',
          onPress: () => navigation.navigate('Journal', { tripId: trip.id }),
        },
        {
          text: 'Create Itinerary',
          onPress: () => navigation.navigate('Itinerary', {
            tripId: trip.id,
            tripName: trip.name,
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
          }),
        },
        {
          text: 'Edit Trip',
          onPress: () => navigation.navigate('TripSetup', { editTripId: trip.id }),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleTripDelete(trip),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleTripDelete = (trip: Trip) => {
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete "${trip.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTrip(trip.id),
        },
      ]
    );
  };

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const closeMenu = () => {
    setMenuVisible(false);
    setMenuTrip(null);
    setMenuPosition(null);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      

      
      {/* Header */}
      <SafeAreaView className="bg-white border-b border-gray-100">
        <View className="px-4 pt-2 pb-0">
          <Animated.View entering={FadeInDown.duration(600)}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 0 }}>
              <View style={{ flex: 1 }}>
                <Text className="text-2xl font-bold text-gray-900 mb-1">My Trips</Text>
                <Text className="text-gray-600 text-base">
                  {sortedTrips.length === 0 
                    ? 'Time to plan your first journey' 
                    : `${sortedTrips.length} trip${sortedTrips.length === 1 ? '' : 's'} • Pack Smart & Capture the Journey.`
                  }
                </Text>
              </View>
              <Image
                source={{ uri: 'https://images.composerapi.com/C45B62FC-A362-4FD5-B3F9-CB00AD79B2E9.jpg' }}
                style={{
                  width: 48,
                  height: 48,
                  marginRight: 8,
                }}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
      
      {/* Content */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >

        {trips.length === 0 ? (
          <Animated.View 
            entering={FadeInDown.delay(200).duration(800)}
            className="flex-1 justify-center items-center px-8 mt-20"
          >
            {/* Clean Empty State */}
            <View className="w-32 h-32 rounded-full bg-indigo-50 border-2 border-indigo-100 items-center justify-center mb-6">
              <Ionicons name="airplane" size={48} color="#4F46E5" />
            </View>
            
            <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
              Ready for Adventure?
            </Text>
            
            <Text className="text-gray-600 text-center text-base leading-relaxed max-w-xs">
              Your next amazing journey starts here. Use the + button to create your first trip and let TripKit handle the rest!
            </Text>
          </Animated.View>
        ) : (
          <>
            {sortedTrips.map((trip, index) => (
              <React.Fragment key={trip.id}>
                <View
                  ref={ref => { cardRefs.current[trip.id] = ref; }}
                  collapsable={false}
                >
                  <TripCard
                    trip={trip}
                    onPress={() => handleTripPress(trip)}
                    onLongPress={() => handleTripLongPress(trip)}
                    onDelete={() => handleTripDelete(trip)}
                    onDirectDelete={() => deleteTrip(trip.id)}
                    index={index}
                  />
                </View>
                {/* Show ad after second trip for free users */}
                {currentTier === 'free' && index === 1 && (
                  <AdBanner 
                    category="travel" 
                    style="banner"
                  />
                )}
              </React.Fragment>
            ))}
            
            {/* Subscription Upsell */}
            {shouldShowSubscriptionUpsell() && (
              <Animated.View 
                entering={FadeInDown.delay(sortedTrips.length * 80).duration(600)}
                className="mx-4 mt-2"
              >
                <Pressable
                  onPress={() => navigation.navigate('Subscription')}
                  className="bg-gray-900 rounded-2xl p-5"
                >
                  <View className="flex-row items-center">
                    <View className="flex-1">
                      <Text className="text-white font-bold text-lg mb-1">
                        Go Premium ⭐
                      </Text>
                      <Text className="text-gray-300 text-sm">
                        Unlimited trips, ad-free, and exclusive features await
                      </Text>
                    </View>
                    <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center">
                      <Ionicons name="chevron-forward" size={20} color="white" />
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
      
      {/* Circular FAB Button - Always show */}
      <Animated.View
          entering={FadeInRight.delay(400).duration(600)}
          style={{ 
            position: 'absolute', 
            bottom: 70 + insets.bottom, 
            right: 24,
            zIndex: 999,
          }}
        >
          <Animated.View style={fabAnimatedStyle}>
            <Pressable
              onPress={handleFabPress}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                overflow: 'hidden',
                shadowColor: '#4F46E5',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
                zIndex: 1000,
              }}
            >
              <LinearGradient
                colors={['#4F46E5', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 64,
                  height: 64,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#4F46E5', // Fallback color
                }}
              >
                <Ionicons name="add" size={32} color="white" />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </Animated.View>

      {/* Floating Action Menu */}
      {showActionMenu && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 9999,
        }}>
          <Pressable 
            style={{ flex: 1 }}
            onPress={() => setShowActionMenu(false)}
          />
          <View style={{
            position: 'absolute',
            bottom: 200,
            right: 24,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
            minWidth: 200,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#111827' }}>
              Create New Trip
            </Text>
            <Pressable
              onPress={() => {
                setShowActionMenu(false);
                handleCreateTrip();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#F8FAFF',
                marginBottom: 8,
              }}
            >
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#4F46E5',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Ionicons name="add" size={16} color="white" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>New Trip</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setShowActionMenu(false);
                handleOnTripChoice();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#F8FAFF',
                marginBottom: 8,
              }}
            >
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#6366F1',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Ionicons name="airplane" size={16} color="white" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>On Trip</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setShowActionMenu(false);
                handleCompletedTripDirect();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#F8FAFF',
              }}
            >
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#8B5CF6',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Ionicons name="checkmark-circle" size={16} color="white" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>Completed Trip</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Modern Trip Options Menu */}
      {menuVisible && menuPosition && (
        <View style={[
          styles.popoverMenu,
          {
            position: 'absolute',
            top: menuPosition.y + 100,
            left: menuPosition.x + (menuPosition.width / 2) - (MENU_WIDTH / 2),
            width: MENU_WIDTH,
            zIndex: 9999,
          },
        ]}>
          <View style={[styles.modalContainer, { width: MENU_WIDTH }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="airplane" size={24} color="#4F46E5" />
              </View>
              <Text style={styles.modalTitle}>
                {menuTrip?.name || 'Trip Options'}
              </Text>
              <Text style={styles.modalSubtitle}>
                What would you like to do?
              </Text>
            </View>

            {/* Options */}
            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  closeMenu();
                  if (menuTrip) navigation.navigate('Journal', { tripId: menuTrip.id });
                }}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons name="book-outline" size={24} color="#10B981" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Travel Journal</Text>
                  <Text style={styles.optionSubtitle}>Record your memories</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  closeMenu();
                  if (menuTrip) navigation.navigate('PackingList', { tripId: menuTrip.id });
                }}
              >
                <View style={[styles.optionIconContainer, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="list-outline" size={24} color="#F59E0B" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Packing List</Text>
                  <Text style={styles.optionSubtitle}>Organize your items</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  closeMenu();
                  if (menuTrip) navigation.navigate('Itinerary', {
                    tripId: menuTrip.id,
                    tripName: menuTrip.name,
                    destination: menuTrip.destination,
                    startDate: menuTrip.startDate,
                    endDate: menuTrip.endDate,
                  });
                }}
              >
                <View style={[styles.optionIconContainer, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="map-outline" size={24} color="#3B82F6" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Create Itinerary</Text>
                  <Text style={styles.optionSubtitle}>Plan your daily activities</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={closeMenu}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        onUpgrade={() => {
          setShowUpgradePrompt(false);
          navigation.navigate('Subscription');
        }}
        feature={upgradeFeature}
        currentTier={currentTier}
        suggestedTier={currentTier === 'free' ? 'pro' : 'elite'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOptions: {
    marginBottom: 14,
    width: '100%',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 10,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalCancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    width: '100%',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  popoverMenu: {
    // No extra styles needed, just for clarity
  },
});