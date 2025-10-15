import { secureFetch } from "@/utils/secureFetch";
import { getAuth } from 'firebase/auth';

// Base API Gateway URL
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5050';

// Utility function to construct Event/Venue Service URLs through API Gateway
function getEventServiceUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_GATEWAY_URL}/event_service${cleanEndpoint}`;
}

// Utility function to construct User Service URLs through API Gateway
function getUserServiceUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_GATEWAY_URL}/user_service${cleanEndpoint}`;
}
// Utility function to construct venue service URLs (these might not need /api)
function getVenueServiceUrl(endpoint: string): string {
  const rawBase = process.env.NEXT_PUBLIC_EVENT_VENUE_SERVICE_URL || process.env.NEXT_PUBLIC_API_URL || '';
  const trimmed = rawBase.replace(/\/$/, '');
  
  // For venue service, we assume the endpoint already includes the correct path
  // If the base URL already ends with /api, use it as is
  // If not, add /api to the base (to match backend API structure)
  const base = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${base}${cleanEndpoint}`;
}

// Utility function to construct Ticket Service URLs through API Gateway
function getTicketServiceUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_GATEWAY_URL}/ticket_service${cleanEndpoint}`;
}

// Utility function for public endpoints (no auth required)
function getPublicUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_GATEWAY_URL}/public${cleanEndpoint}`;
}

// Legacy function for backward compatibility - now routes through gateway
function getApiUrl(endpoint: string): string {
  // Default to event service for backward compatibility
  return getEventServiceUrl(endpoint);
}

// function getVenueServiceUrl(endpoint: string): string {
//   return getEventServiceUrl(endpoint);
// }

// Public fetch function for endpoints that don't require authentication
export async function publicFetch(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {};
  
  // Only set Content-Type to application/json if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Add any existing headers
  if (options.headers) {
    const existingHeaders = options.headers as Record<string, string>;
    Object.assign(headers, existingHeaders);
  }

  return fetch(url, {
    ...options,
    headers
  });
}

// Optional auth fetch - uses auth token if user is logged in, otherwise makes public request
export async function optionalAuthFetch(url: string, options: RequestInit = {}) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      // User is logged in, use secureFetch
      return await secureFetch(url, options);
    } else {
      // No user, make public request
      return await publicFetch(url, options);
    }
  } catch (error) {
    // If auth check fails, fall back to public fetch
    console.warn('Auth check failed, using public fetch:', error);
    return await publicFetch(url, options);
  }
}

// API function to fetch checkin officers - now uses User Service
export const fetchCheckinOfficers = async () => {
  const url = getUserServiceUrl('/api/users/firebase-users');
  const response = await secureFetch(url, {
    method: 'POST',
    body: JSON.stringify({ role: 'checkin_officer' })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch checkin officers: ${errorText}`);
  }
  
  return response.json();
};

