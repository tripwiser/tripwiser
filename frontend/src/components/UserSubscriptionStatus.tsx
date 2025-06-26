import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../state/userStore';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  upgradeButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    color: '#6B7280',
    fontSize: 14,
  },
});

interface UserSubscriptionStatusProps {
  style?: any;
  showUpgradeButton?: boolean;
}

export default function UserSubscriptionStatus({ 
  style, 
  showUpgradeButton = true 
}: UserSubscriptionStatusProps) {
  const navigation = useNavigation();
  const { getEffectiveTier } = useUserStore();
  
  const currentTier = getEffectiveTier();

  const handleUpgradePress = () => {
    navigation.navigate('Subscription' as never);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.icon}>
            <Ionicons 
              name={currentTier === 'free' ? 'gift-outline' : 'star'} 
              size={16} 
              color="#4F46E5" 
            />
          </View>
          <Text style={styles.title}>
            {currentTier === 'free' ? 'Free Plan' : `${currentTier} Plan`}
          </Text>
        </View>
        
        {currentTier === 'free' && showUpgradeButton && (
          <Pressable
            onPress={handleUpgradePress}
            style={styles.upgradeButton}
          >
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </Pressable>
        )}
      </View>
      
      <Text style={styles.description}>
        {currentTier === 'free' 
          ? 'Unlock unlimited trips and premium features'
          : `Enjoying ${currentTier} features and benefits`
        }
      </Text>
    </View>
  );
}