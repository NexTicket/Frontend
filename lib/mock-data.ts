export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  venueId: string;
  price: number;
  image: string;
  category: string;
  capacity: number;
  availableTickets: number;
  organizer: string;
  tags: string[];
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  capacity: number;
  description: string;
  image: string;
  amenities: string[];
  contact: {
    phone: string;
    email: string;
  };
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  section: string;
  price: number;
  isAvailable: boolean;
  isSelected: boolean;
}

export interface Ticket {
  id: string;
  eventId: string;
  seatId: string;
  userId: string;
  purchaseDate: string;
  price: number;
  status: 'active' | 'used' | 'cancelled';
}

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Rock Concert 2024',
    description: 'An amazing rock concert featuring top artists from around the world.',
    date: '2024-08-15',
    time: '19:00',
    venue: 'Madison Square Garden',
    venueId: '1',
    price: 75,
    image: '/Images/events/banners/m1.jpeg',
    category: 'Music',
    capacity: 20000,
    availableTickets: 15000,
    organizer: 'Rock Events Inc.',
    tags: ['rock', 'music', 'concert', 'live']
  },
  {
    id: '2',
    title: 'Tech Conference 2024',
    description: 'The biggest tech conference of the year with industry leaders.',
    date: '2024-09-22',
    time: '09:00',
    venue: 'Convention Center',
    venueId: '2',
    price: 299,
    image: '/Images/events/banners/m2.jpeg',
    category: 'Technology',
    capacity: 5000,
    availableTickets: 3500,
    organizer: 'Tech World',
    tags: ['tech', 'conference', 'networking', 'innovation']
  },
  {
    id: '3',
    title: 'Broadway Musical',
    description: 'A spectacular Broadway musical performance.',
    date: '2024-07-30',
    time: '20:00',
    venue: 'Broadway Theater',
    venueId: '3',
    price: 120,
    image: '/Images/events/banners/m3.jpeg',
    category: 'Theater',
    capacity: 1500,
    availableTickets: 800,
    organizer: 'Broadway Productions',
    tags: ['broadway', 'musical', 'theater', 'performance']
  },
  {
    id: '4',
    title: 'Food Festival',
    description: 'A celebration of local and international cuisine.',
    date: '2024-08-05',
    time: '11:00',
    venue: 'Central Park',
    venueId: '4',
    price: 25,
    image: '/Images/events/banners/m4.jpeg',
    category: 'Food',
    capacity: 10000,
    availableTickets: 7500,
    organizer: 'City Events',
    tags: ['food', 'festival', 'outdoor', 'family']
  },
  {
    id: '5',
    title: 'Art Gallery Opening',
    description: 'Grand opening of a new contemporary art exhibition.',
    date: '2024-08-12',
    time: '18:00',
    venue: 'Modern Art Museum',
    venueId: '5',
    price: 15,
    image: '/Images/events/banners/m5.jpeg',
    category: 'Art',
    capacity: 300,
    availableTickets: 150,
    organizer: 'Art Museum',
    tags: ['art', 'exhibition', 'culture', 'opening']
  },
  {
    id: '6',
    title: 'Jazz Night',
    description: 'An intimate jazz performance with renowned musicians.',
    date: '2024-07-28',
    time: '21:00',
    venue: 'Blue Note Jazz Club',
    venueId: '6',
    price: 45,
    image: '/Images/events/banners/m6.jpeg',
    category: 'Music',
    capacity: 200,
    availableTickets: 120,
    organizer: 'Jazz Club',
    tags: ['jazz', 'music', 'intimate', 'live']
  },
  // Past Events
  {
    id: '7',
    title: 'Summer Music Festival',
    description: 'Three-day outdoor music festival with multiple stages.',
    date: '2024-06-15',
    time: '12:00',
    venue: 'Central Park',
    venueId: '4',
    price: 120,
    image: '/Images/events/banners/m7.jpeg',
    category: 'Music',
    capacity: 15000,
    availableTickets: 0,
    organizer: 'Festival Productions',
    tags: ['festival', 'music', 'outdoor', 'multi-day']
  },
  {
    id: '8',
    title: 'Wine Tasting Event',
    description: 'Exclusive wine tasting with renowned sommeliers.',
    date: '2024-05-20',
    time: '19:00',
    venue: 'Modern Art Museum',
    venueId: '5',
    price: 85,
    image: '/Images/events/banners/m8.jpeg',
    category: 'Food',
    capacity: 150,
    availableTickets: 0,
    organizer: 'Wine Society',
    tags: ['wine', 'tasting', 'luxury', 'culture']
  },
  // Today's Events
  {
    id: '9',
    title: 'Business Networking Lunch',
    description: 'Professional networking event for entrepreneurs.',
    date: '2025-07-20',
    time: '12:00',
    venue: 'Convention Center',
    venueId: '2',
    price: 50,
    image: '/Images/events/banners/m9.jpeg',
    category: 'Business',
    capacity: 200,
    availableTickets: 45,
    organizer: 'Business Network',
    tags: ['networking', 'business', 'professional', 'lunch']
  },
  {
    id: '10',
    title: 'Comedy Show Tonight',
    description: 'Stand-up comedy show featuring popular comedians.',
    date: '2025-07-20',
    time: '20:00',
    venue: 'Broadway Theater',
    venueId: '3',
    price: 35,
    image: '/Images/events/banners/m10.jpeg',
    category: 'Comedy',
    capacity: 800,
    availableTickets: 150,
    organizer: 'Comedy Club',
    tags: ['comedy', 'entertainment', 'standup', 'evening']
  },
  // Future Events
  {
    id: '11',
    title: 'International Dance Competition',
    description: 'World-class dancers competing in various styles.',
    date: '2025-08-10',
    time: '18:00',
    venue: 'Madison Square Garden',
    venueId: '1',
    price: 90,
    image: '/Images/events/banners/m1.jpeg',
    category: 'Dance',
    capacity: 18000,
    availableTickets: 12000,
    organizer: 'Dance World',
    tags: ['dance', 'competition', 'international', 'performance']
  },
  {
    id: '12',
    title: 'Charity Gala Dinner',
    description: 'Elegant charity dinner to support local communities.',
    date: '2025-09-05',
    time: '19:30',
    venue: 'Modern Art Museum',
    venueId: '5',
    price: 200,
    image: '/Images/events/banners/m2.jpeg',
    category: 'Charity',
    capacity: 250,
    availableTickets: 180,
    organizer: 'Charity Foundation',
    tags: ['charity', 'gala', 'formal', 'dinner']
  },
  {
    id: '13',
    title: 'Electronic Music Rave',
    description: 'High-energy electronic music event with top DJs.',
    date: '2025-08-25',
    time: '22:00',
    venue: 'Convention Center',
    venueId: '2',
    price: 65,
    image: '/Images/events/banners/m3.jpeg',
    category: 'Music',
    capacity: 3000,
    availableTickets: 2200,
    organizer: 'Electronic Events',
    tags: ['electronic', 'rave', 'dj', 'nightlife']
  },
  {
    id: '14',
    title: 'Book Reading & Signing',
    description: 'Meet bestselling authors and get your books signed.',
    date: '2025-07-25',
    time: '15:00',
    venue: 'Modern Art Museum',
    venueId: '5',
    price: 15,
    image: '/Images/events/banners/m4.jpeg',
    category: 'Literature',
    capacity: 100,
    availableTickets: 75,
    organizer: 'Literary Society',
    tags: ['books', 'reading', 'authors', 'culture']
  },
  {
    id: '15',
    title: 'Youth Sports Tournament',
    description: 'Annual youth sports competition featuring multiple games.',
    date: '2025-07-22',
    time: '09:00',
    venue: 'Central Park',
    venueId: '4',
    price: 10,
    image: '/Images/events/banners/m5.jpeg',
    category: 'Sports',
    capacity: 5000,
    availableTickets: 4500,
    organizer: 'Youth Sports League',
    tags: ['sports', 'youth', 'tournament', 'family']
  },
  {
    id: '16',
    title: 'Avengers: Endgame',
    description: 'The epic conclusion to the Marvel Cinematic Universe saga.',
    date: '2025-08-01',
    time: '19:30',
    venue: 'IMAX Theater',
    venueId: '6',
    price: 18,
    image: '/Images/events/banners/m6.jpeg',
    category: 'Action',
    capacity: 400,
    availableTickets: 350,
    organizer: 'Cinema World',
    tags: ['movie', 'action', 'superhero', 'marvel']
  },
  {
    id: '17',
    title: 'The Dark Knight',
    description: 'Batman faces his greatest challenge in this acclaimed thriller.',
    date: '2025-08-02',
    time: '21:00',
    venue: 'Grand Cinema',
    venueId: '7',
    price: 15,
    image: '/Images/events/banners/m7.jpeg',
    category: 'Action',
    capacity: 300,
    availableTickets: 280,
    organizer: 'Cinema World',
    tags: ['movie', 'action', 'batman', 'thriller']
  },
  {
    id: '18',
    title: 'Inception',
    description: 'Mind-bending sci-fi thriller that challenges reality.',
    date: '2025-08-03',
    time: '20:15',
    venue: 'Digital Cinema',
    venueId: '8',
    price: 16,
    image: '/Images/events/banners/m8.jpeg',
    category: 'Sci-Fi',
    capacity: 250,
    availableTickets: 200,
    organizer: 'Art House Films',
    tags: ['movie', 'sci-fi', 'thriller', 'nolan']
  },
  {
    id: '19',
    title: 'Pulp Fiction',
    description: 'Quentin Tarantino\'s iconic crime masterpiece.',
    date: '2025-08-04',
    time: '19:45',
    venue: 'Retro Cinema',
    venueId: '9',
    price: 14,
    image: '/Images/events/banners/m9.jpeg',
    category: 'Drama',
    capacity: 180,
    availableTickets: 160,
    organizer: 'Classic Films',
    tags: ['movie', 'drama', 'crime', 'tarantino']
  },
  {
    id: '20',
    title: 'The Shining',
    description: 'Stanley Kubrick\'s psychological horror classic.',
    date: '2025-08-05',
    time: '22:30',
    venue: 'Horror Movie House',
    venueId: '10',
    price: 17,
    image: '/Images/events/banners/m10.jpeg',
    category: 'Horror',
    capacity: 200,
    availableTickets: 150,
    organizer: 'Midnight Movies',
    tags: ['movie', 'horror', 'psychological', 'kubrick']
  },
  {
    id: '21',
    title: 'La La Land',
    description: 'A romantic musical about dreams and love in Los Angeles.',
    date: '2025-08-06',
    time: '18:00',
    venue: 'Musical Theater',
    venueId: '11',
    price: 19,
    image: '/Images/events/banners/m1.jpeg',
    category: 'Romance',
    capacity: 350,
    availableTickets: 300,
    organizer: 'Romance Films',
    tags: ['movie', 'romance', 'musical', 'drama']
  },
  {
    id: '22',
    title: 'Deadpool & Wolverine',
    description: 'The ultimate superhero team-up you\'ve been waiting for.',
    date: '2025-08-07',
    time: '20:30',
    venue: 'IMAX Theater',
    venueId: '6',
    price: 20,
    image: '/Images/events/banners/m2.jpeg',
    category: 'Action',
    capacity: 400,
    availableTickets: 380,
    organizer: 'Cinema World',
    tags: ['movie', 'action', 'comedy', 'superhero']
  },
  {
    id: '23',
    title: 'Interstellar',
    description: 'A journey through space and time to save humanity.',
    date: '2025-08-08',
    time: '19:00',
    venue: 'IMAX Theater',
    venueId: '6',
    price: 18,
    image: '/Images/events/banners/m3.jpeg',
    category: 'Sci-Fi',
    capacity: 400,
    availableTickets: 320,
    organizer: 'Science Films',
    tags: ['movie', 'sci-fi', 'space', 'drama']
  },
  {
    id: '24',
    title: 'The Conjuring',
    description: 'Based on true events, this horror will haunt your dreams.',
    date: '2025-08-09',
    time: '23:00',
    venue: 'Horror Movie House',
    venueId: '10',
    price: 16,
    image: '/Images/events/banners/m4.jpeg',
    category: 'Horror',
    capacity: 200,
    availableTickets: 180,
    organizer: 'Midnight Movies',
    tags: ['movie', 'horror', 'supernatural', 'thriller']
  },
  {
    id: '25',
    title: 'Guardians of the Galaxy',
    description: 'Space adventure with the best soundtrack in the universe.',
    date: '2025-08-10',
    time: '17:30',
    venue: 'Digital Cinema',
    venueId: '8',
    price: 17,
    image: '/Images/events/banners/m5.jpeg',
    category: 'Action',
    capacity: 250,
    availableTickets: 220,
    organizer: 'Galaxy Entertainment',
    tags: ['movie', 'action', 'comedy', 'space']
  }
];

