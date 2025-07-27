import { create } from 'zustand';
import { PackingItem } from '../types';
import mockItineraries from '../data/mockItineraries';

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
  templateType?: 'packing' | 'itinerary';
  destination?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
}

const defaultTemplates: PackingTemplate[] = [
  {
    id: 'default-staycation',
    name: 'Staycation',
    description: 'Essentials for a relaxing break at home or nearby',
    category: 'Leisure',
    isCustom: false,
    tags: ['staycation', 'home', 'relax'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Comfy clothes', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'Books/magazines', category: 'Leisure', packed: false, essential: false, customAdded: false },
      { id: '3', name: 'Snacks', category: 'Food', packed: false, essential: false, customAdded: false },
      { id: '4', name: 'Board games', category: 'Leisure', packed: false, essential: false, customAdded: false },
      { id: '5', name: 'Streaming device', category: 'Electronics', packed: false, essential: false, customAdded: false },
      { id: '6', name: 'Face masks', category: 'Toiletries', packed: false, essential: false, customAdded: false },
      { id: '7', name: 'Sunscreen', category: 'Toiletries', packed: false, essential: false, customAdded: false },
      { id: '8', name: 'First aid kit', category: 'Health', packed: false, essential: false, customAdded: false },
    ],
    templateType: 'packing',
  },
  {
    id: 'default-cycling',
    name: 'Cycling Tour',
    description: 'Gear for a safe and enjoyable cycling trip',
    category: 'Adventure',
    isCustom: false,
    tags: ['cycling', 'bike', 'tour'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Bike helmet', category: 'Safety', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'Cycling gloves', category: 'Clothing', packed: false, essential: false, customAdded: false },
      { id: '3', name: 'Water bottles', category: 'Accessories', packed: false, essential: true, customAdded: false },
      { id: '4', name: 'Bike repair kit', category: 'Gear', packed: false, essential: true, customAdded: false },
      { id: '5', name: 'Energy snacks', category: 'Food', packed: false, essential: false, customAdded: false },
      { id: '6', name: 'Cycling shorts', category: 'Clothing', packed: false, essential: false, customAdded: false },
      { id: '7', name: 'Rain jacket', category: 'Clothing', packed: false, essential: false, customAdded: false },
      { id: '8', name: 'Sunscreen', category: 'Toiletries', packed: false, essential: false, customAdded: false }
    ],
    templateType: 'packing',
  },
  {
    id: 'default-boat',
    name: 'Boat/Yacht Holiday',
    description: 'Essentials for a relaxing time on the water',
    category: 'Leisure',
    isCustom: false,
    tags: ['boat', 'yacht', 'water'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Life jacket', category: 'Safety', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'Waterproof bag', category: 'Accessories', packed: false, essential: true, customAdded: false },
      { id: '3', name: 'Non-slip shoes', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '4', name: 'Seasickness medication', category: 'Health', packed: false, essential: true, customAdded: false },
      { id: '5', name: 'Waterproof sunscreen', category: 'Toiletries', packed: false, essential: false, customAdded: false },
      { id: '6', name: 'Snorkeling gear', category: 'Equipment', packed: false, essential: false, customAdded: false },
      { id: '7', name: 'Nautical charts', category: 'Documents', packed: false, essential: false, customAdded: false },
      { id: '8', name: 'Waterproof phone case', category: 'Electronics', packed: false, essential: false, customAdded: false }
    ],
    templateType: 'packing',
  },
  // NEW AI-GENERATED TEMPLATES BELOW
  // (The actual items array for each template will be filled in after calling the backend AI)
  // Example:
  // {
  //   id: 'default-cruise',
  //   name: 'Cruise Vacation',
  //   description: 'Packing essentials for a relaxing and fun cruise trip',
  //   category: 'Leisure',
  //   isCustom: false,
  //   tags: ['cruise', 'ship', 'ocean', 'relax'],
  //   usageCount: 0,
  //   createdAt: new Date().toISOString(),
  //   updatedAt: new Date().toISOString(),
  //   items: [/* AI-generated items here */],
  // },
  // ...repeat for each template idea...
  {
    id: 'default-cruise',
    name: 'Cruise Vacation',
    description: 'Packing essentials for a relaxing and fun cruise trip',
    category: 'Leisure',
    isCustom: false,
    tags: ['cruise', 'ship', 'ocean', 'relax'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Swimsuit', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'Formal attire', category: 'Clothing', packed: false, essential: false, customAdded: false },
      { id: '3', name: 'Sunscreen', category: 'Toiletries', packed: false, essential: true, customAdded: false },
      { id: '4', name: 'Sea sickness tablets', category: 'Health', packed: false, essential: false, customAdded: false },
      { id: '5', name: 'Sandals', category: 'Clothing', packed: false, essential: false, customAdded: false },
      { id: '6', name: 'Travel documents', category: 'Documents', packed: false, essential: true, customAdded: false },
      { id: '7', name: 'Camera', category: 'Electronics', packed: false, essential: false, customAdded: false },
      { id: '8', name: 'Reusable water bottle', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '9', name: 'Sun hat', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '10', name: 'Evening shoes', category: 'Clothing', packed: false, essential: false, customAdded: false },
    ],
    templateType: 'packing',
  },
  {
    id: 'default-family',
    name: 'Family Holiday',
    description: 'Everything you need for a memorable family getaway',
    category: 'Family',
    isCustom: false,
    tags: ['family', 'kids', 'holiday', 'fun'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Kids clothes', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'Snacks', category: 'Food', packed: false, essential: true, customAdded: false },
      { id: '3', name: 'Travel games', category: 'Leisure', packed: false, essential: false, customAdded: false },
      { id: '4', name: 'First aid kit', category: 'Health', packed: false, essential: true, customAdded: false },
      { id: '5', name: 'Sunscreen', category: 'Toiletries', packed: false, essential: true, customAdded: false },
      { id: '6', name: 'Stroller', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '7', name: 'Travel documents', category: 'Documents', packed: false, essential: true, customAdded: false },
      { id: '8', name: 'Reusable water bottles', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '9', name: 'Swimsuits', category: 'Clothing', packed: false, essential: false, customAdded: false },
      { id: '10', name: 'Tablet/entertainment', category: 'Electronics', packed: false, essential: false, customAdded: false },
    ],
    templateType: 'packing',
  },
  {
    id: 'default-solo',
    name: 'Solo Adventure',
    description: 'Essentials for a safe and exciting solo journey',
    category: 'Adventure',
    isCustom: false,
    tags: ['solo', 'adventure', 'explore'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Backpack', category: 'Accessories', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'Travel insurance', category: 'Documents', packed: false, essential: true, customAdded: false },
      { id: '3', name: 'Power bank', category: 'Electronics', packed: false, essential: true, customAdded: false },
      { id: '4', name: 'Comfortable shoes', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '5', name: 'Reusable water bottle', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '6', name: 'Travel towel', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '7', name: 'Notebook/pen', category: 'Leisure', packed: false, essential: false, customAdded: false },
      { id: '8', name: 'First aid kit', category: 'Health', packed: false, essential: false, customAdded: false },
      { id: '9', name: 'Passport', category: 'Documents', packed: false, essential: true, customAdded: false },
      { id: '10', name: 'Camera', category: 'Electronics', packed: false, essential: false, customAdded: false },
    ],
    templateType: 'packing',
  },
  {
    id: 'default-roadtrip',
    name: 'Road Trip',
    description: 'Must-haves for a comfortable and fun road trip',
    category: 'Leisure',
    isCustom: false,
    tags: ['roadtrip', 'car', 'drive', 'explore'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Car charger', category: 'Electronics', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'Snacks', category: 'Food', packed: false, essential: true, customAdded: false },
      { id: '3', name: 'Travel pillow', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '4', name: 'Playlist/music', category: 'Leisure', packed: false, essential: false, customAdded: false },
      { id: '5', name: 'Reusable water bottle', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '6', name: 'Sunglasses', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '7', name: 'Map/GPS', category: 'Electronics', packed: false, essential: true, customAdded: false },
      { id: '8', name: 'First aid kit', category: 'Health', packed: false, essential: true, customAdded: false },
      { id: '9', name: 'Blanket', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '10', name: 'Camera', category: 'Electronics', packed: false, essential: false, customAdded: false },
    ],
    templateType: 'packing',
  },
  {
    id: 'default-camping',
    name: 'Camping Trip',
    description: 'Gear up for the great outdoors with this camping list',
    category: 'Adventure',
    isCustom: false,
    tags: ['camping', 'outdoors', 'nature'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Tent', category: 'Equipment', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'Sleeping bag', category: 'Equipment', packed: false, essential: true, customAdded: false },
      { id: '3', name: 'Camping stove', category: 'Equipment', packed: false, essential: false, customAdded: false },
      { id: '4', name: 'Headlamp/flashlight', category: 'Electronics', packed: false, essential: true, customAdded: false },
      { id: '5', name: 'Insect repellent', category: 'Toiletries', packed: false, essential: true, customAdded: false },
      { id: '6', name: 'First aid kit', category: 'Health', packed: false, essential: true, customAdded: false },
      { id: '7', name: 'Reusable water bottle', category: 'Accessories', packed: false, essential: true, customAdded: false },
      { id: '8', name: 'Multi-tool', category: 'Equipment', packed: false, essential: false, customAdded: false },
      { id: '9', name: 'Food supplies', category: 'Food', packed: false, essential: true, customAdded: false },
      { id: '10', name: 'Camping chair', category: 'Equipment', packed: false, essential: false, customAdded: false },
    ],
    templateType: 'packing',
  },
  {
    id: 'default-hiking',
    name: 'Hiking Expedition',
    description: 'Essentials for a safe and enjoyable hiking adventure',
    category: 'Adventure',
    isCustom: false,
    tags: ['hiking', 'trekking', 'mountains'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Hiking boots', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'Daypack', category: 'Accessories', packed: false, essential: true, customAdded: false },
      { id: '3', name: 'Water bottle', category: 'Accessories', packed: false, essential: true, customAdded: false },
      { id: '4', name: 'Trail snacks', category: 'Food', packed: false, essential: true, customAdded: false },
      { id: '5', name: 'Map/compass', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '6', name: 'Rain jacket', category: 'Clothing', packed: false, essential: false, customAdded: false },
      { id: '7', name: 'First aid kit', category: 'Health', packed: false, essential: true, customAdded: false },
      { id: '8', name: 'Sunscreen', category: 'Toiletries', packed: false, essential: false, customAdded: false },
      { id: '9', name: 'Hat', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '10', name: 'Trekking poles', category: 'Equipment', packed: false, essential: false, customAdded: false },
    ],
    templateType: 'packing',
  },
  {
    id: 'default-citybreak',
    name: 'City Break',
    description: 'Pack smart for a quick and stylish city escape',
    category: 'Leisure',
    isCustom: false,
    tags: ['city', 'urban', 'weekend'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Comfortable shoes', category: 'Clothing', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'City map/app', category: 'Electronics', packed: false, essential: false, customAdded: false },
      { id: '3', name: 'Reusable water bottle', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '4', name: 'Travel documents', category: 'Documents', packed: false, essential: true, customAdded: false },
      { id: '5', name: 'Sunglasses', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '6', name: 'Camera', category: 'Electronics', packed: false, essential: false, customAdded: false },
      { id: '7', name: 'Charger/power bank', category: 'Electronics', packed: false, essential: false, customAdded: false },
      { id: '8', name: 'Light jacket', category: 'Clothing', packed: false, essential: false, customAdded: false },
      { id: '9', name: 'Guidebook', category: 'Leisure', packed: false, essential: false, customAdded: false },
      { id: '10', name: 'Day bag', category: 'Accessories', packed: false, essential: false, customAdded: false },
    ],
    templateType: 'packing',
  },
  {
    id: 'default-international',
    name: 'International Travel',
    description: 'Don’t forget these essentials for your next international trip',
    category: 'Leisure',
    isCustom: false,
    tags: ['international', 'abroad', 'passport'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Passport', category: 'Documents', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'Travel adapter', category: 'Electronics', packed: false, essential: true, customAdded: false },
      { id: '3', name: 'Currency', category: 'Accessories', packed: false, essential: true, customAdded: false },
      { id: '4', name: 'Travel insurance', category: 'Documents', packed: false, essential: true, customAdded: false },
      { id: '5', name: 'Comfortable shoes', category: 'Clothing', packed: false, essential: false, customAdded: false },
      { id: '6', name: 'Reusable water bottle', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '7', name: 'Sunscreen', category: 'Toiletries', packed: false, essential: false, customAdded: false },
      { id: '8', name: 'Guidebook', category: 'Leisure', packed: false, essential: false, customAdded: false },
      { id: '9', name: 'Camera', category: 'Electronics', packed: false, essential: false, customAdded: false },
      { id: '10', name: 'Travel pillow', category: 'Accessories', packed: false, essential: false, customAdded: false },
    ],
    templateType: 'packing',
  },
  {
    id: 'default-photo',
    name: 'Photography Trip',
    description: 'Everything a photographer needs for travel',
    category: 'Leisure',
    isCustom: false,
    tags: ['photography', 'camera', 'gear'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Camera', category: 'Electronics', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'Lenses', category: 'Electronics', packed: false, essential: true, customAdded: false },
      { id: '3', name: 'Tripod', category: 'Equipment', packed: false, essential: false, customAdded: false },
      { id: '4', name: 'Memory cards', category: 'Electronics', packed: false, essential: true, customAdded: false },
      { id: '5', name: 'Camera bag', category: 'Accessories', packed: false, essential: true, customAdded: false },
      { id: '6', name: 'Lens cleaning kit', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '7', name: 'Laptop/tablet', category: 'Electronics', packed: false, essential: false, customAdded: false },
      { id: '8', name: 'Power bank', category: 'Electronics', packed: false, essential: false, customAdded: false },
      { id: '9', name: 'Weather protection for gear', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '10', name: 'Notebook', category: 'Leisure', packed: false, essential: false, customAdded: false },
    ],
    templateType: 'packing',
  },
  {
    id: 'default-festival',
    name: 'Festival/Concert Weekend',
    description: 'Be ready for music, fun, and crowds',
    category: 'Leisure',
    isCustom: false,
    tags: ['festival', 'concert', 'music'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: '1', name: 'Festival tickets', category: 'Documents', packed: false, essential: true, customAdded: false },
      { id: '2', name: 'Earplugs', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '3', name: 'Portable charger', category: 'Electronics', packed: false, essential: true, customAdded: false },
      { id: '4', name: 'Reusable water bottle', category: 'Accessories', packed: false, essential: true, customAdded: false },
      { id: '5', name: 'Rain poncho', category: 'Clothing', packed: false, essential: false, customAdded: false },
      { id: '6', name: 'Sunscreen', category: 'Toiletries', packed: false, essential: false, customAdded: false },
      { id: '7', name: 'Snacks', category: 'Food', packed: false, essential: false, customAdded: false },
      { id: '8', name: 'Sunglasses', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '9', name: 'Hat', category: 'Accessories', packed: false, essential: false, customAdded: false },
      { id: '10', name: 'Small backpack', category: 'Accessories', packed: false, essential: false, customAdded: false },
    ],
    templateType: 'packing',
  },
];

