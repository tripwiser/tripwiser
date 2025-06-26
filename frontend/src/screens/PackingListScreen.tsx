import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTripStore } from '../state/tripStore';
import { useUserStore } from '../state/userStore';
import { PackingItem } from '../types';
import { cn } from '../utils/cn';
import { getTemperatureDisplayValue } from '../utils/temperature';
import { sharePackingList, exportPackingListHTML } from '../utils/shareUtils';
import UpgradePrompt from '../components/UpgradePrompt';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp_ = RouteProp<RootStackParamList, 'PackingList'>;

interface PackingCategory {
  id: string;
  name: string;
  icon: string;
  items: PackingItem[];
  isExpanded: boolean;
}

// Smart icon assignment based on category names
const getSmartIcon = (categoryName: string, customEmojis: Record<string, string> = {}): string => {
  // Check if there's a custom emoji for this category
  if (customEmojis[categoryName]) {
    return customEmojis[categoryName];
  }
  
  const name = categoryName.toLowerCase();
  
  if (name.includes('cloth') || name.includes('apparel') || name.includes('outfit')) return '👕';
  if (name.includes('shoe') || name.includes('footwear')) return '👟';
  if (name.includes('toiletries') || name.includes('hygiene') || name.includes('bathroom')) return '🧴';
  if (name.includes('electronic') || name.includes('tech') || name.includes('gadget')) return '🔌';
  if (name.includes('document') || name.includes('passport') || name.includes('id')) return '📄';
  if (name.includes('medication') || name.includes('medicine') || name.includes('health')) return '💊';
  if (name.includes('food') || name.includes('snack') || name.includes('meal')) return '🍎';
  if (name.includes('gift') || name.includes('souvenir')) return '🎁';
  if (name.includes('work') || name.includes('business') || name.includes('office')) return '💼';
  if (name.includes('camera') || name.includes('photo')) return '📷';
  if (name.includes('book') || name.includes('read')) return '📚';
  if (name.includes('sport') || name.includes('exercise') || name.includes('gym')) return '⚽';
  if (name.includes('swim') || name.includes('beach') || name.includes('pool')) return '🏊‍♂️';
  if (name.includes('outdoor') || name.includes('camping') || name.includes('hiking')) return '🏕️';
  if (name.includes('winter') || name.includes('cold') || name.includes('snow')) return '❄️';
  if (name.includes('formal') || name.includes('dress') || name.includes('suit')) return '🤵';
  if (name.includes('accessory') || name.includes('jewelry')) return '💍';
  if (name.includes('bag') || name.includes('luggage')) return '🎒';
  if (name.includes('convenience') || name.includes('comfort')) return '🛋️';
  if (name.includes('weather') && name.includes('protection')) return '☂️';
  if (name.includes('healthcare')) return '💊';
  if (name.includes('documents') && name.includes('money')) return '📄';
  
  return '📦'; // Default fallback icon
};

const { width: screenWidth } = Dimensions.get('window');

// Emoji categories for the picker
const emojiCategories = [
  {
    name: 'Travel & Places',
    emojis: ['✈️', '🚗', '🚢', '🚂', '🏨', '🏖️', '🏔️', '🌍', '🗺️', '🧳', '🎒', '📍', '🏛️', '🗽', '🏰', '🌉', '🏕️', '⛱️']
  },
  {
    name: 'Objects',
    emojis: ['📦', '👕', '👖', '👗', '👔', '👞', '👟', '🧢', '👜', '💼', '🎒', '👓', '⌚', '📱', '💻', '📷', '🔌', '🔋', '💡', '🔑']
  },
  {
    name: 'Food & Drink',
    emojis: ['🍎', '🍌', '🥐', '🍞', '🧀', '🥛', '☕', '🍺', '🍷', '🥤', '🍽️', '🥢', '🍴', '🥄', '🧂', '🍯', '🫖', '🍳']
  },
  {
    name: 'Activities',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🏒', '🎿', '⛷️', '🏂', '🏄', '🏊', '🚴', '🏃', '🧗', '🏋️']
  },
  {
    name: 'Health & Beauty',
    emojis: ['💊', '🩹', '🧴', '🧼', '🧽', '🪥', '🪒', '💄', '💅', '🧴', '🪞', '🧻', '🩺', '💉', '🌡️', '🩹']
  },
  {
    name: 'Nature',
    emojis: ['🌸', '🌺', '🌻', '🌷', '🌹', '🍄', '🌿', '🍀', '🌾', '🐚', '🌊', '❄️', '⛄', '🌈', '☀️', '⭐', '🌙', '☁️']
  },
  {
    name: 'Symbols',
    emojis: ['❤️', '💙', '💚', '💛', '🧡', '💜', '⭐', '✨', '💫', '🔥', '💎', '🎯', '🎪', '🎨', '🎭', '🎪', '🎊', '🎉']
  }
];

