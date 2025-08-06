// Test script to verify venue creation with images
// Run this in the browser console on the venue creation page

const testVenueCreation = {
  // Test data for venue creation
  testData: {
    name: "Test Venue with Images",
    location: "Test City, Test State",
    capacity: 500,
    description: "A test venue with multiple images",
    images: [
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...", // Sample base64 image
      "https://example.com/venue-image-1.jpg",
      "https://example.com/venue-image-2.jpg"
    ],
    featuredImage: "https://example.com/venue-featured.jpg",
    contact: {
      phone: "+1-555-0123",
      email: "contact@testvenue.com"
    },
    amenities: ["WiFi", "Parking", "Restrooms"],
    seatMap: {
      rows: 10,
      columns: 20,
      sections: [{
        id: "general",
        name: "General",
        rows: 10,
        columns: 20,
        price_multiplier: 1.0,
        color: "#3B82F6",
        startRow: 0,
        startCol: 0
      }],
      aisles: [5],
      wheelchair_accessible: [1, 10],
      special_features: [],
      layout_type: "standard"
    }
  },

  // Test function to validate venue creation API
  testAPI: async () => {
    console.log('🧪 Testing venue creation API...');
    
    try {
      const response = await fetch('http://localhost:4000/api/venues/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token' // Replace with real token
        },
        body: JSON.stringify(testVenueCreation.testData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Test successful:', result);
        return result;
      } else {
        const error = await response.text();
        console.error('❌ Test failed:', error);
        return { error };
      }
    } catch (error: any) {
      console.error('❌ Network error:', error);
      return { error: error?.message || 'Unknown error' };
    }
  },

  // Helper to check current form data
  checkFormData: () => {
    const nameInput = document.querySelector('input[placeholder*="venue name"]') as HTMLInputElement;
    const locationInput = document.querySelector('input[placeholder*="location"]') as HTMLInputElement;
    
    console.log('📝 Current form state:', {
      hasName: !!nameInput?.value,
      hasLocation: !!locationInput?.value,
      imageCount: document.querySelectorAll('img[alt*="Venue image"]').length,
      hasFeaturedButton: !!document.querySelector('.bg-primary'),
    });
  }
};

// Make available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testVenueCreation = testVenueCreation;
}

console.log('🧪 Venue creation test utilities loaded!');
console.log('Use testVenueCreation.testAPI() to test the API');
console.log('Use testVenueCreation.checkFormData() to check form state');
