import { SeatingDesign, SeatingArea } from '@/components/venue/SeatingLayoutDesigner';

// Database interfaces matching your schema
export interface SeatingArrangementData {
  venueId: number;
  floorLabel: string;
  rows: number;
  cols: number;
  totalVip: number;
  totalRegular: number;
}

export interface SeatData {
  seatCode: string;
  rowNo: number;
  colNo: number;
  status: 'active' | 'inactive';
  seatType: 'vip' | 'regular' | 'none';
  price?: number;
}

/**
 * Converts SeatingDesign to database format for seating arrangements
 * Each floor/seating area becomes a separate arrangement
 */
export function convertSeatingDesignToArrangements(
  venueId: number,
  seatingDesign: SeatingDesign
): { arrangement: SeatingArrangementData; seats: SeatData[] }[] {
  const arrangements: { arrangement: SeatingArrangementData; seats: SeatData[] }[] = [];

  // Process each seating area as a separate arrangement
  seatingDesign.seatingAreas.forEach((area: SeatingArea, index: number) => {
    const { arrangement, seats } = convertSeatingAreaToArrangement(
      venueId,
      seatingDesign.floorLabel,
      area,
      index
    );
    arrangements.push({ arrangement, seats });
  });

  return arrangements;
}

/**
 * Converts a single SeatingArea to a database arrangement
 */
function convertSeatingAreaToArrangement(
  venueId: number,
  baseFloorLabel: string,
  area: SeatingArea,
  areaIndex: number
): { arrangement: SeatingArrangementData; seats: SeatData[] } {
  // Create unique floor label for this area
  const floorLabel = seatingAreaToFloorLabel(baseFloorLabel, area.name, areaIndex);
  
  // Calculate totals
  let totalVip = 0;
  let totalRegular = 0;
  const seats: SeatData[] = [];

  // Generate seats for this area
  for (let row = 1; row <= area.rows; row++) {
    for (let col = 1; col <= area.columns; col++) {
      const seatKey = `${row - 1}-${col - 1}`; // 0-based for internal tracking
      const individualSeat = area.individualSeats?.[seatKey];
      
      // Determine seat type and price
      let seatType: 'vip' | 'regular' | 'none';
      let price: number;
      let status: 'active' | 'inactive';

      if (individualSeat) {
        // Individual seat override
        seatType = individualSeat.type === 'deactivated' ? 'none' : individualSeat.type;
        price = individualSeat.price;
        status = individualSeat.type === 'deactivated' ? 'inactive' : 'active';
      } else {
        // Use area defaults
        seatType = area.seatType === 'deactivated' ? 'none' : area.seatType;
        price = area.seatType === 'vip' ? area.vipPrice : area.seatPrice;
        status = area.seatType === 'deactivated' ? 'inactive' : 'active';
      }

      // Count active seats
      if (status === 'active') {
        if (seatType === 'vip') totalVip++;
        else if (seatType === 'regular') totalRegular++;
      }

      // Generate seat code
      const seatCode = generateSeatCode(floorLabel, area.name, row, col);

      seats.push({
        seatCode,
        rowNo: row,
        colNo: col,
        status,
        seatType,
        price: status === 'active' ? price : undefined
      });
    }
  }

  const arrangement: SeatingArrangementData = {
    venueId,
    floorLabel,
    rows: area.rows,
    cols: area.columns,
    totalVip,
    totalRegular
  };

  return { arrangement, seats };
}

/**
 * Generates a unique floor label for a seating area
 */
function seatingAreaToFloorLabel(
  baseFloorLabel: string,
  areaName: string,
  areaIndex: number
): string {
  // If area name is different from base floor label, use it
  if (areaName && areaName !== baseFloorLabel) {
    return areaName;
  }
  
  // Otherwise, append area index to make it unique
  return areaIndex === 0 ? baseFloorLabel : `${baseFloorLabel}-A${areaIndex + 1}`;
}

/**
 * Generates seat code in format: FloorLabel-AreaName-R{row}-C{col}
 */
function generateSeatCode(
  floorLabel: string,
  areaName: string,
  row: number,
  col: number
): string {
  const cleanFloorLabel = floorLabel.replace(/[^a-zA-Z0-9]/g, '');
  const cleanAreaName = areaName.replace(/[^a-zA-Z0-9]/g, '');
  
  return `${cleanFloorLabel}-${cleanAreaName}-R${row}-C${col}`;
}

/**
 * Calculates summary statistics for seating arrangements
 */
export function calculateSeatingStatistics(arrangements: { arrangement: SeatingArrangementData; seats: SeatData[] }[]) {
  let totalSeats = 0;
  let totalVipSeats = 0;
  let totalRegularSeats = 0;
  let totalActiveSeats = 0;
  let totalInactiveSeats = 0;

  arrangements.forEach(({ seats }) => {
    seats.forEach(seat => {
      totalSeats++;
      if (seat.status === 'active') {
        totalActiveSeats++;
        if (seat.seatType === 'vip') totalVipSeats++;
        else if (seat.seatType === 'regular') totalRegularSeats++;
      } else {
        totalInactiveSeats++;
      }
    });
  });

  return {
    totalSeats,
    totalVipSeats,
    totalRegularSeats,
    totalActiveSeats,
    totalInactiveSeats,
    totalArrangements: arrangements.length
  };
}

/**
 * Validates seating arrangement data before saving
 */
export function validateSeatingArrangements(
  arrangements: { arrangement: SeatingArrangementData; seats: SeatData[] }[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (arrangements.length === 0) {
    errors.push('No seating arrangements found');
    return { isValid: false, errors };
  }

  arrangements.forEach(({ arrangement, seats }, index) => {
    // Validate arrangement
    if (!arrangement.floorLabel.trim()) {
      errors.push(`Arrangement ${index + 1}: Floor label is required`);
    }
    if (arrangement.rows <= 0 || arrangement.cols <= 0) {
      errors.push(`Arrangement ${index + 1}: Invalid rows or columns`);
    }

    // Validate seats
    if (seats.length !== arrangement.rows * arrangement.cols) {
      errors.push(`Arrangement ${index + 1}: Seat count doesn't match grid dimensions`);
    }

    // Check for duplicate seat codes within arrangement
    const seatCodes = seats.map(s => s.seatCode);
    const uniqueCodes = new Set(seatCodes);
    if (seatCodes.length !== uniqueCodes.size) {
      errors.push(`Arrangement ${index + 1}: Duplicate seat codes found`);
    }

    // Validate individual seats
    seats.forEach((seat, seatIndex) => {
      if (!seat.seatCode.trim()) {
        errors.push(`Arrangement ${index + 1}, Seat ${seatIndex + 1}: Seat code is required`);
      }
      if (seat.rowNo <= 0 || seat.colNo <= 0) {
        errors.push(`Arrangement ${index + 1}, Seat ${seatIndex + 1}: Invalid row or column number`);
      }
      if (seat.status === 'active' && !seat.price) {
        errors.push(`Arrangement ${index + 1}, Seat ${seatIndex + 1}: Active seats must have a price`);
      }
    });
  });

  return { isValid: errors.length === 0, errors };
}
