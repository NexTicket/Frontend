"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createEvent, fetchVenues, uploadEventImage, fetchVenueSeatMap, fetchVenueById, fetchFilteredVenues, fetchVenueAvailability } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, Image as ImageIcon, X, MapPin, Users, Building2, Grid3X3, Eye } from "lucide-react";

// Dynamic import for LocationPicker to avoid SSR issues
const LocationPicker = dynamic(() => import("@/components/ui/location-picker").then(mod => mod.LocationPicker), {
  loading: () => <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">Loading map...</div>
});

function NewEventPageInner() {
  const router = useRouter();
  const { } = useAuth();

  // mounted guard to avoid SSR/CSR markup mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalSteps = 6;
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    category: "",
    startDateDate: "",
    startDateTime: "",
    startHour: "",
    startMinute: "",
    endDateDate: "",
    endDateTime: "",
    endHour: "",
    endMinute: "",
    venueId: "",
    poster: "" // base64 image string
  });
  type VenueCard = {
    id: string | number;
    name: string;
    location?: string;
    capacity?: number;
    images?: string[];
    image?: string;
    featuredImage?: string;
    seatMap?: Record<string, unknown>;
    description?: string;
    type?: string;
    tenant?: {
      name: string;
    };
  };

  type SeatMapSection = {
    id: string;
    name: string;
    color: string;
    price_multiplier: number;
    startRow: number;
    startCol: number;
    rows: number;
    columns: number;
  };

  type SeatMapData = {
    rows?: number;
    columns?: number;
    sections?: SeatMapSection[];
    aisles?: number[];
    wheelchair_accessible?: number[];
    special_features?: string[];
  };

  const [venues, setVenues] = useState<VenueCard[]>([]);
  const [seatMapData, setSeatMapData] = useState<SeatMapData | null>(null);
  const [selectedVenueDetails, setSelectedVenueDetails] = useState<VenueCard | null>(null);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventAdminEmail, setEventAdminEmail] = useState("");
  const [checkInEmails, setCheckInEmails] = useState<string[]>([""]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Venue availability states
  const [venueAvailability, setVenueAvailability] = useState<any>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityLoaded, setAvailabilityLoaded] = useState(false);

  // Venue filter states
  const [venueFilters, setVenueFilters] = useState({
    type: 'all',
    location: null as { latitude: number; longitude: number; address: string } | null,
    amenities: [] as string[]
  });
  const [availableAmenities, setAvailableAmenities] = useState<string[]>([
    'WiFi', 'Parking', 'Air Conditioning', 'Sound System', 'Stage Lighting', 
    'Catering', 'Bar Service', 'Wheelchair Accessible', 'Restrooms', 'Security'
  ]);

  useEffect(() => {
    async function loadVenues() {
      setLoadingVenues(true);
      try {
        const res = await fetchFilteredVenues(venueFilters);
        const data: VenueCard[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        console.log('🎯 Venues loaded:', data);
        setVenues(data);
        if (data.length > 0 && !form.venueId) {
          const defaultVenueId = String(data[0].id) || "";
          console.log('🎯 Setting default venue ID:', defaultVenueId);
          setForm(prev => ({ ...prev, venueId: defaultVenueId }));
        }
      } catch (err) {
        console.error("Failed loading venues", err);
        setVenues([]);
      } finally {
        setLoadingVenues(false);
      }
    }
    loadVenues();
  }, [venueFilters, form.venueId]);

  // Reset selected venue when filters change
  useEffect(() => {
    const currentVenueExists = venues.some(v => String(v.id) === String(form.venueId));
    if (!currentVenueExists && venues.length > 0) {
      setForm(prev => ({ ...prev, venueId: String(venues[0].id) }));
    } else if (venues.length === 0) {
      setForm(prev => ({ ...prev, venueId: '' }));
    }
  }, [venues, form.venueId]);

  // Reset availability when modal closes
  useEffect(() => {
    if (!showVenueModal) {
      setAvailabilityLoaded(false);
      setVenueAvailability(null);
      setLoadingAvailability(false);
    }
  }, [showVenueModal]);

  // Auto-suggest venue type based on event category
  useEffect(() => {
    if (form.category && venueFilters.type === 'all') {
      const categoryToVenueType: Record<string, string> = {
        'Conference': 'Conference Centers',
        'Concert': 'Theatres',
        'Sports': 'Stadiums - Outdoor',
        'Workshop': 'Conference Centers',
        'Comedy': 'Theatres',
        'Festival': 'Parks and Gardens',
        'Theater': 'Theatres',
        'Meetup': 'Conference Centers',
        'Other': 'all'
      };
      
      const suggestedType = categoryToVenueType[form.category] || 'all';
      if (suggestedType !== 'all') {
        setVenueFilters(prev => ({ ...prev, type: suggestedType }));
      }
    }
  }, [form.category, venueFilters.type]);

  const loadVenueDetails = useCallback(async (venueId: string | number) => {
    try {
      setSelectedVenueDetails(null);
      setSeatMapData(null);
      // Don't reset venue availability here - we'll load it lazily
      
      // Fetch venue details first (fast)
      const venueData = await fetchVenueById(String(venueId));
      if (venueData?.data) {
        setSelectedVenueDetails(venueData.data);
        
        // Try to fetch seat map in parallel
        try {
          const seatMapPromise = fetchVenueSeatMap(String(venueId));
          const seatMapData = await seatMapPromise;
          if (seatMapData?.seatMap) {
            setSeatMapData(seatMapData.seatMap);
          } else if (venueData.data.seatMap) {
            // Use seatMap from venue data if available
            setSeatMapData(venueData.data.seatMap);
          }
        } catch (seatMapError) {
          console.warn('Failed to load seat map:', seatMapError);
          // Use venue's seatMap if available
          if (venueData.data.seatMap) {
            setSeatMapData(venueData.data.seatMap);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load venue details', e);
    }
  }, []); // Remove form dependencies since we don't fetch availability here anymore

  // Separate function to load availability lazily
  const loadVenueAvailability = useCallback(async (venueId: string | number) => {
    if (!form.startDateDate || !form.startHour || !form.startMinute) return;
    
    try {
      setLoadingAvailability(true);
      const startDate = new Date(form.startDateDate);
      const endDate = form.endDateDate ? new Date(form.endDateDate) : startDate;
      
      // Generate array of dates in the range
      const dates = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Check if venue is available for the entire period with the selected times
      const eventStartTime = `${form.startHour.padStart(2,'0')}:${form.startMinute.padStart(2,'0')}`;
      const eventEndTime = form.endHour && form.endMinute ? `${form.endHour.padStart(2,'0')}:${form.endMinute.padStart(2,'0')}` : null;
      
      // Fetch availability for each date in parallel
      const availabilityPromises = dates.map(date => 
        fetchVenueAvailability(venueId, date).catch(err => {
          console.warn(`Failed to fetch availability for ${date}:`, err);
          return { data: { events: [], availableSlots: [] } }; // Return empty data on error
        })
      );
      
      const availabilityResults = await Promise.all(availabilityPromises);
      
      // Check if the venue is available for our event times on each day
      const dailyAvailability = dates.map((date, index) => {
        const dayData = availabilityResults[index]?.data || { events: [], availableSlots: [] };
        const events = dayData.events || [];
        const availableSlots = dayData.availableSlots || [];
        
        // Check if our event time conflicts with existing events
        const hasConflict = events.some((event: any) => {
          if (!event.startTime) return false;
          const eventStart = event.startTime;
          const eventEnd = event.endTime || '23:59';
          
          // Check for time overlap
          const ourStart = eventStartTime;
          const ourEnd = eventEndTime || '23:59';
          
          return !(ourEnd <= eventStart || ourStart >= eventEnd);
        });
        
        // Check if our time slot is available
        const isTimeSlotAvailable = !hasConflict && (availableSlots.length === 0 || availableSlots.some((slot: any) => {
          const slotStart = slot.start;
          const slotEnd = slot.end;
          return eventStartTime >= slotStart && (!eventEndTime || eventEndTime <= slotEnd);
        }));
        
        return {
          date,
          events,
          availableSlots,
          isAvailableForEvent: isTimeSlotAvailable,
          conflictEvents: hasConflict ? events.filter((event: any) => {
            if (!event.startTime) return false;
            const eventStart = event.startTime;
            const eventEnd = event.endTime || '23:59';
            const ourStart = eventStartTime;
            const ourEnd = eventEndTime || '23:59';
            return !(ourEnd <= eventStart || ourStart >= eventEnd);
          }) : []
        };
      });
      
      setVenueAvailability({ dailyAvailability });
    } catch (availabilityError) {
      console.warn('Failed to load venue availability:', availabilityError);
      setVenueAvailability({ dailyAvailability: [] }); // Set empty on error
    } finally {
      setLoadingAvailability(false);
    }
  }, [form.startDateDate, form.endDateDate, form.startHour, form.startMinute, form.endHour, form.endMinute]);

  // Reload venue availability when venue or dates change
  useEffect(() => {
    if (form.venueId && form.startDateDate) {
      loadVenueDetails(form.venueId);
    }
  }, [form.venueId, form.startDateDate, form.endDateDate, loadVenueDetails]);

  const onChange = (k: string, v: string) => {
    console.log('🎯 Form onChange:', { key: k, value: v, currentForm: form });
    setForm(prev => ({ ...prev, [k]: v }));
  };

  const nextStep = () => {
    console.log('🎯 nextStep called:', { currentStep, form: form });
    if (currentStep === 1) {
      const missing = !form.title.trim() || !form.category.trim() || !form.startDateDate.trim();
      if (missing) {
        setError("Title, category, and start date are required.");
        return;
      }
      if (form.endDateDate && new Date(form.endDateDate) < new Date(form.startDateDate)) {
        setError("End date must be after start date.");
        return;
      }
    } else if (currentStep === 2) {
      if (!form.venueId) {
        setError("Please select a venue for your event.");
        return;
      }
    } else if (currentStep === 3) {
      if (!form.startHour || !form.startMinute) {
        setError("Please select start time for your event.");
        return;
      }
      if (form.endHour && form.endMinute) {
        const startTime = `${form.startHour.padStart(2,'0')}:${form.startMinute.padStart(2,'0')}`;
        const endTime = `${form.endHour.padStart(2,'0')}:${form.endMinute.padStart(2,'0')}`;
        if (startTime >= endTime) {
          setError("End time must be after start time.");
          return;
        }
      }
    }
    setError(null);
    setCurrentStep(s => Math.min(totalSteps, s + 1));
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep(s => Math.max(1, s - 1));
  };

  const handlePosterChange = async (files: FileList | null) => {
    console.log("File input triggered", files);
    if (!files || files.length === 0) return;
    const file = files[0];
    console.log("Selected file:", file.name, file.type);
    if (!file.type.startsWith("image/")) {
      console.log("Not an image file");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setForm(prev => ({ ...prev, poster: base64 }));
      console.log("File converted to base64");
    };
    reader.readAsDataURL(file);
  };

  const removePoster = () => setForm(prev => ({ ...prev, poster: "" }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category.trim() || !form.startDateDate.trim() || !form.venueId || !form.startHour || !form.startMinute) {
      setError("Title, category, start date, venue, and start time are required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const startTime = `${form.startHour.padStart(2,'0')}:${form.startMinute.padStart(2,'0')}`;
      const startDateIso = `${form.startDateDate}T${startTime}`;
      const endTime = form.endHour && form.endMinute ? `${form.endHour.padStart(2,'0')}:${form.endMinute.padStart(2,'0')}` : '';
      const endDateIso = form.endDateDate && endTime ? `${form.endDateDate}T${endTime}` : undefined;
      
      console.log('🎯 Creating event with data:', {
        title: form.title,
        description: form.description,
        category: form.category,
        startDate: startDateIso,
        endDate: endDateIso,
        startTime,
        endTime: endTime || undefined,
        venueId: form.venueId || undefined,
        formVenueId: form.venueId,
        formVenueIdType: typeof form.venueId
      });
      
      // Frontend validation: end must be after start when provided
      if (endDateIso && new Date(endDateIso).getTime() <= new Date(startDateIso).getTime()) {
        setError('End date/time must be after start date/time.');
        setSubmitting(false);
        return;
      }
      const created = await createEvent({
        title: form.title,
        description: form.description,
        // Normalize to backend enum values
        category: form.category.trim().toLowerCase(),
        type: 'EVENT',
        startDate: startDateIso,
        endDate: endDateIso,
        startTime,
        endTime: endTime || undefined,
        venueId: form.venueId || undefined,
        image: form.poster || undefined
      });
      // Upload poster if available using backend route
      try {
        const evId = (created?.data?.id ?? created?.id) as string | number | undefined;
        if (evId && selectedFile) {
          await uploadEventImage(evId, selectedFile);
        }
      } catch (e) {
        console.warn('Poster upload failed, continuing', e);
      }
      router.push("/organizer/dashboard");
          } catch (err) {
        console.error('❌ Event creation failed:', err);
        setError(`Failed to create event: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setSubmitting(false);
      }
  };

  const StepBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                currentStep > i + 1
                  ? 'text-white shadow-lg'
                  : currentStep === i + 1
                    ? 'text-white shadow-lg'
                    : 'text-gray-400'
              }`}
              style={{
                backgroundColor: currentStep > i + 1 ? '#39FD48' : currentStep === i + 1 ? blueHeader : cardBg,
                border: `2px solid ${currentStep >= i + 1 ? greenBorder : '#2a2d34'}`
              }}
            >
              {currentStep > i + 1 ? '✓' : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`w-24 h-1 mx-4 rounded-full transition-all duration-300`}
                style={{ backgroundColor: currentStep > i + 1 ? '#39FD48' : '#2a2d34' }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <span className="text-sm font-medium" style={{ color: '#fff' }}>
          Step {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  );

  // Theme colors matching admin dashboard
  const darkBg = "#181A20";
  const blueHeader = "#1877F2";
  const cardBg = "#23262F";
  const greenBorder = "#39FD48" + '50';
  const cardShadow = "0 2px 16px 0 rgba(57,253,72,0.08)";

  if (!mounted) return null;

  return (
    <div className="min-h-screen" style={{ background: darkBg }}>
      {/* Simple Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#ABA8A9' }}></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#D8DFEE' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: '#ABA8A9' }}></div>
      
      {/* Content Container */}
      <div className="relative z-10 pt-8 px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="rounded-2xl p-6 shadow-lg mb-8" style={{ backgroundColor: blueHeader, borderColor: greenBorder, boxShadow: cardShadow }}>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#fff' }}>Create New Event</h2>
            <p className="text-lg font-normal" style={{ color: '#fff' }}>Set up your event in a few guided steps</p>
          </div>

          <StepBar />

          <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
        {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold" style={{ color: '#fff' }}>Basic Information</h3>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#fff' }}>Title *</label>
                <input 
                  value={form.title} 
                  onChange={e => onChange("title", e.target.value)} 
                  className="w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#191C24', 
                    borderColor: greenBorder, 
                    color: '#fff'
                  }}
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#fff' }}>Category *</label>
                <select 
                  value={form.category} 
                  onChange={e => onChange("category", e.target.value)} 
                  className="w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#191C24', 
                    borderColor: greenBorder, 
                    color: '#fff'
                  }}
                >
                  <option value="" style={{ backgroundColor: '#191C24', color: '#fff' }}>Select category</option>
                  <option value="Concert" style={{ backgroundColor: '#191C24', color: '#fff' }}>Concert</option>
                  <option value="Conference" style={{ backgroundColor: '#191C24', color: '#fff' }}>Conference</option>
                  <option value="Comedy" style={{ backgroundColor: '#191C24', color: '#fff' }}>Comedy</option>
                  <option value="Workshop" style={{ backgroundColor: '#191C24', color: '#fff' }}>Workshop</option>
                  <option value="Sports" style={{ backgroundColor: '#191C24', color: '#fff' }}>Sports</option>
                  <option value="Festival" style={{ backgroundColor: '#191C24', color: '#fff' }}>Festival</option>
                  <option value="Theater" style={{ backgroundColor: '#191C24', color: '#fff' }}>Theater</option>
                  <option value="Meetup" style={{ backgroundColor: '#191C24', color: '#fff' }}>Meetup</option>
                  <option value="Other" style={{ backgroundColor: '#191C24', color: '#fff' }}>Other</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#fff' }}>Start Date *</label>
                  <input 
                    type="date" 
                    value={form.startDateDate} 
                    onChange={e => onChange("startDateDate", e.target.value)} 
                    min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                    className="w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#191C24', 
                      borderColor: greenBorder, 
                      color: '#fff'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#fff' }}>End Date (optional)</label>
                  <input 
                    type="date" 
                    value={form.endDateDate} 
                    onChange={e => onChange("endDateDate", e.target.value)} 
                    min={form.startDateDate || new Date().toISOString().split('T')[0]} // End date must be at least the start date
                    className="w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#191C24', 
                      borderColor: greenBorder, 
                      color: '#fff'
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#fff' }}>Description</label>
                <textarea 
                  value={form.description} 
                  onChange={e => onChange("description", e.target.value)} 
                  rows={4} 
                  className="w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    backgroundColor: '#191C24', 
                    borderColor: greenBorder, 
                    color: '#fff'
                  }}
                  placeholder="Describe your event..."
                />
              </div>
          </div>
        )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold" style={{ color: '#fff' }}>Venue Selection</h3>
              
              {/* Venue filtering info */}
              {form.category && (
                <div className="rounded-lg p-4" style={{ backgroundColor: '#191C24', borderColor: greenBorder, border: '1px solid' }}>
                  <p className="text-sm" style={{ color: '#ABA8A9' }}>
                    Showing venues suitable for <span className="font-semibold" style={{ color: '#fff' }}>{form.category}</span> events
                  </p>
                </div>
              )}

              {/* Venue Filters */}
              <div className="rounded-lg p-6" style={{ backgroundColor: '#191C24', borderColor: greenBorder, border: '1px solid' }}>
                <h4 className="text-lg font-semibold mb-4" style={{ color: '#fff' }}>Filter Venues</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Venue Type Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#fff' }}>Venue Type</label>
                    <select 
                      value={venueFilters.type}
                      onChange={(e) => setVenueFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: '#23262F', 
                        borderColor: greenBorder, 
                        color: '#fff'
                      }}
                    >
                      <option value="all" style={{ backgroundColor: '#23262F', color: '#fff' }}>All Types</option>
                      <option value="Banquet Halls" style={{ backgroundColor: '#23262F', color: '#fff' }}>Banquet Halls</option>
                      <option value="Conference Centers" style={{ backgroundColor: '#23262F', color: '#fff' }}>Conference Centers</option>
                      <option value="Country Clubs" style={{ backgroundColor: '#23262F', color: '#fff' }}>Country Clubs</option>
                      <option value="Cruise Ships" style={{ backgroundColor: '#23262F', color: '#fff' }}>Cruise Ships</option>
                      <option value="Museums and Art Galleries" style={{ backgroundColor: '#23262F', color: '#fff' }}>Museums and Art Galleries</option>
                      <option value="Parks and Gardens" style={{ backgroundColor: '#23262F', color: '#fff' }}>Parks and Gardens</option>
                      <option value="Rooftop Venues" style={{ backgroundColor: '#23262F', color: '#fff' }}>Rooftop Venues</option>
                      <option value="Stadiums - Indoor" style={{ backgroundColor: '#23262F', color: '#fff' }}>Stadiums - Indoor</option>
                      <option value="Stadiums - Outdoor" style={{ backgroundColor: '#23262F', color: '#fff' }}>Stadiums - Outdoor</option>
                      <option value="Theatres" style={{ backgroundColor: '#23262F', color: '#fff' }}>Theatres</option>
                      <option value="Universities and University Halls" style={{ backgroundColor: '#23262F', color: '#fff' }}>Universities and University Halls</option>
                    </select>
                  </div>

                  {/* Location Filter with Google Maps */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#fff' }}>Location</label>
                    <div className="space-y-2">
                      <LocationPicker
                        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                        onLocationSelect={(location) => {
                          setVenueFilters(prev => ({ ...prev, location }));
                        }}
                        initialLocation={venueFilters.location || undefined}
                        className="w-full"
                      />
                      {venueFilters.location && (
                        <div className="text-sm" style={{ color: '#ABA8A9' }}>
                          Selected: {venueFilters.location.address}
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setVenueFilters(prev => ({ ...prev, location: null }))}
                        style={{ 
                          backgroundColor: 'transparent', 
                          borderColor: greenBorder, 
                          color: '#fff' 
                        }}
                      >
                        Clear Location
                      </Button>
                    </div>
                  </div>

                  {/* Amenities Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#fff' }}>Amenities</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableAmenities.map(amenity => (
                        <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={venueFilters.amenities.includes(amenity)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setVenueFilters(prev => ({ 
                                  ...prev, 
                                  amenities: [...prev.amenities, amenity] 
                                }));
                              } else {
                                setVenueFilters(prev => ({ 
                                  ...prev, 
                                  amenities: prev.amenities.filter(a => a !== amenity) 
                                }));
                              }
                            }}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            style={{ accentColor: '#39FD48' }}
                          />
                          <span className="text-sm" style={{ color: '#ABA8A9' }}>{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVenueFilters({ type: 'all', location: null, amenities: [] })}
                    style={{ 
                      backgroundColor: 'transparent', 
                      borderColor: greenBorder, 
                      color: '#fff' 
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
              
              {/* Venue cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingVenues ? (
                  <div className="text-center py-8" style={{ color: '#fff' }}>Loading venues...</div>
                ) : venues.length === 0 ? (
                  <div className="text-center py-8 col-span-full" style={{ color: '#ABA8A9' }}>
                    No venues found matching your filters. Try adjusting your filter criteria.
                  </div>
                ) : (
                  venues.map((v: VenueCard) => {
                    const selected = String(form.venueId) === String(v.id);
                    const img = v.featuredImage || v.image || (Array.isArray(v.images) ? v.images[0] : '');
                    return (
                      <div 
                        key={v.id} 
                        className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:scale-105 ${selected ? 'ring-2' : ''}`} 
                        style={{ 
                          backgroundColor: cardBg, 
                          borderColor: selected ? '#39FD48' : greenBorder,
                          boxShadow: selected ? '0 0 0 2px rgba(57, 253, 72, 0.5)' : undefined
                        }} 
                        onClick={() => {
                          console.log('🎯 Venue card clicked:', { venueId: v.id, venueIdType: typeof v.id });
                          onChange('venueId', String(v.id));
                        }}
                      >
                        <div className="w-full h-32 overflow-hidden rounded-lg border mb-3 flex items-center justify-center" style={{ backgroundColor: '#191C24', borderColor: greenBorder }}>
                          {img ? <img src={img} alt="Venue" className="w-full h-full object-cover" /> : <div className="text-sm" style={{ color: '#ABA8A9' }}>No image</div>}
                        </div>
                        <div className="font-semibold" style={{ color: '#fff' }}>{v.name}</div>
                        <div className="text-sm" style={{ color: '#ABA8A9' }}>{v.location || '—'}</div>
                        <div className="text-sm" style={{ color: '#ABA8A9' }}>Capacity: {v.capacity ?? '—'}</div>
                        {v.type && <div className="text-xs px-2 py-1 rounded mt-1 inline-block" style={{ backgroundColor: '#39FD48', color: '#000' }}>{v.type.replace('_', ' ')}</div>}
                        <div className="mt-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={async (e) => { 
                              e.stopPropagation(); 
                              await loadVenueDetails(v.id); 
                              setShowVenueModal(true);
                              // Reset availability loaded state for new venue
                              setAvailabilityLoaded(false);
                              setVenueAvailability(null);
                            }}
                            style={{ 
                              backgroundColor: 'transparent', 
                              borderColor: greenBorder, 
                              color: '#fff' 
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
          </div>

              {/* Selected venue preview */}
              {form.venueId && (
                <div className="rounded-xl border p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-background/30" style={{ borderColor: 'rgb(57 253 72 / 40%)' }}>
                  {(() => {
                    const v: VenueCard | undefined = venues.find((vv: VenueCard) => String(vv.id) === String(form.venueId));
                    const img = v?.featuredImage || v?.image || (v?.images?.[0] ?? '');
                    return (
                      <>
                        <div className="md:col-span-1">
                          <div className="w-full h-32 overflow-hidden rounded-lg border border-border bg-background/50 flex items-center justify-center">
                            {img ? <img src={img} alt="Venue" className="w-full h-full object-cover" /> : <div className="text-muted-foreground text-sm">No image</div>}
          </div>
        </div>
                        <div className="md:col-span-2 flex items-center">
                          <div>
                            <div className="text-white font-semibold text-lg">{v?.name}</div>
                            <div className="text-muted-foreground text-sm">{v?.location}</div>
                            <div className="text-muted-foreground text-sm">Capacity: {v?.capacity ?? '—'}</div>
                            <div className="text-muted-foreground text-sm">Seat map: {(v?.seatMap ? 'Available' : '—')}</div>
      </div>
    </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Venue Details Modal */}
              {showVenueModal && selectedVenueDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                  <div className="bg-card/95 backdrop-blur-xl rounded-2xl border max-w-6xl w-full max-h-[90vh] overflow-y-auto" 
                    style={{ borderColor: 'rgb(57 253 72 / 50)', backgroundColor: '#191C24' }}>
                    
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgb(57 253 72 / 30)' }}>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedVenueDetails.name}</h2>
                        <div className="flex items-center text-gray-400 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {selectedVenueDetails.location || 'Location not specified'}
                        </div>
                      </div>
                      <Button type="button" variant="outline" onClick={() => setShowVenueModal(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Venue Image */}
                      {(selectedVenueDetails.featuredImage || selectedVenueDetails.image) && (
                        <div className="w-full h-64 overflow-hidden rounded-xl">
                          <img 
                            src={selectedVenueDetails.featuredImage || selectedVenueDetails.image} 
                            alt={selectedVenueDetails.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Venue Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 space-y-4">
                          <div className="p-4 rounded-xl border" style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                            <div className="flex items-center mb-2">
                              <Users className="h-5 w-5 mr-2" style={{ color: '#0D6EFD' }} />
                              <span className="font-medium text-white">Capacity</span>
                            </div>
                            <span className="text-2xl font-bold" style={{ color: '#39FD48' }}>
                              {selectedVenueDetails.capacity ? Number(selectedVenueDetails.capacity).toLocaleString() : 'N/A'}
                            </span>
                          </div>

                          {selectedVenueDetails.tenant && (
                            <div className="p-4 rounded-xl border" style={{ backgroundColor: '#39FD48' + '10', borderColor: '#39FD48' + '30' }}>
                              <div className="flex items-center mb-2">
                                <Building2 className="h-5 w-5 mr-2" style={{ color: '#39FD48' }} />
                                <span className="font-medium text-white">Managed by</span>
                              </div>
                              <span className="text-white">{selectedVenueDetails.tenant.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Seating Layout */}
                        <div className="md:col-span-2">
                          {seatMapData && typeof seatMapData === 'object' && 'rows' in seatMapData ? (
                            <div className="space-y-4">
                              <h3 className="text-xl font-bold text-white flex items-center">
                                <Grid3X3 className="h-5 w-5 mr-2" style={{ color: '#39FD48' }} />
                                Seating Layout
                              </h3>

                              {/* Sections Legend */}
                              {seatMapData.sections && Array.isArray(seatMapData.sections) && seatMapData.sections.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {seatMapData.sections.map((section: SeatMapSection) => (
                                    <div key={section.id} className="flex items-center space-x-2 px-3 py-1 rounded-lg border text-sm"
                                      style={{ backgroundColor: section.color + '20', borderColor: section.color + '50' }}>
                                      <div className="w-3 h-3 rounded" style={{ backgroundColor: section.color }}></div>
                                      <span className="text-white font-medium">
                                        {section.name} (×{section.price_multiplier})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : null}

                              {/* Stage */}
                              <div className="rounded-lg p-4 text-center text-white font-bold" 
                                style={{ background: 'linear-gradient(135deg, #0D6EFD, #39FD48)' }}>
                                🎭 STAGE
                              </div>

                              {/* Seat Grid */}
                              <div className="flex justify-center">
                                <div className="inline-block p-4 rounded-xl border" 
                                  style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                                  <div 
                                    className="grid gap-1"
                                    style={{
                                      gridTemplateColumns: `repeat(${Math.min(Number(seatMapData.columns) || 10, 30)}, 1fr)`
                                    }}
                                  >
                                    {Array.from({ 
                                      length: Math.min((Number(seatMapData.rows) || 10) * (Number(seatMapData.columns) || 10), 600) 
                                    }).map((_, index) => {
                                      const columns = Number(seatMapData.columns) || 10;
                                      const row = Math.floor(index / columns);
                                      const col = index % columns;
                                      
                                      // Find which section this seat belongs to
                                      const section = Array.isArray(seatMapData.sections) ? seatMapData.sections.find((s: SeatMapSection) =>
                                        row >= s.startRow && row < s.startRow + s.rows &&
                                        col >= s.startCol && col < s.startCol + s.columns
                                      ) : null;                                      const isAisle = Array.isArray(seatMapData.aisles) ? seatMapData.aisles.includes(row) : false;
                                      const isWheelchairAccessible = Array.isArray(seatMapData.wheelchair_accessible) ? 
                                        seatMapData.wheelchair_accessible.includes(row) : false;

                                      return (
                                        <div
                                          key={`${row}-${col}`}
                                          className={`w-4 h-4 rounded-sm flex items-center justify-center text-xs font-bold ${
                                            isAisle ? 'opacity-50' : ''
                                          }`}
                                          style={{
                                            backgroundColor: section ? section.color : '#39FD48',
                                            opacity: section ? 1 : 0.3,
                                            border: isWheelchairAccessible ? '1px solid #FFF' : 'none'
                                          }}
                                          title={`Row ${row + 1}, Seat ${col + 1}${section ? ` - ${section.name}` : ''}${isWheelchairAccessible ? ' (Wheelchair Accessible)' : ''}`}
                                        >
                                          {isWheelchairAccessible ? '♿' : ''}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Seating Stats */}
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 rounded-lg border" style={{ backgroundColor: '#39FD48' + '10', borderColor: '#39FD48' + '30' }}>
                                  <div className="text-lg font-bold" style={{ color: '#39FD48' }}>
                                    {(Number(seatMapData.rows) || 0) * (Number(seatMapData.columns) || 0)}
                                  </div>
                                  <div className="text-xs text-gray-400">Total Seats</div>
                                </div>
                                <div className="p-3 rounded-lg border" style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                                  <div className="text-lg font-bold" style={{ color: '#0D6EFD' }}>
                                    {Array.isArray(seatMapData.sections) ? seatMapData.sections.length : 0}
                                  </div>
                                  <div className="text-xs text-gray-400">Sections</div>
                                </div>
                                <div className="p-3 rounded-lg border" style={{ backgroundColor: '#39FD48' + '10', borderColor: '#39FD48' + '30' }}>
                                  <div className="text-lg font-bold" style={{ color: '#39FD48' }}>
                                    {Array.isArray(seatMapData.wheelchair_accessible) ? seatMapData.wheelchair_accessible.length : 0}
                                  </div>
                                  <div className="text-xs text-gray-400">♿ Accessible</div>
                                </div>
                              </div>

                              {/* Special Features */}
                              {seatMapData.special_features && Array.isArray(seatMapData.special_features) && seatMapData.special_features.length > 0 ? (
                                <div className="p-4 rounded-xl border" style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                                  <h4 className="font-bold mb-2 text-white">Special Features</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {(seatMapData.special_features as string[]).map((feature: string, index: number) => (
                                      <span key={index} className="px-2 py-1 rounded text-xs border"
                                        style={{ backgroundColor: '#39FD48' + '20', borderColor: '#39FD48', color: '#39FD48' }}>
                                        {String(feature).replace('_', ' ')}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <Grid3X3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                              <h4 className="text-lg font-bold mb-2 text-white">No Seating Data</h4>
                              <p className="text-gray-400">No seating layout found for this venue</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Venue Availability */}
                      <div className="p-4 rounded-xl border" style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '30' }}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-white flex items-center">
                            <Eye className="h-5 w-5 mr-2" style={{ color: '#39FD48' }} />
                            Availability Overview
                          </h4>
                          {!availabilityLoaded && selectedVenueDetails && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAvailabilityLoaded(true);
                                loadVenueAvailability(selectedVenueDetails.id);
                              }}
                              disabled={loadingAvailability}
                              style={{ 
                                backgroundColor: 'transparent', 
                                borderColor: greenBorder, 
                                color: '#fff' 
                              }}
                            >
                              {loadingAvailability ? 'Loading...' : 'Check Availability'}
                            </Button>
                          )}
                        </div>
                        
                        {loadingAvailability ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                            <p className="text-gray-400 mt-2">Checking availability...</p>
                          </div>
                        ) : venueAvailability && availabilityLoaded ? (
                          <div className="space-y-4">
                            {/* Show availability for each day in the range */}
                            {venueAvailability.dailyAvailability && venueAvailability.dailyAvailability.length > 0 ? (
                              venueAvailability.dailyAvailability.map((day: any, dayIndex: number) => (
                                <div key={dayIndex} className="border rounded-lg p-3" style={{ borderColor: '#39FD48' + '20' }}>
                                  <h5 className="font-medium text-white mb-2">
                                    {new Date(day.date).toLocaleDateString('en-US', { 
                                      weekday: 'long', 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </h5>
                                  
                                  {day.events && day.events.length > 0 ? (
                                    <div className="space-y-2">
                                      <p className="text-sm text-gray-400">Scheduled events:</p>
                                      {day.events.map((event: any, eventIndex: number) => (
                                        <div key={eventIndex} className="flex justify-between items-center p-2 bg-gray-700/30 rounded text-sm">
                                          <span className="font-medium text-white">{event.title}</span>
                                          <span className="text-gray-400">
                                            {event.startTime} - {event.endTime || 'End of day'}
                                          </span>
                                        </div>
                                      ))}
                                      
                                      {/* Show available time slots */}
                                      {day.availableSlots && day.availableSlots.length > 0 && (
                                        <div className="mt-3">
                                          <p className="text-sm text-green-400 mb-2">Available time slots:</p>
                                          <div className="flex flex-wrap gap-2">
                                            {day.availableSlots.map((slot: any, slotIndex: number) => (
                                              <span key={slotIndex} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/30">
                                                {slot.start} - {slot.end}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-green-400 text-sm">🎉 Fully available - no events scheduled</p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-green-400 text-sm">🎉 Venue appears to be available for your selected dates</p>
                            )}
                          </div>
                        ) : availabilityLoaded ? (
                          <p className="text-gray-400 text-sm">No availability data available</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Click &quot;Check Availability&quot; to see venue availability for your selected dates</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold" style={{ color: '#fff' }}>Time Selection & Seating</h3>
              
              {form.venueId ? (
                <div className="space-y-6">
                  {/* Selected Venue Info */}
                  <div className="rounded-xl border p-4" style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '30' }}>
                    <h4 className="font-semibold text-white mb-2">Selected Venue</h4>
                    {(() => {
                      const v = venues.find((vv: VenueCard) => String(vv.id) === String(form.venueId));
                      return v ? (
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 overflow-hidden rounded-lg border flex items-center justify-center" style={{ backgroundColor: '#23262F', borderColor: greenBorder }}>
                            {v.featuredImage || v.image ? <img src={v.featuredImage || v.image} alt="Venue" className="w-full h-full object-cover" /> : <div className="text-xs" style={{ color: '#ABA8A9' }}>No image</div>}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{v.name}</div>
                            <div className="text-sm" style={{ color: '#ABA8A9' }}>{v.location || '—'}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400">Venue details not found</div>
                      );
                    })()}
                  </div>

                  {/* Time Selection */}
                  <div className="rounded-lg p-6" style={{ backgroundColor: '#191C24', borderColor: greenBorder + '30', border: '1px solid' }}>
                    <h4 className="font-semibold text-white mb-4">Event Times</h4>
                    <p className="text-sm text-gray-400 mb-4">Set the start and end times for your event. These times will apply to all selected dates.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#fff' }}>Start Time *</label>
                        <div className="flex gap-2">
                          <select 
                            value={form.startHour || ''} 
                            onChange={e => onChange("startHour", e.target.value)} 
                            className="px-3 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 w-24"
                            style={{ 
                              backgroundColor: '#23262F', 
                              borderColor: greenBorder, 
                              color: '#fff'
                            }}
                          >
                            <option value="" style={{ backgroundColor: '#23262F', color: '#fff' }}>HH</option>
                            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => 
                              <option key={h} value={h} style={{ backgroundColor: '#23262F', color: '#fff' }}>{h}</option>
                            )}
                          </select>
                          <select 
                            value={form.startMinute || ''} 
                            onChange={e => onChange("startMinute", e.target.value)} 
                            className="px-3 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 w-24"
                            style={{ 
                              backgroundColor: '#23262F', 
                              borderColor: greenBorder, 
                              color: '#fff'
                            }}
                          >
                            <option value="" style={{ backgroundColor: '#23262F', color: '#fff' }}>MM</option>
                            {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => 
                              <option key={m} value={m} style={{ backgroundColor: '#23262F', color: '#fff' }}>{m}</option>
                            )}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#fff' }}>End Time (optional)</label>
                        <div className="flex gap-2">
                          <select 
                            value={form.endHour || ''} 
                            onChange={e => onChange("endHour", e.target.value)} 
                            className="px-3 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 w-24"
                            style={{ 
                              backgroundColor: '#23262F', 
                              borderColor: greenBorder, 
                              color: '#fff'
                            }}
                          >
                            <option value="" style={{ backgroundColor: '#23262F', color: '#fff' }}>HH</option>
                            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => 
                              <option key={h} value={h} style={{ backgroundColor: '#23262F', color: '#fff' }}>{h}</option>
                            )}
                          </select>
                          <select 
                            value={form.endMinute || ''} 
                            onChange={e => onChange("endMinute", e.target.value)} 
                            className="px-3 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 w-24"
                            style={{ 
                              backgroundColor: '#23262F', 
                              borderColor: greenBorder, 
                              color: '#fff'
                            }}
                          >
                            <option value="" style={{ backgroundColor: '#23262F', color: '#fff' }}>MM</option>
                            {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => 
                              <option key={m} value={m} style={{ backgroundColor: '#23262F', color: '#fff' }}>{m}</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Show selected times */}
                    {(form.startHour && form.startMinute) && (
                      <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#39FD48' + '10', borderColor: '#39FD48' + '30', border: '1px solid' }}>
                        <div className="text-sm text-white">
                          <strong>Event Duration:</strong> {form.startHour}:{form.startMinute.padStart(2, '0')}
                          {form.endHour && form.endMinute ? ` - ${form.endHour}:${form.endMinute.padStart(2, '0')}` : ' (open-ended)'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          This time applies to all selected dates: {form.startDateDate}{form.endDateDate ? ` to ${form.endDateDate}` : ''}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Seat Selection */}
                  {seatMapData && (
                    <div className="rounded-xl border p-6" style={{ backgroundColor: '#191C24', borderColor: greenBorder + '30' }}>
                      <h4 className="font-semibold text-white mb-4 flex items-center">
                        <Grid3X3 className="h-5 w-5 mr-2" style={{ color: '#39FD48' }} />
                        Seat Selection
                      </h4>
                      
                      {/* Seat Map Display */}
                      <div className="flex justify-center mb-4">
                        <div className="inline-block p-4 rounded-xl border" 
                          style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                          <div 
                            className="grid gap-1"
                            style={{
                              gridTemplateColumns: `repeat(${Math.min(Number(seatMapData.columns) || 10, 30)}, 1fr)`
                            }}
                          >
                            {Array.from({ 
                              length: Math.min((Number(seatMapData.rows) || 10) * (Number(seatMapData.columns) || 10), 600) 
                            }).map((_, index) => {
                              const columns = Number(seatMapData.columns) || 10;
                              const row = Math.floor(index / columns);
                              const col = index % columns;
                              
                              const section = Array.isArray(seatMapData.sections) ? seatMapData.sections.find((s: any) =>
                                row >= s.startRow && row < s.startRow + s.rows &&
                                col >= s.startCol && col < s.startCol + s.columns
                              ) : null;
                              
                              return (
                                <div
                                  key={`${row}-${col}`}
                                  className="w-4 h-4 rounded-sm flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
                                  style={{
                                    backgroundColor: section ? section.color : '#39FD48',
                                    opacity: 0.8
                                  }}
                                  title={`Row ${row + 1}, Seat ${col + 1}${section ? ` - ${section.name}` : ''}`}
                                >
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-400 text-center">Click on seats to select/deselect them for your event</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-lg font-bold mb-2 text-white">No Venue Selected</h4>
                  <p className="text-gray-400">Please go back to the previous step and select a venue first.</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white">Event Poster</h3>
              <div className="space-y-4">
                <label className="block text-sm text-foreground mb-2">Upload Poster</label>
                <div className="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 border-border hover:border-primary/50 bg-background/50">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handlePosterChange(e.target.files)} 
                    className="hidden" 
                    id="poster-upload" 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => document.getElementById('poster-upload')?.click()}
                  >
                    Choose Image
                  </Button>
                  {form.poster && (
                    <div className="mt-4 relative inline-block">
                      <img src={form.poster} alt="Poster" className="w-40 h-40 object-cover rounded-lg border" />
                      <button type="button" onClick={() => { removePoster(); setSelectedFile(null); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white">Staff</h3>
              <div>
                <label className="block text-sm text-foreground mb-2">Event Admin Email</label>
                <input value={eventAdminEmail} onChange={e => setEventAdminEmail(e.target.value)} placeholder="admin@example.com" className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
            </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-foreground">Check-in Officers (up to 10)</label>
                  <Button type="button" variant="outline" onClick={() => setCheckInEmails(prev => (prev.length < 10 ? [...prev, ""] : prev))}>Add</Button>
                </div>
                <div className="space-y-2">
                  {checkInEmails.map((email, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input value={email} onChange={e => setCheckInEmails(prev => prev.map((v, i) => i === idx ? e.target.value : v))} placeholder={`officer${idx+1}@example.com`} className="flex-1 px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                      <Button type="button" variant="outline" onClick={() => setCheckInEmails(prev => prev.filter((_, i) => i !== idx))}>Remove</Button>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Note: Staff emails are currently collected for UI; backend assignment endpoint can be added next.</p>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6 text-white">
              <h3 className="text-2xl font-semibold">Review & Submit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">Title</div>
                  <div className="font-medium">{form.title || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Venue</div>
                  <div className="font-medium">{venues.find(v => String(v.id) === String(form.venueId))?.name || `Not selected (ID: ${form.venueId})`}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Start Date & Time</div>
                  <div className="font-medium">{form.startDateDate && form.startHour && form.startMinute ? `${form.startDateDate} ${form.startHour}:${form.startMinute}` : '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">End Date & Time</div>
                  <div className="font-medium">{form.endDateDate && form.endHour && form.endMinute ? `${form.endDateDate} ${form.endHour}:${form.endMinute}` : '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="font-medium">{form.category || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Event Admin</div>
                  <div className="font-medium">{eventAdminEmail || '-'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-muted-foreground">Check-in Officers</div>
                  <div className="font-medium">{checkInEmails.filter(Boolean).join(', ') || '-'}</div>
                </div>
              </div>
              {form.description && (
                <div>
                  <div className="text-sm text-muted-foreground">Description</div>
                  <div className="font-medium">{form.description}</div>
            </div>
              )}
              {form.poster && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Poster</div>
                  <img src={form.poster} alt="Poster preview" className="w-40 h-40 object-cover rounded-lg border" />
                </div>
              )}
            </div>
          )}

          {error && <div className="text-red-400 mt-4 text-center font-medium p-3 rounded-lg" style={{ backgroundColor: '#FF5722' + '20', borderColor: '#FF5722' + '50', border: '1px solid' }}>{error}</div>}

          <div className="flex items-center justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 1} 
              className="flex items-center transition-all duration-200"
              style={{ 
                backgroundColor: 'transparent', 
                borderColor: greenBorder, 
                color: '#fff',
                opacity: currentStep === 1 ? 0.5 : 1
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button 
                onClick={nextStep} 
                className="flex items-center transition-all duration-200 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #0D6EFD, #1565C0)', color: '#fff' }}
              >
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={submitting} 
                className="flex items-center transition-all duration-200 shadow-lg"
                style={{ 
                  background: submitting ? '#39FD48' + '50' : 'linear-gradient(135deg, #39FD48, #2DD4BF)', 
                  color: '#000',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Creating...' : 'Create Event'}
              </Button>
            )}

          </div>
          <div className="flex justify-end mt-4">
            <Button variant="ghost" onClick={() => router.push('/organizer/dashboard')} style={{ color: '#fff' }}>Cancel</Button>
        </div>
        </div>
      </div>
    </div>
</div>  );
}

export default NewEventPageInner;
