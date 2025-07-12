import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInDays, addDays } from 'date-fns';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useTripStore } from '../state/tripStore';
import { useUserStore } from '../state/userStore';
import { cn } from '../utils/cn';
import { generatePackingList } from '../services/packingService';
import AILoadingScreen from '../components/AILoadingScreen';
import popularDestinations from '../data/popularDestinations.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp_ = RouteProp<RootStackParamList, 'QuickTripSetup'>;

export default function QuickTripSetupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp_>();
  const { mode } = route.params; // 'ongoing' or 'completed'

  const addTrip = useTripStore((state) => state.addTrip);
  const incrementUsage = useUserStore((state) => state.incrementUsage);
  const getEffectiveTier = useUserStore((state) => state.getEffectiveTier);
  const currentTier = getEffectiveTier();

  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
    tripType: 'other' as 'beach' | 'hiking' | 'business' | 'family' | 'other',
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Function to get auto-complete suggestions
  const getSuggestions = (searchText: string): string[] => {
    if (!searchText.trim()) {
      return [];
    }

    const searchLower = searchText.toLowerCase();
    const results: string[] = [];

    // Search through countries and cities
    Object.entries(popularDestinations).forEach(([country, cities]) => {
      // Check if country matches
      if (country.toLowerCase().includes(searchLower)) {
        results.push(country);
      }
      
      // Check if any city matches
      cities.forEach(city => {
        if (city.toLowerCase().includes(searchLower)) {
          results.push(`${city}, ${country}`);
        }
      });
    });

    // Return top 5 unique matches
    return [...new Set(results)].slice(0, 5);
  };

  // Function to handle destination input with auto-complete
  const handleDestinationChange = (text: string) => {
    setFormData(prev => ({ ...prev, destination: text }));
    
    // Get suggestions for auto-complete
    const newSuggestions = getSuggestions(text);
    setSuggestions(newSuggestions);
  };

  // Function to apply auto-complete
  const applyAutoComplete = () => {
    if (suggestions.length > 0) {
      setFormData(prev => ({ ...prev, destination: suggestions[0] }));
      setSuggestions([]);
    }
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
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (!formData.startDate || !formData.endDate) {
          Alert.alert('Error', 'Invalid dates');
          setIsLoading(false);
          return;
      }

      console.log('Form data before API call:', {
        startDate: formData.startDate,
        endDate: formData.endDate,
        startDateType: typeof formData.startDate,
        endDateType: typeof formData.endDate
      });

      const tripDetails = {
        destination: formData.destination.trim(),
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        tripType: formData.tripType,
        specialRequests: '' // You can add a field for this in the UI if needed
      };

      console.log('Trip details being sent to API:', tripDetails);

      // Generate the packing list via the backend
      const newPackingList = await generatePackingList(tripDetails);

      if (currentTier === 'free') {
        incrementUsage('tripsCreated');
      }

      // We are not using the old trip store for now.
      // The backend now manages trips and packing lists.
      // We will need a way to navigate to a screen to view the list.
      // For now, let's just log it and show an alert.
      console.log('Generated Packing List:', newPackingList);
      Alert.alert(
        'Success!',
        'Your packing list has been generated. Navigation to the list screen will be implemented next.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      Alert.alert('Error', 'Failed to create trip and packing list. Is your backend server running?');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear suggestions when component unmounts
  useEffect(() => {
    return () => {
      setSuggestions([]);
    };
  }, []);

  useEffect(() => {
    if (route.params.destination) {
      setFormData(prev => ({ ...prev, destination: route.params.destination || '' }));
    }
  }, [route.params.destination]);

  const title = mode === 'ongoing' ? 'Current Trip' : 'Past Trip';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4"
          >
            <Ionicons name="close" size={20} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900">{title}</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Trip Name Section */}
          <Animated.View entering={FadeInDown.duration(400)} className="py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              What's your trip called?
            </Text>
            <Text className="text-gray-600 text-sm mb-3">
              Give your adventure a memorable name
            </Text>
            
            <View className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 flex-row items-center">
              <Ionicons name="airplane" size={18} color="#9CA3AF" />
              <TextInput
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                className="flex-1 ml-3 text-gray-900"
                placeholder="e.g. Europe Trip"
                placeholderTextColor="#9CA3AF"
                style={{ fontSize: 16 }}
                autoFocus
              />
            </View>
          </Animated.View>

          {/* Destination Section */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} className="py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {mode === 'completed' ? 'Where did you go?' : 'Where are you going?'}
            </Text>
            <Text className="text-gray-600 text-sm mb-3">
              {mode === 'completed' ? 'Tell us where you went' : 'Tell us your destination'}
            </Text>
            
            <View className="relative">
              <View className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 flex-row items-center">
                <Ionicons name="location" size={18} color="#9CA3AF" />
                <TextInput
                  value={formData.destination}
                  onChangeText={handleDestinationChange}
                  onSubmitEditing={applyAutoComplete}
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="Start typing a city or country..."
                  placeholderTextColor="#9CA3AF"
                  style={{ fontSize: 16 }}
                />
                {suggestions.length > 0 && (
                  <Pressable
                    onPress={applyAutoComplete}
                    style={{
                      padding: 8,
                      backgroundColor: '#4F46E5',
                      borderRadius: 6,
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: 'white' }}>✓</Text>
                  </Pressable>
                )}
              </View>
              
              {/* Auto-complete suggestion */}
              {suggestions.length > 0 && (
                <View style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#F3F4F6',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 8,
                  marginTop: 4,
                  padding: 8,
                  zIndex: 1000,
                }}>
                  <Text style={{ color: '#6B7280', fontSize: 14 }}>
                    Press Enter or tap ✓ to complete: <Text style={{ color: '#4F46E5', fontWeight: '600' }}>{suggestions[0]}</Text>
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Dates Section */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} className="py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {mode === 'completed' ? 'When was your trip?' : 'When is your trip?'}
            </Text>
            <Text className="text-gray-600 text-sm mb-3">
              {mode === 'completed' ? 'Select when you traveled' : 'Select your travel dates'}
            </Text>

            {/* Start Date */}
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
            
            {/* End Date */}
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
          </Animated.View>

          {/* Trip Type Section */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} className="py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              What type of trip is this?
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-2">
              {(['beach', 'hiking', 'business', 'family', 'other'] as const).map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setFormData(prev => ({ ...prev, tripType: type }))}
                  className={cn(
                    "px-4 py-2 rounded-full border-2",
                    formData.tripType === type ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-gray-200'
                  )}
                >
                  <Text className={cn(
                    "font-bold",
                    formData.tripType === type ? 'text-white' : 'text-gray-700'
                  )}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          <View className="h-32" />
        </ScrollView>

        {/* Create Button */}
        <View className="bg-white border-t border-gray-100 p-4 mt-6">
          <Pressable
              onPress={handleSave}
              disabled={isLoading}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                shadowColor: '#4F46E5',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <LinearGradient
                colors={isLoading ? ['#9CA3AF', '#9CA3AF'] : ['#4F46E5', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 16,
                }}>
                  {isLoading ? 'Creating...' : 'Create Trip & Start Packing'}
                </Text>
              </LinearGradient>
            </Pressable>
        </View>

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
                        minimumDate={mode === 'ongoing' ? new Date() : undefined}
                        maximumDate={mode === 'completed' ? new Date() : undefined}
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
                        minimumDate={formData.startDate || (mode === 'ongoing' ? new Date() : undefined)}
                        maximumDate={mode === 'completed' ? new Date() : undefined}
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
                minimumDate={mode === 'ongoing' ? new Date() : undefined}
                maximumDate={mode === 'completed' ? new Date() : undefined}
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
                minimumDate={formData.startDate || (mode === 'ongoing' ? new Date() : undefined)}
                maximumDate={mode === 'completed' ? new Date() : undefined}
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