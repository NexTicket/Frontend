'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Loading } from '@/components/ui/loading';
import { createVenue, uploadVenueImage } from '@/lib/api';
import { useRouter } from 'next/navigation';
import '@/utils/test-venue-creation'; // Load test utilities
import { LocationPicker } from '@/components/ui/location-picker';
import { 
  Building2,
  Users,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  ArrowRight,
  Plus,
  Grid,
  Eye,
  Palette,
  Settings,
  Check,
  X,
  RotateCcw,
  Square,
  Circle
} from 'lucide-react';
import Link from 'next/link';

// Types for seating layout
interface SeatSection {
  id: string;
  name: string;
  rows: number;
  columns: number;
  price_multiplier: number;
  color: string;
  startRow: number;
  startCol: number;
}

interface SeatMapData {
  rows: number;
  columns: number;
  sections: SeatSection[];
  aisles: number[];
  wheelchair_accessible: number[];
  special_features?: string[];
  layout_type?: string;
}

interface VenueFormData {
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  description: string;
  amenities: string[];
  contact: {
    phone: string;
    email: string;
  };
  availability: {
    weekdays: boolean;
    weekends: boolean;
    allWeek: boolean;
  };
  seatMap: SeatMapData;
  images: string[];
  featuredImage?: string;
  type: string;
}

const defaultSeatMap: SeatMapData = {
  rows: 10,
  columns: 10,
  sections: [
    {
      id: 'general',
      name: 'General',
      rows: 10,
      columns: 10,
      price_multiplier: 1.0,
      color: 'hsl(var(--primary))',
      startRow: 0,
      startCol: 0
    }
  ],
  aisles: [5],
  wheelchair_accessible: [1, 10],
  special_features: [],
  layout_type: 'standard'
};

const sectionColors = [
  'hsl(var(--primary))', // Primary theme color
  'hsl(var(--secondary))', // Secondary theme color
  'hsl(var(--accent))', // Accent theme color
  'hsl(var(--destructive))', // Destructive theme color
  'hsl(var(--muted))', // Muted theme color
  'hsl(var(--popover))', // Popover theme color
  'hsl(var(--card))', // Card theme color
  'hsl(var(--border))'  // Border theme color
];

const venueTypes = [
  'Banquet Halls',
  'Conference Centers',
  'Country Clubs',
  'Cruise Ships',
  'Museums and Art Galleries',
  'Parks and Gardens',
  'Rooftop Venues',
  'Stadiums - Indoor',
  'Stadiums - Outdoor',
  'Theatres',
  'Universities and University Halls'
];

const predefinedLayouts = [
  {
    id: 'theater',
    name: 'Theater Style',
    icon: Grid,
    description: 'Traditional theater with premium, standard, and economy sections',
    seatMap: {
      rows: 15,
      columns: 20,
      sections: [
        { id: 'premium', name: 'Premium', rows: 5, columns: 20, price_multiplier: 1.5, color: 'hsl(var(--accent))', startRow: 0, startCol: 0 },
        { id: 'standard', name: 'Standard', rows: 7, columns: 20, price_multiplier: 1.0, color: 'hsl(var(--primary))', startRow: 5, startCol: 0 },
        { id: 'economy', name: 'Economy', rows: 3, columns: 20, price_multiplier: 0.8, color: 'hsl(var(--secondary))', startRow: 12, startCol: 0 }
      ],
      aisles: [5, 12],
      wheelchair_accessible: [1, 15],
      special_features: ['Stage_Lighting', 'Sound_System'],
      layout_type: 'theater'
    }
  },
  {
    id: 'conference',
    name: 'Conference Hall',
    icon: Square,
    description: 'Modern conference setup with flexible seating',
    seatMap: {
      rows: 12,
      columns: 16,
      sections: [
        { id: 'front', name: 'Front VIP', rows: 3, columns: 16, price_multiplier: 1.3, color: 'hsl(var(--primary))', startRow: 0, startCol: 0 },
        { id: 'middle', name: 'Standard', rows: 9, columns: 16, price_multiplier: 1.0, color: 'hsl(var(--secondary))', startRow: 3, startCol: 0 }
      ],
      aisles: [3, 8],
      wheelchair_accessible: [1, 12],
      special_features: ['Projection_Screen', 'WiFi', 'Air_Conditioning'],
      layout_type: 'conference'
    }
  },
  {
    id: 'amphitheater',
    name: 'Amphitheater',
    icon: Circle,
    description: 'Curved amphitheater with tiered seating',
    seatMap: {
      rows: 20,
      columns: 25,
      sections: [
        { id: 'orchestra', name: 'Orchestra', rows: 8, columns: 25, price_multiplier: 1.4, color: 'hsl(var(--accent))', startRow: 0, startCol: 0 },
        { id: 'mezzanine', name: 'Mezzanine', rows: 6, columns: 25, price_multiplier: 1.1, color: 'hsl(var(--primary))', startRow: 8, startCol: 0 },
        { id: 'balcony', name: 'Balcony', rows: 6, columns: 25, price_multiplier: 0.9, color: 'hsl(var(--secondary))', startRow: 14, startCol: 0 }
      ],
      aisles: [8, 14],
      wheelchair_accessible: [1, 20],
      special_features: ['Orchestra_Pit', 'Natural_Acoustics'],
      layout_type: 'amphitheater'
    }
  }
];

