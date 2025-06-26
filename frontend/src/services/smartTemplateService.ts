import { PackingTemplate } from '../state/templateStore';

interface SmartTemplateParams {
  name: string;
  tripTypes: string[];
  activities: string[];
  climate: string;
  travelGroup?: string[];
  gender?: string;
  lengthOfStay: number;
  travelers: number;
  isPrivate?: boolean;
}

interface PackingItem {
  name: string;
  essential: boolean;
  activities: string[];
  climate: string[];
  businessTrip?: boolean;
}

// Base items that apply to most trips
const baseItems: PackingItem[] = [
  // Essentials
  { name: 'Passport/ID', essential: true, activities: [], climate: [] },
  { name: 'Phone Charger', essential: true, activities: [], climate: [] },
  { name: 'Underwear', essential: true, activities: [], climate: [] },
  { name: 'Socks', essential: true, activities: [], climate: [] },
  { name: 'Toothbrush', essential: true, activities: [], climate: [] },
  { name: 'Toothpaste', essential: true, activities: [], climate: [] },
  { name: 'Deodorant', essential: true, activities: [], climate: [] },
  { name: 'Shampoo', essential: true, activities: [], climate: [] },
  
  // Clothing basics
  { name: 'T-shirts', essential: false, activities: [], climate: ['tropical', 'temperate', 'mediterranean'] },
  { name: 'Jeans/Pants', essential: false, activities: [], climate: ['temperate', 'cold'] },
  { name: 'Shorts', essential: false, activities: ['beach'], climate: ['tropical', 'mediterranean'] },
  { name: 'Sweater/Hoodie', essential: false, activities: [], climate: ['cold', 'temperate'] },
  { name: 'Light Jacket', essential: false, activities: [], climate: ['temperate'] },
  { name: 'Winter Coat', essential: true, activities: [], climate: ['cold'] },
  { name: 'Rain Jacket', essential: false, activities: ['hiking', 'outdoor-sports'], climate: ['temperate'] },
  
  // Activity-specific items
  { name: 'Swimwear', essential: true, activities: ['beach'], climate: ['tropical', 'mediterranean'] },
  { name: 'Beach Towel', essential: false, activities: ['beach'], climate: ['tropical', 'mediterranean'] },
  { name: 'Sunscreen', essential: true, activities: ['beach', 'hiking', 'outdoor-sports'], climate: ['tropical', 'mediterranean', 'arid'] },
  { name: 'Sunglasses', essential: false, activities: ['beach', 'hiking'], climate: ['tropical', 'mediterranean', 'arid'] },
  { name: 'Hiking Boots', essential: true, activities: ['hiking', 'camping'], climate: [] },
  { name: 'Sneakers', essential: false, activities: ['city-sightseeing', 'outdoor-sports'], climate: [] },
  { name: 'Formal Shoes', essential: true, activities: ['business', 'formal-events'], climate: [] },
  { name: 'Sandals', essential: false, activities: ['beach'], climate: ['tropical', 'mediterranean'] },
  
  // Business items
  { name: 'Business Suit', essential: true, activities: ['business', 'formal-events'], climate: [], businessTrip: true },
  { name: 'Dress Shirts', essential: true, activities: ['business', 'formal-events'], climate: [], businessTrip: true },
  { name: 'Ties', essential: false, activities: ['business', 'formal-events'], climate: [], businessTrip: true },
  { name: 'Laptop', essential: true, activities: ['business'], climate: [], businessTrip: true },
  { name: 'Laptop Charger', essential: true, activities: ['business'], climate: [], businessTrip: true },
  { name: 'Business Cards', essential: false, activities: ['business'], climate: [], businessTrip: true },
  
  // Adventure/Outdoor items
  { name: 'Backpack', essential: true, activities: ['hiking', 'camping', 'backpacking'], climate: [] },
  { name: 'Water Bottle', essential: true, activities: ['hiking', 'outdoor-sports', 'camping'], climate: [] },
  { name: 'First Aid Kit', essential: false, activities: ['hiking', 'camping'], climate: [] },
  { name: 'Sleeping Bag', essential: true, activities: ['camping'], climate: [] },
  { name: 'Tent', essential: true, activities: ['camping'], climate: [] },
  { name: 'Headlamp', essential: false, activities: ['camping', 'hiking'], climate: [] },
  
  // Photography
  { name: 'Camera', essential: true, activities: ['photography'], climate: [] },
  { name: 'Camera Battery', essential: true, activities: ['photography'], climate: [] },
  { name: 'Memory Cards', essential: false, activities: ['photography'], climate: [] },
  { name: 'Tripod', essential: false, activities: ['photography'], climate: [] },
  
  // Cold weather specific
  { name: 'Thermal Underwear', essential: true, activities: [], climate: ['cold'] },
  { name: 'Warm Hat', essential: true, activities: [], climate: ['cold'] },
  { name: 'Gloves', essential: true, activities: [], climate: ['cold'] },
  { name: 'Scarf', essential: false, activities: [], climate: ['cold'] },
  { name: 'Snow Boots', essential: true, activities: ['winter-sports'], climate: ['cold'] },
  
  // Hot weather specific
  { name: 'Sun Hat', essential: false, activities: ['beach'], climate: ['tropical', 'arid'] },
  { name: 'Light Linen Clothes', essential: false, activities: [], climate: ['tropical', 'arid'] },
  { name: 'Cooling Towel', essential: false, activities: [], climate: ['arid'] },
  
  // Cultural/Museum visits
  { name: 'Comfortable Walking Shoes', essential: true, activities: ['cultural-visits', 'city-sightseeing'], climate: [] },
  { name: 'Small Bag/Purse', essential: false, activities: ['cultural-visits', 'shopping'], climate: [] },
  
  // Nightlife
  { name: 'Dress/Nice Outfit', essential: true, activities: ['nightlife', 'formal-events'], climate: [] },
  { name: 'Dress Shoes', essential: false, activities: ['nightlife', 'formal-events'], climate: [] },
  
  // Family travel
  { name: 'Snacks', essential: false, activities: [], climate: [] },
  { name: 'Entertainment (books/games)', essential: false, activities: [], climate: [] },
  { name: 'Travel Documents', essential: true, activities: [], climate: [] },
];

