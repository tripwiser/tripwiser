import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../state/userStore';
import { useTripStore } from '../state/tripStore';
import { useTemplateStore } from '../state/templateStore';
import { cloudSyncService } from '../services/cloudSyncService';
import { SubscriptionService } from '../services/subscriptionService';
import { cn } from '../utils/cn';
import UserSubscriptionStatus from '../components/UserSubscriptionStatus';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showChevron?: boolean;
  index: number;
  iconColors?: string[];
  isDangerous?: boolean;
  isHighlight?: boolean;
}

const SettingItem = React.memo(function SettingItem({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  rightComponent, 
  showChevron = true,
  index,
  iconColors = ['#6B7280', '#9CA3AF'],
  isDangerous = false,
  isHighlight = false
}: SettingItemProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98);
    }
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 20).duration(300)}
      style={{ marginHorizontal: 20, marginBottom: 12 }}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!onPress}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#F1F5F9',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Simplified Icon */}
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: isDangerous ? '#FEF2F2' : isHighlight ? '#EEF2FF' : '#F8FAFC',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Ionicons 
                name={icon} 
                size={20} 
                color={isDangerous ? '#EF4444' : isHighlight ? '#4F46E5' : '#64748B'} 
              />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{
                color: '#0F172A',
                fontWeight: '600',
                fontSize: 16,
                marginBottom: subtitle ? 2 : 0,
              }}>
                {title}
              </Text>
              {subtitle && (
                <Text style={{
                  color: '#64748B',
                  fontSize: 14,
                  fontWeight: '400',
                }}>
                  {subtitle}
                </Text>
              )}
            </View>
            
            {rightComponent || (onPress && showChevron && (
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color="#CBD5E1" 
              />
            ))}
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
});

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  index: number;
  icon?: keyof typeof Ionicons.glyphMap;
}