// Add itinerary templates as packing templates with templateType: 'itinerary' and items: []
const itineraryTemplatesAsPacking: any[] = mockItineraries.map((itinerary, idx) => ({
  id: `itinerary-template-${idx + 1}`,
  name: itinerary.tripName,
  description: `Sample itinerary for ${itinerary.destination}`,
  category: 'Itinerary',
  isCustom: false,
  tags: [itinerary.destination.toLowerCase(), 'itinerary', 'template'],
  usageCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [], // So UI doesn't break
  templateType: 'itinerary',
  // Itinerary-specific fields:
  destination: itinerary.destination,
  startDate: itinerary.startDate,
  endDate: itinerary.endDate,
  days: itinerary.days,
}));

// Merge into templates
export const allTemplates = [
  ...defaultTemplates,
  ...itineraryTemplatesAsPacking,
];

// Utility to generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export interface TemplateState {
  templates: PackingTemplate[];
  addTemplate: (templateData: PackingTemplate) => void;
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

export const useTemplateStore = create<TemplateState>()((set, get) => ({
  templates: allTemplates,

  addTemplate: (templateData: PackingTemplate) => {
    const newTemplate: PackingTemplate = {
      ...templateData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      isCustom: true,
    };
    set((state: TemplateState) => ({ templates: [newTemplate, ...state.templates] }));
  },
  updateTemplate: (id: string, updates: Partial<PackingTemplate>) => {
    set((state: TemplateState) => ({
      templates: state.templates.map((template: PackingTemplate) =>
        template.id === id
          ? { ...template, ...updates, updatedAt: new Date().toISOString() }
          : template
      ),
    }));
  },
  deleteTemplate: (id: string) => {
    set((state: TemplateState) => ({
      templates: state.templates.filter((template: PackingTemplate) => template.id !== id),
    }));
  },
  getTemplate: (id: string) => {
    return get().templates.find((template: PackingTemplate) => template.id === id);
  },
  getTemplatesByCategory: (category: string) => {
    return get().templates.filter((template: PackingTemplate) => template.category === category);
  },
  getCustomTemplates: () => {
    return get().templates.filter((template: PackingTemplate) => template.isCustom);
  },
  duplicateTemplate: (id: string, newName: string) => {
    const template = get().templates.find((t: PackingTemplate) => t.id === id);
    if (template) {
      const newTemplate: PackingTemplate = {
        ...template,
        id: generateId(),
        name: newName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        isCustom: true,
      };
      set((state: TemplateState) => ({ templates: [newTemplate, ...state.templates] }));
    }
  },
  incrementUsage: (id: string) => {
    set((state: TemplateState) => ({
      templates: state.templates.map((template: PackingTemplate) =>
        template.id === id
          ? { ...template, usageCount: (template.usageCount || 0) + 1, updatedAt: new Date().toISOString() }
          : template
      ),
    }));
  },
  rateTemplate: (id: string, rating: number) => {
    set((state: TemplateState) => ({
      templates: state.templates.map((template: PackingTemplate) =>
        template.id === id
          ? { ...template, rating, updatedAt: new Date().toISOString() }
          : template
      ),
    }));
  },
  importTemplate: (template: PackingTemplate) => {
    const newTemplate: PackingTemplate = {
      ...template,
      id: generateId(),
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state: TemplateState) => ({ templates: [newTemplate, ...state.templates] }));
  },
  exportTemplate: (id: string) => {
    return get().templates.find((template: PackingTemplate) => template.id === id) || null;
  },
}));