const EmojiPicker = ({ selectedEmoji, onEmojiSelect, onClose }: {
  selectedEmoji: string;
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}) => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  
  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <View 
        style={{ 
          backgroundColor: 'white', 
          borderTopLeftRadius: 24, 
          borderTopRightRadius: 24,
          maxHeight: '70%',
          minHeight: 350
        }}
      >
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: 16, 
          borderBottomWidth: 1, 
          borderBottomColor: '#F3F4F6' 
        }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>Choose Emoji</Text>
          <Pressable onPress={onClose} style={{ padding: 8 }}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>
        
        {/* Selected Emoji Display */}
        <View style={{ alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
          <Text style={{ fontSize: 36 }}>{selectedEmoji}</Text>
        </View>
        
        {/* Category Tabs */}
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ paddingHorizontal: 16, paddingVertical: 8 }}
          >
            {emojiCategories.map((category, index) => (
              <Pressable
                key={index}
                onPress={() => setSelectedCategory(index)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor: selectedCategory === index ? '#E0E7FF' : '#F3F4F6'
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: selectedCategory === index ? '#4338CA' : '#6B7280'
                }}>
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        
        {/* Emoji Grid */}
        <ScrollView 
          style={{ flex: 1, padding: 16 }}
          showsVerticalScrollIndicator={true}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {emojiCategories[selectedCategory].emojis.map((emoji, index) => (
              <Pressable
                key={index}
                onPress={() => onEmojiSelect(emoji)}
                style={{
                  width: 48,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  margin: 4,
                  backgroundColor: selectedEmoji === emoji ? '#E0E7FF' : '#F9FAFB'
                }}
              >
                <Text style={{ fontSize: 24 }}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

// Enhanced Item Component with swipe-to-delete - Updated for subscription system
const PackingItemComponent = React.memo(function PackingItemComponent({ 
  item, 
  onToggle, 
  onEdit, 
  onDelete,
  onToggleEssential,
  onAssign,
  canPerformActions,
}: {
  item: PackingItem;
  onToggle: () => void;
  onEdit: (newName: string) => void;
  onDelete: () => void;
  onToggleEssential: () => void;
  onAssign: () => void;
  canPerformActions: { [key: string]: { allowed: boolean; remaining: number | 'unlimited' } };
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.name);
  const [shouldReset, setShouldReset] = useState(false);
  
  // Animation values for swipe
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const deleteOpacity = useSharedValue(0);
  
  const deleteButtonWidth = 80;
  const autoResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoResetTimerRef.current) {
        clearTimeout(autoResetTimerRef.current);
      }
    };
  }, []);

  const handleEdit = () => {
    if (editText.trim() && editText !== item.name) {
      onEdit(editText.trim());
    }
    setIsEditing(false);
  };

  const resetPositionAnimated = () => {
    'worklet';
    translateX.value = withSpring(0);
    deleteOpacity.value = withTiming(0);
  };

  const clearTimer = () => {
    if (autoResetTimerRef.current) {
      clearTimeout(autoResetTimerRef.current);
      autoResetTimerRef.current = null;
    }
  };

  const resetPosition = () => {
    clearTimer();
    resetPositionAnimated();
  };

  const startAutoResetTimer = () => {
    clearTimer();
    setShouldReset(false); // Reset the flag
    
    // Start new 2-second timer
    autoResetTimerRef.current = setTimeout(() => {
      setShouldReset(true); // Trigger reset via state change
    }, 2000);
  };

  // Watch for reset trigger
  useEffect(() => {
    if (shouldReset) {
      translateX.value = withSpring(0);
      deleteOpacity.value = withTiming(0);
      clearTimer();
      setShouldReset(false); // Reset the flag
    }
  }, [shouldReset]);

  const handlePanGesture = (event: any) => {
    const { translationX, state } = event.nativeEvent;
    
    if (state === State.ACTIVE) {
      if (translationX < 0) {
        // Left swipe - show delete button
        translateX.value = Math.max(translationX, -deleteButtonWidth);
        deleteOpacity.value = Math.min(Math.abs(translationX) / deleteButtonWidth, 1);
      } else if (translationX > 0 && translateX.value < 0) {
        // Right swipe when delete button is showing - allow closing
        const currentOffset = translateX.value;
        const newOffset = Math.min(currentOffset + translationX, 0);
        translateX.value = newOffset;
        deleteOpacity.value = Math.max(Math.abs(newOffset) / deleteButtonWidth, 0);
      }
    } else if (state === State.END) {
      if (translationX < -deleteButtonWidth / 2 && translateX.value <= -deleteButtonWidth / 2) {
        // Snap to show delete button (left swipe threshold reached)
        translateX.value = withSpring(-deleteButtonWidth);
        deleteOpacity.value = withTiming(1);
        // Start the auto-reset timer
        startAutoResetTimer();
      } else {
        // Snap back to original position (right swipe or insufficient left swipe)
        resetPosition();
      }
    }
  };

  const handleDeletePress = () => {
    // Clear the auto-reset timer since user is deleting
    if (autoResetTimerRef.current) {
      clearTimeout(autoResetTimerRef.current);
      autoResetTimerRef.current = null;
    }
    
    // Animate scale down then call delete
    scale.value = withTiming(0.95, { duration: 100 }, () => {
      scale.value = withTiming(1, { duration: 100 });
      runOnJS(onDelete)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value }
    ],
  }));

  const deleteButtonStyle = useAnimatedStyle(() => ({
    opacity: deleteOpacity.value,
    transform: [
      { 
        translateX: interpolate(
          deleteOpacity.value,
          [0, 1],
          [deleteButtonWidth, 0],
          Extrapolate.CLAMP
        )
      }
    ],
  }));

  return (
    <Animated.View 
      entering={FadeInDown.duration(300)}
      className="mb-4 relative"
    >
      {/* Delete Button Background */}
      <Animated.View 
        style={[deleteButtonStyle, { width: deleteButtonWidth }]}
        className="absolute right-0 top-0 bottom-0 justify-center items-center bg-red-500 rounded-r-xl"
      >
        <Pressable 
          onPress={handleDeletePress}
          className="w-full h-full justify-center items-center"
        >
          <Ionicons name="trash-outline" size={24} color="white" />
        </Pressable>
      </Animated.View>

      {/* Main Item Content */}
      <PanGestureHandler 
        onGestureEvent={handlePanGesture}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-5, 5]}
      >
        <Animated.View 
          style={animatedStyle}
          className="flex-row items-center py-5 px-6 bg-white rounded-xl border border-gray-100"
        >
          {/* Checkbox */}
          <Pressable 
            onPress={onToggle}
            className={cn(
              "w-7 h-7 rounded-full border-2 mr-4 items-center justify-center",
              item.packed ? "bg-green-500 border-green-500" : "border-gray-300"
            )}
          >
            {item.packed && <Ionicons name="checkmark" size={16} color="white" />}
          </Pressable>

          {/* Item Name - Editable */}
          <View className="flex-1">
            {isEditing ? (
              <TextInput
                value={editText}
                onChangeText={setEditText}
                onSubmitEditing={handleEdit}
                onBlur={handleEdit}
                autoFocus
                className="text-lg font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded"
              />
            ) : (
              <Pressable onPress={() => setIsEditing(true)}>
                <View className="flex-row items-center flex-wrap">
                  <Text 
                    className={cn(
                      "text-lg font-medium mr-3",
                      item.packed ? "line-through text-gray-500" : "text-gray-900"
                    )}
                    style={item.packed ? { fontStyle: 'italic' } : undefined}
                  >
                    {item.name}
                  </Text>
                  {/* Essential Tag - Only shows when essential is true */}
                  {item.essential && (
                    <View className="bg-orange-100 px-2 py-0.5 rounded-full mr-2">
                      <Text className="text-orange-600 text-xs font-medium">Essential</Text>
                    </View>
                  )}
                  {/* Assigned Person Tag - Only shows when assigned */}
                  {item.assignedTo && (
                    <View className="bg-blue-100 px-2 py-0.5 rounded-full">
                      <Text className="text-blue-600 text-xs font-medium">{item.assignedTo}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            )}
          </View>

          {/* Essential Circle Toggle */}
          <Pressable 
            onPress={onToggleEssential}
            className={cn(
              "w-5 h-5 rounded-full border-2 mr-6 items-center justify-center",
              item.essential ? "bg-orange-500 border-orange-500" : "border-gray-300"
            )}
          >
            {item.essential && <Ionicons name="checkmark" size={10} color="white" />}
          </Pressable>

          {/* Assign Button */}
          <Pressable 
            onPress={onAssign}
            className="p-2.5"
          >
            <Ionicons 
              name="person-add-outline" 
              size={16} 
              color={canPerformActions.sharePackingList?.allowed ? "#4F46E5" : "#9CA3AF"} 
            />
            {!canPerformActions.sharePackingList?.allowed && (
              <View className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full items-center justify-center">
                <Ionicons name="star" size={8} color="white" />
              </View>
            )}
          </Pressable>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
});

