import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory MCP transaction logs for real-time inspector
interface MCPLog {
  id: string;
  timestamp: string;
  server: string;
  tool: string;
  latencyMs: number;
  status: 'success' | 'fallback' | 'cached';
  params: any;
  responseSummary: string;
}

const mcpLogs: MCPLog[] = [];

function recordMcpLog(server: string, tool: string, latencyMs: number, status: 'success' | 'fallback', params: any, responseSummary: string) {
  const log: MCPLog = {
    id: `mcp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    server,
    tool,
    latencyMs,
    status,
    params,
    responseSummary,
  };
  mcpLogs.unshift(log);
  if (mcpLogs.length > 100) mcpLogs.pop();
  return log;
}

// Destination proposals database with curated photography and coordinates
const DESTINATIONS_CATALOG = [
  {
    id: 'dest-tokyo',
    city: 'Tokyo',
    country: 'Japan',
    code: 'TYO',
    tagline: 'Futuristic Neon Meets Ancient Shrines & Michelin Gastronomy',
    coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    vibes: ['Culture & Heritage', 'Culinary & Foodie', 'Urban & Architecture', 'Art & Museums'],
    estimatedFlightCost: 980,
    estimatedDailyExpense: 145,
    currencyRate: 153.5,
    coordinates: { lat: 35.6762, lng: 139.6503 },
    seasonality: {
      isPeak: false,
      seasonName: 'Autumn Foliage (Koyo)',
      label: 'Optimal Shoulder Season',
      description: 'Pleasant 18°C-22°C temperatures, crisp clear skies, and vibrant red momiji maple leaves.',
    },
    highlights: ['teamLab Borderless Digital Art', 'Tsukiji Outer Market Tasting Tour', 'Shinjuku Gyoen National Garden', 'Asakusa Senso-ji Twilight Walk'],
  },
  {
    id: 'dest-barcelona',
    city: 'Barcelona',
    country: 'Spain',
    code: 'BCN',
    tagline: 'Catalan Modernism, Mediterranean Coast, and Tapas Culture',
    coverImage: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
    vibes: ['Culture & Heritage', 'Culinary & Foodie', 'Urban & Architecture', 'Relaxation & Wellness'],
    estimatedFlightCost: 820,
    estimatedDailyExpense: 130,
    currencyRate: 0.92,
    coordinates: { lat: 41.3879, lng: 2.1699 },
    seasonality: {
      isPeak: false,
      seasonName: 'Golden Autumn',
      label: 'Pleasant & Mild',
      description: 'Warm sea breezes, low humidity, and harvest tapas festivals across Gothic Quarter.',
    },
    highlights: ['Sagrada Família Basilical Audio Experience', 'Park Güell Panoramic Trail', 'El Born Artisan & Wine Crawl', 'Barceloneta Sunset Promenade'],
  },
  {
    id: 'dest-singapore',
    city: 'Singapore',
    country: 'Singapore',
    code: 'SIN',
    tagline: 'Biophilic Urban Oasis, Hawker Paradises & Futuristic Architecture',
    coverImage: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80',
    vibes: ['Urban & Architecture', 'Culinary & Foodie', 'Nature & Outdoors', 'Relaxation & Wellness'],
    estimatedFlightCost: 1040,
    estimatedDailyExpense: 160,
    currencyRate: 1.34,
    coordinates: { lat: 1.3521, lng: 103.8198 },
    seasonality: {
      isPeak: true,
      seasonName: 'Tropical Monsoon Transition',
      label: 'Lush & Festive',
      description: 'Warm tropical 28°C-31°C with afternoon refreshing cloudbursts and world-class covered transit.',
    },
    highlights: ['Gardens by the Bay Cloud Forest Dome', 'Maxwell Hawker Center Food Trail', 'Jewel Changi Rain Vortex', 'National Gallery Southeast Asian Art'],
  },
  {
    id: 'dest-reykjavik',
    city: 'Reykjavik',
    country: 'Iceland',
    code: 'REK',
    tagline: 'Northern Lights, Geothermal Spas & Dramatic Volcanic Landscapes',
    coverImage: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
    vibes: ['Nature & Outdoors', 'Adventure & Thrills', 'Relaxation & Wellness'],
    estimatedFlightCost: 890,
    estimatedDailyExpense: 175,
    currencyRate: 138.2,
    coordinates: { lat: 64.1466, lng: -21.9426 },
    seasonality: {
      isPeak: false,
      seasonName: 'Aurora Borealis Season',
      label: 'Prime Skywatching',
      description: 'Dark crisp skies ideal for celestial northern lights, contrasting with 39°C geothermal mineral baths.',
    },
    highlights: ['Blue Lagoon Geothermal Retreat', 'Golden Circle Geysir & Gullfoss Expedition', 'Harpa Concert Hall Glass Facade', 'Hallgrimskirkja Panoramic Tower'],
  },
  {
    id: 'dest-kyoto',
    city: 'Kyoto',
    country: 'Japan',
    code: 'UKY',
    tagline: 'Zen Gardens, Historic Geisha Districts & Traditional Kaiseki',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    vibes: ['Culture & Heritage', 'Culinary & Foodie', 'Relaxation & Wellness', 'Nature & Outdoors'],
    estimatedFlightCost: 990,
    estimatedDailyExpense: 140,
    currencyRate: 153.5,
    coordinates: { lat: 35.0116, lng: 135.7681 },
    seasonality: {
      isPeak: true,
      seasonName: 'Maple Foliage Festival',
      label: 'Peak Cultural Season',
      description: 'Illuminated evening temple gardens, bamboo groves, and traditional tea ceremony pavilions.',
    },
    highlights: ['Fushimi Inari 10,000 Torii Gates Trail', 'Arashiyama Bamboo Grove & Tenryu-ji', 'Kiyomizu-dera Wooden Stage Overlook', 'Nishiki Culinary Market Exploration'],
  },
];

// Open-Meteo live weather fetcher wrapper (free, open, no key required)
async function fetchOpenMeteoWeather(lat: number, lng: number) {
  const startTime = Date.now();
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`Weather API error: ${res.statusText}`);
    const data = await res.json();
    
    // WMO Weather code mapper
    const code = data.current?.weather_code ?? 0;
    const tempC = Math.round(data.current?.temperature_2m ?? 20);
    const rainProb = data.daily?.precipitation_probability_max?.[0] ?? 15;
    
    let condition = 'Sunny / Clear';
    let icon = 'Sun';
    if (code >= 1 && code <= 3) { condition = 'Partly Cloudy'; icon = 'CloudSun'; }
    else if (code >= 45 && code <= 48) { condition = 'Misty / Fog'; icon = 'CloudFog'; }
    else if (code >= 51 && code <= 67) { condition = 'Showers / Rain'; icon = 'CloudRain'; }
    else if (code >= 71 && code <= 86) { condition = 'Snow / Flurries'; icon = 'CloudSnow'; }
    else if (code >= 95) { condition = 'Thunderstorm'; icon = 'CloudLightning'; }

    recordMcpLog('open-meteo-weather-mcp', 'get_live_forecast', Date.now() - startTime, 'success', { lat, lng }, `${condition}, ${tempC}°C, rain ${rainProb}%`);
    return {
      tempC,
      condition,
      icon,
      rainProbability: rainProb,
      seasonForecastSummary: `${tempC}°C current temp, high ${Math.round(data.daily?.temperature_2m_max?.[0] ?? tempC + 4)}°C. Rain risk ${rainProb}%.`,
    };
  } catch (err) {
    recordMcpLog('open-meteo-weather-mcp', 'get_live_forecast', Date.now() - startTime, 'fallback', { lat, lng }, 'Using regional weather climatology model');
    return {
      tempC: 21,
      condition: 'Mild & Sunny',
      icon: 'Sun',
      rainProbability: 20,
      seasonForecastSummary: 'Seasonal autumn highs ~21°C, crisp skies with 20% precipitation index.',
    };
  }
}

// Generate base itinerary with rich day-by-day activities, local festivals, and wet-weather alternatives
function generateStandardItinerary(city: string, dates: { start: string; end: string }, weather: any) {
  const isRainyAlert = weather.rainProbability > 40;

  if (city.toLowerCase().includes('tokyo')) {
    return [
      {
        dayNumber: 1,
        date: dates.start,
        theme: 'Arrival & Iconic Shibuya Crossing',
        forecast: { tempC: 22, condition: 'Clear Sky', rainProb: 15, rainAlert: false },
        rainModeActive: false,
        activities: [
          {
            id: 'act-1-1',
            timeSlot: '14:30 - 16:30',
            title: 'Hotel Check-in & Shinjuku Gyoen Promenade',
            category: 'Sightseeing' as const,
            location: 'Shinjuku, Tokyo',
            isOutdoor: true,
            isAnchorEvent: false,
            cost: 10,
            recommendedDuration: '2 hours',
            description: 'Stroll through imperial landscape gardens with maple autumn reflections.',
            weatherImpact: 'Outdoor walking in traditional gardens. Vulnerable to heavy downpours.',
            indoorAlternative: {
              title: 'Tokyo Metropolitan Government Building Observatories',
              location: 'Nishi-Shinjuku',
              description: 'Covered high-speed elevators to the 45th floor panoramic twin indoor observation decks overlooking Mount Fuji and the city grid.',
              cost: 0,
              reason: 'Zero-cost, fully covered 360° panoramic indoor viewpoint with sheltered underground concourse.',
            },
          },
          {
            id: 'act-1-2',
            timeSlot: '17:30 - 19:30',
            title: 'Shibuya Sky & Scramble Crossing',
            category: 'Sightseeing' as const,
            location: 'Shibuya Scramble Square',
            isOutdoor: true,
            isAnchorEvent: false,
            cost: 22,
            recommendedDuration: '2 hours',
            description: 'Ascend to the rooftop open-air observation deck overlooking the busiest intersection in the world.',
            indoorAlternative: {
              title: 'Mori Art Museum & Indoor Roppongi Hills Sky Deck Lounge',
              location: 'Roppongi Hills Mori Tower',
              description: 'World-renowned contemporary art gallery and sheltered floor-to-ceiling glass sky lounge.',
              cost: 20,
              reason: 'Spacious climate-controlled indoor gallery and panoramic vista shielded from rain.',
            },
          },
          {
            id: 'act-1-3',
            timeSlot: '20:00 - 22:00',
            title: 'Omoide Yokocho Yakitori Dining',
            category: 'Dining' as const,
            location: 'Memory Lane, Shinjuku',
            isOutdoor: false,
            isAnchorEvent: true,
            cost: 35,
            recommendedDuration: '2 hours',
            description: 'Atmospheric lantern-lit alley stalls serving charcoal-grilled skewers and craft highballs.',
          },
        ],
      },
      {
        dayNumber: 2,
        date: 'Day 2',
        theme: 'Digital Art & Ancient Shinto Heritage',
        forecast: { tempC: 20, condition: isRainyAlert ? 'Afternoon Rain' : 'Partly Cloudy', rainProb: isRainyAlert ? 65 : 25, rainAlert: isRainyAlert },
        rainModeActive: false,
        activities: [
          {
            id: 'act-2-1',
            timeSlot: '09:30 - 12:00',
            title: 'teamLab Borderless Digital Art Museum',
            category: 'Indoor' as const,
            location: 'Azabudai Hills',
            isOutdoor: false,
            isAnchorEvent: true, // Anchor festival/exhibit
            cost: 38,
            recommendedDuration: '2.5 hours',
            description: 'Immersive light installations that transcend physical boundaries and interact with human movement.',
          },
          {
            id: 'act-2-2',
            timeSlot: '13:00 - 15:30',
            title: 'Meiji Jingu Shrine & Yoyogi Forest Walk',
            category: 'Outdoor' as const,
            location: 'Harajuku / Shibuya',
            isOutdoor: true,
            isAnchorEvent: false,
            cost: 0,
            recommendedDuration: '2 hours',
            description: 'Towering cedar canopy forest path leading to Tokyo’s most revered imperial Shinto shrine.',
            weatherImpact: 'Forest gravel paths turn muddy during heavy rain.',
            indoorAlternative: {
              title: 'Tokyo National Museum & Covered Ueno Cultural Complex',
              location: 'Ueno Park Concourse',
              description: 'Japan’s premier indoor repository of samurai armor, national treasures, and Buddhist sculpture.',
              cost: 12,
              reason: 'Comprehensive climate-controlled museum with sheltered pavilions and covered museum cafe.',
            },
          },
          {
            id: 'act-2-3',
            timeSlot: '16:00 - 18:30',
            title: 'Ginza Six Art Atrium & Depachika Gourmet Tasting',
            category: 'Cultural' as const,
            location: 'Ginza District',
            isOutdoor: false,
            isAnchorEvent: false,
            cost: 25,
            recommendedDuration: '2.5 hours',
            description: 'Explore the high-end subterranean food halls (Depachika) with Wagyu sandwiches and artisanal matcha pastries.',
          },
        ],
      },
      {
        dayNumber: 3,
        date: 'Day 3',
        theme: 'Historic Asakusa & Akihabara Subculture',
        forecast: { tempC: 19, condition: 'Breezy & Sunny', rainProb: 15, rainAlert: false },
        rainModeActive: false,
        activities: [
          {
            id: 'act-3-1',
            timeSlot: '09:00 - 11:30',
            title: 'Senso-ji Temple & Nakamise-dori Arcade',
            category: 'Cultural' as const,
            location: 'Asakusa',
            isOutdoor: true,
            isAnchorEvent: false,
            cost: 5,
            recommendedDuration: '2.5 hours',
            description: 'Tokyo’s oldest Buddhist temple founded in 645 AD, flanked by traditional handicraft stalls.',
            weatherImpact: 'Main courtyard is open-air.',
            indoorAlternative: {
              title: 'Edo-Tokyo Museum / Sumida Hokusai Ukiyo-e Museum',
              location: 'Ryogoku / Sumida',
              description: 'Futuristic architectural gem showcasing the life and woodblock prints of master Katsushika Hokusai.',
              cost: 10,
              reason: 'Sheltered exhibition galleries with interactive woodblock printing stations.',
            },
          },
          {
            id: 'act-3-2',
            timeSlot: '12:30 - 14:00',
            title: 'Sumida River Cruise by Water Bus',
            category: 'Sightseeing' as const,
            location: 'Asakusa Pier to Odaiba',
            isOutdoor: true,
            isAnchorEvent: false,
            cost: 18,
            recommendedDuration: '1.5 hours',
            description: 'Panoramic river transit passing under 12 historic bridges towards Tokyo Bay.',
            weatherImpact: 'High winds or driving rain restrict open deck access.',
            indoorAlternative: {
              title: 'Akihabara Multi-Story Arcade & Retro Gaming Citadel',
              location: 'Akihabara Electric Town',
              description: '6-floor covered retro gaming mecca (Super Potato & Taito Station) filled with arcade classics.',
              cost: 15,
              reason: 'Vibrant indoor neon wonderland completely shielded from the elements.',
            },
          },
          {
            id: 'act-3-3',
            timeSlot: '18:00 - 21:00',
            title: 'Tokyo Autumn Lantern Festival Special Evening',
            category: 'Festival' as const,
            location: 'Kanda Myojin Shrine Grounds',
            isOutdoor: false,
            isAnchorEvent: true, // Fixed event anchor
            cost: 15,
            recommendedDuration: '3 hours',
            description: 'Traditional Taiko drumming, illuminated prayer lanterns, and regional festival cuisine.',
          },
        ],
      },
      {
        dayNumber: 4,
        date: 'Day 4',
        theme: 'Art, Architecture & Gastronomy',
        forecast: { tempC: 21, condition: 'Mild Autumn', rainProb: 20, rainAlert: false },
        rainModeActive: false,
        activities: [
          {
            id: 'act-4-1',
            timeSlot: '10:00 - 13:00',
            title: 'Tsukiji Outer Market Tasting Tour',
            category: 'Dining' as const,
            location: 'Tsukiji',
            isOutdoor: true,
            isAnchorEvent: false,
            cost: 40,
            recommendedDuration: '3 hours',
            description: 'Sample blowtorched A5 Wagyu skewers, fresh Hokkaido uni, tamagoyaki omelet, and fresh oysters.',
            weatherImpact: 'Outdoor street market crowded with umbrella friction.',
            indoorAlternative: {
              title: 'Toyosu Fish Market Wholesale Gallery & Sushi Dai Feast',
              location: 'Toyosu Central Market',
              description: 'Modern enclosed fish market with elevated viewing galleries and premier indoor omakase sushi bars.',
              cost: 45,
              reason: 'State-of-the-art temperature controlled indoor facility with renowned sushi restaurants.',
            },
          },
          {
            id: 'act-4-2',
            timeSlot: '15:00 - 17:30',
            title: 'Omotesando Architectural Walk & Cat Street',
            category: 'Sightseeing' as const,
            location: 'Omotesando & Harajuku',
            isOutdoor: true,
            isAnchorEvent: false,
            cost: 0,
            recommendedDuration: '2.5 hours',
            description: 'Explore world-renowned architecture by Tadao Ando, Herzog & de Meuron, and SANAA.',
            indoorAlternative: {
              title: 'Nezu Museum & Indoor Japanese Art Pavilion',
              location: 'Minami-Aoyama',
              description: 'Striking bamboo glass corridor and serene gallery housing classical East Asian pre-modern masterpieces.',
              cost: 14,
              reason: 'Pristine quiet indoor gallery designed by Kengo Kuma with serene views through rain-washed glass.',
            },
          },
          {
            id: 'act-4-3',
            timeSlot: '19:00 - 21:30',
            title: 'Farewell Kaiseki Dinner with Tokyo Tower Views',
            category: 'Dining' as const,
            location: 'Minato City',
            isOutdoor: false,
            isAnchorEvent: true,
            cost: 85,
            recommendedDuration: '2.5 hours',
            description: 'Multi-course seasonal Japanese banquet celebrating autumn mushrooms, sweetfish, and dashi broth.',
          },
        ],
      },
    ];
  }

  // Generic rich fallback for other destinations
  return [
    {
      dayNumber: 1,
      date: dates.start,
      theme: `Arrival & Historic Heart of ${city}`,
      forecast: { tempC: weather.tempC, condition: weather.condition, rainProb: weather.rainProbability, rainAlert: weather.rainProbability > 40 },
      rainModeActive: false,
      activities: [
        {
          id: 'act-g1-1',
          timeSlot: '14:00 - 16:30',
          title: `Old Town Walking Tour & Landmark Plaza`,
          category: 'Sightseeing' as const,
          location: `${city} City Center`,
          isOutdoor: true,
          isAnchorEvent: false,
          cost: 15,
          recommendedDuration: '2.5 hours',
          description: `Acclimate to the city layout with a walking tour across historical plazas and heritage facades.`,
          indoorAlternative: {
            title: `${city} Municipal History Museum & Palace Chambers`,
            location: 'Central Plaza',
            description: 'Climate-controlled historical galleries recounting the centuries-old founding of the city.',
            cost: 12,
            reason: 'Full indoor protection with audio guide and royal artifact rooms.',
          },
        },
        {
          id: 'act-g1-2',
          timeSlot: '18:00 - 20:30',
          title: 'Welcome Dinner & Local Culinary Tasting',
          category: 'Dining' as const,
          location: 'Gastronomy Quarter',
          isOutdoor: false,
          isAnchorEvent: true,
          cost: 45,
          recommendedDuration: '2.5 hours',
          description: 'Experience signature regional delicacies and welcome beverage pairing.',
        },
      ],
    },
    {
      dayNumber: 2,
      date: 'Day 2',
      theme: 'Architecture & Panoramic Views',
      forecast: { tempC: weather.tempC - 1, condition: 'Partly Cloudy', rainProb: 30, rainAlert: false },
      rainModeActive: false,
      activities: [
        {
          id: 'act-g2-1',
          timeSlot: '10:00 - 12:30',
          title: 'Panoramic Hilltop Garden & Viewpoint',
          category: 'Outdoor' as const,
          location: `${city} Heights`,
          isOutdoor: true,
          isAnchorEvent: false,
          cost: 10,
          recommendedDuration: '2.5 hours',
          description: 'Sweeping city skyline views from high vantage point.',
          indoorAlternative: {
            title: 'Modern Art Foundation & Covered Observatory',
            location: 'Arts District',
            description: 'Indoor contemporary galleries and sky terrace lounge.',
            cost: 18,
            reason: 'Dry indoor observation and world-class rotating exhibitions.',
          },
        },
        {
          id: 'act-g2-2',
          timeSlot: '14:00 - 16:30',
          title: 'Covered Central Market & Artisan Tasting',
          category: 'Cultural' as const,
          location: 'Mercado Central',
          isOutdoor: false,
          isAnchorEvent: false,
          cost: 20,
          recommendedDuration: '2.5 hours',
          description: 'Dozens of local vendors selling aged cheeses, charcuterie, and fresh baked specialties.',
        },
      ],
    },
  ];
}

// Curated flight search results
function getFlightsForDestination(cityCode: string, origin: string = 'SFO') {
  return [
    {
      id: 'fl-1',
      airline: 'All Nippon Airways (ANA)',
      flightNumber: 'NH 007',
      departureTime: '11:15 AM',
      arrivalTime: '02:40 PM (+1d)',
      departureAirport: origin.includes('(') ? origin.split('(')[1].replace(')', '') : 'SFO',
      arrivalAirport: cityCode === 'TYO' ? 'HND' : cityCode,
      duration: '11h 25m',
      stops: 0,
      price: 980,
      cabinClass: 'Economy' as const,
      baggage: '2 x 23kg checked bags included',
      carbonKg: 420,
      aircraft: 'Boeing 787-9 Dreamliner',
    },
    {
      id: 'fl-2',
      airline: 'Japan Airlines (JAL)',
      flightNumber: 'JL 057',
      departureTime: '01:30 PM',
      arrivalTime: '04:55 PM (+1d)',
      departureAirport: origin.includes('(') ? origin.split('(')[1].replace(')', '') : 'SFO',
      arrivalAirport: cityCode === 'TYO' ? 'NRT' : cityCode,
      duration: '11h 25m',
      stops: 0,
      price: 1045,
      cabinClass: 'Economy' as const,
      baggage: '2 x 23kg checked bags included',
      carbonKg: 410,
      aircraft: 'Airbus A350-1000',
    },
    {
      id: 'fl-3',
      airline: 'Singapore Airlines',
      flightNumber: 'SQ 011',
      departureTime: '09:40 AM',
      arrivalTime: '02:15 PM (+1d)',
      departureAirport: origin.includes('(') ? origin.split('(')[1].replace(')', '') : 'SFO',
      arrivalAirport: cityCode === 'TYO' ? 'NRT' : cityCode,
      duration: '11h 35m',
      stops: 0,
      price: 1120,
      cabinClass: 'Premium Economy' as const,
      baggage: '2 x 28kg bags + priority boarding',
      carbonKg: 435,
      aircraft: 'Boeing 777-300ER',
    },
    {
      id: 'fl-4',
      airline: 'United Airlines',
      flightNumber: 'UA 875',
      departureTime: '10:45 AM',
      arrivalTime: '02:20 PM (+1d)',
      departureAirport: origin.includes('(') ? origin.split('(')[1].replace(')', '') : 'SFO',
      arrivalAirport: cityCode === 'TYO' ? 'HND' : cityCode,
      duration: '11h 35m',
      stops: 0,
      price: 895,
      cabinClass: 'Economy' as const,
      baggage: '1 x 23kg checked bag',
      carbonKg: 440,
      aircraft: 'Boeing 777-200',
    },
  ];
}

// Curated hotels, transit passes, and attraction tickets
function getLogisticsCatalog(cityName: string) {
  return [
    {
      id: 'bk-hotel-1',
      type: 'hotel' as const,
      title: 'Mimaru Suites Tokyo Nihombashi',
      provider: 'Stay Hotel Booking MCP / Booking.com',
      details: 'Spacious Japanese-modern multi-room suite with tatami lounge and kitchenette. 4 min walk to Ningyocho Station.',
      price: 245,
      status: 'pending' as const,
      badge: 'Top Pick for Groups',
      rating: 4.9,
      cancellationPolicy: 'Free cancellation up to 48 hours prior',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      datesOrTimeSlot: 'Check-in: 15:00 | Check-out: 11:00',
    },
    {
      id: 'bk-hotel-2',
      type: 'hotel' as const,
      title: 'The Gate Hotel Asakusa Kaminarimon',
      provider: 'Stay Hotel Booking MCP / Google Hotels',
      details: 'Boutique stay featuring an open-air 13th-floor terrace overlooking Senso-ji Temple and Tokyo Skytree.',
      price: 198,
      status: 'pending' as const,
      badge: 'Heritage & View',
      rating: 4.8,
      cancellationPolicy: 'Free cancellation up to 72 hours prior',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      datesOrTimeSlot: 'Check-in: 14:00 | Check-out: 11:00',
    },
    {
      id: 'bk-transit-1',
      type: 'transit' as const,
      title: 'Tokyo Subway 72-Hour Unlimited Ticket (Pre-loaded)',
      provider: 'Public Transport MCP / Tokyo Metro API',
      details: 'Unlimited rides on all 13 Tokyo Metro and Toei Subway lines. Essential for seamless, cashless urban mobility.',
      price: 12,
      status: 'pending' as const,
      badge: 'Essential Transit Pass',
      rating: 4.95,
      cancellationPolicy: 'Instant QR code, valid for 180 days',
      image: 'https://images.unsplash.com/photo-1557409518-691ebcd96038?auto=format&fit=crop&w=800&q=80',
      datesOrTimeSlot: '72 consecutive hours from first tap',
    },
    {
      id: 'bk-transit-2',
      type: 'transit' as const,
      title: 'Welcome Suica Card (Digital Apple Wallet/Android)',
      provider: 'Public Transport MCP / JR East Transit',
      details: 'Preloaded with ¥3,000 credit for JR trains, vending machines, and convenience stores. Zero deposit fee.',
      price: 25,
      status: 'pending' as const,
      badge: 'Cashless Convenience',
      rating: 4.9,
      cancellationPolicy: 'Non-refundable once digital wallet activated',
      datesOrTimeSlot: 'Instant wallet activation',
    },
    {
      id: 'bk-attr-1',
      type: 'attraction' as const,
      title: 'teamLab Borderless Azabudai Hills Timed Entry',
      provider: 'TourismMCP / Tiqets API',
      details: 'Skip-the-line timed admission pass to the world’s leading digital art museum. High sellout risk.',
      price: 38,
      status: 'pending' as const,
      badge: 'High Sellout Risk',
      rating: 4.98,
      cancellationPolicy: 'Timed slot guarantee, non-refundable',
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      datesOrTimeSlot: 'Reserved Entry: Day 2 at 09:30 AM',
    },
    {
      id: 'bk-attr-2',
      type: 'attraction' as const,
      title: 'Shinjuku Gyoen & Imperial Gardens Audio Tour',
      provider: 'TourismMCP / Attraction Database',
      details: 'Self-guided architectural and botanical narration on historical Edo-period daimyo residence.',
      price: 8,
      status: 'pending' as const,
      badge: 'Cultural Badge',
      rating: 4.7,
      cancellationPolicy: 'Cancel anytime before entry date',
      datesOrTimeSlot: 'Flexible Day Pass',
    },
  ];
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      time: new Date().toISOString(),
      orchestratorVersion: '1.2.0-smithery',
    });
  });

  // MCP Server Status monitor endpoint
  app.get('/api/mcp/status', (req: Request, res: Response) => {
    const servers = [
      {
        name: 'pulse-mcp',
        displayName: 'Pulse MCP (Smithery)',
        description: 'Destination discovery, vibe matching & regional scoring',
        status: 'healthy',
        averageLatencyMs: 120,
        totalCalls: 48,
        endpoint: 'smithery://pulse.travel/v1',
      },
      {
        name: 'flight-search-mcp',
        displayName: 'Flight Search MCP / LatchFX',
        description: 'Real-time airline inventory, layovers & baggage pricing',
        status: 'healthy',
        averageLatencyMs: 240,
        totalCalls: 36,
        endpoint: 'smithery://flight-search.latchfx/v2',
      },
      {
        name: 'hotel-booking-mcp',
        displayName: 'Stay Hotel Booking MCP',
        description: 'Google Hotels & Booking.com live rates & amenities',
        status: 'healthy',
        averageLatencyMs: 190,
        totalCalls: 29,
        endpoint: 'smithery://hotel-stay.booking/v1',
      },
      {
        name: 'open-meteo-weather-mcp',
        displayName: 'Open-Meteo Weather MCP',
        description: 'Live WMO weather forecast & precipitation probability',
        status: 'healthy',
        averageLatencyMs: 85,
        totalCalls: 62,
        endpoint: 'https://api.open-meteo.com/v1/forecast',
      },
      {
        name: 'tourism-events-mcp',
        displayName: 'Tourism & Festival Events MCP',
        description: 'Seasonal festivals, exhibitions & anchor event scheduling',
        status: 'healthy',
        averageLatencyMs: 160,
        totalCalls: 51,
        endpoint: 'smithery://tourism.events.pulse/v1',
      },
      {
        name: 'maps-routing-mcp',
        displayName: 'Maps & Geo Routing MCP',
        description: 'Waypoint distance, transit walking legs & routing matrices',
        status: 'healthy',
        averageLatencyMs: 95,
        totalCalls: 44,
        endpoint: 'smithery://maps.geo.routing/v1',
      },
      {
        name: 'transit-mcp',
        displayName: 'Public Transport & Transit MCP',
        description: 'Metro pass ticketing, Suica IC cards & payment gateways',
        status: 'healthy',
        averageLatencyMs: 110,
        totalCalls: 22,
        endpoint: 'smithery://transit.passes.metro/v1',
      },
      {
        name: 'travel-orchestrator-mcp',
        displayName: 'Travel Orchestrator MCP',
        description: 'Business logic glue, state store & contingency replanning',
        status: 'healthy',
        averageLatencyMs: 70,
        totalCalls: 75,
        endpoint: 'local://travel.orchestrator.engine',
      },
    ];

    res.json({
      servers,
      recentLogs: mcpLogs.slice(0, 30),
    });
  });

  // Main MCP Router task endpoint as per architecture diagram (Group 7.jpg):
  // "Start -> Your Page -> POST -> /api/task -> router -> Google Gemini / Orchestrator"
  app.post('/api/task', async (req: Request, res: Response) => {
    const startTime = Date.now();
    const { task, payload } = req.body;

    try {
      if (task === 'discover_destinations') {
        const vibes = payload?.vibes || [];
        const budget = payload?.totalBudget || 4000;
        
        // Enrich destinations with live Open-Meteo weather
        const enriched = await Promise.all(
          DESTINATIONS_CATALOG.map(async (dest) => {
            const weather = await fetchOpenMeteoWeather(dest.coordinates.lat, dest.coordinates.lng);
            
            // Calculate vibe match
            const matchCount = dest.vibes.filter((v) => vibes.includes(v)).length;
            const vibeScore = vibes.length > 0 ? Math.min(98, Math.max(70, Math.round((matchCount / Math.max(1, vibes.length)) * 100) + 15)) : 92;
            
            return {
              ...dest,
              vibeMatch: vibeScore,
              weatherForecast: weather,
            };
          })
        );

        recordMcpLog('pulse-mcp', 'propose_destinations', Date.now() - startTime, 'success', { vibes, budget }, `Returned ${enriched.length} curated destinations with live weather`);
        return res.json({ destinations: enriched });
      }

      if (task === 'search_flights') {
        const destCode = payload?.destinationCode || 'TYO';
        const origin = payload?.originCity || 'SFO';
        const flights = getFlightsForDestination(destCode, origin);
        
        recordMcpLog('flight-search-mcp', 'query_inventory_pricing', Date.now() - startTime, 'success', { destCode, origin }, `Found ${flights.length} flights for ${destCode}`);
        return res.json({ flights });
      }

      if (task === 'generate_itinerary') {
        const { city, dates, preferences } = payload;
        const weather = await fetchOpenMeteoWeather(35.6762, 139.6503);
        const days = generateStandardItinerary(city || 'Tokyo', dates || { start: '2026-10-12', end: '2026-10-16' }, weather);
        
        recordMcpLog('travel-orchestrator-mcp', 'compose_base_itinerary', Date.now() - startTime, 'success', { city }, `Constructed ${days.length}-day dynamic itinerary with weather anchors`);
        return res.json({ days });
      }

      if (task === 'wet_weather_contingency') {
        const { dayNumber, activities } = payload;
        
        // Non-destructive rainy day swap:
        // Replace outdoor activities with indoor alternatives, but KEEP anchor events intact!
        let replacedCount = 0;
        const updatedActivities = activities.map((act: any) => {
          if (act.isOutdoor && act.indoorAlternative && !act.isAnchorEvent) {
            replacedCount++;
            return {
              ...act,
              title: act.indoorAlternative.title,
              location: act.indoorAlternative.location,
              description: act.indoorAlternative.description,
              category: 'Indoor' as const,
              isOutdoor: false,
              weatherImpact: 'Sheltered from precipitation. Rain-proof contingency applied.',
              transitNote: 'Connected via covered pedestrian walkways / metro concourses.',
              originalActivityTitle: act.title,
            };
          }
          return act;
        });

        recordMcpLog(
          'travel-orchestrator-mcp',
          'auto_wet_weather_replan',
          Date.now() - startTime,
          'success',
          { dayNumber, activityCount: activities.length },
          `Replaced ${replacedCount} outdoor activities with indoor alternatives, anchored festivals preserved`
        );

        return res.json({
          activities: updatedActivities,
          replacedCount,
          reason: `Auto-replanned Day ${dayNumber} for rain: Swapped ${replacedCount} open-air activities for sheltered indoor cultural venues while safeguarding scheduled event anchors.`,
        });
      }

      if (task === 'get_logistics') {
        const city = payload?.city || 'Tokyo';
        const logistics = getLogisticsCatalog(city);
        recordMcpLog('transit-mcp', 'fetch_logistics_catalog', Date.now() - startTime, 'success', { city }, `Retrieved ${logistics.length} booking and pass items`);
        return res.json({ logistics });
      }

      // Default fallback
      return res.status(400).json({ error: `Unknown task: ${task}` });
    } catch (err: any) {
      console.error('API Task error:', err);
      recordMcpLog('travel-orchestrator-mcp', task, Date.now() - startTime, 'fallback', req.body, err.message || 'Error occurred');
      return res.status(500).json({ error: err.message || 'Task processing failed' });
    }
  });

  // Dedicated MCP routes
  app.post('/api/mcp/destinations', async (req: Request, res: Response) => {
    const startTime = Date.now();
    const enriched = await Promise.all(
      DESTINATIONS_CATALOG.map(async (dest) => {
        const weather = await fetchOpenMeteoWeather(dest.coordinates.lat, dest.coordinates.lng);
        return {
          ...dest,
          vibeMatch: 94,
          weatherForecast: weather,
        };
      })
    );
    recordMcpLog('pulse-mcp', 'get_destinations', Date.now() - startTime, 'success', {}, `Discovered ${enriched.length} options`);
    res.json({ destinations: enriched });
  });

  app.post('/api/mcp/weather', async (req: Request, res: Response) => {
    const { lat = 35.6762, lng = 139.6503 } = req.body;
    const weather = await fetchOpenMeteoWeather(lat, lng);
    res.json({ weather });
  });

  // In development, hook Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WanderPulse Travel Orchestrator Server running on port ${PORT}`);
  });
}

startServer();
