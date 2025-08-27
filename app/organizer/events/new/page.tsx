"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createEvent, fetchVenues } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";

export default function NewEventPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  // mounted guard to avoid SSR/CSR markup mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    price: "",
    capacity: "",
    venueId: ""
  });
  const [venues, setVenues] = useState<any[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVenues() {
      setLoadingVenues(true);
      try {
        const res = await fetchVenues();
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setVenues(data);
        if (data.length > 0) setForm(prev => ({ ...prev, venueId: prev.venueId || data[0].id || "" }));
      } catch (err) {
        console.error("Failed loading venues", err);
      } finally {
        setLoadingVenues(false);
      }
    }
    loadVenues();
  }, []);

  const onChange = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const nextStep = () => {
    if (currentStep === 1) {
      if (!form.title.trim() || !form.date.trim()) {
        setError("Title and date are required.");
        return;
      }
    }
    setError(null);
    setCurrentStep(s => Math.min(totalSteps, s + 1));
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep(s => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.date.trim()) {
      setError("Title and date are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createEvent({
        title: form.title,
        description: form.description,
        date: form.date,
        price: Number(form.price || 0),
        capacity: Number(form.capacity || 0),
        venueId: form.venueId || undefined,
        organizerId: userProfile?.id
      } as any);
      router.push("/organizer/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to create event.");
    } finally {
      setSubmitting(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-4">
      {[...Array(totalSteps)].map((_, idx) => {
        const step = idx + 1;
        const active = step === currentStep;
        const done = step < currentStep;
        return (
          <div key={idx} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              done ? "bg-green-500 text-white" : active ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
            }`}>{done ? "✓" : step}</div>
            {idx < totalSteps - 1 && <div className={`w-8 h-0.5 mx-2 ${step < currentStep ? "bg-green-500" : "bg-gray-600"}`} />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4 text-white">Create Event</h2>

      <div className="rounded-lg border p-4" style={{ background: "#0F1113", borderColor: 'rgb(57 253 72 / 50%)' }}>
        <StepIndicator />

        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white mb-1">Title *</label>
              <input value={form.title} onChange={e => onChange("title", e.target.value)} className="w-full px-3 py-2 rounded bg-[#101214] text-white" />
            </div>
            <div>
              <label className="block text-sm text-white mb-1">Date & Time *</label>
              <input type="datetime-local" value={form.date} onChange={e => onChange("date", e.target.value)} className="w-full px-3 py-2 rounded bg-[#101214] text-white" />
            </div>
            <div>
              <label className="block text-sm text-white mb-1">Description</label>
              <textarea value={form.description} onChange={e => onChange("description", e.target.value)} className="w-full px-3 py-2 rounded bg-[#101214] text-white" rows={4} />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white mb-1">Price</label>
                <input type="number" value={form.price} onChange={e => onChange("price", e.target.value)} className="w-full px-3 py-2 rounded bg-[#101214] text-white" />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">Capacity</label>
                <input type="number" value={form.capacity} onChange={e => onChange("capacity", e.target.value)} className="w-full px-3 py-2 rounded bg-[#101214] text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white mb-1">Venue (optional)</label>
              <select value={form.venueId} onChange={e => onChange("venueId", e.target.value)} className="w-full px-3 py-2 rounded bg-[#101214] text-white">
                <option value="">Select a venue (optional)</option>
                {loadingVenues ? <option>Loading...</option> : venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 text-white">
            <div><strong>Title:</strong> {form.title}</div>
            <div><strong>Date:</strong> {form.date}</div>
            <div><strong>Description:</strong> {form.description}</div>
            <div><strong>Price:</strong> {form.price || "0"}</div>
            <div><strong>Capacity:</strong> {form.capacity || "0"}</div>
            <div><strong>Venue:</strong> {venues.find(v => v.id === form.venueId)?.name || "Not selected"}</div>
            <p className="text-sm">If everything looks good click Create Event.</p>
          </div>
        )}

        {error && <div className="text-red-400 mt-4">{error}</div>}

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>Back</Button>
            {currentStep < totalSteps ? <Button onClick={nextStep}>Next</Button> : <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Creating..." : "Create Event"}</Button>}
          </div>
          <div>
            <Button variant="ghost" onClick={() => router.push("/organizer/dashboard")}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
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
            <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
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