// Category Card Component
const CategoryCard = React.memo(function CategoryCard({
  category,
  onToggleExpand,
  onEditCategory,
  onDeleteCategory,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleItem,
  onToggleEssential,
  onAssignCategory,
  onAssignItem,
  canPerformActions,
}: {
  category: PackingCategory;
  onToggleExpand: () => void;
  onEditCategory: (newName: string) => void;
  onDeleteCategory: () => void;
  onAddItem: (itemName: string) => void;
  onEditItem: (itemId: string, newName: string) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleItem: (itemId: string) => void;
  onToggleEssential: (itemId: string) => void;
  onAssignCategory: () => void;
  onAssignItem: (itemId: string) => void;
  canPerformActions: { [key: string]: { allowed: boolean; remaining: number | 'unlimited' } };
}) {
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryEditText, setCategoryEditText] = useState(category.name);
  const [newItemText, setNewItemText] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);
  
  // Animation values for swipe
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const deleteOpacity = useSharedValue(0);
  
  const deleteButtonWidth = 80;
  const autoResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoResetTimerRef.current) {
        clearTimeout(autoResetTimerRef.current);
      }
    };
  }, []);

  const packedCount = category.items.filter(item => item.packed).length;
  const totalCount = category.items.length;
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  const handleEditCategory = () => {
    if (categoryEditText.trim() && categoryEditText !== category.name) {
      onEditCategory(categoryEditText.trim());
    }
    setIsEditingCategory(false);
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      onAddItem(newItemText.trim());
      setNewItemText('');
      setShowAddItem(false);
    }
  };

  const resetPositionAnimated = () => {
    'worklet';
    translateX.value = withSpring(0);
    deleteOpacity.value = withTiming(0);
  };

  const clearTimer = () => {
    if (autoResetTimerRef.current) {
      clearTimeout(autoResetTimerRef.current);
      autoResetTimerRef.current = null;
    }
  };

  const resetPosition = () => {
    clearTimer();
    resetPositionAnimated();
  };

  const startAutoResetTimer = () => {
    clearTimer();
    setShouldReset(false); // Reset the flag
    
    // Start new 2-second timer
    autoResetTimerRef.current = setTimeout(() => {
      setShouldReset(true); // Trigger reset via state change
    }, 2000);
  };

  // Watch for reset trigger
  useEffect(() => {
    if (shouldReset) {
      translateX.value = withSpring(0);
      deleteOpacity.value = withTiming(0);
      clearTimer();
      setShouldReset(false); // Reset the flag
    }
  }, [shouldReset]);

  const handlePanGesture = (event: any) => {
    const { translationX, state, velocityX } = event.nativeEvent;
    
    if (state === State.ACTIVE) {
      if (translationX < 0) {
        // Left swipe - show delete button
        translateX.value = Math.max(translationX, -deleteButtonWidth);
        deleteOpacity.value = Math.min(Math.abs(translationX) / deleteButtonWidth, 1);
      } else if (translationX > 0 && translateX.value < 0) {
        // Right swipe when delete button is showing - allow closing
        const currentOffset = translateX.value;
        const newOffset = Math.min(currentOffset + translationX, 0);
        translateX.value = newOffset;
        deleteOpacity.value = Math.max(Math.abs(newOffset) / deleteButtonWidth, 0);
      }
    } else if (state === State.END) {
      if (translationX < -deleteButtonWidth / 2 && translateX.value <= -deleteButtonWidth / 2) {
        // Snap to show delete button (left swipe threshold reached)
        translateX.value = withSpring(-deleteButtonWidth);
        deleteOpacity.value = withTiming(1);
        // Start the auto-reset timer
        startAutoResetTimer();
      } else {
        // Snap back to original position (right swipe or insufficient left swipe)
        resetPosition();
      }
    }
  };

  const handleDeletePress = () => {
    // Clear the auto-reset timer since user is deleting
    clearTimer();
    
    // Show confirmation dialog
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}" and all its items? This action cannot be undone.`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => resetPosition() // Reset position if cancelled
        },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Animate scale down then call delete
            scale.value = withTiming(0.95, { duration: 100 }, () => {
              scale.value = withTiming(1, { duration: 100 });
              runOnJS(onDeleteCategory)();
            });
          }
        }
      ]
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value }
    ],
  }));

  const deleteButtonStyle = useAnimatedStyle(() => ({
    opacity: deleteOpacity.value,
    transform: [
      { 
        translateX: interpolate(
          deleteOpacity.value,
          [0, 1],
          [deleteButtonWidth, 0],
          Extrapolate.CLAMP
        )
      }
    ],
  }));

  return (
    <Animated.View 
      entering={FadeInDown.duration(400)}
      className="mb-6 relative"
    >
      {/* Delete Button Background */}
      <Animated.View 
        style={[deleteButtonStyle, { width: deleteButtonWidth }]}
        className="absolute right-0 top-0 bottom-0 justify-center items-center bg-red-500 rounded-r-2xl"
      >
        <Pressable 
          onPress={handleDeletePress}
          className="w-full h-full justify-center items-center"
        >
          <Ionicons name="trash-outline" size={24} color="white" />
        </Pressable>
      </Animated.View>

      {/* Main Category Content */}
      <PanGestureHandler 
        onGestureEvent={handlePanGesture}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-5, 5]}
      >
        <Animated.View 
          style={animatedStyle}
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          {/* Category Header */}
          <Pressable onPress={onToggleExpand} className="p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Text className="text-3xl mr-4">{category.icon}</Text>
                
                {isEditingCategory ? (
                  <TextInput
                    value={categoryEditText}
                    onChangeText={setCategoryEditText}
                    onSubmitEditing={handleEditCategory}
                    onBlur={handleEditCategory}
                    autoFocus
                    className="text-xl font-bold text-gray-900 bg-gray-50 px-3 py-2 rounded flex-1"
                  />
                ) : (
                  <Pressable onPress={() => setIsEditingCategory(true)} className="flex-1">
                    <Text className="text-xl font-bold text-gray-900">{category.name}</Text>
                  </Pressable>
                )}
              </View>

              <View className="flex-row items-center">
                {/* Progress */}
                <View className="mr-4">
                  <Text className="text-base font-medium text-gray-600">
                    {packedCount}/{totalCount}
                  </Text>
                  <View className="w-20 h-3 bg-gray-200 rounded-full mt-1">
                    <View 
                      className="h-3 bg-green-500 rounded-full" 
                      style={{ width: `${progress}%` }}
                    />
                  </View>
                </View>

                {/* Assign Category */}
                <Pressable onPress={onAssignCategory} className="p-3 mr-2">
                  <Ionicons 
                    name="person-add-outline" 
                    size={18} 
                    color={canPerformActions.sharePackingList?.allowed ? "#4F46E5" : "#9CA3AF"} 
                  />
                  {!canPerformActions.sharePackingList?.allowed && (
                    <View className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full items-center justify-center">
                      <Ionicons name="star" size={8} color="white" />
                    </View>
                  )}
                </Pressable>

                {/* Expand/Collapse */}
                <Ionicons 
                  name={category.isExpanded ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="#6B7280" 
                />
              </View>
            </View>
          </Pressable>

          {/* Category Content */}
          {category.isExpanded && (
            <View className="px-6 pb-6">
              {/* Items */}
              {category.items.map((item) => (
                <PackingItemComponent
                  key={item.id}
                  item={item}
                  onToggle={() => onToggleItem(item.id)}
                  onEdit={(newName) => onEditItem(item.id, newName)}
                  onDelete={() => onDeleteItem(item.id)}
                  onToggleEssential={() => onToggleEssential(item.id)}
                  onAssign={() => onAssignItem(item.id)}
                  canPerformActions={canPerformActions}
                />
              ))}

              {/* Add Item Section */}
              {showAddItem ? (
                <View className="flex-row items-center mt-3">
                  <TextInput
                    value={newItemText}
                    onChangeText={setNewItemText}
                    onSubmitEditing={handleAddItem}
                    placeholder="Enter item name..."
                    autoFocus
                    className="flex-1 bg-gray-50 px-4 py-3 rounded-lg mr-3 text-base"
                  />
                  <Pressable 
                    onPress={handleAddItem} 
                    style={{
                      borderRadius: 8,
                      overflow: 'hidden',
                      marginRight: 12,
                    }}
                  >
                    <LinearGradient
                      colors={['#4F46E5', '#6366F1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        padding: 12,
                      }}
                    >
                      <Ionicons name="checkmark" size={20} color="white" />
                    </LinearGradient>
                  </Pressable>
                  <Pressable onPress={() => setShowAddItem(false)} className="p-3">
                    <Ionicons name="close" size={20} color="#9CA3AF" />
                  </Pressable>
                </View>
              ) : (
                <Pressable 
                  onPress={() => setShowAddItem(true)}
                  className="flex-row items-center mt-3 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
                >
                  <Ionicons name="add" size={22} color="#6B7280" />
                  <Text className="ml-3 text-gray-600 font-medium text-base">Add item</Text>
                </Pressable>
              )}
            </View>
          )}
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
});

type PackingListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PackingList'>;
type PackingListScreenRouteProp = RouteProp<RootStackParamList, 'PackingList'>;

export default function PackingListScreen() {
  const navigation = useNavigation<PackingListScreenNavigationProp>();
  const route = useRoute<PackingListScreenRouteProp>();
  const { tripId } = route.params;
  
  const trip = useTripStore((state) => state.getTripById(tripId));
  const togglePackingItem = useTripStore((state) => state.togglePackingItem);
  const addPackingItem = useTripStore((state) => state.addPackingItem);
  const updatePackingItem = useTripStore((state) => state.updatePackingItem);
  const removePackingItem = useTripStore((state) => state.removePackingItem);
  const getPackingProgress = useTripStore((state) => state.getPackingProgress);
  
  const canPerformAction = useUserStore((state) => state.canPerformAction);
  const getEffectiveTier = useUserStore((state) => state.getEffectiveTier);
  const incrementUsage = useUserStore((state) => state.incrementUsage);
  const temperatureUnit = useUserStore((state) => state.temperatureUnit);
  
  const currentTier = getEffectiveTier();
  
  const [searchText, setSearchText] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📦');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [customEmojis, setCustomEmojis] = useState<Record<string, string>>({});
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string>('sharePackingList');

  const progress = getPackingProgress(tripId);

  // Group items into categories
  const categories = useMemo(() => {
    if (!trip) return [];
    
    const grouped = trip.packingList.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, PackingItem[]>);

    return Object.entries(grouped).map(([name, items]) => ({
      id: name,
      name,
      icon: getSmartIcon(name, customEmojis),
      items: items.filter(item => 
        item.name.toLowerCase().includes(searchText.toLowerCase())
      ),
      isExpanded: expandedCategories.has(name),
    })).filter(category => category.items.length > 0 || searchText === '');
  }, [trip, searchText, expandedCategories, customEmojis]);

  if (!trip) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Trip not found</Text>
      </View>
    );
  }

  const handleToggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      // Add first item to create the category with custom emoji
      addPackingItem(tripId, {
        name: 'New Item',
        category: newCategoryName.trim(),
        packed: false,
        essential: false,
        customAdded: true,
      });
      
      // Store the custom emoji for this category
      setCustomEmojis(prev => ({
        ...prev,
        [newCategoryName.trim()]: selectedEmoji
      }));
      
      setNewCategoryName('');
      setSelectedEmoji('📦');
      setShowAddCategory(false);
      setExpandedCategories(prev => new Set([...prev, newCategoryName.trim()]));
    }
  };

  const handleAddItem = (categoryName: string, itemName: string) => {
    addPackingItem(tripId, {
      name: itemName,
      category: categoryName,
      packed: false,
      essential: false,
      customAdded: true,
    });
  };

  const handleEditItem = (itemId: string, newName: string) => {
    updatePackingItem(tripId, itemId, { name: newName });
  };

  const handleToggleEssential = (itemId: string) => {
    const item = trip.packingList.find(i => i.id === itemId);
    if (item) {
      updatePackingItem(tripId, itemId, { essential: !item.essential });
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Compact Header */}
      <View className="bg-white border-b border-gray-100 pt-6 pb-4">
        <View className="px-5">
          {/* Trip Info */}
          <Animated.View entering={FadeInDown.duration(500)} className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-gray-900" numberOfLines={1}>{trip.name}</Text>
              <View className="flex-row items-center mt-1.5">
                <Ionicons name="location" size={18} color="#6B7280" />
                <Text className="text-gray-600 ml-1.5 text-lg font-medium" numberOfLines={1}>
                  {trip.destination} • {format(new Date(trip.startDate), 'MMM d')}-{format(new Date(trip.endDate), 'd')}
                </Text>
              </View>
            </View>
            
            {/* Progress Badge */}
            <View style={{
              borderRadius: 12,
              overflow: 'hidden',
            }}>
              <LinearGradient
                colors={['#4F46E5', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: '700',
                  fontSize: 18,
                  letterSpacing: 0.2,
                }}>
                  {progress.percentage}%
                </Text>
              </LinearGradient>
            </View>
          </Animated.View>
          
          {/* Search + Weather + Actions */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} className="flex-row items-center">
            {/* Search */}
            <View className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 flex-row items-center mr-4">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search all items..."
                className="flex-1 ml-3 text-gray-900 text-base"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            {/* Weather */}
            {trip.weather && (
              <View className="bg-gray-50 rounded-xl px-4 py-3.5 flex-row items-center mr-4">
                <Text className="text-xl mr-2">{trip.weather.icon}</Text>
                <Text className="text-gray-900 font-semibold text-base">
                  {getTemperatureDisplayValue(trip.weather.temperature.min, temperatureUnit).value}°-{getTemperatureDisplayValue(trip.weather.temperature.max, temperatureUnit).value}°
                </Text>
              </View>
            )}

            {/* Share Button */}
            <Pressable 
              onPress={() => {
                const { allowed } = canPerformAction('sharePackingList');
                
                if (!allowed) {
                  setUpgradeFeature('sharePackingList');
                  setShowUpgradePrompt(true);
                  return;
                }
                
                Alert.alert(
                  'Share Packing List',
                  'How would you like to share your packing list?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Share as Text', 
                      onPress: () => {
                        incrementUsage('packingListShares');
                        sharePackingList(trip, { format: 'text' });
                      }
                    },
                    { 
                      text: 'Export as HTML', 
                      onPress: () => {
                        incrementUsage('packingListShares');
                        exportPackingListHTML(trip, { format: 'text' });
                      }
                    },
                    { 
                      text: 'Share Link', 
                      onPress: () => {
                        incrementUsage('packingListShares');
                        sharePackingList(trip, { format: 'link' });
                      }
                    },
                  ]
                );
              }}
              className="bg-gray-50 rounded-xl px-4 py-3.5 flex-row items-center"
            >
              <Ionicons 
                name="share-outline" 
                size={20} 
                color={canPerformAction('sharePackingList').allowed ? "#4F46E5" : "#9CA3AF"} 
              />
              {!canPerformAction('sharePackingList').allowed && (
                <View className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full items-center justify-center">
                  <Ionicons name="star" size={8} color="white" />
                </View>
              )}
            </Pressable>

          </Animated.View>
        </View>
      </View>

      {/* Categories List */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onToggleExpand={() => handleToggleExpand(category.id)}
            onEditCategory={(newName) => {
              // This would require a more complex update of all items in the category
              // For now, we'll keep the original name
            }}
            onDeleteCategory={() => {
              // Delete all items in the category
              category.items.forEach(item => {
                removePackingItem(tripId, item.id);
              });
            }}
            onAddItem={(itemName) => handleAddItem(category.name, itemName)}
            onEditItem={handleEditItem}
            onDeleteItem={(itemId) => removePackingItem(tripId, itemId)}
            onToggleItem={(itemId) => togglePackingItem(tripId, itemId)}
            onToggleEssential={handleToggleEssential}
            canPerformActions={{
              sharePackingList: canPerformAction('sharePackingList'),
              exportPdf: canPerformAction('exportPdf'),
            }}
            onAssignCategory={() => {
              const { allowed } = canPerformAction('sharePackingList'); // Using sharing as proxy for collaboration
              if (!allowed) {
                setUpgradeFeature('sharePackingList');
                setShowUpgradePrompt(true);
                return;
              }
              
              Alert.alert(
                'Assign Category',
                `Assign "${category.name}" category to a team member?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'John', onPress: () => Alert.alert('Assigned', `"${category.name}" assigned to John`) },
                  { text: 'Sarah', onPress: () => Alert.alert('Assigned', `"${category.name}" assigned to Sarah`) },
                  { text: 'Mike', onPress: () => Alert.alert('Assigned', `"${category.name}" assigned to Mike`) },
                ]
              );
            }}
            onAssignItem={(itemId) => {
              const { allowed } = canPerformAction('sharePackingList'); // Using sharing as proxy for collaboration
              if (!allowed) {
                setUpgradeFeature('sharePackingList');
                setShowUpgradePrompt(true);
                return;
              }
              
              const item = trip.packingList.find(i => i.id === itemId);
              if (item) {
                Alert.alert(
                  'Assign Item',
                  `Assign "${item.name}" to a team member?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'John', 
                      onPress: () => updatePackingItem(tripId, itemId, { assignedTo: 'John' })
                    },
                    { 
                      text: 'Sarah', 
                      onPress: () => updatePackingItem(tripId, itemId, { assignedTo: 'Sarah' })
                    },
                    { 
                      text: 'Mike', 
                      onPress: () => updatePackingItem(tripId, itemId, { assignedTo: 'Mike' })
                    },
                    { 
                      text: 'Unassign', 
                      style: 'destructive',
                      onPress: () => updatePackingItem(tripId, itemId, { assignedTo: undefined })
                    },
                  ]
                );
              }
            }}
          />
        ))}

        {/* Add Category Section - Always at bottom */}
        <Pressable 
          onPress={() => setShowAddCategory(true)}
          className="flex-row items-center mt-4 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300"
        >
          <Ionicons name="add" size={24} color="#6B7280" />
          <Text className="ml-3 text-gray-600 font-medium text-lg">Add new category</Text>
        </Pressable>

        {categories.length === 0 && searchText === '' && (
          <View className="items-center justify-center py-12 mb-4">
            <Text className="text-xl font-bold text-gray-900 mb-2">No categories yet</Text>
            <Text className="text-gray-600 text-center">Tap "Add new category" below to create your first category</Text>
          </View>
        )}
      </ScrollView>



      {/* Add Category Modal */}
      <Modal
        visible={showAddCategory && !showEmojiPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddCategory(false)}
      >
        <KeyboardAvoidingView 
          className="flex-1" 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View className="flex-1 justify-end bg-black/50">
            <Animated.View 
              entering={FadeInDown.duration(300)}
              className="bg-white rounded-t-3xl p-6"
            >
              <Text className="text-xl font-bold text-gray-900 mb-4">Add New Category</Text>
              
              {/* Category Name Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Category Name</Text>
                <TextInput
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="Category name (e.g., Food, Electronics)"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                  returnKeyType="done"
                  onSubmitEditing={handleAddCategory}
                />
              </View>
              
              {/* Emoji Selection */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Choose Icon</Text>
                <Pressable 
                  onPress={() => setShowEmojiPicker(true)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center"
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>{selectedEmoji}</Text>
                  <Text className="text-gray-600 flex-1">Tap to choose emoji</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </Pressable>
              </View>
              
              <View className="flex-row gap-4">
                <Pressable 
                  onPress={() => {
                    setShowAddCategory(false);
                    setNewCategoryName('');
                    setSelectedEmoji('📦');
                  }}
                  className="flex-1 bg-gray-100 rounded-xl py-3 items-center mr-2"
                >
                  <Text className="text-gray-700 font-semibold">Cancel</Text>
                </Pressable>
                <Pressable 
                  onPress={handleAddCategory}
                  className="flex-1 ml-2"
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  <LinearGradient
                    colors={['#4F46E5', '#6366F1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      paddingVertical: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{
                      color: 'white',
                      fontWeight: '600',
                      fontSize: 16,
                    }}>Add Category</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <EmojiPicker 
          selectedEmoji={selectedEmoji}
          onEmojiSelect={(emoji) => {
            setSelectedEmoji(emoji);
            setShowEmojiPicker(false);
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      </Modal>

      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        onUpgrade={() => {
          setShowUpgradePrompt(false);
          navigation.navigate('Subscription');
        }}
        feature={upgradeFeature}
        currentTier={currentTier}
        suggestedTier={currentTier === 'free' ? 'pro' : 'elite'}
      />
    </View>
  );
}