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
    console.log('🔄 Attempting to get Firebase ID token...');
    
    // Check if user is properly initialized
    if (!user.uid) {
      throw new Error('User not properly initialized');
    }
    
    // Try to get token without forcing refresh first
    let token: string;
    try {
      token = await user.getIdToken(false);
      console.log('🎫 Token obtained (cached), length:', token.length);
    } catch (tokenError) {
      console.log('⚠️ Cached token failed, trying refresh...', tokenError);
      token = await user.getIdToken(true);
      console.log('🎫 Token obtained (refreshed), length:', token.length);
    }
    
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
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout
    
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('📨 Request sent, awaiting response...');
    return response;
  } catch (error) {
    console.error('❌ Failed to get authentication token:', error);
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error('Authentication failed - please sign in again');
  }
};