// API function to update event
export const updateEventDetails = async (eventId: string | number, eventData: any) => {
  const url = getEventServiceUrl(`/api/events/update-event/${eventId}`);
  const response = await secureFetch(url, {
    method: 'PUT',
    body: JSON.stringify(eventData)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event: ${errorText}`);
  }
  
  return response.json();
};

export const fetchVenueSeatMap = async (id: number | string) => {
  // Use public route for seat map - needed for customers to view available seats
  const url = `${API_GATEWAY_URL}/public/api/venues/${id}/seats`;
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch venue seat map");
  return res.json();
};

export async function fetchVenues() {
  // Use public route - accessible to everyone without auth
  const url = `${API_GATEWAY_URL}/public/api/venues`;
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch venues");
  return res.json();
}

export async function fetchFilteredVenues(filters: { 
  type?: string; 
  location?: { latitude: number; longitude: number; address: string } | null; 
  amenities?: string[] 
}) {
  // Build query string from filters
  const params = new URLSearchParams();
  if (filters.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters.location) {
    params.append('latitude', filters.location.latitude.toString());
    params.append('longitude', filters.location.longitude.toString());
    params.append('radius', '10'); // Default 10km radius
  }
  if (filters.amenities && filters.amenities.length > 0) {
    filters.amenities.forEach(amenity => params.append('amenities', amenity));
  }
  
  const queryString = params.toString();
  const url = getVenueServiceUrl(`/api/venues/filter${queryString ? `?${queryString}` : ''}`);
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch filtered venues");
  return res.json();
}

export async function fetchVenueAvailability(venueId: string | number, date: string, startTime?: string, endTime?: string) {
  const params = new URLSearchParams();
  params.append('venueId', venueId.toString());
  params.append('date', date);
  if (startTime) params.append('startTime', startTime);
  if (endTime) params.append('endTime', endTime);
  
  const queryString = params.toString();
  const url = getVenueServiceUrl(`/api/venues/${venueId}/availability?${queryString}`);
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch venue availability");
  return res.json();
}

export const fetchVenueById = async (id: number | string) => {
  // Use public route for venue details - accessible to everyone
  const url = `${API_GATEWAY_URL}/public/api/venues/getvenuebyid/${id}`;
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch venue");
  return res.json();
};

export async function createVenue(venueData: any) {
  const url = getEventServiceUrl('/api/venues');
  const res = await secureFetch(url, {
    method: 'POST',
    body: JSON.stringify(venueData)
  });
  if (!res.ok) throw new Error("Failed to create venue");
  return res.json();
}

export async function updateVenue(id: string, venueData: any) {
  const url = getEventServiceUrl(`/api/venues/${id}`);
  const res = await secureFetch(url, {
    method: 'PUT',
    body: JSON.stringify(venueData)
  });
  if (!res.ok) throw new Error("Failed to update venue");
  return res.json();
}

export async function uploadVenueImage(id: string, imageFile: File) {
  console.log('📤 API: Starting image upload for venue', id);
  console.log('📤 API: Image file details:', {
    name: imageFile.name,
    size: imageFile.size,
    type: imageFile.type
  });

  const formData = new FormData();
  formData.append('image', imageFile);
  
  console.log('📤 API: FormData created with field name "image"');
  console.log('📤 API: FormData instanceof FormData:', formData instanceof FormData);
  console.log('📤 API: typeof formData:', typeof formData);
  const url = getEventServiceUrl(`/api/venues/${id}/image`);
  
  console.log('📤 API: Making request to:', url);
  
  const res = await secureFetch(url, {
    method: 'POST',
    body: formData
    // No headers - let secureFetch and browser handle Content-Type
  });
  
  console.log('📤 API: Response status:', res.status);
  console.log('📤 API: Response headers:', Object.fromEntries(res.headers.entries()));
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('📤 API: Error response body:', errorText);
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    
    throw new Error(`Failed to upload venue image: ${res.status} - ${JSON.stringify(errorData)}`);
  }
  
  const result = await res.json();
  console.log('✅ API: Upload successful:', result);
  return result;
}

export async function uploadVenueImages(id: string, imageFiles: File[]) {
  // Take only the first image for single image upload
  const firstImage = imageFiles[0];
  
  if (!firstImage) {
    throw new Error("No image file provided");
  }
  
  console.log('📤 Preparing image upload:', {
    venueId: id,
    fileName: firstImage.name,
    fileSize: firstImage.size,
    fileType: firstImage.type
  });
  
  const formData = new FormData();
  formData.append('images', firstImage); // Use 'images' to match the route
  
  console.log('📤 FormData created with image field name: images');
  console.log('📤 Uploading to URL:', getEventServiceUrl(`/api/venues/${id}/images`));
  
  const res = await secureFetch(getEventServiceUrl(`/api/venues/${id}/images`), {
    method: 'POST',
    body: formData
    // No headers - let secureFetch and browser handle Content-Type
  });
  
  console.log('📤 Upload response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('📤 Upload failed with response:', errorText);
    throw new Error(`Failed to upload venue image: ${res.status} ${errorText}`);
  }
  
  const result = await res.json();
  console.log('✅ Upload successful:', result);
  return result;
}

export async function fetchEvents(status?: string) {
  // Use public route - events should be browsable by everyone
  const url = status ? `${API_GATEWAY_URL}/public/api/events?status=${status}` : `${API_GATEWAY_URL}/public/api/events`;
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

// Fetch events by organizer (using firebaseUid) - requires authentication
export async function fetchEventsByOrganizer(organizerId: string) {
  const url = getEventServiceUrl(`/api/events/organizer/${organizerId}`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch organizer events");
  return res.json();
}

export async function fetchEventsByVenueId(venueId: number | string) {
  // Use public route - anyone should be able to see events at a venue
  const url = `${API_GATEWAY_URL}/public/api/events/venue/${venueId}`;
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch events for venue");
  return res.json();
}

export async function fetchEventById(id: string) {
  // Use public route - event details should be viewable by everyone
  const url = `${API_GATEWAY_URL}/public/api/events/geteventbyid/${id}`;
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch event");
  return res.json();
}

//approveEvent and rejectEvent functions
export async function approveEvent(id: string, staffData?: {
  venueId?: string | number;
  eventAdminUid?: string;
  checkinOfficerUids?: string[];
}) {
  const body = staffData ? {
    venueId: staffData.venueId ? parseInt(String(staffData.venueId)) : undefined,
    eventAdminUid: staffData.eventAdminUid,
    checkinOfficerUids: staffData.checkinOfficerUids || []
  } : {};

  const res = await secureFetch(getEventServiceUrl(`/api/events/${id}/approve`), {
    method: 'POST',
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Failed to approve event");
  return res.json();
}

export async function rejectEvent(id: string) {
  const res = await secureFetch(getEventServiceUrl(`/api/events/${id}/reject`), {
    method: 'POST'
  });
  if (!res.ok) throw new Error("Failed to reject event");
  return res.json();
}

// Fetch events assigned to the current event admin
export async function fetchMyAssignedEvents() {
  const res = await secureFetch(getEventServiceUrl('/api/events/my-assigned-events'));
  if (!res.ok) throw new Error("Failed to fetch assigned events");
  return res.json();
}

// Fetch events assigned to the current checkin officer
export async function fetchMyCheckinEvents() {
  const res = await secureFetch(getEventServiceUrl('/api/events/my-checkin-events'));
  if (!res.ok) throw new Error("Failed to fetch checkin events");
  return res.json();
}

// Create a new event (status defaults to PENDING on the backend)
export async function createEvent(eventData: {
  title: string;
  description: string;
  category: string; // Should be Prisma enum Category on backend
  type: 'MOVIE' | 'EVENT' | string;
  startDate: string; // ISO date or YYYY-MM-DD
  endDate?: string;  // ISO date or YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  venueId?: string | number;
  image?: string;
}) {
  const body = {
    title: eventData.title,
    description: eventData.description,
    category: eventData.category,
    type: eventData.type,
    startDate: eventData.startDate,
    endDate: eventData.endDate ?? undefined,
    startTime: eventData.startTime ?? undefined,
    endTime: eventData.endTime ?? undefined,
    venueId: eventData.venueId !== undefined && eventData.venueId !== null ? String(eventData.venueId) : undefined,
    image: eventData.image ?? undefined
  };

  const res = await secureFetch(getEventServiceUrl('/api/events'), {
    method: 'POST',
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create event: ${res.status} ${text}`);
  }

  return res.json();
}

