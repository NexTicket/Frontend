'use client';

import React, { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Building2,
  Save,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { fetchVenueById, updateVenue } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface VenueEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditVenue({ params }: VenueEditPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    contact: {
      phone: '',
      email: ''
    }
  });

  useEffect(() => {
    fetchVenueById(resolvedParams.id)
      .then(data => {
        const venueData = data.data;
        setVenue(venueData);
        setFormData({
          name: venueData.name || '',
          location: venueData.location || '',
          description: venueData.description || '',
          contact: {
            phone: venueData.contact?.phone || '',
            email: venueData.contact?.email || ''
          }
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching venue", err);
        setLoading(false);
      });
  }, [resolvedParams.id]);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const updatePayload = {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        contact: formData.contact
      };

      await updateVenue(resolvedParams.id, updatePayload);
      router.push('/venue-owner/venues');
    } catch (error) {
      console.error('Error updating venue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading venue...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Venue not found</h3>
          <p className="text-muted-foreground mb-6">The venue you're looking for doesn't exist.</p>
          <Link href="/venue-owner/venues">
            <Button>Back to Venues</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-background via-muted/10 to-primary/5 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/venue-owner/venues">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Venues
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Edit Venue
          </h1>
          <p className="text-muted-foreground">Update your venue information</p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card/50 backdrop-blur-sm rounded-xl border p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Building2 className="h-6 w-6 mr-3 text-primary" />
              Venue Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Enter venue location"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Describe your venue..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Current Seating Info (Read-only) */}
            <div className="bg-background/50 rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">Current Seating Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Capacity:</span>
                  <p className="font-medium">{venue.capacity} seats</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Layout:</span>
                  <p className="font-medium">
                    {venue.seatMap?.rows || 'N/A'} × {venue.seatMap?.columns || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sections:</span>
                  <p className="font-medium">
                    {venue.seatMap?.sections?.length || 0} sections
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                To modify seating layout, please create a new venue or contact support.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Link href="/venue-owner/venues">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Venue
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
