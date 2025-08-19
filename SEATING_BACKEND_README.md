# Seating Arrangement Backend Implementation Guide

## Overview
This document outlines the backend requirements for implementing the customizable seating arrangement system for the NexTicket venue management platform.

## Database Schema Updates

### Updated Tables

#### 1. seating_arrangements (Updated)
```sql
CREATE TABLE seating_arrangements (
  id SERIAL PRIMARY KEY,
  venue_id INT NOT NULL,
  tenant_id INT NOT NULL,
  floor_label VARCHAR(10) NOT NULL, -- e.g. "F1", "Balcony"
  canvas_width INT DEFAULT 800,
  canvas_height INT DEFAULT 600,
  design_data JSONB,  -- Stores the complete Konva canvas design
  total_vip INT DEFAULT 0,
  total_regular INT DEFAULT 0,
  total_deactivated INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (venue_id, tenant_id, floor_label)
);
```

#### 2. seating_areas (New)
```sql
CREATE TABLE seating_areas (
  id SERIAL PRIMARY KEY,
  arrangement_id INT REFERENCES seating_arrangements(id) ON DELETE CASCADE,
  area_code VARCHAR(50) NOT NULL, -- e.g. "Area1", "VIP-Section"
  name VARCHAR(100) NOT NULL,
  x_position DECIMAL(10,2) NOT NULL,
  y_position DECIMAL(10,2) NOT NULL,
  width DECIMAL(10,2) NOT NULL,
  height DECIMAL(10,2) NOT NULL,
  rows INT NOT NULL,
  columns INT NOT NULL,
  seat_price DECIMAL(10,2) NOT NULL,
  seat_type seat_type NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
  rotation DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (arrangement_id, area_code)
);
```

#### 3. stages (New)
```sql
CREATE TABLE stages (
  id SERIAL PRIMARY KEY,
  arrangement_id INT REFERENCES seating_arrangements(id) ON DELETE CASCADE,
  stage_code VARCHAR(50) NOT NULL,
  x_position DECIMAL(10,2) NOT NULL,
  y_position DECIMAL(10,2) NOT NULL,
  width DECIMAL(10,2) NOT NULL,
  height DECIMAL(10,2) NOT NULL,
  color VARCHAR(7) DEFAULT '#FFD700',
  rotation DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (arrangement_id, stage_code)
);
```

#### 4. seats (Updated)
```sql
CREATE TYPE seat_status AS ENUM ('active', 'inactive');
CREATE TYPE seat_type AS ENUM ('vip', 'regular', 'deactivated');

CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  arrangement_id INT REFERENCES seating_arrangements(id) ON DELETE CASCADE,
  area_id INT REFERENCES seating_areas(id) ON DELETE CASCADE,
  seat_code VARCHAR(50) NOT NULL,   -- e.g. "F1-Area1-R5-C10"
  row_no INT NOT NULL,
  col_no INT NOT NULL,
  x_position DECIMAL(10,2) NOT NULL, -- Actual canvas position
  y_position DECIMAL(10,2) NOT NULL, -- Actual canvas position
  status seat_status DEFAULT 'active',
  seat_type seat_type NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (arrangement_id, seat_code),
  INDEX idx_seats_area (area_id),
  INDEX idx_seats_position (x_position, y_position)
);
```

## API Endpoints Required

### 1. Seating Arrangement Management

#### POST /api/venues/{venue_id}/seating-arrangements
Create a new seating arrangement
```json
{
  "floor_label": "F1",
  "canvas_width": 800,
  "canvas_height": 600,
  "design_data": {
    "stages": [
      {
        "id": "stage-1",
        "x": 350,
        "y": 50,
        "width": 100,
        "height": 40,
        "color": "#FFD700"
      }
    ],
    "seating_areas": [
      {
        "id": "area-1",
        "name": "VIP Section",
        "x": 100,
        "y": 150,
        "width": 200,
        "height": 120,
        "rows": 6,
        "columns": 10,
        "seat_price": 150.00,
        "seat_type": "vip",
        "color": "#FFD700"
      }
    ]
  }
}
```

#### GET /api/venues/{venue_id}/seating-arrangements
Get all seating arrangements for a venue

#### PUT /api/venues/{venue_id}/seating-arrangements/{arrangement_id}
Update an existing seating arrangement

#### DELETE /api/venues/{venue_id}/seating-arrangements/{arrangement_id}
Delete a seating arrangement and all associated seats

### 2. Seat Management

#### GET /api/seating-arrangements/{arrangement_id}/seats
Get all seats for a specific arrangement
```json
{
  "arrangement_id": 1,
  "floor_label": "F1",
  "total_seats": 240,
  "seats": [
    {
      "id": 1,
      "seat_code": "F1-VIP-R1-C1",
      "area_name": "VIP Section",
      "row": 1,
      "column": 1,
      "x_position": 105.5,
      "y_position": 160.5,
      "price": 150.00,
      "seat_type": "vip",
      "status": "active",
      "is_available": true
    }
  ]
}
```