export const mockVenues: Venue[] = [
  {
    id: '1',
    name: 'Madison Square Garden',
    address: '4 Pennsylvania Plaza',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    capacity: 20000,
    description: 'The world\'s most famous arena, hosting major concerts and sporting events.',
    image: '/api/placeholder/800/600',
    amenities: ['Parking', 'Restaurants', 'Gift Shop', 'Accessibility', 'VIP Suites'],
    contact: {
      phone: '(212) 465-6741',
      email: 'info@msg.com'
    }
  },
  {
    id: '2',
    name: 'Convention Center',
    address: '655 West 34th Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    capacity: 5000,
    description: 'Modern convention center perfect for conferences and exhibitions.',
    image: '/api/placeholder/800/600',
    amenities: ['WiFi', 'Catering', 'Parking', 'AV Equipment', 'Registration Area'],
    contact: {
      phone: '(212) 216-2000',
      email: 'events@javitscenter.com'
    }
  },
  {
    id: '3',
    name: 'Broadway Theater',
    address: '243 West 42nd Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10036',
    capacity: 1500,
    description: 'Historic Broadway theater with excellent acoustics and sightlines.',
    image: '/api/placeholder/800/600',
    amenities: ['Bar', 'Coat Check', 'Accessibility', 'Historic Architecture'],
    contact: {
      phone: '(212) 239-6200',
      email: 'info@broadwaytheater.com'
    }
  },
  {
    id: '4',
    name: 'Central Park',
    address: 'Central Park West',
    city: 'New York',
    state: 'NY',
    zipCode: '10024',
    capacity: 10000,
    description: 'Beautiful outdoor venue in the heart of Manhattan.',
    image: '/api/placeholder/800/600',
    amenities: ['Outdoor Space', 'Scenic Views', 'Accessibility', 'Nearby Restaurants'],
    contact: {
      phone: '(212) 310-6600',
      email: 'events@centralparknyc.org'
    }
  },
  {
    id: '5',
    name: 'Modern Art Museum',
    address: '11 West 53rd Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10019',
    capacity: 300,
    description: 'Contemporary art museum with flexible exhibition spaces.',
    image: '/api/placeholder/800/600',
    amenities: ['Gallery Space', 'Museum Shop', 'Café', 'Accessibility', 'Parking'],
    contact: {
      phone: '(212) 708-9400',
      email: 'info@moma.org'
    }
  },
  {
    id: '6',
    name: 'Blue Note Jazz Club',
    address: '131 West 3rd Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10012',
    capacity: 200,
    description: 'Intimate jazz club with world-class acoustics and atmosphere.',
    image: '/api/placeholder/800/600',
    amenities: ['Full Bar', 'Restaurant', 'Intimate Setting', 'Professional Sound System'],
    contact: {
      phone: '(212) 475-8592',
      email: 'info@bluenotejazz.com'
    }
  }
];

