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

// Utility function to construct user service URLs
function getUserServiceUrl(endpoint: string): string {
  const rawBase = process.env.NEXT_PUBLIC_USER_SERVICE_URL || '';
  const trimmed = rawBase.replace(/\/$/, '');
  
  // For user service, we assume the endpoint already includes the correct path
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${trimmed}${cleanEndpoint}`;
}

// Utility function to construct ticket service URLs
function getTicketServiceUrl(endpoint: string): string {
  const rawBase = process.env.NEXT_PUBLIC_TICKET_SERVICE_URL || 'http://localhost:8000';
  const trimmed = rawBase.replace(/\/$/, '');
  
  // For ticket service, we assume the endpoint already includes the correct path
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
  const url = getApiUrl('/venues');
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch venues");
  return res.json();
}

export const fetchVenueById = async (id: number | string) => {
  const url = getApiUrl(`/venues/getvenuebyid/${id}`);
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch venue");
  return res.json();
};

export async function createVenue(venueData: any) {
  const url = getApiUrl('/venues/');
  const res = await secureFetch(url, {
    method: 'POST',
    body: JSON.stringify(venueData)
  });
  if (!res.ok) throw new Error("Failed to create venue");
  return res.json();
}

export async function updateVenue(id: string, venueData: any) {
  const url = getApiUrl(`/venues/${id}`);
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
  const url = getApiUrl(`/venues/${id}/image`);
  
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
  
  const res = await secureFetch(getApiUrl(`/venues/${id}/images`), {
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
  const url = status ? getApiUrl(`/events/?status=${status}`) : getApiUrl('/events/');
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function fetchEventsByVenueId(venueId: number | string) {
  const res = await publicFetch(getApiUrl(`/events/venue/${venueId}`));
  if (!res.ok) throw new Error("Failed to fetch events for venue");
  return res.json();
}

export async function fetchEventById(id: string) {
  // Backend route currently exposes GET /api/events/geteventbyid/:id
  const res = await publicFetch(getApiUrl(`/events/geteventbyid/${id}`));
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

  const res = await secureFetch(getApiUrl(`/events/${id}/approve`), {
    method: 'POST',
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Failed to approve event");
  return res.json();
}

export async function rejectEvent(id: string) {
  const res = await secureFetch(getApiUrl(`/events/${id}/reject`), {
    method: 'POST'
  });
  if (!res.ok) throw new Error("Failed to reject event");
  return res.json();
}

// Fetch events assigned to the current event admin
export async function fetchMyAssignedEvents() {
  const res = await secureFetch(getApiUrl('/events/my-assigned-events'));
  if (!res.ok) throw new Error("Failed to fetch assigned events");
  return res.json();
}

// Fetch events assigned to the current checkin officer
export async function fetchMyCheckinEvents() {
  const res = await secureFetch(getApiUrl('/events/my-checkin-events'));
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

  const res = await secureFetch(getApiUrl('/events'), {
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
  const res = await secureFetch(getApiUrl(`/events/delete-event/${id}`), {
    method: 'DELETE'
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete event: ${res.status} ${text}`);
  }
  return res.json();
}

export async function fetchmyVenues() {
  const res = await secureFetch(getVenueServiceUrl('/api/venues/myvenues'));
  if (!res.ok) throw new Error("Failed to fetch my venues");
  return res.json();
}

