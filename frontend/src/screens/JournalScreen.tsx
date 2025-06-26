import React, { useState, useMemo } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInRight,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useTripStore } from '../state/tripStore';
import { useJournalStore } from '../state/journalStore';
import { JournalEntry } from '../types';
import { cn } from '../utils/cn';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp_ = RouteProp<RootStackParamList, 'Journal'>;

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

function EntryCard({ entry, onPress }: { entry: JournalEntry; onPress: () => void }) {
  const iconName = MemoryTypeIcons[entry.type] as keyof typeof Ionicons.glyphMap;
  const color = MemoryTypeColors[entry.type];

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <Pressable
        onPress={onPress}
        className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 pb-2">
          <View className="flex-row items-center">
            <View 
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: color + '20' }}
            >
              <Ionicons name={iconName} size={16} color={color} />
            </View>
            <View>
              <Text className="text-sm font-medium text-gray-900 capitalize">
                {entry.title || entry.type}
              </Text>
              <Text className="text-xs text-gray-500">
                {(() => {
                  try {
                    // Handle both yyyy-MM-dd and ISO string formats
                    const dateObj = entry.date.includes('T') ? parseISO(entry.date) : new Date(entry.date + 'T00:00:00');
                    return format(dateObj, 'MMM d, yyyy');
                  } catch (error) {
                    return entry.date;
                  }
                })()}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            {entry.mood && (
              <Text className="mr-2 text-lg">{MoodEmojis[entry.mood]}</Text>
            )}
            {entry.photos.length > 0 && (
              <View className="flex-row items-center">
                <Ionicons name="camera" size={14} color="#6B7280" />
                <Text className="text-xs text-gray-500 ml-1">{entry.photos.length}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content Preview */}
        <View className="px-4 pb-2">
          <Text className="text-gray-700 text-sm" numberOfLines={2}>
            {entry.content}
          </Text>
        </View>

        {/* Photos Preview */}
        {entry.photos.length > 0 && (
          <View className="px-4 pb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {entry.photos.slice(0, 3).map((photo, index) => (
                  <Image
                    key={photo.id}
                    source={{ uri: photo.uri }}
                    className="w-16 h-16 rounded-lg"
                    style={{ resizeMode: 'cover' }}
                  />
                ))}
                {entry.photos.length > 3 && (
                  <View className="w-16 h-16 rounded-lg bg-gray-100 items-center justify-center">
                    <Text className="text-xs text-gray-500 font-medium">
                      +{entry.photos.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <View className="px-4 pb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {entry.tags.map((tag, index) => (
                  <View key={index} className="bg-indigo-100 px-2 py-1 rounded-full">
                    <Text className="text-xs text-indigo-700">#{tag}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function JournalScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp_>();
  const { tripId } = route.params;

  const trip = useTripStore((state) => state.getTripById(tripId));
  const journal = useJournalStore((state) => state.getJournal(tripId));
  const createJournal = useJournalStore((state) => state.createJournal);
  const getJournalStats = useJournalStore((state) => state.getJournalStats);

  const [activeTab, setActiveTab] = useState<'timeline' | 'map'>('timeline');

  // Create journal if it doesn't exist
  const currentJournal = journal || createJournal(tripId);
  const stats = getJournalStats(tripId);

  // Group entries by date
  const entriesByDate = useMemo(() => {
    const grouped: Record<string, JournalEntry[]> = {};
    currentJournal.entries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach((entry) => {
        if (!grouped[entry.date]) {
          grouped[entry.date] = [];
        }
        grouped[entry.date].push(entry);
      });
    return grouped;
  }, [currentJournal.entries]);

  const handleAddEntry = () => {
    navigation.navigate('AddJournalEntry', { tripId });
  };

  const handleViewEntry = (entry: JournalEntry) => {
    navigation.navigate('ViewJournalEntry', { tripId, entryId: entry.id });
  };

  if (!trip) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Trip not found</Text>
        </View>
      </SafeAreaView>
    );
  }

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
              <Text className="text-xl font-bold text-gray-900">Travel Journal</Text>
              <Text className="text-sm text-gray-600">{trip.name}</Text>
            </View>
          </View>
          
          {/* New Memory Button - Only show when there are memories */}
          {currentJournal.entries.length > 0 && (
            <Pressable
              onPress={handleAddEntry}
              className="px-4 py-2 rounded-xl bg-indigo-500"
            >
              <Text className="text-white font-semibold">
                New Memory
              </Text>
            </Pressable>
          )}
        </View>

        {/* Stats */}
        <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-100">
          <View className="items-center">
            <Text className="text-2xl font-bold text-indigo-600">{stats.totalEntries}</Text>
            <Text className="text-xs text-gray-500">Entries</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">{stats.totalPhotos}</Text>
            <Text className="text-xs text-gray-500">Photos</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-purple-600">{stats.daysDocumented}</Text>
            <Text className="text-xs text-gray-500">Days</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-600">{stats.visitedLocations}</Text>
            <Text className="text-xs text-gray-500">Places</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="bg-white border-b border-gray-100">
        <View className="flex-row">
          {[
            { key: 'timeline', label: 'Timeline', icon: 'time-outline' },
            { key: 'map', label: 'Map', icon: 'location-outline' },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              className={cn(
                "flex-1 flex-row items-center justify-center py-3 border-b-2",
                activeTab === tab.key ? "border-indigo-500" : "border-transparent"
              )}
            >
              <Ionicons 
                name={tab.icon as keyof typeof Ionicons.glyphMap} 
                size={16} 
                color={activeTab === tab.key ? "#4F46E5" : "#6B7280"} 
              />
              <Text className={cn(
                "text-sm font-medium ml-2",
                activeTab === tab.key ? "text-indigo-600" : "text-gray-600"
              )}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-4">
        {activeTab === 'timeline' && (
          <View>
            {Object.keys(entriesByDate).length === 0 ? (
              <View className="items-center justify-center py-16">
                <View className="w-20 h-20 rounded-full bg-indigo-100 items-center justify-center mb-4">
                  <Ionicons name="journal-outline" size={32} color="#4F46E5" />
                </View>
                <Text className="text-lg font-semibold text-gray-900 mb-2">Start Your Journal</Text>
                <Text className="text-gray-600 text-center mb-6">
                  Document your travel memories, photos, and experiences
                </Text>
                <Pressable
                  onPress={handleAddEntry}
                  className="bg-indigo-500 rounded-xl px-6 py-3"
                >
                  <Text className="text-white font-semibold">Add First Memory</Text>
                </Pressable>
              </View>
            ) : (
              Object.entries(entriesByDate).map(([date, entries]) => (
                <View key={date} className="mb-6">
                  <Text className="text-lg font-bold text-gray-900 mb-3">
                    {(() => {
                      try {
                        // Handle both yyyy-MM-dd and ISO string formats
                        const dateObj = date.includes('T') ? parseISO(date) : new Date(date + 'T00:00:00');
                        return format(dateObj, 'EEEE, MMMM d, yyyy');
                      } catch (error) {
                        return date; // Fallback to original date string
                      }
                    })()}
                  </Text>
                  {entries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onPress={() => handleViewEntry(entry)}
                    />
                  ))}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'map' && (
          <TravelMapView tripId={tripId} entries={currentJournal.entries} />
        )}
      </ScrollView>


    </SafeAreaView>
  );
}

// Travel Map Component
interface TravelMapViewProps {
  tripId: string;
  entries: JournalEntry[];
}

function TravelMapView({ tripId, entries }: TravelMapViewProps) {
  const [selectedMemoryType, setSelectedMemoryType] = useState<string>('all');

  // Filter entries by type and those that have locations
  const filteredEntries = useMemo(() => {
    const entriesWithLocations = entries.filter(entry => entry.location?.name);
    
    if (selectedMemoryType === 'all') {
      return entriesWithLocations;
    }
    
    return entriesWithLocations.filter(entry => entry.type === selectedMemoryType);
  }, [entries, selectedMemoryType]);

  // Group entries by location
  const entriesByLocation = useMemo(() => {
    const grouped: Record<string, JournalEntry[]> = {};
    
    filteredEntries.forEach(entry => {
      const locationName = entry.location!.name;
      if (!grouped[locationName]) {
        grouped[locationName] = [];
      }
      grouped[locationName].push(entry);
    });
    
    return grouped;
  }, [filteredEntries]);

  const memoryTypeFilters = [
    { key: 'all', label: 'All', icon: 'apps', color: '#6B7280' },
    { key: 'place', label: 'Places', icon: 'location-outline', color: '#EC4899' },
    { key: 'meal', label: 'Meals', icon: 'restaurant-outline', color: '#F59E0B' },
    { key: 'person', label: 'People', icon: 'person-outline', color: '#F97316' },
    { key: 'reflection', label: 'Reflections', icon: 'book-outline', color: '#8B5CF6' },
    { key: 'discovery', label: 'Discoveries', icon: 'compass-outline', color: '#10B981' },
    { key: 'lesson', label: 'Lessons', icon: 'bulb-outline', color: '#3B82F6' },
    { key: 'highlight', label: 'Highlights', icon: 'star-outline', color: '#EF4444' },
  ];

  return (
    <View className="flex-1">
      {/* Filter Bar */}
      <View className="bg-white border-b border-gray-100 p-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {memoryTypeFilters.map((filter) => (
              <Pressable
                key={filter.key}
                onPress={() => setSelectedMemoryType(filter.key)}
                className={cn(
                  "px-4 py-2 rounded-full flex-row items-center",
                  selectedMemoryType === filter.key ? "bg-indigo-500" : "bg-gray-100"
                )}
              >
                <Ionicons 
                  name={filter.icon as keyof typeof Ionicons.glyphMap} 
                  size={16} 
                  color={selectedMemoryType === filter.key ? "white" : filter.color} 
                  style={{ marginRight: 6 }}
                />
                <Text className={cn(
                  "font-medium",
                  selectedMemoryType === filter.key ? "text-white" : "text-gray-700"
                )}>
                  {filter.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Locations List */}
      <ScrollView className="flex-1 px-4 py-4">
        {Object.keys(entriesByLocation).length === 0 ? (
          <View className="items-center justify-center py-16">
            <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-4">
              <Ionicons name="location-outline" size={32} color="#3B82F6" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">No Locations Yet</Text>
            <Text className="text-gray-600 text-center">
              {selectedMemoryType === 'all' 
                ? "Add locations to your journal entries to see them here"
                : `No ${selectedMemoryType} memories with locations found`
              }
            </Text>
          </View>
        ) : (
          Object.entries(entriesByLocation).map(([locationName, locationEntries]) => (
            <Animated.View 
              key={locationName}
              entering={FadeInDown.duration(400)}
              className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {/* Location Header */}
              <View className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-3">
                    <Ionicons name="location" size={16} color="#4F46E5" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">{locationName}</Text>
                    <Text className="text-sm text-indigo-600">
                      {locationEntries.length} {locationEntries.length === 1 ? 'entry' : 'entries'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Location Entries */}
              <View className="p-4 space-y-3">
                {locationEntries.map((entry, index) => {
                  const iconName = MemoryTypeIcons[entry.type] as keyof typeof Ionicons.glyphMap;
                  const color = MemoryTypeColors[entry.type];
                  
                  return (
                    <View key={entry.id} className="flex-row items-center">
                      <View 
                        className="w-6 h-6 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: color + '20' }}
                      >
                        <Ionicons name={iconName} size={12} color={color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-900">
                          {entry.title || entry.type}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {(() => {
                            try {
                              const dateObj = entry.date.includes('T') ? parseISO(entry.date) : new Date(entry.date + 'T00:00:00');
                              return format(dateObj, 'MMM d, yyyy');
                            } catch (error) {
                              return entry.date;
                            }
                          })()}
                        </Text>
                      </View>
                      {entry.mood && (
                        <Text className="text-lg">{MoodEmojis[entry.mood]}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
