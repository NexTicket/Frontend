interface LockSeatsRequest {
  event_id: number;
  seat_ids: Array<{
    section: string;
    row_id: number;
    col_id: number;
  }>;
  bulk_ticket_id: string;
}

interface LockSeatsResponse {
  success?: boolean;
  message?: string;
  locked_seats?: string[];
  order_id?: string;
  user_id?: string;
  seat_ids?: string[];
  event_id?: number;
  expires_in_seconds?: number;
  expires_at?: string;
  payment_intent_id?: string;
  client_secret?: string;
}

interface UserLockedSeatsResponse {
  order_id: string;
  user_id: string;
  seat_ids: Array<{
    section: string;
    row_id: number;
    col_id: number;
  }>;
  event_id: number;
  status: string;
  expires_at: string;
  remaining_seconds: number;
  bulk_ticket_info?: {
    bulk_ticket_id: number;
    price_per_seat: number;
    seat_type: string;
  };
}

interface BulkTicketInfo {
  id: string | number;
  event_id: number;
  venue_id: number;
  seat_type: string;
  price: number;
  seat_prefix: string;
}

export interface UserTicketResponse {
  id: string | number;
  order_id: string | number;
  qr_code_data: string;
  seat_id: string;
  price_paid: number;
  status: string;
  created_at: string;
  bulk_ticket: BulkTicketInfo;
}

const TICKET_APIGATEWAY_URL = (process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000')+ '/ticket_service/api';
const TICKET_PUBLIC_URL = (process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000')+ '/ticket_service/public';

export async function getUserLockedSeats(): Promise<UserLockedSeatsResponse> {
  try {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      throw new Error('This function can only be called on the client side');
    }

    // Import Firebase modules
    const { getAuth, onAuthStateChanged } = await import('firebase/auth');
    const auth = getAuth();
    
    // Wait for auth state to be ready using a Promise
    const user = await new Promise<any>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe(); // Stop listening after first state change
        resolve(user);
      });
    });
    
    if (!user) {
      console.warn('No authenticated user found. Using mock data instead.');
      // Return mock data for development/testing matching the expected structure
      return {
        order_id: 'mock-order-1',
        user_id: 'mock-user-id',
        seat_ids: [
          { section: 'economy', row_id: 0, col_id: 0 },
          { section: 'economy', row_id: 0, col_id: 1 }
        ],
        event_id: 1,
        status: 'locked',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
        remaining_seconds: 10 * 60,
        bulk_ticket_info: {
          bulk_ticket_id: 1,
          price_per_seat: 200.0,
          seat_type: 'VIP'
        }
      };
    }
    
    const token = await user.getIdToken();

    const response = await fetch(`${TICKET_APIGATEWAY_URL}/ticket-locking/locked-seats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user locked seats:', error);
    throw error;
  }
}



export async function lockSeats({
  event_id,
  seat_ids,
  bulk_ticket_id
}: LockSeatsRequest): Promise<LockSeatsResponse> {
  try {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      throw new Error('This function can only be called on the client side');
    }

    // Import Firebase modules
    const { getAuth, onAuthStateChanged } = await import('firebase/auth');
    const auth = getAuth();
    
    // Wait for auth state to be ready using a Promise
    const user = await new Promise<any>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe(); // Stop listening after first state change
        resolve(user);
      });
    });
    
    if (!user) {
      console.warn('No authenticated user found. Cannot lock seats without authentication.');
      throw new Error('User not authenticated');
    }
    
    const token = await user.getIdToken();

    const response = await fetch(`${TICKET_APIGATEWAY_URL}/ticket-locking/lock-seats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        event_id,
        seat_ids,
        bulk_ticket_id
      })
    });
    
    if (!response.ok) {
      // Handle 409 Conflict specifically
      if (response.status === 409) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Seats already locked by other users';
        throw new Error(`HTTP 409: ${errorMessage}`);
      }
      
      // Handle other errors
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.detail || errorData?.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error locking seats:', error);
    throw error;
  }
}

