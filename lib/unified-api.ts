/**
 * Unified Service Integration Layer
 * Handles data consistency with unified PostgreSQL database in Event/Venue Service
 * Previously managed data across Event/Venue Service (PostgreSQL) and Ticket Service (SQLite)
 * Now consolidated into a single PostgreSQL database for better consistency and performance
 */

import { User as FirebaseUser } from 'firebase/auth';
import { secureFetch } from '@/utils/secureFetch';
import { 
  // Event/Venue Service functions (now handles all operations including tickets)
  fetchEvents,
  fetchEventById,
  fetchVenues,
  fetchVenueById,
  
  // Legacy ticket service functions (now handled by Event/Venue Service)
  addToCart,
  fetchUserCart,
  createOrderFromCart,
  fetchUserOrders,
  fetchUserTickets,
  
  // Keep existing functions
  publicFetch
} from './api';

// Helper function to construct ticket service URLs (pointing to Ticket & Order Service)
function getTicketServiceUrl(endpoint: string): string {
  const rawBase = process.env.NEXT_PUBLIC_TICKET_SERVICE_URL || 'http://localhost:8000';
  const trimmed = rawBase.replace(/\/$/, '');
  // Don't add /api if already present in the base URL
  const base = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  // Remove leading /api from endpoint if it starts with it to avoid duplication
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4); // Remove /api
  }
  return `${base}${cleanEndpoint}`;
}

// Helper function to construct Ticket and Order Service URLs (port 5000)
function getTicketOrderServiceUrl(endpoint: string): string {
  const rawBase = process.env.NEXT_PUBLIC_TICKET_SERVICE_URL || 'http://localhost:5000';
  const trimmed = rawBase.replace(/\/$/, '');
  // Remove leading /api from endpoint if it starts with it to avoid duplication
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4); // Remove /api
  }
  return `${trimmed}/api${cleanEndpoint}`;
}

// Helper function to construct API URLs
function getApiUrl(endpoint: string): string {
  const rawBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const trimmed = rawBase.replace(/\/$/, '');
  // Don't add /api if already present in the base URL
  const base = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  // Remove leading /api from endpoint if it starts with it to avoid duplication
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4); // Remove /api
  }
  return `${base}${cleanEndpoint}`;
}

// ==================== UNIFIED DATA TYPES ====================

export interface UnifiedUser {
  firebaseUid: string;
  email: string;
  displayName: string;
  role?: string;
}

export interface UnifiedEvent {
  id: number;
  title: string;  // From Event/Venue Service
  name?: string;  // For ticket service compatibility
  description: string;
  startDate: string;
  endDate?: string;
  venue?: UnifiedVenue; // Make venue optional
  status: string;
  category: string;
  type: string;
  eventAdminUid?: string;
  tenantId: number;
}

export interface UnifiedVenue {
  id: number;
  name: string;
  location?: string;  // Event/Venue Service field
  address?: string;   // Ticket Service field  
  city?: string;      // Ticket Service field
  capacity: number;
  description?: string;
  seatMap?: any;      // Event/Venue Service only
  tenantId?: number;
}

export interface TicketServiceBulkTicket {
  id: number;
  external_event_id: number;  // References Event/Venue Service
  external_venue_id: number;  // References Event/Venue Service
  seat_type: 'VIP' | 'REGULAR';
  price: number;
  total_seats: number;
  available_seats: number;
  seat_prefix: string;
  // Enriched data from Event/Venue Service
  event?: UnifiedEvent;
  venue?: UnifiedVenue;
}

// ==================== UNIFIED SERVICE LAYER ====================

/**
 * Get unified event data that combines Event/Venue Service with Ticket Service
 */
