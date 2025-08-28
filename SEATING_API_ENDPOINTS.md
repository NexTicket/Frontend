# Backend API Endpoints for Seating Arrangements

This document outlines the Express.js backend API endpoints needed to support the seating arrangement functionality.

## Database Tables (for reference)

```sql
CREATE TABLE seating_arrangements (
  id SERIAL PRIMARY KEY,
  venue_id INT NOT NULL,
  tenant_id INT NOT NULL,
  floor_label VARCHAR(10) NOT NULL,
  rows INT NOT NULL,
  cols INT NOT NULL,
  total_vip INT DEFAULT 0,
  total_regular INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (venue_id, tenant_id, floor_label)
);

CREATE TYPE seat_status AS ENUM ('active', 'inactive');
CREATE TYPE seat_type AS ENUM ('vip', 'regular', 'none');

CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  arrangement_id INT REFERENCES seating_arrangements(id) ON DELETE CASCADE,
  seat_code VARCHAR(20) NOT NULL,
  row_no INT NOT NULL,
  col_no INT NOT NULL,
  status seat_status DEFAULT 'inactive',
  seat_type seat_type DEFAULT 'none',
  price DECIMAL(10,2),
  UNIQUE (arrangement_id, seat_code)
);
```

## Required API Endpoints

### 1. Create Seating Arrangement
```javascript
// POST /api/seating-arrangements
app.post('/api/seating-arrangements', authenticateToken, async (req, res) => {
  try {
    const { venueId, floorLabel, rows, cols, totalVip, totalRegular } = req.body;
    const tenantId = req.user.tenantId; // From JWT token
    
    // Validate input
    if (!venueId || !floorLabel || !rows || !cols) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if arrangement already exists
    const existing = await db.query(
      'SELECT id FROM seating_arrangements WHERE venue_id = $1 AND tenant_id = $2 AND floor_label = $3',
      [venueId, tenantId, floorLabel]
    );
    
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Seating arrangement already exists for this floor' });
    }
    
    // Create arrangement
    const result = await db.query(
      `INSERT INTO seating_arrangements (venue_id, tenant_id, floor_label, rows, cols, total_vip, total_regular) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [venueId, tenantId, floorLabel, rows, cols, totalVip, totalRegular]
    );
    
    res.status(201).json({ 
      message: 'Seating arrangement created successfully',
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error creating seating arrangement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 2. Create Seats in Bulk
```javascript
// POST /api/seats/bulk
app.post('/api/seats/bulk', authenticateToken, async (req, res) => {
  try {
    const { arrangementId, seats } = req.body;
    
    if (!arrangementId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    
    // Verify arrangement exists and user owns it
    const arrangement = await db.query(
      'SELECT id FROM seating_arrangements WHERE id = $1 AND tenant_id = $2',
      [arrangementId, req.user.tenantId]
    );
    
    if (arrangement.rows.length === 0) {
      return res.status(404).json({ error: 'Seating arrangement not found' });
    }
    
    // Prepare bulk insert
    const values = [];
    const placeholders = [];
    let placeholderIndex = 1;
    
    seats.forEach(seat => {
      values.push(
        arrangementId,
        seat.seatCode,
        seat.rowNo,
        seat.colNo,
        seat.status,
        seat.seatType,
        seat.price || null
      );
      placeholders.push(
        `($${placeholderIndex}, $${placeholderIndex + 1}, $${placeholderIndex + 2}, $${placeholderIndex + 3}, $${placeholderIndex + 4}, $${placeholderIndex + 5}, $${placeholderIndex + 6})`
      );
      placeholderIndex += 7;
    });
    
    const query = `
      INSERT INTO seats (arrangement_id, seat_code, row_no, col_no, status, seat_type, price)
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (arrangement_id, seat_code) DO UPDATE SET
        status = EXCLUDED.status,
        seat_type = EXCLUDED.seat_type,
        price = EXCLUDED.price
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    
    res.status(201).json({
      message: 'Seats created successfully',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error creating seats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 3. Get Seating Arrangements by Venue
```javascript
// GET /api/seating-arrangements/venue/:venueId
app.get('/api/seating-arrangements/venue/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;
    
    const result = await db.query(
      `SELECT * FROM seating_arrangements 
       WHERE venue_id = $1 
       ORDER BY floor_label, created_at`,
      [venueId]
    );
    
    res.json({
      message: 'Seating arrangements retrieved successfully',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching seating arrangements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 4. Get Seats by Arrangement
```javascript
// GET /api/seats/arrangement/:arrangementId
app.get('/api/seats/arrangement/:arrangementId', async (req, res) => {
  try {
    const { arrangementId } = req.params;
    
    const result = await db.query(
      `SELECT * FROM seats 
       WHERE arrangement_id = $1 
       ORDER BY row_no, col_no`,
      [arrangementId]
    );
    
    res.json({
      message: 'Seats retrieved successfully',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 5. Update Seat
```javascript
// PUT /api/seats/:seatId
app.put('/api/seats/:seatId', authenticateToken, async (req, res) => {
  try {
    const { seatId } = req.params;
    const { status, seatType, price } = req.body;
    
    // Verify seat exists and user owns the arrangement
    const seatCheck = await db.query(
      `SELECT s.*, sa.tenant_id 
       FROM seats s 
       JOIN seating_arrangements sa ON s.arrangement_id = sa.id 
       WHERE s.id = $1`,
      [seatId]
    );
    
    if (seatCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Seat not found' });
    }
    
    if (seatCheck.rows[0].tenant_id !== req.user.tenantId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await db.query(
      `UPDATE seats 
       SET status = COALESCE($1, status),
           seat_type = COALESCE($2, seat_type),
           price = COALESCE($3, price)
       WHERE id = $4
       RETURNING *`,
      [status, seatType, price, seatId]
    );
    
    res.json({
      message: 'Seat updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating seat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 6. Delete Seating Arrangement
```javascript
// DELETE /api/seating-arrangements/:id
app.delete('/api/seating-arrangements/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify arrangement exists and user owns it
    const arrangement = await db.query(
      'SELECT id FROM seating_arrangements WHERE id = $1 AND tenant_id = $2',
      [id, req.user.tenantId]
    );
    
    if (arrangement.rows.length === 0) {
      return res.status(404).json({ error: 'Seating arrangement not found' });
    }
    
    // Delete arrangement (cascades to seats)
    await db.query('DELETE FROM seating_arrangements WHERE id = $1', [id]);
    
    res.json({ message: 'Seating arrangement deleted successfully' });
  } catch (error) {
    console.error('Error deleting seating arrangement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Middleware

### Authentication Middleware
```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}
```

## Example Frontend Usage

The frontend can now use these endpoints through the API functions:

```typescript
// Create a venue with seating arrangements
const venue = await createVenue(venueData);
const arrangements = convertSeatingDesignToArrangements(venue.id, seatingDesign);

for (const { arrangement, seats } of arrangements) {
  const arrangementResponse = await createSeatingArrangement(arrangement);
  await createSeats(arrangementResponse.data.id, seats);
}

// Display seating for customers
const arrangements = await getSeatingArrangementsByVenue(venueId);
const seats = await getSeatsByArrangement(arrangementId);
```

## Testing

Test the endpoints using tools like Postman or curl:

```bash
# Create seating arrangement
curl -X POST http://localhost:3000/api/seating-arrangements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "venueId": 1,
    "floorLabel": "F1",
    "rows": 10,
    "cols": 12,
    "totalVip": 20,
    "totalRegular": 100
  }'

# Get arrangements for venue
curl http://localhost:3000/api/seating-arrangements/venue/1

# Get seats for arrangement
curl http://localhost:3000/api/seats/arrangement/1
```