// Upload event image to Cloudinary via backend
export async function uploadEventImage(eventId: string | number, file: File) {
  const formData = new FormData();
  formData.append('image', file);
  const url = getApiUrl(`/events/${eventId}/image`);
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
  const res = await secureFetch(getApiUrl(`/venues/deletevenue/${id}`), {
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

// ==================== TICKET SERVICE API FUNCTIONS ====================

// Ticket Management Functions
export async function fetchUserTickets(userId: number) {
  const url = getTicketServiceUrl(`/api/tickets/user/${userId}/tickets`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch user tickets");
  return res.json();
}

export async function fetchTicketDetails(ticketId: number) {
  const url = getTicketServiceUrl(`/api/tickets/user-ticket/${ticketId}`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch ticket details");
  return res.json();
}

export async function fetchTicketQRData(ticketId: number) {
  const url = getTicketServiceUrl(`/api/tickets/user-ticket/${ticketId}/qr-data`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch ticket QR data");
  return res.json();
}

export async function fetchBulkTicketAvailableSeats(bulkTicketId: number) {
  const url = getTicketServiceUrl(`/api/tickets/bulk-ticket/${bulkTicketId}/available-seats`);
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch available seats");
  return res.json();
}

// Venue & Event Management (from Ticket Service)
export async function createTicketServiceVenue(venueData: {
  name: string;
  address: string;
  city: string;
  capacity: number;
  description?: string;
}) {
  const params = new URLSearchParams();
  params.append('name', venueData.name);
  params.append('address', venueData.address);
  params.append('city', venueData.city);
  params.append('capacity', venueData.capacity.toString());
  if (venueData.description) {
    params.append('description', venueData.description);
  }

  const url = getTicketServiceUrl(`/api/venues-events/venues/?${params}`);
  const res = await secureFetch(url, { method: 'POST' });
  if (!res.ok) throw new Error("Failed to create venue in ticket service");
  return res.json();
}

export async function fetchTicketServiceVenues(skip = 0, limit = 100) {
  const url = getTicketServiceUrl(`/api/venues-events/venues/?skip=${skip}&limit=${limit}`);
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch venues from ticket service");
  return res.json();
}

export async function fetchTicketServiceVenueById(venueId: number) {
  const url = getTicketServiceUrl(`/api/venues-events/venues/${venueId}`);
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch venue from ticket service");
  return res.json();
}

export async function fetchVenueEventsFromTicketService(venueId: number) {
  const url = getTicketServiceUrl(`/api/venues-events/venues/${venueId}/events`);
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch venue events from ticket service");
  return res.json();
}

export async function createTicketServiceEvent(eventData: {
  name: string;
  venue_id: number;
  event_date: string;
  description?: string;
}) {
  const params = new URLSearchParams();
  params.append('name', eventData.name);
  params.append('venue_id', eventData.venue_id.toString());
  params.append('event_date', eventData.event_date);
  if (eventData.description) {
    params.append('description', eventData.description);
  }

  const url = getTicketServiceUrl(`/api/venues-events/events/?${params}`);
  const res = await secureFetch(url, { method: 'POST' });
  if (!res.ok) throw new Error("Failed to create event in ticket service");
  return res.json();
}

export async function fetchTicketServiceEvents(skip = 0, limit = 100) {
  const url = getTicketServiceUrl(`/api/venues-events/events/?skip=${skip}&limit=${limit}`);
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch events from ticket service");
  return res.json();
}

export async function fetchTicketServiceEventById(eventId: number) {
  const url = getTicketServiceUrl(`/api/venues-events/events/${eventId}`);
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch event from ticket service");
  return res.json();
}

export async function fetchEventBulkTickets(eventId: number) {
  const url = getTicketServiceUrl(`/api/venues-events/events/${eventId}/bulk-tickets`);
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch event bulk tickets");
  return res.json();
}

// Bulk Ticket Management
export async function createBulkTickets(bulkTicketData: {
  event_id: number;
  venue_id: number;
  seat_type: 'VIP' | 'REGULAR';
  price: number;
  total_seats: number;
  available_seats: number;
  seat_prefix: string;
}) {
  const url = getTicketServiceUrl('/api/venues-events/bulk-tickets/');
  const res = await secureFetch(url, {
    method: 'POST',
    body: JSON.stringify(bulkTicketData)
  });
  if (!res.ok) throw new Error("Failed to create bulk tickets");
  return res.json();
}

export async function fetchBulkTicketById(bulkTicketId: number) {
  const url = getTicketServiceUrl(`/api/venues-events/bulk-tickets/${bulkTicketId}`);
  const res = await publicFetch(url);
  if (!res.ok) throw new Error("Failed to fetch bulk ticket");
  return res.json();
}

export async function createBulkTicketsForEvent(eventId: number, bulkTicketData: {
  venue_id: number;
  seat_type: 'VIP' | 'REGULAR';
  price: number;
  total_seats: number;
  seat_prefix: string;
}) {
  const params = new URLSearchParams();
  params.append('venue_id', bulkTicketData.venue_id.toString());
  params.append('seat_type', bulkTicketData.seat_type);
  params.append('price', bulkTicketData.price.toString());
  params.append('total_seats', bulkTicketData.total_seats.toString());
  params.append('seat_prefix', bulkTicketData.seat_prefix);

  const url = getTicketServiceUrl(`/api/venues-events/events/${eventId}/create-bulk-tickets?${params}`);
  const res = await secureFetch(url, { method: 'POST' });
  if (!res.ok) throw new Error("Failed to create bulk tickets for event");
  return res.json();
}

// Cart Management Functions
export async function addToCart(cartItemData: {
  user_id: number;
  bulk_ticket_id: number;
  preferred_seat_ids: string; // JSON string
  quantity: number;
}) {
  const url = getTicketServiceUrl('/api/cart/');
  const res = await secureFetch(url, {
    method: 'POST',
    body: JSON.stringify(cartItemData)
  });
  if (!res.ok) throw new Error("Failed to add item to cart");
  return res.json();
}

export async function fetchUserCart(userId: number) {
  const url = getTicketServiceUrl(`/api/cart/user/${userId}`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch user cart");
  return res.json();
}

export async function fetchCartSummary(userId: number) {
  const url = getTicketServiceUrl(`/api/cart/user/${userId}/summary`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch cart summary");
  return res.json();
}

export async function updateCartItem(cartItemId: number, updateData: {
  quantity?: number;
  preferred_seat_ids?: string;
}) {
  const url = getTicketServiceUrl(`/api/cart/${cartItemId}`);
  const res = await secureFetch(url, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
  if (!res.ok) throw new Error("Failed to update cart item");
  return res.json();
}

export async function removeFromCart(cartItemId: number) {
  const url = getTicketServiceUrl(`/api/cart/${cartItemId}`);
  const res = await secureFetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error("Failed to remove item from cart");
  return res.ok;
}

export async function clearUserCart(userId: number) {
  const url = getTicketServiceUrl(`/api/cart/user/${userId}/clear`);
  const res = await secureFetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error("Failed to clear user cart");
  return res.ok;
}

// Order Management Functions
export async function createOrderFromCart(userId: number, paymentMethod: string) {
  const url = getTicketServiceUrl(`/api/orders/create-from-cart/${userId}`);
  const params = new URLSearchParams();
  params.append('payment_method', paymentMethod);
  
  const res = await secureFetch(`${url}?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error("Failed to create order from cart");
  return res.json();
}

export async function completeOrder(orderId: number, paymentIntentId: string) {
  const url = getTicketServiceUrl(`/api/orders/${orderId}/complete`);
  const res = await secureFetch(url, {
    method: 'POST',
    body: JSON.stringify({ paymentIntentId })
  });
  if (!res.ok) throw new Error("Failed to complete order");
  return res.json();
}

export async function cancelOrder(orderId: number) {
  const url = getTicketServiceUrl(`/api/orders/${orderId}/cancel`);
  const res = await secureFetch(url, { method: 'POST' });
  if (!res.ok) throw new Error("Failed to cancel order");
  return res.json();
}

export async function fetchOrderById(orderId: number) {
  const url = getTicketServiceUrl(`/api/orders/${orderId}`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
}

export async function fetchUserOrders(userId: number) {
  const url = getTicketServiceUrl(`/api/orders/user/${userId}`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch user orders");
  return res.json();
}

export async function fetchOrderTickets(orderId: number) {
  const url = getTicketServiceUrl(`/api/orders/${orderId}/tickets`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch order tickets");
  return res.json();
}

export async function fetchOrderWithDetails(orderId: number) {
  const url = getTicketServiceUrl(`/api/orders/${orderId}/details`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch order details");
  return res.json();
}

export async function createPaymentIntent(orderId: number, amount: number) {
  const url = getTicketServiceUrl('/api/orders/create-payment-intent');
  const res = await secureFetch(url, {
    method: 'POST',
    body: JSON.stringify({ orderId, amount })
  });
  if (!res.ok) throw new Error("Failed to create payment intent");
  return res.json();
}

// User Management Functions (in Ticket Service)
export async function createTicketServiceUser(userData: {
  username: string;
  email: string;
  full_name: string;
  phone_number?: string;
}) {
  const url = getTicketServiceUrl('/api/users/');
  const res = await secureFetch(url, {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error("Failed to create user in ticket service");
  return res.json();
}

export async function fetchTicketServiceUsers(skip = 0, limit = 100) {
  const url = getTicketServiceUrl(`/api/users/?skip=${skip}&limit=${limit}`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch users from ticket service");
  return res.json();
}

export async function fetchTicketServiceUserById(userId: number) {
  const url = getTicketServiceUrl(`/api/users/${userId}`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch user from ticket service");
  return res.json();
}

export async function fetchTicketServiceUserByUsername(username: string) {
  const url = getTicketServiceUrl(`/api/users/username/${username}`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch user by username from ticket service");
  return res.json();
}

export async function updateTicketServiceUser(userId: number, userData: {
  username?: string;
  email?: string;
  full_name?: string;
  phone_number?: string;
  is_active?: boolean;
}) {
  const url = getTicketServiceUrl(`/api/users/${userId}`);
  const res = await secureFetch(url, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error("Failed to update user in ticket service");
  return res.json();
}

export async function deleteTicketServiceUser(userId: number) {
  const url = getTicketServiceUrl(`/api/users/${userId}`);
  const res = await secureFetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error("Failed to delete user from ticket service");
  return res.ok;
}

// Transaction Management Functions
export async function fetchTransactions(skip = 0, limit = 100) {
  const url = getTicketServiceUrl(`/api/transactions/?skip=${skip}&limit=${limit}`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function fetchTransactionById(transactionId: number) {
  const url = getTicketServiceUrl(`/api/transactions/${transactionId}`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch transaction");
  return res.json();
}

export async function fetchOrderTransactions(orderId: number) {
  const url = getTicketServiceUrl(`/api/transactions/order/${orderId}`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch order transactions");
  return res.json();
}

// Analytics Functions
export async function fetchDashboardAnalytics() {
  const url = getTicketServiceUrl('/api/analytics/dashboard');
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch dashboard analytics");
  return res.json();
}

export async function fetchSalesAnalytics() {
  const url = getTicketServiceUrl('/api/analytics/sales');
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch sales analytics");
  return res.json();
}

export async function fetchRevenueAnalytics() {
  const url = getTicketServiceUrl('/api/analytics/revenue');
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch revenue analytics");
  return res.json();
}

export async function fetchUserAnalytics() {
  const url = getTicketServiceUrl('/api/analytics/users');
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch user analytics");
  return res.json();
}

export async function fetchTicketAnalytics() {
  const url = getTicketServiceUrl('/api/analytics/tickets');
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch ticket analytics");
  return res.json();
}