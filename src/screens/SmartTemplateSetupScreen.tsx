import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInRight,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useTemplateStore } from '../state/templateStore';
import { useUserStore } from '../state/userStore';
import { generateSmartTemplate } from '../services/smartTemplateService';
import { cn } from '../utils/cn';
import AILoadingScreen from '../components/AILoadingScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp_ = RouteProp<RootStackParamList, 'SmartTemplateSetup'>;

const tripTypes = [
  { id: 'business', name: 'Business', icon: '💼', description: 'Professional trips and meetings' },
  { id: 'leisure', name: 'Leisure', icon: '🏖️', description: 'Vacation and relaxation' },
  { id: 'adventure', name: 'Adventure', icon: '🏔️', description: 'Outdoor activities and exploration' },
  { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦', description: 'Family trips with kids' },
  { id: 'romantic', name: 'Romantic', icon: '💕', description: 'Couples getaway' },
  { id: 'wellness', name: 'Wellness', icon: '🧘', description: 'Health and spa focused' },
  { id: 'cultural', name: 'Cultural', icon: '🏛️', description: 'Museums, history, and culture' },
  { id: 'backpacking', name: 'Backpacking', icon: '🎒', description: 'Budget travel and hostels' },
  { id: 'roadtrip', name: 'Road Trip', icon: '🚗', description: 'Car travel and multiple stops' },
];

const activities = [
  { id: 'beach', name: 'Beach', icon: '🏖️' },
  { id: 'hiking', name: 'Hiking', icon: '🥾' },
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'formal-events', name: 'Formal Events', icon: '🎭' },
  { id: 'outdoor-sports', name: 'Outdoor Sports', icon: '⚽' },
  { id: 'city-sightseeing', name: 'City Tours', icon: '🏛️' },
  { id: 'winter-sports', name: 'Winter Sports', icon: '⛷️' },
  { id: 'photography', name: 'Photography', icon: '📸' },
  { id: 'nightlife', name: 'Nightlife', icon: '🍸' },
  { id: 'camping', name: 'Camping', icon: '🏕️' },
  { id: 'cultural-visits', name: 'Cultural Sites', icon: '🏛️' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'swimming', name: 'Swimming', icon: '🏊‍♂️' },
  { id: 'spa-wellness', name: 'Spa & Wellness', icon: '🧘‍♀️' },
  { id: 'fine-dining', name: 'Fine Dining', icon: '🍽️' },
  { id: 'festivals', name: 'Festivals', icon: '🎪' },
  { id: 'museums', name: 'Museums', icon: '🖼️' },
  { id: 'concerts', name: 'Concerts', icon: '🎵' },
  { id: 'water-sports', name: 'Water Sports', icon: '🏄‍♂️' },
  { id: 'cycling', name: 'Cycling', icon: '🚴‍♂️' },
  { id: 'golf', name: 'Golf', icon: '⛳' },
  { id: 'fishing', name: 'Fishing', icon: '🎣' },
  { id: 'rock-climbing', name: 'Rock Climbing', icon: '🧗‍♂️' },
  { id: 'safari', name: 'Safari', icon: '🦁' },
  { id: 'food-tours', name: 'Food Tours', icon: '🍕' },
  { id: 'wine-tasting', name: 'Wine Tasting', icon: '🍷' },
  { id: 'art-galleries', name: 'Art Galleries', icon: '🎨' },
  { id: 'theater', name: 'Theater', icon: '🎭' },
  { id: 'cooking-classes', name: 'Cooking Classes', icon: '👨‍🍳' },
  { id: 'boat-cruise', name: 'Boat Cruise', icon: '🛥️' },
];

const climateTypes = [
  { id: 'tropical', name: 'Tropical', icon: '🌴', description: 'Hot and humid' },
  { id: 'temperate', name: 'Temperate', icon: '🌤️', description: 'Mild weather' },
  { id: 'cold', name: 'Cold', icon: '❄️', description: 'Freezing temperatures' },
  { id: 'arid', name: 'Arid', icon: '🏜️', description: 'Dry and hot' },
  { id: 'mediterranean', name: 'Mediterranean', icon: '☀️', description: 'Warm and dry' },
];

