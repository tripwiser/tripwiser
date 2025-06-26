import { PackingTemplate, ActivityType, ClimateType, Trip, PackingItem } from '../types';
import { differenceInDays } from 'date-fns';

export const packingTemplates: PackingTemplate[] = [
  {
    category: 'Clothing & Footwear',
    items: [
      // Universal essentials - everyone needs these
      { name: 'Underwear', essential: true, activities: [], climate: [] },
      { name: 'Socks', essential: true, activities: [], climate: [] },
      { name: 'T-shirts/Casual Tops', essential: true, activities: [], climate: [] },
      { name: 'Comfortable Pants/Jeans', essential: true, activities: [], climate: [] },
      { name: 'Sleepwear/Pajamas', essential: true, activities: [], climate: [] },
      
      // Climate-specific clothing
      { name: 'Light Cardigan/Sweater', essential: false, activities: [], climate: ['temperate', 'cold'] },
      { name: 'Warm Winter Jacket', essential: true, activities: [], climate: ['cold'] },
      { name: 'Casual Shorts', essential: true, activities: [], climate: ['tropical', 'mediterranean'] },
      { name: 'Summer Dress/Light Clothing', essential: false, activities: [], climate: ['tropical', 'mediterranean'] },
      { name: 'Long Pants (Warm Weather)', essential: false, activities: [], climate: ['tropical'] },
      
      // Activity-specific clothing
      { name: 'Business Suit/Formal Outfit', essential: true, activities: ['business'], climate: [], businessTrip: true },
      { name: 'Dress Shirts (3-4)', essential: true, activities: ['business'], climate: [], businessTrip: true },
      { name: 'Business Ties', essential: false, activities: ['business'], climate: [], businessTrip: true },
      { name: 'Cocktail/Evening Dress', essential: false, activities: ['formal-events', 'nightlife'], climate: [] },
      { name: 'Nice Shirt for Going Out', essential: false, activities: ['nightlife'], climate: [] },
      { name: 'Swimsuit/Bathing Suit', essential: true, activities: ['beach'], climate: [] },
      { name: 'Beach Cover-up', essential: false, activities: ['beach'], climate: [] },
      { name: 'Quick-dry Shorts', essential: true, activities: ['beach', 'outdoor-sports'], climate: [] },
      { name: 'Hiking Pants/Leggings', essential: true, activities: ['hiking'], climate: [] },
      { name: 'Moisture-wicking T-shirts', essential: true, activities: ['hiking', 'outdoor-sports'], climate: [] },
      { name: 'Thermal Base Layers', essential: true, activities: ['winter-sports'], climate: ['cold'] },
      { name: 'Ski/Snowboard Jacket', essential: true, activities: ['winter-sports'], climate: ['cold'] },
      { name: 'Ski/Snowboard Pants', essential: true, activities: ['winter-sports'], climate: ['cold'] },
      { name: 'Cultural Appropriate Clothing', essential: true, activities: ['cultural-visits'], climate: [] },
      { name: 'Camera Vest/Utility Clothing', essential: false, activities: ['photography'], climate: [] },
      
      // Footwear (moved from separate category)
      { name: 'Comfortable Walking Shoes', essential: true, activities: ['city-sightseeing'], climate: [] },
      { name: 'Athletic/Running Shoes', essential: false, activities: ['outdoor-sports'], climate: [] },
      { name: 'Hiking Boots', essential: true, activities: ['hiking'], climate: [] },
      { name: 'Sandals/Flip-flops', essential: true, activities: ['beach'], climate: ['tropical', 'mediterranean'] },
      { name: 'Water Shoes', essential: false, activities: ['beach', 'outdoor-sports'], climate: [] },
      { name: 'Dress Shoes', essential: true, activities: ['business', 'formal-events'], climate: [] },
      { name: 'Ski/Snowboard Boots', essential: true, activities: ['winter-sports'], climate: ['cold'] },
      { name: 'Comfortable Loafers', essential: false, activities: ['cultural-visits'], climate: [] },
      { name: 'Camping/Outdoor Boots', essential: true, activities: ['camping'], climate: [] },
    ],
  },
  {
    category: 'Weather Protection',
    items: [
      { name: 'Rain Jacket/Poncho', essential: false, activities: ['hiking', 'city-sightseeing'], climate: ['temperate'] },
      { name: 'Umbrella', essential: false, activities: [], climate: ['temperate'] },
      { name: 'Sun Hat/Cap', essential: true, activities: ['beach', 'hiking'], climate: ['tropical', 'mediterranean', 'arid'] },
      { name: 'Sunglasses', essential: true, activities: ['beach', 'hiking', 'city-sightseeing'], climate: ['tropical', 'mediterranean', 'arid'] },
      { name: 'Winter Hat/Beanie', essential: true, activities: [], climate: ['cold'] },
      { name: 'Warm Gloves', essential: true, activities: [], climate: ['cold'] },
      { name: 'Scarf', essential: false, activities: [], climate: ['cold'] },
    ],
  },
  {
    category: 'Healthcare',
    items: [
      // Health and medical items
      { name: 'Personal Medications', essential: true, activities: [], climate: [] },
      { name: 'First Aid Kit', essential: false, activities: ['hiking', 'camping', 'outdoor-sports'], climate: [] },
      { name: 'Sunscreen (SPF 30+)', essential: true, activities: ['beach', 'hiking', 'outdoor-sports'], climate: ['tropical', 'mediterranean', 'arid'] },
      { name: 'After-sun Lotion/Aloe', essential: false, activities: ['beach'], climate: ['tropical', 'mediterranean'] },
      { name: 'Lip Balm with SPF', essential: false, activities: ['hiking', 'winter-sports'], climate: ['cold', 'arid'] },
      { name: 'Insect Repellent', essential: true, activities: ['camping', 'hiking'], climate: ['tropical'] },
      { name: 'Anti-malaria Medication', essential: false, activities: [], climate: ['tropical'] },
      { name: 'Athletic Tape/Blister Pads', essential: false, activities: ['hiking', 'outdoor-sports'], climate: [] },
      { name: 'Electrolyte Supplements', essential: false, activities: ['outdoor-sports', 'hiking'], climate: [] },
      { name: 'Motion Sickness Pills', essential: false, activities: [], climate: [] },
    ],
  },
  {
    category: 'Beauty & Toiletries',
    items: [
      // Universal personal care items
      { name: 'Toothbrush & Toothpaste', essential: true, activities: [], climate: [] },
      { name: 'Shampoo & Conditioner', essential: true, activities: [], climate: [] },
      { name: 'Body Wash/Soap', essential: true, activities: [], climate: [] },
      { name: 'Deodorant/Antiperspirant', essential: true, activities: [], climate: [] },
      { name: 'Basic Skincare Routine', essential: false, activities: [], climate: [] },
      { name: 'Heavy-duty Moisturizer', essential: false, activities: [], climate: ['cold', 'arid'] },
      
      // Female-specific items
      { name: 'Makeup & Cosmetics', essential: false, activities: ['formal-events', 'nightlife', 'business'], climate: [], gender: 'female' },
      { name: 'Hair Styling Tools & Products', essential: false, activities: ['formal-events', 'business'], climate: [], gender: 'female' },
      { name: 'Jewelry & Accessories', essential: false, activities: ['formal-events', 'nightlife'], climate: [], gender: 'female' },
      { name: 'Feminine Hygiene Products', essential: true, activities: [], climate: [], gender: 'female' },
      { name: 'Hair Ties & Clips', essential: false, activities: ['outdoor-sports', 'hiking'], climate: [], gender: 'female' },
      
      // Male-specific items
      { name: 'Razor & Shaving Cream', essential: true, activities: ['business', 'formal-events'], climate: [], gender: 'male' },
      { name: 'Aftershave/Cologne', essential: false, activities: ['formal-events', 'nightlife'], climate: [], gender: 'male' },
      { name: 'Hair Styling Products', essential: false, activities: ['business', 'formal-events'], climate: [], gender: 'male' },
    ],
  },
  {
    category: 'Technology & Electronics',
    items: [
      // Universal tech
      { name: 'Smartphone Charger', essential: true, activities: [], climate: [] },
      { name: 'Power Bank/Portable Charger', essential: false, activities: ['hiking', 'city-sightseeing', 'photography'], climate: [] },
      { name: 'Universal Power Adapter', essential: false, activities: [], climate: [] },
      { name: 'Headphones/Earbuds', essential: false, activities: [], climate: [] },
      
      // Business tech
      { name: 'Laptop + Charger', essential: true, activities: ['business'], climate: [], businessTrip: true },
      { name: 'Work Phone/Hotspot', essential: false, activities: ['business'], climate: [], businessTrip: true },
      { name: 'HDMI Cable/Adapters', essential: false, activities: ['business'], climate: [], businessTrip: true },
      { name: 'Business Cards', essential: false, activities: ['business'], climate: [], businessTrip: true },
      
      // Photography tech
      { name: 'Camera + Extra Batteries', essential: true, activities: ['photography'], climate: [] },
      { name: 'Camera Lenses', essential: false, activities: ['photography'], climate: [] },
      { name: 'Tripod', essential: false, activities: ['photography'], climate: [] },
      { name: 'Memory Cards', essential: true, activities: ['photography'], climate: [] },
      
      // Adventure tech
      { name: 'Action Camera (GoPro)', essential: false, activities: ['outdoor-sports', 'winter-sports'], climate: [] },
      { name: 'GPS Device/Watch', essential: false, activities: ['hiking', 'outdoor-sports'], climate: [] },
      { name: 'Waterproof Phone Case', essential: false, activities: ['beach', 'outdoor-sports'], climate: [] },
    ],
  },
  {
    category: 'Documents & Money',
    items: [
      { name: 'Passport/ID', essential: true, activities: [], climate: [] },
      { name: 'Travel Insurance Documents', essential: false, activities: [], climate: [] },
      { name: 'Flight/Train Tickets', essential: true, activities: [], climate: [] },
      { name: 'Hotel Reservations', essential: true, activities: [], climate: [] },
      { name: 'Emergency Contact Information', essential: true, activities: [], climate: [] },
      { name: 'Credit Cards + Backup Card', essential: true, activities: [], climate: [] },
      { name: 'Cash in Local Currency', essential: false, activities: [], climate: [] },
      { name: 'Visa/Entry Documents', essential: false, activities: [], climate: [] },
      { name: 'Vaccination Records', essential: false, activities: [], climate: ['tropical'] },
      { name: 'Travel Itinerary', essential: false, activities: [], climate: [] },
    ],
  },
  {
    category: 'Adventure & Sports Gear',
    items: [
      // Hiking/Outdoor
      { name: 'Daypack/Backpack', essential: true, activities: ['hiking', 'city-sightseeing'], climate: [] },
      { name: 'Water Bottle/Hydration System', essential: true, activities: ['hiking', 'outdoor-sports'], climate: [] },
      { name: 'Hiking Poles', essential: false, activities: ['hiking'], climate: [] },
      { name: 'Headlamp/Flashlight', essential: true, activities: ['hiking', 'camping'], climate: [] },
      { name: 'Multi-tool/Swiss Army Knife', essential: false, activities: ['hiking', 'camping'], climate: [] },
      
      // Beach/Water sports
      { name: 'Beach Towel', essential: true, activities: ['beach'], climate: [] },
      { name: 'Beach Umbrella/Tent', essential: false, activities: ['beach'], climate: [] },
      { name: 'Snorkeling Gear', essential: false, activities: ['beach'], climate: [] },
      { name: 'Waterproof Bag', essential: false, activities: ['beach', 'outdoor-sports'], climate: [] },
      
      // Winter sports
      { name: 'Ski/Snowboard Equipment', essential: false, activities: ['winter-sports'], climate: ['cold'] },
      { name: 'Ski Goggles', essential: true, activities: ['winter-sports'], climate: ['cold'] },
      { name: 'Hand/Foot Warmers', essential: false, activities: ['winter-sports'], climate: ['cold'] },
      
      // Camping
      { name: 'Tent + Sleeping Bag', essential: true, activities: ['camping'], climate: [] },
      { name: 'Camping Stove + Fuel', essential: true, activities: ['camping'], climate: [] },
      { name: 'Camping Cookware', essential: true, activities: ['camping'], climate: [] },
      { name: 'Cooler/Food Storage', essential: false, activities: ['camping'], climate: [] },
    ],
  },
  {
    category: 'Convenience & Comfort',
    items: [
      { name: 'Travel Pillow', essential: false, activities: [], climate: [] },
      { name: 'Eye Mask + Earplugs', essential: false, activities: [], climate: [] },
      { name: 'Reusable Shopping Bag', essential: false, activities: ['shopping'], climate: [] },
      { name: 'Laundry Bag', essential: false, activities: [], climate: [] },
      { name: 'Luggage Locks', essential: false, activities: [], climate: [] },
      { name: 'Travel-size Laundry Detergent', essential: false, activities: [], climate: [] },
      { name: 'Snacks for Travel', essential: false, activities: ['hiking', 'outdoor-sports'], climate: [] },
      { name: 'Entertainment (Books/Tablet)', essential: false, activities: [], climate: [] },
      { name: 'Travel Journal', essential: false, activities: [], climate: [] },
      { name: 'Gifts/Souvenirs Budget', essential: false, activities: ['cultural-visits', 'shopping'], climate: [] },
    ],
  },
];

