import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { useUserStore } from '../state/userStore';
import { cn } from '../utils/cn';
import { authService, AuthUser } from '../services/authService';
import { useTheme } from '../theme/ThemeContext';

type NavigationProp = NativeStackNavigationProp<any>;

export default function SignUpScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const buttonScale = useSharedValue(1);
  const setUser = useUserStore((state) => state.setUser);
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);
  const theme = useTheme();

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    buttonScale.value = withSpring(0.95, { duration: 100 }, () => {
      buttonScale.value = withSpring(1, { duration: 100 });
    });

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Mock successful sign up
      setUser({
        id: '1',
        email: email.trim(),
        name: name.trim(),
        subscriptionTier: 'free' as const,
      });
      
      completeOnboarding();
      
      Alert.alert(
        'Welcome!',
        'Your account has been created successfully.',
        [{ text: 'Get Started' }]
      );
    }, 1500);
  };

  const handleLogin = () => {
    navigation.goBack();
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      const authUser = await authService.signInWithGoogle();
      
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: authUser.name,
          subscriptionTier: 'free' as const,
        });
        completeOnboarding();
        Alert.alert(
          'Welcome!',
          'Your account has been created successfully with Google.',
          [{ text: 'Get Started' }]
        );
      } else {
        Alert.alert('Authentication Failed', 'Unable to sign up with Google. Please try again.');
      }
    } catch (error) {
      console.error('Google sign up error:', error);
      Alert.alert('Error', 'An error occurred during Google sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    try {
      setIsLoading(true);
      const authUser = await authService.signInWithApple();
      
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: authUser.name,
          subscriptionTier: 'free' as const,
        });
        completeOnboarding();
        Alert.alert(
          'Welcome!',
          'Your account has been created successfully with Apple.',
          [{ text: 'Get Started' }]
        );
      } else {
        Alert.alert('Authentication Failed', 'Unable to sign up with Apple. Please try again.');
      }
    } catch (error) {
      console.error('Apple sign up error:', error);
      Alert.alert('Error', 'An error occurred during Apple sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView className="flex-1">
          <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <Animated.View 
              entering={FadeInDown.delay(100).duration(600)}
              className="items-center pt-12 pb-8"
            >
              <LinearGradient
                colors={['#4F46E5', '#6366F1']}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 24,
                  shadowColor: '#4F46E5',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Ionicons name="person-add" size={40} color="white" />
              </LinearGradient>
              <Text style={{
                fontSize: 32,
                fontWeight: '800',
                color: theme.text,
                marginBottom: 8,
                textAlign: 'center',
                letterSpacing: -1,
              }}>
                Create Account
              </Text>
              <Text style={{
                fontSize: 18,
                color: theme.muted,
                textAlign: 'center',
                opacity: 0.85,
                lineHeight: 24,
              }}>
                Plan, pack, and journal — together, in one place.
              </Text>
            </Animated.View>

            {/* Form */}
            <View className="flex-1 px-8">
              <Animated.View entering={FadeInUp.delay(200).duration(600)}>
                {/* Name Input */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{
                    color: theme.muted,
                    fontWeight: '600',
                    marginBottom: 8,
                    fontSize: 16,
                  }}>Full Name</Text>
                  <View style={{
                    backgroundColor: theme.card,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.border,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#4F46E5',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}>
                    <Ionicons name="person-outline" size={20} color={theme.primary} />
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your full name"
                      autoCapitalize="words"
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: theme.text,
                        fontSize: 16,
                      }}
                      placeholderTextColor={theme.muted}
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{
                    color: theme.muted,
                    fontWeight: '600',
                    marginBottom: 8,
                    fontSize: 16,
                  }}>Email</Text>
                  <View style={{
                    backgroundColor: theme.card,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.border,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#4F46E5',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}>
                    <Ionicons name="mail-outline" size={20} color={theme.primary} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: theme.text,
                        fontSize: 16,
                      }}
                      placeholderTextColor={theme.muted}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{
                    color: theme.muted,
                    fontWeight: '600',
                    marginBottom: 8,
                    fontSize: 16,
                  }}>Password</Text>
                  <View style={{
                    backgroundColor: theme.card,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.border,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#4F46E5',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}>
                    <Ionicons name="lock-closed-outline" size={20} color={theme.primary} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Create a password"
                      secureTextEntry={!showPassword}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: theme.text,
                        fontSize: 16,
                      }}
                      placeholderTextColor={theme.muted}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={theme.primary} 
                      />
                    </Pressable>
                  </View>
                  <Text style={{
                    color: theme.muted,
                    fontSize: 14,
                    marginTop: 4,
                    marginLeft: 4,
                  }}>
                    Must be at least 6 characters
                  </Text>
                </View>

                {/* Confirm Password Input */}
                <View style={{ marginBottom: 32 }}>
                  <Text style={{
                    color: theme.muted,
                    fontWeight: '600',
                    marginBottom: 8,
                    fontSize: 16,
                  }}>Confirm Password</Text>
                  <View style={{
                    backgroundColor: theme.card,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.border,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#4F46E5',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} />
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      secureTextEntry={!showConfirmPassword}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: theme.text,
                        fontSize: 16,
                      }}
                      placeholderTextColor={theme.muted}
                    />
                    <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons 
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={theme.primary} 
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Sign Up Button */}
                <Animated.View style={[buttonAnimatedStyle, { marginBottom: 24 }]}>
                  <Pressable
                    onPress={handleSignUp}
                    disabled={isLoading}
                    style={{
                      borderRadius: 16,
                      overflow: 'hidden',
                      shadowColor: '#4F46E5',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <LinearGradient
                      colors={isLoading ? ['#9CA3AF', '#9CA3AF'] : ['#4F46E5', '#6366F1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        paddingVertical: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isLoading ? (
                        <Text style={{
                          color: 'white',
                          fontWeight: '700',
                          fontSize: 18,
                          letterSpacing: 0.2,
                        }}>
                          Creating Account...
                        </Text>
                      ) : (
                        <Text style={{
                          color: 'white',
                          fontWeight: '700',
                          fontSize: 18,
                          letterSpacing: 0.2,
                        }}>
                          Create Account
                        </Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>

                {/* Divider */}
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  marginVertical: 24 
                }}>
                  <View style={{ 
                    flex: 1, 
                    height: 1, 
                    backgroundColor: theme.border 
                  }} />
                  <Text style={{ 
                    marginHorizontal: 16, 
                    color: theme.muted, 
                    fontWeight: '500',
                    fontSize: 14 
                  }}>
                    or continue with
                  </Text>
                  <View style={{ 
                    flex: 1, 
                    height: 1, 
                    backgroundColor: theme.border 
                  }} />
                </View>

                {/* Social Sign Up Buttons */}
                <View style={{ marginBottom: 24 }}>
                  {/* Google Sign Up */}
                  <Pressable
                    onPress={handleGoogleSignUp}
                    disabled={isLoading}
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: theme.border,
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <Ionicons name="logo-google" size={24} color="#4285F4" />
                    <Text style={{
                      marginLeft: 12,
                      color: theme.text,
                      fontWeight: '600',
                      fontSize: 16,
                    }}>
                      Continue with Google
                    </Text>
                  </Pressable>

                  {/* Apple Sign Up */}
                  <Pressable
                    onPress={handleAppleSignUp}
                    disabled={isLoading}
                    style={{
                      backgroundColor: '#000000',
                      borderRadius: 16,
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <Ionicons name="logo-apple" size={24} color="white" />
                    <Text style={{
                      marginLeft: 12,
                      color: 'white',
                      fontWeight: '600',
                      fontSize: 16,
                    }}>
                      Continue with Apple
                    </Text>
                  </Pressable>
                </View>

                {/* Login Link */}
                <View className="flex-row justify-center items-center">
                  <Text className="text-gray-600">Already have an account? </Text>
                  <Pressable onPress={handleLogin}>
                    <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 16 }}>Sign In</Text>
                  </Pressable>
                </View>
              </Animated.View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}