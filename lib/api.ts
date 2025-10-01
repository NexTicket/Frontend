import { secureFetch } from "@/utils/secureFetch";

// Utility function to construct API URLs correctly
function getApiUrl(endpoint: string): string {
  const rawBase = process.env.NEXT_PUBLIC_API_URL || '';
  const trimmed = rawBase.replace(/\/$/, '');
  
  // If the base URL already ends with /api, use it as is
  // If not, add /api to the base
  const base = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${base}${cleanEndpoint}`;
}

// Utility function to construct venue service URLs (these might not need /api)
function getVenueServiceUrl(endpoint: string): string {
  const rawBase = process.env.NEXT_PUBLIC_EVENT_VENUE_SERVICE_URL || process.env.NEXT_PUBLIC_API_URL || '';
  const trimmed = rawBase.replace(/\/$/, '');
  
  // For venue service, we assume the endpoint already includes the correct path
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${trimmed}${cleanEndpoint}`;
}

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

// API function to fetch checkin officers
export const fetchCheckinOfficers = async () => {
  const url = getVenueServiceUrl('/api/users/firebase-users');
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
  const url = getVenueServiceUrl(`/api/events/update-event/${eventId}`);
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
  const url = getApiUrl(`/venues/${id}/seats`);
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch venue seat map");
  return res.json();
};

export async function fetchVenues() {
  // Use publicFetch since venues should be accessible to everyone
  const url = getVenueServiceUrl('/api/venues');
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch venues");
  return res.json();
}

export const fetchVenueById = async (id: number | string) => {
  const url = getVenueServiceUrl(`/api/venues/getvenuebyid/${id}`);
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch venue");
  return res.json();
};

export async function createVenue(venueData: any) {
  const url = getVenueServiceUrl('/api/venues');
  const res = await secureFetch(url, {
    method: 'POST',
    body: JSON.stringify(venueData)
  });
  if (!res.ok) throw new Error("Failed to create venue");
  return res.json();
}

export async function updateVenue(id: string, venueData: any) {
  const url = getVenueServiceUrl(`/api/venues/${id}`);
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
  const url = getVenueServiceUrl(`/api/venues/${id}/image`);
  
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
  console.log('📤 Uploading to URL:', getApiUrl(`/venues/${id}/images`));
  
  const res = await secureFetch(getVenueServiceUrl(`/api/venues/${id}/images`), {
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
  const url = status ? getVenueServiceUrl(`/api/events?status=${status}`) : getVenueServiceUrl('/api/events');
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

// Fetch events by organizer (using firebaseUid)
export async function fetchEventsByOrganizer(organizerId: string) {
  const url = getVenueServiceUrl(`/api/events/organizer/${organizerId}`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch organizer events");
  return res.json();
}

export async function fetchEventsByVenueId(venueId: number | string) {
  const res = await publicFetch(getVenueServiceUrl(`/api/events/venue/${venueId}`));
  if (!res.ok) throw new Error("Failed to fetch events for venue");
  return res.json();
}

export async function fetchEventById(id: string) {
  // Backend route currently exposes GET /api/events/geteventbyid/:id
  const res = await publicFetch(getVenueServiceUrl(`/api/events/geteventbyid/${id}`));
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

  const res = await secureFetch(getVenueServiceUrl(`/api/events/${id}/approve`), {
    method: 'POST',
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Failed to approve event");
  return res.json();
}

export async function rejectEvent(id: string) {
  const res = await secureFetch(getVenueServiceUrl(`/api/events/${id}/reject`), {
    method: 'POST'
  });
  if (!res.ok) throw new Error("Failed to reject event");
  return res.json();
}

// Fetch events assigned to the current event admin
export async function fetchMyAssignedEvents() {
  const res = await secureFetch(getVenueServiceUrl('/api/events/my-assigned-events'));
  if (!res.ok) throw new Error("Failed to fetch assigned events");
  return res.json();
}

// Fetch events assigned to the current checkin officer
export async function fetchMyCheckinEvents() {
  const res = await secureFetch(getVenueServiceUrl('/api/events/my-checkin-events'));
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

  const res = await secureFetch(getVenueServiceUrl('/api/events'), {
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
  const res = await secureFetch(getVenueServiceUrl(`/api/events/delete-event/${id}`), {
    method: 'DELETE'
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete event: ${res.status} ${text}`);
  }
  return res.json();
}

export async function fetchmyVenues() {
  const res = await secureFetch(getVenueServiceUrl('/venues/myvenues'));
  if (!res.ok) throw new Error("Failed to fetch my venues");
  return res.json();
}

// Upload event image to Cloudinary via backend
export async function uploadEventImage(eventId: string | number, file: File) {
  const formData = new FormData();
  formData.append('image', file);
  const url = getVenueServiceUrl(`/api/events/${eventId}/image`);
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

// Tenant management functions
export async function createTenant(tenantData: {
  firebaseUid: string;
  name: string;
  email: string;
  role: string;
}) {
  const res = await secureFetch(getApiUrl('/tenants'), {
    method: 'POST',
    body: JSON.stringify(tenantData)
  });
  if (!res.ok) throw new Error("Failed to create tenant");
  return res.json();
}

export async function getTenantByFirebaseUid(firebaseUid: string) {
  const res = await secureFetch(getApiUrl(`/tenants/firebase/${firebaseUid}`));
  if (!res.ok) throw new Error("Failed to fetch tenant");
  return res.json();
}

// Set Firebase custom claims for users
export async function setUserClaims(firebaseUid: string, claims: { role: string }) {
  const res = await secureFetch(getApiUrl('/users/set-claims'), {
    method: 'POST',
    body: JSON.stringify({ firebaseUid, claims })
  });
  if (!res.ok) throw new Error("Failed to set user claims");
  return res.json();
}

// Bootstrap admin role (no auth required - only for initial setup)
export async function bootstrapAdmin(firebaseUid: string, email: string) {
  const res = await fetch(getApiUrl('/users/bootstrap-admin'), {
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
  const res = await secureFetch(getApiUrl(`/venues/deletevenue/${id}`), {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error("Failed to delete venue");
  return res.json();
}

// Fetch users from Firebase for staff assignment
export async function fetchFirebaseUsers(role?: string) {
  const res = await secureFetch(getApiUrl('/users/firebase-users'), {
    method: 'POST',
    body: JSON.stringify({ role })
  });
  if (!res.ok) throw new Error("Failed to fetch Firebase users");
  return res.json();
}

// Ensure current user has a tenant record
export async function ensureUserTenant() {
  const res = await secureFetch(getApiUrl('/users/ensure-tenant'), {
    method: 'POST'
  });
  if (!res.ok) throw new Error("Failed to ensure user tenant");
  return res.json();
}