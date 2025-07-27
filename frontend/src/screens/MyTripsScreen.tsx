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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
// import AdBanner from '../components/AdBanner';
import UpgradePrompt from '../components/UpgradePrompt';
import TrendingDestinations from '../components/TrendingDestinations';
import PersonalizedSuggestion from '../components/PersonalizedSuggestion';
import { getTrendingDestinations, getPersonalizedSuggestion, postDestinationFeedback } from '../services/apiService';
import { useTheme } from '../theme/ThemeContext';
import mixpanel from '../services/analytics';

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
  onShare: () => void;
  index: number;
}

const TripCard = React.memo(function TripCard({ trip, onPress, onLongPress, onDelete, onDirectDelete, onShare, index }: TripCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>(); // Typed navigation
  const temperatureUnit = useUserStore((state) => state.temperatureUnit);
  const hasSwipedRef = useRef(false);
  const isDeleting = useRef(false);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  
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
    // All cards use white background now
    return ['#fff', '#fff'];
  };
  
  const getProgressColors = () => {
    return ['#4F46E5', '#6366F1']; // Consistent indigo for all progress bars
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 }, { translateX: 0 }], // Removed scale and translateX
    opacity: 1, // Removed opacity
  }));

  const handlePressIn = () => {
    // Removed scale animation
  };

  const handlePressOut = () => {
    // Removed scale animation
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
      style={{marginHorizontal:16, marginBottom:16}}
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
            <View style={{backgroundColor:'#FAFAFA', borderRadius:16, borderWidth:1, borderColor:'#F3F4F6', shadowColor:'#000', shadowOpacity:0.04, shadowRadius:4, shadowOffset:{width:0, height:1}, marginBottom:0, overflow:'hidden'}}>
              {/* Header Section */}
              <View style={{paddingHorizontal:12, paddingTop:10, paddingBottom:8, flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}>
                <View style={{flex:1, marginRight:8}}>
                  <Text style={{fontSize:18, fontWeight:'700', color:'#111827', marginBottom:2}} numberOfLines={1}>{trip.name}</Text>
                  <View style={{flexDirection:'row', alignItems:'center', marginBottom:0}}>
                    <Ionicons name="location" size={12} color="#4B5563" />
                    <Text style={{color:'#4B5563', marginLeft:2, fontWeight:'500', fontSize:12}} numberOfLines={1}>{trip.destination}</Text>
                    </View>
                  <View style={{flexDirection:'row', alignItems:'center', marginTop:6}}>
                    <Ionicons name="calendar-outline" size={12} color="#4B5563" />
                    <Text style={{color:'#4B5563', marginLeft:2, fontWeight:'500', fontSize:12}}>
                      {trip.startDate && !isNaN(new Date(trip.startDate)) && trip.endDate && !isNaN(new Date(trip.endDate))
                        ? `${format(new Date(trip.startDate), 'MMM d')} - ${format(new Date(trip.endDate), 'MMM d, yyyy')}`
                        : 'Unknown'}
                    </Text>
                    </View>
                  </View>
                  {/* Status Badge & Share Button */}
                <View style={{ alignItems: 'flex-end', marginTop: 12 }}>
                  <View style={{backgroundColor: getStatusBadgeColor(trip), paddingHorizontal:10, paddingVertical:4, borderRadius:12, alignSelf:'flex-start', minWidth:0}}>
                    <Text style={{color:'#15803d', fontWeight:'600', fontSize:10}} numberOfLines={1}>{getTripStatus()}</Text>
                  </View>
                  <TouchableOpacity onPress={onShare} style={{ marginTop: 8 }}>
                    <Ionicons name="share-social-outline" size={22} color="#6366F1" />
                  </TouchableOpacity>
                </View>
              </View>
              {/* Content Section */}
              {/* Packing Progress and Weather Section - white background fills card bottom */}
              <View style={{backgroundColor:'#fff', borderColor:'#fff', borderWidth:1, borderRadius:0, alignSelf:'stretch', marginHorizontal:-12, padding:10, borderBottomLeftRadius:16, borderBottomRightRadius:16}}>
                {/* Packing Progress */}
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:4, paddingHorizontal:12}}>
                  <Text style={{color:'#111827', fontWeight:'bold', fontSize:13}}>Packing Progress</Text>
                  <View style={{flexDirection:'row', alignItems:'center', backgroundColor:'#fff', paddingHorizontal:7, paddingVertical:2, borderRadius:8}}>
                    <Text style={{color:'#111827', fontWeight:'bold', fontSize:11, marginRight:4}}>{trip.completed ? "Complete" : "In Progress"}</Text>
                    <Ionicons name={trip.completed ? "checkmark-circle" : "list-outline"} size={13} color={trip.completed ? "#10B981" : "#6B7280"} />
                  </View>
                </View>
                {/* Progress Bar */}
                <View style={{backgroundColor:'#E5E7EB', borderRadius:6, height:4, overflow:'hidden', marginHorizontal:12}}>
                  <Animated.View
                    entering={FadeInRight.delay(index * 80 + 200).duration(600)}
                    style={{height:4, borderRadius:6, width:`${trip.completed ? 100 : 0}%`, backgroundColor:'#6366F1'}}
                  />
                </View>
                {/* Progress Text */}
                <Text style={{color:'#6B7280', fontSize:10, marginTop:2, fontWeight:'500', paddingHorizontal:12}}>{trip.completed ? "100%" : "0%"} complete</Text>
                {/* Weather Section inside white background */}
                {trip.weather && (
                  <View style={{backgroundColor:'#F9FAFB', borderRadius:10, padding:12, borderWidth:1, borderColor:'#F1F5F9', flexDirection:'row', alignItems:'center', marginTop:8, marginBottom:0, paddingHorizontal:12, marginHorizontal:12}}>
                    <Text style={{fontSize:18, marginRight:8}}>{trip.weather.icon}</Text>
                    <View style={{flex:1}}>
                      <Text style={{color:'#111827', fontWeight:'bold', fontSize:12}}>{getTemperatureDisplayValue(trip.weather.temperature.min, temperatureUnit).value}{getTemperatureDisplayValue(trip.weather.temperature.min, temperatureUnit).unit} - {getTemperatureDisplayValue(trip.weather.temperature.max, temperatureUnit).value}{getTemperatureDisplayValue(trip.weather.temperature.max, temperatureUnit).unit}</Text>
                      <Text style={{color:'#6B7280', fontSize:10, fontWeight:'500'}} numberOfLines={1}>{trip.weather.description}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
});