// Enhanced climate determination with more destinations
function determineClimate(destination: string): ClimateType {
  const dest = destination.toLowerCase();
  
  // Tropical destinations
  if (dest.includes('thailand') || dest.includes('bali') || dest.includes('hawaii') || 
      dest.includes('caribbean') || dest.includes('jamaica') || dest.includes('costa rica') ||
      dest.includes('philippines') || dest.includes('singapore') || dest.includes('malaysia') ||
      dest.includes('indonesia') || dest.includes('vietnam') || dest.includes('brazil') ||
      dest.includes('miami') || dest.includes('cancun') || dest.includes('fiji')) {
    return 'tropical';
  }
  
  // Cold destinations
  if (dest.includes('alaska') || dest.includes('iceland') || dest.includes('norway') || 
      dest.includes('finland') || dest.includes('sweden') || dest.includes('russia') ||
      dest.includes('canada') || dest.includes('antarctica') || dest.includes('greenland') ||
      dest.includes('patagonia') || dest.includes('siberia') || dest.includes('tibet')) {
    return 'cold';
  }
  
  // Arid/Desert destinations
  if (dest.includes('desert') || dest.includes('arizona') || dest.includes('nevada') || 
      dest.includes('sahara') || dest.includes('dubai') || dest.includes('morocco') ||
      dest.includes('egypt') || dest.includes('jordan') || dest.includes('israel') ||
      dest.includes('australia') || dest.includes('new mexico') || dest.includes('chile')) {
    return 'arid';
  }
  
  // Mediterranean destinations
  if (dest.includes('italy') || dest.includes('spain') || dest.includes('greece') || 
      dest.includes('france') || dest.includes('portugal') || dest.includes('croatia') ||
      dest.includes('turkey') || dest.includes('california') || dest.includes('cyprus') ||
      dest.includes('malta') || dest.includes('monaco') || dest.includes('sardinia')) {
    return 'mediterranean';
  }
  
  // Default to temperate for most other destinations
  return 'temperate';
}

