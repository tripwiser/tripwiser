import React, { useState } from 'react';
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
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInRight,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useTemplateStore, PackingTemplate } from '../state/templateStore';
import { useUserStore } from '../state/userStore';
import { cn } from '../utils/cn';
import UpgradePrompt from '../components/UpgradePrompt';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TemplateCard = React.memo(function TemplateCard({
  template,
  onPress,
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
  canEdit,
}: {
  template: PackingTemplate;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  canEdit: boolean;
}) {
  return (
    <Animated.View 
      entering={FadeInDown.duration(300)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4"
    >
      <Pressable onPress={onPress} className="p-6">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 mr-4">
            <Text className="text-xl font-bold text-gray-900 mb-1">{template.name}</Text>
            <Text className="text-gray-600 text-base leading-5">{template.description}</Text>
          </View>
          
          <View className="items-end">
            <View className="bg-gray-100 px-3 py-1 rounded-full mb-2">
              <Text className="text-gray-700 text-sm font-medium">{template.category}</Text>
            </View>
            {template.usageCount > 0 && (
              <Text className="text-gray-500 text-sm">Used {template.usageCount} times</Text>
            )}
          </View>
        </View>
        
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="cube-outline" size={18} color="#6B7280" />
            <Text className="text-gray-600 ml-1">{template.items.length} items</Text>
            
            {template.isCustom && (
              <View className="bg-blue-100 px-2 py-0.5 rounded-full ml-3">
                <Text className="text-blue-600 text-xs font-medium">Custom</Text>
              </View>
            )}
            
            {template.rating && (
              <View className="flex-row items-center ml-3">
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text className="text-gray-600 ml-1 text-sm">{template.rating}</Text>
              </View>
            )}
          </View>
          
          <View className="flex-row items-center">
            <Pressable onPress={onShare} className="p-2 mr-1">
              <Ionicons name="share-outline" size={18} color="#4F46E5" />
            </Pressable>
            
            <Pressable onPress={onDuplicate} className="p-2 mr-1">
              <Ionicons name="copy-outline" size={18} color="#4F46E5" />
            </Pressable>
            
            {canEdit && template.isCustom && (
              <>
                <Pressable onPress={onEdit} className="p-2 mr-1">
                  <Ionicons name="pencil-outline" size={18} color="#4F46E5" />
                </Pressable>
                
                <Pressable onPress={onDelete} className="p-2">
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </Pressable>
              </>
            )}
          </View>
        </View>
        
        {template.tags.length > 0 && (
          <View className="flex-row flex-wrap mt-3">
            {template.tags.map((tag, index) => (
              <View key={index} className="bg-gray-100 px-2 py-1 rounded mr-2 mb-1">
                <Text className="text-gray-600 text-xs">#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
});

export default function TemplatesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  
  const templates = useTemplateStore((state) => state.templates);
  const deleteTemplate = useTemplateStore((state) => state.deleteTemplate);
  const duplicateTemplate = useTemplateStore((state) => state.duplicateTemplate);
  const exportTemplate = useTemplateStore((state) => state.exportTemplate);
  const incrementUsage = useTemplateStore((state) => state.incrementUsage);
  
  const canPerformAction = useUserStore((state) => state.canPerformAction);
  const getEffectiveTier = useUserStore((state) => state.getEffectiveTier);
  const incrementUserUsage = useUserStore((state) => state.incrementUsage);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateTypeModal, setShowTemplateTypeModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string>('createTemplate');
  
  const currentTier = getEffectiveTier();
  
  const categories = ['All', 'Business', 'Leisure', 'Adventure', 'Family', 'Custom'];
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = (template.name || '').toLowerCase().includes((searchText || '').toLowerCase()) ||
                         (template.description || '').toLowerCase().includes((searchText || '').toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                           (selectedCategory === 'Custom' ? template.isCustom : template.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });
  
  const customTemplates = templates.filter(t => t.isCustom);
  
  const handleUseTemplate = (template: PackingTemplate) => {
    // For custom templates, check if they have template usage allowance
    if (template.isCustom) {
      const { allowed } = canPerformAction('maxTemplatesUsed');
      if (!allowed) {
        setUpgradeFeature('createTemplate');
        setShowUpgradePrompt(true);
        return;
      }
    }
    
    incrementUsage(template.id);
    navigation.navigate('TripSetup', { templateId: template.id });
  };
  
  const handleCreateTemplate = () => {
    const { allowed } = canPerformAction('createTemplate');
    
    if (!allowed) {
      setUpgradeFeature('createTemplate');
      setShowUpgradePrompt(true);
      return;
    }
    
    setShowTemplateTypeModal(true);
  };

  const handleCreateBlankTemplate = () => {
    setShowTemplateTypeModal(false);
    setShowCreateModal(true);
  };

  const handleCreateSmartTemplate = () => {
    setShowTemplateTypeModal(false);
    navigation.navigate('SmartTemplateSetup');
  };
  
  const handleDeleteTemplate = (template: PackingTemplate) => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTemplate(template.id)
        }
      ]
    );
  };
  
  const handleDuplicateTemplate = (template: PackingTemplate) => {
    const { allowed } = canPerformAction('createTemplate');
    
    if (!allowed) {
      setUpgradeFeature('createTemplate');
      setShowUpgradePrompt(true);
      return;
    }
    
    incrementUserUsage('templatesCreated');
    
    Alert.prompt(
      'Duplicate Template',
      'Enter a name for the new template:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create', 
          onPress: (name) => {
            if (name && name.trim()) {
              duplicateTemplate(template.id, name.trim());
            }
          }
        }
      ],
      'plain-text',
      `${template.name} Copy`
    );
  };
  
  const handleShareTemplate = async (template: PackingTemplate) => {
    const { allowed } = canPerformAction('sharePackingList');
    
    if (!allowed) {
      setUpgradeFeature('sharePackingList');
      setShowUpgradePrompt(true);
      return;
    }
    
    incrementUserUsage('packingListShares');
    
    try {
      const exportedTemplate = exportTemplate(template.id);
      if (exportedTemplate) {
        const shareContent = `Check out this packing template: ${template.name}\n\n${template.description}\n\nItems (${template.items.length}):\n${template.items.map(item => `• ${item.name}`).join('\n')}\n\nShared from TripKit`;
        
        await Share.share({
          message: shareContent,
          title: `${template.name} - Packing Template`,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share template');
    }
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        
        {/* Header */}
        <View className="bg-white border-b border-gray-100" style={{ paddingTop: insets.top }}>
          <View className="px-6 py-4">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-2xl font-bold text-gray-900">Templates</Text>
                <Text className="text-gray-600 mt-1">Packing lists ready to use</Text>
              </View>
              
              <Pressable 
                onPress={handleCreateTemplate}
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
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={{
                    color: 'white',
                    fontWeight: '600',
                    marginLeft: 4,
                  }}>Create</Text>
                </LinearGradient>
              </Pressable>
            </View>
            
            {/* Search */}
            <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center mb-4">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search templates..."
                className="flex-1 ml-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {categories.map((category) => (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    className={cn(
                      "px-4 py-2 rounded-full mr-3",
                      selectedCategory === category ? "bg-indigo-100" : "bg-gray-100"
                    )}
                  >
                    <Text className={cn(
                      "font-medium",
                      selectedCategory === category ? "text-indigo-600" : "text-gray-600"
                    )}>
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
        
        {/* Templates List */}
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Premium Info */}
          {currentTier === 'free' && customTemplates.length === 0 && (
            <Animated.View 
              entering={FadeInDown.duration(300)}
              className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-6"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="star" size={20} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">Pro Templates</Text>
                  <Text className="text-gray-600">Create and save custom templates</Text>
                </View>
              </View>
              <Text className="text-gray-700 mb-4">
                Upgrade to Pro or Elite to create custom packing templates, duplicate existing ones, and share with friends.
              </Text>
              <Pressable 
                onPress={() => navigation.navigate('Subscription')}
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  alignSelf: 'flex-start',
                }}
              >
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
                    fontWeight: '600',
                  }}>Upgrade Now</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          )}
          
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPress={() => navigation.navigate('ViewTemplate', { templateId: template.id })}
              onEdit={() => {/* Navigate to edit screen */}}
              onDelete={() => handleDeleteTemplate(template)}
              onDuplicate={() => handleDuplicateTemplate(template)}
              onShare={() => handleShareTemplate(template)}
              canEdit={currentTier !== 'free'}
            />
          ))}
          
          {filteredTemplates.length === 0 && (
            <View className="items-center justify-center py-12">
              <Text className="text-xl font-bold text-gray-900 mb-2">No templates found</Text>
              <Text className="text-gray-600 text-center">
                {searchText ? 'Try adjusting your search' : 'Create your first custom template'}
              </Text>
            </View>
          )}
        </ScrollView>
        
        {/* Template Type Selection Modal */}
        <Modal
          visible={showTemplateTypeModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTemplateTypeModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <Animated.View 
              entering={FadeInDown.duration(300)}
              className="bg-white rounded-t-3xl p-6"
            >
              <Text className="text-2xl font-bold text-gray-900 mb-2">Create New Template</Text>
              <Text className="text-gray-600 mb-6">Choose how you'd like to create your packing template</Text>
              
              {/* Smart Template Option */}
              <Pressable 
                onPress={handleCreateSmartTemplate}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-4"
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-12 h-12 bg-blue-500 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="sparkles" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900 mb-1">Smart Template</Text>
                    <Text className="text-blue-600 font-semibold">Recommended</Text>
                  </View>
                </View>
                <Text className="text-gray-700 leading-5 mb-3">
                  Let TripKit generate a personalized packing list based on your trip details like destination, activities, duration, and travel companions.
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text className="text-green-600 text-sm font-medium ml-1">Includes trip-specific suggestions</Text>
                </View>
              </Pressable>
              
              {/* Blank Template Option */}
              <Pressable 
                onPress={handleCreateBlankTemplate}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6"
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-12 h-12 bg-gray-400 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="document-outline" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900 mb-1">Blank Template</Text>
                    <Text className="text-gray-500 font-medium">Start from scratch</Text>
                  </View>
                </View>
                <Text className="text-gray-600 leading-5 mb-3">
                  Create an empty template and add items manually. Perfect for specialized trips or if you have specific packing preferences.
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="create-outline" size={16} color="#6B7280" />
                  <Text className="text-gray-500 text-sm font-medium ml-1">Full customization control</Text>
                </View>
              </Pressable>
              
              <Pressable 
                onPress={() => setShowTemplateTypeModal(false)}
                className="bg-gray-100 rounded-xl py-3 items-center"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </Pressable>
            </Animated.View>
          </View>
        </Modal>

        {/* Create Blank Template Modal */}
        <Modal
          visible={showCreateModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <KeyboardAvoidingView 
            className="flex-1" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View className="flex-1 justify-end bg-black/50">
              <Animated.View 
                entering={FadeInDown.duration(300)}
                className="bg-white rounded-t-3xl p-6"
              >
                <Text className="text-xl font-bold text-gray-900 mb-4">Create Blank Template</Text>
                <TextInput
                  value={newTemplateName}
                  onChangeText={setNewTemplateName}
                  placeholder="Template name (e.g., 'Weekend Getaway', 'Business Trip')"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4"
                  autoFocus
                  returnKeyType="done"
                />
                <View className="flex-row space-x-3">
                  <Pressable 
                    onPress={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                  >
                    <Text className="text-gray-700 font-semibold">Cancel</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => {
                      if (newTemplateName.trim()) {
                        navigation.navigate('TripSetup', { 
                          createTemplate: true, 
                          templateName: newTemplateName.trim() 
                        });
                        setNewTemplateName('');
                        setShowCreateModal(false);
                      }
                    }}
                    style={{
                      flex: 1,
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
                      }}>Create Template</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </Animated.View>
            </View>
          </KeyboardAvoidingView>
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
    </SafeAreaView>
  );
}