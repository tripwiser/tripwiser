import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../state/userStore';
import { cn } from '../utils/cn';
import { useTheme } from '../theme/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const premiumFeatures = [
  {
    icon: 'infinite-outline',
    title: 'Unlimited Trips',
    description: 'Create as many adventures as your heart desires',
    colors: ['#667eea', '#764ba2'],
    emoji: '∞',
  },
  {
    icon: 'share-outline',
    title: 'Export & Share',
    description: 'Beautiful PDFs and seamless sharing with friends',
    colors: ['#f093fb', '#f5576c'],
    emoji: '📤',
  },
  {
    icon: 'people-outline',
    title: 'Collaboration',
    description: 'Pack together with your travel companions',
    colors: ['#4facfe', '#00f2fe'],
    emoji: '👥',
  },
  {
    icon: 'bulb-outline',
    title: 'Premium Tips',
    description: 'Expert advice from seasoned travelers',
    colors: ['#43e97b', '#38f9d7'],
    emoji: '💡',
  },
  {
    icon: 'cloud-outline',
    title: 'Cloud Sync',
    description: 'Access your trips across all devices seamlessly',
    colors: ['#fa709a', '#fee140'],
    emoji: '☁️',
  },
  {
    icon: 'analytics-outline',
    title: 'Advanced Analytics',
    description: 'Track your packing efficiency and patterns',
    colors: ['#a8edea', '#fed6e3'],
    emoji: '📊',
  },
];

const pricingPlans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$4.99',
    period: '/month',
    popular: false,
    colors: ['#667eea', '#764ba2'],
    savings: null,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$29.99',
    period: '/year',
    popular: true,
    colors: ['#f093fb', '#f5576c'],
    savings: 'Save 50%',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$79.99',
    period: 'one-time',
    popular: false,
    colors: ['#4facfe', '#00f2fe'],
    savings: 'Best Value',
  },
];

export default function PremiumScreen() {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  
  // Redirect to new subscription screen
  React.useEffect(() => {
    navigation.replace('Subscription');
  }, [navigation]);
  
  // Fallback content (shouldn't be seen due to redirect)
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Redirecting to subscription...</Text>
    </View>
  );
}

