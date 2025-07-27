import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useTripStore } from '../state/tripStore';
import { useJournalStore } from '../state/journalStore';
import { JournalEntry } from '../types';
import { cn } from '../utils/cn';
import mixpanel from '../services/analytics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp_ = RouteProp<RootStackParamList, 'Journal'>;

const MemoryTypeIcons = {
  reflection: 'book-outline',
  expenses: 'card-outline',
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
  expenses: '#22D3EE',
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
  const iconName = MemoryTypeIcons[entry.type] ?? MemoryTypeIcons['general'];
  const color = MemoryTypeColors[entry.type] ?? MemoryTypeColors['general'];

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
                {entry.title ? entry.title : (entry.type ? entry.type : 'Untitled')}
              </Text>
              <Text className="text-xs text-gray-500">
                {(() => {
                  try {
                    // Handle both yyyy-MM-dd and ISO string formats
                    const dateObj = entry.date && entry.date.includes('T') ? parseISO(entry.date) : new Date((entry.date || '') + 'T00:00:00');
                    return entry.date ? format(dateObj, 'MMM d, yyyy') : 'No date';
                  } catch (error) {
                    return entry.date || 'No date';
                  }
                })()}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            {entry.mood && MoodEmojis[entry.mood] && (
              <Text className="mr-2 text-lg">{MoodEmojis[entry.mood]}</Text>
            )}
            {entry.photos?.length > 0 && (
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
            {entry.content ? entry.content : 'No content'}
          </Text>
        </View>

        {/* Photos Preview */}
        {entry.photos?.length > 0 && (
          <View className="px-4 pb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row' }}>
                {entry.photos.slice(0, 3).map((photo, idx, arr) => (
                  <Image
                    key={photo.id ? photo.id : `photo-${idx}`}
                    source={{ uri: photo.uri }}
                    className="w-16 h-16 rounded-lg"
                    style={{ resizeMode: 'cover', marginRight: idx !== arr.length - 1 ? 8 : 0 }}
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
        {entry.tags?.length > 0 && (
          <View className="px-4 pb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {entry.tags.map((tag, index) => (
                  <View key={`${tag}-${index}`} className="bg-indigo-100 px-2 py-1 rounded-full">
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
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const insets = useSafeAreaInsets();

  // Create journal if it doesn't exist
  const currentJournal = journal || createJournal(tripId);
  const stats = getJournalStats(tripId);

  // Group entries by date
  const entriesByDate = useMemo(() => {
    const grouped: Record<string, JournalEntry[]> = {};
    (currentJournal.entries || [])
      .slice()
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .forEach((entry) => {
        const key = entry.date || 'Other Entries';
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(entry);
      });
    return grouped;
  }, [currentJournal.entries]);

  const handleAddEntry = () => {
    navigation.navigate('AddJournalEntry', { tripId });
  };

  const handleViewEntry = (entry: JournalEntry) => {
    navigation.navigate('ViewJournalEntry', { tripId, entryId: entry.id });
  };

  // Add Share button to header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => setShareModalVisible(true)}
          style={{ marginRight: 16 }}
          accessibilityLabel="Share Journal"
        >
          <Ionicons name="share-social-outline" size={24} color="#6366F1" />
        </Pressable>
      ),
    });
  }, [navigation]);

  React.useEffect(() => {
    mixpanel.track('Journal Screen Viewed');
  }, []);

  // Handler for sending invite (API integration to be added)
  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteStatus('sending');
    // TODO: Integrate with backend API
    setTimeout(() => {
      setInviteStatus('sent');
      setInviteEmail('');
      setTimeout(() => setInviteStatus('idle'), 1500);
    }, 1000);
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
      <View className="bg-white border-b border-gray-100 px-6" style={{ paddingTop: insets.top, paddingBottom: 16 }}>
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
          {(currentJournal.entries || []).length > 0 && (
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
            <Text className="text-2xl font-bold text-indigo-600">{(stats.totalEntries || 0)}</Text>
            <Text className="text-xs text-gray-500">Entries</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">{(stats.totalPhotos || 0)}</Text>
            <Text className="text-xs text-gray-500">Photos</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-purple-600">{(stats.daysDocumented || 0)}</Text>
            <Text className="text-xs text-gray-500">Days</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-600">{(stats.visitedLocations || 0)}</Text>
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
      {activeTab === 'timeline' && (
        <ScrollView className="flex-1 px-6 py-4">
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
                        if (date === 'Other Entries') return date;
                        try {
                          // Handle both yyyy-MM-dd and ISO string formats
                          const dateObj = date.includes('T') ? parseISO(date) : new Date(date + 'T00:00:00');
                          return format(dateObj, 'EEEE, MMMM d, yyyy');
                        } catch (error) {
                          return date; // Fallback to original date string
                        }
                      })()}
                    </Text>
                    {(entries || []).map((entry, entryIdx) => (
                      <EntryCard
                        key={entry.id ? entry.id : `entry-${entryIdx}`}
                        entry={entry}
                        onPress={() => handleViewEntry(entry)}
                      />
                    ))}
                  </View>
                ))
              )}
            </View>
        </ScrollView>
      )}

      {activeTab === 'map' && (
        <TravelMapView tripId={tripId} entries={currentJournal.entries || []} />
      )}

      {/* Share Modal */}
      <Modal
        visible={shareModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md shadow-lg">
            <Text className="text-lg font-semibold mb-2">Share Journal</Text>
            <Text className="text-sm text-gray-500 mb-4">Invite a collaborator by email:</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
              placeholder="Enter email address"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={inviteStatus !== 'sending'}
            />
            <TouchableOpacity
              className={cn(
                'bg-indigo-500 rounded-lg py-2 items-center',
                inviteStatus === 'sending' && 'opacity-60'
              )}
              onPress={handleSendInvite}
              disabled={inviteStatus === 'sending' || !inviteEmail.trim()}
            >
              <Text className="text-white font-medium">
                {inviteStatus === 'sending' ? 'Sending...' : inviteStatus === 'sent' ? 'Invite Sent!' : 'Send Invite'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="mt-4 items-center"
              onPress={() => setShareModalVisible(false)}
            >
              <Text className="text-indigo-500 font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


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
  const [selectedMarker, setSelectedMarker] = useState<JournalEntry | null>(null);

  const entriesWithLocations = useMemo(() => {
    return (entries || []).filter(entry => entry.location?.name && entry.location?.latitude && entry.location?.longitude);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (selectedMemoryType === 'all') {
      return entriesWithLocations;
    }
    return entriesWithLocations.filter(entry => entry.type === selectedMemoryType);
  }, [entriesWithLocations, selectedMemoryType]);

  const mapCenter = useMemo(() => {
    if (filteredEntries.length > 0) {
      const latitudes = filteredEntries.map(e => e.location!.latitude);
      const longitudes = filteredEntries.map(e => e.location!.longitude);
      return [
        (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
        (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
      ];
    }
    return [20, 0]; // Default center
  }, [filteredEntries]);

  const mapZoom = useMemo(() => {
    return filteredEntries.length > 0 ? 6 : 2;
  }, [filteredEntries]);

  const getMarkerColor = (type: string) => MemoryTypeColors[type as keyof typeof MemoryTypeColors] || MemoryTypeColors.general;
  const getMarkerIcon = (type: string) => MemoryTypeIcons[type as keyof typeof MemoryTypeIcons] || MemoryTypeIcons.general;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Trip Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
            body { margin: 0; padding: 0; }
            #map { position: absolute; top: 0; bottom: 0; width: 100%; }
            .leaflet-popup-content-wrapper { border-radius: 12px; }
            .popup-content { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
            .popup-title { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
            .popup-location { font-size: 12px; color: #555; }
            .custom-div-icon {
                background: none;
                border: none;
            }
            .custom-div-icon svg {
                filter: drop-shadow(0 1px 3px rgba(0,0,0,0.4));
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map');

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            var markers = ${JSON.stringify(filteredEntries.map(e => ({
              lat: e.location!.latitude,
              lng: e.location!.longitude,
              title: e.title || e.type,
              locationName: e.location!.name,
              color: getMarkerColor(e.type),
            })))};

            var markerLayers = [];

            markers.forEach(function(marker) {
                var iconSvg = '<svg viewBox="0 0 24 24" width="32" height="32" fill="' + marker.color + '"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';

                var customIcon = L.divIcon({
                    html: iconSvg,
                    className: 'custom-div-icon',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });

                var popupContent = '<div class="popup-content"><div class="popup-title">' + marker.title + '</div><div class="popup-location">' + marker.locationName + '</div></div>';

                var leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon })
                    .bindPopup(popupContent);
                
                markerLayers.push(leafletMarker);
            });

            if (markerLayers.length > 0) {
                var featureGroup = L.featureGroup(markerLayers).addTo(map);
                map.fitBounds(featureGroup.getBounds().pad(0.1));
            } else {
                map.setView([20, 0], 2);
            }
        </script>
    </body>
    </html>
  `;
  
  const memoryTypeFilters = [
    { key: 'all', label: 'All', icon: 'apps', color: '#6B7280' },
    { key: 'place', label: 'Places', icon: 'location-outline', color: '#EC4899' },
    { key: 'meal', label: 'Meals', icon: 'restaurant-outline', color: '#F59E0B' },
    { key: 'person', label: 'People', icon: 'person-outline', color: '#F97316' },
    { key: 'reflection', label: 'Reflections', icon: 'book-outline', color: '#8B5CF6' },
    { key: 'expenses', label: 'Expenses', icon: 'card-outline', color: '#22D3EE' },
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
        {entriesWithLocations.length === 0 ? (
          <View className="flex-1 items-center justify-center bg-gray-50">
            <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-4">
              <Ionicons name="location-outline" size={32} color="#3B82F6" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">No Locations Yet</Text>
            <Text className="text-gray-600 text-center px-8 mb-4">
              Add locations to your journal entries to see them on the map.
            </Text>
          </View>
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </View>
  );
}