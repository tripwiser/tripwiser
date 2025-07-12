import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Dimensions,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInRight,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../state/userStore';
import { useTripStore } from '../state/tripStore';
import { travelTipsService, TravelTip } from '../services/travelTipsService';
import { cn } from '../utils/cn';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');

const TipCard = React.memo(function TipCard({
  tip,
  onPress,
  currentTier,
}: {
  tip: TravelTip;
  onPress: () => void;
  currentTier: string;
}) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'packing': return 'cube-outline';
      case 'destination': return 'location-outline';
      case 'weather': return 'partly-sunny-outline';
      case 'culture': return 'people-outline';
      case 'safety': return 'shield-checkmark-outline';
      default: return 'bulb-outline';
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'packing': return ['#667eea', '#764ba2'];
      case 'destination': return ['#f093fb', '#f5576c'];
      case 'weather': return ['#4facfe', '#00f2fe'];
      case 'culture': return ['#43e97b', '#38f9d7'];
      case 'safety': return ['#fa709a', '#fee140'];
      default: return ['#a8edea', '#fed6e3'];
    }
  };
  
  return (
    <Animated.View 
      entering={FadeInDown.duration(300)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4"
    >
      <Pressable onPress={onPress} className="p-6">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 mr-4">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{
                backgroundColor: getCategoryColor(tip.category)[0] + '20',
              }}>
                <Ionicons 
                  name={getCategoryIcon(tip.category) as any} 
                  size={16} 
                  color={getCategoryColor(tip.category)[0]} 
                />
              </View>
              <Text className="text-lg font-bold text-gray-900">{tip.title}</Text>
              {tip.isPremium && currentTier === 'free' && (
                <View className="ml-2 w-5 h-5 bg-yellow-500 rounded-full items-center justify-center">
                  <Ionicons name="star" size={12} color="white" />
                </View>
              )}
            </View>
            <Text className="text-gray-700 leading-6 mb-3">{tip.content}</Text>
          </View>
        </View>
        
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="bg-gray-100 px-3 py-1 rounded-full mr-2">
              <Text className="text-gray-700 text-sm font-medium capitalize">{tip.category}</Text>
            </View>
            
            {tip.destination && (
              <View className="bg-blue-100 px-3 py-1 rounded-full mr-2">
                <Text className="text-blue-600 text-sm font-medium">{tip.destination}</Text>
              </View>
            )}
            
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text className="text-gray-600 ml-1 text-sm">{tip.rating}</Text>
            </View>
          </View>
        </View>
        
        {tip.tags.length > 0 && (
          <View className="flex-row flex-wrap mt-3">
            {tip.tags.slice(0, 4).map((tag, index) => (
              <View key={index} className="bg-gray-50 px-2 py-1 rounded mr-2 mb-1">
                <Text className="text-gray-600 text-xs">#{tag}</Text>
              </View>
            ))}
            {tip.tags.length > 4 && (
              <View className="bg-gray-50 px-2 py-1 rounded">
                <Text className="text-gray-600 text-xs">+{tip.tags.length - 4} more</Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
});

export default function TravelTipsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  
  const getEffectiveTier = useUserStore((state) => state.getEffectiveTier);
  const currentTier = getEffectiveTier();
  const trips = useTripStore((state) => state.trips);
  
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tips, setTips] = useState<TravelTip[]>([]);
  const [dailyTip, setDailyTip] = useState<TravelTip | null>(null);
  
  const categories = [
    { id: 'all', name: 'All', icon: 'apps-outline' },
    { id: 'packing', name: 'Packing', icon: 'cube-outline' },
    { id: 'destination', name: 'Destination', icon: 'location-outline' },
    { id: 'weather', name: 'Weather', icon: 'partly-sunny-outline' },
    { id: 'culture', name: 'Culture', icon: 'people-outline' },
    { id: 'safety', name: 'Safety', icon: 'shield-checkmark-outline' },
  ];
  
  useEffect(() => {
    loadTips();
    loadAIDailyTip();
  }, [selectedCategory, searchText, currentTier]);

  const loadAIDailyTip = async () => {
    try {
      const aiTip = await travelTipsService.getAIDailyTip();
      setDailyTip(aiTip);
    } catch (error) {
      console.error('Failed to load AI daily tip, falling back to static tip:', error);
      // Fallback to a basic static tip
      setDailyTip({
        id: 'fallback-daily',
        title: 'Travel Smart',
        content: 'Always pack one extra day of essentials and keep important documents in multiple locations.',
        category: 'packing',
        requiredTier: 'free',
        tags: ['essentials', 'documents', 'safety'],
        rating: 4.5,
        usageCount: 0,
      });
    }
  };
  
  const loadTips = () => {
    let newTips: TravelTip[] = [];
    
    if (searchText) {
      newTips = travelTipsService.searchTips(searchText, currentTier);
    } else if (selectedCategory === 'all') {
      // Get tips from recent trips + general tips
      const recentTrip = trips.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      
      if (recentTrip) {
        newTips = travelTipsService.getTipsForTrip(recentTrip, currentTier !== 'free');
      } else {
        newTips = travelTipsService.getTipsByCategory('general', currentTier !== 'free');
      }
    } else {
      newTips = travelTipsService.getTipsByCategory(selectedCategory as any, currentTier !== 'free');
    }
    
    setTips(newTips);
  };
  
  const handleTipPress = (tip: TravelTip) => {
    if (tip.isPremium && currentTier === 'free') {
      navigation.navigate('Premium');
      return;
    }
    
    travelTipsService.incrementTipUsage(tip.id);
    // In a real app, this would open a detailed tip view
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        
        {/* Header */}
        <View className="bg-white border-b border-gray-100" style={{ paddingTop: insets.top }}>
          <View className="px-6 py-4">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-2xl font-bold text-gray-900">Travel Tips</Text>
                <Text className="text-gray-600 mt-1">
                  {currentTier !== 'free' ? 'Destination-specific insights' : 'Practical advice every traveler can use'}
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
            

            
            {/* Search */}
            <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center mb-4">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search travel tips..."
                className="flex-1 ml-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    className={cn(
                      "flex-row items-center px-4 py-2 rounded-full mr-3",
                      selectedCategory === category.id ? "bg-indigo-100" : "bg-gray-100"
                    )}
                  >
                    <Ionicons 
                      name={category.icon as any} 
                      size={16} 
                      color={selectedCategory === category.id ? "#4F46E5" : "#6B7280"} 
                    />
                    <Text className={cn(
                      "font-medium ml-2",
                      selectedCategory === category.id ? "text-indigo-600" : "text-gray-600"
                    )}>
                      {category.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
        
        {/* Tips List */}
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Daily Tip Banner */}
          {dailyTip && (
            <Animated.View 
              entering={FadeInDown.duration(500)}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="bulb" size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">Tip of the Day</Text>
                  <Text className="text-gray-600">{dailyTip.title}</Text>
                </View>
              </View>
              <Text className="text-gray-700 leading-6">
                {dailyTip.content}
              </Text>
            </Animated.View>
          )}
          
          {tips.map((tip, index) => (
            <TipCard
              key={tip.id}
              tip={tip}
              onPress={() => handleTipPress(tip)}
              currentTier={currentTier}
            />
          ))}
          
          {tips.length === 0 && (
            <View className="items-center justify-center py-12">
              <Text className="text-xl font-bold text-gray-900 mb-2">No tips found</Text>
              <Text className="text-gray-600 text-center">
                {searchText ? 'Try adjusting your search' : 'Create a trip to get personalized tips'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}