// Enhanced quantity calculation based on trip duration, travelers, and gender
function calculateQuantity(itemName: string, tripDuration: number, activities: ActivityType[], climate: ClimateType, travelers: number, genderSplit: string): number {
  let baseQuantity = 1;
  
  // Clothing items need more based on duration
  if (itemName.includes('Underwear') || itemName.includes('Socks')) {
    let quantity = Math.min(Math.ceil(tripDuration * 1.2), 14); // Extra pairs, max 2 weeks worth
    if (travelers > 1 && genderSplit === 'both') quantity = Math.ceil(quantity * 1.3); // Mixed groups need variety
    return quantity;
  }
  
  if (itemName.includes('T-shirt') || itemName.includes('Tops') || itemName.includes('Shirts')) {
    let quantity = Math.min(Math.ceil(tripDuration * 0.7), 10); // Less than one per day
    if (climate === 'tropical') quantity = Math.ceil(quantity * 1.4); // Hot weather = more changes
    if (activities.includes('outdoor-sports')) quantity = Math.ceil(quantity * 1.3); // Active = more changes
    return quantity;
  }
  
  if (itemName.includes('Pants') || itemName.includes('Jeans')) {
    let quantity = Math.min(Math.ceil(tripDuration * 0.3), 4); // Few pairs for most trips
    if (tripDuration > 10) quantity += 1; // Longer trips need extras
    return quantity;
  }
  
  // Gender-specific quantity adjustments
  if (genderSplit === 'female') {
    if (itemName.includes('Dress') || itemName.includes('Skirt')) {
      return Math.min(Math.ceil(tripDuration * 0.4), 5); // More dresses for women
    }
    if (itemName.includes('Shoes') || itemName.includes('Footwear')) {
      return Math.min(Math.ceil(tripDuration * 0.4), 4); // Women often bring more shoe options
    }
  }
  
  if (genderSplit === 'male') {
    if (itemName.includes('Ties') || itemName.includes('Belt')) {
      return Math.min(Math.ceil(tripDuration * 0.3), 3); // Men's formal accessories
    }
  }
  
  // Activity-specific quantities
  if (activities.includes('business') && itemName.includes('Business')) {
    return Math.min(Math.ceil(tripDuration * 0.8), 7); // More business clothes for work trips
  }
  
  if (activities.includes('hiking') && (itemName.includes('Water') || itemName.includes('Snacks'))) {
    return Math.ceil(tripDuration * 0.5); // More supplies for hiking
  }
  
  if (activities.includes('swimming') && itemName.includes('Swimsuit')) {
    return Math.min(Math.ceil(tripDuration * 0.3), 3); // Multiple swimwear options
  }
  
  if (activities.includes('formal-events') && itemName.includes('formal')) {
    return Math.min(Math.ceil(tripDuration * 0.4), 3); // Multiple formal options
  }
  
  // Traveler-based adjustments for shared items
  if (travelers > 2 && (itemName.includes('First Aid') || itemName.includes('Sunscreen') || itemName.includes('Insect Repellent'))) {
    return Math.ceil(travelers * 0.5); // Shared items scale with group size
  }
  
  // Climate-based adjustments
  if (climate === 'cold' && itemName.includes('Layers')) {
    return Math.ceil(tripDuration * 0.6); // Cold weather needs more layers
  }
  
  if (climate === 'tropical' && (itemName.includes('Light') || itemName.includes('Shorts'))) {
    return Math.ceil(tripDuration * 0.8); // Hot weather needs more light clothing
  }
  
  return baseQuantity;
}



