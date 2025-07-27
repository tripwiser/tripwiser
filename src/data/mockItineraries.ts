const today = new Date();
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const mockItineraries = [
  {
    destination: 'Paris',
    tripName: 'Paris Adventure',
    startDate: today.toISOString(),
    endDate: addDays(today, 3).toISOString(),
    days: [
      {
        date: today.toISOString(),
        label: 'MON',
        items: [
          { time: '9:00am', title: 'Eiffel Tower Visit', location: 'Eiffel Tower', notes: 'Arrive early to avoid crowds' },
          { time: '12:00pm', title: 'Lunch at Café de Flore', location: 'Saint-Germain', notes: 'Classic Parisian lunch' },
          { time: '2:00pm', title: 'Louvre Museum', location: 'Louvre', notes: 'See the Mona Lisa' },
        ]
      },
      {
        date: addDays(today, 1).toISOString(),
        label: 'TUE',
        items: [
          { time: '10:00am', title: 'Montmartre Walk', location: 'Montmartre', notes: 'Explore artists and Sacré-Cœur' },
          { time: '1:00pm', title: 'Picnic at Luxembourg Gardens', location: 'Luxembourg Gardens', notes: 'Relax and people-watch' },
          { time: '4:00pm', title: 'Seine River Cruise', location: 'Seine River', notes: 'Evening boat ride' },
        ]
      },
      {
        date: addDays(today, 2).toISOString(),
        label: 'WED',
        items: [
          { time: '9:30am', title: 'Notre-Dame Cathedral', location: 'Île de la Cité', notes: 'Historic cathedral' },
          { time: '12:00pm', title: 'Shopping on Champs-Élysées', location: 'Champs-Élysées', notes: 'Famous avenue' },
          { time: '7:00pm', title: 'Dinner in Le Marais', location: 'Le Marais', notes: 'Trendy restaurants' },
        ]
      },
    ]
  },
  {
    destination: 'Tokyo',
    tripName: 'Tokyo Explorer',
    startDate: today.toISOString(),
    endDate: addDays(today, 4).toISOString(),
    days: [
      {
        date: today.toISOString(),
        label: 'MON',
        items: [
          { time: '8:00am', title: 'Tsukiji Fish Market', location: 'Tsukiji', notes: 'Fresh sushi breakfast' },
          { time: '11:00am', title: 'Asakusa & Senso-ji', location: 'Asakusa', notes: 'Historic temple' },
          { time: '3:00pm', title: 'Akihabara Electronics', location: 'Akihabara', notes: 'Gadgets and anime' },
        ]
      },
      {
        date: addDays(today, 1).toISOString(),
        label: 'TUE',
        items: [
          { time: '9:00am', title: 'Meiji Shrine', location: 'Harajuku', notes: 'Peaceful forest walk' },
          { time: '12:00pm', title: 'Takeshita Street', location: 'Harajuku', notes: 'Trendy shopping' },
          { time: '6:00pm', title: 'Shibuya Crossing', location: 'Shibuya', notes: 'Iconic scramble' },
        ]
      },
      {
        date: addDays(today, 2).toISOString(),
        label: 'WED',
        items: [
          { time: '10:00am', title: 'Ueno Park & Zoo', location: 'Ueno', notes: 'Cherry blossoms in spring' },
          { time: '2:00pm', title: 'Tokyo Skytree', location: 'Sumida', notes: 'City views' },
          { time: '7:00pm', title: 'Izakaya Dinner', location: 'Shinjuku', notes: 'Local food and drinks' },
        ]
      },
      {
        date: addDays(today, 3).toISOString(),
        label: 'THU',
        items: [
          { time: '9:00am', title: 'Ghibli Museum', location: 'Mitaka', notes: 'Animation magic' },
          { time: '1:00pm', title: 'Odaiba', location: 'Odaiba', notes: 'Futuristic entertainment' },
        ]
      },
    ]
  },
  {
    destination: 'New York',
    tripName: 'NYC Highlights',
    startDate: today.toISOString(),
    endDate: addDays(today, 3).toISOString(),
    days: [
      {
        date: today.toISOString(),
        label: 'MON',
        items: [
          { time: '9:00am', title: 'Central Park Walk', location: 'Central Park', notes: 'Morning stroll' },
          { time: '11:00am', title: 'Metropolitan Museum of Art', location: 'Upper East Side', notes: 'World-class art' },
          { time: '2:00pm', title: 'Lunch at Katz’s Deli', location: 'Lower East Side', notes: 'Famous sandwiches' },
        ]
      },
      {
        date: addDays(today, 1).toISOString(),
        label: 'TUE',
        items: [
          { time: '10:00am', title: 'Statue of Liberty', location: 'Liberty Island', notes: 'Ferry ride' },
          { time: '1:00pm', title: 'Wall Street', location: 'Financial District', notes: 'Historic NYC' },
          { time: '4:00pm', title: '9/11 Memorial', location: 'World Trade Center', notes: 'Reflective visit' },
        ]
      },
      {
        date: addDays(today, 2).toISOString(),
        label: 'WED',
        items: [
          { time: '9:00am', title: 'Empire State Building', location: 'Midtown', notes: 'City views' },
          { time: '12:00pm', title: 'Broadway Show', location: 'Theater District', notes: 'Book tickets in advance' },
          { time: '7:00pm', title: 'Times Square', location: 'Times Square', notes: 'Neon lights' },
        ]
      },
    ]
  },
  {
    destination: 'Rome',
    tripName: 'Roman Holiday',
    startDate: today.toISOString(),
    endDate: addDays(today, 4).toISOString(),
    days: [
      {
        date: today.toISOString(),
        label: 'MON',
        items: [
          { time: '9:00am', title: 'Colosseum Tour', location: 'Colosseum', notes: 'Ancient history' },
          { time: '12:00pm', title: 'Roman Forum', location: 'Forum', notes: 'Ruins walk' },
          { time: '3:00pm', title: 'Trevi Fountain', location: 'Trevi', notes: 'Toss a coin' },
        ]
      },
      {
        date: addDays(today, 1).toISOString(),
        label: 'TUE',
        items: [
          { time: '10:00am', title: 'Vatican Museums', location: 'Vatican City', notes: 'Sistine Chapel' },
          { time: '1:00pm', title: 'St. Peter’s Basilica', location: 'Vatican City', notes: 'Climb the dome' },
          { time: '5:00pm', title: 'Gelato break', location: 'Trastevere', notes: 'Best gelato in Rome' },
        ]
      },
      {
        date: addDays(today, 2).toISOString(),
        label: 'WED',
        items: [
          { time: '9:00am', title: 'Pantheon', location: 'Pantheon', notes: 'Architectural marvel' },
          { time: '12:00pm', title: 'Piazza Navona', location: 'Navona', notes: 'Street artists' },
          { time: '7:00pm', title: 'Dinner in Trastevere', location: 'Trastevere', notes: 'Local cuisine' },
        ]
      },
      {
        date: addDays(today, 3).toISOString(),
        label: 'THU',
        items: [
          { time: '10:00am', title: 'Borghese Gallery', location: 'Villa Borghese', notes: 'Art collection' },
          { time: '2:00pm', title: 'Shopping on Via del Corso', location: 'Via del Corso', notes: 'Fashion and souvenirs' },
        ]
      },
    ]
  },
  {
    destination: 'Barcelona',
    tripName: 'Barcelona Discovery',
    startDate: today.toISOString(),
    endDate: addDays(today, 3).toISOString(),
    days: [
      {
        date: today.toISOString(),
        label: 'MON',
        items: [
          { time: '9:00am', title: 'Sagrada Familia', location: 'Eixample', notes: 'Gaudí masterpiece' },
          { time: '12:00pm', title: 'Passeig de Gràcia', location: 'Gràcia', notes: 'Modernist buildings' },
          { time: '3:00pm', title: 'Park Güell', location: 'Gràcia', notes: 'Colorful mosaics' },
        ]
      },
      {
        date: addDays(today, 1).toISOString(),
        label: 'TUE',
        items: [
          { time: '10:00am', title: 'La Rambla', location: 'Ciutat Vella', notes: 'Street performers' },
          { time: '1:00pm', title: 'Gothic Quarter', location: 'Barri Gòtic', notes: 'Medieval streets' },
          { time: '5:00pm', title: 'Beach time', location: 'Barceloneta', notes: 'Relax by the sea' },
        ]
      },
      {
        date: addDays(today, 2).toISOString(),
        label: 'WED',
        items: [
          { time: '9:00am', title: 'Picasso Museum', location: 'El Born', notes: 'Art and culture' },
          { time: '12:00pm', title: 'Tapas lunch', location: 'El Born', notes: 'Local cuisine' },
          { time: '3:00pm', title: 'Magic Fountain Show', location: 'Montjuïc', notes: 'Evening light show' },
        ]
      },
    ]
  },
  {
    destination: 'Bangkok',
    tripName: 'Bangkok Adventure',
    startDate: today.toISOString(),
    endDate: addDays(today, 4).toISOString(),
    days: [
      {
        date: today.toISOString(),
        label: 'MON',
        items: [
          { time: '8:00am', title: 'Grand Palace', location: 'Phra Nakhon', notes: 'Royal history' },
          { time: '11:00am', title: 'Wat Pho', location: 'Phra Nakhon', notes: 'Reclining Buddha' },
          { time: '2:00pm', title: 'Chao Phraya River Cruise', location: 'Chao Phraya', notes: 'City views' },
        ]
      },
      {
        date: addDays(today, 1).toISOString(),
        label: 'TUE',
        items: [
          { time: '9:00am', title: 'Chatuchak Market', location: 'Chatuchak', notes: 'Shopping and food' },
          { time: '1:00pm', title: 'Jim Thompson House', location: 'Pathum Wan', notes: 'Thai silk history' },
          { time: '6:00pm', title: 'Asiatique Night Market', location: 'Bang Kho Laem', notes: 'Riverside dining' },
        ]
      },
      {
        date: addDays(today, 2).toISOString(),
        label: 'WED',
        items: [
          { time: '10:00am', title: 'Lumpini Park', location: 'Pathum Wan', notes: 'Morning walk' },
          { time: '12:00pm', title: 'MBK Center', location: 'Pathum Wan', notes: 'Shopping mall' },
          { time: '4:00pm', title: 'Street food tour', location: 'Sukhumvit', notes: 'Local flavors' },
        ]
      },
      {
        date: addDays(today, 3).toISOString(),
        label: 'THU',
        items: [
          { time: '9:00am', title: 'Wat Arun', location: 'Thonburi', notes: 'Temple of Dawn' },
          { time: '1:00pm', title: 'Spa massage', location: 'Siam', notes: 'Relax and unwind' },
        ]
      },
    ]
  },
  {
    destination: 'Sydney',
    tripName: 'Sydney Sights',
    startDate: today.toISOString(),
    endDate: addDays(today, 3).toISOString(),
    days: [
      {
        date: today.toISOString(),
        label: 'MON',
        items: [
          { time: '9:00am', title: 'Sydney Opera House', location: 'Circular Quay', notes: 'Iconic landmark' },
          { time: '11:00am', title: 'Harbour Bridge Walk', location: 'The Rocks', notes: 'Great views' },
          { time: '2:00pm', title: 'The Rocks Market', location: 'The Rocks', notes: 'Local crafts' },
        ]
      },
      {
        date: addDays(today, 1).toISOString(),
        label: 'TUE',
        items: [
          { time: '10:00am', title: 'Bondi Beach', location: 'Bondi', notes: 'Surf and sun' },
          { time: '1:00pm', title: 'Coastal Walk', location: 'Bondi to Coogee', notes: 'Scenic hike' },
          { time: '5:00pm', title: 'Darling Harbour', location: 'Darling Harbour', notes: 'Evening stroll' },
        ]
      },
      {
        date: addDays(today, 2).toISOString(),
        label: 'WED',
        items: [
          { time: '9:00am', title: 'Taronga Zoo', location: 'Mosman', notes: 'Australian wildlife' },
          { time: '12:00pm', title: 'Art Gallery of NSW', location: 'The Domain', notes: 'Australian art' },
          { time: '3:00pm', title: 'Royal Botanic Garden', location: 'Sydney', notes: 'Relaxing gardens' },
        ]
      },
    ]
  },
  {
    destination: 'Istanbul',
    tripName: 'Istanbul Journey',
    startDate: today.toISOString(),
    endDate: addDays(today, 4).toISOString(),
    days: [
      {
        date: today.toISOString(),
        label: 'MON',
        items: [
          { time: '9:00am', title: 'Hagia Sophia', location: 'Sultanahmet', notes: 'Historic mosque' },
          { time: '11:00am', title: 'Blue Mosque', location: 'Sultanahmet', notes: 'Stunning architecture' },
          { time: '2:00pm', title: 'Grand Bazaar', location: 'Fatih', notes: 'Shopping and culture' },
        ]
      },
      {
        date: addDays(today, 1).toISOString(),
        label: 'TUE',
        items: [
          { time: '10:00am', title: 'Topkapi Palace', location: 'Sultanahmet', notes: 'Ottoman history' },
          { time: '1:00pm', title: 'Spice Bazaar', location: 'Eminönü', notes: 'Local flavors' },
          { time: '4:00pm', title: 'Bosphorus Cruise', location: 'Bosphorus', notes: 'City from the water' },
        ]
      },
      {
        date: addDays(today, 2).toISOString(),
        label: 'WED',
        items: [
          { time: '9:00am', title: 'Galata Tower', location: 'Beyoğlu', notes: 'Panoramic views' },
          { time: '12:00pm', title: 'Istiklal Avenue', location: 'Beyoğlu', notes: 'Shopping and cafes' },
          { time: '7:00pm', title: 'Dinner in Karaköy', location: 'Karaköy', notes: 'Trendy restaurants' },
        ]
      },
      {
        date: addDays(today, 3).toISOString(),
        label: 'THU',
        items: [
          { time: '10:00am', title: 'Princes’ Islands', location: 'Sea of Marmara', notes: 'Day trip' },
          { time: '2:00pm', title: 'Relax at a Turkish Bath', location: 'Sultanahmet', notes: 'Traditional experience' },
        ]
      },
    ]
  },
  {
    destination: 'Santorini',
    tripName: 'Santorini Escape',
    startDate: today.toISOString(),
    endDate: addDays(today, 3).toISOString(),
    days: [
      {
        date: today.toISOString(),
        label: 'MON',
        items: [
          { time: '10:00am', title: 'Oia Village', location: 'Oia', notes: 'Famous blue domes' },
          { time: '1:00pm', title: 'Ammoudi Bay', location: 'Oia', notes: 'Seafood lunch' },
          { time: '6:00pm', title: 'Sunset in Oia', location: 'Oia', notes: 'Iconic view' },
        ]
      },
      {
        date: addDays(today, 1).toISOString(),
        label: 'TUE',
        items: [
          { time: '9:00am', title: 'Fira Town', location: 'Fira', notes: 'Shopping and cafes' },
          { time: '12:00pm', title: 'Red Beach', location: 'Akrotiri', notes: 'Unique sand' },
          { time: '4:00pm', title: 'Wine tasting', location: 'Pyrgos', notes: 'Local vineyards' },
        ]
      },
      {
        date: addDays(today, 2).toISOString(),
        label: 'WED',
        items: [
          { time: '10:00am', title: 'Boat tour to volcano', location: 'Caldera', notes: 'Hot springs swim' },
          { time: '2:00pm', title: 'Perissa Beach', location: 'Perissa', notes: 'Relax and swim' },
        ]
      },
    ]
  },
  {
    destination: 'Bali',
    tripName: 'Bali Bliss',
    startDate: today.toISOString(),
    endDate: addDays(today, 4).toISOString(),
    days: [
      {
        date: today.toISOString(),
        label: 'MON',
        items: [
          { time: '9:00am', title: 'Ubud Monkey Forest', location: 'Ubud', notes: 'See monkeys up close' },
          { time: '12:00pm', title: 'Tegallalang Rice Terraces', location: 'Tegallalang', notes: 'Scenic views' },
          { time: '3:00pm', title: 'Ubud Art Market', location: 'Ubud', notes: 'Local crafts' },
        ]
      },
      {
        date: addDays(today, 1).toISOString(),
        label: 'TUE',
        items: [
          { time: '10:00am', title: 'Tanah Lot Temple', location: 'Tabanan', notes: 'Sea temple' },
          { time: '1:00pm', title: 'Seminyak Beach', location: 'Seminyak', notes: 'Surf and relax' },
          { time: '6:00pm', title: 'Beach club sunset', location: 'Canggu', notes: 'Drinks and music' },
        ]
      },
      {
        date: addDays(today, 2).toISOString(),
        label: 'WED',
        items: [
          { time: '9:00am', title: 'Mount Batur Sunrise Hike', location: 'Kintamani', notes: 'Early morning adventure' },
          { time: '1:00pm', title: 'Hot springs soak', location: 'Toya Bungkah', notes: 'Relax after hike' },
        ]
      },
      {
        date: addDays(today, 3).toISOString(),
        label: 'THU',
        items: [
          { time: '10:00am', title: 'Nusa Penida Day Trip', location: 'Nusa Penida', notes: 'Island exploration' },
          { time: '3:00pm', title: 'Snorkeling', location: 'Crystal Bay', notes: 'See tropical fish' },
        ]
      },
    ]
  },
];

export default mockItineraries; 