function getStatusBadgeColor(trip: Trip) {
  const today = new Date();
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  today.setHours(0,0,0,0);
  startDate.setHours(0,0,0,0);
  endDate.setHours(0,0,0,0);
  if (today < startDate) {
    const daysToGo = Math.floor((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysToGo > 7) return '#EEF2FF'; // Light indigo for far future
    return '#F3F4F6'; // Neutral for upcoming
  } else if (today.getTime() === startDate.getTime()) {
    return '#D1FAE5'; // Mint for today
  } else if (today > startDate && today <= endDate) {
    return '#D1FAE5'; // Mint for ongoing
  } else {
    return '#DBEAFE'; // Light blue for completed
  }
}
function getStatusBadgeTextColor(trip: Trip) {
  const today = new Date();
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  today.setHours(0,0,0,0);
  startDate.setHours(0,0,0,0);
  endDate.setHours(0,0,0,0);
  if (today < startDate) {
    const daysToGo = Math.floor((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysToGo > 7) return '#4F46E5'; // Indigo for far future
    return '#6B7280'; // Gray for upcoming
  } else if (today.getTime() === startDate.getTime()) {
    return '#10B981'; // Green for today
  } else if (today > startDate && today <= endDate) {
    return '#10B981'; // Green for ongoing
  } else {
    return '#2563EB'; // Blue for completed
  }
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MENU_WIDTH = 280;

export default function MyTripsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  
  const trips = useTripStore((state) => state.trips);
  console.log('Trips in MyTripsScreen:', trips);
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
    mixpanel.track('MyTrips Screen Viewed');
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

  // Always refresh trips when screen is focused
  // No longer needed with persistent store
  /*
  useFocusEffect(
    React.useCallback(() => {
      fetchTrips();
    }, [fetchTrips])
  );
  */
  
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
  
  const handleShareTrip = (trip: Trip) => {
    navigation.navigate('ShareTrip', {
      tripId: trip.id,
      tripName: trip.name,
    });
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
        <View style={{ paddingTop: insets.top, paddingHorizontal: 16, paddingBottom: 0 }}>
          <Animated.View entering={FadeInDown.duration(600)}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 0 }}>
              <View style={{ flex: 1 }}>
                <Text className="text-2xl font-bold text-gray-900 mb-1">My Trips</Text>
                <Text style={{color:'#6B7280', fontSize:13, paddingBottom:32}}>
                  {sortedTrips.length === 0 
                    ? 'Time to plan your first journey' 
                    : `${sortedTrips.length} trip${sortedTrips.length === 1 ? '' : 's'} • Plan. Pack. Collab. Journal. Share.`
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
        contentContainerStyle={{ paddingTop: 32, paddingBottom: insets.bottom + 100 }}
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
              <React.Fragment key={trip._id || trip.id || index}>
                <View
                  ref={ref => { cardRefs.current[trip._id || trip.id] = ref; }}
                  collapsable={false}
                >
                  <TripCard
                    trip={trip}
                    onPress={() => handleTripPress(trip)}
                    onLongPress={() => handleTripLongPress(trip)}
                    onDelete={() => handleTripDelete(trip)}
                    onDirectDelete={() => deleteTrip(trip._id || trip.id)}
                    onShare={() => handleShareTrip(trip)}
                    index={index}
                  />
                </View>
                {/* Show ad after second trip for free users */}
                {currentTier === 'free' && index === 1 && (
                  null
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
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>Upcoming</Text>
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
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>Ongoing</Text>
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
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>Completed</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Modern Trip Options Menu */}
      {menuVisible && menuPosition && (
        <View style={{
            position: 'absolute',
          top: '50%',
          left: '50%',
            width: MENU_WIDTH,
          transform: [{ translateX: -MENU_WIDTH / 2 }, { translateY: -180 }],
            zIndex: 9999,
        }}>
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

              <TouchableOpacity
                style={[styles.modalOption, { backgroundColor: '#F0FDF4' }]}
                onPress={() => {
                  closeMenu();
                  if (menuTrip) navigation.navigate('TripSummary', { tripId: menuTrip.id });
                }}
              >
                <View style={[styles.optionIconContainer, { backgroundColor: '#F0FDF4' }]}> 
                  <Ionicons name="sparkles-outline" size={24} color="#6366F1" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Summarize Trip</Text>
                  <Text style={styles.optionSubtitle}>Summary of itinerary, packing, journal</Text>
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