export const generateSmartTemplate = async (params: SmartTemplateParams): Promise<PackingTemplate> => {
  const { name, tripTypes, activities, climate, lengthOfStay, travelers } = params;
  
  // Filter items based on parameters
  let relevantItems = baseItems.filter(item => {
    // Include if no specific requirements
    if (item.activities.length === 0 && item.climate.length === 0 && !item.businessTrip) {
      return true;
    }
    
    // Check business trip items
    if (item.businessTrip && tripTypes.includes('business')) {
      return true;
    }
    
    // Check activity match
    if (item.activities.length > 0 && item.activities.some(activity => activities.includes(activity))) {
      return true;
    }
    
    // Check climate match
    if (item.climate.length > 0 && item.climate.includes(climate)) {
      return true;
    }
    
    return false;
  });

  // Adjust quantities based on length of stay
  const adjustQuantity = (baseQty: number) => {
    if (lengthOfStay <= 3) return baseQty;
    if (lengthOfStay <= 7) return Math.ceil(baseQty * 1.5);
    return Math.ceil(baseQty * 2);
  };

  // Create template items with appropriate categories
  const templateItems = relevantItems.map(item => {
    let category = 'General';
    
    if (['Passport/ID', 'Travel Documents', 'Business Cards'].includes(item.name)) {
      category = 'Documents';
    } else if (['Phone Charger', 'Laptop', 'Laptop Charger', 'Camera', 'Camera Battery'].includes(item.name)) {
      category = 'Electronics';
    } else if (['Toothbrush', 'Toothpaste', 'Deodorant', 'Shampoo', 'Sunscreen'].includes(item.name)) {
      category = 'Toiletries';
    } else if (['T-shirts', 'Jeans/Pants', 'Shorts', 'Sweater/Hoodie', 'Business Suit', 'Dress Shirts'].includes(item.name)) {
      category = 'Clothing';
    } else if (['Sneakers', 'Formal Shoes', 'Hiking Boots', 'Sandals'].includes(item.name)) {
      category = 'Footwear';
    } else if (['Backpack', 'Sleeping Bag', 'Tent', 'First Aid Kit'].includes(item.name)) {
      category = 'Outdoor Gear';
    }
    
    return {
      name: item.name,
      category,
      essential: item.essential,
    };
  });

  // Add quantity-based items for longer trips
  if (lengthOfStay > 1) {
    templateItems.push(
      { name: `Underwear (${adjustQuantity(lengthOfStay)} pairs)`, category: 'Clothing', essential: true },
      { name: `Socks (${adjustQuantity(lengthOfStay)} pairs)`, category: 'Clothing', essential: true }
    );
  }

  // Add family-specific items
  if (tripTypes.includes('family')) {
    templateItems.push(
      { name: 'Kids Entertainment', category: 'General', essential: false },
      { name: 'Snacks for Kids', category: 'General', essential: false },
      { name: 'Extra Clothes (kids)', category: 'Clothing', essential: true }
    );
  }

  // Create the template
  const template: PackingTemplate = {
    id: `smart_${Date.now()}`,
    name,
    description: `AI-generated template for ${tripTypes.join(', ')} trips in ${climate} climate (${lengthOfStay} days)`,
    category: tripTypes[0] || 'General',
    items: templateItems,
    isCustom: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
    tags: [...tripTypes, ...activities, climate],
    estimatedWeight: templateItems.length * 0.5, // Rough estimate
    estimatedVolume: templateItems.length * 2, // Rough estimate
  };

  return template;
};