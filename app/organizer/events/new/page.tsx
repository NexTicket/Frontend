"use client";

/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { createEvent, fetchVenues, uploadEventImage, fetchVenueSeatMap, fetchVenueById, fetchFilteredVenues, fetchVenueAvailability, fetchFirebaseUsers } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, Image as ImageIcon, X, MapPin, Users, Building2, Grid3X3, Eye, Check } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Dynamic import for LocationPicker to avoid SSR issues
const LocationPicker = dynamic(() => import("@/components/ui/location-picker").then(mod => mod.LocationPicker), {
  loading: () => <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">Loading map...</div>
});

function NewEventPageInner() {
  // Types for venue availability data
  interface VenueAvailability {
    dailyAvailability: Array<{
      date: string;
      isAvailableForEvent: boolean;
      events: Array<{ title: string; startTime: string; endTime?: string }>;
    }>;
  }
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
    special_features?: string[];
  };

  const [venues, setVenues] = useState<VenueCard[]>([]);
  const [seatMapData, setSeatMapData] = useState<SeatMapData | null>(null);
  const [selectedVenueDetails, setSelectedVenueDetails] = useState<VenueCard | null>(null);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Staff selection states
  const [availableEventAdmins, setAvailableEventAdmins] = useState<Array<{uid: string, email: string, displayName?: string}>>([]);
  const [availableCheckinOfficers, setAvailableCheckinOfficers] = useState<Array<{uid: string, email: string, displayName?: string}>>([]);
  const [selectedEventAdmin, setSelectedEventAdmin] = useState("");
  const [selectedCheckinOfficers, setSelectedCheckinOfficers] = useState<string[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Venue availability states
  const [venueAvailability, setVenueAvailability] = useState<VenueAvailability | null>(null);
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
  'Catering', 'Bar Service', 'Restrooms', 'Security'
  ]);

  const categoryOptions = [
    { value: "", label: "Select category" },
    { value: "Concert", label: "Concert" },
    { value: "Conference", label: "Conference" },
    { value: "Comedy", label: "Comedy" },
    { value: "Workshop", label: "Workshop" },
    { value: "Sports", label: "Sports" },
    { value: "Festival", label: "Festival" },
    { value: "Theater", label: "Theater" },
    { value: "Meetup", label: "Meetup" },
    { value: "Other", label: "Other" }
  ];

  const venueTypeOptions = [
    { value: "all", label: "All Types" },
    { value: "Banquet Halls", label: "Banquet Halls" },
    { value: "Conference Centers", label: "Conference Centers" },
    { value: "Country Clubs", label: "Country Clubs" },
    { value: "Cruise Ships", label: "Cruise Ships" },
    { value: "Museums and Art Galleries", label: "Museums and Art Galleries" },
    { value: "Parks and Gardens", label: "Parks and Gardens" },
    { value: "Rooftop Venues", label: "Rooftop Venues" },
    { value: "Stadiums - Indoor", label: "Stadiums - Indoor" },
    { value: "Stadiums - Outdoor", label: "Stadiums - Outdoor" },
    { value: "Theatres", label: "Theatres" },
    { value: "Universities and University Halls", label: "Universities and University Halls" }
  ];

  // Define options for time dropdowns
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({ value: String(i).padStart(2, '0'), label: String(i).padStart(2, '0') }));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({ value: String(i).padStart(2, '0'), label: String(i).padStart(2, '0') }));

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

  // Load staff when step 5 is reached
  useEffect(() => {
    if (currentStep === 5) {
      loadStaff();
    }
  }, [currentStep]);

  const loadStaff = async () => {
    setLoadingStaff(true);
    try {
      console.log('🔍 Starting to load staff...');
      
      // Load event admins
      console.log('📞 Calling fetchFirebaseUsers for event_admin...');
      const eventAdminsRes = await fetchFirebaseUsers('event_admin');
      console.log('📥 Event admins response:', eventAdminsRes);
      
      if (eventAdminsRes?.data) {
        setAvailableEventAdmins(eventAdminsRes.data);
        console.log('✅ Set event admins:', eventAdminsRes.data.length, 'users');
      } else {
        console.log('⚠️ No event admins data received');
      }

      // Load check-in officers
      console.log('📞 Calling fetchFirebaseUsers for checkin_officer...');
      const checkinOfficersRes = await fetchFirebaseUsers('checkin_officer');
      console.log('📥 Checkin officers response:', checkinOfficersRes);
      
      if (checkinOfficersRes?.data) {
        setAvailableCheckinOfficers(checkinOfficersRes.data);
        console.log('✅ Set checkin officers:', checkinOfficersRes.data.length, 'users');
      } else {
        console.log('⚠️ No checkin officers data received');
      }
    } catch (error) {
      console.error('❌ Failed to load staff:', error);
      setError(`Failed to load staff: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingStaff(false);
      console.log('🏁 Staff loading complete');
    }
  };

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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
              currentStep > i + 1 
                ? 'bg-green-500 text-white' 
                : currentStep === i + 1 
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {currentStep > i + 1 ? <Check className="h-5 w-5" /> : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={`w-24 h-1 mx-4 rounded-full transition-all duration-300 ${
                currentStep > i + 1 ? 'bg-green-500' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-center">
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  );

  // Theme colors matching admin dashboard

  if (!mounted) return null;

  return (
    <div className="p-8 bg-gradient-to-br from-background via-muted/10 to-primary/5 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/organizer/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Create New Event
          </h1>
          <p className="text-muted-foreground">Set up your event with our advanced event management system</p>
        </div>

          <StepBar />

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-card/50 backdrop-blur-sm rounded-xl border p-8"
            >
        {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Building2 className="h-6 w-6 mr-3 text-primary" />
                Basic Information
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Event Title *
                  </label>
                  <input
                    value={form.title}
                    onChange={e => onChange("title", e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <Dropdown
                    options={categoryOptions}
                    value={form.category}
                    placeholder="Select category"
                    onChange={(value) => onChange("category", value)}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={form.startDateDate}
                      onChange={e => onChange("startDateDate", e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={form.endDateDate}
                      onChange={e => onChange("endDateDate", e.target.value)}
                      min={form.startDateDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description *
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => onChange("description", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    placeholder="Describe your event..."
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <MapPin className="h-6 w-6 mr-3 text-primary" />
                Venue Selection *
              </h2>
              
              {/* Venue filtering info */}
              <div className="bg-blue-600 rounded-lg p-4 border border-blue-700">
                <p className="text-sm text-white font-medium">
                  Choose your preferred venue type, location, or amenities to explore venues for your event
                </p>
              </div>

              {/* Venue Filters */}
              <div className="bg-background/50 rounded-lg p-6 border">
                <h4 className="text-lg font-semibold mb-4">Filter Venues</h4>
                
                {/* Venue Type and Amenities in parallel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Venue Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Venue Type</label>
                    <Dropdown
                      options={venueTypeOptions}
                      value={venueFilters.type}
                      placeholder="All Types"
                      onChange={(value) => setVenueFilters(prev => ({ ...prev, type: value }))}
                      className="w-full"
                    />
                  </div>

                  {/* Amenities Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Amenities</label>
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
                            className="rounded border-border text-primary focus:ring-primary/50"
                          />
                          <span className="text-sm text-muted-foreground">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Location Filter with Google Maps - Full width below */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Location</label>
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
                      <div className="text-sm text-muted-foreground">
                        Selected: {venueFilters.location.address}
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => setVenueFilters(prev => ({ ...prev, location: null }))}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Clear Location
                    </Button>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setVenueFilters({ type: 'all', location: null, amenities: [] })}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
              
              {/* Venue cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingVenues ? (
                  <div className="text-center py-8 text-muted-foreground col-span-full">Loading venues...</div>
                ) : venues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground col-span-full">
                    No venues found matching your filters. Try adjusting your filter criteria.
                  </div>
                ) : (
                  venues.map((v: VenueCard) => {
                    const selected = String(form.venueId) === String(v.id);
                    const img = v.featuredImage || v.image || (Array.isArray(v.images) ? v.images[0] : '');
                    
                    // Check availability for this venue (only if dates and times are set)
                    const canCheckAvailability = form.startDateDate && form.startHour && form.startMinute;
                    
                    return (
                      <div
                        key={v.id}
                        className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:scale-105 ${
                          selected ? 'ring-2 ring-blue-500 border-blue-500 bg-primary/5' : 'bg-background/50'
                        }`}
                        onClick={() => {
                          console.log('🎯 Venue card clicked:', { venueId: v.id, venueIdType: typeof v.id });
                          onChange('venueId', String(v.id));
                          // Auto-fetch availability if dates are set
                          if (canCheckAvailability) {
                            loadVenueAvailability(v.id);
                          }
                        }}
                      >
                        <div className="w-full h-32 overflow-hidden rounded-lg border mb-3 flex items-center justify-center bg-background/50">
                          {img ? <img src={img} alt="Venue" className="w-full h-full object-cover" /> : <div className="text-sm text-muted-foreground">No image</div>}
                        </div>
                        <div className="font-semibold text-foreground">{v.name}</div>
                        <div className="text-sm" style={{ color: '#ABA8A9' }}>{v.location || '—'}</div>
                        <div className="text-sm" style={{ color: '#ABA8A9' }}>Capacity: {v.capacity ?? '—'}</div>
                        {v.type && <div className="text-xs px-2 py-1 rounded mt-1 inline-block bg-primary text-primary-foreground">{v.type.replace('_', ' ')}</div>}
                        <div className="mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2 px-3 py-1 rounded-lg border border-primary text-primary hover:bg-primary/10 focus:ring-2 focus:ring-primary transition"
                            onClick={async (e) => {
                              e.stopPropagation();
                              console.log('View Details clicked for venue:', v.id);
                              try {
                                await loadVenueDetails(v.id);
                                // Automatically fetch availability if dates are set
                                if (canCheckAvailability) {
                                  setAvailabilityLoaded(true);
                                  loadVenueAvailability(v.id);
                                }
                                setShowVenueModal(true);
                                console.log('Modal opened and availability requested');
                              } catch (error) {
                                console.error('Failed to load venue details:', error);
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
          </div>

              {/* Selected venue preview */}
              {form.venueId && (
                <div className="rounded-xl border p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-background/30" style={{ borderColor: 'rgb(59 130 246 / 40%)' }}>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                  <div className="bg-background/95 backdrop-blur-xl rounded-2xl border border-border/40 max-w-5xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
                    
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border/20">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{selectedVenueDetails.name}</h2>
                        <div className="flex items-center text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4 mr-2" />
                          {selectedVenueDetails.location || 'Location not specified'}
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowVenueModal(false)}
                        className="hover:bg-red-500/20 text-red-500 hover:text-red-600"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Venue Image */}
                      {(selectedVenueDetails.featuredImage || selectedVenueDetails.image) && (
                        <div className="w-full h-64 overflow-hidden rounded-xl border border-border/20">
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
                          <div className="p-4 rounded-xl border border-border/20 bg-muted/10">
                            <div className="flex items-center mb-2">
                              <Users className="h-5 w-5 mr-2 text-primary" />
                              <span className="font-medium text-foreground">Capacity</span>
                            </div>
                            <span className="text-2xl font-bold text-primary">
                              {selectedVenueDetails.capacity ? Number(selectedVenueDetails.capacity).toLocaleString() : 'N/A'}
                            </span>
                          </div>

                          {selectedVenueDetails.tenant && (
                            <div className="p-4 rounded-xl border border-border/20 bg-muted/10">
                              <div className="flex items-center mb-2">
                                <Building2 className="h-5 w-5 mr-2 text-primary" />
                                <span className="font-medium text-foreground">Managed by</span>
                              </div>
                              <span className="text-foreground">{selectedVenueDetails.tenant.name}</span>
                            </div>
                          )}

                          {selectedVenueDetails.type && (
                            <div className="p-4 rounded-xl border border-border/20 bg-muted/10">
                              <div className="flex items-center mb-2">
                                <Building2 className="h-5 w-5 mr-2 text-primary" />
                                <span className="font-medium text-foreground">Type</span>
                              </div>
                              <span className="text-foreground">{selectedVenueDetails.type.replace('_', ' ')}</span>
                            </div>
                          )}
                        </div>

                        {/* Seating Layout */}
                        <div className="md:col-span-2">
                          {seatMapData && typeof seatMapData === 'object' && 'rows' in seatMapData ? (
                            <div className="space-y-4">
                              <h3 className="text-xl font-bold text-foreground flex items-center">
                                <Grid3X3 className="h-5 w-5 mr-2 text-primary" />
                                Seating Layout
                              </h3>

                              {/* Sections Legend */}
                              {seatMapData.sections && Array.isArray(seatMapData.sections) && seatMapData.sections.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {seatMapData.sections.map((section: SeatMapSection) => (
                                    <div key={section.id} className="flex items-center space-x-2 px-3 py-1 rounded-lg border border-border/20 text-sm bg-muted/10">
                                      <div className="w-3 h-3 rounded" style={{ backgroundColor: section.color }}></div>
                                      <span className="text-foreground font-medium">
                                        {section.name} (×{section.price_multiplier})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : null}

                              {/* Stage */}
                              <div className="w-fit mx-auto mb-4 rounded-lg px-4 py-1 text-sm text-center text-white font-semibold bg-gradient-to-r from-primary to-blue-600">
                                🎭 STAGE
                              </div>

                              {/* Seat Grid - Simplified */}
                              <div className="flex justify-center">
                                <div className="inline-block p-4 rounded-xl border border-border/20 bg-muted/5">
                                  <div 
                                    className="grid gap-1"
                                    style={{
                                      gridTemplateColumns: `repeat(${Number(seatMapData.columns) || 10}, 1fr)`
                                    }}
                                  >
                                    {Array.from({ 
                                      length: (Number(seatMapData.rows) || 10) * (Number(seatMapData.columns) || 10) 
                                    }).map((_, index) => {
                                      const columns = Number(seatMapData.columns) || 10;
                                      const row = Math.floor(index / columns);
                                      const col = index % columns;
                                      
                                      // Find which section this seat belongs to
                                      const section = Array.isArray(seatMapData.sections) ? seatMapData.sections.find((s: SeatMapSection) =>
                                        row >= s.startRow && row < s.startRow + s.rows &&
                                        col >= s.startCol && col < s.startCol + s.columns
                                      ) : null;

                                      return (
                                        <div
                                          key={`${row}-${col}`}
                                          className="w-3 h-3 rounded-sm"
                                          style={{
                                            backgroundColor: section ? section.color : 'hsl(var(--primary))',
                                            opacity: section ? 0.8 : 0.6,
                                          }}
                                          title={`Row ${row + 1}, Seat ${col + 1}${section ? ` - ${section.name}` : ''}`}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Seating Stats */}
                              <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 rounded-lg border border-border/20 bg-muted/10">
                                  <div className="text-lg font-bold text-primary">
                                    {(Number(seatMapData.rows) || 0) * (Number(seatMapData.columns) || 0)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Total Seats</div>
                                </div>
                                <div className="p-3 rounded-lg border border-border/20 bg-muted/10">
                                  <div className="text-lg font-bold text-primary">
                                    {Array.isArray(seatMapData.sections) ? seatMapData.sections.length : 0}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Sections</div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12 border border-border/20 rounded-xl bg-muted/5">
                              <Grid3X3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                              <h4 className="text-lg font-bold mb-2 text-foreground">No Seating Data</h4>
                              <p className="text-muted-foreground">No seating layout found for this venue</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Venue Availability */}
                      <div className="p-4 rounded-xl border border-border/20 bg-muted/5">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-foreground flex items-center">
                            <Eye className="h-5 w-5 mr-2 text-primary" />
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
                            >
                              {loadingAvailability ? 'Loading...' : 'Check Availability'}
                            </Button>
                          )}
                        </div>
                        
                        {loadingAvailability ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                            <p className="text-muted-foreground mt-2">Checking availability...</p>
                          </div>
                        ) : venueAvailability && availabilityLoaded ? (
                          <div className="space-y-4">
                            {/* Blue Instruction Box */}
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                              <p className="text-sm text-blue-600 dark:text-blue-400 flex items-start">
                                <span className="mr-2 text-lg">ℹ️</span>
                                <span>
                                  <strong>Important:</strong> When selecting your event time, please maintain at least a <strong>1-hour gap</strong> between events shown below. This allows time for venue setup, cleanup, and guest transition.
                                </span>
                              </p>
                            </div>

                            {/* Show availability for each day in the range */}
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                              {venueAvailability.dailyAvailability && venueAvailability.dailyAvailability.length > 0 ? (
                                venueAvailability.dailyAvailability.map((day, dayIndex: number) => (
                                  <div key={dayIndex} className="border border-border/20 rounded-lg p-4 bg-background/50">
                                    <div className="flex justify-between items-center mb-3">
                                      <h5 className="font-semibold text-foreground">
                                        {new Date(day.date).toLocaleDateString('en-US', { 
                                          weekday: 'long', 
                                          month: 'long', 
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </h5>
                                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        day.isAvailableForEvent ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                                      }`}>
                                        {day.isAvailableForEvent ? '✓ Available' : '✗ Conflict'}
                                      </span>
                                    </div>
                                    
                                    {day.events && day.events.length > 0 ? (
                                      <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Booked Time Slots:</p>
                                        {day.events.map((event, eventIndex: number) => (
                                          <div key={eventIndex} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/10">
                                            <div className="flex-1 min-w-0 mr-3">
                                              <p className="font-medium text-foreground truncate">{event.title}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap">
                                              <span className="text-blue-600 dark:text-blue-400">{event.startTime || 'N/A'}</span>
                                              <span className="text-muted-foreground">→</span>
                                              <span className="text-purple-600 dark:text-purple-400">{event.endTime || 'EOD'}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 bg-green-500/5 rounded-lg border border-green-500/20">
                                        <p className="text-green-600 font-medium">✅ No events scheduled - Fully available</p>
                                        <p className="text-xs text-muted-foreground mt-1">You can book any time slot for this date</p>
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-6 bg-green-500/5 rounded-lg border border-green-500/20">
                                  <p className="text-green-600 font-medium">✅ Venue appears to be fully available</p>
                                  <p className="text-xs text-muted-foreground mt-1">No events scheduled for your selected dates</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : availabilityLoaded ? (
                          <p className="text-muted-foreground text-sm">No availability data available</p>
                        ) : (
                          <div className="text-center py-6 bg-muted/10 rounded-lg border border-border/20">
                            <p className="text-muted-foreground text-sm">Click &quot;Check Availability&quot; to see venue availability and booked time slots for your selected dates</p>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {selectedVenueDetails.description && (
                        <div className="p-4 rounded-xl border border-border/20 bg-muted/5">
                          <h4 className="font-bold text-foreground mb-2">Description</h4>
                          <p className="text-muted-foreground leading-relaxed">{selectedVenueDetails.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Users className="h-6 w-6 mr-3 text-primary" />
                Time Selection & Seating
              </h2>

              {form.venueId ? (
                <div className="space-y-6">
                  {/* Selected Venue Info */}
                  <div className="bg-background/50 rounded-xl border p-4">
                    <h4 className="font-semibold mb-2">Selected Venue</h4>
                    {(() => {
                      const v = venues.find((vv: VenueCard) => String(vv.id) === String(form.venueId));
                      return v ? (
                        <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 overflow-hidden rounded-lg border flex items-center justify-center bg-background/50">
                          {v.featuredImage || v.image ? <img src={v.featuredImage || v.image} alt="Venue" className="w-full h-full object-cover" /> : <div className="text-xs text-muted-foreground">No image</div>}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{v.name}</div>
                          <div className="text-sm text-muted-foreground">{v.location || '—'}</div>
                        </div>
                        </div>
                      ) : (
                        <div className="text-gray-400">Venue details not found</div>
                      );
                    })()}
                  </div>

                  {/* Time Selection */}
                  <div className="bg-background/50 rounded-lg p-6 border">
                    <h4 className="font-semibold mb-2">Event Times</h4>
                    <div className="bg-blue-600 text-white rounded-lg p-3 mb-4 flex items-start">
                      <span className="mr-2 text-lg">ℹ️</span>
                      <span className="text-sm">Please maintain at least a 1-hour gap between events when selecting your time slot to allow for venue setup and cleanup.</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Start Time *</label>
                        <div className="flex gap-2">
                          <Dropdown
                            options={hourOptions}
                            value={form.startHour}
                            placeholder="HH"
                            onChange={v => onChange("startHour", v)}
                            className="w-24"
                          />
                          <Dropdown
                            options={minuteOptions}
                            value={form.startMinute}
                            placeholder="MM"
                            onChange={v => onChange("startMinute", v)}
                            className="w-24"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">End Time *</label>
                        <div className="flex gap-2">
                          <Dropdown
                            options={hourOptions}
                            value={form.endHour}
                            placeholder="HH"
                            onChange={v => onChange("endHour", v)}
                            className="w-24"
                          />
                          <Dropdown
                            options={minuteOptions}
                            value={form.endMinute}
                            placeholder="MM"
                            onChange={v => onChange("endMinute", v)}
                            className="w-24"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Show selected times */}
                    {(form.startHour && form.startMinute) && (
                      <div className="mt-4 p-3 rounded-lg bg-blue-600 border border-blue-700">
                        <div className="text-sm text-white font-medium">
                          <strong>Event Duration:</strong> {form.startHour}:{form.startMinute.padStart(2, '0')}
                          {form.endHour && form.endMinute ? ` - ${form.endHour}:${form.endMinute.padStart(2, '0')}` : ' (open-ended)'}
                        </div>
                        <div className="text-xs text-white/80 mt-1">
                          This time applies to all selected dates: {form.startDateDate}{form.endDateDate ? ` to ${form.endDateDate}` : ''}
                        </div>
                      </div>
                    )}
                  </div>
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
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <ImageIcon className="h-6 w-6 mr-3 text-primary" />
                Event Poster
              </h2>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground mb-2">Upload Poster (Optional)</label>
                
                {!form.poster ? (
                  <div 
                    className="border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 border-border hover:border-primary/50 bg-background/50 cursor-pointer group"
                    onClick={() => document.getElementById('poster-upload')?.click()}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <ImageIcon className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">Upload Event Poster</h4>
                        <p className="text-sm text-muted-foreground">Click to browse or drag and drop your image here</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="cursor-pointer"
                      >
                        Choose Image
                      </Button>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handlePosterChange(e.target.files)} 
                      className="hidden" 
                      id="poster-upload" 
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Image Preview */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Preview</h4>
                        <div className="relative rounded-xl overflow-hidden border border-border bg-background/50">
                          <img src={form.poster} alt="Event Poster" className="w-full h-64 object-cover" />
                          <button 
                            type="button" 
                            onClick={() => { removePoster(); setSelectedFile(null); }} 
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Upload Actions */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Actions</h4>
                        <div className="space-y-3">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => document.getElementById('poster-upload')?.click()}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Change Image
                          </Button>
                          <Button 
                            type="button" 
                            variant="destructive" 
                            className="w-full"
                            onClick={() => { removePoster(); setSelectedFile(null); }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove Image
                          </Button>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={e => handlePosterChange(e.target.files)} 
                          className="hidden" 
                          id="poster-upload" 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Users className="h-6 w-6 mr-3 text-primary" />
                Staff Assignment (Optional)
              </h2>
              
              <div className="bg-blue-600 rounded-lg p-4 border border-blue-700 mb-6">
                <p className="text-sm text-white font-medium">
                  Assign staff members to manage your event. You can skip this step and assign staff later from the dashboard.
                </p>
              </div>

              {loadingStaff ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading staff members...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Event Admin Selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Event Admin</label>
                    <Dropdown
                      options={[
                        { value: "", label: "Select an event admin (optional)" },
                        ...availableEventAdmins.map(admin => ({
                          value: admin.uid,
                          label: `${admin.displayName || admin.email} (${admin.email})`
                        }))
                      ]}
                      value={selectedEventAdmin}
                      placeholder="Select an event admin"
                      onChange={(value) => setSelectedEventAdmin(value)}
                      className="w-full"
                    />
                    {availableEventAdmins.length === 0 && (
                      <p className="text-xs text-orange-500 mt-1">
                        ⚠️ No event admins found. Check if users have the &apos;event_admin&apos; role assigned.
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Event admins can manage all aspects of this event
                    </p>
                  </div>

                  {/* Check-in Officers Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-foreground">Check-in Officers</label>
                      <span className="text-xs text-muted-foreground">
                        {selectedCheckinOfficers.length} selected
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {availableCheckinOfficers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-border rounded-lg p-4">
                          {availableCheckinOfficers.map(officer => (
                            <label key={officer.uid} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedCheckinOfficers.includes(officer.uid)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCheckinOfficers(prev => [...prev, officer.uid]);
                                  } else {
                                    setSelectedCheckinOfficers(prev => prev.filter(id => id !== officer.uid));
                                  }
                                }}
                                className="rounded border-border text-primary focus:ring-primary/50"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground truncate">
                                  {officer.displayName || officer.email}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {officer.email}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                          <p>No check-in officers available</p>
                          <p className="text-xs text-orange-500 mt-2">
                            ⚠️ Check if users have the &apos;checkin_officer&apos; role assigned.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      Check-in officers can scan tickets and manage event entry
                    </p>
                  </div>

                  {/* Selected Staff Summary */}
                  {(selectedEventAdmin || selectedCheckinOfficers.length > 0) && (
                    <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                      <h4 className="font-medium text-foreground mb-3">Selected Staff</h4>
                      <div className="space-y-2">
                        {selectedEventAdmin && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Event Admin:</span>
                            <span className="text-sm text-foreground font-medium">
                              {availableEventAdmins.find(a => a.uid === selectedEventAdmin)?.displayName || 
                               availableEventAdmins.find(a => a.uid === selectedEventAdmin)?.email}
                            </span>
                          </div>
                        )}
                        {selectedCheckinOfficers.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-sm text-muted-foreground">Check-in Officers:</span>
                            <div className="text-sm text-foreground font-medium">
                              {selectedCheckinOfficers.map(officerId => {
                                const officer = availableCheckinOfficers.find(o => o.uid === officerId);
                                return officer ? (officer.displayName || officer.email) : null;
                              }).filter(Boolean).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground">Review & Submit</h3>
              <div className="p-6 bg-background/50 rounded-xl border border-border/20 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Title</div>
                    <div className="font-medium text-foreground">{form.title || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Venue</div>
                    <div className="font-medium text-foreground">{venues.find(v => String(v.id) === String(form.venueId))?.name || `Not selected (ID: ${form.venueId})`}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Start Date & Time</div>
                    <div className="font-medium text-foreground">{form.startDateDate && form.startHour && form.startMinute ? `${form.startDateDate} ${form.startHour}:${form.startMinute}` : '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">End Date & Time</div>
                    <div className="font-medium text-foreground">{form.endDateDate && form.endHour && form.endMinute ? `${form.endDateDate} ${form.endHour}:${form.endMinute}` : '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Category</div>
                    <div className="font-medium text-foreground">{form.category || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Event Admin</div>
                    <div className="font-medium text-foreground">
                      {selectedEventAdmin 
                        ? (availableEventAdmins.find(a => a.uid === selectedEventAdmin)?.displayName || 
                           availableEventAdmins.find(a => a.uid === selectedEventAdmin)?.email || '-')
                        : '-'}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-muted-foreground">Check-in Officers</div>
                    <div className="font-medium text-foreground">
                      {selectedCheckinOfficers.length > 0 
                        ? selectedCheckinOfficers.map(officerId => {
                            const officer = availableCheckinOfficers.find(o => o.uid === officerId);
                            return officer ? (officer.displayName || officer.email) : null;
                          }).filter(Boolean).join(', ')
                        : '-'}
                    </div>
                  </div>
                </div>
                {form.description && (
                  <div>
                    <div className="text-sm text-muted-foreground">Description</div>
                    <div className="font-medium text-foreground">{form.description}</div>
                  </div>
                )}
                {form.poster && (
                  <div>
                    <div className="text-sm text-muted-foreground">Event Poster</div>
                    <img
                      src={form.poster}
                      alt="Event Poster"
                      className="mt-2 max-w-xs rounded-lg border border-border/20"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {error && <div className="text-red-400 mt-4 text-center font-medium p-3 rounded-lg bg-red-500/10 border border-red-500/20">{error}</div>}          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-4">
              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center bg-gradient-to-r from-primary to-purple-600"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {submitting ? 'Creating...' : 'Create Event'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default NewEventPageInner;