// Delete event by id
export async function deleteEvent(id: string) {
  // Backend route expects /api/events/delete-event/:id
  const res = await secureFetch(getEventServiceUrl(`/api/events/delete-event/${id}`), {
    method: 'DELETE'
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete event: ${res.status} ${text}`);
  }
  return res.json();
}

export async function fetchmyVenues() {
  const res = await secureFetch(getEventServiceUrl('/api/venues/myvenues'));
  if (!res.ok) throw new Error("Failed to fetch my venues");
  return res.json();
}

// Upload event image to Cloudinary via backend
export async function uploadEventImage(eventId: string | number, file: File) {
  const formData = new FormData();
  formData.append('image', file);
  const url = getEventServiceUrl(`/api/events/${eventId}/image`);
  const res = await secureFetch(url, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to upload event image: ${res.status} ${text}`);
  }
  return res.json();
}

// Tenant management functions - now uses User Service
export async function createTenant(tenantData: {
  firebaseUid: string;
  name: string;
  email: string;
  role: string;
}) {
  const res = await secureFetch(getUserServiceUrl('/api/users/tenants'), {
    method: 'POST',
    body: JSON.stringify(tenantData)
  });
  if (!res.ok) throw new Error("Failed to create tenant");
  return res.json();
}

export async function getTenantByFirebaseUid(firebaseUid: string) {
  const res = await secureFetch(getUserServiceUrl(`/api/users/tenants/firebase/${firebaseUid}`));
  if (!res.ok) throw new Error("Failed to fetch tenant");
  return res.json();
}

// Set Firebase custom claims for users - now uses User Service
export async function setUserClaims(firebaseUid: string, claims: { role: string }) {
  const res = await secureFetch(getUserServiceUrl('/api/users/set-claims'), {
    method: 'POST',
    body: JSON.stringify({ firebaseUid, claims })
  });
  if (!res.ok) throw new Error("Failed to set user claims");
  return res.json();
}

// Bootstrap admin role (no auth required - only for initial setup) - now uses User Service
export async function bootstrapAdmin(firebaseUid: string, email: string) {
  const res = await fetch(getUserServiceUrl('/api/users/bootstrap-admin'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ firebaseUid, email })
  });
  if (!res.ok) throw new Error("Failed to bootstrap admin");
  return res.json();
}

export async function deleteVenue(id: string) {
  const res = await secureFetch(getEventServiceUrl(`/api/venues/deletevenue/${id}`), {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error("Failed to delete venue");
  return res.json();
}

// Fetch users from Firebase for staff assignment - now uses User Service
export async function fetchFirebaseUsers(role?: string) {
  const res = await secureFetch(getUserServiceUrl('/api/users/firebase-users'), {
    method: 'POST',
    body: JSON.stringify({ role })
  });
  if (!res.ok) throw new Error("Failed to fetch Firebase users");
  return res.json();
}

// Ensure current user has a tenant record - now uses User Service
export async function ensureUserTenant() {

  const res = await secureFetch(getUserServiceUrl('/api/users/ensure-tenant'), {

    method: 'POST'
  });
  if (!res.ok) throw new Error("Failed to ensure user tenant");
  return res.json();
}