export default function CreateVenue() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<VenueFormData>({
    name: '',
    location: '',
    capacity: 0,
    description: '',
    amenities: [],
    contact: {
      phone: '',
      email: ''
    },
    availability: {
      weekdays: true,
      weekends: true,
      allWeek: false
    },
    seatMap: defaultSeatMap,
    images: [],
    featuredImage: '',
    type: ''
  });

  const [selectedLayout, setSelectedLayout] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [dragMode, setDragMode] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Store actual file objects
  const [validationErrors, setValidationErrors] = useState<{phone?: string; email?: string}>({});

  const totalSteps = 5;

  // Calculate total capacity based on seat map (avoiding double-counting overlaps)
  useEffect(() => {
    const { rows, columns, sections } = formData.seatMap;
    
    // Create a grid to track occupied seats and avoid double counting
    const occupiedSeats = new Set<string>();
    
    sections.forEach(section => {
      const actualRows = Math.min(section.rows, rows - section.startRow);
      const actualCols = Math.min(section.columns, columns - section.startCol);
      
      for (let row = section.startRow; row < section.startRow + actualRows; row++) {
        for (let col = section.startCol; col < section.startCol + actualCols; col++) {
          if (row >= 0 && col >= 0 && row < rows && col < columns) {
            occupiedSeats.add(`${row}-${col}`);
          }
        }
      }
    });
    
    const capacity = occupiedSeats.size;
    setFormData(prev => ({ ...prev, capacity }));
  }, [formData.seatMap]);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));

    // Validate the field
    if (field === 'phone') {
      validatePhone(value);
    } else if (field === 'email') {
      validateEmail(value);
    }
  };

  const handleAvailabilityChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value
      }
    }));
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    if (!phone) {
      setValidationErrors(prev => ({ ...prev, phone: undefined }));
    } else if (!phoneRegex.test(phone)) {
      setValidationErrors(prev => ({ ...prev, phone: 'Phone number must be exactly 10 digits' }));
    } else {
      setValidationErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
    } else if (!emailRegex.test(email)) {
      setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    } else {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const hasValidationErrors = () => {
    return Object.values(validationErrors).some(error => error !== undefined);
  };

  const handleSeatMapChange = (seatMap: SeatMapData) => {
    setFormData(prev => ({
      ...prev,
      seatMap
    }));
  };

  const applyPredefinedLayout = (layoutId: string) => {
    const layout = predefinedLayouts.find(l => l.id === layoutId);
    if (layout) {
      handleSeatMapChange(layout.seatMap);
      setSelectedLayout(layoutId);
    }
  };

  const addSection = () => {
    // Calculate the next available position for the new section
    const existingSections = formData.seatMap.sections;
    let newStartRow = 0;
    let newStartCol = 0;

    if (existingSections.length > 0) {
      // Find the bottom-most occupied row
      let maxEndRow = 0;
      existingSections.forEach(section => {
        const sectionEndRow = section.startRow + section.rows;
        if (sectionEndRow > maxEndRow) {
          maxEndRow = sectionEndRow;
        }
      });
      
      // If there's space below existing sections within the venue bounds
      if (maxEndRow + 5 <= formData.seatMap.rows) {
        newStartRow = maxEndRow;
        newStartCol = 0;
      } else {
        // Find space to the right of existing sections
        let maxEndCol = 0;
        existingSections.forEach(section => {
          const sectionEndCol = section.startCol + section.columns;
          if (sectionEndCol > maxEndCol) {
            maxEndCol = sectionEndCol;
          }
        });
        
        // Place to the right if there's space
        if (maxEndCol + 5 <= formData.seatMap.columns) {
          newStartRow = 0;
          newStartCol = maxEndCol;
        } else {
          // If no space, expand the venue or overlap (fallback)
          newStartRow = Math.min(maxEndRow, formData.seatMap.rows - 5);
          newStartCol = 0;
        }
      }
    }

    const newSection: SeatSection = {
      id: `section_${Date.now()}`,
      name: `Section ${formData.seatMap.sections.length + 1}`,
      rows: Math.min(5, formData.seatMap.rows - newStartRow),
      columns: Math.min(5, formData.seatMap.columns - newStartCol),
      price_multiplier: 1.0,
      color: sectionColors[formData.seatMap.sections.length % sectionColors.length],
      startRow: newStartRow,
      startCol: newStartCol
    };

    handleSeatMapChange({
      ...formData.seatMap,
      sections: [...formData.seatMap.sections, newSection]
    });
  };

  const updateSection = (sectionId: string, updates: Partial<SeatSection>) => {
    const newSections = formData.seatMap.sections.map(section => {
      if (section.id === sectionId) {
        const updatedSection = { ...section, ...updates };
        
        // Validate that the section doesn't exceed venue bounds
        if (updatedSection.startRow + updatedSection.rows > formData.seatMap.rows) {
          updatedSection.rows = Math.max(1, formData.seatMap.rows - updatedSection.startRow);
        }
        
        if (updatedSection.startCol + updatedSection.columns > formData.seatMap.columns) {
          updatedSection.columns = Math.max(1, formData.seatMap.columns - updatedSection.startCol);
        }
        
        // Ensure startRow and startCol are within bounds
        if (updatedSection.startRow >= formData.seatMap.rows) {
          updatedSection.startRow = Math.max(0, formData.seatMap.rows - updatedSection.rows);
        }
        
        if (updatedSection.startCol >= formData.seatMap.columns) {
          updatedSection.startCol = Math.max(0, formData.seatMap.columns - updatedSection.columns);
        }
        
        return updatedSection;
      }
      return section;
    });

    handleSeatMapChange({
      ...formData.seatMap,
      sections: newSections
    });
  };

  const removeSection = (sectionId: string) => {
    const newSections = formData.seatMap.sections.filter(section => section.id !== sectionId);
    handleSeatMapChange({
      ...formData.seatMap,
      sections: newSections
    });
  };

  // Image handling function for single image
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    
    try {
      // Take only the first file (single image upload)
      const file = files[0];
      
      if (file.type.startsWith('image/')) {
        // Convert to base64 for preview
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        // Replace any existing image (single image only)
        setFormData(prev => ({
          ...prev,
          images: [base64], // Single image array
          featuredImage: base64
        }));
        
        // Store the actual file object (single file)
        setImageFiles([file]);
        
        console.log('📸 Single image selected:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
      
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = () => {
    // Clear the single image
    setFormData(prev => ({
      ...prev,
      images: [],
      featuredImage: ''
    }));
    
    setImageFiles([]);
  };

  const setFeaturedImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      featuredImage: imageUrl
    }));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const renderSeatMap = () => {
    const { rows, columns, sections, aisles } = formData.seatMap;
    const seats = [];

    // Calculate seat size based on total seats to prevent overflow
    const totalSeats = rows * columns;
    const seatSize = totalSeats > 500 ? 'w-3 h-3' : totalSeats > 200 ? 'w-4 h-4' : 'w-6 h-6';
    const marginSize = totalSeats > 500 ? 'm-0.5' : 'm-0.5';

    // Create a 2D array to track which section owns each seat
    const seatGrid = Array(rows).fill(null).map(() => Array(columns).fill(null));
    
    // Fill the grid with section ownership (last section wins in case of overlap)
    sections.forEach(section => {
      for (let row = section.startRow; row < Math.min(section.startRow + section.rows, rows); row++) {
        for (let col = section.startCol; col < Math.min(section.startCol + section.columns, columns); col++) {
          if (row >= 0 && col >= 0 && row < rows && col < columns) {
            seatGrid[row][col] = section;
          }
        }
      }
    });

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const section = seatGrid[row][col];
        const isAisle = aisles.includes(row);
        const isSelected = selectedSection === section?.id;
        const isEmpty = !section;

        seats.push(
          <div
            key={`${row}-${col}`}
            className={`${seatSize} ${marginSize} rounded-sm transition-all duration-200 cursor-pointer transform hover:scale-110 ${
              isAisle ? 'opacity-50' : ''
            } ${
              isSelected ? 'ring-2 ring-white ring-offset-1' : ''
            } ${
              isEmpty ? 'border-2 border-dashed border-gray-400' : ''
            }`}
            style={{
              backgroundColor: section?.color || 'hsl(var(--muted))',
              opacity: section ? 1 : 0.3
            }}
            onClick={() => section && setSelectedSection(section.id)}
            title={section ? `${section.name} (${row + 1}, ${col + 1})` : `Empty seat (${row + 1}, ${col + 1})`}
          />
        );
      }
    }

    return (
      <div className="inline-block p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl max-w-full">
        <div 
          className="grid gap-0.5 overflow-x-auto"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            maxWidth: '100%'
          }}
        >
          {seats}
        </div>
        
        {/* Stage */}
        <div className="mt-6 w-full h-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-semibold">🎭 STAGE</span>
        </div>
        
        {/* Section Info */}
        <div className="mt-4 text-white text-xs">
          <div className="flex justify-between">
            <span>Total Seats: {sections.reduce((sum, s) => sum + Math.min(s.rows, rows - s.startRow) * Math.min(s.columns, columns - s.startCol), 0)}</span>
            <span>Sections: {sections.length}</span>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = async () => {
    console.log("🔍 Debugging image files:");
    console.log("imageFiles length:", imageFiles.length);
    console.log("imageFiles data:", imageFiles);
    console.log("formData.images length:", formData.images.length);
    
    try {
      setIsSubmitting(true);

      // Check for validation errors
      if (hasValidationErrors()) {
        throw new Error('Please fix the validation errors before submitting');
      }
      
      // Validate required fields
      if (!formData.name.trim() || !formData.location.trim() || !formData.capacity || !formData.latitude || !formData.longitude) {
        throw new Error('Please fill in all required fields (Name, Location, Capacity) and select a location on the map');
      }

      // Validate phone number
      if (formData.contact.phone && !/^\d{10}$/.test(formData.contact.phone)) {
        throw new Error('Phone number must be exactly 10 digits');
      }

      // Validate email
      if (formData.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Confirm if no images
      if (imageFiles.length === 0) {
        const confirmWithoutImages = window.confirm(
          'No images have been uploaded. Do you want to create the venue without images?'
        );
        if (!confirmWithoutImages) return;
      }
      
      console.log('🏗️ Step 1: Creating venue without images...');
      
      // Step 1: Create venue without images (minimal payload)
      const venuePayload = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        capacity: formData.capacity,
        description: formData.description.trim() || null,
        seatMap: formData.seatMap,
        type: formData.type.trim(),
        contact: {
          phone: formData.contact.phone.trim(),
          email: formData.contact.email.trim()
        },
        amenities: formData.amenities,
        availability: formData.availability
      };

      console.log('📤 Creating venue with data:', {
        name: venuePayload.name,
        location: venuePayload.location,
        capacity: venuePayload.capacity,
        hasDescription: !!venuePayload.description,
        seatMapSections: venuePayload.seatMap.sections.length,
        hasContact: !!(venuePayload.contact.phone || venuePayload.contact.email),
        availability: venuePayload.availability,
        pendingImages: imageFiles.length
      });

      const createResponse = await createVenue(venuePayload);
      console.log('✅ Venue created successfully:', createResponse);
      
      if (!createResponse || !createResponse.data) {
        throw new Error(createResponse?.message || 'Failed to create venue');
      }

      const newVenueId = createResponse.data.id;
      console.log('🆔 New venue ID:', newVenueId);

      // Step 2: Upload image if any exists
      if (imageFiles.length > 0) {
        console.log(`🖼️ Step 2: Uploading single image to venue ${newVenueId}...`);
        console.log('🖼️ Image file details:', {
          name: imageFiles[0].name,
          size: imageFiles[0].size,
          type: imageFiles[0].type
        });
        
        try {
          // Use the single image upload function
          const uploadResponse = await uploadVenueImage(newVenueId.toString(), imageFiles[0]);
          console.log('✅ Image uploaded successfully:', uploadResponse);
          
          // Show success message
          alert(`✅ Venue "${createResponse.data.name}" created successfully with image!`);
        } catch (imageError) {
          console.warn('⚠️ Venue created but image upload failed:', imageError);
          alert(`⚠️ Venue "${createResponse.data.name}" was created successfully, but image upload failed. You can add images later by editing the venue.`);
        }
      } else {
        // Success without images
        alert(`✅ Venue "${createResponse.data.name}" created successfully!`);
      }
      
      // Navigate to venues page
      router.push('/venue-owner/venues');
      
    } catch (error: any) {
      console.error('❌ Error creating venue:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      // Show user-friendly error message
      let errorMessage = 'Failed to create venue. Please try again.';
      
      if (error.message?.includes('401') || error.message?.includes('403')) {
        errorMessage = 'You are not authorized to create venues. Please ensure you have venue owner permissions.';
      } else if (error.message?.includes('400')) {
        errorMessage = 'Please check all required fields are filled correctly.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message && !error.message.includes('Failed to create venue')) {
        errorMessage = error.message;
      }
        
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-background via-muted/10 to-primary/5 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/venue-owner/venues">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Venues
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Create New Venue
          </h1>
          <p className="text-muted-foreground">Design your venue with our advanced seating layout system</p>
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="mb-6">
            <ErrorDisplay
              type="error"
              title="Failed to Create Venue"
              message={submitError}
              variant="card"
              onRetry={() => {
                setSubmitError(null);
                handleSubmit();
              }}
              className="max-w-2xl"
            />
          </div>
        )}

        {/* Progress Bar */}
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
            {/* Step 1: Venue Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <Building2 className="h-6 w-6 mr-3 text-primary" />
                  Venue Information
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Venue Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                    >
                      <option value="">Select venue type</option>
                      {venueTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="Enter venue name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Venue Location *
                    </label>
                    <LocationPicker
                      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                      onLocationSelect={(location) => {
                        setFormData(prev => ({
                          ...prev,
                          location: location.address,
                          latitude: location.latitude,
                          longitude: location.longitude
                        }));
                      }}
                      initialLocation={
                        formData.location && formData.latitude && formData.longitude
                          ? {
                              address: formData.location,
                              latitude: formData.latitude,
                              longitude: formData.longitude
                            }
                          : undefined
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <Users className="h-6 w-6 mr-3 text-primary" />
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.contact.phone}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                        validationErrors.phone ? 'border-red-500' : 'border-border'
                      }`}
                      placeholder="Enter phone number"
                    />
                    {validationErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                        validationErrors.email ? 'border-red-500' : 'border-border'
                      }`}
                      placeholder="Enter email address"
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-foreground">
                    Contact Availability
                  </label>
                  <div className="bg-background/50 rounded-lg p-4 border">
                    <p className="text-sm text-muted-foreground mb-4">
                      Select when venue owners can be contacted for inquiries and bookings
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Weekdays */}
                      <div className="relative">
                        <label className="flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 group">
                          <input
                            type="checkbox"
                            checked={formData.availability.weekdays}
                            onChange={(e) => handleAvailabilityChange('weekdays', e.target.checked)}
                            className="mr-3 accent-primary"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">Weekdays</div>
                            <div className="text-xs text-muted-foreground">Mon - Fri</div>
                          </div>
                          <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            📅
                          </div>
                        </label>
                      </div>

                      {/* Weekends */}
                      <div className="relative">
                        <label className="flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 group">
                          <input
                            type="checkbox"
                            checked={formData.availability.weekends}
                            onChange={(e) => handleAvailabilityChange('weekends', e.target.checked)}
                            className="mr-3 accent-primary"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">Weekends</div>
                            <div className="text-xs text-muted-foreground">Sat - Sun</div>
                          </div>
                          <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            🎉
                          </div>
                        </label>
                      </div>

                      {/* All Week */}
                      <div className="relative">
                        <label className="flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 group">
                          <input
                            type="checkbox"
                            checked={formData.availability.allWeek}
                            onChange={(e) => handleAvailabilityChange('allWeek', e.target.checked)}
                            className="mr-3 accent-primary"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">All Week</div>
                            <div className="text-xs text-muted-foreground">24/7 Available</div>
                          </div>
                          <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            🌟
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Selected availability summary */}
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Selected availability:</div>
                      <div className="flex flex-wrap gap-2">
                        {formData.availability.weekdays && (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Weekdays</span>
                        )}
                        {formData.availability.weekends && (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Weekends</span>
                        )}
                        {formData.availability.allWeek && (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">All Week</span>
                        )}
                        {!formData.availability.weekdays && !formData.availability.weekends && !formData.availability.allWeek && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">No availability selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Venue Image and Description */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <ImageIcon className="h-6 w-6 mr-3 text-primary" />
                  Venue Image and Description
                </h2>

                {/* Image Upload Area */}
                <div className="space-y-4">
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                      dragActive 
                        ? 'border-primary bg-primary/10 scale-105' 
                        : 'border-border hover:border-primary/50 bg-background/50'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {uploadingImages ? (
                      <div className="flex flex-col items-center">
                        <Loading
                          size="lg"
                          text="Uploading images..."
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <ImageIcon className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Upload Venue Image</h3>
                          <p className="text-muted-foreground mb-4">
                            Drag and drop an image here, or click to browse
                          </p>
                          <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files)}
                            className="hidden"
                          />
                          <label
                            htmlFor="image-upload"
                            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 cursor-pointer transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Choose Image
                          </label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Supported formats: JPG, PNG, WebP. Max 5MB per image.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Uploaded Image Display */}
                  {formData.images.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Uploaded Image</h3>
                      
                      <div className="flex justify-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="relative group w-64"
                        >
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={formData.images[0]}
                              alt="Venue image"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Image Controls */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeImage()}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      </div>

                      {/* Image Info */}
                      <div className="bg-background/50 rounded-lg p-4 border text-center">
                        <p className="text-sm text-muted-foreground">
                          This image will be used as the main venue photo in listings.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Venue Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="Describe your venue, its features, capacity, and what makes it special..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Layout Selection */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <Grid className="h-6 w-6 mr-3 text-primary" />
                  Choose Layout Template
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {predefinedLayouts.map((layout) => (
                    <motion.div
                      key={layout.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => applyPredefinedLayout(layout.id)}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedLayout === layout.id
                          ? 'border-primary bg-primary/10 shadow-lg'
                          : 'border-border hover:border-primary/50 bg-background/50'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-4">
                        <layout.icon className={`h-12 w-12 ${
                          selectedLayout === layout.id ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      
                      <h3 className="text-lg font-semibold text-center mb-2">
                        {layout.name}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        {layout.description}
                      </p>

                      <div className="text-xs text-center space-y-1">
                        <div className="flex justify-between">
                          <span>Rows:</span>
                          <span className="font-medium">{layout.seatMap.rows}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Columns:</span>
                          <span className="font-medium">{layout.seatMap.columns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sections:</span>
                          <span className="font-medium">{layout.seatMap.sections.length}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Or start with a custom layout in the next step
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Seating Layout Designer */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold flex items-center">
                    <Settings className="h-6 w-6 mr-3 text-primary" />
                    Seating Layout Designer
                  </h2>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={isPreviewMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {isPreviewMode ? 'Edit Mode' : 'Preview'}
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={() => handleSeatMapChange(defaultSeatMap)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Controls */}
                  {!isPreviewMode && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Layout Settings */}
                      <div className="bg-background/50 rounded-lg p-4 border">
                        <h3 className="font-semibold mb-4 flex items-center">
                          <Grid className="h-4 w-4 mr-2" />
                          Layout Settings
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Total Rows</label>
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={formData.seatMap.rows}
                              onChange={(e) => handleSeatMapChange({
                                ...formData.seatMap,
                                rows: parseInt(e.target.value) || 1
                              })}
                              className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Total Columns</label>
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={formData.seatMap.columns}
                              onChange={(e) => handleSeatMapChange({
                                ...formData.seatMap,
                                columns: parseInt(e.target.value) || 1
                              })}
                              className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sections */}
                      <div className="bg-background/50 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold flex items-center">
                            <Palette className="h-4 w-4 mr-2" />
                            Sections
                          </h3>
                          <Button size="sm" onClick={addSection}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>

                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {formData.seatMap.sections.map((section) => (
                            <div
                              key={section.id}
                              className={`p-3 border rounded-lg transition-all cursor-pointer ${
                                selectedSection === section.id
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => setSelectedSection(section.id)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div
                                    className="w-4 h-4 rounded mr-2"
                                    style={{ backgroundColor: section.color }}
                                  />
                                  <input
                                    type="text"
                                    value={section.name}
                                    onChange={(e) => updateSection(section.id, { name: e.target.value })}
                                    className="text-sm font-medium bg-transparent border-none outline-none"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                {formData.seatMap.sections.length > 1 && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeSection(section.id);
                                    }}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <label className="block text-muted-foreground">Start Row</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max={formData.seatMap.rows - 1}
                                    value={section.startRow}
                                    onChange={(e) => updateSection(section.id, { 
                                      startRow: Math.max(0, Math.min(parseInt(e.target.value) || 0, formData.seatMap.rows - 1))
                                    })}
                                    className="w-full px-2 py-1 border rounded text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div>
                                  <label className="block text-muted-foreground">Start Col</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max={formData.seatMap.columns - 1}
                                    value={section.startCol}
                                    onChange={(e) => updateSection(section.id, { 
                                      startCol: Math.max(0, Math.min(parseInt(e.target.value) || 0, formData.seatMap.columns - 1))
                                    })}
                                    className="w-full px-2 py-1 border rounded text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div>
                                  <label className="block text-muted-foreground">Rows</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max={formData.seatMap.rows - section.startRow}
                                    value={section.rows}
                                    onChange={(e) => updateSection(section.id, { 
                                      rows: Math.max(1, Math.min(parseInt(e.target.value) || 1, formData.seatMap.rows - section.startRow))
                                    })}
                                    className="w-full px-2 py-1 border rounded text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div>
                                  <label className="block text-muted-foreground">Cols</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max={formData.seatMap.columns - section.startCol}
                                    value={section.columns}
                                    onChange={(e) => updateSection(section.id, { 
                                      columns: Math.max(1, Math.min(parseInt(e.target.value) || 1, formData.seatMap.columns - section.startCol))
                                    })}
                                    className="w-full px-2 py-1 border rounded text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div>
                                  <label className="block text-muted-foreground">Price ×</label>
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={section.price_multiplier}
                                    onChange={(e) => updateSection(section.id, { 
                                      price_multiplier: parseFloat(e.target.value) || 1 
                                    })}
                                    className="w-full px-2 py-1 border rounded text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div>
                                  <label className="block text-muted-foreground">Color</label>
                                  <input
                                    type="color"
                                    value={section.color}
                                    onChange={(e) => updateSection(section.id, { color: e.target.value })}
                                    className="w-full h-6 border rounded cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Seating Map Visualization */}
                  <div className="flex flex-col items-center w-full">
                    <div className="mb-4">
                      <div className="flex items-center justify-center space-x-6 text-sm">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-primary" />
                          <span>Total Capacity: <strong>{formData.capacity}</strong></span>
                        </div>
                        <div className="flex items-center">
                          <Grid className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{formData.seatMap.rows} × {formData.seatMap.columns}</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-x-auto max-w-full">
                      {renderSeatMap()}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                      {formData.seatMap.sections.map((section) => (
                        <div key={section.id} className="flex items-center space-x-2 text-sm">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: section.color }}
                          />
                          <span>{section.name}</span>
                          <span className="text-muted-foreground">
                            ({section.rows}×{section.columns})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <Check className="h-6 w-6 mr-3 text-primary" />
                  Review & Submit
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Venue Details */}
                  <div className="space-y-6">
                    <div className="bg-background/50 rounded-lg p-6 border">
                      <h3 className="font-semibold mb-4">Venue Details</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-muted-foreground">Name:</span>
                          <p className="font-medium">{formData.name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Location:</span>
                          <p className="font-medium">{formData.location}</p>
                          {formData.latitude && formData.longitude && (
                            <p className="text-xs text-muted-foreground">
                              Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Capacity:</span>
                          <p className="font-medium">{formData.capacity} seats</p>
                        </div>
                        {formData.description && (
                          <div>
                            <span className="text-sm text-muted-foreground">Description:</span>
                            <p className="font-medium">{formData.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-background/50 rounded-lg p-6 border">
                      <h3 className="font-semibold mb-4">Contact Information</h3>
                      <div className="space-y-3">
                        {formData.contact.phone && (
                          <div>
                            <span className="text-sm text-muted-foreground">Phone:</span>
                            <p className="font-medium">{formData.contact.phone}</p>
                          </div>
                        )}
                        {formData.contact.email && (
                          <div>
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <p className="font-medium">{formData.contact.email}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-background/50 rounded-lg p-6 border">
                      <h3 className="font-semibold mb-4">Images</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-muted-foreground">Total Images:</span>
                          <p className="font-medium">{formData.images.length} images uploaded</p>
                        </div>
                        {formData.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-2">
                            {formData.images.slice(0, 4).map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={image}
                                  alt={`Venue ${index + 1}`}
                                  className="w-full h-16 object-cover rounded border"
                                />
                                {formData.featuredImage === image && (
                                  <div className="absolute inset-0 bg-primary/20 rounded flex items-center justify-center">
                                    <Eye className="h-3 w-3 text-primary" />
                                  </div>
                                )}
                              </div>
                            ))}
                            {formData.images.length > 4 && (
                              <div className="w-full h-16 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                                +{formData.images.length - 4} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-background/50 rounded-lg p-6 border">
                      <h3 className="font-semibold mb-4">Seating Configuration</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-muted-foreground">Layout:</span>
                          <p className="font-medium">{formData.seatMap.rows} rows × {formData.seatMap.columns} columns</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Sections:</span>
                          <div className="mt-2 space-y-2">
                            {formData.seatMap.sections.map((section) => (
                              <div key={section.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                  <div
                                    className="w-3 h-3 rounded mr-2"
                                    style={{ backgroundColor: section.color }}
                                  />
                                  <span>{section.name}</span>
                                </div>
                                <span className="text-muted-foreground">
                                  {section.rows}×{section.columns} ({section.rows * section.columns} seats)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seating Preview */}
                  <div className="flex flex-col items-center">
                    <h3 className="font-semibold mb-4">Seating Layout Preview</h3>
                    {renderSeatMap()}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
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
                disabled={
                  (currentStep === 1 && (!formData.type || !formData.name || !formData.location)) ||
                  (currentStep === 2 && formData.images.length === 0) ||
                  (currentStep === 3 && (!formData.contact.phone || !formData.contact.email))
                }
                className="flex items-center bg-gradient-to-r from-primary to-purple-600"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Creating...' : 'Create Venue'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