// Smart priority scoring system
function calculatePriority(
  item: any, 
  tripTypes: string[], 
  activities: ActivityType[], 
  climate: ClimateType, 
  duration: number,
  travelers: number,
  genderSplit: string,
  additionalInfo: string
): number {
  let score = 0;
  
  // Base essential item score
  if (item.essential) score += 100;
  
  // Trip type matching (check all trip types)
  tripTypes.forEach(tripType => {
    if (item.businessTrip && tripType === 'business') score += 80;
    if (tripType === 'family' && item.name.includes('First Aid')) score += 30;
    if (tripType === 'romantic' && (item.name.includes('Dress') || item.name.includes('Evening') || item.name.includes('formal'))) score += 40;
    if (tripType === 'adventure' && (item.name.includes('Outdoor') || item.name.includes('Hiking') || item.name.includes('Camping'))) score += 50;
    if (tripType === 'wellness' && (item.name.includes('Spa') || item.name.includes('Yoga') || item.name.includes('Meditation'))) score += 40;
    if (tripType === 'cultural' && item.name.includes('Cultural')) score += 40;
    if (tripType === 'backpacking' && (item.name.includes('Backpack') || item.name.includes('Camping') || item.name.includes('Outdoor'))) score += 45;
  });
  
  // Activity matching (stronger scoring)
  const matchingActivities = item.activities.filter((act: ActivityType) => activities.includes(act));
  score += matchingActivities.length * 60;
  
  // Specific activity boosts
  if (activities.includes('swimming') && item.name.includes('Swimsuit')) score += 80;
  if (activities.includes('fine-dining') && (item.name.includes('Dress') || item.name.includes('formal'))) score += 70;
  if (activities.includes('spa-wellness') && item.name.includes('Comfortable')) score += 50;
  if (activities.includes('festivals') && item.name.includes('Comfortable')) score += 40;
  if (activities.includes('museums') && item.name.includes('Walking')) score += 30;
  if (activities.includes('concerts') && item.name.includes('Earplugs')) score += 60;
  if (activities.includes('water-sports') && (item.name.includes('Water') || item.name.includes('Quick-dry'))) score += 70;
  if (activities.includes('cycling') && (item.name.includes('Athletic') || item.name.includes('Helmet'))) score += 60;
  if (activities.includes('golf') && item.name.includes('Golf')) score += 80;
  if (activities.includes('fishing') && item.name.includes('Fishing')) score += 80;
  if (activities.includes('rock-climbing') && (item.name.includes('Climbing') || item.name.includes('Harness'))) score += 80;
  if (activities.includes('safari') && (item.name.includes('Neutral') || item.name.includes('Binoculars'))) score += 70;
  if (activities.includes('wine-tasting') && item.name.includes('Nice')) score += 50;
  if (activities.includes('cooking-classes') && item.name.includes('Apron')) score += 60;
  if (activities.includes('boat-cruise') && (item.name.includes('Seasickness') || item.name.includes('Windbreaker'))) score += 60;
  
  // Climate matching
  if (item.climate.includes(climate)) score += 70;
  
  // Gender-specific scoring
  if (item.gender) {
    if (item.gender === 'female' && (genderSplit === 'female' || genderSplit === 'both')) {
      score += 60; // Boost female items for female/mixed groups
    } else if (item.gender === 'male' && (genderSplit === 'male' || genderSplit === 'both')) {
      score += 60; // Boost male items for male/mixed groups
    } else if (item.gender !== genderSplit && genderSplit !== 'both') {
      score -= 80; // Reduce opposite gender items for single-gender groups
    }
  }
  
  // Additional gender-based item scoring
  if (genderSplit === 'female') {
    if (item.name.includes('Makeup') || item.name.includes('Beauty') || item.name.includes('Hair')) score += 50;
    if (item.name.includes('Dress') || item.name.includes('Skirt')) score += 30;
    if (item.name.includes('Heels') || item.name.includes('Jewelry')) score += 25;
  } else if (genderSplit === 'male') {
    if (item.name.includes('Razor') || item.name.includes('Shaving')) score += 40;
    if (item.name.includes('Ties') || item.name.includes('Cufflinks')) score += 30;
    // Reduce female-specific items for male-only groups
    if (item.name.includes('Makeup') || item.name.includes('Hair accessories')) score -= 50;
  }
  // Mixed groups get balanced scoring with slight boost for versatile items
  if (genderSplit === 'both') {
    if (item.name.includes('Unisex') || item.name.includes('Universal')) score += 20;
  }
  
  // Duration-based scoring
  if (duration > 7 && item.name.includes('Laundry')) score += 40;
  if (duration < 3 && item.name.includes('Snacks')) score -= 20;
  if (duration > 14 && item.name.includes('Medication')) score += 30;
  if (duration <= 2 && item.name.includes('Entertainment')) score -= 30; // Short trips need less entertainment
  if (duration > 10 && (item.name.includes('Extra') || item.name.includes('Backup'))) score += 25;
  
  // Traveler count considerations
  if (travelers > 1 && item.name.includes('First Aid')) score += 25;
  if (travelers === 1 && item.name.includes('Entertainment')) score += 20;
  if (travelers > 3 && item.name.includes('Group')) score += 40;
  if (travelers >= 2 && item.name.includes('Sharing')) score += 30;
  
  // Additional information parsing for specific needs
  const additionalLower = additionalInfo.toLowerCase();
  if (additionalLower.includes('wedding') && (item.name.includes('formal') || item.name.includes('Dress'))) score += 90;
  if (additionalLower.includes('baby') && item.name.includes('Baby')) score += 100;
  if (additionalLower.includes('kids') && item.name.includes('Child')) score += 80;
  if (additionalLower.includes('elderly') && item.name.includes('Comfortable')) score += 60;
  if (additionalLower.includes('medical') && item.name.includes('Medical')) score += 90;
  if (additionalLower.includes('work') && item.name.includes('Business')) score += 70;
  if (additionalLower.includes('cold') && item.name.includes('Warm')) score += 60;
  if (additionalLower.includes('hot') && (item.name.includes('Cool') || item.name.includes('Light'))) score += 60;
  if (additionalLower.includes('rain') && item.name.includes('Rain')) score += 80;
  if (additionalLower.includes('formal') && item.name.includes('formal')) score += 80;
  if (additionalLower.includes('casual') && item.name.includes('Casual')) score += 60;
  
  // Seasonal adjustments based on actual travel dates
  const currentMonth = new Date().getMonth();
  if ((currentMonth >= 5 && currentMonth <= 8) && item.name.includes('Sunscreen')) score += 30; // Summer
  if ((currentMonth >= 11 || currentMonth <= 2) && item.name.includes('Winter')) score += 40; // Winter
  
  return Math.max(0, score); // Ensure non-negative scores
}

