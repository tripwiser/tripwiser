import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  Alert,
  Dimensions,
  Image,
  Modal,
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
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import mixpanel from '../services/analytics';

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
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

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
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  
  React.useEffect(() => {
    mixpanel.track('Settings Screen Viewed');
  }, []);

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
      t('settings.theme'),
      t('settings.chooseTheme'),
      [
        {
          text: t('settings.light'),
          onPress: () => userStore.updatePreferences({ theme: 'light' }),
        },
        {
          text: t('settings.dark'),
          onPress: () => userStore.updatePreferences({ theme: 'dark' }),
        },
        {
          text: t('settings.system'),
          onPress: () => userStore.updatePreferences({ theme: 'system' }),
        },
        { text: t('settings.cancel') || 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleTemperatureUnitChange = () => {
    Alert.alert(
      t('settings.temperatureUnit'),
      t('settings.chooseTemperatureUnit'),
      [
        {
          text: t('settings.celsius'),
          onPress: () => userStore.updatePreferences({ temperatureUnit: 'celsius' }),
        },
        {
          text: t('settings.fahrenheit'),
          onPress: () => userStore.updatePreferences({ temperatureUnit: 'fahrenheit' }),
        },
        { text: t('settings.cancel'), style: 'cancel' },
      ]
    );
  };
  
  const handleLogout = () => {
    Alert.alert(
      t('settings.signOut'),
      t('settings.signOutConfirm'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.signOut'),
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
      t('settings.resetData'),
      t('settings.resetDataConfirm'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.reset'),
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
        t('settings.premiumFeature'),
        t('settings.exportDataPremium'),
        [
          { text: t('settings.maybeLater'), style: 'cancel' },
          { text: t('settings.upgradeNow'), onPress: () => navigation.navigate('Subscription') },
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
        t('settings.premiumFeature'),
        t('settings.importDataPremium'),
        [
          { text: t('settings.maybeLater'), style: 'cancel' },
          { text: t('settings.upgradeNow'), onPress: () => navigation.navigate('Subscription') },
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
          t('settings.importData'),
          t('settings.importDataSuccess', { trips: importedData.trips.length, templates: importedData.templates.length }),
          [
            { text: t('settings.cancel'), style: 'cancel' },
            {
              text: t('settings.import'),
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
        t('settings.premiumFeature'),
        t('settings.cloudSyncPremium'),
        [
          { text: t('settings.maybeLater'), style: 'cancel' },
          { text: t('settings.upgradeNow'), onPress: () => navigation.navigate('Subscription') },
        ]
      );
      return;
    }

    try {
      const syncStatus = await cloudSyncService.getSyncStatus();
      
      if (!syncStatus.isEnabled) {
        Alert.alert(
          t('settings.enableCloudSync'),
          t('settings.enableCloudSyncConfirm'),
          [
            { text: t('settings.cancel'), style: 'cancel' },
            {
              text: t('settings.enable'),
              onPress: async () => {
                await cloudSyncService.enableCloudSync(userStore.user?.id || 'guest', currentTier);
                Alert.alert('Success', 'Cloud sync has been enabled!');
              }
            }
          ]
        );
      } else {
        Alert.alert(
          t('settings.cloudSync'),
          t('settings.cloudSyncLastSync', { date: syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleString() : 'Never' }),
          [
            { text: t('settings.cancel'), style: 'cancel' },
            {
              text: t('settings.syncNow'),
              onPress: async () => {
                await cloudSyncService.syncData(trips, templates, true);
                Alert.alert('Success', 'Data synced successfully!');
              }
            },
            {
              text: t('settings.disable'),
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

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const languageList = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'hi', label: 'Hindi' },
    { code: 'zh', label: 'Chinese' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ar', label: 'Arabic' },
    { code: 'ru', label: 'Russian' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'it', label: 'Italian' },
    { code: 'tr', label: 'Turkish' },
    { code: 'ko', label: 'Korean' },
    { code: 'nl', label: 'Dutch' },
    { code: 'pl', label: 'Polish' },
  ];

  const getLanguageDisplayName = () => {
    switch (userStore.language) {
      case 'en': return 'English';
      case 'es': return 'Spanish';
      case 'fr': return 'French';
      case 'de': return 'German';
      case 'hi': return 'Hindi';
      case 'zh': return 'Chinese';
      case 'ja': return 'Japanese';
      case 'ar': return 'Arabic';
      case 'ru': return 'Russian';
      case 'pt': return 'Portuguese';
      default: return 'English';
    }
  };
  
  let itemIndex = 0;

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['45%'], []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <>
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
          {/* Clean Header - Matching MyTrips Height */}
          <SafeAreaView style={{ backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <View style={{ paddingHorizontal: 16, paddingTop: insets.top, paddingBottom: 0 }}>
              <Animated.View entering={FadeInDown.duration(600)}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 0 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 24, fontWeight: '700', color: theme.text, marginBottom: 4 }}>
                      {t('settings.title')}
                    </Text>
                    <Text style={{ fontSize: 16, color: theme.muted, fontWeight: '500' }}>
                      {userStore.user?.name || t('settings.customizeExperience')}
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
              title={t('settings.account')}
              subtitle={t('settings.manageProfile') || 'Manage your profile and subscription'}
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
              title={t('settings.subscription')}
              subtitle={t('settings.currentPlan', { plan: userStore.getEffectiveTier().charAt(0).toUpperCase() + userStore.getEffectiveTier().slice(1) }) || `Current plan: ${userStore.getEffectiveTier().charAt(0).toUpperCase() + userStore.getEffectiveTier().slice(1)}`}
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
              title={t('settings.editProfile')}
              subtitle={t('settings.editProfileSubtitle') || 'Update your name and personal information'}
              onPress={() => navigation.navigate('EditProfile')}
              index={itemIndex++}
            />
            
            <SettingItem
              icon="people"
              title={t('settings.sharedWithYou')}
              subtitle={t('settings.sharedWithYouSubtitle') || 'Trips and plans from your friends'}
              onPress={() => navigation.navigate('Collaboration')}
              index={itemIndex++}
            />
            
            <SettingItem
              icon="log-out"
              title={t('settings.signOut')}
              subtitle={t('settings.signOutSubtitle') || 'Sign out of your account'}
              onPress={handleLogout}
              index={itemIndex++}
              isDangerous={true}
            />
            
            {/* Preferences */}
            <SectionHeader 
              title={t('settings.preferences')}
              subtitle={t('settings.customizeExperience') || 'Customize your experience'}
              index={1}
            />
            
            <SettingItem
              icon="notifications"
              title={t('settings.reminders')}
              subtitle={t('settings.remindersSubtitle') || 'Get reminded before your departure'}
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
              title={t('settings.weather')}
              subtitle={t('settings.weatherSubtitle') || 'Receive weather alerts for trips'}
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
              title={t('settings.tips')}
              subtitle={t('settings.tipsSubtitle') || 'Get daily packing and travel advice'}
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
              title={t('settings.theme')}
              subtitle={t('settings.currentTheme', { theme: getThemeDisplayName().toLowerCase() })}
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
            
            {/* Language Selection */}
            <SettingItem
              icon="language"
              title={t('settings.language')}
              subtitle={t('settings.currentLanguage', { language: getLanguageDisplayName() })}
              onPress={() => Alert.alert('Feature coming soon', 'Language selection will be available in a future update.')}
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
                    {getLanguageDisplayName()}
                  </Text>
                </View>
              }
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
                  color: theme.text,
                  marginBottom: 4,
                }}>
                  Tripwiser (beta version)
                </Text>
                
                <Text style={{
                  fontSize: 14,
                  color: theme.muted,
                  textAlign: 'center',
                  fontWeight: '400',
                }}>
                  Pack Smart & Capture the Journey
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        </View>
        {/* Language Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={showLanguageModal ? 0 : -1}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={() => setShowLanguageModal(false)}
          backgroundStyle={{ backgroundColor: theme.card }}
          handleIndicatorStyle={{ backgroundColor: theme.muted }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16, color: theme.text, textAlign: 'center' }}>{t('settings.language')}</Text>
          <ScrollView style={{ maxHeight: 240, width: '100%' }} contentContainerStyle={{ alignItems: 'center' }}>
            {languageList.map(lang => (
              <Pressable
                key={lang.code}
                onPress={() => {
                  userStore.updatePreferences({ language: lang.code });
                  i18n.changeLanguage(lang.code);
                  setShowLanguageModal(false);
                }}
                style={{ paddingVertical: 12, width: '100%', alignItems: 'center' }}
              >
                <Text style={{ color: userStore.language === lang.code ? theme.primary : theme.text, fontWeight: userStore.language === lang.code ? 'bold' : 'normal', fontSize: 16 }}>
                  {lang.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable onPress={() => setShowLanguageModal(false)} style={{ marginTop: 16 }}>
            <Text style={{ color: theme.primary, textAlign: 'center', fontWeight: '600' }}>{t('settings.cancel') || 'Cancel'}</Text>
          </Pressable>
        </BottomSheet>
      </>
    </GestureHandlerRootView>
  );
}