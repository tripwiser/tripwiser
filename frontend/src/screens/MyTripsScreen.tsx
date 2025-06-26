import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Image,
  Modal,
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
      if (daysToGo > 7) return ['#4F46E5', '#6366F1']; // Indigo for distant future
      return ['#F59E0B', '#D97706']; // Amber for upcoming
    } else if (today.getTime() === startDate.getTime()) {
      // Trip starts today
      return ['#10B981', '#059669']; // Green for today
    } else if (today > startDate && today <= endDate) {
      // Trip is ongoing
      return ['#10B981', '#059669']; // Light green for ongoing
    } else {
      // Trip completed
      return ['#3B82F6', '#2563EB']; // Light blue for complete
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
      className="mx-4 mb-4"
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
          {/* Modern Card with Clean Design */}
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/10 border border-gray-100">
            {/* Clean Header */}
            <View className="bg-gray-50 px-5 py-4 border-b border-gray-100">
              <View className="flex-row justify-between items-center">
                <View className="flex-1 mr-3">
                  <Text className="text-xl font-bold text-gray-900 mb-1" numberOfLines={1}>
                    {trip.name}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="location" size={14} color="#6B7280" />
                    <Text className="text-gray-600 ml-1 font-medium text-sm" numberOfLines={1}>
                      {trip.destination}
                    </Text>
                  </View>
                </View>
                
                <View className={cn(
                  "px-3 py-1.5 rounded-full",
                  getTripStatus() === 'Today!' ? "bg-green-100" :
                  getTripStatus() === 'Ongoing' ? "bg-green-100" :
                  getTripStatus() === 'Complete' ? "bg-blue-100" :
                  daysUntilTrip > 7 ? "bg-indigo-100" : "bg-amber-100"
                )}>
                  <Text className={cn(
                    "font-semibold text-xs",
                    getTripStatus() === 'Today!' ? "text-green-700" :
                    getTripStatus() === 'Ongoing' ? "text-green-700" :
                    getTripStatus() === 'Complete' ? "text-blue-700" :
                    daysUntilTrip > 7 ? "text-indigo-700" : "text-amber-700"
                  )}>
                    {getTripStatus()}
                  </Text>
                </View>
              </View>
              
              {/* Clean Date */}
              <View className="flex-row items-center mt-2">
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text className="text-gray-600 ml-1 font-medium text-sm">
                  {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                </Text>
              </View>
            </View>
            
            {/* Compact Content */}
            <View className="p-4">
              {/* Progress Row */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-700 font-semibold">Packing Progress</Text>
                    <View className="flex-row items-center">
                      <Text className="text-gray-900 font-bold text-sm mr-1">
                        {trip.completed && progress.total === 0 ? "Complete" : `${progress.packed}/${progress.total}`}
                      </Text>
                      <Ionicons 
                        name={progress.percentage === 100 ? "checkmark-circle" : "list-outline"} 
                        size={16} 
                        color={progress.percentage === 100 ? "#10B981" : "#6B7280"} 
                      />
                    </View>
                  </View>
                  
                  <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <Animated.View
                      entering={FadeInRight.delay(index * 80 + 200).duration(600)}
                      className="h-full rounded-full"
                      style={{ 
                        width: `${progress.percentage}%`,
                        backgroundColor: '#4F46E5'
                      }}
                    />
                  </View>
                  
                  <Text className="text-gray-500 text-xs mt-1">
                    {progress.percentage}% complete
                    {progress.percentage === 100 && " 🎉"}
                  </Text>
                </View>
              </View>
              
              {/* Clean Weather Info */}
              {trip.weather && (
                <View className="bg-gray-50 rounded-xl p-3 flex-row items-center border border-gray-100">
                  <Text className="text-2xl mr-3">{trip.weather.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-sm">
                      {getTemperatureDisplayValue(trip.weather.temperature.min, temperatureUnit).value}{getTemperatureDisplayValue(trip.weather.temperature.min, temperatureUnit).unit} - {getTemperatureDisplayValue(trip.weather.temperature.max, temperatureUnit).value}{getTemperatureDisplayValue(trip.weather.temperature.max, temperatureUnit).unit}
                    </Text>
                    <Text className="text-gray-600 text-xs" numberOfLines={1}>
                      {trip.weather.description}
                    </Text>
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
  
  const handleTripPress = (trip: Trip) => {
    // Check if trip is completed
    const today = new Date();
    const endDate = new Date(trip.endDate);
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    const isCompleted = today > endDate;
    
    if (isCompleted) {
      // For completed trips, go directly to journal
      navigation.navigate('Journal', { tripId: trip.id });
    } else {
      // For active/future trips, show options
      Alert.alert(
        trip.name,
        'What would you like to do?',
        [
          {
            text: 'Packing List',
            onPress: () => navigation.navigate('PackingList', { tripId: trip.id }),
          },
          {
            text: 'Travel Journal',
            onPress: () => navigation.navigate('Journal', { tripId: trip.id }),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
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
                <TripCard
                  trip={trip}
                  onPress={() => handleTripPress(trip)}
                  onLongPress={() => handleTripLongPress(trip)}
                  onDelete={() => handleTripDelete(trip)}
                  onDirectDelete={() => deleteTrip(trip.id)}
                  index={index}
                />
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
      {(
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
      )}

      {/* Action Menu Modal */}
      <Modal
        visible={showActionMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionMenu(false)}
      >
        <Pressable 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowActionMenu(false)}
        >
          {/* Position the menu to appear from the FAB location */}
          <View 
            style={{ 
              position: 'absolute',
              bottom: 140 + insets.bottom,
              right: 24,
              width: 280,
            }}
          >
            <Animated.View 
              entering={FadeInDown.duration(300)}
              style={{
                backgroundColor: 'white',
                borderRadius: 24,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
                elevation: 15,
              }}
            >
              <View style={{ gap: 8 }}>
                {/* New Trip */}
                <Pressable
                  onPress={() => {
                    setShowActionMenu(false);
                    handleCreateTrip();
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    borderRadius: 16,
                    backgroundColor: '#F8FAFF',
                  }}
                >
                  <View 
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#4F46E5',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>New Trip</Text>
                </Pressable>

                {/* On Trip */}
                <Pressable
                  onPress={() => {
                    setShowActionMenu(false);
                    handleOnTripChoice();
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    borderRadius: 16,
                    backgroundColor: '#F8FAFF',
                  }}
                >
                  <View 
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#6366F1',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="airplane" size={20} color="white" />
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>On Trip</Text>
                </Pressable>

                {/* Completed Trip */}
                <Pressable
                  onPress={() => {
                    setShowActionMenu(false);
                    // For completed trips, go directly to create trip and then journal
                    handleCompletedTripDirect();
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    borderRadius: 16,
                    backgroundColor: '#F8FAFF',
                  }}
                >
                  <View 
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#8B5CF6',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>Completed Trip</Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* Close button positioned exactly over the FAB */}
            <Pressable
              onPress={() => setShowActionMenu(false)}
              style={{
                position: 'absolute',
                bottom: -74,
                right: 0,
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#4F46E5',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#4F46E5',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Ionicons name="close" size={32} color="white" />
            </Pressable>
          </View>
        </Pressable>
      </Modal>

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