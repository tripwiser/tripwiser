// Node.js script to generate packing templates using backend AI
// Run with: node frontend/generateTemplates.ts (after compiling to JS if needed)

const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://10.13.185.144:5000/api/packing/generate';
const today = new Date();
const startDate = today.toISOString();
const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
const createdAt = today.toISOString();
const updatedAt = today.toISOString();

const templateIdeas = [
  {
    id: 'default-cruise',
    name: 'Cruise Vacation',
    description: 'Packing essentials for a relaxing and fun cruise trip',
    category: 'Leisure',
    tags: ['cruise', 'ship', 'ocean', 'relax'],
    destination: 'Caribbean',
    tripType: 'leisure',
  },
  {
    id: 'default-family',
    name: 'Family Holiday',
    description: 'Everything you need for a memorable family getaway',
    category: 'Family',
    tags: ['family', 'kids', 'holiday', 'fun'],
    destination: 'Orlando',
    tripType: 'family',
  },
  {
    id: 'default-solo',
    name: 'Solo Adventure',
    description: 'Essentials for a safe and exciting solo journey',
    category: 'Adventure',
    tags: ['solo', 'adventure', 'explore'],
    destination: 'Thailand',
    tripType: 'adventure',
  },
  {
    id: 'default-roadtrip',
    name: 'Road Trip',
    description: 'Must-haves for a comfortable and fun road trip',
    category: 'Leisure',
    tags: ['roadtrip', 'car', 'drive', 'explore'],
    destination: 'California',
    tripType: 'leisure',
  },
  {
    id: 'default-camping',
    name: 'Camping Trip',
    description: 'Gear up for the great outdoors with this camping list',
    category: 'Adventure',
    tags: ['camping', 'outdoors', 'nature'],
    destination: 'Yosemite',
    tripType: 'adventure',
  },
  {
    id: 'default-hiking',
    name: 'Hiking Expedition',
    description: 'Essentials for a safe and enjoyable hiking adventure',
    category: 'Adventure',
    tags: ['hiking', 'trekking', 'mountains'],
    destination: 'Patagonia',
    tripType: 'adventure',
  },
  {
    id: 'default-citybreak',
    name: 'City Break',
    description: 'Pack smart for a quick and stylish city escape',
    category: 'Leisure',
    tags: ['city', 'urban', 'weekend'],
    destination: 'Paris',
    tripType: 'leisure',
  },
  {
    id: 'default-international',
    name: 'International Travel',
    description: 'Don’t forget these essentials for your next international trip',
    category: 'Leisure',
    tags: ['international', 'abroad', 'passport'],
    destination: 'London',
    tripType: 'leisure',
  },
  {
    id: 'default-photo',
    name: 'Photography Trip',
    description: 'Everything a photographer needs for travel',
    category: 'Leisure',
    tags: ['photography', 'camera', 'gear'],
    destination: 'Iceland',
    tripType: 'leisure',
  },
  {
    id: 'default-festival',
    name: 'Festival/Concert Weekend',
    description: 'Be ready for music, fun, and crowds',
    category: 'Leisure',
    tags: ['festival', 'concert', 'music'],
    destination: 'Coachella',
    tripType: 'leisure',
  },
];

function mapCategory(key: string): string {
  switch (key) {
    case 'clothing': return 'Clothing';
    case 'electronics': return 'Electronics';
    case 'toiletries': return 'Toiletries';
    case 'accessories': return 'Accessories';
    case 'documents': return 'Documents';
    case 'other': return 'Other';
    default: return 'Other';
  }
}

function mapItems(aiData: Record<string, Array<{ itemName: string; quantity?: string | number; notes?: string }>>): any[] {
  const items: any[] = [];
  Object.entries(aiData).forEach(([cat, arr]) => {
    (arr as Array<any>).forEach((item: any, idx: number) => {
      items.push({
        id: `${cat}-${idx + 1}`,
        name: item.itemName,
        category: mapCategory(cat),
        packed: false,
        essential: true,
        customAdded: false,
        quantity: item.quantity ? Number(item.quantity) : 1,
        notes: item.notes || '',
      });
    });
  });
  return items;
}

async function generateTemplates() {
  const results: any[] = [];
  for (const idea of templateIdeas) {
    try {
      const res = await axios.post(API_URL, {
        destination: idea.destination,
        startDate,
        endDate,
        tripType: idea.tripType,
        specialRequests: '',
      });
      const aiData = res.data;
      const items = mapItems(aiData);
      const template = {
        id: idea.id,
        name: idea.name,
        description: idea.description,
        category: idea.category,
        isCustom: false,
        tags: idea.tags,
        usageCount: 0,
        createdAt,
        updatedAt,
        items,
      };
      results.push(template);
      console.log(`Generated: ${idea.name} (${items.length} items)`);
    } catch (err: any) {
      console.error(`Failed to generate for ${idea.name}:`, err.message);
    }
  }
  fs.writeFileSync('frontend/generatedTemplates.json', JSON.stringify(results, null, 2));
  console.log('All templates saved to frontend/generatedTemplates.json');
}

generateTemplates(); 