"use client"

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Calendar,
  ArrowLeft,
  Star,
  Share2,
  Heart,
  Clock,
  Ticket,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  Eye
} from 'lucide-react';
import { mockVenues, mockEvents } from '@/lib/mock-data';
import { fetchVenueById } from '@/lib/api';

// Venue Image Gallery Component
const VenueImageGallery = ({ venue }: { venue: any }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get images array or fallback to single image
  const images = venue.images && Array.isArray(venue.images) && venue.images.length > 0 
    ? venue.images 
    : venue.featuredImage 
      ? [venue.featuredImage]
      : venue.image 
        ? [venue.image] 
        : [];

  const currentImage = images[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    setImageLoaded(false);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setImageLoaded(false);
  };

  return (
    <div className="mb-6">
      {/* Main Image */}
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
        {currentImage && !imageError ? (
          <>
            <img 
              src={currentImage} 
              alt={`${venue.name} - Image ${currentImageIndex + 1}`}
              className={`w-full h-full object-cover rounded-lg transition-opacity duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            
            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  →
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}

            {/* Loading overlay */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                <div className="animate-pulse">
                  <MapPin className="h-20 w-20 text-primary/50" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-primary">
            <MapPin className="h-20 w-20 mb-4" />
            <p className="text-sm text-muted-foreground">
              {imageError ? 'Image unavailable' : 'No images available'}
            </p>
          </div>
        )}
      </div>

      {/* Image Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image: string, index: number) => (
            <button
              key={index}
              onClick={() => {
                setCurrentImageIndex(index);
                setImageLoaded(false);
                setImageError(false);
              }}
              className={`flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition-all ${
                index === currentImageIndex 
                  ? 'border-primary shadow-lg' 
                  : 'border-transparent hover:border-primary/50'
              }`}
            >
              <img
                src={image}
                alt={`${venue.name} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Seating Map Component
const VenueSeatingMap = ({ venue }: { venue: any }) => {
  const [selectedSeat, setSelectedSeat] = useState<{row: number, col: number} | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'sections'>('grid');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Parse seat map data from database
  const seatMapData = venue.seatMap || { rows: 10, cols: 5 }; // Default fallback

  // Generate individual seats based on row/col data
  const generateSeatGrid = () => {
    const seats = [];
    const totalRows = seatMapData.rows || seatMapData.row || 10;
    const totalCols = seatMapData.cols || seatMapData.col || 5;
    
    for (let row = 1; row <= totalRows; row++) {
      const seatRow = [];
      for (let col = 1; col <= totalCols; col++) {
        // Generate seat status (available, occupied, selected, vip)
        const seatStatus = getSeatStatus(row, col, totalRows, totalCols);
        seatRow.push({
          row,
          col,
          id: `${String.fromCharCode(64 + row)}-${col}`, // A-1, B-2, etc.
          status: seatStatus.status,
          price: seatStatus.price,
          section: seatStatus.section
        });
      }
      seats.push(seatRow);
    }
    return seats;
  };

  // Determine seat status and pricing based on position
  const getSeatStatus = (row: number, col: number, totalRows: number, totalCols: number) => {
    const frontRows = Math.ceil(totalRows * 0.3);
    const middleRows = Math.ceil(totalRows * 0.5);
    const centerCols = Math.ceil(totalCols * 0.6);
    const isCenter = col > Math.floor(totalCols * 0.2) && col <= Math.ceil(totalCols * 0.8);
    
    // VIP/Premium seats (front center)
    if (row <= frontRows && isCenter) {
      return {
        status: Math.random() > 0.7 ? 'occupied' : 'available',
        price: 150,
        section: 'VIP'
      };
    }
    // Premium seats (middle center)
    else if (row <= middleRows && isCenter) {
      return {
        status: Math.random() > 0.6 ? 'occupied' : 'available',
        price: 100,
        section: 'Premium'
      };
    }
    // Standard seats
    else {
      return {
        status: Math.random() > 0.5 ? 'occupied' : 'available',
        price: 50,
        section: 'Standard'
      };
    }
  };

  const seatGrid = generateSeatGrid();

  // Seat component
  const SeatComponent = ({ seat }: { seat: any }) => {
    const isSelected = selectedSeat?.row === seat.row && selectedSeat?.col === seat.col;
    
    const getSeatColor = () => {
      if (isSelected) return 'bg-primary ring-2 ring-primary ring-offset-2';
      switch (seat.status) {
        case 'available':
          if (seat.section === 'VIP') return 'bg-purple-500 hover:bg-purple-600';
          if (seat.section === 'Premium') return 'bg-blue-500 hover:bg-blue-600';
          return 'bg-green-500 hover:bg-green-600';
        case 'occupied':
          return 'bg-red-400 cursor-not-allowed';
        default:
          return 'bg-gray-400';
      }
    };

    return (
      <div
        className={`
          w-6 h-6 m-0.5 rounded-sm cursor-pointer transition-all duration-200 flex items-center justify-center text-xs text-white font-bold
          ${getSeatColor()}
          ${seat.status === 'occupied' ? 'opacity-50' : 'hover:scale-110 shadow-sm'}
        `}
        onClick={() => {
          if (seat.status === 'available') {
            setSelectedSeat(isSelected ? null : { row: seat.row, col: seat.col });
          }
        }}
        title={`${seat.id} - ${seat.section} - $${seat.price} - ${seat.status}`}
        style={{ transform: `scale(${Math.min(zoomLevel, 1.5)})` }}
      >
        {seat.col}
      </div>
    );
  };

  // Row label component
  const RowLabel = ({ rowNumber }: { rowNumber: number }) => (
    <div className="w-8 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">
      {String.fromCharCode(64 + rowNumber)}
    </div>
  );

  const Stage = () => (
    <div className="bg-gradient-to-r from-gray-800 to-gray-600 rounded-lg p-4 text-center text-white shadow-lg mb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 animate-pulse"></div>
      <div className="relative z-10">
        <div className="text-xl font-bold mb-2">🎭 STAGE / PERFORMANCE AREA</div>
        <div className="text-sm opacity-80">
          {seatMapData.rows || seatMapData.row} rows × {seatMapData.cols || seatMapData.col} seats per row
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Seat Grid
          </Button>
          <Button
            variant={viewMode === 'sections' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('sections')}
          >
            Sections
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
            disabled={zoomLevel >= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setZoomLevel(1);
              setSelectedSeat(null);
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Venue Layout */}
      <div className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Stage */}
          <Stage />
          
          {viewMode === 'grid' ? (
            /* Seat Grid View */
            <div className="space-y-4">
              {/* Column numbers header */}
              <div className="flex justify-center">
                <div className="flex">
                  <div className="w-8"></div> {/* Space for row labels */}
                  {Array.from({ length: seatMapData.cols || seatMapData.col || 5 }, (_, i) => (
                    <div key={i} className="w-8 h-6 flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Seat Grid */}
              <div className="flex flex-col items-center space-y-1">
                {seatGrid.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center">
                    <RowLabel rowNumber={rowIndex + 1} />
                    <div className="flex">
                      {row.map((seat, seatIndex) => (
                        <SeatComponent key={`${rowIndex}-${seatIndex}`} seat={seat} />
                      ))}
                    </div>
                    <RowLabel rowNumber={rowIndex + 1} />
                  </div>
                ))}
              </div>
              
              {/* Aisle indicators */}
              <div className="flex justify-center mt-6">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                    <span>Occupied</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                    <span>Premium</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                    <span>VIP</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-sm"></div>
                    <span>Selected</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Section View - Fallback for backward compatibility */
            <div className="text-center py-8">
              <Button 
                onClick={() => setViewMode('grid')} 
                className="bg-primary hover:bg-primary/90"
              >
                View Detailed Seat Grid
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Selected Seat Details */}
      {selectedSeat && (
        <div className="bg-card rounded-lg border p-6 animate-fadeInScale">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">Selected Seat Details</h4>
            <Button variant="ghost" size="sm" onClick={() => setSelectedSeat(null)}>
              ×
            </Button>
          </div>
          
          {(() => {
            const seat = seatGrid[selectedSeat.row - 1][selectedSeat.col - 1];
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Seat:</span>
                    <p className="text-muted-foreground">{seat.id}</p>
                  </div>
                  <div>
                    <span className="font-medium">Section:</span>
                    <p className="text-muted-foreground">{seat.section}</p>
                  </div>
                  <div>
                    <span className="font-medium">Price:</span>
                    <p className="text-muted-foreground">${seat.price}</p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <p className={`capitalize ${seat.status === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                      {seat.status}
                    </p>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <span className="font-medium text-sm">View Quality:</span>
                  <div className="flex items-center space-x-1 mt-1">
                    {Array(5).fill(null).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${
                          seat.section === 'VIP' ? (i < 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300') :
                          seat.section === 'Premium' ? (i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300') :
                          (i < 3 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Layout Information */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h5 className="font-medium mb-3 flex items-center">
          <Info className="h-4 w-4 mr-2" />
          Venue Layout Information
        </h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-primary" />
            <span>Total Capacity: {venue.capacity?.toLocaleString() || ((seatMapData.rows || seatMapData.row || 10) * (seatMapData.cols || seatMapData.col || 5)).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-primary" />
            <span>Rows: {seatMapData.rows || seatMapData.row || 10}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ZoomIn className="h-4 w-4 text-primary" />
            <span>Seats per Row: {seatMapData.cols || seatMapData.col || 5}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>Click seats for details</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface VenueDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VenueDetailPage({ params }: VenueDetailPageProps) {
  const resolvedParams = use(params);
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchVenueById(resolvedParams.id)
      .then(data => {
        console.log(resolvedParams.id)//debugging
        setVenue(data.data);
        console.log(data)//debugging
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching venue", err);
        // Fallback to mock data if API fails
        const mockVenue = mockVenues.find(v => v.id === resolvedParams.id);
        setVenue(mockVenue);
        setLoading(false);
      });
  }, [resolvedParams.id]);

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
          <h1 className="text-2xl font-bold mb-4">Venue Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The venue you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/venues">
            <Button>Browse Venues</Button>
          </Link>
        </div>
      </div>
    );
  }

  const upcomingEvents = mockEvents.filter(event => event.venueId === resolvedParams.id);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: `Events (${upcomingEvents.length})` },
    { id: 'amenities', label: 'Amenities' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/venues" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Venues
        </Link>

        {/* Venue Hero */}
        <div className="mb-8">
          <VenueImageGallery venue={venue} />

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {venue.name}
              </h1>
              <div className="flex items-center text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {venue.location}  
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {venue.capacity.toLocaleString()} capacity
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  4.7 (89 reviews)
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">About This Venue </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {venue.description}
                  </p>
                </div>

                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Venue Layout & Seating</h3>
                  <VenueSeatingMap venue={venue} />
                </div>

                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Getting Here</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">By Car</h4>
                      <p className="text-muted-foreground">
                        Multiple parking options available nearby. Street parking and paid lots within walking distance.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">By Public Transit</h4>
                      <p className="text-muted-foreground">
                        Accessible via subway and bus lines. Check local transit schedules for event times.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map((event: any) => (
                        <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-2">{event.title}</h4>
                              <p className="text-muted-foreground text-sm mb-2">
                                {event.description}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(event.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {event.time}
                                </div>
                                <div className="flex items-center">
                                  <Ticket className="h-4 w-4 mr-1" />
                                  ${event.price}
                                </div>
                              </div>
                            </div>
                            <Link href={`/events/${event.id}`}>
                              <Button size="sm">View Event</Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No upcoming events</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'amenities' && (
              <div className="space-y-6">
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Venue Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {venue.amenities?.map((amenity: string) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Accessibility</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Wheelchair accessible entrances</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Accessible restrooms</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Reserved accessible seating</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Hearing loop system</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    {venue.contact?.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-muted-foreground">{venue.contact.phone}</p>
                        </div>
                      </div>
                    )}
                    {venue.contact?.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-muted-foreground">{venue.contact.email}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground">
                          {venue.address}<br />
                          {venue.city}, {venue.state} {venue.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Send a Message</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Message</label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="Your message..."
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Venue
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full">
                  <MapPin className="mr-2 h-4 w-4" />
                  Get Directions
                </Button>
              </div>

              {upcomingEvents.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Next Event</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <h5 className="font-medium text-sm">{upcomingEvents[0].title}</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(upcomingEvents[0].date).toLocaleDateString()} at {upcomingEvents[0].time}
                    </p>
                    <Link href={`/events/${upcomingEvents[0].id}`}>
                      <Button size="sm" className="w-full mt-2">
                        View Event
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