// Fixed seating arrangement - no more random generation
const generateFixedSeats = () => {
  const seats: Seat[] = [];
  
  // Orchestra section - 10 rows, 10 seats each
  for (let row = 0; row < 10; row++) {
    const rowLetter = String.fromCharCode(65 + row); // A, B, C, etc.
    for (let seatNum = 1; seatNum <= 10; seatNum++) {
      const seatId = `orchestra-${rowLetter}${seatNum}`;
      // Fixed availability pattern - some specific seats are occupied
      const occupiedSeats = [
        'orchestra-A1', 'orchestra-A2', 'orchestra-B5', 'orchestra-C3', 
        'orchestra-C8', 'orchestra-D1', 'orchestra-D9', 'orchestra-E4',
        'orchestra-F6', 'orchestra-F7', 'orchestra-G2', 'orchestra-H5',
        'orchestra-I3', 'orchestra-J8', 'orchestra-J9'
      ];
      
      seats.push({
        id: seatId,
        row: rowLetter,
        number: seatNum,
        section: 'Orchestra',
        price: 75,
        isAvailable: !occupiedSeats.includes(seatId),
        isSelected: false
      });
    }
  }
  
  // Balcony section - 5 rows, 10 seats each
  for (let row = 0; row < 5; row++) {
    const rowLetter = String.fromCharCode(65 + row); // A, B, C, D, E
    for (let seatNum = 1; seatNum <= 10; seatNum++) {
      const seatId = `balcony-${rowLetter}${seatNum}`;
      // Fixed availability pattern for balcony
      const occupiedSeats = [
        'balcony-A3', 'balcony-A7', 'balcony-B2', 'balcony-B9',
        'balcony-C5', 'balcony-D1', 'balcony-D6', 'balcony-E4', 'balcony-E8'
      ];
      
      seats.push({
        id: seatId,
        row: rowLetter,
        number: seatNum,
        section: 'Balcony',
        price: 50,
        isAvailable: !occupiedSeats.includes(seatId),
        isSelected: false
      });
    }
  }
  
  // VIP section - 3 rows, 6 seats each
  for (let row = 0; row < 3; row++) {
    const rowLetter = String.fromCharCode(65 + row); // A, B, C
    for (let seatNum = 1; seatNum <= 6; seatNum++) {
      const seatId = `vip-${rowLetter}${seatNum}`;
      // Fixed availability pattern for VIP
      const occupiedSeats = ['vip-A1', 'vip-B3', 'vip-C2', 'vip-C6'];
      
      seats.push({
        id: seatId,
        row: rowLetter,
        number: seatNum,
        section: 'VIP',
        price: 150,
        isAvailable: !occupiedSeats.includes(seatId),
        isSelected: false
      });
    }
  }
  
  return seats;
};

export const mockSeats: Seat[] = generateFixedSeats();

export const mockTickets: Ticket[] = [
  {
    id: 'ticket-1',
    eventId: '1',
    seatId: 'seat-1',
    userId: 'user-1',
    purchaseDate: '2024-07-15',
    price: 75,
    status: 'active'
  },
  {
    id: 'ticket-2',
    eventId: '2',
    seatId: 'seat-2',
    userId: 'user-1',
    purchaseDate: '2024-07-16',
    price: 299,
    status: 'active'
  }
];
