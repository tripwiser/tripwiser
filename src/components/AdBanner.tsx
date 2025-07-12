import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  Linking,
} from 'react-native';
import Animated, { 
  FadeInDown,
  FadeOutDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '../state/userStore';
import { SubscriptionService } from '../services/subscriptionService';

interface AdData {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
  targetUrl: string;
  category: 'travel' | 'lifestyle' | 'productivity';
}

// Mock ad data - in a real app, this would come from an ad network
const mockAds: AdData[] = [
  {
    id: 'ad-1',
    title: 'Book Your Next Adventure',
    description: 'Find the best travel deals and save up to 40% on flights',
    ctaText: 'Book Now',
    targetUrl: 'https://example.com/travel',
    category: 'travel',
  },
  {
    id: 'ad-2',
    title: 'Travel Insurance Made Easy',
    description: 'Protect your trip with comprehensive travel insurance',
    ctaText: 'Get Quote',
    targetUrl: 'https://example.com/insurance',
    category: 'travel',
  },
  {
    id: 'ad-3',
    title: 'Language Learning App',
    description: 'Learn the local language before your trip',
    ctaText: 'Try Free',
    targetUrl: 'https://example.com/language',
    category: 'lifestyle',
  },
  {
    id: 'ad-4',
    title: 'Digital Nomad Tools',
    description: 'Essential apps for remote work while traveling',
    ctaText: 'Explore',
    targetUrl: 'https://example.com/nomad',
    category: 'productivity',
  },
];

interface AdBannerProps {
  category?: 'travel' | 'lifestyle' | 'productivity';
  style?: 'banner' | 'card' | 'inline';
  onClose?: () => void;
}

export default function AdBanner({ 
  category = 'travel', 
  style = 'banner',
  onClose 
}: AdBannerProps) {
  const getEffectiveTier = useUserStore((state) => state.getEffectiveTier);
  const [currentAd, setCurrentAd] = useState<AdData | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const opacity = useSharedValue(1);
  
  const currentTier = getEffectiveTier();
  const features = SubscriptionService.getFeatures(currentTier);
  
  // Don't show ads if user has ad-free subscription
  if (features.adFree) {
    return null;
  }
  
  useEffect(() => {
    loadAd();
  }, [category]);
  
  const loadAd = () => {
    // Filter ads by category and select randomly
    const categoryAds = mockAds.filter(ad => ad.category === category);
    if (categoryAds.length > 0) {
      const randomAd = categoryAds[Math.floor(Math.random() * categoryAds.length)];
      setCurrentAd(randomAd);
    }
  };
  
  const handleAdPress = async () => {
    if (currentAd?.targetUrl) {
      // In a real app, you'd track ad clicks here
      try {
        await Linking.openURL(currentAd.targetUrl);
      } catch (error) {
        console.error('Failed to open ad URL:', error);
      }
    }
  };
  
  const handleClose = () => {
    opacity.value = withTiming(0, { duration: 300 }, () => {
      setIsVisible(false);
      onClose?.();
    });
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  if (!currentAd || !isVisible) {
    return null;
  }
  
  if (style === 'banner') {
    return (
      <Animated.View 
        entering={FadeInDown.duration(500)}
        style={animatedStyle}
        className="mx-4 mb-4"
      >
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <LinearGradient
            colors={['#F8FAFC', '#F1F5F9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 16 }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="bg-blue-100 px-2 py-1 rounded">
                <Text className="text-blue-600 text-xs font-medium">Sponsored</Text>
              </View>
              {onClose && (
                <Pressable onPress={handleClose} className="p-1">
                  <Ionicons name="close" size={16} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
            
            <Pressable onPress={handleAdPress} className="flex-row items-center">
              <View className="flex-1 mr-3">
                <Text className="text-lg font-bold text-gray-900 mb-1">
                  {currentAd.title}
                </Text>
                <Text className="text-gray-600 text-sm leading-5 mb-3">
                  {currentAd.description}
                </Text>
                
                <View className="bg-blue-500 px-4 py-2 rounded-lg self-start">
                  <Text className="text-white font-semibold text-sm">
                    {currentAd.ctaText}
                  </Text>
                </View>
              </View>
              
              <View className="w-16 h-16 bg-gray-100 rounded-xl items-center justify-center">
                <Ionicons name="airplane" size={24} color="#6B7280" />
              </View>
            </Pressable>
          </LinearGradient>
        </View>
      </Animated.View>
    );
  }
  
  if (style === 'card') {
    return (
      <Animated.View 
        entering={FadeInDown.duration(500)}
        style={animatedStyle}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4"
      >
        <Pressable onPress={handleAdPress} className="p-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="bg-green-100 px-2 py-1 rounded">
              <Text className="text-green-600 text-xs font-medium">Ad</Text>
            </View>
            {onClose && (
              <Pressable onPress={handleClose} className="p-1">
                <Ionicons name="close" size={16} color="#9CA3AF" />
              </Pressable>
            )}
          </View>
          
          <Text className="text-lg font-bold text-gray-900 mb-2">
            {currentAd.title}
          </Text>
          <Text className="text-gray-600 text-sm leading-5 mb-3">
            {currentAd.description}
          </Text>
          
          <View className="flex-row items-center justify-between">
            <View className="bg-blue-500 px-3 py-2 rounded-lg">
              <Text className="text-white font-semibold text-sm">
                {currentAd.ctaText}
              </Text>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </Pressable>
      </Animated.View>
    );
  }
  
  // Inline style
  return (
    <Animated.View 
      entering={FadeInDown.duration(500)}
      style={animatedStyle}
      className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-blue-600 text-xs font-medium">Sponsored</Text>
        {onClose && (
          <Pressable onPress={handleClose} className="p-1">
            <Ionicons name="close" size={14} color="#9CA3AF" />
          </Pressable>
        )}
      </View>
      
      <Pressable onPress={handleAdPress} className="flex-row items-center">
        <View className="flex-1 mr-3">
          <Text className="text-gray-900 font-semibold text-sm mb-1">
            {currentAd.title}
          </Text>
          <Text className="text-gray-600 text-xs">
            {currentAd.description}
          </Text>
        </View>
        
        <View className="bg-blue-500 px-3 py-1 rounded">
          <Text className="text-white text-xs font-medium">
            {currentAd.ctaText}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}