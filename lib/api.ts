import { secureFetch } from "@/utils/secureFetch";

export async function fetchVenues() {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/`);
  if (!res.ok) throw new Error("Failed to fetch venues");
  return res.json();
}

export async function fetchVenueById(id: string) {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/getvenuebyid/${id}`);
  if (!res.ok) throw new Error("Failed to fetch venue");
  return res.json();
}

export async function createVenue(venueData: any) {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/`, {
    method: 'POST',
    body: JSON.stringify(venueData)
  });
  if (!res.ok) throw new Error("Failed to create venue");
  return res.json();
}

export async function updateVenue(id: string, venueData: any) {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/${id}`, {
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
  console.log('📤 API: Making request to:', `${process.env.NEXT_PUBLIC_API_URL}/venues/${id}/image`);
  
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/${id}/image`, {
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
  console.log('📤 Uploading to URL:', `${process.env.NEXT_PUBLIC_API_URL}/venues/${id}/images`);
  
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/${id}/images`, {
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

export async function fetchEvents() {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/events/`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function fetchEventById(id: string) {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${id}`);
  if (!res.ok) throw new Error("Failed to fetch event");
  return res.json();
}

//approveEvent and rejectEvent functions
export async function approveEvent(id: string) {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${id}/approve`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error("Failed to approve event");
  return res.json();
}

export async function rejectEvent(id: string) {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${id}/reject`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error("Failed to reject event");
  return res.json();
}

export async function fetchmyVenues() {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/myvenues`);
  if (!res.ok) throw new Error("Failed to fetch my venues");
  return res.json();
}

// Tenant management functions
export async function createTenant(tenantData: {
  firebaseUid: string;
  name: string;
  email: string;
  role: string;
}) {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, {
    method: 'POST',
    body: JSON.stringify(tenantData)
  });
  if (!res.ok) throw new Error("Failed to create tenant");
  return res.json();
}

export async function getTenantByFirebaseUid(firebaseUid: string) {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/firebase/${firebaseUid}`);
  if (!res.ok) throw new Error("Failed to fetch tenant");
  return res.json();
}

// Set Firebase custom claims for users
export async function setUserClaims(firebaseUid: string, claims: { role: string }) {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/users/set-claims`, {
    method: 'POST',
    body: JSON.stringify({ firebaseUid, claims })
  });
  if (!res.ok) throw new Error("Failed to set user claims");
  return res.json();
}

// Bootstrap admin role (no auth required - only for initial setup)
export async function bootstrapAdmin(firebaseUid: string, email: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/bootstrap-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ firebaseUid, email })
  });
  if (!res.ok) throw new Error("Failed to bootstrap admin");
  return res.json();
}