export async function getUnifiedEvent(eventId: number): Promise<UnifiedEvent | null> {
  try {
    // Validate eventId parameter
    if (!eventId || typeof eventId !== 'number') {
      console.warn('Invalid eventId provided to getUnifiedEvent:', eventId);
      return null;
    }
    
    // Get event from Event/Venue Service
    const eventData = await fetchEventById(eventId.toString());
    
    // Get venue data
    let venue = null;
    if (eventData.venueId) {
      venue = await fetchVenueById(eventData.venueId);
    }

    return {
      id: eventData.id,
      title: eventData.title,
      name: eventData.title, // For ticket service compatibility
      description: eventData.description,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      venue: venue ? {
        id: venue.id,
        name: venue.name,
        location: venue.location,
        capacity: venue.capacity,
        description: venue.description,
        seatMap: venue.seatMap,
        tenantId: venue.tenantId
      } : undefined,
      status: eventData.status,
      category: eventData.category,
      type: eventData.type,
      eventAdminUid: eventData.eventAdminUid,
      tenantId: eventData.tenantId
    };
  } catch (error) {
    console.error('Error fetching unified event:', error);
    return null;
  }
}

/**
 * Get all events with unified format
 */
export async function getUnifiedEvents(status?: string): Promise<UnifiedEvent[]> {
  try {
    const eventsResponse = await fetchEvents(status);
    const events = eventsResponse?.data || eventsResponse || [];
    
    const unifiedEvents: UnifiedEvent[] = [];
    
    for (const event of events) {
      // Skip events without valid IDs
      if (!event.id || typeof event.id !== 'number') {
        console.warn('Event missing valid ID:', event);
        continue;
      }
      
      const unifiedEvent = await getUnifiedEvent(event.id);
      if (unifiedEvent) {
        unifiedEvents.push(unifiedEvent);
      }
    }
    
    return unifiedEvents;
  } catch (error) {
    console.error('Error fetching unified events:', error);
    return [];
  }
}

/**
 * Get unified venue data
 */
export async function getUnifiedVenue(venueId: number): Promise<UnifiedVenue | null> {
  try {
    const venueData = await fetchVenueById(venueId);
    
    return {
      id: venueData.id,
      name: venueData.name,
      location: venueData.location,
      capacity: venueData.capacity,
      description: venueData.description,
      seatMap: venueData.seatMap,
      tenantId: venueData.tenantId
    };
  } catch (error) {
    console.error('Error fetching unified venue:', error);
    return null;
  }
}

/**
 * Get all venues with unified format  
 */
export async function getUnifiedVenues(): Promise<UnifiedVenue[]> {
  try {
    const venuesResponse = await fetchVenues();
    const venues = venuesResponse?.data || venuesResponse || [];
    
    return venues.map((venue: any) => ({
      id: venue.id,
      name: venue.name,
      location: venue.location,
      capacity: venue.capacity,
      description: venue.description,
      seatMap: venue.seatMap,
      tenantId: venue.tenantId
    }));
  } catch (error) {
    console.error('Error fetching unified venues:', error);
    return [];
  }
}

// ==================== TICKET SERVICE INTEGRATION ====================

/**
 * Create bulk tickets for an existing event (from Event/Venue Service)
 * This creates ticket inventory that references the existing event
 */
export async function createBulkTicketForEventUnified(eventId: number, bulkTicketData: {
  seat_type: 'VIP' | 'REGULAR';
  price: number;
  total_seats: number;
  seat_prefix: string;
  venue_id: number;
}) {
  const url = getTicketServiceUrl('/bulk-tickets');
  const res = await secureFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId: eventId,
      venueId: bulkTicketData.venue_id,
      seatType: bulkTicketData.seat_type,
      price: parseFloat(bulkTicketData.price.toString()),
      totalSeats: parseInt(bulkTicketData.total_seats.toString()),
      seatPrefix: bulkTicketData.seat_prefix
    })
  });
  
  if (!res.ok) throw new Error("Failed to create bulk tickets for event");
  return res.json();
}

/**
 * Get tickets for an event (enriched with Event/Venue Service data)
 */
export async function getEventTicketsWithDetails(eventId: number): Promise<TicketServiceBulkTicket[]> {
  try {
    // Validate eventId parameter
    if (!eventId || typeof eventId !== 'number') {
      console.warn('Invalid eventId provided to getEventTicketsWithDetails:', eventId);
      return [];
    }
    
    // Get bulk tickets from ticket service using the correct endpoint
  const url = getTicketServiceUrl(`/bulk-tickets/event/${eventId}`);
    const res = await publicFetch(url);
    
    if (!res.ok) {
      // If no tickets found in ticket service, return empty array
      if (res.status === 404) return [];
      throw new Error("Failed to fetch event tickets");
    }
    
    const bulkTickets = await res.json();
    
    // Enrich with Event/Venue Service data
    const event = await getUnifiedEvent(eventId);
    
    return bulkTickets.map((ticket: any) => ({
      ...ticket,
      event,
      venue: event?.venue
    }));
  } catch (error) {
    console.error('Error fetching event tickets:', error);
    return [];
  }
}

