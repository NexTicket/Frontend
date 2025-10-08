"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (location: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
  initialLocation?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  apiKey: string;
  className?: string;
}

const MapComponent: React.FC<{
  center: google.maps.LatLngLiteral;
  zoom: number;
  onMapClick: (location: google.maps.LatLngLiteral) => void;
  marker?: google.maps.LatLngLiteral;
}> = ({ center, zoom, onMapClick, marker }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    if (ref.current && !map) {
      console.log('Creating new map with center:', center, 'zoom:', zoom);
      const newMap = new google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const latLng = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };
          onMapClick(latLng);
        }
      });

      setMap(newMap);
    }
  }, [ref, map, center, zoom, onMapClick]);

  // Update map center when center prop changes
  useEffect(() => {
    if (map && center) {
      console.log('Updating map center to:', center);
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  useEffect(() => {
    if (map && marker) {
      // Clear existing markers
      const markers = map.data.getFeatureById('selected-marker');
      if (markers) {
        map.data.remove(markers);
      }

      // Add new marker
      const markerFeature = new google.maps.Data.Feature({
        id: 'selected-marker',
        geometry: new google.maps.Data.Point(marker),
      });

      map.data.add(markerFeature);

      // Style the marker
      map.data.setStyle({
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
    }
  }, [map, marker]);

  return <div ref={ref} className="w-full h-64 rounded-lg" />;
};

const LocationPickerInner: React.FC<Omit<LocationPickerProps, 'apiKey'>> = ({
  onLocationSelect,
  initialLocation,
  className = '',
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(initialLocation || null);

  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(
    initialLocation
      ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
      : { lat: 40.7128, lng: -74.0060 } // Default to NYC
  );

  const [mapZoom, setMapZoom] = useState(15); // Default zoom level

  const [marker, setMarker] = useState<google.maps.LatLngLiteral | undefined>(
    initialLocation
      ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
      : undefined
  );

  useEffect(() => {
    if (inputRef.current && !autocompleteRef.current && google?.maps?.places) {
      console.log('Creating Autocomplete');
      // Create the traditional Autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        fields: ['place_id', 'geometry', 'formatted_address', 'name']
      });

      // Add event listener for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        console.log('Place changed:', place);
        if (place?.geometry?.location) {
          console.log('Place location:', place.geometry.location);
          const location = {
            address: place.formatted_address || place.name || '',
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          };

          console.log('Setting location:', location);
          setSelectedLocation(location);
          setMapCenter({ lat: location.latitude, lng: location.longitude });
          setMapZoom(17); // Zoom in closer when a place is selected from search
          setMarker({ lat: location.latitude, lng: location.longitude });
          onLocationSelect(location);
        } else {
          console.log('No location in place:', place);
        }
      });
      console.log('Autocomplete created');
    }
  }, [onLocationSelect]);

  const handleMapClick = useCallback(async (latLng: google.maps.LatLngLiteral) => {
    console.log('Map clicked at:', latLng);
    setIsSearching(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: latLng });

      if (response.results[0]) {
        const location = {
          address: response.results[0].formatted_address,
          latitude: latLng.lat,
          longitude: latLng.lng,
        };

        console.log('Map click location:', location);
        setSelectedLocation(location);
        setMarker(latLng);
        setMapCenter(latLng);
        setMapZoom(17); // Zoom in when clicking on map
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [onLocationSelect]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Search for a location</label>
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter an address or place name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Map */}
      <div className="relative">
        <MapComponent
          center={mapCenter}
          zoom={mapZoom}
          onMapClick={handleMapClick}
          marker={marker}
        />
        {isSearching && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Selected Location</p>
              <p className="text-sm text-gray-600">{selectedLocation.address}</p>
              <p className="text-xs text-gray-500">
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Click on the map to select a location, or search for an address above.
      </p>
    </div>
  );
};

const LoadingComponent = () => (
  <div className="w-full h-64 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
      <p className="text-sm text-gray-500">Loading Google Maps...</p>
    </div>
  </div>
);

const ErrorComponent = () => (
  <div className="w-full h-64 rounded-lg border-2 border-red-300 bg-red-50 flex items-center justify-center">
    <div className="text-center">
      <MapPin className="h-8 w-8 text-red-500 mx-auto mb-2" />
      <p className="text-sm text-red-600">Failed to load Google Maps</p>
      <p className="text-xs text-red-500 mt-1">Please check your API key and try again</p>
    </div>
  </div>
);

export const LocationPicker: React.FC<LocationPickerProps> = (props) => {
  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <LoadingComponent />;
      case Status.FAILURE:
        return <ErrorComponent />;
      case Status.SUCCESS:
        return <LocationPickerInner {...props} />;
    }
  };

  return (
    <Wrapper
      apiKey={props.apiKey}
      libraries={['places']}
      render={render}
    />
  );
};
