import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  FadeInDown, 
  FadeInRight,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore } from '../state/journalStore';
import { useUserStore } from '../state/userStore';
import { JournalEntry, JournalPhoto } from '../types';
import { cn } from '../utils/cn';
import UpgradePrompt from '../components/UpgradePrompt';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp_ = RouteProp<RootStackParamList, 'AddJournalEntry'>;

const MemoryTypes: Array<{
  type: JournalEntry['type'];
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string;
}> = [
  {
    type: 'place',
    label: 'Place',
    icon: 'location-outline',
    color: '#EC4899',
    description: 'A special location or venue',
  },
  {
    type: 'meal',
    label: 'Meal',
    icon: 'restaurant-outline',
    color: '#F59E0B',
    description: 'Food experiences and restaurants',
  },
  {
    type: 'reflection',
    label: 'Reflection',
    icon: 'book-outline',
    color: '#8B5CF6',
    description: 'Thoughts and feelings about your day',
  },
  {
    type: 'person',
    label: 'Person',
    icon: 'person-outline',
    color: '#F97316',
    description: 'People you met or traveled with',
  },
  {
    type: 'discovery',
    label: 'Discovery',
    icon: 'compass-outline',
    color: '#10B981',
    description: 'New places and hidden gems',
  },
  {
    type: 'lesson',
    label: 'Lesson',
    icon: 'bulb-outline',
    color: '#3B82F6',
    description: 'Things learned for next time',
  },
  {
    type: 'highlight',
    label: 'Highlight',
    icon: 'star-outline',
    color: '#EF4444',
    description: 'Best moments of the day',
  },
  {
    type: 'general',
    label: 'General',
    icon: 'journal-outline',
    color: '#6B7280',
    description: 'Anything else worth noting',
  },
];

const MoodOptions: Array<{
  mood: JournalEntry['mood'];
  emoji: string;
  label: string;
}> = [
  { mood: 'amazing', emoji: '🤩', label: 'Amazing' },
  { mood: 'great', emoji: '😊', label: 'Great' },
  { mood: 'good', emoji: '🙂', label: 'Good' },
  { mood: 'okay', emoji: '😐', label: 'Okay' },
  { mood: 'awful', emoji: '😔', label: 'Awful' },
];

