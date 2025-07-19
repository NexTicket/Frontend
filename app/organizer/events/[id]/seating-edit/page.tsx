"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Save,
  Plus,
  Minus,
  RotateCcw,
  Grid3X3,
  Settings
} from 'lucide-react';
import { mockEvents } from '@/lib/mock-data';

interface SeatingEditPageProps {
  params: {
    id: string;
  };
}

interface SeatConfig {
  id: string;
  row: string;
  number: number;
  section: string;
  type: 'regular' | 'vip' | 'box';
  price: number;
  x: number;
  y: number;
}

export default function SeatingEditPage({ params }: SeatingEditPageProps) {
  const event = mockEvents.find(e => e.id === params.id);
  
  const [sections, setSections] = useState([
    { name: 'Main Floor', rows: 10, seatsPerRow: 20, type: 'regular' as const, price: 75 },
    { name: 'VIP Section', rows: 5, seatsPerRow: 15, type: 'vip' as const, price: 150 },
    { name: 'Box Seats', rows: 3, seatsPerRow: 8, type: 'box' as const, price: 300 }
  ]);

  const [newSection, setNewSection] = useState({
    name: '',
    rows: 1,
    seatsPerRow: 1,
    type: 'regular' as const,
    price: 50
  });

  const [showAddSection, setShowAddSection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <Link href="/organizer/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const generateSeats = () => {
    const seats: SeatConfig[] = [];
    let seatId = 1;

    sections.forEach((section, sectionIndex) => {
      for (let row = 1; row <= section.rows; row++) {
        for (let seat = 1; seat <= section.seatsPerRow; seat++) {
          seats.push({
            id: `seat-${seatId++}`,
            row: String.fromCharCode(64 + row), // A, B, C, etc.
            number: seat,
            section: section.name,
            type: section.type,
            price: section.price,
            x: seat,
            y: row + (sectionIndex * (section.rows + 2)) // Add spacing between sections
          });
        }
      }
    });

    return seats;
  };

  const seats = generateSeats();
  const totalSeats = seats.length;

  const updateSection = (index: number, field: string, value: any) => {
    setSections(prev => prev.map((section, i) => 
      i === index ? { ...section, [field]: value } : section
    ));
  };

  const removeSection = (index: number) => {
    setSections(prev => prev.filter((_, i) => i !== index));
  };

  const addSection = () => {
    if (newSection.name.trim()) {
      setSections(prev => [...prev, { ...newSection }]);
      setNewSection({
        name: '',
        rows: 1,
        seatsPerRow: 1,
        type: 'regular',
        price: 50
      });
      setShowAddSection(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Here you would typically send the seating configuration to your backend
    setTimeout(() => {
      setIsSaving(false);
      alert('Seating arrangement saved successfully!');
    }, 1000);
  };

  const getSeatColor = (type: string) => {
    switch (type) {
      case 'vip': return 'bg-yellow-500';
      case 'box': return 'bg-purple-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href={`/organizer/events/${params.id}/edit`} className="inline-flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event Edit
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Edit Seating Arrangement</h1>
              <p className="text-muted-foreground">{event.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Layout'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Layout Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Sections:</span>
                  <span className="font-medium">{sections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Seats:</span>
                  <span className="font-medium">{totalSeats}</span>
                </div>
                <div className="flex justify-between">
                  <span>Regular Seats:</span>
                  <span className="font-medium">
                    {seats.filter(s => s.type === 'regular').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VIP Seats:</span>
                  <span className="font-medium">
                    {seats.filter(s => s.type === 'vip').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Box Seats:</span>
                  <span className="font-medium">
                    {seats.filter(s => s.type === 'box').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Section Configuration */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Sections</h3>
                <Button 
                  size="sm" 
                  onClick={() => setShowAddSection(true)}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={section.name}
                        onChange={(e) => updateSection(index, 'name', e.target.value)}
                        className="font-medium bg-transparent border-none p-0 focus:outline-none focus:ring-1 focus:ring-primary rounded"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSection(index)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Rows</label>
                        <input
                          type="number"
                          value={section.rows}
                          onChange={(e) => updateSection(index, 'rows', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 border rounded text-xs"
                          min="1"
                          max="26"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Seats/Row</label>
                        <input
                          type="number"
                          value={section.seatsPerRow}
                          onChange={(e) => updateSection(index, 'seatsPerRow', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 border rounded text-xs"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Type</label>
                        <select
                          value={section.type}
                          onChange={(e) => updateSection(index, 'type', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-xs"
                        >
                          <option value="regular">Regular</option>
                          <option value="vip">VIP</option>
                          <option value="box">Box</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Price</label>
                        <input
                          type="number"
                          value={section.price}
                          onChange={(e) => updateSection(index, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border rounded text-xs"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Section Form */}
              {showAddSection && (
                <div className="border rounded-lg p-4 mt-4 bg-muted/50">
                  <h4 className="font-medium mb-3">Add New Section</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Section name"
                      value={newSection.name}
                      onChange={(e) => setNewSection(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Rows"
                        value={newSection.rows}
                        onChange={(e) => setNewSection(prev => ({ ...prev, rows: parseInt(e.target.value) || 1 }))}
                        className="px-2 py-1 border rounded text-sm"
                        min="1"
                      />
                      <input
                        type="number"
                        placeholder="Seats per row"
                        value={newSection.seatsPerRow}
                        onChange={(e) => setNewSection(prev => ({ ...prev, seatsPerRow: parseInt(e.target.value) || 1 }))}
                        className="px-2 py-1 border rounded text-sm"
                        min="1"
                      />
                      <select
                        value={newSection.type}
                        onChange={(e) => setNewSection(prev => ({ ...prev, type: e.target.value as any }))}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="regular">Regular</option>
                        <option value="vip">VIP</option>
                        <option value="box">Box</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Price"
                        value={newSection.price}
                        onChange={(e) => setNewSection(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className="px-2 py-1 border rounded text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={addSection}>Add Section</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddSection(false)}>Cancel</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seating Layout Preview */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Seating Layout Preview</h3>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Grid3X3 className="h-4 w-4 mr-1" />
                    Grid View
                  </Button>
                </div>
              </div>

              {/* Stage */}
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-4 mb-8 text-center">
                <h3 className="text-lg font-semibold text-primary">STAGE</h3>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Regular</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">VIP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm">Box</span>
                </div>
              </div>

              {/* Seating Layout */}
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border rounded-lg p-4">
                    <h4 className="text-center font-medium mb-4">{section.name}</h4>
                    <div className="space-y-1">
                      {Array.from({ length: section.rows }, (_, rowIndex) => (
                        <div key={rowIndex} className="flex items-center justify-center space-x-1">
                          <span className="text-xs text-muted-foreground w-6 text-center">
                            {String.fromCharCode(65 + rowIndex)}
                          </span>
                          {Array.from({ length: section.seatsPerRow }, (_, seatIndex) => (
                            <div
                              key={seatIndex}
                              className={`${getSeatColor(section.type)} ${
                                section.type === 'box' ? 'w-8 h-6' : 'w-6 h-6'
                              } rounded text-xs text-white flex items-center justify-center font-medium`}
                              title={`${section.name} ${String.fromCharCode(65 + rowIndex)}${seatIndex + 1} - $${section.price}`}
                            >
                              {seatIndex + 1}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {sections.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sections configured yet</p>
                  <p className="text-sm">Add a section to start designing your layout</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
