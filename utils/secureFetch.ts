import { getAuth } from 'firebase/auth';

export const secureFetch = async (url: string, options: RequestInit = {}) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No user is logged in');
  }

  const token = await user.getIdToken();

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

  return fetch(url, {
    ...options,
    headers
  });
};
