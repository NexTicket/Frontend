"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createEvent, fetchVenues, uploadEventImage } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, Image as ImageIcon, X } from "lucide-react";

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
    seatMap?: unknown;
  };
  const [venues, setVenues] = useState<VenueCard[]>([]);
  const [seatMapData, setSeatMapData] = useState<Record<string, unknown> | null>(null);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSeatMapFor, setShowSeatMapFor] = useState<string | number | null>(null);
  const [eventAdminEmail, setEventAdminEmail] = useState("");
  const [checkInEmails, setCheckInEmails] = useState<string[]>([""]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadVenues() {
      setLoadingVenues(true);
      try {
        const res = await fetchVenues();
        const data: VenueCard[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
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

  const loadSeatMap = async (venueId: string | number) => {
    try {
      setSeatMapData(null);
      const base = (process.env.NEXT_PUBLIC_EVENT_VENUE_SERVICE_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const tryUrls = [
        `${base}${base.endsWith('/api') ? '' : '/api'}/venues/${venueId}/seats`,
        `${base}${base.endsWith('/api') ? '' : '/api'}/${venueId}/seats`
      ];
      for (const url of tryUrls) {
        const resp = await fetch(url);
        if (resp.ok) {
          const json = await resp.json();
          setSeatMapData(json?.data ?? json);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load seat map', e);
    }
  };

  const onChange = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const nextStep = () => {
    if (currentStep === 1) {
      const missing = !form.title.trim() || !form.category.trim() || !form.startDateDate.trim() || !form.startHour.trim() || !form.startMinute.trim();
      if (missing) {
        setError("Title, category, start date and start time are required.");
        return;
      }
      if (form.endDateDate && form.endHour && form.endMinute) {
        const s = new Date(`${form.startDateDate}T${form.startHour}:${form.startMinute}`).getTime();
        const e = new Date(`${form.endDateDate}T${form.endHour}:${form.endMinute}`).getTime();
        if (s > e) {
          setError("Start date/time must be before end date/time.");
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
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setForm(prev => ({ ...prev, poster: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const removePoster = () => setForm(prev => ({ ...prev, poster: "" }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category.trim() || !form.startDateDate.trim() || !form.startHour.trim() || !form.startMinute.trim()) {
      setError("Title, category, start date and start time are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const startTime = `${form.startHour.padStart(2,'0')}:${form.startMinute.padStart(2,'0')}`;
      const startDateIso = `${form.startDateDate}T${startTime}`;
      const endTime = form.endHour && form.endMinute ? `${form.endHour.padStart(2,'0')}:${form.endMinute.padStart(2,'0')}` : '';
      const endDateIso = form.endDateDate && endTime ? `${form.endDateDate}T${endTime}` : undefined;
      // Frontend validation: end must be after start when provided
      if (endDateIso && new Date(endDateIso).getTime() <= new Date(startDateIso).getTime()) {
        setError('End date/time must be after start date/time.');
        setSubmitting(false);
        return;
      }
      const created = await createEvent({
        title: form.title,
        description: form.description,
        category: form.category,
        type: 'EVENT',
        startDate: startDateIso,
        endDate: endDateIso,
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
      console.error(err);
      setError("Failed to create event.");
    } finally {
      setSubmitting(false);
    }
  };

  const StepBar = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center w-full">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                currentStep > i + 1
                  ? 'bg-green-500 text-white'
                  : currentStep === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#2a2d34] text-gray-400'
              }`}
            >
              {currentStep > i + 1 ? '✓' : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                  currentStep > i + 1 ? 'bg-green-500' : 'bg-[#2a2d34]'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center"><span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span></div>
    </div>
  );

  if (!mounted) return null;

  return (
    <div className="p-8 bg-gradient-to-br from-background via-muted/10 to-primary/5 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-2" style={{ color: '#fff' }}>Create New Event</h2>
        <p className="text-muted-foreground mb-6">Set up your event in a few guided steps</p>

        <StepBar />

        <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-8" style={{ borderColor: 'rgb(57 253 72 / 50%)' }}>
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white">Basic Information</h3>
              <div>
                <label className="block text-sm text-foreground mb-2">Title *</label>
                <input value={form.title} onChange={e => onChange("title", e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-2">Category *</label>
                <select value={form.category} onChange={e => onChange("category", e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
                  <option value="">Select category</option>
                  <option value="Concert">Concert</option>
                  <option value="Conference">Conference</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Sports">Sports</option>
                  <option value="Festival">Festival</option>
                  <option value="Theater">Theater</option>
                  <option value="Meetup">Meetup</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground mb-2">Start Date *</label>
                  <input type="date" value={form.startDateDate} onChange={e => onChange("startDateDate", e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-2">Start Time *</label>
                  <div className="flex gap-2">
                    <select value={form.startHour} onChange={e => onChange("startHour", e.target.value)} className="px-3 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-24">
                      <option value="">HH</option>
                      {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select value={form.startMinute} onChange={e => onChange("startMinute", e.target.value)} className="px-3 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-24">
                      <option value="">MM</option>
                      {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground mb-2">End Date (optional)</label>
                  <input type="date" value={form.endDateDate} onChange={e => onChange("endDateDate", e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-2">End Time (optional)</label>
                  <div className="flex gap-2">
                    <select value={form.endHour} onChange={e => onChange("endHour", e.target.value)} className="px-3 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-24">
                      <option value="">HH</option>
                      {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select value={form.endMinute} onChange={e => onChange("endMinute", e.target.value)} className="px-3 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-24">
                      <option value="">MM</option>
                      {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* soft warning when start > end */}
              {form.endDateDate && form.endHour && form.endMinute && form.startDateDate && form.startHour && form.startMinute && (
                (() => {
                  const s = new Date(`${form.startDateDate}T${form.startHour}:${form.startMinute}`).getTime();
                  const e = new Date(`${form.endDateDate}T${form.endHour}:${form.endMinute}`).getTime();
                  if (s > e) {
                    return <div className="text-red-400 text-sm">Warning: Start date/time is after End date/time.</div>;
                  }
                  return null;
                })()
              )}
              <div>
                <label className="block text-sm text-foreground mb-2">Description</label>
                <textarea value={form.description} onChange={e => onChange("description", e.target.value)} rows={4} className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white">Venue</h3>
              {/* Venue cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingVenues ? (
                  <div className="text-muted-foreground">Loading venues...</div>
                ) : (
                  venues.map((v: any) => {
                    const selected = String(form.venueId) === String(v.id);
                    const img = v.featuredImage || v.image || (Array.isArray(v.images) ? v.images[0] : '');
                    return (
                      <div key={v.id} className={`rounded-xl border p-4 cursor-pointer transition ${selected ? 'ring-2 ring-green-500' : ''}`} style={{ borderColor: 'rgb(57 253 72 / 40%)' }} onClick={() => onChange('venueId', String(v.id))}>
                        <div className="w-full h-32 overflow-hidden rounded-lg border border-border bg-background/50 mb-3 flex items-center justify-center">
                          {img ? <img src={img} alt="Venue" className="w-full h-full object-cover" /> : <div className="text-muted-foreground text-sm">No image</div>}
                        </div>
                        <div className="text-white font-semibold">{v.name}</div>
                        <div className="text-muted-foreground text-sm">{v.location || '—'}</div>
                        <div className="text-muted-foreground text-sm">Capacity: {v.capacity ?? '—'}</div>
                        <div className="mt-2">
                          <Button type="button" variant="outline" onClick={async (e) => { e.stopPropagation(); setShowSeatMapFor(v.id); await loadSeatMap(v.id); }}>View Seat Map</Button>
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
                    const v: any = venues.find((vv: any) => String(vv.id) === String(form.venueId));
                    const img = (v as any)?.featuredImage || (v as any)?.image || ((v as any)?.images?.[0] ?? '');
                    return (
                      <>
                        <div className="md:col-span-1">
                          <div className="w-full h-32 overflow-hidden rounded-lg border border-border bg-background/50 flex items-center justify-center">
                            {img ? <img src={img} alt="Venue" className="w-full h-full object-cover" /> : <div className="text-muted-foreground text-sm">No image</div>}
                          </div>
                        </div>
                        <div className="md:col-span-2 flex items-center">
                          <div>
                            <div className="text-white font-semibold text-lg">{(v as any)?.name}</div>
                            <div className="text-muted-foreground text-sm">{(v as any)?.location}</div>
                            <div className="text-muted-foreground text-sm">Capacity: {(v as any)?.capacity ?? '—'}</div>
                            <div className="text-muted-foreground text-sm">Seat map: {((v as any)?.seatMap ? 'Available' : '—')}</div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Seat Map Modal (basic) */}
              {showSeatMapFor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                  <div className="bg-card/90 backdrop-blur rounded-xl border p-6 max-w-3xl w-full" style={{ borderColor: 'rgb(57 253 72 / 40%)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-white font-semibold">Seat Map</div>
                      <Button type="button" variant="outline" onClick={() => setShowSeatMapFor(null)}>Close</Button>
                    </div>
                    <pre className="text-xs text-muted-foreground overflow-auto max-h-[50vh] bg-background/30 p-3 rounded-lg">{JSON.stringify(seatMapData ?? 'Loading...', null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white">Event Poster</h3>
              <div className="space-y-4">
                <label className="block text-sm text-foreground mb-2">Upload Poster</label>
                <div className="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 border-border hover:border-primary/50 bg-background/50">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <input type="file" accept="image/*" onChange={e => handlePosterChange(e.target.files)} className="hidden" id="poster-upload" />
                  <label htmlFor="poster-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" className="cursor-pointer">
                      Choose Image
                    </Button>
                  </label>
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

          {currentStep === 4 && (
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

          {currentStep === 5 && (
            <div className="space-y-6 text-white">
              <h3 className="text-2xl font-semibold">Review & Submit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">Title</div>
                  <div className="font-medium">{form.title || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Venue</div>
                  <div className="font-medium">{venues.find(v => v.id === form.venueId)?.name || 'Not selected'}</div>
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

          {error && <div className="text-red-400 mt-4">{error}</div>}

          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button onClick={nextStep} className="flex items-center bg-gradient-to-r from-primary to-purple-600">
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="flex items-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                {submitting ? 'Creating...' : 'Create Event'}
              </Button>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={() => router.push('/organizer/dashboard')}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

const NewEventPage = dynamic(() => Promise.resolve(NewEventPageInner), { ssr: false });
export default NewEventPage;
