import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInDays, addDays } from 'date-fns';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useTripStore } from '../state/tripStore';
import { useUserStore } from '../state/userStore';
import { ActivityType } from '../types';
import { fetchWeatherData } from '../api/weather';
import { generatePackingList } from '../services/packingService';
import { cn } from '../utils/cn';
import AILoadingScreen from '../components/AILoadingScreen';
import { scheduleTripReminder, schedulePackingReminder, scheduleWeatherAlert } from '../services/notificationService';
import mixpanel from '../services/analytics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp_ = RouteProp<RootStackParamList, 'TripSetup'>;

const tripTypes = [
  { value: 'leisure', label: 'Leisure', icon: '🏖️' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'romantic', label: 'Romantic', icon: '💕' },
  { value: 'wellness', label: 'Wellness', icon: '🧘‍♀️' },
  { value: 'cultural', label: 'Cultural', icon: '🏛️' },
  { value: 'backpacking', label: 'Backpacking', icon: '🎒' },
  { value: 'roadtrip', label: 'Road Trip', icon: '🚗' },
] as const;

const activities = [
  { value: 'beach', label: 'Beach', icon: '🏖️' },
  { value: 'hiking', label: 'Hiking', icon: '🥾' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'formal-events', label: 'Formal Events', icon: '🎭' },
  { value: 'outdoor-sports', label: 'Outdoor Sports', icon: '⚽' },
  { value: 'city-sightseeing', label: 'City Tours', icon: '🏛️' },
  { value: 'winter-sports', label: 'Winter Sports', icon: '⛷️' },
  { value: 'photography', label: 'Photography', icon: '📸' },
  { value: 'nightlife', label: 'Nightlife', icon: '🍸' },
  { value: 'camping', label: 'Camping', icon: '🏕️' },
  { value: 'cultural-visits', label: 'Cultural Sites', icon: '🏛️' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'swimming', label: 'Swimming', icon: '🏊‍♂️' },
  { value: 'spa-wellness', label: 'Spa & Wellness', icon: '🧘‍♀️' },
  { value: 'fine-dining', label: 'Fine Dining', icon: '🍽️' },
  { value: 'festivals', label: 'Festivals', icon: '🎪' },
  { value: 'museums', label: 'Museums', icon: '🖼️' },
  { value: 'concerts', label: 'Concerts', icon: '🎵' },
  { value: 'water-sports', label: 'Water Sports', icon: '🏄‍♂️' },
  { value: 'cycling', label: 'Cycling', icon: '🚴‍♂️' },
  { value: 'golf', label: 'Golf', icon: '⛳' },
  { value: 'fishing', label: 'Fishing', icon: '🎣' },
  { value: 'rock-climbing', label: 'Rock Climbing', icon: '🧗‍♂️' },
  { value: 'safari', label: 'Safari', icon: '🦁' },
  { value: 'food-tours', label: 'Food Tours', icon: '🍕' },
  { value: 'wine-tasting', label: 'Wine Tasting', icon: '🍷' },
  { value: 'art-galleries', label: 'Art Galleries', icon: '🎨' },
  { value: 'theater', label: 'Theater', icon: '🎭' },
  { value: 'cooking-classes', label: 'Cooking Classes', icon: '👨‍🍳' },
  { value: 'boat-cruise', label: 'Boat Cruise', icon: '🛥️' },
] as const;

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  index: number;
}

function FormSection({ title, subtitle, children, index }: FormSectionProps) {
  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(600)}
      className="mb-8"
    >
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-1">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-gray-600 text-base">
            {subtitle}
          </Text>
        )}
      </View>
      {children}
    </Animated.View>
  );
}

interface CustomInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon?: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
}

