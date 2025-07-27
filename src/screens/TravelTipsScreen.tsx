import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Dimensions,
  Image,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Share,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionTier } from '../types';
import axios from 'axios';
import { useTheme } from '../theme/ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');

const TipCard = React.memo(function TipCard({
  tip,
  onPress,
  currentTier,
  isUserTip,
}: {
  tip: TravelTip;
  onPress: () => void;
  currentTier: string;
  isUserTip?: boolean;
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
              {/* @ts-ignore */}
              {isUserTip && tip.privacy === 'private' && (
                <View className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full">
                  <Text className="text-xs text-gray-700 font-semibold">You</Text>
                </View>
              )}
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
  const theme = useTheme();
  
  const getEffectiveTier = useUserStore((state) => state.getEffectiveTier);
  const currentTier = getEffectiveTier();
  const trips = useTripStore((state) => state.trips);
  
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tips, setTips] = useState<TravelTip[]>([]);
  const [dailyTip, setDailyTip] = useState<TravelTip | null>(null);
  const [dailyTipRating, setDailyTipRating] = useState(dailyTip?.rating || 0);
  const [showRatingInput, setShowRatingInput] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTipTitle, setNewTipTitle] = useState('');
  const [newTipContent, setNewTipContent] = useState('');
  const [newTipCategory, setNewTipCategory] = useState('packing');
  const [newTipTags, setNewTipTags] = useState('');
  const [tipPrivacy, setTipPrivacy] = useState<'public' | 'private'>('public');
  const [userTips, setUserTips] = useState<TravelTip[]>([]);
  const [moderating, setModerating] = useState(false);
  const [moderationMessage, setModerationMessage] = useState('');
  const [moderationRejected, setModerationRejected] = useState<{ reason: string } | null>(null);
  const [selectedTip, setSelectedTip] = useState<TravelTip | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [currentRating, setCurrentRating] = useState<number>(0);
  const userId = useUserStore.getState().user?.id || '64b7f8c2e1a2b3c4d5e6f7a8';

  // Load comments and rating when a tip is selected
  useEffect(() => {
    if (selectedTip) {
      travelTipsService.getComments(selectedTip.id).then(res => {
        if (res.success) setComments(res.comments || []);
        else setComments([]);
      });
      // Find current user's rating if exists
      const ratingsArr = (selectedTip as any).ratings || [];
      if (ratingsArr.length > 0) {
        const userRating = ratingsArr.find((r: any) => r.user === userId);
        setCurrentRating(userRating ? userRating.value : 0);
      } else {
        setCurrentRating(0);
      }
    }
  }, [selectedTip]);

  const handleRate = async (value: number) => {
    if (!selectedTip) return;
    setCurrentRating(value);
    await travelTipsService.rateTip(selectedTip.id, userId, value);
  };

  const handleAddComment = async () => {
    if (!selectedTip || !commentText.trim()) return;
    const res = await travelTipsService.addComment(selectedTip.id, userId, commentText.trim());
    if (res.success) {
      setComments(res.comments || []);
      setCommentText('');
    }
  };

  const handleShare = async () => {
    if (!selectedTip) return;
    await Share.share({ message: `${selectedTip.title}\n${selectedTip.content}` });
  };

  // Helper functions for category icon/color (copied from TipCard)
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
      // Save the generated tip to AsyncStorage
      try {
        await AsyncStorage.setItem('dailyTip', JSON.stringify(aiTip));
      } catch (err) {
        console.error('Failed to save daily tip to AsyncStorage:', err);
      }
    } catch (error) {
      console.error('Failed to load AI daily tip, falling back to static tip:', error);
      // Fallback to a basic static tip
      setDailyTip({
        id: 'fallback-daily',
        title: 'Travel Smart',
        content: 'Always pack one extra day of essentials and keep important documents in multiple locations.',
        category: 'packing',
        requiredTier: 'free' as SubscriptionTier,
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
    setSelectedTip(tip);
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        
        {/* Header */}
        <View className="bg-white border-b border-gray-100" style={{ marginTop: 0, paddingTop: 8 }}>
          <View className="px-6 py-2" style={{ paddingTop: 0 }}>
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-2xl font-bold text-gray-900">Travel Tips</Text>
                <Text className="text-gray-600 mt-1">
                  {currentTier !== 'free' ? 'Destination-specific insights' : 'Practical advice every traveler'}
                </Text>
              </View>
              <Pressable
                onPress={() => setShowCreateModal(true)}
                style={{ borderRadius: 12, overflow: 'hidden' }}
              >
                <LinearGradient
                  colors={['#4F46E5', '#6366F1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}
                >
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={{ color: 'white', fontWeight: '600', marginLeft: 4 }}>Create</Text>
                </LinearGradient>
              </Pressable>
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
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{backgroundColor: getCategoryColor(dailyTip.category)[0] + '20'}}>
                  <Ionicons name={getCategoryIcon(dailyTip.category)} size={20} color={getCategoryColor(dailyTip.category)[0]} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">Tip of the Day</Text>
                  <Text className="text-gray-600">{dailyTip.title}</Text>
                </View>
              </View>
              <Text className="text-gray-700 leading-6 mb-2">
                {dailyTip.content.length > 100 ? `${dailyTip.content.slice(0, 100).trim()}...` : dailyTip.content}
              </Text>
              {/* Category and Rating Row */}
              <View className="flex-row items-center mb-2">
                <View className="bg-gray-100 px-3 py-1 rounded-full">
                  <Text className="text-gray-700 text-sm font-medium capitalize">{dailyTip.category || 'general'}</Text>
                </View>
                <View className="flex-row items-center ml-2">
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text className="ml-1 text-gray-600 text-sm">{dailyTipRating.toFixed(1)}</Text>
                </View>
              </View>
              {/* Tags below the tip */}
              {dailyTip.tags && dailyTip.tags.length > 0 && (
                <View className="flex-row flex-wrap mt-1 mb-1">
                  {dailyTip.tags.slice(0, 4).map((tag, index) => (
                    <View key={index} className="bg-gray-50 px-2 py-1 rounded mr-2 mb-1">
                      <Text className="text-gray-600 text-xs">#{tag}</Text>
                    </View>
                  ))}
                  {dailyTip.tags.length > 4 && (
                    <View className="bg-gray-50 px-2 py-1 rounded">
                      <Text className="text-gray-600 text-xs">+{dailyTip.tags.length - 4} more</Text>
                    </View>
                  )}
                </View>
              )}
            </Animated.View>
          )}
          
          {/* User-created tips */}
          {userTips.map((tip, index) => (
            <TipCard
              key={tip.id}
              tip={tip}
              onPress={() => handleTipPress(tip)}
              currentTier={currentTier}
              isUserTip={true}
            />
          ))}
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
      {/* Create Tip Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View className="flex-1 justify-end bg-black/40">
            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
              <Text className="text-xl font-bold text-gray-900 mb-4">Create New Tip</Text>
              <TextInput
                value={newTipTitle}
                onChangeText={setNewTipTitle}
                placeholder="Title"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3"
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                value={newTipContent}
                onChangeText={setNewTipContent}
                placeholder="Tip content (max 100 chars)"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3"
                placeholderTextColor="#9CA3AF"
                maxLength={100}
                multiline
              />
              <Text className="mb-1 text-gray-700 font-medium">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                <View className="flex-row">
                  {categories.map((category) => (
                    <Pressable
                      key={category.id}
                      onPress={() => setNewTipCategory(category.id)}
                      className={cn(
                        "px-4 py-2 rounded-full mr-3",
                        newTipCategory === category.id ? "bg-indigo-100" : "bg-gray-100"
                      )}
                    >
                      <Text className={cn(
                        "font-medium",
                        newTipCategory === category.id ? "text-indigo-600" : "text-gray-600"
                      )}>
                        {category.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
              <TextInput
                value={newTipTags}
                onChangeText={setNewTipTags}
                placeholder="Tags (comma separated)"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6"
                placeholderTextColor="#9CA3AF"
              />
              {/* Privacy Toggle */}
              <Text className="mb-1 text-gray-700 font-medium">Visibility</Text>
              <View className="flex-row mb-6">
                {['public', 'private'].map((privacy) => (
                  <Pressable
                    key={privacy}
                    onPress={() => setTipPrivacy(privacy as 'public' | 'private')}
                    className={cn(
                      "px-4 py-2 rounded-full mr-3",
                      tipPrivacy === privacy ? "bg-indigo-100" : "bg-gray-100"
                    )}
                  >
                    <Text className={cn(
                      "font-medium capitalize",
                      tipPrivacy === privacy ? "text-indigo-600" : "text-gray-600"
                    )}>
                      {privacy}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={{ height: 12 }} />
              <View className="flex-col space-y-3">
                <Pressable
                  onPress={async () => {
                    if (tipPrivacy === 'private') {
                      const newTip = {
                        id: `user-tip-${Date.now()}`,
                        title: newTipTitle,
                        content: newTipContent,
                        category: newTipCategory as 'packing' | 'destination' | 'general' | 'weather' | 'culture' | 'safety',
                        tags: newTipTags.split(',').map(t => t.trim()).filter(Boolean),
                        rating: 0,
                        requiredTier: 'free' as SubscriptionTier,
                        isDailyTip: false,
                        isPremium: false,
                        usageCount: 0,
                        createdByUser: true,
                        // @ts-ignore
                        privacy: tipPrivacy,
                      };
                      setUserTips([newTip, ...userTips]);
                      setShowCreateModal(false);
                      setNewTipTitle('');
                      setNewTipContent('');
                      setNewTipCategory('packing');
                      setNewTipTags('');
                      setTipPrivacy('public');
                      return;
                    }
                    // Public tip: submit to backend for AI moderation and posting
                    setModerating(true);
                    setModerationMessage('Verifying your tip...');
                    setModerationRejected(null);
                    try {
                      let userId = useUserStore.getState().user?.id;
                      if (!userId) {
                        // Use a demo user ObjectId for testing
                        userId = '64b7f8c2e1a2b3c4d5e6f7a8';
                      }
                      const tripId = useTripStore.getState().currentTrip?._id || (trips[0] && (trips[0]._id || trips[0].id));
                      if (!userId) {
                        setModerationRejected({ reason: 'User not selected.' });
                        setModerating(false);
                        return;
                      }
                      const res = await travelTipsService.submitUserTip(userId, tripId, newTipContent);
                      if (res.success) {
                        const tipData = res.tip || {};
                        const newTip = {
                          id: tipData._id || `user-tip-${Date.now()}`,
                          title: newTipTitle,
                          content: newTipContent,
                          category: newTipCategory as any,
                          tags: newTipTags.split(',').map(t => t.trim()).filter(Boolean),
                          rating: 0,
                          requiredTier: 'free' as SubscriptionTier,
                          isDailyTip: false,
                          isPremium: false,
                          usageCount: 0,
                          createdByUser: true,
                          privacy: tipPrivacy,
                        };
                        setUserTips([newTip, ...userTips]);
                        setShowCreateModal(false);
                        setNewTipTitle('');
                        setNewTipContent('');
                        setNewTipCategory('packing');
                        setNewTipTags('');
                        setTipPrivacy('public');
                        setModerating(false);
                      } else {
                        setModerationRejected({ reason: res.reason || res.message || 'Tip rejected.' });
                        setModerating(false);
                      }
                    } catch (err: any) {
                      setModerationRejected({ reason: 'Submission failed. Please try again.' });
                      setModerating(false);
                    }
                  }}
                  style={{ borderRadius: 12, overflow: 'hidden' }}
                >
                  <LinearGradient
                    colors={['#4F46E5', '#6366F1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 12, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Create Tip</Text>
                  </LinearGradient>
                </Pressable>
                <Pressable
                  onPress={() => setShowCreateModal(false)}
                  className="bg-gray-100 rounded-xl py-3 items-center"
                  style={{ marginTop: 12 }}
                >
                  <Text className="text-gray-700 font-semibold">Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* Moderation Loading Modal */}
      <Modal visible={moderating || !!moderationRejected} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center">
          {moderationRejected ? (
            <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 32, alignItems: 'center', maxWidth: 320 }}>
              <Text className="text-lg font-bold text-red-600 mb-2">Tip Rejected</Text>
              <Text className="text-gray-700 mb-4 text-center">{moderationRejected.reason && moderationRejected.reason.trim() ? moderationRejected.reason : 'No reason provided by AI.'}</Text>
              <Pressable
                onPress={() => setModerationRejected(null)}
                className="bg-gray-100 rounded-xl py-3 px-8 items-center"
              >
                <Text className="text-gray-700 font-semibold">Dismiss</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 32, alignItems: 'center' }}>
              <Text className="text-lg font-semibold mb-2">{moderationMessage || 'Verifying your tip...'}</Text>
              <Text className="text-gray-500">Our team is verifying your tip for safety and quality.</Text>
            </View>
          )}
        </View>
      </Modal>
      {/* Tip Detail Modal */}
      <Modal
        visible={!!selectedTip}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTip(null)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 28, width: '92%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 8 }}>
            {selectedTip && (
              <>
                <Text style={{ fontWeight: 'bold', fontSize: 24, textAlign: 'center', marginBottom: 8, color: '#222' }}>{selectedTip.title}</Text>
                <Text style={{ fontSize: 17, color: '#444', textAlign: 'center', marginBottom: 18, lineHeight: 24 }}>{selectedTip.content}</Text>
                {/* Rate Feature */}
                <Text style={{ fontWeight: '600', color: '#555', marginBottom: 4, textAlign: 'center' }}>Rate this tip</Text>
                <View style={{ flexDirection: 'row', marginVertical: 6, justifyContent: 'center', marginBottom: 12 }}>
                  {[1,2,3,4,5].map(star => (
                    <Pressable key={star} onPress={() => handleRate(star)}>
                      <Text style={{ fontSize: 32, color: star <= currentRating ? '#FFD700' : '#E5E7EB', marginHorizontal: 2 }}>{star <= currentRating ? '★' : '☆'}</Text>
                    </Pressable>
                  ))}
                </View>
                {/* Comment Feature */}
                <Text style={{ fontWeight: '600', color: '#555', marginTop: 10, marginBottom: 4 }}>Comments</Text>
                <ScrollView style={{ maxHeight: 120, marginBottom: 8 }}>
                  {comments.length === 0 && <Text style={{ color: '#AAA', textAlign: 'center', marginVertical: 8 }}>No comments yet.</Text>}
                  {comments.map((c, i) => (
                    <View key={i} style={{ backgroundColor: '#F3F4F6', borderRadius: 12, padding: 8, marginBottom: 6, alignSelf: 'flex-start', maxWidth: '90%' }}>
                      <Text style={{ color: '#333' }}>{c.text}</Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TextInput
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="Add a comment..."
                    style={{ flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, padding: 10, backgroundColor: '#F9FAFB', marginRight: 8 }}
                  />
                  <Pressable onPress={handleAddComment} style={{ backgroundColor: '#4F46E5', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 18 }}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Post</Text>
                  </Pressable>
                </View>
                {/* Share Feature */}
                <Pressable onPress={handleShare} style={{ marginTop: 8, alignItems: 'center', alignSelf: 'center', backgroundColor: '#EEF2FF', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 24, flexDirection: 'row' }}>
                  <Text style={{ color: '#4F46E5', fontWeight: 'bold', fontSize: 16, marginRight: 6 }}>Share</Text>
                  <Ionicons name="share-social-outline" size={20} color="#4F46E5" />
                </Pressable>
                <Pressable onPress={() => setSelectedTip(null)} style={{ marginTop: 18, alignItems: 'center' }}>
                  <Text style={{ color: '#6B7280', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}