"use client"
import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorDisplay } from '@/components/ui/error-display';
import { 
  ArrowLeft, 
  Save,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Tag,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { fetchEventById, updateEventDetails, fetchVenues } from '@/lib/api';

interface EventEditPageProps {
  params: {
    id: string;
  };
}

export default function EventEditPage({ params }: EventEditPageProps) {
  const [event, setEvent] = useState<any>(null);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    venueId: '',
    price: 0,
    category: '',
    capacity: 0,
    organizer: '',
    tags: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load both event and venues in parallel
        const [eventData, venuesData] = await Promise.all([
          fetchEventById(params.id),
          fetchVenues()
        ]);
        
        setEvent(eventData);
        setVenues(venuesData);
        
        // Initialize form with event data
        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          date: eventData.date || eventData.startDate || '',
          time: eventData.time || eventData.startTime || '',
          venue: eventData.venue || '',
          venueId: eventData.venueId || '',
          price: eventData.ticketPrice || eventData.price || 0,
          category: eventData.category || '',
          capacity: eventData.capacity || 0,
          organizer: eventData.organizer || '',
          tags: eventData.tags?.join(', ') || ''
        });
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading 
          size="lg" 
          text="Loading event details..." 
          className="text-foreground"
        />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorDisplay
          type="error"
          title="Event Not Found"
          message={error || "The event you're looking for doesn't exist or has been removed."}
          variant="card"
          className="max-w-md"
        />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      
      // Prepare data for API
      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: formData.date,
        startTime: formData.time,
        venueId: formData.venueId,
        ticketPrice: Number(formData.price),
        category: formData.category,
        capacity: Number(formData.capacity),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await updateEventDetails(params.id, eventData);
      setSaveSuccess(true);
      
      // Refresh event data
      const updatedEvent = await fetchEventById(params.id);
      setEvent(updatedEvent);
      
    } catch (err) {
      console.error('Failed to update event:', err);
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
      
      // Clear success message after 3 seconds
      if (!saveError) {
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }
    }
  };

  const categories = [
    'Music',
    'Sports',
    'Theater',
    'Comedy',
    'Conference',
    'Festival',
    'Exhibition',
    'Workshop'
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href={`/organizer/events/${params.id}/view`} className="inline-flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event View
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Edit Event</h1>
              <p className="text-muted-foreground">Update your event details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/organizer/events/${params.id}/seating-edit`}>
              <Button variant="outline">
                Edit Seating
              </Button>
            </Link>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-lg border p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Event Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter event title"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter event description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Tag className="inline h-4 w-4 mr-1" />
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Users className="inline h-4 w-4 mr-1" />
                    Organizer
                  </label>
                  <input
                    type="text"
                    name="organizer"
                    value={formData.organizer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Organizer name"
                  />
                </div>
              </div>
            </div>

            {/* Venue Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Venue Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Venue
                  </label>
                  <select
                    name="venueId"
                    value={formData.venueId}
                    onChange={(e) => {
                      const selectedVenue = venues.find((v: any) => v.id === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        venueId: e.target.value,
                        venue: selectedVenue?.name || '',
                        capacity: selectedVenue?.capacity || 0
                      }));
                    }}
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select venue</option>
                    {venues.map((venue: any) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name} - {venue.city || ''}, {venue.state || ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Users className="inline h-4 w-4 mr-1" />
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Total capacity"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Base Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Tag className="inline h-4 w-4 mr-1" />
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="music, live, concert, entertainment"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Separate tags with commas to help people find your event
                </p>
              </div>
            </div>
          </div>

          {/* Notification messages */}
          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-center mb-6 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              <span>Event details saved successfully!</span>
            </div>
          )}
          
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-center mb-6 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              <span>{saveError}</span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t">
            <Link href={`/organizer/events/${params.id}/view`}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