export function generatePackingList(trip: Omit<Trip, 'packingList'>): PackingItem[] {
  try {
    // Early return with basic items if trip is invalid
    if (!trip || typeof trip !== 'object') {
      return getBasicFallbackItems();
    }

    const climate = determineClimate(trip.destination || '');
    const activities = (trip.activities as ActivityType[]) || [];
    const duration = trip.duration || 1;
    const genderSplit = (trip as any).genderSplit || 'both';
    const additionalInfo = (trip as any).additionalInfo || '';
    const tripTypes = Array.isArray(trip.tripType) ? trip.tripType : [trip.tripType || 'leisure'];
    
    console.log('Generating packing list for:', {
      destination: trip.destination,
      climate,
      activities,
      duration,
      tripTypes,
      travelers: trip.travelers,
      genderSplit,
      additionalInfo
    });
    
    const items: PackingItem[] = [];
    
    packingTemplates.forEach((template) => {
      if (!template || !template.items) return;
      
      template.items.forEach((templateItem) => {
        if (!templateItem || !templateItem.name) return;
        
        try {
          // Skip obvious mismatches for ski items
          if (templateItem.name && typeof templateItem.name === 'string' && templateItem.name.includes('Ski') && !activities.includes('winter-sports') && climate !== 'cold') {
            return;
          }
          
          // Safe priority calculation
          let priority = 0;
          if (typeof calculatePriority === 'function') {
            try {
              priority = calculatePriority(
                templateItem,
                tripTypes,
                activities,
                climate,
                duration,
                trip.travelers || 1,
                genderSplit,
                additionalInfo
              ) || 0;
            } catch (err) {
              priority = templateItem.essential ? 100 : 0;
            }
          } else {
            priority = templateItem.essential ? 100 : 0;
          }
          
          // Include item only if it has significant relevance
          if (priority > 60) {
            let quantity = 1;
            if (typeof calculateQuantity === 'function') {
              try {
                quantity = calculateQuantity(templateItem.name, duration, activities, climate, trip.travelers || 1, genderSplit) || 1;
              } catch (err) {
                quantity = 1;
              }
            }
            
            let notes;
            if (typeof generateSmartNotes === 'function') {
              try {
                notes = generateSmartNotes(templateItem, trip, climate, activities, genderSplit, additionalInfo);
              } catch (err) {
                notes = undefined;
              }
            }
            
            items.push({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              name: templateItem.name,
              category: template.category,
              packed: false,
              essential: templateItem.essential || priority >= 100,
              customAdded: false,
              quantity,
              notes,
              priorityScore: priority,
            });
          }
        } catch (itemError) {
          // Silent fail for individual items to prevent app crash
        }
      });
    });
    
    // Add items based on additional information parsing
    try {
      const additionalItems = parseAdditionalInfo(additionalInfo, climate, activities, duration);
      items.push(...additionalItems);
    } catch (additionalError) {
      console.warn('Error parsing additional info:', additionalError);
    }
    
    // Sort by priority score (highest first), then by essential status, then by category
    return items
      .filter(item => item && item.name) // Filter out any invalid items
      .sort((a, b) => {
        if (a.essential && !b.essential) return -1;
        if (!a.essential && b.essential) return 1;
        if (a.priorityScore !== b.priorityScore) return (b.priorityScore || 0) - (a.priorityScore || 0);
        return a.category.localeCompare(b.category);
      })
      .slice(0, 100); // Increased limit for more comprehensive lists
  } catch (error) {
    console.error('Error generating packing list:', error);
    return getBasicFallbackItems();
  }
}