function CustomInput({ value, onChangeText, placeholder, icon, multiline = false }: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View className={cn(
      'bg-white rounded-2xl border-2 px-5 transition-colors',
      isFocused ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200',
      multiline ? 'py-4 items-start' : 'py-5 flex-row items-center'
    )}>
      {icon && (
        <View className={cn("mr-3", multiline ? "mt-1" : "")}>
          <Ionicons 
            name={icon} 
            size={22} 
            color={isFocused ? '#4F46E5' : '#9CA3AF'} 
          />
        </View>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          flex: 1,
          fontSize: 18,
          fontWeight: '500',
          color: '#111827',
          includeFontPadding: false,
          textAlignVertical: multiline ? 'top' : 'center',
          lineHeight: multiline ? 24 : undefined,
          minHeight: multiline ? 80 : undefined,
        }}
        placeholderTextColor="#9CA3AF"
        numberOfLines={multiline ? 4 : 1}
        maxLength={multiline ? 500 : undefined}
      />
    </View>
  );
}

export default function TripSetupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp_>();
  const editTripId = route.params?.editTripId;
  
  const addTrip = useTripStore((state) => state.addTrip);
  const updateTrip = useTripStore((state) => state.updateTrip);
  // Removed getTripById (not in store)
  const incrementUsage = useUserStore((state) => state.incrementUsage);
  const getEffectiveTier = useUserStore((state) => state.getEffectiveTier);
  const currentUser = useUserStore((state) => state.user);
  const currentTier = getEffectiveTier();
  
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    travelers: 1,
    genderSplit: null as 'male' | 'female' | 'both' | null,
    travelGroup: [] as ('adults' | 'kids' | 'baby' | 'pets')[],
    tripType: [] as string[],
    activities: [] as ActivityType[],
    additionalInfo: '',
  });
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const buttonScale = useSharedValue(1);
  
  // No default travel group selection
  
  // Load existing trip data if editing
  useEffect(() => {
    // TODO: If you want to support editing, implement a getTripById selector in tripStore
    // For now, skip loading existing trip data
  }, [editTripId]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Calculate duration properly - only if both dates are selected
  let duration = 0;
  if (formData.startDate && formData.endDate) {
    const start = safeDate(formData.startDate);
    const end = safeDate(formData.endDate);
    
    // Reset times to midnight to get clean day calculations
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const daysDifference = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // June 20-20 = 0 diff = 1 day, June 20-21 = 1 diff = 1 day, June 20-22 = 2 diff = 2 days
    duration = daysDifference === 0 ? 1 : (daysDifference === 1 ? 1 : daysDifference);
  }
  
  const handleActivityToggle = (activity: ActivityType) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const handleTripTypeToggle = (tripType: 'beach' | 'hiking' | 'business' | 'family' | 'other') => {
    setFormData(prev => ({
      ...prev,
      tripType: prev.tripType.includes(tripType)
        ? prev.tripType.filter(t => t !== tripType)
        : [...prev.tripType, tripType]
    }));
  };
  

  
  const isFormComplete = () => {
    return (
      formData.name.trim() !== '' &&
      formData.destination.trim() !== '' &&
      formData.startDate !== null &&
      formData.endDate !== null &&
      formData.startDate <= formData.endDate &&
      formData.travelers >= 1 &&
      formData.tripType.length > 0
    );
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter a trip name');
      return false;
    }
    if (!formData.destination.trim()) {
      Alert.alert('Missing Information', 'Please enter a destination');
      return false;
    }
    if (!formData.startDate) {
      Alert.alert('Missing Information', 'Please select a start date');
      return false;
    }
    if (!formData.endDate) {
      Alert.alert('Missing Information', 'Please select an end date');
      return false;
    }
    if (formData.startDate > formData.endDate) {
      Alert.alert('Invalid Dates', 'End date cannot be before start date');
      return false;
    }
    if (formData.travelers < 1) {
      Alert.alert('Invalid Travelers', 'Number of travelers must be at least 1');
      return false;
    }
    if (formData.tripType.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one trip type');
      return false;
    }
    return true;
  };
  
  const handleSave = async () => {
    if (!validateForm()) return;
    if (!currentUser?.id) {
      Alert.alert('Not logged in', 'You must be logged in to create a trip.');
      return;
    }
    
    buttonScale.value = withSpring(0.95, undefined, () => {
      buttonScale.value = withSpring(1);
    });
    
    setIsLoading(true);
    
    try {
      // Validate dates exist
      if (!formData.startDate || !formData.endDate) {
        Alert.alert('Missing Dates', 'Please select both start and end dates');
        return;
      }
      // Fetch weather data
      const weather = await fetchWeatherData(formData.destination);
      // Schedule weather alert if needed
      if (weather && weather.description && (weather.description.toLowerCase().includes('rain') || weather.description.toLowerCase().includes('snow'))) {
        await scheduleWeatherAlert(formData.destination, formData.startDate.toISOString(), weather.description);
      }
      // Generate a temporary id for frontend (will be replaced by backend _id)
      const tempId = `temp_${Date.now()}`;
      const tripData = {
        ...formData,
        id: tempId,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        duration,
        weather,
        completed: false,
        packingList: [],
        user: currentUser?.id, // Pass user id for backend
        // Ensure tripType is the correct union type array
        tripType: (formData.tripType as ("leisure" | "business" | "adventure" | "family" | "romantic" | "wellness" | "cultural" | "backpacking" | "roadtrip")[]),
      };
      if (editTripId) {
        // Update existing trip (remove id field for update)
        const { id, ...updateData } = tripData;
        await updateTrip(editTripId, updateData);
        console.log('Fetched trips after update:', useTripStore.getState().trips);
      } else {
        // Create new trip
        try {
          incrementUsage('tripsCreated');
        } catch (usageError) {
          console.warn('Usage tracking error:', usageError);
          // Continue with trip creation even if usage tracking fails
        }
        // Generate packing list for new trips using backend AI
        try {
          // Only allow backend tripType values: 'beach', 'hiking', 'business', 'family', 'other'
          const allowedTripTypes: ('beach' | 'hiking' | 'business' | 'family' | 'other')[] = ['beach', 'hiking', 'business', 'family', 'other'];
          let backendTripType: 'beach' | 'hiking' | 'business' | 'family' | 'other' = 'other';
          if (Array.isArray(tripData.tripType) && tripData.tripType.length > 0) {
            backendTripType = allowedTripTypes.includes(tripData.tripType[0] as any)
              ? (tripData.tripType[0] as 'beach' | 'hiking' | 'business' | 'family' | 'other')
              : 'other';
          }
          const response = await generatePackingList({
            destination: tripData.destination,
            startDate: tripData.startDate, // Already converted to ISO string
            endDate: tripData.endDate, // Already converted to ISO string
            tripType: backendTripType,
            specialRequests: tripData.additionalInfo || undefined
          });
          const addedTrip = await addTrip({ 
            ...tripData, 
            tripType: [backendTripType],
            packingList: response.packingList?.items || [],
          });
          // Schedule trip and packing reminders
          await scheduleTripReminder(tripData.name, tripData.destination, tripData.startDate);
          await schedulePackingReminder(tripData.name, tripData.destination, tripData.startDate);
          console.log('Trip added:', addedTrip);
          console.log('Fetched trips after add:', useTripStore.getState().trips);
        } catch (err) {
          Alert.alert('Error', 'Failed to create trip.');
        }
      }
      setIsLoading(false);
      navigation.goBack();
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to create or update trip.');
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Mapping function for backend to frontend tripType
  const backendToFrontendTripType = (backendType: 'beach' | 'hiking' | 'business' | 'family' | 'other'): 'leisure' | 'business' | 'adventure' | 'family' | 'romantic' | 'wellness' | 'cultural' | 'backpacking' | 'roadtrip' => {
    switch (backendType) {
      case 'beach': return 'leisure';
      case 'hiking': return 'adventure';
      case 'business': return 'business';
      case 'family': return 'family';
      case 'other': return 'leisure';
      default: return 'leisure';
    }
  };

  // Helper to safely create a Date from Date | null
  function safeDate(date: Date | null): Date {
    return date ? new Date(date) : new Date();
  }

  useEffect(() => {
    mixpanel.track('TripSetup Screen Viewed');
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingBottom: Math.max(200, keyboardHeight + 50) }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          contentInsetAdjustmentBehavior="automatic"
        >
        <View className="p-6">
          {/* Trip Name */}
          <FormSection
            title="What's your trip called?"
            subtitle="Give your adventure a memorable name"
            index={0}
          >
            <CustomInput
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="e.g. Europe Trip"
              icon="airplane-outline"
            />
          </FormSection>
          
          {/* Destination */}
          <FormSection
            title="Where are you going?"
            subtitle="Tell us your destination"
            index={1}
          >
            <CustomInput
              value={formData.destination}
              onChangeText={(text) => setFormData(prev => ({ ...prev, destination: text }))}
              placeholder="Paris, France"
              icon="location-outline"
            />
          </FormSection>
          
          {/* Dates */}
          <FormSection
            title="When is your trip?"
            subtitle="Select your travel dates"
            index={2}
          >
            <View>
              <Pressable
                onPress={() => setShowStartPicker(true)}
                className="bg-white rounded-2xl border-2 border-gray-200 px-5 py-4"
              >
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={20} color="#4F46E5" />
                  <View className="ml-4 flex-1">
                    <Text className="text-gray-600 text-sm font-medium mb-1">Start Date</Text>
                    <Text className={cn(
                      "text-lg font-bold",
                      formData.startDate ? "text-gray-900" : "text-gray-400"
                    )}>
                      {formData.startDate ? format(formData.startDate, 'EEEE, MMM d, yyyy') : 'Select start date'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </Pressable>
              
              <Pressable
                onPress={() => setShowEndPicker(true)}
                className="bg-white rounded-2xl border-2 border-gray-200 px-5 py-4 mt-3"
              >
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={20} color="#EF4444" />
                  <View className="ml-4 flex-1">
                    <Text className="text-gray-600 text-sm font-medium mb-1">End Date</Text>
                    <Text className={cn(
                      "text-lg font-bold",
                      formData.endDate ? "text-gray-900" : "text-gray-400"
                    )}>
                      {formData.endDate ? format(formData.endDate, 'EEEE, MMM d, yyyy') : 'Select end date'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </Pressable>
              
              {formData.startDate && formData.endDate && (
                <View className="bg-indigo-50 rounded-2xl p-4">
                  <Text className="text-indigo-900 font-semibold text-center">
                    ✈️ {duration} day{duration === 1 ? '' : 's'} of adventure awaits!
                  </Text>
                </View>
              )}
            </View>
          </FormSection>
          
          {/* Trip Type */}
          <FormSection
            title="What type of trip is this?"
            subtitle="This helps us suggest the right packing items"
            index={3}
          >
            <View className="flex-row flex-wrap gap-2">
              {tripTypes.map((type) => {
                const isSelected = formData.tripType.includes(type.value);
                return (
                  <Animated.View
                    key={type.value}
                    entering={FadeInDown.delay(100).duration(400)}
                  >
                    <Pressable
                      onPress={() => handleTripTypeToggle(type.value as 'beach' | 'hiking' | 'business' | 'family' | 'other')}
                      className={cn(
                        "rounded-xl px-4 py-3 flex-row items-center border-2 min-w-0",
                        isSelected 
                          ? "bg-indigo-500 border-indigo-500" 
                          : "bg-white border-gray-200"
                      )}
                    >
                      <Text className="mr-2 text-lg">{type.icon}</Text>
                      <Text className={cn(
                        "font-medium text-sm",
                        isSelected ? "text-white" : "text-gray-700"
                      )}>
                        {type.label}
                      </Text>
                      {isSelected && (
                        <View className="ml-2 w-4 h-4 bg-white/20 rounded-full items-center justify-center">
                          <Ionicons name="checkmark" size={10} color="white" />
                        </View>
                      )}
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </FormSection>
          
          {/* Travelers */}
          <FormSection
            title="How many travelers?"
            subtitle="Including yourself"
            index={4}
          >
            <View className="bg-white rounded-2xl border-2 border-gray-200 px-6 py-4">
              <View className="flex-row items-center justify-between">
                <Pressable
                  onPress={() => setFormData(prev => ({ 
                    ...prev, 
                    travelers: Math.max(1, prev.travelers - 1) 
                  }))}
                  className="w-12 h-12 rounded-xl bg-gray-100 items-center justify-center"
                >
                  <Ionicons name="remove" size={24} color="#374151" />
                </Pressable>
                
                <View className="items-center">
                  <Text className="text-3xl font-black text-gray-900">
                    {formData.travelers}
                  </Text>
                  <Text className="text-gray-600 font-medium">
                    {formData.travelers === 1 ? 'traveler' : 'travelers'}
                  </Text>
                </View>
                
                <Pressable
                  onPress={() => setFormData(prev => ({ 
                    ...prev, 
                    travelers: prev.travelers + 1 
                  }))}
                  className="w-12 h-12 rounded-xl bg-indigo-500 items-center justify-center"
                >
                  <Ionicons name="add" size={24} color="white" />
                </Pressable>
              </View>
            </View>
            
            {/* Gender selection - smaller and separated */}
            <View className="mt-6 bg-gray-50 rounded-xl p-3">
              <Text className="text-gray-600 font-medium mb-2 text-center text-sm">Gender</Text>
              <View className="flex-row justify-center">
                {[
                  { value: 'male', label: 'Male', icon: '♂️' },
                  { value: 'female', label: 'Female', icon: '♀️' },
                  { value: 'both', label: 'Mixed', icon: '⚥' },
                ].map((option, index) => {
                  const isSelected = formData.genderSplit === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setFormData(prev => ({ 
                        ...prev, 
                        genderSplit: option.value as 'male' | 'female' | 'both'
                      }))}
                      className={cn(
                        "rounded-lg px-5 py-2.5 flex-row items-center justify-center border min-w-0",
                        isSelected 
                          ? "bg-indigo-500 border-indigo-500" 
                          : "bg-white border-gray-200",
                        index === 1 ? "mx-3" : ""
                      )}
                    >
                      <Text className="mr-1 text-sm">{option.icon}</Text>
                      <Text className={cn(
                        "font-medium text-xs",
                        isSelected ? "text-white" : "text-gray-700"
                      )}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </FormSection>
          
          {/* Who's going? */}
          <FormSection
            title="Who's going?"
            subtitle="Select all that apply"
            index={5}
          >
            <View className="flex-row">
              {[
                { value: 'adults', label: 'ADULTS', emoji: '👨' },
                { value: 'kids', label: 'KIDS', emoji: '🧸' },
                { value: 'baby', label: 'BABIES', emoji: '🍼' },
                { value: 'pets', label: 'PETS', emoji: '🐶' },
              ].map((option, index) => {
                const isSelected = formData.travelGroup.includes(option.value as 'adults' | 'kids' | 'baby' | 'pets');
                
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        travelGroup: isSelected
                          ? prev.travelGroup.filter(item => item !== option.value)
                          : [...prev.travelGroup, option.value as 'adults' | 'kids' | 'baby' | 'pets']
                      }));
                    }}
                    className={cn(
                      "flex-1 bg-white rounded-2xl border-2 px-2 py-4 items-center aspect-square",
                      isSelected 
                        ? "border-indigo-500 bg-indigo-50" 
                        : "border-gray-200",
                      index > 0 ? "ml-3" : ""
                    )}
                  >
                    <View className={cn(
                      "w-12 h-12 rounded-2xl items-center justify-center mb-2",
                      isSelected ? "bg-indigo-100" : "bg-gray-100"
                    )}>
                      <Text style={{ fontSize: 24 }}>{option.emoji}</Text>
                    </View>
                    <Text className={cn(
                      "text-xs font-medium text-center",
                      isSelected ? "text-indigo-600" : "text-gray-900"
                    )}>
                      {option.label}
                    </Text>
                    {isSelected && (
                      <View className="absolute top-2 right-2">
                        <View className="w-5 h-5 bg-indigo-500 rounded-full items-center justify-center">
                          <Ionicons name="checkmark" size={10} color="white" />
                        </View>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </FormSection>
          
          {/* Activities */}
          <FormSection
            title="What activities are you planning?"
            subtitle="Select all that apply for personalized packing suggestions"
            index={6}
          >
            <View className="flex-row flex-wrap gap-2">
              {activities.map((activity, index) => {
                const isSelected = formData.activities.includes(activity.value as ActivityType);
                return (
                  <Animated.View
                    key={activity.value}
                    entering={FadeInDown.delay(150 + index * 30).duration(400)}
                  >
                    <Pressable
                      onPress={() => handleActivityToggle(activity.value as ActivityType)}
                      className={cn(
                        "rounded-xl px-3 py-2.5 flex-row items-center border-2 min-w-0",
                        isSelected 
                          ? "bg-indigo-500 border-indigo-500" 
                          : "bg-white border-gray-200"
                      )}
                    >
                      <Text className="mr-1.5 text-base">{activity.icon}</Text>
                      <Text className={cn(
                        "font-medium text-xs",
                        isSelected ? "text-white" : "text-gray-700"
                      )}>
                        {activity.label}
                      </Text>
                      {isSelected && (
                        <View className="ml-1.5 w-3.5 h-3.5 bg-white/20 rounded-full items-center justify-center">
                          <Ionicons name="checkmark" size={8} color="white" />
                        </View>
                      )}
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </FormSection>
          
          {/* Additional Info */}
          <FormSection
            title="Additional Info (Optional)"
            subtitle="Tell us more for better suggestions (e.g., attending a wedding, traveling with kids)"
            index={7}
          >
            <CustomInput
              value={formData.additionalInfo}
              onChangeText={(text) => setFormData(prev => ({ ...prev, additionalInfo: text }))}
              placeholder="Any special requirements or details..."
              multiline={true}
            />
          </FormSection>
        </View>
        
        {/* Save Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-100 p-4">
        <Animated.View style={buttonAnimatedStyle}>
          <Pressable
            onPress={handleSave}
            disabled={isLoading}
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: '#4F46E5',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <LinearGradient
              colors={isLoading ? ['#9CA3AF', '#9CA3AF'] : isFormComplete() ? ['#4F46E5', '#6366F1'] : ['#A5B4FC', '#C7D2FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 16,
                paddingHorizontal: 24,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={{
                    color: 'white',
                    fontWeight: '700',
                    fontSize: 18,
                    marginLeft: 12,
                    letterSpacing: 0.2,
                  }}>
                    Creating Your Trip...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                  <Text style={{
                    color: 'white',
                    fontWeight: '700',
                    fontSize: 18,
                    marginLeft: 8,
                    letterSpacing: 0.2,
                  }}>
                    {editTripId ? 'Update Trip' : 'Create Trip & Start Packing'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
      </ScrollView>
      
      {/* Enhanced Date Picker Modals */}
      {Platform.OS === 'ios' ? (
        // iOS Custom Modal Date Picker
        <>
          {showStartPicker && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showStartPicker}
              onRequestClose={() => setShowStartPicker(false)}
            >
              <View className="flex-1 bg-black/50 justify-end">
                <Animated.View 
                  entering={FadeInDown.duration(300)}
                  className="bg-white rounded-t-3xl"
                >
                  <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
                    <Pressable 
                      onPress={() => setShowStartPicker(false)}
                      className="py-2"
                    >
                      <Text style={{ color: '#4F46E5', fontWeight: '600', fontSize: 18 }}>Cancel</Text>
                    </Pressable>
                    <Text className="text-xl font-bold text-gray-900">Start Date</Text>
                    <Pressable 
                      onPress={() => setShowStartPicker(false)}
                      className="py-2"
                    >
                      <Text style={{ color: '#4F46E5', fontWeight: '600', fontSize: 18 }}>Done</Text>
                    </Pressable>
                  </View>
                  
                  <View className="px-6 pb-6">
                    <DateTimePicker
                      value={formData.startDate || new Date()}
                      mode="date"
                      display="spinner"
                      minimumDate={new Date()}
                      onChange={(event, date) => {
                        if (date && event.type === 'set') {
                          setFormData(prev => ({
                            ...prev,
                            startDate: date,
                          }));
                        }
                      }}
                      style={{ 
                        height: 200,
                        width: '100%',
                      }}
                      textColor="#111827"
                    />
                  </View>
                </Animated.View>
              </View>
            </Modal>
          )}

          {showEndPicker && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showEndPicker}
              onRequestClose={() => setShowEndPicker(false)}
            >
              <View className="flex-1 bg-black/50 justify-end">
                <Animated.View 
                  entering={FadeInDown.duration(300)}
                  className="bg-white rounded-t-3xl"
                >
                  <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
                    <Pressable 
                      onPress={() => setShowEndPicker(false)}
                      className="py-2"
                    >
                      <Text style={{ color: '#4F46E5', fontWeight: '600', fontSize: 18 }}>Cancel</Text>
                    </Pressable>
                    <Text className="text-xl font-bold text-gray-900">End Date</Text>
                    <Pressable 
                      onPress={() => setShowEndPicker(false)}
                      className="py-2"
                    >
                      <Text style={{ color: '#4F46E5', fontWeight: '600', fontSize: 18 }}>Done</Text>
                    </Pressable>
                  </View>
                  
                  <View className="px-6 pb-6">
                    <DateTimePicker
                      value={formData.endDate || (formData.startDate ? addDays(formData.startDate, 1) : addDays(new Date(), 1))}
                      mode="date"
                      display="spinner"
                      minimumDate={formData.startDate || new Date()}
                      onChange={(event, date) => {
                        if (date && event.type === 'set') {
                          setFormData(prev => ({
                            ...prev,
                            endDate: date,
                          }));
                        }
                      }}
                      style={{ 
                        height: 200,
                        width: '100%',
                      }}
                      textColor="#111827"
                    />
                  </View>
                </Animated.View>
              </View>
            </Modal>
          )}
        </>
      ) : (
        // Android Native Date Picker
        <>
          {showStartPicker && (
            <DateTimePicker
              value={formData.startDate || new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowStartPicker(false);
                if (event.type === 'set' && date) {
                  setFormData(prev => ({
                    ...prev,
                    startDate: date,
                  }));
                }
              }}
            />
          )}
          
          {showEndPicker && (
            <DateTimePicker
              value={formData.endDate || (formData.startDate ? addDays(formData.startDate, 1) : addDays(new Date(), 1))}
              mode="date"
              display="default"
              minimumDate={formData.startDate || new Date()}
              onChange={(event, date) => {
                setShowEndPicker(false);
                if (event.type === 'set' && date) {
                  setFormData(prev => ({
                    ...prev,
                    endDate: date,
                  }));
                }
              }}
            />
          )}
        </>
      )}

      {/* AI Loading Screen */}
      <AILoadingScreen
        visible={isLoading}
        title="Creating your trip..."
        subtitle="AI is generating your perfect packing list"
      />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}