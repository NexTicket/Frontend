// Test script to debug event creation
// Run in browser console while logged in

async function testEventCreation() {
  const eventData = {
    title: "Test Event",
    description: "This is a test event",
    category: "Technology",
    type: "EVENT",
    startDate: "2025-08-15",
    endDate: "2025-08-16",
    venueId: "1",
  };

  try {
    console.log("Testing event creation with data:", eventData);

    const response = await fetch("http://localhost:8000/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    console.log("Response status:", response.status);
    const result = await response.text();
    console.log("Response body:", result);

    if (!response.ok) {
      console.error("Request failed");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the test
testEventCreation();
