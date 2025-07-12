import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Dimensions,
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
import MapView, { Marker, Callout } from 'react-native-maps';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useTripStore } from '../state/tripStore';
import { useJournalStore } from '../state/journalStore';
import { JournalEntry } from '../types';
import { cn } from '../utils/cn';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp_ = RouteProp<RootStackParamList, 'Journal'>;

const { width } = Dimensions.get('window');

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
    <Animated.View
      entering={FadeInRight.duration(400)}
      className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Pressable onPress={onPress} className="p-4">
        <View className="flex-row items-start">
          <View 
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: color + '20' }}
          >
            <Ionicons name={iconName} size={24} color={color} />
          </View>
          
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {entry.title}
            </Text>
            
            {entry.content && (
              <Text className="text-gray-600 mb-2" numberOfLines={2}>
                {entry.content}
              </Text>
            )}
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-500">
                  {(() => {
                    try {
                      const dateObj = entry.date.includes('T') ? parseISO(entry.date) : new Date(entry.date + 'T00:00:00');
                      return format(dateObj, 'MMM d, yyyy');
                    } catch (error) {
                      return entry.date;
                    }
                  })()}
                </Text>
                
                {entry.location?.name && (
                  <View className="flex-row items-center ml-3">
                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-500 ml-1">
                      {entry.location.name}
                    </Text>
                  </View>
                )}
              </View>
              
              {entry.mood && (
                <Text className="text-xl">{MoodEmojis[entry.mood]}</Text>
              )}
            </View>
          </View>
        </View>
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
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">{trip.name}</Text>
            <Text className="text-gray-600">Journal & Memories</Text>
          </View>
          
          <Pressable
            onPress={handleAddEntry}
            className="bg-indigo-500 rounded-full w-12 h-12 items-center justify-center"
          >
            <Ionicons name="add" size={24} color="white" />
          </Pressable>
        </View>
        
        {/* Stats */}
        <View className="flex-row mt-4 space-x-4">
          <View className="flex-1 bg-indigo-50 rounded-xl p-3">
            <Text className="text-2xl font-bold text-indigo-600">{stats.totalEntries}</Text>
            <Text className="text-sm text-indigo-700">Memories</Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-xl p-3">
            <Text className="text-2xl font-bold text-green-600">{stats.visitedLocations}</Text>
            <Text className="text-sm text-green-700">Places</Text>
          </View>
          <View className="flex-1 bg-purple-50 rounded-xl p-3">
            <Text className="text-2xl font-bold text-purple-600">{stats.daysDocumented}</Text>
            <Text className="text-sm text-purple-700">Days</Text>
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
      {activeTab === 'timeline' && (
        <ScrollView className="flex-1 px-6 py-4">
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
        </ScrollView>
      )}

      {activeTab === 'map' && (
        <TravelMapView tripId={tripId} entries={currentJournal.entries} onEntryPress={handleViewEntry} />
      )}
    </SafeAreaView>
  );
}

// Travel Map Component with Native Maps
interface TravelMapViewProps {
  tripId: string;
  entries: JournalEntry[];
  onEntryPress: (entry: JournalEntry) => void;
}

function TravelMapView({ tripId, entries, onEntryPress }: TravelMapViewProps) {
  const [selectedMemoryType, setSelectedMemoryType] = useState<string>('all');

  // Filter entries by type and those that have coordinates
  const filteredEntries = useMemo(() => {
    const entriesWithCoordinates = entries.filter(entry => 
      entry.location?.latitude && entry.location?.longitude
    );
    
    if (selectedMemoryType === 'all') {
      return entriesWithCoordinates;
    }
    
    return entriesWithCoordinates.filter(entry => entry.type === selectedMemoryType);
  }, [entries, selectedMemoryType]);

  // Calculate map region based on entries
  const mapRegion = useMemo(() => {
    if (filteredEntries.length === 0) {
      // Default region (can be set to trip destination)
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const latitudes = filteredEntries.map(entry => entry.location!.latitude);
    const longitudes = filteredEntries.map(entry => entry.location!.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = (maxLat - minLat) * 1.5; // Add some padding
    const lngDelta = (maxLng - minLng) * 1.5;
    
    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.01), // Minimum zoom
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
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

      {/* Map View */}
      <View className="flex-1">
        {filteredEntries.length === 0 ? (
          <View className="flex-1 items-center justify-center bg-gray-50">
            <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-4">
              <Ionicons name="location-outline" size={32} color="#3B82F6" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">No Locations Yet</Text>
            <Text className="text-gray-600 text-center px-8">
              {selectedMemoryType === 'all' 
                ? "Add locations with coordinates to your journal entries to see them on the map"
                : `No ${selectedMemoryType} memories with locations found`
              }
            </Text>
          </View>
        ) : (
          <MapView
            style={{ flex: 1 }}
            initialRegion={mapRegion}
            region={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            showsScale={true}
          >
            {filteredEntries.map((entry) => {
              const iconName = MemoryTypeIcons[entry.type] as keyof typeof Ionicons.glyphMap;
              const color = MemoryTypeColors[entry.type];
              
              return (
                <Marker
                  key={entry.id}
                  coordinate={{
                    latitude: entry.location!.latitude,
                    longitude: entry.location!.longitude,
                  }}
                  pinColor={color}
                  onPress={() => onEntryPress(entry)}
                >
                  <Callout>
                    <View className="p-2 min-w-[200]">
                      <View className="flex-row items-center mb-2">
                        <Ionicons name={iconName} size={16} color={color} />
                        <Text className="font-semibold text-gray-900 ml-2">
                          {entry.title}
                        </Text>
                      </View>
                      {entry.content && (
                        <Text className="text-gray-600 text-sm mb-1" numberOfLines={2}>
                          {entry.content}
                        </Text>
                      )}
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
                      {entry.mood && (
                        <Text className="text-lg mt-1">{MoodEmojis[entry.mood]}</Text>
                      )}
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>
        )}
      </View>
    </View>
  );
}
