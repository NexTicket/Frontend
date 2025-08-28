"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin,
  CheckCircle,
  Building,
  Users,
  Star,
  X,
  Eye,
  Film
} from 'lucide-react';
import { mockVenues } from '@/lib/mock-data';
import { createEvent, EventType, uploadEventImage } from '@/lib/api';
import RouteGuard from '@/components/auth/routeGuard';

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  amenities: string[];
  description?: string;
  contact?: {
    phone: string;
  };
}

export default function NewEventPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: EventType.EVENT, // Default to EVENT
    startDate: '',
    endDate: '',
    venueId: '',
  });

  const categories = [
    'Music', 'Technology', 'Theater', 'Food', 'Art', 'Sports', 
    'Business', 'Education', 'Health', 'Fashion', 'Conference', 'Other'
  ];

  const steps = [
    { id: 1, title: 'Event Details', description: 'Basic information' },
    { id: 2, title: 'Venue Selection', description: 'Choose venue' },
    { id: 3, title: 'Event Poster', description: 'Upload poster image' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVenueSelect = (venue: Venue) => {
    setSelectedVenue(venue);
    setFormData({ ...formData, venueId: venue.id });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        alert('Please select a valid image file');
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, 3));
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create the event data object
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        startDate: formData.startDate,
        // Only include endDate for EVENT type, not for MOVIE type
        ...(formData.type === EventType.EVENT && {
          endDate: formData.endDate
        }),
        venueId: selectedVenue?.id || ''
      };

      // Create the event first
      const response = await createEvent(eventData);
      const eventId = response.data?.id;

      // Upload image if one is selected
      if (selectedImage && eventId) {
        setImageUploading(true);
        try {
          await uploadEventImage(eventId.toString(), selectedImage);
          console.log('Event image uploaded successfully');
        } catch (imageError) {
          console.error('Failed to upload event image:', imageError);
          // Don't fail the whole process if image upload fails
        } finally {
          setImageUploading(false);
        }
      }

      setShowSubmissionModal(true);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteGuard requiredRole="organizer">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/organizer/dashboard">
                <Button variant="ghost" size="sm" className="hover:bg-muted">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Create New Event</h1>
                <p className="text-muted-foreground">Fill in the details to create your event</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep >= step.id 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-muted-foreground/30 text-muted-foreground'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 text-left">
                  <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-px w-16 mx-4 ${currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Event Details */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeInScale">
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Event Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium mb-2">Event Title *</label>
                      <input
                        type="text" id="title" name="title" value={formData.title} onChange={handleInputChange}
                        placeholder="Enter your event title"
                        className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all" required
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium mb-2">Description *</label>
                      <textarea
                        id="description" name="description" value={formData.description} onChange={handleInputChange}
                        placeholder="Describe your event..." rows={3}
                        className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none" required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium mb-2">Category *</label>
                        <select
                          id="category" name="category" value={formData.category} onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all" required
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium mb-2">Event Type *</label>
                        <select
                          id="type" name="type" value={formData.type} onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all" required
                        >
                          <option value={EventType.EVENT}>Event (Multiple Days)</option>
                          <option value={EventType.MOVIE}>Movie (Single Day)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium mb-2">Start Date *</label>
                      <input
                        type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all" required
                      />
                    </div>
                    {formData.type === EventType.EVENT && (
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium mb-2">End Date *</label>
                        <input
                          type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all" required
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div></div>
                  <Button type="button" onClick={nextStep} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                    Next: Choose Venue →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Venue Selection */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeInScale">
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    Select Venue
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockVenues.slice(0, 6).map((venue) => (
                      <div
                        key={venue.id}
                        onClick={() => handleVenueSelect(venue)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedVenue?.id === venue.id 
                            ? 'border-primary bg-primary/5 shadow-md' 
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{venue.name}</h4>
                          {selectedVenue?.id === venue.id && (
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{venue.address}, {venue.city}</p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {venue.capacity}
                            </span>
                            <span className="flex items-center">
                              <Building className="h-3 w-3 mr-1" />
                              {venue.amenities.length} amenities
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>← Previous</Button>
                  <Button type="button" onClick={nextStep} disabled={!selectedVenue} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                    Next: Upload Poster →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Event Poster */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeInScale">
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Film className="h-5 w-5 mr-2 text-primary" />
                    Event Poster
                  </h3>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Upload a high-quality poster image for your event. This will be displayed on event listings and promotional materials.
                    </p>
                    
                    {!imagePreview ? (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Choose an event poster</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, or JPEG (max 5MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="poster-upload"
                        />
                        <label htmlFor="poster-upload">
                          <Button type="button" variant="outline" className="mt-4" onClick={() => document.getElementById('poster-upload')?.click()}>
                            Select Image
                          </Button>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Event poster preview"
                            className="w-full max-w-md mx-auto rounded-lg shadow-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={removeImage}
                            className="absolute top-2 right-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">Poster selected successfully!</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedImage?.name} ({Math.round((selectedImage?.size || 0) / 1024)}KB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>← Previous</Button>
                  <Button 
                    type="submit" 
                    disabled={loading || imageUploading}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  >
                    {loading || imageUploading ? 'Creating Event...' : 'Create Event'} ✨
                  </Button>
                </div>
              </div>
            )}
          </form>

          {/* Submission Success Modal */}
          {showSubmissionModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-card rounded-lg border p-8 max-w-md w-full mx-4 shadow-2xl animate-fadeInScale">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Event Created Successfully! 🎉</h3>
                  <p className="text-muted-foreground">
                    Your event "{formData.title}" has been created and saved to the database. 
                    {selectedImage && " The poster image has been uploaded to Cloudinary."}
                  </p>
                  <div className="flex space-x-3">
                    <Button onClick={() => router.push('/organizer/events')} className="flex-1">
                      View My Events
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/organizer/dashboard')} className="flex-1">
                      Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}