// Helper function for fallback items
function getBasicFallbackItems(): PackingItem[] {
  return [
    {
      id: 'fallback-1',
      name: 'Clothing',
      category: 'Clothing & Footwear',
      packed: false,
      essential: true,
      customAdded: false,
      quantity: 1,
      priorityScore: 100,
    },
    {
      id: 'fallback-2',
      name: 'Personal Items',
      category: 'Beauty & Toiletries',
      packed: false,
      essential: true,
      customAdded: false,
      quantity: 1,
      priorityScore: 100,
    },
    {
      id: 'fallback-3',
      name: 'Travel Documents',
      category: 'Documents & Money',
      packed: false,
      essential: true,
      customAdded: false,
      quantity: 1,
      priorityScore: 100,
    }
  ];
}

// Parse additional information to generate specific items
function parseAdditionalInfo(additionalInfo: string, climate: ClimateType, activities: ActivityType[], duration: number): PackingItem[] {
  const items: PackingItem[] = [];
  const info = additionalInfo.toLowerCase();
  
  // Wedding-specific items
  if (info.includes('wedding')) {
    items.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: 'Wedding Gift',
      category: 'Convenience & Comfort',
      packed: false,
      essential: false,
      customAdded: true,
      quantity: 1,
      notes: 'Consider shipping directly to avoid travel hassle',
      priorityScore: 80,
    });
    items.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: 'Formal Wedding Attire',
      category: 'Clothing & Footwear',
      packed: false,
      essential: true,
      customAdded: true,
      quantity: 1,
      notes: 'Check dress code with hosts',
      priorityScore: 100,
    });
  }
  
  // Baby/Kids items
  if (info.includes('baby') || info.includes('infant')) {
    items.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: 'Baby Diapers & Wipes',
      category: 'Healthcare',
      packed: false,
      essential: true,
      customAdded: true,
      quantity: Math.ceil(duration * 8),
      notes: 'Bring extra for travel delays',
      priorityScore: 100,
    });
    items.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: 'Baby Formula/Food',
      category: 'Convenience & Comfort',
      packed: false,
      essential: true,
      customAdded: true,
      quantity: Math.ceil(duration * 3),
      notes: 'Check airline regulations for liquids',
      priorityScore: 100,
    });
  }
  
  if (info.includes('kids') || info.includes('children')) {
    items.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: 'Kids Entertainment (games, tablets)',
      category: 'Convenience & Comfort',
      packed: false,
      essential: false,
      customAdded: true,
      quantity: 2,
      notes: 'Essential for long flights',
      priorityScore: 70,
    });
    items.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: 'Kids Snacks',
      category: 'Convenience & Comfort',
      packed: false,
      essential: true,
      customAdded: true,
      quantity: Math.ceil(duration * 2),
      notes: 'Familiar foods reduce travel stress',
      priorityScore: 80,
    });
  }
  
  // Medical conditions
  if (info.includes('medical') || info.includes('prescription') || info.includes('allergy')) {
    items.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: 'Medical Documentation',
      category: 'Documents & Money',
      packed: false,
      essential: true,
      customAdded: true,
      quantity: 1,
      notes: 'Include prescription letters and emergency contacts',
      priorityScore: 100,
    });
  }
  
  // Work/Conference
  if (info.includes('conference') || info.includes('meeting') || info.includes('presentation')) {
    items.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: 'Business Cards & Materials',
      category: 'Technology & Electronics',
      packed: false,
      essential: true,
      customAdded: true,
      quantity: 1,
      notes: 'Bring extras for networking',
      priorityScore: 90,
    });
  }
  
  return items;
}

