import { getAuth } from 'firebase/auth';

export const secureFetch = async (url: string, options: RequestInit = {}) => {
  console.log('🔐 secureFetch called with:', { url, method: options.method || 'GET' });
  
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error('❌ No user is logged in');
    throw new Error('No user is logged in');
  }

  console.log('👤 User found:', { uid: user.uid, email: user.email });

  try {
    const token = await user.getIdToken(true); // Force refresh token
    console.log('🎫 Token obtained, length:', token.length);
    
    // Don't set Content-Type if body is FormData - let the browser set it with boundary
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    // Only set Content-Type to application/json if body is not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add any existing headers AFTER checking FormData to avoid overriding Content-Type
    if (options.headers) {
      const existingHeaders = options.headers as Record<string, string>;
      // Don't override Content-Type if we detected FormData
      Object.keys(existingHeaders).forEach(key => {
        if (key.toLowerCase() === 'content-type' && options.body instanceof FormData) {
          // Skip Content-Type for FormData
          return;
        }
        headers[key] = existingHeaders[key];
      });
    }

    console.log('📤 Making request with headers:', { ...headers, Authorization: 'Bearer [REDACTED]' });
    
    const response = fetch(url, {
      ...options,
      headers
    });
    
    console.log('📨 Request sent, awaiting response...');
    return response;
  } catch (error) {
    console.error('❌ Failed to get authentication token:', error);
    throw new Error('Authentication failed - please sign in again');
  }
};
