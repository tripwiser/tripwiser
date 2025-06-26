import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PackingItem } from '../types';

export interface PackingTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  items: PackingItem[];
  createdAt: string;
  updatedAt: string;
  isCustom: boolean;
  tags: string[];
  usageCount: number;
  rating?: number;
}

interface TemplateState {
  templates: PackingTemplate[];
  
  // Actions
  addTemplate: (template: Omit<PackingTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  updateTemplate: (id: string, updates: Partial<PackingTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getTemplate: (id: string) => PackingTemplate | undefined;
  getTemplatesByCategory: (category: string) => PackingTemplate[];
  getCustomTemplates: () => PackingTemplate[];
  duplicateTemplate: (id: string, newName: string) => void;
  incrementUsage: (id: string) => void;
  rateTemplate: (id: string, rating: number) => void;
  importTemplate: (template: PackingTemplate) => void;
  exportTemplate: (id: string) => PackingTemplate | null;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Default templates that come with the app
const defaultTemplates: PackingTemplate[] = [
  {
    id: 'default-business',
    name: 'Business Trip',
    description: 'Professional essentials for business travel',
    category: 'Business',
    isCustom: false,
    tags: ['business', 'professional', 'work'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Business cards', category: 'Documents', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'Laptop', category: 'Electronics', packed: false, essential: true, customAdded: false },
      { id: '3', name: 'Charger', category: 'Electronics', packed: false, essential: true, customAdded: false },
      { id: '4', name: 'Dress shirt', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '5', name: 'Dress pants', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '6', name: 'Dress shoes', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '7', name: 'Belt', category: 'Clothing', packed: false, essential: false, customAdded: false },
      { id: '8', name: 'Tie', category: 'Clothing', packed: false, essential: false, customAdded: false },
    ]
  },
  {
    id: 'default-beach',
    name: 'Beach Vacation',
    description: 'Everything you need for a perfect beach getaway',
    category: 'Leisure',
    isCustom: false,
    tags: ['beach', 'vacation', 'summer', 'swimming'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Swimsuit', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'Sunscreen', category: 'Toiletries', packed: false, essential: true, customAdded: false },
      { id: '3', name: 'Sunglasses', category: 'Accessories', packed: false, essential: true, customAdded: false },
      { id: '4', name: 'Beach towel', category: 'Accessories', packed: false, essential: true, customAdded: false },
      { id: '5', name: 'Flip flops', category: 'Clothing', packed: false, essential: false, customAdded: false },
      { id: '6', name: 'Sun hat', category: 'Clothing', packed: false, essential: false, customAdded: false },
      { id: '7', name: 'Beach bag', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '8', name: 'Waterproof phone case', category: 'Electronics', packed: false, essential: false, customAdded: false },
    ]
  },
  {
    id: 'default-winter',
    name: 'Winter Sports',
    description: 'Cold weather and winter activity essentials',
    category: 'Adventure',
    isCustom: false,
    tags: ['winter', 'snow', 'skiing', 'cold'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Winter jacket', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'Thermal underwear', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '3', name: 'Wool socks', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '4', name: 'Gloves', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '5', name: 'Winter boots', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '6', name: 'Beanie', category: 'Clothing', packed: false, essential: false, customAdded: false },
      { id: '7', name: 'Scarf', category: 'Clothing', packed: false, essential: false, customAdded: false },
      { id: '8', name: 'Hand warmers', category: 'Accessories', packed: false, essential: false, customAdded: false },
    ]
  }
];

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: defaultTemplates,
      
      addTemplate: (templateData) => {
        const newTemplate: PackingTemplate = {
          ...templateData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usageCount: 0,
        };
        
        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
      },
      
      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id
              ? { ...template, ...updates, updatedAt: new Date().toISOString() }
              : template
          ),
        }));
      },
      
      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
        }));
      },
      
      getTemplate: (id) => {
        return get().templates.find((template) => template.id === id);
      },
      
      getTemplatesByCategory: (category) => {
        return get().templates.filter((template) => template.category === category);
      },
      
      getCustomTemplates: () => {
        return get().templates.filter((template) => template.isCustom);
      },
      
      duplicateTemplate: (id, newName) => {
        const template = get().getTemplate(id);
        if (template) {
          const newTemplate: PackingTemplate = {
            ...template,
            id: generateId(),
            name: newName,
            isCustom: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0,
          };
          
          set((state) => ({
            templates: [...state.templates, newTemplate],
          }));
        }
      },
      
      incrementUsage: (id) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id
              ? { ...template, usageCount: template.usageCount + 1, updatedAt: new Date().toISOString() }
              : template
          ),
        }));
      },
      
      rateTemplate: (id, rating) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id
              ? { ...template, rating, updatedAt: new Date().toISOString() }
              : template
          ),
        }));
      },
      
      importTemplate: (template) => {
        const newTemplate: PackingTemplate = {
          ...template,
          id: generateId(),
          isCustom: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
      },
      
      exportTemplate: (id) => {
        return get().getTemplate(id) || null;
      },
    }),
    {
      name: 'tripkit-templates',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);