// Generate contextual notes for items
function generateSmartNotes(
  item: any, 
  trip: Omit<Trip, 'packingList'>, 
  climate: ClimateType, 
  activities: ActivityType[],
  genderSplit: string,
  additionalInfo: string
): string | undefined {
  const notes: string[] = [];
  
  // Climate-specific notes
  if (climate === 'tropical' && item.name.includes('Sunscreen')) {
    notes.push('SPF 50+ recommended for tropical sun');
  }
  if (climate === 'cold' && item.name.includes('Jacket')) {
    notes.push('Check temperature forecasts for layering');
  }
  if (climate === 'arid' && item.name.includes('Moisturizer')) {
    notes.push('Extra moisturizer needed for dry climate');
  }
  if (climate === 'mediterranean' && item.name.includes('Light')) {
    notes.push('Perfect for warm days, cool evenings');
  }
  
  // Activity-specific notes
  if (activities.includes('hiking') && item.name.includes('Boots')) {
    notes.push('Break in before trip if new');
  }
  if (activities.includes('business') && item.name.includes('Suit')) {
    notes.push('Consider wrinkle-resistant fabrics');
  }
  if (activities.includes('beach') && item.name.includes('Swimwear')) {
    notes.push('Bring backup if planning water activities');
  }
  if (activities.includes('fine-dining') && item.name.includes('Dress')) {
    notes.push('Check restaurant dress codes');
  }
  if (activities.includes('museums') && item.name.includes('Comfortable')) {
    notes.push('Lots of walking expected');
  }
  if (activities.includes('nightlife') && item.name.includes('Going Out')) {
    notes.push('Consider local nightlife culture');
  }
  
  // Gender-specific notes
  if (genderSplit === 'female' && item.name.includes('Shoes')) {
    notes.push('Consider comfort for extended wear');
  }
  if (genderSplit === 'male' && item.name.includes('Business')) {
    notes.push('Classic styles work best');
  }
  if (genderSplit === 'both' && item.name.includes('Shared')) {
    notes.push('Consider bringing extras for group');
  }
  
  // Duration-specific notes
  if (trip.duration > 7 && item.name.includes('Medication')) {
    notes.push('Bring extra for longer trip');
  }
  if (trip.duration < 3 && item.name.includes('Laundry')) {
    notes.push('May not be needed for short trip');
  }
  if (trip.duration > 14 && item.name.includes('Clothing')) {
    notes.push('Consider laundry options at destination');
  }
  
  // Traveler count notes
  if (trip.travelers > 2 && item.name.includes('First Aid')) {
    notes.push('Larger kit recommended for groups');
  }
  if (trip.travelers === 1 && item.name.includes('Safety')) {
    notes.push('Extra important when traveling solo');
  }
  
  // Destination-specific notes
  const dest = trip.destination.toLowerCase();
  if ((dest.includes('europe') || dest.includes('uk')) && item.name.includes('Adapter')) {
    notes.push('Type C/G plugs common in Europe');
  }
  if (dest.includes('asia') && item.name.includes('Cultural')) {
    notes.push('Research local customs and dress codes');
  }
  if (dest.includes('beach') && item.name.includes('Sun')) {
    notes.push('Reapply frequently near water');
  }
  
  // Additional info specific notes
  const addInfo = additionalInfo.toLowerCase();
  if (addInfo.includes('cold') && item.name.includes('Warm')) {
    notes.push('Specified as needed for cold conditions');
  }
  if (addInfo.includes('formal') && item.name.includes('Dress')) {
    notes.push('Formal events mentioned in trip details');
  }
  if (addInfo.includes('medical') && item.name.includes('Medication')) {
    notes.push('Medical needs specified - consult doctor');
  }
  
  return notes.length > 0 ? notes.join('. ') : undefined;
}