/**
 * Add to cart using Firebase UID (no need for ticket service user creation)
 */
export async function addToCartUnified(
  firebaseUid: string, 
  bulkTicketId: number,
  seatIds: string[],
  quantity: number = 1
) {
  const url = getTicketServiceUrl('/cart');
  const res = await secureFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firebaseUid: firebaseUid,
      bulkTicketId: bulkTicketId,
      preferredSeatIds: seatIds,
      quantity: quantity
    })
  });
  
  if (!res.ok) throw new Error("Failed to add item to cart");
  return res.json();
}/**
 * Get user cart using Firebase UID
 */
export async function getUserCartUnified(firebaseUid: string) {
  const url = getTicketServiceUrl(`/cart/user/${firebaseUid}/summary`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch user cart");
  
  const cartResponse = await res.json();
  
  // The backend returns { total_items, total_amount, items }
  // We need to work with the items array
  const cartItems = cartResponse.items || [];
  
  // Enrich cart items with event/venue data (though they should already be included from backend)
  for (const item of cartItems) {
    // The items already include bulkTicket.event and bulkTicket.venue from backend
    // No need to fetch additional data since we're using a unified database
  }
  
  return cartResponse; // Return the full response with items, total_items, total_amount
}

/**
 * Update cart item quantity using Firebase UID
 */
export async function updateCartItemUnified(
  cartItemId: number, 
  updates: { quantity?: number; preferred_seat_ids?: string }
) {
  const url = getTicketServiceUrl(`/cart/${cartItemId}`);
  const res = await secureFetch(url, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error("Failed to update cart item");
  return res.json();
}

/**
 * Remove item from cart using Firebase UID
 */
export async function removeFromCartUnified(cartItemId: number) {
  const url = getTicketServiceUrl(`/cart/${cartItemId}`);
  const res = await secureFetch(url, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error("Failed to remove item from cart");
  return res.json();
}

/**
 * Clear user cart using Firebase UID
 */
export async function clearUserCartUnified(firebaseUid: string) {
  // For clearing cart, we'll need to get cart items first and delete them individually
  const cartData = await getUserCartUnified(firebaseUid);
  if (cartData.items && cartData.items.length > 0) {
    for (const item of cartData.items) {
      await removeFromCartUnified(item.id);
    }
  }
  return { success: true };
}

/**
 * Create order using Firebase UID
 */
export async function createOrderUnified(firebaseUid: string, paymentMethod: string) {
  const url = getTicketServiceUrl(`/orders`);
  const res = await secureFetch(url, {
    method: 'POST',
    body: JSON.stringify({ 
      firebaseUid,
      paymentMethod
    })
  });
  if (!res.ok) throw new Error("Failed to create order");
  
  const order = await res.json();
  
  // Confirm any seat reservations for this order
  if (order.id) {
    try {
      // Get cart items to find events with seat reservations
      const cartItems = await getUserCartUnified(firebaseUid);
      
      for (const item of cartItems) {
        if (item.eventId && item.seatId) {
          await confirmSeatReservations(item.eventId, firebaseUid, order.id);
        }
      }
    } catch (error) {
      console.warn('Failed to confirm some seat reservations:', error);
    }
  }
  
  return order;
}

/**
 * Get user orders using Firebase UID
 */
export async function getUserOrdersUnified(firebaseUid: string) {
  const url = getTicketServiceUrl(`/orders/firebase/${firebaseUid}`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch user orders");
  
  // Orders are now already enriched with event/venue data from our unified database
  const orders = await res.json();
  console.log('API Response - Orders:', JSON.stringify(orders, null, 2));
  
  // Convert snake_case to camelCase for frontend compatibility
  const normalizedOrders = orders.map((order: any) => ({
    id: order.id,
    firebaseUid: order.firebase_uid,
    orderReference: order.order_reference,
    paymentIntentId: order.payment_intent_id,
    stripePaymentId: order.stripe_payment_id,
    totalAmount: order.total_amount,
    serviceFee: order.service_fee,
    status: order.status,
    notes: order.notes,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    completedAt: order.completed_at,
  }));
  
  return normalizedOrders;
}

/**
 * Get user tickets using Firebase UID
 */
export async function getUserTicketsUnified(firebaseUid: string) {
  const url = getTicketServiceUrl(`/orders/firebase/${firebaseUid}/tickets`);
  const res = await secureFetch(url);
  if (!res.ok) throw new Error("Failed to fetch user tickets");
  
  const tickets = await res.json();
  
  // Convert snake_case to camelCase for frontend compatibility
  const normalizedTickets = tickets.map((ticket: any) => ({
    id: ticket.id,
    orderId: ticket.order_id,
    bulkTicketId: ticket.bulk_ticket_id,
    firebaseUid: ticket.firebase_uid,
    seatId: ticket.seat_id,
    pricePaid: ticket.price_paid,
    status: ticket.status,
    qrCodeData: ticket.qr_code_data,
    issuedAt: ticket.issued_at,
    usedAt: ticket.used_at,
  }));
  
  return normalizedTickets;
}

// ==================== ANALYTICS WITH UNIFIED DATA ====================

/**
 * Get unified analytics that combines data from all services
 */
export async function getUnifiedAnalytics() {
  try {
    const [
      events,
      venues,
      // TODO: Implement analytics endpoints in Event/Venue Service
      // ticketAnalytics,
      // salesAnalytics
    ] = await Promise.all([
      getUnifiedEvents(),
      getUnifiedVenues(),
      // fetch(getTicketServiceUrl('/api/analytics/tickets')).then(r => r.json()),
      // fetch(getTicketServiceUrl('/api/analytics/sales')).then(r => r.json())
    ]);

    return {
      totalEvents: events.length,
      totalVenues: venues.length,
      approvedEvents: events.filter(e => e.status === 'APPROVED').length,
      pendingEvents: events.filter(e => e.status === 'PENDING').length,
      // ...ticketAnalytics,
      // ...salesAnalytics
    };
  } catch (error) {
    console.error('Error fetching unified analytics:', error);
    return null;
  }
}

// ==================== SEAT MAP FUNCTIONALITY ====================

export interface SeatMapSeat {
  id: string;
  row: string;
  number: number;
  section: string;
  seatType: 'VIP' | 'REGULAR';
  price: number;
  isAvailable: boolean;
  isReserved: boolean;
  reservedBy?: string;
}

export interface SeatMapSection {
  id: string;
  name: string;
  rows: SeatMapRow[];
}

// Unified data structures for all services
export interface UnifiedEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  price: number;
  image?: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  organizerId: string;
  venue: UnifiedVenue;
  venueId: number;
  category?: string;
  capacity?: number;
  ticketsSold?: number;
  availableTickets?: number;
}

export interface UnifiedVenue {
  id: number;
  name: string;
  location: string;
  capacity: number;
  seatMap?: VenueSeatMapData;
  tenantId?: number;
}

export interface VenueSeatMapData {
  sections: VenueSeatMapSection[];
  metadata: {
    totalSeats: number;
    lastUpdated: string;
  };
}

export interface VenueSeatMapSection {
  id: string;
  name: string;
  rows: number;
  columns: number;
  color: string;
  startCol: number;
  startRow: number;
  price_multiplier: number;
}

export interface GeneratedSeat {
  id: string;
  row: string;
  number: number;
  section: string;
  price: number;
  seatType: 'VIP' | 'REGULAR';
  isAvailable: boolean;
  isSelected: boolean;
  isReserved?: boolean;
}

export interface EventSeatAvailability {
  seatMap: {
    venueId: number;
    sections: VenueSeatMapSection[];
    metadata: {
      totalSeats: number;
      lastUpdated: string;
    };
  };
  soldSeats: string[];
  reservedSeats: { seatId: string; reservedBy: string; expiresAt: string }[];
}

// Legacy interfaces for backward compatibility
export interface SeatMapRow {
  id: string;
  name: string;
  seats: SeatMapSeat[];
}

export interface VenueSeatMap {
  venueId: number;
  sections: VenueSeatMapSection[];
  metadata: {
    totalSeats: number;
    lastUpdated: string;
  };
}

/**
 * Get venue seat map with real-time availability
 */
export async function getVenueSeatMap(venueId: number, eventId?: number): Promise<VenueSeatMap | null> {
  try {
    const url = getApiUrl(`/venues/${venueId}/seatmap${eventId ? `?eventId=${eventId}` : ''}`);
    const res = await publicFetch(url);
    if (!res.ok) throw new Error("Failed to fetch venue seat map");
    
    return res.json();
  } catch (error) {
    console.error('Error fetching venue seat map:', error);
    return null;
  }
}

/**
 * Get event-specific seat availability (combines seat map with sold tickets)
 */
export async function getEventSeatAvailability(eventId: number): Promise<{
  seatMap: VenueSeatMap;
  soldSeats: string[];
  reservedSeats: { seatId: string; reservedBy: string; expiresAt: string; }[];
} | null> {
  try {
    const url = getApiUrl(`/events/${eventId}/seats/availability`);
    const res = await publicFetch(url);
    if (!res.ok) throw new Error("Failed to fetch event seat availability");
    
    return res.json();
  } catch (error) {
    console.error('Error fetching event seat availability:', error);
    return null;
  }
}

/**
 * Reserve seats temporarily (for checkout process) - now handled by Ticket_and_Order_Service
 */
export async function reserveSeats(
  eventId: number, 
  seatIds: string[], 
  firebaseUid: string,
  duration: number = 300 // 5 minutes default
): Promise<{ success: boolean; reservationId: string; expiresAt: string; } | null> {
  try {
    const url = getTicketOrderServiceUrl(`/seat-reservations/${eventId}/reserve`);
    const res = await secureFetch(url, {
      method: 'POST',
      body: JSON.stringify({
        seatIds,
        firebaseUid,
        duration
      })
    });
    
    if (!res.ok) throw new Error("Failed to reserve seats");
    return res.json();
  } catch (error) {
    console.error('Error reserving seats:', error);
    return null;
  }
}

/**
 * Release seat reservations - now handled by Ticket_and_Order_Service
 */
export async function releaseSeats(reservationId: string): Promise<boolean> {
  try {
    const url = getTicketOrderServiceUrl(`/seat-reservations/release`);
    const res = await secureFetch(url, { 
      method: 'POST',
      body: JSON.stringify({ reservationId })
    });
    
    return res.ok;
  } catch (error) {
    console.error('Error releasing seat reservations:', error);
    return false;
  }
}

/**
 * Get seat reservations for an event - now handled by Ticket_and_Order_Service
 */
export async function getSeatReservations(
  eventId: number, 
  firebaseUid?: string
): Promise<any[]> {
  try {
    let url = getTicketOrderServiceUrl(`/seat-reservations/${eventId}`);
    if (firebaseUid) {
      url += `?firebase_uid=${firebaseUid}`;
    }
    
    const res = await secureFetch(url);
    if (!res.ok) throw new Error("Failed to get seat reservations");
    
    return res.json();
  } catch (error) {
    console.error('Error getting seat reservations:', error);
    return [];
  }
}

/**
 * Confirm seat reservations when order is created - now handled by Ticket_and_Order_Service
 */
export async function confirmSeatReservations(
  eventId: number, 
  firebaseUid: string,
  orderId: number
): Promise<{ success: boolean; confirmed: number; } | null> {
  try {
    const url = getTicketOrderServiceUrl(`/seat-reservations/${eventId}/confirm`);
    const res = await secureFetch(url, {
      method: 'POST',
      body: JSON.stringify({
        firebaseUid,
        orderId
      })
    });
    
    if (!res.ok) throw new Error("Failed to confirm seat reservations");
    return res.json();
  } catch (error) {
    console.error('Error confirming seat reservations:', error);
    return null;
  }
}