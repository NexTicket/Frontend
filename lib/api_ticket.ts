interface LockSeatsRequest {
  event_id: number;
  seat_ids: string[];
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
  cart_id: string;
  user_id: string;
  seat_ids: string[];
  event_id: number;
  status: string;
  expires_at: string;
  remaining_seconds: number;
  bulk_ticket_info?: {
    additionalProp1?: {
      price_per_ticket?: number;
      seat_type?: string;
    };
  };
}

const APIGATEWAY_TICKET_URL = (process.env.API_GATEWAY_URL || 'http://localhost:5000' ) + '/ticket_service';

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
        cart_id: 'mock-cart-1',
        user_id: 'mock-user-id',
        seat_ids: ['Orchestra A1', 'Orchestra B2'],
        event_id: 1,
        status: 'locked',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
        remaining_seconds: 10 * 60,
        bulk_ticket_info: {
          additionalProp1: {
            price_per_ticket: 200.0,
            seat_type: 'VIP'
          }
        }
      };
    }
    
    const token = await user.getIdToken();

    const response = await fetch(`${APIGATEWAY_TICKET_URL}/api/ticket-locking/locked-seats`, {
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

    const response = await fetch(`${APIGATEWAY_TICKET_URL}/api/ticket-locking/lock-seats`, {
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error locking seats:', error);
    throw error;
  }
}