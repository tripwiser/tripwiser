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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
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

import { useUserStore } from '../state/userStore';
import { cn } from '../utils/cn';
import { authService, AuthUser } from '../services/authService';

type NavigationProp = NativeStackNavigationProp<any>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const buttonScale = useSharedValue(1);
  const setUser = useUserStore((state) => state.setUser);
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    buttonScale.value = withSpring(0.95, { duration: 100 }, () => {
      buttonScale.value = withSpring(1, { duration: 100 });
    });

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Mock successful login
      setUser({
        id: '1',
        email: email.trim(),
        name: email.split('@')[0],
        subscriptionTier: 'free' as const,
      });
      
      completeOnboarding();
    }, 1500);
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Password reset functionality would be implemented here.',
      [{ text: 'OK' }]
    );
  };

  const handleGoogleSignIn = async () => {
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
      } else {
        Alert.alert('Authentication Failed', 'Unable to sign in with Google. Please try again.');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      Alert.alert('Error', 'An error occurred during Google sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
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
      } else {
        Alert.alert('Authentication Failed', 'Unable to sign in with Apple. Please try again.');
      }
    } catch (error) {
      console.error('Apple sign in error:', error);
      Alert.alert('Error', 'An error occurred during Apple sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar style="dark" />
      
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
              className="items-center pt-12 pb-4"
            >
              <View style={{
                width: 280,
                height: 200,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                marginLeft: -20,
                marginTop: -40,
              }}>
                <Image
                  source={{ uri: 'https://images.composerapi.com/9A8CCE21-3A22-44F0-8201-D9E1D16286ED.jpg' }}
                  style={{
                    width: 280,
                    height: 200,
                  }}
                  resizeMode="contain"
                />
              </View>
              <Text style={{
                fontSize: 32,
                fontWeight: '800',
                color: '#1A202C',
                marginBottom: 8,
                textAlign: 'center',
                letterSpacing: -1,
              }}>
                Welcome Back
              </Text>
              <Text style={{
                fontSize: 18,
                color: '#4A5568',
                textAlign: 'center',
                opacity: 0.85,
                lineHeight: 24,
              }}>
                Sign in to continue your travel planning
              </Text>
            </Animated.View>

            {/* Form */}
            <View className="flex-1 px-8">
              <Animated.View entering={FadeInUp.delay(200).duration(600)}>
                {/* Email Input */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    color: '#4A5568',
                    fontWeight: '600',
                    marginBottom: 8,
                    fontSize: 16,
                  }}>Email</Text>
                  <View style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
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
                    <Ionicons name="mail-outline" size={20} color="#4F46E5" />
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
                        color: '#1A202C',
                        fontSize: 16,
                      }}
                      placeholderTextColor="#A0AEC0"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    color: '#4A5568',
                    fontWeight: '600',
                    marginBottom: 8,
                    fontSize: 16,
                  }}>Password</Text>
                  <View style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
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
                    <Ionicons name="lock-closed-outline" size={20} color="#4F46E5" />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      secureTextEntry={!showPassword}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: '#1A202C',
                        fontSize: 16,
                      }}
                      placeholderTextColor="#A0AEC0"
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#4F46E5" 
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Forgot Password */}
                <Pressable onPress={handleForgotPassword} style={{ marginBottom: 20 }}>
                  <Text style={{
                    color: '#4F46E5',
                    fontWeight: '600',
                    textAlign: 'center',
                    fontSize: 16,
                  }}>
                    Forgot Password?
                  </Text>
                </Pressable>

                {/* Login Button */}
                <Animated.View style={[buttonAnimatedStyle, { marginBottom: 16 }]}>
                  <Pressable
                    onPress={handleLogin}
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
                      colors={isLoading ? ['#A0AEC0', '#A0AEC0'] : ['#4F46E5', '#6366F1']}
                      style={{
                        paddingVertical: 18,
                        paddingHorizontal: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{
                        color: 'white',
                        fontWeight: '700',
                        fontSize: 18,
                        letterSpacing: 0.2,
                      }}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>

                {/* Divider */}
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  marginVertical: 16 
                }}>
                  <View style={{ 
                    flex: 1, 
                    height: 1, 
                    backgroundColor: '#E2E8F0' 
                  }} />
                  <Text style={{ 
                    marginHorizontal: 16, 
                    color: '#A0AEC0', 
                    fontWeight: '500',
                    fontSize: 14 
                  }}>
                    or continue with
                  </Text>
                  <View style={{ 
                    flex: 1, 
                    height: 1, 
                    backgroundColor: '#E2E8F0' 
                  }} />
                </View>

                {/* Social Login Buttons */}
                <View style={{ marginBottom: 24 }}>
                  {/* Google Sign In */}
                  <Pressable
                    onPress={handleGoogleSignIn}
                    disabled={isLoading}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
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
                      color: '#1A202C',
                      fontWeight: '600',
                      fontSize: 16,
                    }}>
                      Continue with Google
                    </Text>
                  </Pressable>

                  {/* Apple Sign In */}
                  <Pressable
                    onPress={handleAppleSignIn}
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

                {/* Sign Up Link */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#4A5568', fontSize: 16 }}>Don't have an account? </Text>
                  <Pressable onPress={handleSignUp}>
                    <Text style={{ color: '#4F46E5', fontWeight: '600', fontSize: 16 }}>Sign Up</Text>
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