/**
 * Comprehensive Tourism Database
 * Contains information about countries and tourism attractions
 */

export const tourismDatabase = {
  // Country tourism information
  countries: {
    IN: {
      code: 'IN',
      name: 'India',
      capital: 'New Delhi',
      region: 'South Asia',
      language: 'Hindi, English',
      currency: 'Indian Rupee (INR)',
      bestTime: 'October to March',
      description: 'India is a vast country with diverse cultures, ancient temples, and stunning landscapes.',
      highlights: [
        'Taj Mahal - One of the Seven Wonders of the World',
        'Varanasi - Sacred city on the Ganges River',
        'Kerala Backwaters - Scenic tropical canals',
        'Rajasthan - Desert palaces and forts',
        'Goa - Beautiful beaches and colonial architecture'
      ],
      attractions: [
        { name: 'Taj Mahal', city: 'Agra', type: 'Monument', rating: 5 },
        { name: 'Varanasi Ghats', city: 'Varanasi', type: 'Religious Site', rating: 5 },
        { name: 'Hawa Mahal', city: 'Jaipur', type: 'Palace', rating: 4.5 },
        { name: 'Meenakshi Temple', city: 'Madurai', type: 'Temple', rating: 4.8 }
      ],
      avgBudget: '$30-50 per day',
      safety: 'Moderate - Use caution in major cities'
    },
    JP: {
      code: 'JP',
      name: 'Japan',
      capital: 'Tokyo',
      region: 'East Asia',
      language: 'Japanese',
      currency: 'Japanese Yen (JPY)',
      bestTime: 'March-May, September-November',
      description: 'Japan blends ancient traditions with cutting-edge technology, offering everything from serene temples to vibrant cities.',
      highlights: [
        'Mount Fuji - Iconic snow-capped volcano',
        'Tokyo - Bustling metropolitan city',
        'Kyoto - Ancient temples and gardens',
        'Hiroshima - Historical significance',
        'Hokkaido - Winter sports and natural beauty'
      ],
      attractions: [
        { name: 'Senso-ji Temple', city: 'Tokyo', type: 'Temple', rating: 4.7 },
        { name: 'Arashiyama Bamboo Grove', city: 'Kyoto', type: 'Natural', rating: 4.8 },
        { name: 'Mount Fuji', city: 'Tokyo', type: 'Natural', rating: 4.9 },
        { name: 'Peace Memorial Park', city: 'Hiroshima', type: 'Historical', rating: 4.6 }
      ],
      avgBudget: '$70-100 per day',
      safety: 'Very Safe - One of the safest countries'
    },
    US: {
      code: 'US',
      name: 'United States',
      capital: 'Washington D.C.',
      region: 'North America',
      language: 'English',
      currency: 'US Dollar (USD)',
      bestTime: 'May-September',
      description: 'The USA offers diverse attractions from natural wonders to vibrant cities, beaches to mountains.',
      highlights: [
        'Grand Canyon - Breathtaking canyon landscape',
        'New York City - The city that never sleeps',
        'Yellowstone - World\'s first national park',
        'Florida Beaches - Tropical paradise',
        'Las Vegas - Entertainment capital'
      ],
      attractions: [
        { name: 'Grand Canyon', city: 'Arizona', type: 'Natural', rating: 4.9 },
        { name: 'Statue of Liberty', city: 'New York', type: 'Monument', rating: 4.6 },
        { name: 'Disneyland', city: 'California', type: 'Theme Park', rating: 4.7 },
        { name: 'Niagara Falls', city: 'New York', type: 'Natural', rating: 4.5 }
      ],
      avgBudget: '$80-150 per day',
      safety: 'Generally Safe - Varies by region'
    },
    FR: {
      code: 'FR',
      name: 'France',
      capital: 'Paris',
      region: 'Western Europe',
      language: 'French',
      currency: 'Euro (EUR)',
      bestTime: 'April-June, September-October',
      description: 'France is the epitome of romance and culture with world-class art, cuisine, and architecture.',
      highlights: [
        'Eiffel Tower - Iconic Paris landmark',
        'Louvre Museum - World\'s largest art museum',
        'Mont Saint-Michel - Medieval abbey on an island',
        'Provence - Lavender fields and countryside',
        'French Riviera - Glamorous beaches'
      ],
      attractions: [
        { name: 'Eiffel Tower', city: 'Paris', type: 'Monument', rating: 4.8 },
        { name: 'Louvre Museum', city: 'Paris', type: 'Museum', rating: 4.9 },
        { name: 'Notre-Dame', city: 'Paris', type: 'Cathedral', rating: 4.7 },
        { name: 'Versailles Palace', city: 'Versailles', type: 'Palace', rating: 4.8 }
      ],
      avgBudget: '$100-150 per day',
      safety: 'Very Safe - Generally safe in main areas'
    },
    GB: {
      code: 'GB',
      name: 'United Kingdom',
      capital: 'London',
      region: 'Western Europe',
      language: 'English',
      currency: 'British Pound (GBP)',
      bestTime: 'May-September',
      description: 'The UK combines historic heritage with modern attractions across England, Scotland, Wales, and Northern Ireland.',
      highlights: [
        'Big Ben & Parliament - Iconic architecture',
        'Tower of London - Historic fortress',
        'Edinburgh Castle - Scottish medieval castle',
        'Stonehenge - Ancient mystery',
        'Lake District - Beautiful mountainous region'
      ],
      attractions: [
        { name: 'Big Ben & Parliament', city: 'London', type: 'Monument', rating: 4.6 },
        { name: 'Tower of London', city: 'London', type: 'Historic', rating: 4.7 },
        { name: 'Buckingham Palace', city: 'London', type: 'Palace', rating: 4.5 },
        { name: 'Edinburgh Castle', city: 'Edinburgh', type: 'Castle', rating: 4.8 }
      ],
      avgBudget: '$90-140 per day',
      safety: 'Very Safe - Safe major cities'
    },
    BR: {
      code: 'BR',
      name: 'Brazil',
      capital: 'Brasília',
      region: 'South America',
      language: 'Portuguese',
      currency: 'Brazilian Real (BRL)',
      bestTime: 'December-March',
      description: 'Brazil offers vibrant culture, Amazon rainforest, beautiful beaches, and energetic cities.',
      highlights: [
        'Christ the Redeemer - Iconic Rio statue',
        'Amazon Rainforest - World\'s largest rainforest',
        'Iguazu Falls - Spectacular waterfall',
        'Rio de Janeiro - Beach city with mountains',
        'Carnival - World\'s biggest festival'
      ],
      attractions: [
        { name: 'Christ the Redeemer', city: 'Rio', type: 'Statue', rating: 4.8 },
        { name: 'Iguazu Falls', city: 'Misiones', type: 'Natural', rating: 4.9 },
        { name: 'Copacabana Beach', city: 'Rio', type: 'Beach', rating: 4.6 },
        { name: 'Amazon Rainforest', city: 'Manaus', type: 'Natural', rating: 4.7 }
      ],
      avgBudget: '$30-60 per day',
      safety: 'Moderate - Use caution in favelas'
    },
    AU: {
      code: 'AU',
      name: 'Australia',
      capital: 'Canberra',
      region: 'Oceania',
      language: 'English',
      currency: 'Australian Dollar (AUD)',
      bestTime: 'September-November, March-May',
      description: 'Australia combines natural wonders with cosmopolitan cities, known for unique wildlife and outdoor adventures.',
      highlights: [
        'Sydney Opera House - Iconic architecture',
        'Great Barrier Reef - World\'s largest coral reef',
        'Uluru - Sacred red rock in the outback',
        'Great Ocean Road - Scenic coastal drive',
        'Australian Outback - Vast desert landscape'
      ],
      attractions: [
        { name: 'Sydney Opera House', city: 'Sydney', type: 'Monument', rating: 4.8 },
        { name: 'Great Barrier Reef', city: 'Cairns', type: 'Natural', rating: 4.9 },
        { name: 'Uluru', city: 'Alice Springs', type: 'Natural', rating: 4.7 },
        { name: 'Bondi Beach', city: 'Sydney', type: 'Beach', rating: 4.5 }
      ],
      avgBudget: '$70-120 per day',
      safety: 'Very Safe - Safe for travelers'
    },
    DE: {
      code: 'DE',
      name: 'Germany',
      capital: 'Berlin',
      region: 'Central Europe',
      language: 'German',
      currency: 'Euro (EUR)',
      bestTime: 'May-September',
      description: 'Germany offers a mix of historical significance, cultural heritage, stunning castles, and modern cities.',
      highlights: [
        'Brandenburg Gate - Symbol of Berlin',
        'Neuschwanstein Castle - Fairytale castle',
        'Berlin Wall - Historical monument',
        'Black Forest - Scenic woodlands',
        'Bavarian Alps - Mountain scenery'
      ],
      attractions: [
        { name: 'Brandenburg Gate', city: 'Berlin', type: 'Monument', rating: 4.7 },
        { name: 'Neuschwanstein Castle', city: 'Schwangau', type: 'Castle', rating: 4.9 },
        { name: 'Marienplatz', city: 'Munich', type: 'Square', rating: 4.6 },
        { name: 'Cologne Cathedral', city: 'Cologne', type: 'Cathedral', rating: 4.7 }
      ],
      avgBudget: '$80-130 per day',
      safety: 'Very Safe - Safe major cities'
    }
  },

  // Travel tips database
  travelTips: {
    packing: [
      'Check weather forecast before packing',
      'Pack light and bring a small bag for flexibility',
      'Bring universal power adapter',
      'Pack medications and basic first-aid supplies',
      'Don\'t forget travel documents and copies'
    ],
    safety: [
      'Register with your embassy before traveling',
      'Keep emergency contacts handy',
      'Be aware of local customs and laws',
      'Keep valuables in a secure location',
      'Avoid traveling alone late at night'
    ],
    budgeting: [
      'Set a daily budget and stick to it',
      'Use public transport instead of taxis',
      'Eat at local restaurants for cheaper meals',
      'Look for free attractions and activities',
      'Book accommodations in advance for better rates'
    ],
    culture: [
      'Learn basic phrases in local language',
      'Respect local customs and traditions',
      'Ask permission before taking photos',
      'Try local cuisine and street food',
      'Interact with locals for authentic experiences'
    ]
  },

  // Activity database
  activities: {
    adventure: [
      'Hiking and trekking',
      'Rock climbing',
      'Skydiving',
      'Bungee jumping',
      'Zip-lining',
      'Mountain biking'
    ],
    cultural: [
      'Museum visits',
      'Heritage site tours',
      'Local cooking classes',
      'Dance performances',
      'Art gallery visits',
      'Historical walking tours'
    ],
    relaxation: [
      'Beach lounging',
      'Spa treatments',
      'Yoga and meditation',
      'Resort stays',
      'Wellness retreats',
      'Hot springs'
    ],
    wildlife: [
      'Safari tours',
      'Whale watching',
      'Bird watching',
      'Snorkeling',
      'Diving',
      'Marine life tours'
    ]
  },

  // Getting around tips
  transportation: {
    tips: [
      'Research public transport options before arriving',
      'Buy travel cards for discounted fares',
      'Use local apps for navigation (Google Maps offline)',
      'Negotiate taxi fares in advance',
      'Consider ride-sharing apps for safety'
    ],
    types: [
      'Public buses',
      'Trains and metro',
      'Taxis and ride-sharing',
      'Rental cars',
      'Bicycles',
      'Walking tours'
    ]
  }
};

export default tourismDatabase;