#### PATCH /api/seats/{seat_id}/status
Update seat status (for maintenance, blocking, etc.)
```json
{
  "status": "inactive",
  "reason": "Maintenance required"
}
```

#### POST /api/seats/bulk-update
Bulk update multiple seats
```json
{
  "seat_ids": [1, 2, 3, 4, 5],
  "updates": {
    "price": 175.00,
    "seat_type": "vip"
  }
}
```

### 3. Booking Integration

#### GET /api/seating-arrangements/{arrangement_id}/availability
Get seat availability for booking
```json
{
  "event_id": 123,
  "arrangement_id": 1,
  "availability": [
    {
      "seat_id": 1,
      "seat_code": "F1-VIP-R1-C1",
      "is_available": true,
      "is_reserved": false,
      "reserved_until": null
    }
  ]
}
```

#### POST /api/bookings/reserve-seats
Reserve seats for booking
```json
{
  "event_id": 123,
  "seat_ids": [1, 2, 3],
  "customer_id": 456,
  "reservation_duration": 900 // seconds
}
```

## Data Processing Logic

### 1. Seat Generation Algorithm
When a seating arrangement is saved:

1. **Parse the design_data** from the frontend
2. **For each seating area**:
   - Calculate individual seat positions based on area dimensions and row/column count
   - Generate unique seat codes: `{floor_label}-{area_name}-R{row}-C{column}`
   - Create seat records with calculated positions
3. **Store canvas layout** in `design_data` JSONB field for frontend reconstruction

### 2. Seat ID Generation
```
Seat ID Format: {area_id}&{row_id}&{column_id}
Example: area123&row5&col10

Seat Code Format: {floor_label}-{area_name}-R{row}-C{column}
Example: F1-VIP-R5-C10
```

### 3. Price Calculation
- Base price is set per seating area
- Seat-level price overrides are possible
- Dynamic pricing can be applied at the event level

## Frontend Data Structure

### SeatingDesign Interface
```typescript
interface SeatingDesign {
  canvasWidth: number;
  canvasHeight: number;
  stages: Stage[];
  seatingAreas: SeatingArea[];
  floorLabel: string;
}

interface Stage {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  color: string;
}

interface SeatingArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rows: number;
  columns: number;
  seatPrice: number;
  seatType: 'regular' | 'vip' | 'deactivated';
  color: string;
  rotation?: number;
}
```

## Implementation Checklist

### Backend Tasks
- [ ] Create/update database tables with new schema
- [ ] Implement seating arrangement CRUD endpoints
- [ ] Add seat generation logic
- [ ] Create seat availability checking system
- [ ] Implement booking integration
- [ ] Add seat status management
- [ ] Create bulk operations for seat updates
- [ ] Add data validation for canvas coordinates
- [ ] Implement seat searching/filtering
- [ ] Add analytics for seat utilization

### Frontend Integration
- [ ] Seat selection interface for customers
- [ ] Real-time availability updates
- [ ] Price display integration
- [ ] Accessibility features for disabled seats
- [ ] Mobile-responsive seat selection
- [ ] Zoom and pan functionality for large venues

### Business Logic
- [ ] Seat pricing rules engine
- [ ] Reservation timeout handling
- [ ] Conflict resolution for simultaneous bookings
- [ ] Venue capacity validation
- [ ] Revenue optimization algorithms

## Security Considerations

1. **Authorization**: Only venue owners can modify seating arrangements
2. **Data Validation**: Validate all coordinate and dimension data
3. **Concurrency**: Handle simultaneous seat bookings with proper locking
4. **Audit Trail**: Track all changes to seating arrangements and seat statuses

## Performance Optimization

1. **Database Indexing**: 
   - Index on (venue_id, floor_label)
   - Index on (arrangement_id, seat_code)
   - Spatial index on (x_position, y_position) for seat lookup

2. **Caching Strategy**:
   - Cache seating arrangements per venue
   - Cache seat availability per event
   - Use Redis for real-time seat reservations

3. **API Optimization**:
   - Paginate large seat datasets
   - Use projection to return only needed fields
   - Implement efficient bulk operations

## Testing Requirements

1. **Unit Tests**: Test seat generation algorithms
2. **Integration Tests**: Test booking flow with seating
3. **Load Tests**: Test concurrent seat booking scenarios
4. **UI Tests**: Test drag-and-drop functionality

## Migration Strategy

1. **Phase 1**: Deploy new database schema
2. **Phase 2**: Migrate existing venues to new format
3. **Phase 3**: Enable new designer for venue owners
4. **Phase 4**: Update customer booking interface

This implementation will provide a fully customizable seating arrangement system that allows venue owners to create complex layouts while maintaining efficient booking and management capabilities.
