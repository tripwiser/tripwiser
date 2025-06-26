import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInUp, 
  FadeInDown, 
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { SubscriptionTier } from '../types';
import { useUserStore } from '../state/userStore';
import { SUBSCRIPTION_PRICING } from '../services/subscriptionService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  billingToggle: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  toggleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    padding: 4,
    flexDirection: 'row',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#1f2937',
  },
  toggleText: {
    fontWeight: '600',
    marginRight: 4,
  },
  toggleTextActive: {
    color: 'white',
  },
  toggleTextInactive: {
    color: '#6b7280',
  },
  savingsBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  savingsText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    padding: 24,
    backgroundColor: 'white',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  planCardSelected: {
    borderColor: '#4F46E5',
  },
  planCardUnselected: {
    borderColor: '#F3F4F6',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  planNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  popularBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceSection: {
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
  },
  priceAmber: {
    color: '#F59E0B',
  },
  pricePurple: {
    color: '#8B5CF6',
  },
  period: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  savingsBadgeInline: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  savingsTextInline: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tagline: {
    color: '#6B7280',
    marginTop: 4,
  },
  featuresSection: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureIconAmber: {
    backgroundColor: '#FEF3C7',
  },
  featureIconPurple: {
    backgroundColor: '#F3E8FF',
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  featureTextHeader: {
    fontWeight: '600',
    color: '#6B7280',
  },
  ctaContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  ctaButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  ctaSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
});

interface PlanData {
  name: string;
  emoji: string;
  tagline: string;
  price: { monthly: number; yearly: number };
  savings: number;
  color: string;
  isPopular: boolean;
  popularText?: string;
  features: string[];
}

const PLAN_DATA: Record<'pro' | 'elite', PlanData> = {
  pro: {
    name: 'Pro',
    emoji: '⭐',
    tagline: 'For solo travelers and casual explorers',
    price: { monthly: 5, yearly: 48 },
    savings: 20,
    color: '#F59E0B',
    isPopular: true,
    popularText: 'MOST POPULAR',
    features: [
      '🔓 Unlimited trips',
      '✍️ 20 journal memories/month',
      '👥 Trip collaboration (3 people)',
      '📋 Create 1 custom template/month',
      '🧾 Use unlimited templates',
      '📥 Import custom lists',
      '📤 Unlimited PDF / links export',
      '📱 Offline access',
      '☁️ Cloud sync across devices',
      '🚫 Ad-free experience',
    ]
  },
  elite: {
    name: 'Elite',
    emoji: '💎',
    tagline: 'For group travelers and power planners - capture everything & leave nothing behind', 
    price: { monthly: 9, yearly: 81 },
    savings: 25,
    color: '#8B5CF6',
    isPopular: true,
    popularText: 'BEST VALUE',
    features: [ // Updated features
      '✅ Everything in Pro',
      '👥 Collaborate with unlimited people',
      '✍️ Unlimited journal memories',
      '📋 Create unlimited planning templates',
      '🛠️ Priority support', 
    ]
  }
};

interface PlanCardProps {
  plan: 'pro' | 'elite';
  isSelected: boolean;
  isYearly: boolean;
  onSelect: () => void;
}

