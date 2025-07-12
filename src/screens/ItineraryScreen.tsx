import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ScrollView, ActivityIndicator, Pressable, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler, withSpring, runOnJS } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Remove mockItinerary and all references to it

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

  // Add completed state for each item
  const [completedMap, setCompletedMap] = useState<{ [key: string]: boolean }>({});

  // Helper to get unique key for each item
  const getItemKey = (day: any, itemIndex: number) => `${day.date}_${itemIndex}`;

  const toggleCompleted = (day: any, itemIndex: number) => {
    const key = getItemKey(day, itemIndex);
    setCompletedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    // First check if itinerary already exists
    checkExistingItinerary();
  }, [tripId, tripName, destination, startDate, endDate]);

  const checkExistingItinerary = async () => {
    setLoading(true);
    try {
      // Check if we have a stored itinerary for this trip
      // For now, we'll use a simple check - you can enhance this with actual storage
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
    // This is a placeholder - you can implement actual storage logic
    // For now, we'll return null to always generate new itineraries
    // You can integrate with AsyncStorage, your backend, or any storage solution
    return null;
  };

  const generateNewItinerary = async () => {
    setLoading(true);
    try {
      // Production backend URL
      const backendUrl = 'https://tripwiser.onrender.com/api/ai/itinerary';
      
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
    // Placeholder for storing itinerary
    // You can implement this with AsyncStorage, your backend, or any storage solution
    console.log('Storing itinerary for trip:', tripId);
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
    setEditModalVisible(true);
  };

  const handleSaveItem = () => {
    if (!editForm.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    const updatedItinerary = { ...itinerary };
    const dayIndex = updatedItinerary.days.findIndex((d: any) => d.date === selectedDay.date);
    
    if (isAddingNew) {
      // Add new item
      updatedItinerary.days[dayIndex].items.push({
        time: editForm.time,
        title: editForm.title,
        location: editForm.location,
        notes: editForm.notes
      });
    } else {
      // Edit existing item
      updatedItinerary.days[dayIndex].items[selectedItem.index] = {
        time: editForm.time,
        title: editForm.title,
        location: editForm.location,
        notes: editForm.notes
      };
    }

    setItinerary(updatedItinerary);
    // Update stored itinerary
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

  const SwipeableCard = ({ item, day, itemIndex }: { item: any; day: any; itemIndex: number }) => {
    const translateX = useSharedValue(0);
    const [showActions, setShowActions] = useState(false);
    const key = getItemKey(day, itemIndex);
    const completed = completedMap[key];

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, context: any) => {
        context.startX = translateX.value;
      },
      onActive: (event, context) => {
        translateX.value = context.startX + event.translationX;
      },
      onEnd: (event) => {
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
                    setSelectedDay(day);
                    setSelectedItem({ ...item, index: itemIndex });
                    handleDeleteItem();
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
            <Image source={{ uri: existingItinerary.imageUrl }} style={styles.tripImage} />
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E0E7FF' }}>
      <LinearGradient
        colors={['#E0E7FF', '#F8FAFC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </Pressable>
          <Text style={styles.headerTitle}>Your Itinerary</Text>
        </View>
        {/* Trip Info */}
        <View style={styles.tripInfoCard}>
          <Image source={{ uri: itinerary.imageUrl }} style={styles.tripImage} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.tripName}>{itinerary.tripName}</Text>
            <Text style={styles.tripSubtitle}>{itinerary.tripSubtitle}</Text>
            <Text style={styles.tripDates}>{formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}</Text>
          </View>
        </View>
        {/* Timeline */}
        <View style={styles.timelineContainer}>
          {itinerary.days.map((day: any, idx: number) => (
            <View key={day.date} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => handleAddItem(day)}
                >
                  <Ionicons name="add-circle" size={24} color="#4F46E5" />
                </TouchableOpacity>
              </View>
              {day.items.map((item: any, i: number) => (
                <SwipeableCard key={i} item={item} day={day} itemIndex={i} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Edit/Add Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isAddingNew ? 'Add Activity' : 'Edit Activity'}
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.time}
                  onChangeText={(text) => setEditForm({ ...editForm, time: text })}
                  placeholder="9:00 AM"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.title}
                  onChangeText={(text) => setEditForm({ ...editForm, title: text })}
                  placeholder="Activity title"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.location}
                  onChangeText={(text) => setEditForm({ ...editForm, location: text })}
                  placeholder="Location"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editForm.notes}
                  onChangeText={(text) => setEditForm({ ...editForm, notes: text })}
                  placeholder="Additional notes"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
            
            <View style={styles.modalActions}>
              {!isAddingNew && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={handleDeleteItem}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveItem}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    marginBottom: 8,
  },
  backButton: {
    marginRight: 12,
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    letterSpacing: -1,
  },
  tripInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tripImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
  },
  tripName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  tripSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 2,
  },
  tripDates: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  optionsContainer: {
    flex: 1,
  },
  optionsContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  optionsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  optionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  optionsSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  optionsButtons: {
    width: '100%',
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timelineContainer: {
    marginHorizontal: 18,
    marginTop: 8,
  },
  daySection: {
    marginBottom: 28,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginRight: 10,
    letterSpacing: 1,
  },
  dayDate: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  progressDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  progressDotCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
  },
  cardCompleted: {
    opacity: 0.5,
  },
  cardContent: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 13,
    color: '#4F46E5',
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
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  timelineNotes: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  swipeHints: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    pointerEvents: 'none',
  },
  swipeHint: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  swipeHintLeft: {
    backgroundColor: '#4F46E5',
  },
  swipeHintRight: {
    backgroundColor: '#EF4444',
  },
  swipeHintText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#4F46E5',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  deleteAction: {
    backgroundColor: '#fee2e2',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
});

export default ItineraryScreen; 