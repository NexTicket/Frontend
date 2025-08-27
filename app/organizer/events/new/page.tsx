"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, MapPin, Clock, ArrowLeft, ArrowRight, Check, Upload, Image as ImageIcon, X } from 'lucide-react';
import { fetchVenues, createEvent } from '@/lib/api';

export default function NewEventPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [venues, setVenues] = useState<{ id: number; name: string; city?: string; state?: string }[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'EVENT',
    startDate: '',
    endDate: '',
    venueId: '',
    image: ''
  });
  const categories = [
    'Music', 'Technology', 'Theater', 'Food', 'Art', 'Sports', 
    'Business', 'Education', 'Health', 'Fashion', 'Other'
  ];
  useEffect(() => {
    const loadVenues = async () => {
      try {
        setVenuesLoading(true);
        setError('');
        const response = await fetchVenues();
        const data = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        setVenues(data);
      } catch (err) {
        setError('Could not load venues');
      } finally {
        setVenuesLoading(false);
      }
    };
    loadVenues();
  }, []);
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };
  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  const handleSubmit = async () => {
    if (!formData.title || !formData.startDate || !formData.venueId) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      setError('');
      setSubmitting(true);
      let imageUrl = formData.image;
      if (imageFile) {
        // Simulate image upload (replace with real upload logic)
        // Example: const uploadRes = await uploadImageToBackend(imageFile);
        // imageUrl = uploadRes.url;
        imageUrl = imagePreview || '';
      }
      await createEvent({
        title: formData.title,
        description: formData.description || formData.title,
        category: formData.category || 'Other',
        type: formData.type as 'MOVIE' | 'EVENT' | string,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        venueId: formData.venueId,
        image: imageUrl
      });
      alert(`Event "${formData.title}" created successfully! It will be reviewed by administrators.`);
      setFormData({ title: '', description: '', category: '', type: 'EVENT', startDate: '', endDate: '', venueId: '', image: '' });
      setImageFile(null);
      setImagePreview(null);
      setCurrentStep(1);
      router.push('/organizer/dashboard');
    } catch (error) {
      setError('Failed to create event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
            index + 1 === currentStep
              ? 'border-primary bg-primary text-white'
              : index + 1 < currentStep
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-gray-300 bg-gray-100 text-gray-400'
          }`}>
            {index + 1 < currentStep ? (
              <Check className="w-5 h-5" />
            ) : (
              index + 1
            )}
          </div>
          {index < totalSteps - 1 && (
            <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
              index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Basic Information</h3>
              <p className="text-muted-foreground">Let's start with the essential details of your event</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event Title *</label>
                <input type="text" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" placeholder="Enter your event title" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea value={formData.description} onChange={e => handleInputChange('description', e.target.value)} rows={4} className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" placeholder="Describe your event..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select value={formData.category} onChange={e => handleInputChange('category', e.target.value)} className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200">
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Event Type</label>
                  <select value={formData.type} onChange={e => handleInputChange('type', e.target.value)} className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200">
                    <option value="EVENT">EVENT</option>
                    <option value="MOVIE">MOVIE</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Date & Time</h3>
              <p className="text-muted-foreground">Set when your event will take place</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2"><Calendar className="h-4 w-4 inline mr-2" />Start Date *</label>
                  <input type="date" value={formData.startDate} onChange={e => handleInputChange('startDate', e.target.value)} className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2"><Clock className="h-4 w-4 inline mr-2" />End Date (Optional)</label>
                  <input type="date" value={formData.endDate} onChange={e => handleInputChange('endDate', e.target.value)} className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Venue Selection</h3>
              <p className="text-muted-foreground">Choose where your event will be held</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2"><MapPin className="h-4 w-4 inline mr-2" />Venue *</label>
                <select value={formData.venueId} onChange={e => handleInputChange('venueId', e.target.value)} className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" required disabled={venuesLoading}>
                  <option value="">{venuesLoading ? 'Loading venues...' : 'Select a venue'}</option>
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.id}>{venue.name}{venue.city ? ` - ${venue.city}${venue.state ? `, ${venue.state}` : ''}` : ''}</option>
                  ))}
                </select>
                {venuesLoading && <div className="text-blue-500 mt-2 text-sm">Loading venues from database...</div>}
                {!venuesLoading && venues.length === 0 && (<div className="text-yellow-500 mt-2 text-sm">No venues available. Please contact an administrator.</div>)}
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Event Image</h3>
              <p className="text-muted-foreground">Upload an image for your event (optional)</p>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
              <label htmlFor="image-upload">
                <Button type="button" variant="outline" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />Choose Image
                </Button>
              </label>
              {imagePreview && (
                <div className="mt-4 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-lg border" />
                  <button type="button" onClick={handleRemoveImage} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X className="h-4 w-4" /></button>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Review & Submit</h3>
              <p className="text-muted-foreground">Review your event details before submitting</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-muted-foreground">Event Title</label><p className="font-medium">{formData.title || 'Not specified'}</p></div>
                <div><label className="text-sm font-medium text-muted-foreground">Category</label><p className="font-medium">{formData.category || 'Not specified'}</p></div>
                <div><label className="text-sm font-medium text-muted-foreground">Start Date</label><p className="font-medium">{formData.startDate || 'Not specified'}</p></div>
                <div><label className="text-sm font-medium text-muted-foreground">Venue</label><p className="font-medium">{venues.find(v => v.id.toString() === formData.venueId)?.name || 'Not specified'}</p></div>
              </div>
              {formData.description && (<div><label className="text-sm font-medium text-muted-foreground">Description</label><p className="font-medium">{formData.description}</p></div>)}
              {imagePreview && (<div><label className="text-sm font-medium text-muted-foreground">Image</label><img src={imagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-lg border mt-2" /></div>)}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <div className="w-full max-w-2xl mx-auto">
        <motion.div variants={{hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.05 }}}} initial="hidden" animate="visible" className="bg-card rounded-2xl border p-8 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20 dark:hover:border-primary/30" style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2 flex items-center justify-center" style={{ color: '#fff' }}><Plus className="h-6 w-6 mr-3 text-primary" />Create New Event</h3>
            <p className="text-muted-foreground" style={{ color: '#ABA8A9' }}>Step {currentStep} of {totalSteps}</p>
          </div>
          {renderStepIndicator()}
          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
          {error && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-center mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</motion.div>)}
          <div className="flex items-center justify-between mt-8">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="px-6 py-2 hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200"><ArrowLeft className="h-4 w-4 mr-2" />Previous</Button>
            {currentStep < totalSteps ? (
              <Button onClick={nextStep} className="px-6 py-2 hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 hover:scale-105 transition-all duration-300">Next<ArrowRight className="h-4 w-4 ml-2" /></Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="px-6 py-2 hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 hover:scale-105 transition-all duration-300">{submitting ? (<><div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white"></div>Creating...</>) : (<><Check className="h-4 w-4 mr-2" />Create Event</>)}</Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
