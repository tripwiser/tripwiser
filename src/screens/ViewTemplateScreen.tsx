import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { 
  FadeInUp, 
  FadeInDown,
} from 'react-native-reanimated';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useTemplateStore } from '../state/templateStore';
import { PackingItem } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp_ = RouteProp<RootStackParamList, 'ViewTemplate'>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  templateHeader: {
    backgroundColor: 'white',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  templateName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 16,
  },
  templateMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  customBadge: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  customText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '500',
  },
  itemsSection: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  essentialBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  essentialText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  itemCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#6b7280',
  },
});

export default function ViewTemplateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp_>();
  const insets = useSafeAreaInsets();
  
  const { templateId } = route.params;
  const { getTemplate, incrementUsage, duplicateTemplate } = useTemplateStore();
  
  const template = getTemplate(templateId);

  if (!template) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={20} color="#6b7280" />
          </Pressable>
          <Text style={styles.headerTitle}>Template</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>Template Not Found</Text>
          <Text style={styles.emptyText}>
            The template you're looking for doesn't exist or has been removed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleUseTemplate = () => {
    incrementUsage(templateId);
    navigation.navigate('TripSetup', { templateId });
  };

  const handleDuplicate = () => {
    Alert.prompt(
      'Duplicate Template',
      'Enter a name for the new template:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: (text) => {
            if (text && text.trim()) {
              duplicateTemplate(templateId, text.trim());
              Alert.alert('Success', 'Template duplicated successfully!');
            }
          },
        },
      ],
      'plain-text',
      `${template.name} (Copy)`
    );
  };

  const groupedItems = template.items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color="#6b7280" />
        </Pressable>
        <Text style={styles.headerTitle}>Template Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Template Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.templateHeader}>
          <Text style={styles.templateName}>{template.name}</Text>
          <Text style={styles.templateDescription}>{template.description}</Text>
          
          <View style={styles.templateMeta}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{template.category}</Text>
            </View>
            
            {template.isCustom && (
              <View style={styles.customBadge}>
                <Text style={styles.customText}>Custom</Text>
              </View>
            )}
            
            <View style={styles.metaItem}>
              <Ionicons name="cube-outline" size={16} color="#6b7280" />
              <Text style={styles.metaText}>{template.items.length} items</Text>
            </View>
            
            {template.usageCount > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="trending-up-outline" size={16} color="#6b7280" />
                <Text style={styles.metaText}>Used {template.usageCount} times</Text>
              </View>
            )}
            
            {template.rating && (
              <View style={styles.metaItem}>
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Text style={styles.metaText}>{template.rating}/5</Text>
              </View>
            )}
          </View>

          {template.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {template.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Items Section */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Items ({template.items.length})</Text>
          
          {Object.entries(groupedItems).map(([category, items], categoryIndex) => (
            <Animated.View 
              key={category}
              entering={FadeInUp.delay(categoryIndex * 100).duration(500)}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#4f46e5',
                marginBottom: 12,
                marginTop: categoryIndex > 0 ? 20 : 0,
              }}>
                {category} ({items.length})
              </Text>
              
              {items.map((item, index) => (
                <Animated.View 
                  key={item.id || `${category}-${index}`}
                  entering={FadeInUp.delay((categoryIndex * 100) + (index * 50)).duration(400)}
                  style={styles.itemCard}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.essential && (
                      <View style={styles.essentialBadge}>
                        <Text style={styles.essentialText}>ESSENTIAL</Text>
                      </View>
                    )}
                  </View>
                  
                  {item.quantity && item.quantity > 1 && (
                    <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                  )}
                  
                  {item.notes && (
                    <Text style={{
                      fontSize: 14,
                      color: '#6b7280',
                      fontStyle: 'italic',
                      marginTop: 4,
                    }}>
                      {item.notes}
                    </Text>
                  )}
                </Animated.View>
              ))}
            </Animated.View>
          ))}
          
          {template.items.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color="#9ca3af" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No Items Yet</Text>
              <Text style={styles.emptyText}>
                This template doesn't have any items added yet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={handleDuplicate}
          style={[styles.actionButton, styles.secondaryButton]}
        >
          <Ionicons name="copy-outline" size={20} color="#6b7280" />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            Duplicate
          </Text>
        </Pressable>
        
        <Pressable
          onPress={handleUseTemplate}
          style={styles.actionButton}
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text style={styles.actionButtonText}>Use Template</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}