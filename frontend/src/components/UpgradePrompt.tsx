import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, FadeOutDown } from 'react-native-reanimated';

import { SubscriptionTier } from '../types';
import { useUserStore } from '../state/userStore';
import { SUBSCRIPTION_FEATURES } from '../services/subscriptionService';
import { cn } from '../utils/cn';

interface UpgradePromptProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  feature: string;
  currentTier: SubscriptionTier;
  suggestedTier: SubscriptionTier;
}

const FEATURE_DESCRIPTIONS = {
  'createTrip': {
    title: 'Trip Limit Reached',
    description: 'You have reached your trip limit for this month.',
    icon: 'briefcase' as keyof typeof Ionicons.glyphMap,
  },
  'createTemplate': {
    title: 'Template Limit Reached',
    description: 'You have reached your template creation limit for this month.',
    icon: 'folder' as keyof typeof Ionicons.glyphMap,
  },
  'createJournalEntry': {
    title: 'Journal Limit Reached',
    description: 'You have reached your journal entry limit for this month.',
    icon: 'journal' as keyof typeof Ionicons.glyphMap,
  },
  'sharePackingList': {
    title: 'Sharing Limit Reached',
    description: 'You have reached your packing list sharing limit for this month.',
    icon: 'share' as keyof typeof Ionicons.glyphMap,
  },
  'exportPdf': {
    title: 'Export Limit Reached',
    description: 'You have reached your PDF export limit for this month.',
    icon: 'document' as keyof typeof Ionicons.glyphMap,
  },
};

export default function UpgradePrompt({
  visible,
  onClose,
  onUpgrade,
  feature,
  currentTier,
  suggestedTier,
}: UpgradePromptProps) {
  const featureInfo = FEATURE_DESCRIPTIONS[feature as keyof typeof FEATURE_DESCRIPTIONS];
  const suggestedFeatures = SUBSCRIPTION_FEATURES[suggestedTier];
  
  if (!featureInfo) return null;

  const getFeatureValue = (tier: SubscriptionTier, featureKey: string) => {
    const features = SUBSCRIPTION_FEATURES[tier];
    switch (featureKey) {
      case 'createTrip':
        return features.maxActiveTrips;
      case 'createTemplate':
        return features.maxTemplatesCreatedPerMonth;
      case 'createJournalEntry':
        return features.maxJournalEntriesPerMonth;
      case 'sharePackingList':
        return features.maxPackingListSharesPerMonth;
      case 'exportPdf':
        return features.maxPDFExportsPerMonth;
      default:
        return 0;
    }
  };

  const formatValue = (value: number | 'unlimited') => {
    return value === 'unlimited' ? 'Unlimited' : value.toString();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View 
        entering={FadeIn}
        className="flex-1 bg-black/50 justify-center items-center px-4"
      >
        <Animated.View
          entering={FadeInUp}
          exiting={FadeOutDown}
          className="bg-white rounded-2xl p-6 w-full max-w-sm"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20 }}
        >
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
              <Ionicons name={featureInfo.icon} size={32} color="#DC2626" />
            </View>
            
            <Text className="text-xl font-bold text-gray-900 text-center mb-2">
              {featureInfo.title}
            </Text>
            
            <Text className="text-gray-600 text-center leading-relaxed">
              {featureInfo.description}
            </Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Upgrade to {suggestedTier.charAt(0).toUpperCase() + suggestedTier.slice(1)} for:
            </Text>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600">This feature:</Text>
              <Text className="font-semibold text-gray-900">
                {formatValue(getFeatureValue(suggestedTier, feature))}
              </Text>
            </View>
            
            {suggestedFeatures.cloudSync && (
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-gray-600">Cloud sync:</Text>
                <Text className="font-semibold text-green-600">Included</Text>
              </View>
            )}
            
            {suggestedFeatures.adFree && (
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-gray-600">Ad-free:</Text>
                <Text className="font-semibold text-green-600">Included</Text>
              </View>
            )}
          </View>

          <View className="space-y-3">
            <Pressable
              onPress={onUpgrade}
              className="bg-indigo-600 py-4 px-6 rounded-xl"
            >
              <Text className="text-white text-center font-semibold text-base">
                Upgrade Now
              </Text>
            </Pressable>
            
            <Pressable
              onPress={onClose}
              className="py-3 px-6"
            >
              <Text className="text-gray-500 text-center font-medium">
                Maybe Later
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}