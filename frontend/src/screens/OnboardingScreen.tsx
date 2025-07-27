import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Dimensions,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

import { useUserStore } from '../state/userStore';
import { useTheme } from '../theme/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
  accentColor: string;
  illustration: string;
  conversationalText: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Welcome to TripWiser',
    subtitle: 'Plan effortlessly, pack with confidence, and turn every trip into memories that last. Your next adventure starts here.',
    description: '',
    icon: 'bag-handle-outline',
    gradient: ['#F8FAFC', '#F1F5F9', '#E2E8F0'],
    accentColor: '#4F46E5',
    illustration: 'travel-essentials',
    conversationalText: ''
  },
  {
    id: 2,
    title: 'Pack Right. Every Time.',
    subtitle: 'Get a custom packing list based on your destination, weather, trip length, and travel activities-so you never forget a thing.',
    description: '',
    icon: 'checkmark-circle-outline',
    gradient: ['#F8FAFC', '#F1F5F9', '#E2E8F0'],
    accentColor: '#4F46E5',
    illustration: 'checklist',
    conversationalText: ''
  },
  {
    id: 3,
    title: 'Capture Every Moment',
    subtitle: 'Add photos, notes, places, and highlights. From favorite meals to new friends, your journal makes it easy to remember what made your trip unforgettable.',
    description: '',
    icon: 'journal-outline',
    gradient: ['#F8FAFC', '#F1F5F9', '#E2E8F0'],
    accentColor: '#4F46E5',
    illustration: 'journal',
    conversationalText: 'Turn your trips into lasting memories'
  },
  {
    id: 4,
    title: 'Pack Together. Capture as One.',
    subtitle: 'Assign items and pack as a team. Each person adds their own memories — all brought together in one shared trip journal.',
    description: '',
    icon: 'people-outline',
    gradient: ['#F8FAFC', '#F1F5F9', '#E2E8F0'],
    accentColor: '#4F46E5',
    illustration: 'collaboration',
    conversationalText: ''
  },
  {
    id: 5,
    title: 'Let the Journey Begin',
    subtitle: 'Join thousands of travelers who use TripKit to stay organized from the first item packed to the last memory made.',
    description: '',
    icon: 'airplane-outline',
    gradient: ['#F8FAFC', '#F1F5F9', '#E2E8F0'],
    accentColor: '#4F46E5',
    illustration: 'journey',
    conversationalText: ''
  },
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);
  
  // Animated values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cloudAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const sunRayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gentle floating animation for illustrations
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulsing animation for active progress dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating clouds animation
    Animated.loop(
      Animated.timing(cloudAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Gentle rotation for illustrations
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      })
    ).start();

    // Sun rays animation for final screen
    Animated.loop(
      Animated.timing(sunRayAnim, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    ).start();

    // Progress animation
    Animated.timing(progressAnim, {
      toValue: (currentSlide + 1) / onboardingSlides.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentSlide]);

  const nextSlide = () => {
    // Micro-interaction feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentSlide < onboardingSlides.length - 1) {
      const nextIndex = currentSlide + 1;
      setCurrentSlide(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    } else {
      // Completion animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        completeOnboarding?.();
      });
    }
  };

  const skipOnboarding = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      completeOnboarding?.();
    });
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const slideIndex = Math.round(offsetX / screenWidth);
    if (slideIndex !== currentSlide && slideIndex >= 0 && slideIndex < onboardingSlides.length) {
      setCurrentSlide(slideIndex);
    }
  };

  const currentSlideData = onboardingSlides[currentSlide];
  const backgroundColor = isDarkMode ? '#1A202C' : '#FFFFFF';
  const textColor = isDarkMode ? '#F7FAFC' : '#1A202C';
  const subtleTextColor = isDarkMode ? '#A0AEC0' : '#4A5568';

  // Branded illustration renderer
  const renderBrandedIllustration = (type: string, index: number) => {
    const baseStyle = {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };

    switch (type) {
      case 'travel-essentials':
        return (
          <Animated.View style={[baseStyle, {
            transform: [
              { 
                scale: scaleAnim.interpolate({
                  inputRange: [0.8, 1, 1.2],
                  outputRange: [1, 1.02, 1],
                })
              },
              { 
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -4],
                })
              }
            ]
          }]}>
            
            {/* Clean Travel Elements */}
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 160,
              height: 120,
            }}>
              
              {/* Main travel bag - simple and clean */}
              <View style={{
                width: 100,
                height: 70,
                backgroundColor: '#4F46E5',
                borderRadius: 15,
                marginBottom: 15,
                shadowColor: '#4F46E5',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Handle */}
                <View style={{
                  position: 'absolute',
                  top: -10,
                  width: 50,
                  height: 20,
                  backgroundColor: '#4F46E5',
                  borderRadius: 10,
                  opacity: 0.7,
                }} />
                
                {/* Simple checkmark icon */}
                <View style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: 'white',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ color: '#4F46E5', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
                </View>
              </View>
              
              {/* Three floating elements - single color */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Animated.View style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: '#4F46E5',
                  opacity: 0.6,
                  transform: [
                    { 
                      translateY: floatingAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -2],
                      })
                    }
                  ],
                }} />
                <Animated.View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#4F46E5',
                  opacity: 0.8,
                  transform: [
                    { 
                      translateY: floatingAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -4],
                      })
                    }
                  ],
                }} />
                <Animated.View style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: '#4F46E5',
                  opacity: 0.6,
                  transform: [
                    { 
                      translateY: floatingAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -2],
                      })
                    }
                  ],
                }} />
              </View>
            </View>
          </Animated.View>
        );
      case 'travel-backpack':
        return (
          <Animated.View style={[baseStyle, {
            transform: [
              { 
                scale: scaleAnim.interpolate({
                  inputRange: [0.8, 1, 1.2],
                  outputRange: [1, 1.01, 1],
                })
              },
              { 
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -3],
                })
              }
            ]
          }]}>
            
            {/* Main Backpack Body */}
            <View style={{
              width: 110,
              height: 130,
              backgroundColor: '#22C55E',
              borderRadius: 25,
              position: 'relative',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 12,
            }}>
              
              {/* Backpack Straps */}
              <View style={{
                position: 'absolute',
                top: 15,
                left: -8,
                width: 12,
                height: 80,
                backgroundColor: '#16A34A',
                borderRadius: 6,
                shadowColor: '#000',
                shadowOffset: { width: -2, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }} />
              <View style={{
                position: 'absolute',
                top: 15,
                right: -8,
                width: 12,
                height: 80,
                backgroundColor: '#16A34A',
                borderRadius: 6,
                shadowColor: '#000',
                shadowOffset: { width: 2, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }} />
              
              {/* Main Zipper */}
              <View style={{
                position: 'absolute',
                top: 20,
                left: 15,
                right: 15,
                height: 2,
                backgroundColor: '#1E3A8A',
                borderRadius: 1,
              }} />
              
              {/* Front Pocket */}
              <View style={{
                position: 'absolute',
                bottom: 25,
                left: 20,
                width: 70,
                height: 45,
                backgroundColor: '#15803D',
                borderRadius: 15,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3,
              }}>
                {/* Pocket zipper */}
                <View style={{
                  position: 'absolute',
                  top: 8,
                  left: 10,
                  right: 10,
                  height: 1.5,
                  backgroundColor: '#1E3A8A',
                  borderRadius: 1,
                }} />
              </View>
              
              {/* Travel Patches */}
              <View style={{ 
                position: 'absolute', 
                top: 35, 
                left: 15, 
                width: 24, 
                height: 24, 
                backgroundColor: '#FEF7ED', 
                borderRadius: 12, 
                alignItems: 'center', 
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}>
                <Text style={{ fontSize: 14 }}>🗺️</Text>
              </View>
              
              <View style={{ 
                position: 'absolute', 
                top: 35, 
                right: 15, 
                width: 24, 
                height: 24, 
                backgroundColor: '#EFF6FF', 
                borderRadius: 6, 
                alignItems: 'center', 
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}>
                <Text style={{ fontSize: 14 }}>⛰️</Text>
              </View>
              
              {/* Water Bottle Holder */}
              <View style={{
                position: 'absolute',
                right: -6,
                top: 40,
                width: 8,
                height: 35,
                backgroundColor: '#06B6D4',
                borderRadius: 4,
                shadowColor: '#000',
                shadowOffset: { width: 1, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 2,
              }} />
            </View>
          </Animated.View>
        );
      case 'premium-suitcase':
        return (
          <Animated.View style={[baseStyle, {
            transform: [
              { 
                scale: scaleAnim.interpolate({
                  inputRange: [0.8, 1, 1.2],
                  outputRange: [1, 1.01, 1],
                })
              },
              { 
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -3],
                })
              }
            ]
          }]}>
            
            {/* Main Suitcase Body - Updated color */}
            <View style={{
              width: 130,
              height: 100,
              backgroundColor: '#3B82F6',
              borderRadius: 20,
              position: 'relative',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 12,
            }}>
              
              {/* Handle - Clean and simple like photo */}
              <View style={{
                position: 'absolute',
                top: -16,
                left: 35,
                width: 60,
                height: 28,
                backgroundColor: '#2563EB',
                borderRadius: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}>
                {/* Handle opening - white border like photo */}
                <View style={{
                  position: 'absolute',
                  top: 5,
                  left: 12,
                  right: 12,
                  bottom: 5,
                  backgroundColor: 'transparent',
                  borderRadius: 10,
                  borderWidth: 2.5,
                  borderColor: '#F8FAFC',
                }} />
              </View>
              
              {/* Wheels - Dark navy like photo */}
              <View style={{ 
                position: 'absolute', 
                bottom: -12, 
                left: 18, 
                width: 16, 
                height: 16, 
                backgroundColor: '#1E293B', 
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.4,
                shadowRadius: 5,
                elevation: 5,
              }} />
              <View style={{ 
                position: 'absolute', 
                bottom: -12, 
                right: 18, 
                width: 16, 
                height: 16, 
                backgroundColor: '#1E293B', 
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.4,
                shadowRadius: 5,
                elevation: 5,
              }} />
              
              {/* Palm Tree Sticker - Circular with cream background */}
              <View style={{ 
                position: 'absolute', 
                top: 15, 
                left: 15, 
                width: 28, 
                height: 28, 
                backgroundColor: '#FEF7ED', 
                borderRadius: 14, 
                alignItems: 'center', 
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}>
                <Text style={{ fontSize: 16 }}>🌴</Text>
              </View>
              
              {/* Airplane Sticker - Square with light blue background */}
              <View style={{ 
                position: 'absolute', 
                top: 15, 
                right: 15, 
                width: 28, 
                height: 28, 
                backgroundColor: '#EFF6FF', 
                borderRadius: 6, 
                alignItems: 'center', 
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}>
                <Text style={{ fontSize: 16 }}>✈️</Text>
              </View>
              
              {/* Checklist - Cream colored like photo */}
              <View style={{
                position: 'absolute',
                bottom: 18,
                left: 18,
                width: 55,
                height: 42,
                backgroundColor: '#FEF3C7',
                borderRadius: 10,
                padding: 6,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                    <View style={{ 
                      width: 8, 
                      height: 8, 
                      backgroundColor: '#1E3A8A', 
                      borderRadius: 1, 
                      marginRight: 6,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 5, color: 'white', fontWeight: '900' }}>✓</Text>
                    </View>
                    <View style={{ width: 25, height: 1.5, backgroundColor: '#1E3A8A', borderRadius: 1 }} />
                  </View>
                ))}
              </View>
              
              {/* Photo Sticker - Colorful like photo */}
              <View style={{ 
                position: 'absolute', 
                bottom: 15, 
                right: 15, 
                width: 22, 
                height: 22, 
                backgroundColor: 'white', 
                borderRadius: 3, 
                padding: 1.5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}>
                {/* Colorful gradient photo like in reference */}
                <View style={{ 
                  flex: 1, 
                  borderRadius: 1.5,
                  backgroundColor: '#FF6B6B',
                }}>
                  <View style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    backgroundColor: '#FF8E53',
                    borderTopLeftRadius: 1.5,
                    borderTopRightRadius: 1.5,
                  }} />
                  <View style={{ 
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    backgroundColor: '#4ECDC4',
                    borderBottomLeftRadius: 1.5,
                    borderBottomRightRadius: 1.5,
                  }} />
                </View>
              </View>
            </View>
          </Animated.View>
        );
      case 'suitcase':
        return (
          <Animated.View style={[baseStyle, {
            transform: [
              { 
                scale: scaleAnim.interpolate({
                  inputRange: [0.8, 1, 1.2],
                  outputRange: [1, 1.05, 1],
                })
              }
            ]
          }]}>
            <View style={{ width: 80, height: 60, backgroundColor: '#4F46E5', borderRadius: 8, marginBottom: 8 }} />
            <View style={{ width: 100, height: 4, backgroundColor: '#4F46E5', borderRadius: 2 }} />
          </Animated.View>
        );
      case 'checklist':
        return (
          <Animated.View style={[baseStyle, {
            transform: [
              { 
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -8],
                })
              }
            ]
          }]}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: 8,
                opacity: i <= index ? 1 : 0.3 
              }}>
                <View style={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: 10, 
                  backgroundColor: '#6366F1', 
                  marginRight: 15,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                </View>
                <View style={{ width: 70, height: 3, backgroundColor: '#E2E8F0', borderRadius: 1 }} />
              </View>
            ))}
          </Animated.View>
        );
      case 'collaboration':
        return (
          <Animated.View style={[baseStyle, {
            transform: [
              { 
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -6],
                })
              }
            ]
          }]}>
            {/* Team members with individual animations */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Animated.View style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: '#8B5CF6',
                marginRight: -10,
                transform: [
                  { 
                    scale: scaleAnim.interpolate({
                      inputRange: [0.9, 1, 1.1],
                      outputRange: [1, 1.1, 1],
                    })
                  }
                ],
              }} />
              <Animated.View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#4F46E5',
                marginRight: -10,
                zIndex: 2,
                transform: [
                  { 
                    scale: pulseAnim.interpolate({
                      inputRange: [1, 1.2],
                      outputRange: [1, 1.05],
                    })
                  }
                ],
              }} />
              <Animated.View style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: '#6366F1',
                transform: [
                  { 
                    scale: scaleAnim.interpolate({
                      inputRange: [0.9, 1, 1.1],
                      outputRange: [1, 1.1, 1],
                    })
                  }
                ],
              }} />
            </View>
            
            {/* Shared list with subtle animation */}
            <Animated.View style={{ 
              width: 90, 
              height: 42, 
              backgroundColor: '#F8FAFC', 
              borderRadius: 10, 
              borderWidth: 2,
              borderColor: '#4F46E5',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [
                { 
                  scale: floatingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.02],
                  })
                }
              ],
            }}>
              {/* List lines */}
              <View style={{ width: 50, height: 3, backgroundColor: '#8B5CF6', marginBottom: 4, borderRadius: 1.5 }} />
              <View style={{ width: 42, height: 3, backgroundColor: '#4F46E5', marginBottom: 4, borderRadius: 1.5 }} />
              <View style={{ width: 36, height: 3, backgroundColor: '#6366F1', borderRadius: 1.5 }} />
            </Animated.View>
          </Animated.View>
        );
      case 'journal':
        return (
          <Animated.View style={[baseStyle, {
            transform: [
              { 
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -6],
                })
              }
            ]
          }]}>
            {/* Journal book with animated pages */}
            <View style={{
              width: 100,
              height: 120,
              backgroundColor: '#4f46e5',
              borderRadius: 8,
              borderBottomRightRadius: 2,
              borderTopRightRadius: 2,
              shadowColor: '#4f46e5',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
              position: 'relative',
            }}>
              {/* Journal spine */}
              <View style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 8,
                backgroundColor: '#7C3AED',
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
              }} />
              
              {/* Animated pages */}
              <Animated.View style={{
                position: 'absolute',
                right: 8,
                top: 15,
                width: 60,
                height: 2,
                backgroundColor: 'white',
                borderRadius: 1,
                opacity: 0.9,
                transform: [
                  { 
                    scaleX: scaleAnim.interpolate({
                      inputRange: [0.8, 1, 1.2],
                      outputRange: [0.7, 1, 0.7],
                    })
                  }
                ]
              }} />
              <Animated.View style={{
                position: 'absolute',
                right: 8,
                top: 25,
                width: 45,
                height: 2,
                backgroundColor: 'white',
                borderRadius: 1,
                opacity: 0.7,
                transform: [
                  { 
                    scaleX: scaleAnim.interpolate({
                      inputRange: [0.8, 1, 1.2],
                      outputRange: [1, 0.8, 1],
                    })
                  }
                ]
              }} />
              <Animated.View style={{
                position: 'absolute',
                right: 8,
                top: 35,
                width: 55,
                height: 2,
                backgroundColor: 'white',
                borderRadius: 1,
                opacity: 0.8,
                transform: [
                  { 
                    scaleX: scaleAnim.interpolate({
                      inputRange: [0.8, 1, 1.2],
                      outputRange: [0.9, 1, 0.9],
                    })
                  }
                ]
              }} />
              
              {/* Camera icon for photos */}
              <Animated.View style={{
                position: 'absolute',
                right: 15,
                bottom: 20,
                width: 20,
                height: 16,
                backgroundColor: 'white',
                borderRadius: 3,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [
                  { 
                    scale: scaleAnim.interpolate({
                      inputRange: [0.9, 1, 1.1],
                      outputRange: [1, 1.2, 1],
                    })
                  }
                ]
              }}>
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#8B5CF6',
                }} />
              </Animated.View>
              
              {/* Floating memory icons */}
              <Animated.View style={{
                position: 'absolute',
                right: -15,
                top: 10,
                transform: [
                  { 
                    translateY: floatingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    })
                  },
                  {
                    rotate: floatingAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: ['-5deg', '5deg', '-5deg'],
                    })
                  }
                ]
              }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#F59E0B',
                  opacity: 0.8,
                }} />
              </Animated.View>
              
              <Animated.View style={{
                position: 'absolute',
                left: -10,
                bottom: 30,
                transform: [
                  { 
                    translateY: floatingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 3],
                    })
                  }
                ]
              }}>
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#10B981',
                  opacity: 0.7,
                }} />
              </Animated.View>
            </View>
          </Animated.View>
        );
      case 'journey':
        return (
          <Animated.View style={[baseStyle, {
            transform: [
              { 
                scale: scaleAnim.interpolate({
                  inputRange: [0.9, 1, 1.1],
                  outputRange: [1, 1.05, 1],
                })
              }
            ]
          }]}>
            <View style={{ alignItems: 'center', marginBottom: 80, marginTop: -15 }}></View>
            <LottieView
              source={require('../../assets/animations/Study Abroad.json')}
              autoPlay
              loop
              style={{
                width: 200,
                height: 200,
              }}
            />
          </Animated.View>
        );
      default:
        return null;
    }
  };

  const floatingTransform = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <Animated.View style={{ 
      flex: 1, 
      backgroundColor: theme.background,
      opacity: fadeAnim,
    }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      

      
      {/* Clean Background Gradient */}
      <LinearGradient
        colors={currentSlideData.gradient as [string, string, string]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Motion Background for Second Screen */}
      {currentSlide === 1 && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Gentle diamonds representing precision */}
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={`diamond-${i}`}
              style={{
                position: 'absolute',
                left: (i % 4) * (screenWidth / 4) + 40,
                top: 80 + Math.floor(i / 4) * 200,
                opacity: 0.05,
                transform: [
                  { 
                    rotate: '45deg' 
                  },
                  {
                    scale: floatingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                  {
                    translateY: cloudAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20],
                    }),
                  },
                ],
              }}
            >
              <View style={{
                width: 12 + (i % 3) * 4,
                height: 12 + (i % 3) * 4,
                backgroundColor: '#4F46E5',
              }} />
            </Animated.View>
          ))}
          
          {/* Spiraling path lines */}
          {[...Array(3)].map((_, i) => (
            <Animated.View
              key={`spiral-${i}`}
              style={{
                position: 'absolute',
                left: screenWidth / 2 - 60,
                top: 180 + i * 120,
                opacity: 0.04,
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [`${i * 120}deg`, `${i * 120 + 180}deg`],
                    }),
                  },
                ],
              }}
            >
              <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                borderWidth: 2,
                borderColor: '#6366F1',
                borderStyle: 'dashed',
                backgroundColor: 'transparent',
                borderTopColor: 'transparent',
                borderLeftColor: 'transparent',
              }} />
            </Animated.View>
          ))}
        </View>
      )}

      {/* Motion Background for Third Screen */}
      {currentSlide === 2 && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Interconnected circles representing collaboration */}
          {[...Array(4)].map((_, i) => (
            <Animated.View
              key={`circle-${i}`}
              style={{
                position: 'absolute',
                left: (i % 2) * (screenWidth / 2) + 60,
                top: 150 + Math.floor(i / 2) * 200,
                opacity: 0.06,
                transform: [
                  { 
                    scale: floatingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    })
                  }
                ],
              }}
            >
              <View style={{
                width: 40 + i * 8,
                height: 40 + i * 8,
                borderRadius: (40 + i * 8) / 2,
                borderWidth: 2,
                borderColor: '#8B5CF6',
                backgroundColor: 'transparent',
              }} />
            </Animated.View>
          ))}
          
          {/* Connecting lines between circles */}
          {[...Array(3)].map((_, i) => (
            <Animated.View
              key={`connector-${i}`}
              style={{
                position: 'absolute',
                left: 80 + (i * 60),
                top: 200 + (i % 2) * 100,
                width: 60,
                height: 1,
                backgroundColor: '#A855F7',
                opacity: 0.08,
                transform: [
                  { rotate: i % 2 === 0 ? '45deg' : '-45deg' },
                  {
                    scaleX: cloudAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.5],
                    }),
                  },
                ],
              }}
            />
          ))}
          
          {/* Floating hexagons for teamwork */}
          {[...Array(5)].map((_, i) => (
            <Animated.View
              key={`hex-${i}`}
              style={{
                position: 'absolute',
                left: 40 + i * 70,
                top: 100 + (i % 2) * 150,
                opacity: 0.04,
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '60deg'],
                    })
                  },
                  {
                    translateY: floatingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -8],
                    }),
                  },
                ],
              }}
            >
              {/* Hexagon using multiple borders */}
              <View style={{
                width: 16,
                height: 16,
                backgroundColor: '#7C3AED',
                transform: [{ rotate: '45deg' }],
              }} />
            </Animated.View>
          ))}
        </View>
      )}

      {/* Motion Background for Journal Screen */}
      {currentSlide === 3 && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Floating memory elements */}
          {[...Array(6)].map((_, i) => (
            <Animated.View
              key={`memory-${i}`}
              style={{
                position: 'absolute',
                left: (i % 3) * (screenWidth / 3) + 50,
                top: 120 + Math.floor(i / 3) * 250,
                opacity: 0.08,
                transform: [
                  { 
                    translateY: floatingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -12],
                    })
                  },
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }
                ]
              }}
            >
              <View style={{
                width: i % 2 === 0 ? 24 : 18,
                height: i % 2 === 0 ? 24 : 18,
                backgroundColor: '#8B5CF6',
                borderRadius: i % 3 === 0 ? 12 : 4,
              }} />
            </Animated.View>
          ))}
          
          {/* Photo frame elements */}
          {[...Array(4)].map((_, i) => (
            <Animated.View
              key={`photo-${i}`}
              style={{
                position: 'absolute',
                left: (i % 2) * (screenWidth / 2) + 80,
                top: 200 + Math.floor(i / 2) * 180,
                opacity: 0.06,
                transform: [
                  { 
                    scale: scaleAnim.interpolate({
                      inputRange: [0.8, 1, 1.2],
                      outputRange: [1, 1.1, 1],
                    })
                  },
                  {
                    rotate: floatingAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: ['-3deg', '3deg', '-3deg'],
                    })
                  }
                ]
              }}
            >
              <View style={{
                width: 32,
                height: 24,
                backgroundColor: '#F3E8FF',
                borderRadius: 4,
                borderWidth: 2,
                borderColor: '#8B5CF6',
              }} />
            </Animated.View>
          ))}
        </View>
      )}

      {/* Motion Background for First Screen */}
      {currentSlide === 0 && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Gentle Rotating Stars */}
          {[...Array(6)].map((_, i) => (
            <Animated.View
              key={`star-${i}`}
              style={{
                position: 'absolute',
                left: (i % 3) * (screenWidth / 3) + 30,
                top: 100 + (Math.floor(i / 3)) * 200,
                opacity: 0.06,
                transform: [
                  { 
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  },
                  { 
                    scale: floatingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    })
                  }
                ],
              }}
            >
              <View style={{
                width: 20 + i * 2,
                height: 20 + i * 2,
                backgroundColor: '#4F46E5',
              }}>
                {/* Star shape using nested views */}
                <View style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: '#4F46E5',
                  marginTop: -1,
                }} />
                <View style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: 2,
                  backgroundColor: '#4F46E5',
                  marginLeft: -1,
                }} />
              </View>
            </Animated.View>
          ))}
          
          {/* Floating Dots */}
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={`dot-${i}`}
              style={{
                position: 'absolute',
                left: Math.random() * screenWidth,
                top: 120 + i * 70,
                opacity: 0.04,
                transform: [
                  {
                    translateX: cloudAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, screenWidth * 0.15],
                    }),
                  },
                  {
                    translateY: floatingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -15],
                    }),
                  },
                ],
              }}
            >
              <View style={{
                width: 12 + (i % 3) * 4,
                height: 12 + (i % 3) * 4,
                backgroundColor: '#10B981',
                borderRadius: 50,
              }} />
            </Animated.View>
          ))}
        </View>
      )}

      {/* Motion Background for Final Screen */}
      {currentSlide === onboardingSlides.length - 1 && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Rising Sun Rays */}
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                left: screenWidth / 2,
                top: screenHeight / 2,
                width: 2,
                height: screenHeight,
                backgroundColor: '#4F46E5',
                opacity: 0.05,
                transformOrigin: 'top',
                transform: [
                  { rotate: `${i * 45}deg` },
                  { 
                    scaleY: sunRayAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1.2, 0.8],
                    })
                  }
                ],
              }}
            />
          ))}
          
          {/* Drifting Clouds */}
          {[...Array(4)].map((_, i) => (
            <Animated.View
              key={`cloud-${i}`}
              style={{
                position: 'absolute',
                left: i * 100 + 20,
                top: 60 + i * 80,
                opacity: 0.08,
                transform: [
                  {
                    translateX: cloudAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, screenWidth * 0.2],
                    }),
                  },
                ],
              }}
            >
              <View style={{
                width: 60 + i * 10,
                height: 30 + i * 5,
                backgroundColor: '#4F46E5',
                borderRadius: 20,
              }} />
            </Animated.View>
          ))}
        </View>
      )}

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header with Theme Toggle */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 16,
          zIndex: 10,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '900',
              letterSpacing: -0.5,
              marginLeft: 0,
              marginBottom: 1,
            }}>
              <Text style={{ color: textColor }}>Trip</Text>
              <Text style={{ color: currentSlideData.accentColor }}>Wiser</Text>
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {currentSlide < onboardingSlides.length - 1 && (
              <Pressable
                onPress={skipOnboarding}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
                }}
              >
                <Text style={{
                  color: subtleTextColor,
                  fontWeight: '600',
                  fontSize: 14,
                }}>
                  Skip
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={{
          paddingHorizontal: 24,
          marginBottom: 20,
        }}>
          <View style={{
            height: 4,
            backgroundColor: isDarkMode ? '#334155' : '#e2e8f0',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <Animated.View
              style={{
                height: '100%',
                backgroundColor: currentSlideData.accentColor,
                borderRadius: 2,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </View>
        </View>

        {/* Content Carousel */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {onboardingSlides.map((slide, index) => (
            <View
              key={slide.id}
              style={{
                width: screenWidth,
                paddingHorizontal: index === onboardingSlides.length - 1 ? 0 : 32,
                justifyContent: 'center',
              }}
            >
              {/* Branded Illustration */}
              <Animated.View
                style={{
                  alignItems: 'center',
                  marginBottom: index === 0 ? 20 : index === 1 ? 20 : index === 2 ? 30 : 40,
                  minHeight: index === 0 ? 120 : index === 1 ? 120 : index === 2 ? 130 : 140,
                  justifyContent: 'center',
                }}
              >
                {/* All screens - Clean illustration only */}
                <View style={{
                  height: 120,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}>

                  {/* Illustration */}
                  <View style={{ zIndex: 10 }}>
                    {index === 0 ? null : index === 1 ? null : index === 2 ? null : index === 3 ? null : renderBrandedIllustration(slide.illustration, index)}
                  </View>
                </View>
              </Animated.View>

              {/* Content */}
              <View style={{ 
                alignItems: 'center', 
                maxWidth: 360, 
                alignSelf: 'center',
                paddingHorizontal: 32,
                zIndex: 10,
                marginTop: index === onboardingSlides.length - 1 ? 100 : 0,
              }}>
                {index === 0 && (
                  <View style={{ alignItems: 'center', marginBottom: 30, marginTop: -120 }}>
                    <LottieView
                      source={require('../../assets/animations/World Travel Loader.json')}
                      autoPlay
                      loop
                      speed={0.5}
                      style={{ width: 220, height: 220 }}
                    />
                  </View>
                )}
                {index === 1 && (
                  <View style={{ alignItems: 'center', marginBottom: -50, marginTop: -120 }}>
                    <LottieView
                      source={require('../../assets/animations/Marking.json')}
                      autoPlay
                      loop
                      speed={1}
                      style={{ width: 280, height: 280 }}
                    />
                  </View>
                )}
                {index === 2 && (
                  <View style={{ alignItems: 'center', marginBottom: -10, marginTop: -120 }}>
                    <LottieView
                      source={require('../../assets/animations/Couple Taking A Selfie.json')}
                      autoPlay
                      loop
                      speed={1}
                      style={{ width: 260, height: 260 }}
                    />
                  </View>
                )}
                {index === 3 && (
                  <View style={{ alignItems: 'center', marginBottom: -30, marginTop: -150 }}>
                    <LottieView
                      source={require('../../assets/animations/support system.json')}
                      autoPlay
                      loop
                      speed={1}
                      style={{ width: 300, height: 300 }}
                    />
                  </View>
                )}
                {/* Title */}
                <Text style={{
                  fontSize: 28,
                  fontWeight: '800',
                  textAlign: 'center',
                  marginBottom: 20,
                  lineHeight: 32,
                  letterSpacing: -1.4,
                }}>
                  {slide.title.includes('TripKit') ? (
                    <>
                      {slide.title.split('TripKit')[0]}
                      <Text style={{ color: textColor }}>Trip</Text>
                      <Text style={{ color: currentSlideData.accentColor }}>Kit</Text>
                      {slide.title.split('TripKit')[1]}
                    </>
                  ) : (
                    <Text style={{ color: textColor }}>{slide.title}</Text>
                  )}
                </Text>

                {/* Connected Subtitle */}
                <Text style={{
                  color: subtleTextColor,
                  fontWeight: '500',
                  fontSize: 15,
                  marginBottom: 32,
                  letterSpacing: 0.2,
                  textAlign: 'center',
                  opacity: 0.85,
                  lineHeight: 22,
                }}>
                  {slide.subtitle}
                </Text>

                {/* Description - Only show if not empty */}
                {slide.description && (
                  <Text style={{
                    fontSize: 18,
                    color: subtleTextColor,
                    textAlign: 'center',
                    lineHeight: 28,
                    fontWeight: '400',
                    maxWidth: 320,
                    marginBottom: 20,
                  }}>
                    {slide.description}
                  </Text>
                )}


              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={{
          paddingHorizontal: 32,
          paddingBottom: 32,
          paddingTop: 20,
        }}>
          {/* Dot Indicators */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 32,
          }}>
            {onboardingSlides.map((_, index) => (
              <Animated.View
                key={index}
                style={{
                  width: index === currentSlide ? 32 : 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: index === currentSlide 
                    ? '#4F46E5' 
                    : (isDarkMode ? '#4A5568' : '#BDC3C7'),
                  marginHorizontal: 6,
                  opacity: 1,
                  transform: index === currentSlide ? [{ scale: pulseAnim }] : [{ scale: 1 }],
                }}
              />
            ))}
          </View>

          {/* Action Button */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              onPress={nextSlide}
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                shadowColor: '#4F46E5',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={['#4F46E5', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 18,
                  paddingHorizontal: 32,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: '700',
                  fontSize: 18,
                  marginRight: 8,
                  letterSpacing: 0.2,
                }}>
                  {currentSlide === 0 ? 'Let\'s Go' : currentSlide === 2 ? 'Keep Going' : currentSlide === onboardingSlides.length - 1 ? 'I\'m Ready for Takeoff' : 'Continue'}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="white"
                />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}