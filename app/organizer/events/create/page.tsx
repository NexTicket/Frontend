"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { Loading } from "@/components/ui/loading";
import {
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  Ticket,
  ArrowLeft,
  Check,
  ArrowRight,
} from "lucide-react";
import {
  fetchEvents,
  deleteEvent,
  fetchVenues,
  createEvent,
  createVenue,
  fetchEventsByOrganizer,
} from "@/lib/api";
import { Event } from "@/lib/mock-data";
import { AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  },
};

// Theme colors for matching admin dashboard
const darkBg = "#181A20";
const blueHeader = "#1877F2";
const cardBg = "#23262F";
const greenBorder = "#39FD48";
const cardShadow = "0 2px 16px 0 rgba(57,253,72,0.08)";

export default function OrganizerDashboard() {
  const { userProfile, firebaseUser, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [venues, setVenues] = useState<any[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [showVenueModal, setShowVenueModal] = useState(false);

  // Check authentication and organizer role
  useEffect(() => {
    if (!isLoading && (!firebaseUser || !userProfile)) {
      router.push("/auth/signin");
    } else if (!isLoading && userProfile && userProfile.role !== "organizer") {
      router.push("/dashboard"); // Redirect non-organizer users
    }
  }, [isLoading, firebaseUser, userProfile, router]);

  // Load events
  useEffect(() => {
    async function loadEvents() {
      try {
        setEventsLoading(true);
        // Fetch events for this organizer from event_and_venue_service backend
        if (userProfile?.uid) {
          const response = await fetchEventsByOrganizer(userProfile.uid);
          const eventsData = Array.isArray(response?.data) 
            ? response.data 
            : Array.isArray(response) 
            ? response 
            : [];
          setEvents(eventsData);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Failed to load events:", error);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    }

    if (userProfile?.role === "organizer") {
      loadEvents();
    }
  }, [userProfile]);

  // Fetch venues from backend
  useEffect(() => {
    async function loadVenues() {
      setVenuesLoading(true);
      try {
        const response = await fetchVenues();
        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setVenues(data);
      } catch (err) {
        setVenues([]);
      } finally {
        setVenuesLoading(false);
      }
    }
    loadVenues();
  }, []);

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(eventId);
        // Refresh events list
        const eventsData = await fetchEvents();
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        alert("Event deleted successfully!");
      } catch (error) {
        console.error("Failed to delete event:", error);
        alert("Failed to delete event");
      }
    }
  };

  // Show loading if auth is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading
          size="lg"
          text="Loading organizer dashboard..."
        />
      </div>
    );
  }

  const organizerEvents = Array.isArray(events) ? events : []; // Use real events

  const VenueCreationWizard = ({
    onClose,
    onCreated,
  }: {
    onClose: () => void;
    onCreated?: () => void;
  }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
      name: "",
      city: "",
      state: "",
      capacity: "",
      amenities: "",
      description: "",
    });

    const nextStep = () => {
      if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };
    const prevStep = () => {
      if (currentStep > 1) setCurrentStep(currentStep - 1);
    };
    const handleInputChange = (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = async () => {
      if (
        !formData.name ||
        !formData.city ||
        !formData.state ||
        !formData.capacity
      ) {
        setError("Please fill in all required fields");
        return;
      }
      setSubmitting(true);
      setError("");
      try {
        await createVenue({
          name: formData.name,
          city: formData.city,
          state: formData.state,
          capacity: Number(formData.capacity),
          amenities: formData.amenities.split(",").map((a) => a.trim()),
          description: formData.description,
        });
        if (onCreated) onCreated();
        onClose();
      } catch (err) {
        setError("Failed to create venue");
      } finally {
        setSubmitting(false);
      }
    };

    // Venue form stepper UI
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div
          className="rounded-2xl border p-0 overflow-hidden shadow-2xl"
          style={{
            backgroundColor: "#191C24",
            borderColor: "#39FD48",
            minWidth: 400,
            maxWidth: 500,
          }}
        >
          <div className="bg-blue-600 p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-1">
              Add New Venue
            </h3>
            <p className="text-blue-100">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          <div className="p-8">
            {/* Stepper */}
            <div className="flex items-center justify-center mb-8">
              {[...Array(totalSteps)].map((_, idx) => (
                <div key={idx} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      idx + 1 === currentStep
                        ? "border-primary bg-primary text-white"
                        : idx + 1 < currentStep
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 bg-gray-100 text-gray-400"
                    }`}
                  >
                    {idx + 1 < currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  {idx < totalSteps - 1 && (
                    <div
                      className={`w-10 h-0.5 mx-2 transition-all duration-300 ${
                        idx + 1 < currentStep ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            {/* Step Content */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      handleInputChange("name", e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder="Venue name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                      placeholder="State"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      handleInputChange("capacity", e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder="Capacity"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Amenities (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) =>
                      handleInputChange("amenities", e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder="WiFi, Parking, etc."
                  />
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder="Describe your venue..."
                  />
                </div>
                <div className="bg-gray-900 rounded-lg p-4 mt-4 border border-green-500 text-white">
                  <div>
                    <strong>Name:</strong> {formData.name}
                  </div>
                  <div>
                    <strong>Location:</strong> {formData.city}, {formData.state}
                  </div>
                  <div>
                    <strong>Capacity:</strong> {formData.capacity}
                  </div>
                  <div>
                    <strong>Amenities:</strong> {formData.amenities}
                  </div>
                  <div>
                    <strong>Description:</strong> {formData.description}
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="text-red-500 text-center mt-4">{error}</div>
            )}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  className="px-6 py-2 hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Create Venue
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show loading if auth is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            Loading organizer dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated or not organizer
  if (!firebaseUser || !userProfile || userProfile.role !== "organizer") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You need organizer privileges to access this page.
          </p>
          <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
        </div>
      </div>
    );
  }

  // Mock organizer data
  const organizer = {
    name: userProfile?.email?.split("@")[0] || "Event Organizer",
    email: userProfile?.email || "organizer@nexticket.com",
    totalEvents: Array.isArray(events) ? events.length : 0,
    totalRevenue: Array.isArray(events)
      ? events.reduce(
          (sum, event) =>
            sum +
            ((event.price || 0) * ((event.capacity || 0) - (event.availableTickets || 0))),
          0
        )
      : 0,
    totalTicketsSold: Array.isArray(events)
      ? events.reduce((sum, event) => sum + ((event.capacity || 0) - (event.availableTickets || 0)), 0)
      : 0,
    averageRating: 4.7,
  };

  const stats = [
    {
      title: "Total Events",
      value: organizer.totalEvents,
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      title: "Revenue",
      value: `$${organizer.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Tickets Sold",
      value: organizer.totalTicketsSold.toLocaleString(),
      icon: Ticket,
      color: "bg-purple-500",
    },
    {
      title: "Average Rating",
      value: organizer.averageRating,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "events", label: "My Events" },
    { id: "venues", label: "My Venues" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-screen" style={{ background: darkBg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Dashboard Header */}
        <div
          className="rounded-xl shadow-lg mb-8 flex items-center justify-between"
          style={{
            backgroundColor: blueHeader,
            borderRadius: "14px",
            padding: "1.2rem",
            color: "#fff",
            boxShadow: cardShadow,
            fontSize: "1rem",
          }}
        >
          <div>
            <h1
              className="font-bold mb-1"
              style={{ fontSize: "1.4rem" }}
            >
              Organizer Dashboard
            </h1>
            <p className="text-base">Welcome back, {organizer.name}!</p>
          </div>
        </div>

        {/* Tabs as small card buttons */}
        <div className="mb-8 flex gap-4">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 cursor-pointer rounded-lg shadow-md transition-all duration-200 text-center font-medium py-3 ${
                activeTab === tab.id ? "border" : "border"
              } ${
                activeTab === tab.id
                  ? "border-green-400"
                  : "border-gray-700"
              } hover:scale-105`}
              style={{
                backgroundColor: cardBg,
                color: "#fff",
                borderColor:
                  activeTab === tab.id ? greenBorder : "#23262F",
                boxShadow: cardShadow,
                fontSize: "1rem",
                borderWidth: "1px",
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Stats cards */}
        {activeTab === "overview" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                className="rounded-lg border p-4 flex flex-col items-start justify-between"
                style={{
                  backgroundColor: cardBg,
                  borderColor: greenBorder,
                  color: "#fff",
                  boxShadow: cardShadow,
                  minHeight: 90,
                  fontSize: "0.95rem",
                  borderWidth: "1px",
                }}
              >
                <div className="flex items-center mb-1">
                  <stat.icon className="w-5 h-5 mr-2" />
                  <span className="font-medium">{stat.title}</span>
                </div>
                <div
                  className="text-xl font-bold mb-1"
                  style={{ fontSize: "1.2rem" }}
                >
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tab Content Cards */}
        <div
          className="rounded-lg border p-4 shadow-md"
          style={{
            backgroundColor: cardBg,
            borderColor: greenBorder,
            boxShadow: cardShadow,
            borderWidth: "1px",
            fontSize: "0.95rem",
          }}
        >
          {activeTab === "events" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">My Events</h2>
                <Button
                  onClick={() => router.push("/organizer/events/new")}
                  className="flex items-center"
                  style={{ backgroundColor: darkBg, borderColor: greenBorder }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add New Event
                </Button>
              </div>
              {eventsLoading ? (
                <div className="text-center py-10">
                  <Loading
                    size="lg"
                    text="Loading your events..."
                  />
                </div>
              ) : (
                <div>
                  {organizerEvents.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">
                        You have not created any events yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {organizerEvents.map((event) => (
                        <div
                          key={event.id}
                          className="rounded-2xl border p-4 bg-background shadow-md flex flex-col sm:flex-row items-start sm:items-center"
                          style={{
                            backgroundColor: darkBg,
                            borderColor: greenBorder,
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/organizer/events/${event.id}`}
                              className="block text-lg font-semibold text-white truncate"
                            >
                              {event.title}
                            </Link>
                            <p className="text-sm text-muted-foreground truncate">
                              {event.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1">
                                {event.category}
                              </span>
                              <span className="text-xs rounded-full bg-secondary/10 text-secondary px-3 py-1">
                                {event.date}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 sm:mt-0 sm:ml-4">
                            <Button
                              onClick={() => handleDeleteEvent(event.id)}
                              variant="outline"
                              className="flex items-center text-red-500"
                              style={{
                                backgroundColor: darkBg,
                                borderColor: greenBorder,
                              }}
                            >
                              {/* Use a trash icon from lucide-react if imported */}
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "venues" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">My Venues</h2>
                <Button
                  onClick={() => setShowVenueModal(true)}
                  className="flex items-center"
                  style={{ backgroundColor: darkBg, borderColor: greenBorder }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add New Venue
                </Button>
              </div>
              {venuesLoading ? (
                <div className="text-center py-10">
                  <Loading
                    size="lg"
                    text="Loading your venues..."
                  />
                </div>
              ) : (
                <div>
                  {venues.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">
                        You have not added any venues yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {venues.map((venue) => (
                        <div
                          key={venue.id}
                          className="rounded-2xl border p-4 bg-background shadow-md flex flex-col sm:flex-row items-start sm:items-center"
                          style={{
                            backgroundColor: darkBg,
                            borderColor: greenBorder,
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/organizer/venues/${venue.id}`}
                              className="block text-lg font-semibold text-white truncate"
                            >
                              {venue.name}
                            </Link>
                            <p className="text-sm text-muted-foreground truncate">
                              {venue.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1">
                                {venue.city}, {venue.state}
                              </span>
                              <span className="text-xs rounded-full bg-secondary/10 text-secondary px-3 py-1">
                                Capacity: {venue.capacity}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 sm:mt-0 sm:ml-4">
                            <Button
                              onClick={() => handleDeleteEvent(venue.id)}
                              variant="outline"
                              className="flex items-center text-red-500"
                              style={{
                                backgroundColor: darkBg,
                                borderColor: greenBorder,
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Analytics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div
                    key={stat.title}
                    className="rounded-2xl border p-4 bg-background shadow-md flex flex-col"
                    style={{
                      backgroundColor: darkBg,
                      borderColor: greenBorder,
                    }}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </div>
                      <div className="text-lg font-bold text-white">
                        {stat.value}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div
                        className={`w-full h-1 rounded-full ${stat.color} bg-opacity-20`}
                      >
                        <div
                          className={`h-1 rounded-full ${stat.color}`}
                          style={{ 
                            width: `${(() => {
                              const numValue = typeof stat.value === 'number' ? stat.value : 
                                             parseFloat(String(stat.value).replace(/[^0-9.]/g, '')) || 0;
                              // For ratings, convert to percentage (4.7/5 = 94%)
                              if (stat.title === "Average Rating") {
                                return (numValue / 5) * 100;
                              }
                              // For other values, use a logarithmic scale to show relative progress
                              return Math.min(100, (numValue > 0 ? Math.log10(numValue + 1) * 20 : 0));
                            })()}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Venue Creation Modal */}
      <AnimatePresence>
        {showVenueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div
              className="rounded-xl border shadow-2xl"
              style={{
                backgroundColor: cardBg,
                borderColor: greenBorder,
                minWidth: 400,
                maxWidth: 500,
                boxShadow: cardShadow,
              }}
            >
              <div className="bg-blue-600 p-6 text-center rounded-t-xl">
                <h3 className="text-2xl font-bold text-white mb-1">
                  Add New Venue
                </h3>
              </div>
              <div className="p-8">
                <VenueCreationWizard
                  onClose={() => setShowVenueModal(false)}
                  onCreated={() => {
                    setShowVenueModal(false);
                    router.refresh();
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}