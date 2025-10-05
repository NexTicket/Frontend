interface LockSeatsRequest {
  event_id: number;
  seat_ids: string[];
  bulk_ticket_id: string;
}

interface LockSeatsResponse {
  success: boolean;
  message?: string;
  locked_seats?: string[];
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

    // Get Firebase user token
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const token = await user.getIdToken();
    
    const response = await fetch('http://localhost:5000/ticket_service/api/ticket-locking/lock-seats', {
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