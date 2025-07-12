import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore } from '../state/journalStore';
import { cn } from '../utils/cn';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp_ = RouteProp<RootStackParamList, 'ViewJournalEntry'>;

const MemoryTypeIcons = {
  reflection: 'book-outline',
  meal: 'restaurant-outline',
  discovery: 'compass-outline',
  lesson: 'bulb-outline',
  highlight: 'star-outline',
  place: 'location-outline',
  person: 'person-outline',
  general: 'journal-outline',
} as const;

const MemoryTypeColors = {
  reflection: '#8B5CF6',
  meal: '#F59E0B',
  discovery: '#10B981',
  lesson: '#3B82F6',
  highlight: '#EF4444',
  place: '#EC4899',
  person: '#F97316',
  general: '#6B7280',
};

const MoodEmojis = {
  amazing: '🤩',
  great: '😊',
  good: '🙂',
  okay: '😐',
  awful: '😔',
};

export default function ViewJournalEntryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp_>();
  const { tripId, entryId } = route.params;

  const journal = useJournalStore((state) => state.getJournal(tripId));
  const deleteEntry = useJournalStore((state) => state.deleteEntry);

  const entry = journal?.entries.find(e => e.id === entryId);

  const iconName = entry ? MemoryTypeIcons[entry.type] as keyof typeof Ionicons.glyphMap : 'journal-outline';
  const memoryColor = entry ? MemoryTypeColors[entry.type] : '#6B7280';

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteEntry(tripId, entryId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!entry) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Memory not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const color = MemoryTypeColors[entry.type];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white border-b border-gray-100 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable 
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4"
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </Pressable>
            <View>
              <Text className="text-xl font-bold text-gray-900 capitalize">
                {entry.title || entry.type}
              </Text>
              <Text className="text-sm text-gray-600">
                {(() => {
                  try {
                    // Handle both yyyy-MM-dd and ISO string formats
                    const dateObj = entry.date.includes('T') ? parseISO(entry.date) : new Date(entry.date + 'T00:00:00');
                    return format(dateObj, 'EEEE, MMMM d, yyyy');
                  } catch (error) {
                    return entry.date;
                  }
                })()}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => navigation.navigate('AddJournalEntry', { tripId, entryId })}
              className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center"
            >
              <Ionicons name="pencil-outline" size={20} color="#3B82F6" />
            </Pressable>
            <Pressable
              onPress={handleDelete}
              className="w-10 h-10 rounded-full bg-red-100 items-center justify-center"
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        <Animated.View entering={FadeInDown.duration(400)}>
          {/* Memory Type and Mood */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View 
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: memoryColor + '20' }}
              >
                <Ionicons name={iconName} size={20} color={memoryColor} />
              </View>
              <Text className="text-lg font-semibold text-gray-900 capitalize">
                {entry.type}
              </Text>
            </View>
            {entry.mood && (
              <View className="flex-row items-center">
                <Text className="text-2xl mr-2">{MoodEmojis[entry.mood]}</Text>
                <Text className="text-gray-600 capitalize">{entry.mood}</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-gray-900 text-base leading-6">
              {entry.content}
            </Text>
          </View>

          {/* Photos */}
          {entry.photos.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Photos</Text>
              <View className="space-y-4">
                {entry.photos.map((photo) => (
                  <View key={photo.id} className="bg-white rounded-2xl overflow-hidden">
                    <Image
                      source={{ uri: photo.uri }}
                      className="w-full h-64"
                      style={{ resizeMode: 'cover' }}
                    />
                    {photo.caption && (
                      <View className="p-4">
                        <Text className="text-gray-700">{photo.caption}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tags */}
          {entry.tags.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Tags</Text>
              <View className="flex-row flex-wrap">
                {entry.tags.map((tag, index) => (
                  <View key={index} className="bg-indigo-100 rounded-full px-3 py-1 mr-2 mb-2">
                    <Text className="text-sm text-indigo-700">#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Location */}
          {entry.location && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Location</Text>
              <View className="bg-white rounded-2xl p-4 flex-row items-center">
                <Ionicons name="location" size={20} color="#3B82F6" />
                <Text className="text-gray-700 ml-3">
                  {entry.location.name || entry.location.address || 
                   `${entry.location.latitude.toFixed(4)}, ${entry.location.longitude.toFixed(4)}`}
                </Text>
              </View>
            </View>
          )}

          {/* Privacy Status */}
          <View className="bg-gray-100 rounded-2xl p-4 flex-row items-center">
            <Ionicons 
              name={entry.isPrivate ? "lock-closed" : "lock-open"} 
              size={20} 
              color="#6B7280" 
            />
            <Text className="text-gray-700 ml-3">
              {entry.isPrivate ? 'Private entry' : 'Shareable entry'}
            </Text>
          </View>

          <View className="h-20" />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}