export default function AddJournalEntryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp_>();
  const { tripId, entryId } = route.params;

  const addEntry = useJournalStore((state) => state.addEntry);
  const updateEntry = useJournalStore((state) => state.updateEntry);
  const getJournal = useJournalStore((state) => state.getJournal);
  
  const canPerformAction = useUserStore((state) => state.canPerformAction);
  const getEffectiveTier = useUserStore((state) => state.getEffectiveTier);
  const incrementUsage = useUserStore((state) => state.incrementUsage);
  
  // Check if we're in edit mode
  const isEditing = !!entryId;
  const existingEntry = isEditing ? getJournal(tripId)?.entries.find(e => e.id === entryId) : null;

  const [formData, setFormData] = useState({
    type: existingEntry?.type || 'place' as JournalEntry['type'],
    title: existingEntry?.title || '',
    content: existingEntry?.content || '',
    location: existingEntry?.location?.name || '',
    date: existingEntry ? (existingEntry.date.includes('T') ? parseISO(existingEntry.date) : new Date(existingEntry.date + 'T00:00:00')) : new Date(),
    mood: existingEntry?.mood || undefined as JournalEntry['mood'],
    tags: existingEntry?.tags || [] as string[],
    isPrivate: existingEntry?.isPrivate || false,
  });

  const [photos, setPhotos] = useState<JournalPhoto[]>(existingEntry?.photos || []);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  const currentTier = getEffectiveTier();

  const selectedMemoryType = MemoryTypes.find(type => type.type === formData.type)!;

  const handlePickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access gallery is required to add photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const newPhoto: JournalPhoto = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          timestamp: new Date().toISOString(),
        };
        setPhotos(prev => [...prev, newPhoto]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to access gallery. Please try again or check app permissions in settings.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const newPhoto: JournalPhoto = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          timestamp: new Date().toISOString(),
        };
        setPhotos(prev => [...prev, newPhoto]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to access camera. Please try again or check app permissions in settings.');
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Missing Title', 'Please add a title to your journal memory');
      return;
    }

    // Check if user can create journal entries (only for new entries)
    if (!isEditing) {
      const { allowed } = canPerformAction('createJournalEntry');
      if (!allowed) {
        setShowUpgradePrompt(true);
        return;
      }
    }

    setIsLoading(true);
    
    try {
      if (isEditing && entryId) {
        // Update existing entry
        updateEntry(tripId, entryId, {
          type: formData.type,
          title: formData.title.trim(),
          content: formData.content.trim() || undefined,
          location: formData.location.trim() ? { name: formData.location.trim() } : undefined,
          date: format(formData.date, 'yyyy-MM-dd'),
          mood: formData.mood,
          tags: formData.tags,
          photos,
          isPrivate: formData.isPrivate,
        });
      } else {
        // Add new entry
        addEntry(tripId, {
          tripId,
          type: formData.type,
          title: formData.title.trim(),
          content: formData.content.trim() || undefined,
          location: formData.location.trim() ? { name: formData.location.trim() } : undefined,
          date: format(formData.date, 'yyyy-MM-dd'),
          mood: formData.mood,
          tags: formData.tags,
          photos,
          isPrivate: formData.isPrivate,
        });
        
        // Increment usage for new entries
        incrementUsage('journalEntries');
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', isEditing ? 'Failed to update journal memory' : 'Failed to save journal memory');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="bg-white border-b border-gray-100 px-6 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Pressable 
                onPress={() => navigation.goBack()}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </Pressable>
              <View>
                <Text className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Memory' : 'New Memory'}</Text>
                <Text className="text-sm text-gray-600">{selectedMemoryType.label}</Text>
              </View>
            </View>
            <Pressable
              onPress={handleSave}
              disabled={isLoading}
              className={cn(
                "px-4 py-2 rounded-xl",
                isLoading ? "bg-gray-300" : "bg-indigo-500"
              )}
            >
              <Text className="text-white font-semibold">
                {isLoading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update' : 'Save')}
              </Text>
            </Pressable>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          {/* Memory Type Selection */}
          <Animated.View entering={FadeInDown.duration(400)} className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">Memory Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
              <View className="flex-row gap-6">
                {MemoryTypes.map((type) => (
                  <Pressable
                    key={type.type}
                    onPress={() => setFormData(prev => ({ ...prev, type: type.type }))}
                    className={cn(
                      "px-5 py-4 rounded-2xl border items-center min-w-[110px]",
                      formData.type === type.type
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 bg-white"
                    )}
                  >
                    <View 
                      className="w-8 h-8 rounded-full items-center justify-center mb-2"
                      style={{ 
                        backgroundColor: formData.type === type.type 
                          ? type.color + '20' 
                          : '#F3F4F6' 
                      }}
                    >
                      <Ionicons 
                        name={type.icon} 
                        size={16} 
                        color={formData.type === type.type ? type.color : '#6B7280'} 
                      />
                    </View>
                    <Text className={cn(
                      "text-xs font-medium text-center",
                      formData.type === type.type ? "text-indigo-600" : "text-gray-600"
                    )}>
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </Animated.View>

          {/* Date & Time Selection */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">Date & Time</Text>
            
            {/* Date Picker */}
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="calendar-outline" size={18} color="#4F46E5" />
                  <View className="ml-3">
                    <Text className="text-gray-900 font-medium text-sm">Date</Text>
                    <Text className="text-gray-600 text-base">
                      {format(formData.date, 'EEEE, MMMM d, yyyy')}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
            </Pressable>

            {/* Time Picker */}
            <Pressable
              onPress={() => setShowTimePicker(true)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="time-outline" size={18} color="#6366F1" />
                  <View className="ml-3">
                    <Text className="text-gray-900 font-medium text-sm">Time</Text>
                    <Text className="text-gray-600 text-base">
                      {format(formData.date, 'h:mm a')}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
            </Pressable>
          </Animated.View>

          {/* Title (Required) */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Title</Text>
            <TextInput
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
              placeholder={`What's your ${selectedMemoryType.label.toLowerCase()} about?`}
              placeholderTextColor="#9CA3AF"
            />
          </Animated.View>

          {/* Content */}
          <Animated.View entering={FadeInDown.delay(250).duration(400)} className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Content (Optional)</Text>
            <TextInput
              value={formData.content}
              onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
              placeholder={selectedMemoryType.description}
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </Animated.View>

          {/* Location */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Location (Optional)</Text>
            <TextInput
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
              placeholder="Where are you? (e.g., Paris, Eiffel Tower)"
              placeholderTextColor="#9CA3AF"
            />
          </Animated.View>

          {/* Photos */}
          <Animated.View entering={FadeInDown.delay(350).duration(400)} className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">Photos</Text>
            
            {photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                <View className="flex-row space-x-3">
                  {photos.map((photo) => (
                    <View key={photo.id} className="relative">
                      <Image
                        source={{ uri: photo.uri }}
                        className="w-20 h-20 rounded-xl"
                        style={{ resizeMode: 'cover' }}
                      />
                      <Pressable
                        onPress={() => handleRemovePhoto(photo.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                      >
                        <Ionicons name="close" size={12} color="white" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            <View className="flex-row gap-4">
              <Pressable
                onPress={handleTakePhoto}
                className="flex-1 bg-white border border-gray-200 rounded-xl p-4 items-center"
              >
                <Ionicons name="camera-outline" size={24} color="#6B7280" />
                <Text className="text-sm text-gray-600 mt-2">Take Photo</Text>
              </Pressable>
              <Pressable
                onPress={handlePickImage}
                className="flex-1 bg-white border border-gray-200 rounded-xl p-4 items-center"
              >
                <Ionicons name="image-outline" size={24} color="#6B7280" />
                <Text className="text-sm text-gray-600 mt-2">From Gallery</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Mood */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">How was it?</Text>
            <View className="flex-row justify-between">
              {MoodOptions.map((option) => (
                <Pressable
                  key={option.mood}
                  onPress={() => setFormData(prev => ({ 
                    ...prev, 
                    mood: prev.mood === option.mood ? undefined : option.mood 
                  }))}
                  className={cn(
                    "items-center p-3 rounded-2xl flex-1 mx-1",
                    formData.mood === option.mood ? "bg-indigo-50 border border-indigo-200" : "bg-white border border-gray-200"
                  )}
                >
                  <Text className="text-2xl mb-1">{option.emoji}</Text>
                  <Text className={cn(
                    "text-xs font-medium",
                    formData.mood === option.mood ? "text-indigo-600" : "text-gray-600"
                  )}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Tags */}
          <Animated.View entering={FadeInDown.delay(450).duration(400)} className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">Tags</Text>
            
            {formData.tags.length > 0 && (
              <View className="flex-row flex-wrap mb-3">
                {formData.tags.map((tag, index) => (
                  <View key={index} className="bg-indigo-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                    <Text className="text-sm text-indigo-700">#{tag}</Text>
                    <Pressable
                      onPress={() => handleRemoveTag(tag)}
                      className="ml-2"
                    >
                      <Ionicons name="close" size={14} color="#4F46E5" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            <View className="flex-row">
              <TextInput
                value={newTag}
                onChangeText={setNewTag}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 mr-3"
                placeholder="Add a tag..."
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={handleAddTag}
              />
              <Pressable
                onPress={handleAddTag}
                className="bg-indigo-500 rounded-xl px-4 py-3 items-center justify-center"
              >
                <Ionicons name="add" size={20} color="white" />
              </Pressable>
            </View>
          </Animated.View>

          {/* Privacy */}
          <Animated.View entering={FadeInDown.delay(700).duration(400)} className="mb-8">
            <Pressable
              onPress={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
              className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl p-4"
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name={formData.isPrivate ? "lock-closed" : "lock-open"} 
                  size={20} 
                  color="#6B7280" 
                />
                <Text className="text-gray-900 font-medium ml-3">Private Memory</Text>
              </View>
              <View className={cn(
                "w-12 h-6 rounded-full items-center justify-center",
                formData.isPrivate ? "bg-indigo-500" : "bg-gray-300"
              )}>
                <View className={cn(
                  "w-4 h-4 rounded-full bg-white transform transition-transform",
                  formData.isPrivate ? "translate-x-3" : "-translate-x-3"
                )} />
              </View>
            </Pressable>
          </Animated.View>
        </ScrollView>
        
        {/* Date Picker Modal */}
        {Platform.OS === 'ios' ? (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View className="flex-1 bg-black/50 justify-end">
              <Animated.View 
                entering={FadeInDown.duration(300)}
                className="bg-white rounded-t-3xl"
              >
                <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
                  <Pressable 
                    onPress={() => setShowDatePicker(false)}
                    className="py-2"
                  >
                    <Text style={{ color: '#4F46E5', fontWeight: '600', fontSize: 18 }}>Cancel</Text>
                  </Pressable>
                  <Text className="text-xl font-bold text-gray-900">Select Date</Text>
                  <Pressable 
                    onPress={() => setShowDatePicker(false)}
                    className="py-2"
                  >
                    <Text style={{ color: '#4F46E5', fontWeight: '600', fontSize: 18 }}>Done</Text>
                  </Pressable>
                </View>
                
                <View className="px-6 pb-6">
                  <DateTimePicker
                    value={formData.date}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setFormData(prev => ({ ...prev, date: selectedDate }));
                      }
                    }}
                    style={{ 
                      height: 200,
                      width: '100%',
                    }}
                    textColor="#111827"
                  />
                </View>
              </Animated.View>
            </View>
          </Modal>
        ) : (
          showDatePicker && (
            <DateTimePicker
              value={formData.date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (event.type === 'set' && selectedDate) {
                  setFormData(prev => ({ ...prev, date: selectedDate }));
                }
              }}
            />
          )
        )}

        {/* Time Picker Modal */}
        {Platform.OS === 'ios' ? (
          <Modal
            visible={showTimePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowTimePicker(false)}
          >
            <View className="flex-1 bg-black/50 justify-end">
              <Animated.View 
                entering={FadeInDown.duration(300)}
                className="bg-white rounded-t-3xl"
              >
                <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
                  <Pressable 
                    onPress={() => setShowTimePicker(false)}
                    className="py-2"
                  >
                    <Text style={{ color: '#6366F1', fontWeight: '600', fontSize: 18 }}>Cancel</Text>
                  </Pressable>
                  <Text className="text-xl font-bold text-gray-900">Select Time</Text>
                  <Pressable 
                    onPress={() => setShowTimePicker(false)}
                    className="py-2"
                  >
                    <Text style={{ color: '#6366F1', fontWeight: '600', fontSize: 18 }}>Done</Text>
                  </Pressable>
                </View>
                
                <View className="px-6 pb-6">
                  <DateTimePicker
                    value={formData.date}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setFormData(prev => ({ ...prev, date: selectedDate }));
                      }
                    }}
                    style={{ 
                      height: 200,
                      width: '100%',
                    }}
                    textColor="#111827"
                  />
                </View>
              </Animated.View>
            </View>
          </Modal>
        ) : (
          showTimePicker && (
            <DateTimePicker
              value={formData.date}
              mode="time"
              display="default"
              onChange={(event, selectedDate) => {
                setShowTimePicker(false);
                if (event.type === 'set' && selectedDate) {
                  setFormData(prev => ({ ...prev, date: selectedDate }));
                }
              }}
            />
          )
        )}

        <UpgradePrompt
          visible={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          onUpgrade={() => {
            setShowUpgradePrompt(false);
            navigation.navigate('Subscription');
          }}
          feature="createJournalEntry"
          currentTier={currentTier}
          suggestedTier={currentTier === 'free' ? 'pro' : 'elite'}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}