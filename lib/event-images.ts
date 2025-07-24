// Event image mapping utility
// This file maps event IDs to their corresponding image paths in our organized structure

import { Event } from './mock-data';

export const eventImageMap: Record<string, {
  banner: string;
  thumbnail: string;
}> = {
  '1': {
    banner: '/Images/events/banners/rock-concert-2024.svg',
    thumbnail: '/Images/events/thumbnails/rock-concert-2024.jpg'
  },
  '2': {
    banner: '/Images/events/banners/tech-conference-2024.jpg',
    thumbnail: '/Images/events/thumbnails/tech-conference-2024.svg'
  },
  '3': {
    banner: '/Images/events/banners/broadway-musical.jpg',
    thumbnail: '/Images/events/thumbnails/broadway-musical.jpg'
  },
  '4': {
    banner: '/Images/events/banners/food-festival.jpg',
    thumbnail: '/Images/events/thumbnails/food-festival.jpg'
  },
  '5': {
    banner: '/Images/events/banners/art-gallery-opening.jpg',
    thumbnail: '/Images/events/thumbnails/art-gallery-opening.jpg'
  },
  '6': {
    banner: '/Images/events/banners/jazz-night.jpg',
    thumbnail: '/Images/events/thumbnails/jazz-night.jpg'
  },
  '7': {
    banner: '/Images/events/banners/summer-music-festival.jpg',
    thumbnail: '/Images/events/thumbnails/summer-music-festival.jpg'
  },
  '8': {
    banner: '/Images/events/banners/wine-tasting-event.jpg',
    thumbnail: '/Images/events/thumbnails/wine-tasting-event.jpg'
  }
};

// Utility function to get the appropriate image for an event
export const getEventImage = (eventId: string, type: 'banner' | 'thumbnail' = 'banner'): string => {
  const imageData = eventImageMap[eventId];
  if (imageData) {
    return imageData[type];
  }
  // Fallback to placeholder if no image is mapped
  return '/api/placeholder/600/400';
};

// Utility function to enhance events with proper images
export const enhanceEventWithImages = (event: Event) => {
  return {
    ...event,
    image: getEventImage(event.id, 'banner'),
    thumbnail: getEventImage(event.id, 'thumbnail')
  };
};