function PlanCard({ plan, isSelected, isYearly, onSelect }: PlanCardProps) {
  const data = PLAN_DATA[plan];
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.98, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 100 });
    });
    onSelect();
  };

  const isPro = plan === 'pro';
  const price = isYearly ? data.price.yearly : data.price.monthly;
  const period = isYearly ? 'year' : 'month';

  return (
    <Animated.View
      entering={FadeInUp.delay(isPro ? 0 : 200).duration(800)}
      style={animatedStyle}
    >
      <Pressable onPress={handlePress}>
        <View style={[
          styles.planCard,
          isSelected ? styles.planCardSelected : styles.planCardUnselected
        ]}>
          {/* Header */}
          <View style={styles.planHeader}>
            <View style={styles.planNameSection}>
              <Text style={styles.planEmoji}>{data.emoji}</Text>
              <View>
                <Text style={styles.planName}>{data.name}</Text>
                {data.isPopular && (
                  <View style={[
                    styles.popularBadge,
                    { backgroundColor: data.color }
                  ]}>
                    <Text style={styles.popularText}>
                      {data.popularText || 'POPULAR'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            {isSelected && (
              <View style={[styles.checkmark, { backgroundColor: '#4F46E5' }]}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            )}
          </View>

          {/* Price Section - Updated to remove subtitle */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={[
                styles.price,
                isPro ? styles.priceAmber : styles.pricePurple
              ]}>
                ${price}
              </Text>
              <Text style={styles.period}>/{period}</Text>
              {isYearly && (
                <View style={styles.savingsBadgeInline}>
                  <Text style={styles.savingsTextInline}>Save {data.savings}%</Text>
                </View>
              )}
            </View>
            <Text style={styles.tagline}>{data.tagline}</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            {data.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={[
                  styles.featureIcon,
                  isPro ? styles.featureIconAmber : styles.featureIconPurple
                ]}>
                  <Ionicons 
                    name="checkmark" 
                    size={12} 
                    color={data.color} 
                  />
                </View>
                <Text style={[
                  styles.featureText,
                  index === 0 && !isPro ? styles.featureTextHeader : null
                ]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function SubscriptionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { getEffectiveTier, upgradeSubscription } = useUserStore();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'elite'>('pro');
  
  const currentTier = getEffectiveTier();

  const handleUpgrade = () => {
    const planData = PLAN_DATA[selectedPlan];
    Alert.alert(
      `Upgrade to ${planData.name}`,
      `Start your premium journey for just $${isYearly ? planData.price.yearly : planData.price.monthly}/${isYearly ? 'year' : 'month'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            const expiry = new Date();
            expiry.setFullYear(expiry.getFullYear() + 1);
            upgradeSubscription(selectedPlan, expiry.toISOString());
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#f1f5f9', '#e2e8f0']}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </Pressable>
            <Text style={styles.headerTitle}>Premium Plans</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Section */}
            <Animated.View 
              entering={FadeInDown.duration(800)}
              style={styles.heroSection}
            >
              <Text style={styles.heroTitle}>
                Unlock Your Ultimate{'\n'}Travel Kit 🧳
              </Text>
              <Text style={styles.heroSubtitle}>
                Plan smarter, pack as a team, and capture the moments that matter — all in one place.
              </Text>
            </Animated.View>

            {/* Billing Toggle */}
            <Animated.View 
              entering={FadeInDown.delay(300).duration(800)}
              style={styles.billingToggle}
            >
              <View style={styles.toggleContainer}>
                <Pressable
                  onPress={() => setIsYearly(false)}
                  style={[
                    styles.toggleButton,
                    !isYearly ? styles.toggleButtonActive : null
                  ]}
                >
                  <Text style={[
                    styles.toggleText,
                    !isYearly ? styles.toggleTextActive : styles.toggleTextInactive
                  ]}>
                    Monthly
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setIsYearly(true)}
                  style={[
                    styles.toggleButton,
                    isYearly ? styles.toggleButtonActive : null
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[
                      styles.toggleText,
                      isYearly ? styles.toggleTextActive : styles.toggleTextInactive
                    ]}>
                      Yearly
                    </Text>
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>25% OFF</Text>
                    </View>
                  </View>
                </Pressable>
              </View>
            </Animated.View>

            {/* Plan Cards */}
            <PlanCard 
              plan="pro"
              isSelected={selectedPlan === 'pro'}
              isYearly={isYearly}
              onSelect={() => setSelectedPlan('pro')}
            />
            
            <PlanCard 
              plan="elite"
              isSelected={selectedPlan === 'elite'}
              isYearly={isYearly}
              onSelect={() => setSelectedPlan('elite')}
            />
          </ScrollView>

          {/* CTA Button */}
          <View style={[
            styles.ctaContainer,
            { paddingBottom: insets.bottom + 16 }
          ]}>
            <Pressable
              onPress={handleUpgrade}
              style={[styles.ctaButton, { backgroundColor: '#4F46E5' }]}
            >
              <Text style={styles.ctaButtonText}>
                Start Your Journey
              </Text>
              <Text style={styles.ctaSubtext}>
                7 days free, then {selectedPlan === 'pro' ? '$5/month' : '$9/month'} • Cancel anytime
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}