const travelGroupOptions = [
  { value: 'adults', label: 'ADULTS', emoji: '👨' },
  { value: 'kids', label: 'KIDS', emoji: '🧸' },
  { value: 'baby', label: 'BABIES', emoji: '🍼' },
  { value: 'pets', label: 'PETS', emoji: '🐶' },
];

const genderOptions = [
  { value: 'male', label: 'Male', emoji: '👨', description: 'Male travelers' },
  { value: 'female', label: 'Female', emoji: '👩', description: 'Female travelers' },
  { value: 'mix', label: 'Mix', emoji: '👥', description: 'Mixed gender group' },
];

export default function SmartTemplateSetupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp_>();
  const insets = useSafeAreaInsets();
  
  const addTemplate = useTemplateStore((state) => state.addTemplate);
  const user = useUserStore((state) => state.user);
  
  const [templateName, setTemplateName] = useState('');
  const [selectedTripTypes, setSelectedTripTypes] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedClimate, setSelectedClimate] = useState<string>('');
  const [travelGroup, setTravelGroup] = useState<string[]>([]);
  const [gender, setGender] = useState<string>('mix');
  const [lengthOfStay, setLengthOfStay] = useState(3);
  const [travelers, setTravelers] = useState(2);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const toggleTripType = (typeId: string) => {
    setSelectedTripTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const toggleActivity = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const toggleTravelGroup = (groupId: string) => {
    setTravelGroup(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      Alert.alert('Template Name Required', 'Please enter a name for your template.');
      return;
    }

    if (selectedTripTypes.length === 0) {
      Alert.alert('Trip Type Required', 'Please select at least one trip type.');
      return;
    }

    if (!selectedClimate) {
      Alert.alert('Climate Required', 'Please select the climate type for this template.');
      return;
    }

    setIsCreating(true);

    try {
      const templateData = await generateSmartTemplate({
        name: templateName.trim(),
        tripTypes: selectedTripTypes,
        activities: selectedActivities,
        climate: selectedClimate,
        travelGroup,
        gender,
        lengthOfStay,
        travelers,
        isPrivate,
      });

      addTemplate(templateData);

      Alert.alert(
        'Template Created!',
        `Your smart template "${templateName}" has been created with ${templateData.items.length} suggested items.`,
        [
          {
            text: 'View Template',
            onPress: () => navigation.navigate('Templates'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create template. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <SafeAreaView className="bg-white border-b border-gray-100">
        <View className="px-4 py-3 flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">Smart Template</Text>
            <Text className="text-gray-600">AI-powered packing suggestions</Text>
          </View>
          <View className="w-10 h-10 bg-blue-500 rounded-xl items-center justify-center">
            <Ionicons name="sparkles" size={20} color="white" />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Template Name */}
        <Animated.View 
          entering={FadeInDown.duration(500)}
          className="bg-white mx-4 mt-4 mb-6 rounded-2xl p-6 border border-gray-100"
        >
          <Text className="text-lg font-bold text-gray-900 mb-3">Template Details</Text>
          <TextInput
            value={templateName}
            onChangeText={setTemplateName}
            placeholder="Template name (e.g., 'Beach Vacation', 'Business Trip')"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
            autoCapitalize="words"
          />
        </Animated.View>

        {/* Trip Types */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(500)}
          className="bg-white mx-4 mb-6 rounded-2xl p-6 border border-gray-100"
        >
          <Text className="text-lg font-bold text-gray-900 mb-3">Trip Type</Text>
          <Text className="text-gray-600 mb-4">Select the type(s) of trips this template will be used for</Text>
          <View className="flex-row flex-wrap -m-1">
            {tripTypes.map((type, index) => (
              <Animated.View 
                key={type.id} 
                entering={FadeInRight.delay(index * 50).duration(300)}
                className="m-1"
              >
                <Pressable
                  onPress={() => toggleTripType(type.id)}
                  className={cn(
                    "px-4 py-3 rounded-xl border-2 flex-row items-center",
                    selectedTripTypes.includes(type.id)
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  )}
                >
                  <Text className="text-lg mr-2">{type.icon}</Text>
                  <Text className={cn(
                    "font-medium",
                    selectedTripTypes.includes(type.id) ? "text-blue-600" : "text-gray-700"
                  )}>
                    {type.name}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Length of Stay */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(500)}
          className="bg-white m-4 rounded-2xl p-6 border border-gray-100"
        >
          <Text className="text-lg font-bold text-gray-900 mb-3">Length of Stay</Text>
          <Text className="text-gray-600 mb-4">Typical duration for this template</Text>
          <View className="flex-row items-center justify-between bg-gray-50 rounded-xl p-4">
            <Pressable 
              onPress={() => setLengthOfStay(Math.max(1, lengthOfStay - 1))}
              className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200"
            >
              <Ionicons name="remove" size={20} color="#6B7280" />
            </Pressable>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">{lengthOfStay}</Text>
              <Text className="text-gray-600">{lengthOfStay === 1 ? 'day' : 'days'}</Text>
            </View>
            <Pressable 
              onPress={() => setLengthOfStay(lengthOfStay + 1)}
              className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200"
            >
              <Ionicons name="add" size={20} color="#6B7280" />
            </Pressable>
          </View>
        </Animated.View>

        {/* Travelers */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(500)}
          className="bg-white m-4 rounded-2xl p-6 border border-gray-100"
        >
          <Text className="text-lg font-bold text-gray-900 mb-3">Number of Travelers</Text>
          <Text className="text-gray-600 mb-4">How many people will typically use this template</Text>
          <View className="flex-row items-center justify-between bg-gray-50 rounded-xl p-4">
            <Pressable 
              onPress={() => setTravelers(Math.max(1, travelers - 1))}
              className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200"
            >
              <Ionicons name="remove" size={20} color="#6B7280" />
            </Pressable>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">{travelers}</Text>
              <Text className="text-gray-600">{travelers === 1 ? 'person' : 'people'}</Text>
            </View>
            <Pressable 
              onPress={() => setTravelers(travelers + 1)}
              className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200"
            >
              <Ionicons name="add" size={20} color="#6B7280" />
            </Pressable>
          </View>
          
          {/* Gender selection - matches trip setup style */}
          <View className="mt-6 bg-gray-50 rounded-xl p-3">
            <Text className="text-gray-600 font-medium mb-2 text-center text-sm">Gender</Text>
            <View className="flex-row justify-center">
              {[
                { value: 'male', label: 'Male', icon: '♂️' },
                { value: 'female', label: 'Female', icon: '♀️' },
                { value: 'mix', label: 'Mixed', icon: '⚥' },
              ].map((option, index) => {
                const isSelected = gender === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setGender(option.value)}
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
        </Animated.View>

        {/* Who's Going */}
        <Animated.View 
          entering={FadeInDown.delay(350).duration(500)}
          className="bg-white mx-4 mb-6 rounded-2xl p-6 border border-gray-100"
        >
          <Text className="text-lg font-bold text-gray-900 mb-3">Who's Going?</Text>
          <Text className="text-gray-600 mb-4">Select all that apply to include relevant items</Text>
          <View className="flex-row">
            {travelGroupOptions.map((option, index) => {
              const isSelected = travelGroup.includes(option.value);
              
              return (
                <Pressable
                  key={option.value}
                  onPress={() => toggleTravelGroup(option.value)}
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
        </Animated.View>

        {/* Climate */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(500)}
          className="bg-white mx-4 mb-6 rounded-2xl p-6 border border-gray-100"
        >
          <Text className="text-lg font-bold text-gray-900 mb-3">Climate Type</Text>
          <Text className="text-gray-600 mb-4">Select the climate this template is designed for</Text>
          <View className="space-y-3">
            {climateTypes.map((climate, index) => (
              <Animated.View 
                key={climate.id} 
                entering={FadeInRight.delay(index * 50).duration(300)}
                className="mb-3"
              >
                <Pressable
                  onPress={() => setSelectedClimate(climate.id)}
                  className={cn(
                    "px-4 py-4 rounded-xl border-2 flex-row items-center",
                    selectedClimate === climate.id
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  )}
                >
                  <Text className="text-xl mr-3">{climate.icon}</Text>
                  <View className="flex-1">
                    <Text className={cn(
                      "font-semibold text-base",
                      selectedClimate === climate.id ? "text-blue-600" : "text-gray-900"
                    )}>
                      {climate.name}
                    </Text>
                    <Text className="text-gray-600 text-sm">{climate.description}</Text>
                  </View>
                  {selectedClimate === climate.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                  )}
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Activities */}
        <Animated.View 
          entering={FadeInDown.delay(500).duration(500)}
          className="bg-white mx-4 mb-6 rounded-2xl p-6 border border-gray-100"
        >
          <Text className="text-lg font-bold text-gray-900 mb-3">Activities</Text>
          <Text className="text-gray-600 mb-4">Select activities this template should include items for</Text>
          <View className="flex-row flex-wrap -m-1">
            {activities.map((activity, index) => (
              <Animated.View 
                key={activity.id} 
                entering={FadeInRight.delay(index * 30).duration(300)}
                className="m-1"
              >
                <Pressable
                  onPress={() => toggleActivity(activity.id)}
                  className={cn(
                    "px-3 py-2 rounded-lg border flex-row items-center",
                    selectedActivities.includes(activity.id)
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  )}
                >
                  <Text className="text-sm mr-1">{activity.icon}</Text>
                  <Text className={cn(
                    "font-medium text-sm",
                    selectedActivities.includes(activity.id) ? "text-blue-600" : "text-gray-700"
                  )}>
                    {activity.name}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Template Visibility */}
        <Animated.View 
          entering={FadeInDown.delay(700).duration(500)}
          className="bg-white mx-4 mb-6 rounded-2xl p-6 border border-gray-100"
        >
          <Text className="text-lg font-bold text-gray-900 mb-3">Template Visibility</Text>
          <Text className="text-gray-600 mb-4">Choose whether this template is private to you or can be shared</Text>
          
          <Pressable
            onPress={() => setIsPrivate(!isPrivate)}
            className="flex-row items-center justify-between py-4 px-4 bg-gray-50 rounded-xl border border-gray-200"
          >
            <View className="flex-row items-center">
              <Ionicons 
                name={isPrivate ? "lock-closed" : "lock-open"} 
                size={20} 
                color="#6B7280" 
              />
              <Text className="text-gray-900 font-medium ml-3">Private Template</Text>
            </View>
            <View className={cn(
              "w-12 h-6 rounded-full items-center justify-center",
              isPrivate ? "bg-indigo-500" : "bg-gray-300"
            )}>
              <View className={cn(
                "w-4 h-4 rounded-full bg-white transform transition-transform",
                isPrivate ? "translate-x-3" : "-translate-x-3"
              )} />
            </View>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* Create Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Pressable
          onPress={handleCreateTemplate}
          disabled={isCreating}
          style={{
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={isCreating ? ['#9CA3AF', '#9CA3AF'] : ['#3B82F6', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
          >
            {isCreating && <Ionicons name="sync" size={20} color="white" style={{ marginRight: 8 }} />}
            <Text style={{
              color: 'white',
              fontWeight: '700',
              fontSize: 18,
            }}>
              {isCreating ? 'Creating Template...' : 'Create Smart Template'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* AI Loading Screen */}
      <AILoadingScreen
        visible={isCreating}
        title="Creating your template..."
        subtitle="AI is generating smart packing suggestions"
      />
    </View>
  );
}