export async function getUserTickets(): Promise<UserTicketResponse[]> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('This function can only be called on the client side');
    }

    const { getAuth, onAuthStateChanged } = await import('firebase/auth');
    const auth = getAuth();

    const user = await new Promise<any>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (authUser) => {
        unsubscribe();
        resolve(authUser);
      });
    });

    if (!user) {
      console.warn('No authenticated user found. Returning empty ticket list.');
      return [];
    }

    const token = await user.getIdToken();

    const response = await fetch(`${TICKET_APIGATEWAY_URL}/tickets/user/tickets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Unexpected response format when fetching user tickets');
    }

    return data as UserTicketResponse[];
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
}

interface CreateBulkTicketRequest {
  event_id: number;
  venue_id: number;
  seat_type: string;
  price: number;
  total_seats: number;
  available_seats: number;
  seat_prefix: string;
}

interface CreateBulkTicketResponse {
  success?: boolean;
  message?: string;
  data?: any;
}

export async function createBulkTicket(ticketData: CreateBulkTicketRequest): Promise<CreateBulkTicketResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('This function can only be called on the client side');
    }

    const { getAuth, onAuthStateChanged } = await import('firebase/auth');
    const auth = getAuth();

    const user = await new Promise<any>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (authUser) => {
        unsubscribe();
        resolve(authUser);
      });
    });

    if (!user) {
      console.warn('No authenticated user found. Cannot create bulk ticket without authentication.');
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    const response = await fetch(`${TICKET_APIGATEWAY_URL}/venues-events/bulk-tickets/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(ticketData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating bulk ticket:', error);
    throw error;
  }
}

export interface BulkTicket {
  id: number;
  event_id: number;
  venue_id: number;
  seat_type: string;
  price: number;
  total_seats: number;
  available_seats: number;
  created_at: string;
  seat_prefix: string;
}

export async function getEventBulkTickets(eventId: number): Promise<BulkTicket[]> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('This function can only be called on the client side');
    }

    const { getAuth, onAuthStateChanged } = await import('firebase/auth');
    const auth = getAuth();

    const user = await new Promise<any>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (authUser) => {
        unsubscribe();
        resolve(authUser);
      });
    });

    if (!user) {
      console.warn('No authenticated user found. Cannot fetch bulk tickets without authentication.');
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    const response = await fetch(`${TICKET_APIGATEWAY_URL}/venues-events/events/${eventId}/bulk-tickets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      const error: any = new Error(errorMessage);
      error.status = response.status; // Add status code to error
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching event bulk tickets:', error);
    throw error;
  }
}

export interface BulkTicketPrice {
  section: string;
  price: number;
  bulk_ticket_id: number;
}

export async function getBulkTicketPrices(venueId: number, eventId: number): Promise<BulkTicketPrice[]> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('This function can only be called on the client side');
    }

    const { getAuth, onAuthStateChanged } = await import('firebase/auth');
    const auth = getAuth();

    const user = await new Promise<any>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (authUser) => {
        unsubscribe();
        resolve(authUser);
      });
    });

    if (!user) {
      console.warn('No authenticated user found. Cannot fetch bulk ticket prices without authentication.');
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    const response = await fetch(`${TICKET_APIGATEWAY_URL}/tickets/bulk-ticket/prices?venue_id=${venueId}&event_id=${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching bulk ticket prices:', error);
    throw error;
  }
}

export interface SeatInfo {
  section: string;
  row_id: number;
  col_id: number;
}

export interface EventSeatStatusResponse {
  event_id: number;
  booked_seats: SeatInfo[];
  locked_seats: SeatInfo[];
}

export async function getEventSeatStatus(eventId: number): Promise<EventSeatStatusResponse> {
  try {
    // This endpoint doesn't require authentication as it's public information
    // Use the public ticket service route to avoid authentication
    console.log('[getEventSeatStatus] Fetching seat status for event:', eventId);
    const response = await fetch(`${TICKET_PUBLIC_URL}/api/ticket-locking/event-seat-status/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('[getEventSeatStatus] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[getEventSeatStatus] Error response:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[getEventSeatStatus] Received data:', data);
    console.log('[getEventSeatStatus] Booked seats count:', data.booked_seats?.length || 0);
    console.log('[getEventSeatStatus] Locked seats count:', data.locked_seats?.length || 0);
    console.log('[getEventSeatStatus] Sample booked seats:', data.booked_seats?.slice(0, 3));
    return data;
  } catch (error) {
    console.error('[getEventSeatStatus] Error fetching event seat status:', error);
    throw error;
  }
}