// Legacy PremiumScreen component (not used)
function LegacyPremiumScreen() {
  const navigation = useNavigation<NavigationProp>();
  const upgradeToPremium = useUserStore((state) => state.upgradeToPremium);
  const getEffectiveTier = useUserStore((state) => state.getEffectiveTier);
  const currentTier = getEffectiveTier();
  
  const [selectedPlan, setSelectedPlan] = React.useState('yearly');
  const buttonScale = useSharedValue(1);
  
  const handleUpgrade = () => {
    buttonScale.value = withSequence(
      withSpring(0.95, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );
    
    // In a real app, this would integrate with in-app purchases
    Alert.alert(
      'Upgrade to Premium',
      'This is a demo. In the real app, this would process your payment.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: () => {
            upgradeToPremium();
            Alert.alert(
              'Welcome to Premium! ✨',
              'You now have access to all premium features. Happy packing!',
              [{ text: 'Awesome!', onPress: () => navigation.goBack() }]
            );
          },
        },
      ]
    );
  };
  
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  
  const isPremium = currentTier === 'premium';
  const freeTripCount = 3; // Placeholder for actual free trip count

  if (isPremium) {
    return (
      <View className="flex-1">
        <StatusBar style="light" />
        
        {/* Premium Success Background */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0"
        />
        
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center px-8">
            <Animated.View entering={FadeInDown.duration(800)} className="items-center">
              {/* Success Icon */}
              <View className="w-32 h-32 bg-white/20 rounded-full items-center justify-center mb-8">
                <View className="w-24 h-24 bg-white/30 rounded-full items-center justify-center">
                  <Ionicons name="checkmark" size={48} color="white" />
                </View>
              </View>
              
              <Text className="text-4xl font-black text-white text-center mb-4">
                You're Premium! ⭐
              </Text>
              
              <Text className="text-xl text-white/90 text-center mb-12 leading-relaxed">
                Enjoy unlimited trips and all premium features. The world is your oyster!
              </Text>
              
              <Pressable
                onPress={() => navigation.goBack()}
                className="bg-white/20 backdrop-blur-sm rounded-2xl px-10 py-5"
              >
                <Text className="text-white font-bold text-xl">
                  Continue Packing ✈️
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFBFC' }}>
      <StatusBar style="light" />
      
      {/* Clean Header with Gradient */}
      <View style={{ position: 'relative' }}>
        <LinearGradient
          colors={['#4F46E5', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingBottom: 60 }}
        >
          <SafeAreaView>
            <Animated.View 
              entering={FadeInDown.duration(600)} 
              style={{ paddingHorizontal: 24, paddingTop: 40, alignItems: 'center' }}
            >
              {/* Cleaner Icon */}
              <View style={{
                width: 72,
                height: 72,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}>
                <Ionicons name="star" size={36} color="white" />
              </View>
              
              <Text style={{
                fontSize: 32,
                fontWeight: '800',
                color: 'white',
                textAlign: 'center',
                marginBottom: 12,
                letterSpacing: -0.5,
              }}>
                Go Premium
              </Text>
              
              <Text style={{
                fontSize: 18,
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                fontWeight: '500',
                lineHeight: 26,
              }}>
                Unlock the full potential of TripKit
              </Text>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
        
        {/* Improved Limit Warning */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          style={{ 
            marginHorizontal: 20, 
            marginTop: -30, 
            marginBottom: 32,
            zIndex: 10,
          }}
        >
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 20,
            shadowColor: '#F59E0B',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
            borderWidth: 1,
            borderColor: '#FEF3C7',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 48,
                height: 48,
                backgroundColor: '#FEF3C7',
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Text style={{ fontSize: 24 }}>🚀</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#92400E',
                  marginBottom: 4,
                  letterSpacing: -0.2,
                }}>
                  Free Plan Limit
                </Text>
                <Text style={{
                  fontSize: 15,
                  color: '#B45309',
                  fontWeight: '500',
                  lineHeight: 22,
                }}>
                  You've used {freeTripCount}/3 free trips. Time to upgrade!
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
      
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
      >
        {/* Clean Features Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <Text style={{
              fontSize: 28,
              fontWeight: '800',
              color: '#111827',
              marginBottom: 8,
              textAlign: 'center',
              letterSpacing: -0.5,
            }}>
              Premium Features
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#6B7280',
              textAlign: 'center',
              marginBottom: 32,
              fontWeight: '500',
              lineHeight: 24,
            }}>
              Everything you need for perfect packing
            </Text>
          </Animated.View>
          
          <View style={{ gap: 16 }}>
            {premiumFeatures.map((feature, index) => (
              <Animated.View
                key={feature.title}
                entering={FadeInRight.delay(400 + index * 80).duration(500)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  padding: 20,
                  shadowColor: '#4F46E5',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    overflow: 'hidden',
                    marginRight: 16,
                  }}>
                    <LinearGradient
                      colors={feature.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{feature.emoji}</Text>
                    </LinearGradient>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: '#111827',
                      marginBottom: 4,
                      letterSpacing: -0.2,
                    }}>
                      {feature.title}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: '#6B7280',
                      lineHeight: 20,
                      fontWeight: '500',
                    }}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>
        
        {/* Simplified Pricing Section */}
        <View style={{ paddingHorizontal: 20 }}>
          <Animated.View entering={FadeInDown.delay(800).duration(600)}>
            <Text style={{
              fontSize: 28,
              fontWeight: '800',
              color: '#111827',
              marginBottom: 8,
              textAlign: 'center',
              letterSpacing: -0.5,
            }}>
              Choose Your Plan
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#6B7280',
              textAlign: 'center',
              marginBottom: 32,
              fontWeight: '500',
              lineHeight: 24,
            }}>
              Start your premium journey today
            </Text>
          </Animated.View>
          
          <View style={{ gap: 12 }}>
            {pricingPlans.map((plan, index) => (
              <Animated.View
                key={plan.id}
                entering={FadeInDown.delay(900 + index * 100).duration(500)}
              >
                <Pressable
                  onPress={() => setSelectedPlan(plan.id)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 20,
                    padding: 20,
                    borderWidth: selectedPlan === plan.id ? 3 : 1,
                    borderColor: selectedPlan === plan.id ? '#4F46E5' : '#E5E7EB',
                    shadowColor: selectedPlan === plan.id ? '#4F46E5' : '#000',
                    shadowOffset: { width: 0, height: selectedPlan === plan.id ? 4 : 2 },
                    shadowOpacity: selectedPlan === plan.id ? 0.12 : 0.04,
                    shadowRadius: selectedPlan === plan.id ? 12 : 6,
                    elevation: selectedPlan === plan.id ? 6 : 2,
                    position: 'relative',
                  }}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <View style={{
                      position: 'absolute',
                      top: -8,
                      left: 20,
                      right: 20,
                      alignItems: 'center',
                      zIndex: 10,
                    }}>
                      <View style={{
                        backgroundColor: '#4F46E5',
                        paddingHorizontal: 16,
                        paddingVertical: 6,
                        borderRadius: 12,
                      }}>
                        <Text style={{
                          color: 'white',
                          fontWeight: '700',
                          fontSize: 12,
                          letterSpacing: 0.5,
                        }}>
                          🔥 MOST POPULAR
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginTop: plan.popular ? 12 : 0,
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 20,
                        fontWeight: '800',
                        color: '#111827',
                        marginBottom: 4,
                        letterSpacing: -0.3,
                      }}>
                        {plan.name}
                      </Text>
                      
                      {plan.savings && (
                        <View style={{
                          backgroundColor: '#EEF2FF',
                          alignSelf: 'flex-start',
                          paddingHorizontal: 12,
                          paddingVertical: 4,
                          borderRadius: 8,
                          marginBottom: 8,
                        }}>
                          <Text style={{
                            color: '#4F46E5',
                            fontWeight: '700',
                            fontSize: 12,
                          }}>
                            {plan.savings}
                          </Text>
                        </View>
                      )}
                      
                      <Text style={{
                        fontSize: 14,
                        color: '#6B7280',
                        fontWeight: '500',
                      }}>
                        {plan.id === 'lifetime' ? 'Pay once, use forever' : 
                         plan.id === 'yearly' ? 'Best value for travelers' : 
                         'Perfect for trying premium'}
                      </Text>
                    </View>
                    
                    <View style={{ alignItems: 'flex-end', marginLeft: 16 }}>
                      <Text style={{
                        fontSize: 28,
                        fontWeight: '800',
                        color: '#111827',
                        marginBottom: 2,
                        letterSpacing: -0.5,
                      }}>
                        {plan.price}
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: '#6B7280',
                        fontWeight: '600',
                      }}>
                        {plan.period}
                      </Text>
                    </View>
                    
                    <View style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: selectedPlan === plan.id ? '#4F46E5' : '#D1D5DB',
                      backgroundColor: selectedPlan === plan.id ? '#4F46E5' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: 16,
                    }}>
                      {selectedPlan === plan.id && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Clean Bottom CTA */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
      }}>
        <Animated.View entering={FadeInUp.delay(1200).duration(600)}>
          <Animated.View style={buttonAnimatedStyle}>
            <Pressable
              onPress={handleUpgrade}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                marginBottom: 16,
                shadowColor: '#4F46E5',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <LinearGradient
                colors={['#4F46E5', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: '800',
                  fontSize: 18,
                  marginBottom: 4,
                  letterSpacing: -0.2,
                }}>
                  Start 7-Day Free Trial ✨
                </Text>
                <Text style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: 14,
                  fontWeight: '500',
                }}>
                  Then {pricingPlans.find(p => p.id === selectedPlan)?.price}{pricingPlans.find(p => p.id === selectedPlan)?.period}
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </Animated.View>
        
        <Text style={{
          fontSize: 13,
          color: '#9CA3AF',
          textAlign: 'center',
          fontWeight: '500',
          lineHeight: 18,
        }}>
          Cancel anytime • No commitments • Privacy protected
        </Text>
      </View>
    </View>
  );
}