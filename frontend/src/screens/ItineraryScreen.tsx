
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler, withSpring, runOnJS } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_PLACES_API_KEY } from '@env';
// @ts-ignore
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Dimensions, Linking, Platform } from 'react-native';

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, TextInput, ScrollView, StyleSheet, Image, Pressable, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeContext';
import { scheduleItineraryActivityReminder } from '../services/notificationService';
import mixpanel from '../services/analytics';

const { width } = Dimensions.get('window');

// Remove mockItinerary and all references to it

const INTEREST_TYPE_ICONS = {
  landmark: 'location',
  park: 'leaf',
  restaurant: 'restaurant',
  museum: 'business',
  'art gallery': 'color-palette',
  'tourist attraction': 'camera',
  amusement: 'game-controller',
  aquarium: 'fish',
  zoo: 'paw',
  stadium: 'football',
  cafe: 'cafe',
};

// TypeScript interfaces for props
interface ItineraryCardProps {
  item: any;
  onInfo: () => void;
  onNavigate: () => void;
  typeColor?: string;
}
const openInMaps = (lat, lon, label) => {
  if (!lat || !lon) {
    Alert.alert('No location', 'No coordinates available for this activity.');
    return;
  }
  const scheme = Platform.OS === 'ios'
    ? `http://maps.apple.com/?ll=${lat},${lon}&q=${encodeURIComponent(label)}`
    : `geo:${lat},${lon}?q=${encodeURIComponent(label)}`;
  Linking.openURL(scheme);
};
const ItineraryCard: React.FC<ItineraryCardProps> = ({ item, onInfo, onNavigate, typeColor = '#6366F1' }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onInfo}
      style={{
        backgroundColor: '#fff',
        borderRadius: 18,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        overflow: 'hidden',
        padding: 18,
      }}
    >
      {/* Title Row with Dot */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: typeColor, marginRight: 10 }} />
        <Text style={{ fontWeight: 'bold', fontSize: 18, flex: 1 }}>{item.title}</Text>
      </View>
      {/* Subtitle */}
      {item.location ? <Text style={{ color: '#888', fontSize: 15, marginBottom: 6 }}>{item.location}</Text> : null}
      {/* Note/Tip */}
      {item.notes ? (
        <View style={{ backgroundColor: '#F1F5F9', borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <Text style={{ color: '#444', fontSize: 15 }}>{item.notes}</Text>
        </View>
      ) : null}
      {/* Tags and Icons Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{ backgroundColor: '#E0E7FF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8 }}>
            <Text style={{ color: '#6366F1', fontSize: 14, fontWeight: 'bold' }}>{item.type || 'activity'}</Text>
          </View>
          <View style={{ backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 }}>
            <Text style={{ color: '#888', fontSize: 14 }}>{item.time}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onInfo} style={{ marginLeft: 8 }}>
          <Ionicons name="information-circle-outline" size={22} color="#888" />
        </TouchableOpacity>
        {item.lat && item.lon ? (
          <TouchableOpacity onPress={() => openInMaps(item.lat, item.lon, item.title)} style={{ marginLeft: 8 }}>
            <Ionicons name="navigate" size={22} color="#6366F1" />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

interface SwipeableCardProps {
  item: any;
  day: any;
  itemIndex: number;
  handleEditItem: (day: any, item: any, itemIndex: number) => void;
  completed: boolean;
  toggleCompleted: (day: any, itemIndex: number) => void;
}
const SwipeableCard: React.FC<SwipeableCardProps> = ({ item, day, itemIndex, handleEditItem, completed, toggleCompleted }) => {
  const translateX = useSharedValue(0);
  const [showActions, setShowActions] = useState(false);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_: any, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event: any, context: any) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event: any) => {
      if (event.translationX < -80) {
        translateX.value = withSpring(-100);
        runOnJS(setShowActions)(true);
      } else {
        translateX.value = withSpring(0);
        runOnJS(setShowActions)(false);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.cardWrapper}>
      {/* Progress Dot */}
      <TouchableOpacity
        style={[styles.progressDot, completed ? styles.progressDotCompleted : null]}
        onPress={() => toggleCompleted(day, itemIndex)}
        activeOpacity={0.7}
      >
        {completed && <Ionicons name="checkmark" size={14} color="#fff" />}
      </TouchableOpacity>
      {/* Swipeable Card */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.card, animatedStyle, completed && styles.cardCompleted]}>
          <View style={styles.cardContent}>
            <Text style={[styles.timelineTime, completed && styles.completedText]}>{item.time}</Text>
            <Text style={[styles.timelineTitle, completed && styles.completedText]}>{item.title}</Text>
            {item.location ? (
              <Text style={[styles.timelineLocation, completed && styles.completedText]}>{item.location}</Text>
            ) : null}
            {item.notes ? (
              <Text style={[styles.timelineNotes, completed && styles.completedText]}>{item.notes}</Text>
            ) : null}
          </View>
          {/* Edit/Delete actions, only visible on swipe */}
          {showActions && (
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditItem(day, item, itemIndex)}
              >
                <Ionicons name="create-outline" size={20} color="#4F46E5" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteAction]}
                onPress={() => {
                  // You may want to handle delete here
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const ItineraryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  // Get trip info from route params
  const { tripId, tripName, destination, startDate, endDate } = route.params;

  const [loading, setLoading] = useState(true);
  const [itinerary, setItinerary] = useState<any>(null);
  const [existingItinerary, setExistingItinerary] = useState<any>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editForm, setEditForm] = useState({
    time: '',
    title: '',
    location: '',
    notes: ''
  });
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Add completed state for each item
  const [completedMap, setCompletedMap] = useState<{ [key: string]: boolean }>({});
  const [place, setPlace] = useState({ name: '', address: '', type: '', lat: 0, lon: 0 });
  const [interestType, setInterestType] = useState('landmark');
  const INTEREST_TYPES = [
    { key: 'landmark', label: 'Landmark', icon: 'location' },
    { key: 'tourist', label: 'Tourist Attraction', icon: 'camera' },
    { key: 'museum', label: 'Museum', icon: 'business' },
    { key: 'art', label: 'Art Gallery', icon: 'color-palette' },
    { key: 'park', label: 'Park', icon: 'leaf' },
    { key: 'amusement', label: 'Amusement Park', icon: 'game-controller' },
    { key: 'aquarium', label: 'Aquarium', icon: 'fish' },
    { key: 'zoo', label: 'Zoo', icon: 'paw' },
    { key: 'stadium', label: 'Stadium', icon: 'football' },
    { key: 'restaurant', label: 'Restaurant', icon: 'restaurant' },
    { key: 'cafe', label: 'Cafe', icon: 'cafe' },
  ];

  // Helper to get unique key for each item
  const getItemKey = (day: any, itemIndex: number) => `${day.date}_${itemIndex}`;

  const toggleCompleted = (day: any, itemIndex: number) => {
    const key = getItemKey(day, itemIndex);
    setCompletedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    mixpanel.track('Itinerary Screen Viewed');
  }, []);

  useEffect(() => {
    // First check if itinerary already exists
    checkExistingItinerary();
  }, [tripId, tripName, destination, startDate, endDate]);

  const checkExistingItinerary = async () => {
    setLoading(true);
    try {
      // Check if we have a stored itinerary for this trip
      const storedItinerary = await getStoredItinerary(tripId);
      
      if (storedItinerary) {
        setExistingItinerary(storedItinerary);
        setShowOptions(true);
        setLoading(false);
      } else {
        // No existing itinerary, generate new one
        generateNewItinerary();
      }
    } catch (error) {
      console.error('Error checking existing itinerary:', error);
      generateNewItinerary();
    }
  };

  const getStoredItinerary = async (tripId: string) => {
    try {
      const stored = await AsyncStorage.getItem(`itinerary_${tripId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  };

  const generateNewItinerary = async () => {
    setLoading(true);
    try {
      // Production backend URL
      const backendUrl = 'http://10.13.185.144:5000/api/ai/itinerary';
      
      console.log('Calling itinerary API with:', { tripName, destination, startDate, endDate });
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripName, destination, startDate, endDate }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Itinerary API response:', data);
      
      if (data.success && data.itinerary) {
        const newItinerary = {
          tripName,
          tripSubtitle: destination,
          imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', // Placeholder
          startDate,
          endDate,
          days: data.itinerary.days,
        };
        setItinerary(newItinerary);
        // Store the new itinerary
        await storeItinerary(tripId, newItinerary);
      } else {
        throw new Error(data.error || 'Failed to generate itinerary');
      }
    } catch (error: any) {
      console.error('Itinerary generation error:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to generate itinerary. Please check your backend connection.',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const storeItinerary = async (tripId: string, itineraryData: any) => {
    try {
      await AsyncStorage.setItem(`itinerary_${tripId}`, JSON.stringify(itineraryData));
    } catch (e) {
      // handle error if needed
    }
  };

  const handleViewExisting = () => {
    setItinerary(existingItinerary);
    setShowOptions(false);
  };

  const handleRegenerate = () => {
    setShowOptions(false);
    generateNewItinerary();
  };

  const handleEditItem = (day: any, item: any, itemIndex: number) => {
    setSelectedDay(day);
    setSelectedItem({ ...item, index: itemIndex });
    setIsAddingNew(false);
    setEditForm({
      time: item.time || '',
      title: item.title || '',
      location: item.location || '',
      notes: item.notes || ''
    });
    setPlace({
      name: item.placeName || '',
      address: item.placeAddress || '',
      type: item.placeType || '',
      lat: item.lat || 0,
      lon: item.lon || 0,
    });
    setInterestType(item.type || 'landmark');
    setEditModalVisible(true);
  };

  const handleAddItem = (day: any) => {
    setSelectedDay(day);
    setSelectedItem(null);
    setIsAddingNew(true);
    setEditForm({
      time: '',
      title: '',
      location: '',
      notes: ''
    });
    setPlace({ name: '', address: '', type: '', lat: 0, lon: 0 });
    setInterestType('landmark');
    setEditModalVisible(true);
  };

  const handleSaveItem = () => {
    if (!editForm.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    const updatedItinerary = { ...itinerary };
    const dayIndex = updatedItinerary.days.findIndex((d: any) => d.date === selectedDay.date);
    const newItem = {
      time: editForm.time,
      title: editForm.title,
      location: editForm.location,
      notes: editForm.notes,
      placeName: place.name,
      placeAddress: place.address,
      placeType: place.type,
      type: interestType,
      lat: place.lat,
      lon: place.lon,
    };
    if (isAddingNew) {
      updatedItinerary.days[dayIndex].items.push(newItem);
    } else {
      updatedItinerary.days[dayIndex].items[selectedItem.index] = newItem;
    }
    setItinerary(updatedItinerary);
    storeItinerary(tripId, updatedItinerary);
    setEditModalVisible(false);
  };

  const handleDeleteItem = () => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedItinerary = { ...itinerary };
            const dayIndex = updatedItinerary.days.findIndex((d: any) => d.date === selectedDay.date);
            updatedItinerary.days[dayIndex].items.splice(selectedItem.index, 1);
            setItinerary(updatedItinerary);
            // Update stored itinerary
            storeItinerary(tripId, updatedItinerary);
            setEditModalVisible(false);
          }
        }
      ]
    );
  };

  // After itinerary is set/updated, schedule reminders for each activity
  React.useEffect(() => {
    if (itinerary && itinerary.days) {
      itinerary.days.forEach(day => {
        if (day.items && Array.isArray(day.items)) {
          day.items.forEach(activity => {
            if (activity.title && activity.time) {
              scheduleItineraryActivityReminder(activity.title, activity.time, itinerary.tripName || 'Your Trip');
            }
          });
        }
      });
    }
  }, [itinerary]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 18, fontSize: 18, color: '#4F46E5', fontWeight: '600' }}>
          {showOptions ? 'Loading...' : 'Generating your itinerary...'}
        </Text>
      </SafeAreaView>
    );
  }

  // Show options if existing itinerary is found
  if (showOptions && existingItinerary) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#E0E7FF' }}>
        <LinearGradient
          colors={['#E0E7FF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.optionsContainer}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#222" />
            </Pressable>
            <Text style={styles.headerTitle}>Itinerary</Text>
          </View>

          {/* Trip Info */}
          <View style={styles.tripInfoCard}>
            <View style={{ borderRadius: 14, overflow: 'hidden' }}>
              <Image source={{ uri: existingItinerary.imageUrl }} style={styles.tripImage} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.tripName}>{existingItinerary.tripName}</Text>
              <Text style={styles.tripSubtitle}>{existingItinerary.tripSubtitle}</Text>
              <Text style={styles.tripDates}>{formatDate(existingItinerary.startDate)} - {formatDate(existingItinerary.endDate)}</Text>
            </View>
          </View>

          {/* Options */}
          <View style={styles.optionsContent}>
            <View style={styles.optionsCard}>
              <Ionicons name="document-text-outline" size={48} color="#4F46E5" />
              <Text style={styles.optionsTitle}>Itinerary Already Exists!</Text>
              <Text style={styles.optionsSubtitle}>
                We found an existing itinerary for your trip to {destination}. What would you like to do?
              </Text>
              
              <View style={styles.optionsButtons}>
                <TouchableOpacity 
                  style={[styles.optionButton, styles.primaryButton]}
                  onPress={handleViewExisting}
                >
                  <Ionicons name="eye-outline" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>View Your Itinerary</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.optionButton, styles.secondaryButton]}
                  onPress={handleRegenerate}
                >
                  <Ionicons name="refresh-outline" size={20} color="#4F46E5" />
                  <Text style={styles.secondaryButtonText}>Generate New Itinerary</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!itinerary) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={{ marginTop: 18, fontSize: 18, color: '#EF4444', fontWeight: '600', textAlign: 'center' }}>
          Failed to load itinerary
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={generateNewItinerary}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FB' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', elevation: 2 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>{itinerary.tripName}</Text>
          <Text style={{ fontSize: 14, color: '#888', textAlign: 'center', marginTop: 2 }}>{itinerary.tripSubtitle}</Text>
          <Text style={{ fontSize: 13, color: '#4F8EF7', textAlign: 'center', marginTop: 2 }}>{formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Timeline */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {itinerary.days.map((day: any, idx: number) => (
          <View key={day.date} style={{ marginBottom: 32 }}>
            {/* Day Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4F8EF7', marginRight: 10 }}>{day.label}</Text>
              <Text style={{ fontSize: 15, color: '#222', fontWeight: '600', flex: 1 }}>{formatDate(day.date)}</Text>
              <TouchableOpacity onPress={() => handleAddItem(day)}>
                <Ionicons name="add-circle" size={24} color="#4F8EF7" />
              </TouchableOpacity>
            </View>
            {/* Timeline Items */}
            {day.items.map((item: any, i: number) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 }}>
                {/* Timeline: Time, Dot, Line */}
                <View style={{ width: 60, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: '#4F8EF7', fontWeight: 'bold', marginBottom: 2 }}>{item.time}</Text>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4F8EF7', marginBottom: 2 }} />
                  {i < day.items.length - 1 && (
                    <View style={{ width: 2, height: 90, backgroundColor: '#E0E0E0', marginTop: -2 }} />
                  )}
                </View>
                {/* Card */}
                <View style={{ flex: 1 }}>
                  <ItineraryCard
                    item={item}
                    onInfo={() => handleEditItem(day, item, i)}
                    onNavigate={() => {/* navigation logic */}}
                    typeColor="#6366F1"
                  />
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      {/* Floating Action Button */}
      <TouchableOpacity style={{ position: 'absolute', right: 24, bottom: 40, backgroundColor: '#4F8EF7', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 }} onPress={() => handleAddItem(itinerary.days[0])}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Edit/Add Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={80}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          {/* Overlay */}
          <View
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1,
            }}
          />
          {/* Modal Card */}
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            width: '92%',
            maxWidth: 350,
            maxHeight: '80%',
            alignSelf: 'center',
            marginVertical: 24,
            borderWidth: 1,
            borderColor: '#F1F1F1',
            overflow: 'hidden',
            zIndex: 2,
          }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', flex: 1 }}>Edit Activity</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#888" />
                </TouchableOpacity>
              </View>
              {/* Divider */}
              <View style={{ height: 1, backgroundColor: '#F1F1F1', marginHorizontal: 20, marginBottom: 10 }} />
              {/* Search Bar */}
              <View style={{ marginHorizontal: 20, marginBottom: 14 }}>
                <OSMSearchBar
                  onSelect={(place) => {
                    setPlace({
                      name: place.name,
                      address: place.address,
                      type: place.type,
                      lat: parseFloat(place.lat),
                      lon: parseFloat(place.lon),
                    });
                    setEditForm({ ...editForm, location: place.address });
                  }}
                />
              </View>
              {/* Selected Place Card */}
              {place.name ? (
                <View style={{ backgroundColor: '#F6F7F9', borderRadius: 12, padding: 12, marginHorizontal: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Ionicons name={INTEREST_TYPE_ICONS[interestType as keyof typeof INTEREST_TYPE_ICONS] as any || 'ellipse'} size={18} color="#fff" />
                  </View>
                  <View style={{ flex: 1, flexShrink: 1 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 1 }} numberOfLines={1} ellipsizeMode="tail">{place.name}</Text>
                    <Text style={{ color: '#888', fontSize: 13, marginBottom: 1 }} numberOfLines={1} ellipsizeMode="tail">{place.address}</Text>
                    <Text style={{ color: '#4F46E5', fontSize: 12 }} numberOfLines={1} ellipsizeMode="tail">{place.type || interestType}</Text>
                  </View>
                </View>
              ) : null}
              {/* Interest Type */}
              <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 8, marginHorizontal: 20 }}>Interest Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14, justifyContent: 'space-between', marginHorizontal: 20, gap: 8 }}>
                {INTEREST_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: interestType === type.key ? '#4F46E5' : '#F6F7F9',
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: interestType === type.key ? '#4F46E5' : '#E5E7EB',
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      marginBottom: 8,
                      width: '47%',
                      gap: 8,
                    }}
                    onPress={() => setInterestType(type.key)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={18}
                      color={interestType === type.key ? '#fff' : '#222'}
                    />
                    <Text style={{ color: interestType === type.key ? '#fff' : '#222', fontWeight: '600', fontSize: 14 }}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Divider */}
              <View style={{ height: 1, backgroundColor: '#F1F1F1', marginHorizontal: 20, marginBottom: 10 }} />
              {/* Time Input */}
              <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4, marginHorizontal: 20 }}>Time</Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F6F7F9',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginBottom: 10,
                  marginHorizontal: 20,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                }}
              >
                <Ionicons name="calendar-outline" size={16} color="#888" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, color: '#222' }}>
                  {editForm.time || 'Select time'}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={editForm.time ? new Date(`1970-01-01T${editForm.time}`) : new Date()}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowTimePicker(false);
                    if (selectedDate) {
                      const hours = selectedDate.getHours();
                      const minutes = selectedDate.getMinutes();
                      const ampm = hours >= 12 ? 'PM' : 'AM';
                      const formatted = `${((hours + 11) % 12 + 1)}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                      setEditForm({ ...editForm, time: formatted });
                    }
                  }}
                />
              )}
              {/* Title Input */}
              <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4, marginHorizontal: 20 }}>Title *</Text>
              <TextInput
                style={{ backgroundColor: '#F6F7F9', borderRadius: 12, padding: 12, fontSize: 14, color: '#222', marginBottom: 10, marginHorizontal: 20, borderWidth: 1, borderColor: '#E5E7EB' }}
                value={editForm.title}
                onChangeText={(text) => setEditForm({ ...editForm, title: text })}
                placeholder="Activity title"
                placeholderTextColor="#999"
              />
              {/* Location Input */}
              <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4, marginHorizontal: 20 }}>Location</Text>
              <TextInput
                style={{ backgroundColor: '#F6F7F9', borderRadius: 12, padding: 12, fontSize: 14, color: '#222', marginBottom: 10, marginHorizontal: 20, borderWidth: 1, borderColor: '#E5E7EB' }}
                value={editForm.location}
                onChangeText={(text) => setEditForm({ ...editForm, location: text })}
                placeholder="Location"
                placeholderTextColor="#999"
              />
              {/* Notes Input */}
              <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4, marginHorizontal: 20 }}>Notes</Text>
              <TextInput
                style={{ backgroundColor: '#F6F7F9', borderRadius: 12, padding: 12, fontSize: 14, color: '#222', marginBottom: 16, marginHorizontal: 20, borderWidth: 1, borderColor: '#E5E7EB', height: 60, textAlignVertical: 'top' }}
                value={editForm.notes}
                onChangeText={(text) => setEditForm({ ...editForm, notes: text })}
                placeholder="Additional notes"
                placeholderTextColor="#999"
                multiline
                numberOfLines={2}
              />
              {/* Actions */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginHorizontal: 20, marginBottom: 18 }}>
                {!isAddingNew && (
                  <TouchableOpacity 
                    style={{ backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', marginRight: 8 }}
                    onPress={handleDeleteItem}
                  >
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 6 }}>Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={{ backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center' }}
                  onPress={handleSaveItem}
                >
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Add OSMSearchBar component above ItineraryScreen


const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

function OSMSearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (text) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const url = `${NOMINATIM_URL}?q=${encodeURIComponent(text)}&format=json&addressdetails=1&limit=5`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'TripWiserApp/1.0 (your@email.com)'
        }
      });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      setResults([]);
      console.error('Nominatim search error:', e);
    }
    setLoading(false);
  };

  return (
    <View style={{ position: 'relative' }}>
      <TextInput
        placeholder="Search for a place"
        value={query}
        onChangeText={search}
        style={styles.osmInput}
      />
      {loading && <ActivityIndicator size="small" style={{ position: 'absolute', right: 16, top: 16 }} />}
      {results.length > 0 && (
        <View style={styles.osmDropdown}>
          {results.map((item) => (
            <TouchableOpacity
              key={item.place_id}
              onPress={() => {
                setQuery(item.display_name);
                setResults([]);
                onSelect({
                  name: item.display_name,
                  address: item.display_name,
                  lat: item.lat,
                  lon: item.lon,
                  type: item.type,
                });
              }}
              style={styles.osmDropdownItem}
            >
              <Text style={{ fontSize: 15 }}>{item.display_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  osmInput: {
    backgroundColor: '#F6F7F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 15,
  },
  osmDropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  osmDropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F1F1',
  },
  // Added styles for options section and related UI
  optionsContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  optionsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 24,
    width: 320,
    maxWidth: '100%',
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  optionsSubtitle: {
    fontSize: 15,
    color: '#444',
    marginBottom: 18,
    textAlign: 'center',
  },
  optionsButtons: {
    width: '100%',
    marginTop: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 10,
    width: '100%',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#E0E7FF',
  },
  secondaryButtonText: {
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 18,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tripInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    width: 320,
    maxWidth: '100%',
  },
  tripImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },
  tripName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  tripSubtitle: {
    fontSize: 15,
    color: '#4F46E5',
    marginBottom: 2,
  },
  tripDates: {
    fontSize: 13,
    color: '#888',
  },
  // Card and timeline styles
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  progressDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  progressDotCompleted: {
    backgroundColor: '#4F46E5',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 4,
  },
  cardCompleted: {
    opacity: 0.5,
  },
  cardContent: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 13,
    color: '#4F8EF7',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  timelineLocation: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  timelineNotes: {
    fontSize: 13,
    color: '#444',
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  deleteAction: {
    backgroundColor: '#FEE2E2',
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginLeft: 4,
  },
});

export default ItineraryScreen; 