const SectionHeader = React.memo(function SectionHeader({ title, subtitle, index }: SectionHeaderProps) {
  return (
    <Animated.View 
      entering={FadeInRight.delay(index * 50).duration(400)}
      style={{ 
        paddingHorizontal: 20, 
        paddingTop: index === 0 ? 24 : 32, 
        paddingBottom: 8,
      }}
    >
      <Text style={{
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: subtitle ? 4 : 0,
      }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{
          color: '#64748B',
          fontSize: 14,
          fontWeight: '400',
        }}>
          {subtitle}
        </Text>
      )}
    </Animated.View>
  );
});

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  
  const userStore = useUserStore();
  const { trips } = useTripStore();
  const templates = useTemplateStore((state) => state.templates);
  const importTemplate = useTemplateStore((state) => state.importTemplate);
  
  const handleNotificationToggle = (type: keyof typeof userStore.notifications) => {
    userStore.updatePreferences({
      notifications: {
        ...userStore.notifications,
        [type]: !userStore.notifications[type],
      },
    });
  };
  
  const handleThemeChange = () => {
    Alert.alert(
      'Theme',
      'Choose your preferred theme',
      [
        {
          text: 'Light',
          onPress: () => userStore.updatePreferences({ theme: 'light' }),
        },
        {
          text: 'Dark',
          onPress: () => userStore.updatePreferences({ theme: 'dark' }),
        },
        {
          text: 'System',
          onPress: () => userStore.updatePreferences({ theme: 'system' }),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleTemperatureUnitChange = () => {
    Alert.alert(
      'Temperature Unit',
      'Choose your preferred temperature unit',
      [
        {
          text: 'Celsius (°C)',
          onPress: () => userStore.updatePreferences({ temperatureUnit: 'celsius' }),
        },
        {
          text: 'Fahrenheit (°F)',
          onPress: () => userStore.updatePreferences({ temperatureUnit: 'fahrenheit' }),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You can always sign back in later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            // Add a small delay to allow animations to complete
            setTimeout(() => {
              try {
                userStore.logout();
              } catch (error) {
                console.warn('Logout error in settings:', error);
                // Force a clean logout by calling the function directly
                try {
                  userStore.logout();
                } catch (secondError) {
                  // If that also fails, manually trigger navigation reset
                  console.warn('Second logout attempt failed:', secondError);
                }
              }
            }, 100);
          },
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your trips and reset the app to its initial state. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Reset user store
            userStore.updatePreferences({
              name: undefined,
              avatar: undefined,
              subscriptionTier: 'free' as const,
              theme: 'system',
              notifications: {
                packingReminders: true,
                weatherUpdates: true,
                tipOfTheDay: false,
              },
              defaultSettings: {
                travelers: 1,
                preferredActivities: [],
              },
            });
            
            userStore.updateApp({
              hasCompletedOnboarding: false,
              currentTripId: undefined,
              lastOpenedTrip: undefined,
              freeTripCount: 0,
              showPremiumUpsell: false,
            });
            
            Alert.alert('Data Reset', 'All data has been cleared successfully.');
          },
        },
      ]
    );
  };
  
  const getThemeDisplayName = () => {
    switch (userStore.theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
      default: return 'System';
    }
  };

  const getTemperatureUnitDisplayName = () => {
    return userStore.temperatureUnit === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)';
  };

  const handleExportData = async () => {
    if (userStore.getEffectiveTier() === 'free') {
      Alert.alert(
        'Premium Feature',
        'Data export is a premium feature. Upgrade to Pro or Elite to export and backup your data.',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade Now', onPress: () => navigation.navigate('Subscription') },
        ]
      );
      return;
    }

    try {
      const exportData = await cloudSyncService.exportUserData(trips, templates);
      const fileName = `TripKit_Backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, exportData);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export TripKit Data',
        });
        Alert.alert('Success', 'Your data has been exported successfully!');
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const handleImportData = async () => {
    if (userStore.getEffectiveTier() === 'free') {
      Alert.alert(
        'Premium Feature',
        'Data import is a premium feature. Upgrade to Pro or Elite to import and restore your data.',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade Now', onPress: () => navigation.navigate('Subscription') },
        ]
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        const importedData = await cloudSyncService.importUserData(fileContent);
        
        Alert.alert(
          'Import Data',
          `Found ${importedData.trips.length} trips and ${importedData.templates.length} templates. This will merge with your existing data.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Import',
              onPress: () => {
                // Import templates
                importedData.templates.forEach(template => {
                  importTemplate(template);
                });
                
                Alert.alert('Success', 'Data imported successfully!');
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to import data. Please check the file format.');
    }
  };

  const handleCloudSync = async () => {
    const currentTier = userStore.getEffectiveTier();
    const features = SubscriptionService.getFeatures(currentTier);
    
    if (!features.cloudSync) {
      Alert.alert(
        'Premium Feature',
        'Cloud sync requires a Pro or Elite subscription. Upgrade to sync your data across devices.',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade Now', onPress: () => navigation.navigate('Subscription') },
        ]
      );
      return;
    }

    try {
      const syncStatus = await cloudSyncService.getSyncStatus();
      
      if (!syncStatus.isEnabled) {
        Alert.alert(
          'Enable Cloud Sync',
          'This will sync your data across all your devices. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Enable',
              onPress: async () => {
                await cloudSyncService.enableCloudSync(userStore.user?.id || 'guest', currentTier);
                Alert.alert('Success', 'Cloud sync has been enabled!');
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Cloud Sync',
          `Last synced: ${syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleString() : 'Never'}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sync Now',
              onPress: async () => {
                await cloudSyncService.syncData(trips, templates, true);
                Alert.alert('Success', 'Data synced successfully!');
              }
            },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                await cloudSyncService.disableCloudSync();
                Alert.alert('Success', 'Cloud sync has been disabled.');
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to manage cloud sync. Please try again.');
    }
  };
  
  let itemIndex = 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar style="dark" />
      
      {/* Clean Header - Matching MyTrips Height */}
      <SafeAreaView style={{ backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 0 }}>
          <Animated.View entering={FadeInDown.duration(600)}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 0 }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: 4,
                }}>
                  Settings
                </Text>
                <Text style={{
                  fontSize: 16,
                  color: '#6B7280',
                  fontWeight: '500',
                }}>
                  {userStore.user?.name || 'Customize your experience'}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {userStore.getEffectiveTier() !== 'free' && (
                  <View style={{
                    backgroundColor: '#4F46E5',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}>
                    <Text style={{
                      color: 'white',
                      fontWeight: '600',
                      fontSize: 12,
                    }}>
                      Premium
                    </Text>
                  </View>
                )}
                
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}>
                  <Ionicons name="person" size={24} color="#6B7280" />
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
      
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Account Management */}
        <SectionHeader 
          title="Account" 
          subtitle="Manage your profile and subscription"
          index={0}
        />
        
        <Animated.View 
          entering={FadeInDown.delay(50).duration(400)}
          style={{ marginHorizontal: 20, marginBottom: 16 }}
        >
          <UserSubscriptionStatus />
        </Animated.View>
        
        <SettingItem
          icon="diamond"
          title="Subscription"
          subtitle={`Current plan: ${userStore.getEffectiveTier().charAt(0).toUpperCase() + userStore.getEffectiveTier().slice(1)}`}
          onPress={() => navigation.navigate('Subscription')}
          rightComponent={
            <View style={{
              backgroundColor: userStore.getEffectiveTier() === 'free' ? '#FEF3C7' : userStore.getEffectiveTier() === 'pro' ? '#DBEAFE' : '#F3E8FF',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}>
              <Text style={{ 
                color: userStore.getEffectiveTier() === 'free' ? '#92400E' : userStore.getEffectiveTier() === 'pro' ? '#1E40AF' : '#5B21B7', 
                fontWeight: '600', 
                fontSize: 12,
              }}>
                {userStore.getEffectiveTier().toUpperCase()}
              </Text>
            </View>
          }
          index={itemIndex++}
          isHighlight={userStore.getEffectiveTier() === 'free'}
        />
        
        <SettingItem
          icon="person"
          title="Edit Profile"
          subtitle="Update your name and personal information"
          onPress={() => {
            Alert.alert(
              'Edit Profile',
              'Profile editing is not implemented in this demo.',
              [{ text: 'OK' }]
            );
          }}
          index={itemIndex++}
        />
        
        <SettingItem
          icon="log-out"
          title="Sign Out"
          subtitle="Sign out of your account"
          onPress={handleLogout}
          index={itemIndex++}
          isDangerous={true}
        />
        
        {/* Preferences */}
        <SectionHeader 
          title="Preferences" 
          subtitle="Customize your experience"
          index={1}
        />
        
        <SettingItem
          icon="notifications"
          title="Packing Reminders"
          subtitle="Get reminded before your departure"
          rightComponent={
            <Switch
              value={userStore.notifications.packingReminders}
              onValueChange={() => handleNotificationToggle('packingReminders')}
              trackColor={{ false: '#E2E8F0', true: '#4F46E5' }}
              thumbColor={'#FFFFFF'}
            />
          }
          showChevron={false}
          index={itemIndex++}
        />
        
        <SettingItem
          icon="partly-sunny"
          title="Weather Updates"
          subtitle="Receive weather alerts for trips"
          rightComponent={
            <Switch
              value={userStore.notifications.weatherUpdates}
              onValueChange={() => handleNotificationToggle('weatherUpdates')}
              trackColor={{ false: '#E2E8F0', true: '#4F46E5' }}
              thumbColor={'#FFFFFF'}
            />
          }
          showChevron={false}
          index={itemIndex++}
        />
        
        <SettingItem
          icon="bulb"
          title="Travel Tips"
          subtitle="Get daily packing and travel advice"
          rightComponent={
            <Switch
              value={userStore.notifications.tipOfTheDay}
              onValueChange={() => handleNotificationToggle('tipOfTheDay')}
              trackColor={{ false: '#E2E8F0', true: '#4F46E5' }}
              thumbColor={'#FFFFFF'}
            />
          }
          showChevron={false}
          index={itemIndex++}
        />
        
        <SettingItem
          icon="color-palette"
          title="App Theme"
          subtitle={`Currently using ${getThemeDisplayName().toLowerCase()} theme`}
          onPress={handleThemeChange}
          rightComponent={
            <View style={{
              backgroundColor: '#EEF2FF',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}>
              <Text style={{ 
                color: '#4F46E5', 
                fontWeight: '600', 
                fontSize: 12,
              }}>
                {getThemeDisplayName()}
              </Text>
            </View>
          }
          index={itemIndex++}
        />
        
        <SettingItem
          icon="thermometer"
          title="Temperature Unit"
          subtitle="Preferred weather display unit"
          onPress={handleTemperatureUnitChange}
          rightComponent={
            <View style={{
              flexDirection: 'row',
              backgroundColor: '#EEF2FF',
              borderRadius: 16,
              padding: 3,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E0E7FF',
              shadowColor: '#4F46E5',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <Pressable
                style={{
                  backgroundColor: userStore.temperatureUnit === 'celsius' ? '#4F46E5' : 'transparent',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 13,
                  minWidth: 36,
                  alignItems: 'center',
                  shadowColor: userStore.temperatureUnit === 'celsius' ? '#4F46E5' : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: userStore.temperatureUnit === 'celsius' ? 0.2 : 0,
                  shadowRadius: 4,
                  elevation: userStore.temperatureUnit === 'celsius' ? 2 : 0,
                }}
                onPress={() => userStore.updatePreferences({ temperatureUnit: 'celsius' })}
              >
                <Text style={{ 
                  color: userStore.temperatureUnit === 'celsius' ? 'white' : '#6B7280', 
                  fontWeight: userStore.temperatureUnit === 'celsius' ? '700' : '600', 
                  fontSize: 13,
                }}>
                  °C
                </Text>
              </Pressable>
              <Pressable
                style={{
                  backgroundColor: userStore.temperatureUnit === 'fahrenheit' ? '#4F46E5' : 'transparent',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 13,
                  minWidth: 36,
                  alignItems: 'center',
                  shadowColor: userStore.temperatureUnit === 'fahrenheit' ? '#4F46E5' : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: userStore.temperatureUnit === 'fahrenheit' ? 0.2 : 0,
                  shadowRadius: 4,
                  elevation: userStore.temperatureUnit === 'fahrenheit' ? 2 : 0,
                }}
                onPress={() => userStore.updatePreferences({ temperatureUnit: 'fahrenheit' })}
              >
                <Text style={{ 
                  color: userStore.temperatureUnit === 'fahrenheit' ? 'white' : '#6B7280', 
                  fontWeight: userStore.temperatureUnit === 'fahrenheit' ? '700' : '600', 
                  fontSize: 13,
                }}>
                  °F
                </Text>
              </Pressable>
            </View>
          }
          showChevron={false}
          index={itemIndex++}
        />
        
        {/* Support & Help */}
        <SectionHeader 
          title="Support" 
          subtitle="Get help when you need it"
          index={2}
        />
        
        <SettingItem
          icon="help-circle"
          title="Help & FAQ"
          subtitle="Find answers to common questions"
          onPress={() => {
            Alert.alert(
              'Help & FAQ',
              'This would open the help center in a real app.',
              [{ text: 'OK' }]
            );
          }}
          index={itemIndex++}
        />
        
        <SettingItem
          icon="mail"
          title="Contact Support"
          subtitle="Get help from our friendly team"
          onPress={() => {
            Alert.alert(
              'Contact Support',
              'This would open the contact form in a real app.',
              [{ text: 'OK' }]
            );
          }}
          index={itemIndex++}
        />
        
        <SettingItem
          icon="heart"
          title="Rate TripKit"
          subtitle="Love the app? Share your experience"
          onPress={() => {
            Alert.alert(
              'Rate TripKit',
              'Thanks for considering rating our app! This would open the App Store in a real app.',
              [{ text: 'OK' }]
            );
          }}
          index={itemIndex++}
        />
        
        {/* Legal & Privacy */}
        <SectionHeader 
          title="Legal" 
          subtitle="Privacy and terms information"
          index={3}
        />
        
        <SettingItem
          icon="shield-checkmark"
          title="Privacy Policy"
          subtitle="How we protect your information"
          onPress={() => {
            Alert.alert(
              'Privacy Policy',
              'This would open the privacy policy in a real app.',
              [{ text: 'OK' }]
            );
          }}
          index={itemIndex++}
        />
        
        <SettingItem
          icon="document-text"
          title="Terms of Service"
          subtitle="Our terms and conditions"
          onPress={() => {
            Alert.alert(
              'Terms of Service',
              'This would open the terms of service in a real app.',
              [{ text: 'OK' }]
            );
          }}
          index={itemIndex++}
        />
        
        {/* Data Management */}
        <SectionHeader 
          title="Data Management" 
          subtitle="Backup, sync and import your data"
          index={4}
        />
        
        <SettingItem
          icon="cloud"
          title="Cloud Sync"
          subtitle="Sync data across devices"
          onPress={handleCloudSync}
          index={itemIndex++}
        />
        
        <SettingItem
          icon="download" 
          title="Export Data"
          subtitle="Backup your trips and templates"
          onPress={handleExportData}
          index={itemIndex++}
        />
        
        <SettingItem
          icon="cloud-upload"
          title="Import Data"
          subtitle="Restore from backup file"
          onPress={handleImportData}
          index={itemIndex++}
        />


        
        {/* Clean App Info */}
        <Animated.View 
          entering={FadeInUp.delay(400).duration(400)}
          style={{ 
            paddingHorizontal: 20, 
            paddingVertical: 32,
            alignItems: 'center' 
          }}
        >
          <View style={{
            alignItems: 'center',
          }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              marginBottom: 12,
              overflow: 'hidden',
            }}>
              <Image
                source={{ uri: 'https://images.composerapi.com/6120FD84-1741-41F7-9E01-59FE54810C0B.jpg' }}
                style={{
                  width: 48,
                  height: 48,
                }}
                resizeMode="contain"
              />
            </View>
            
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: 4,
            }}>
              TripKit v1.0.0
            </Text>
            
            <Text style={{
              fontSize: 14,
              color: '#64748B',
              textAlign: 'center',
              fontWeight: '400',
            }}>
              Pack Smart & Capture the Journey
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}