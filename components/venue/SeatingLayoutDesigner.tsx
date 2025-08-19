'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Group, Transformer } from 'react-konva';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { 
  Settings,
  MousePointer2,
  Square,
  Grid,
  X,
  RotateCcw,
  GripVertical
} from 'lucide-react';

// Types for Konva-based seating designer
export interface SeatingArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rows: number;
  columns: number;
  seatPrice: number;
  vipPrice: number; // Add VIP price
  seatType: 'regular' | 'vip' | 'deactivated';
  color: string;
  rotation?: number;
  individualSeats?: { [key: string]: { type: 'regular' | 'vip' | 'deactivated', price: number, label?: string } }; // Individual seat overrides
}

export interface Stage {
  id: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  color: string;
}

export interface SeatingDesign {
  canvasWidth: number;
  canvasHeight: number;
  stages: Stage[];
  seatingAreas: SeatingArea[];
  floorLabel: string;
}

export interface SeatData {
  id: string;
  areaId: string;
  row: number;
  column: number;
  seatCode: string;
  price: number;
  seatType: 'regular' | 'vip' | 'deactivated';
  status: 'active' | 'inactive';
  x: number;
  y: number;
}

// Professional Color Theme System
const useSeatingColors = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Professional color palette for venue seating
  const colors = {
    light: {
      // Canvas and backgrounds
      canvas: '#fafafa',
      canvasBorder: '#e4e4e7',
      sidebar: '#ffffff',
      sidebarBorder: '#e4e4e7',
      
      // Stages - Rich warm tones
      stage: {
        fill: '#8b4513', // Saddle brown
        stroke: '#654321',
        strokeSelected: '#2563eb',
        strokeHover: '#4338ca'
      },
      
      // Seating areas - Professional neutrals
      seatingArea: {
        fill: '#1f2937', // Slate gray
        stroke: '#374151',
        strokeSelected: '#2563eb',
        strokeHover: '#4338ca'
      },
      
      // Individual seats - Professional seat colors
      seats: {
        regular: '#10b981', // Emerald green
        vip: '#7c3aed', // Violet purple
        deactivated: '#6b7280', // Cool gray
        border: '#ffffff',
        borderHover: '#fbbf24'
      },
      
      // Text and labels
      text: {
        primary: '#111827',
        secondary: '#6b7280',
        onStage: '#ffffff',
        onSeating: '#ffffff',
        floorLabel: '#1f2937'
      },
      
      // UI elements
      ui: {
        primary: '#2563eb',
        secondary: '#f3f4f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        border: '#e5e7eb',
        shadow: 'rgba(0, 0, 0, 0.1)'
      }
    },
    dark: {
      // Canvas and backgrounds
      canvas: '#0f172a',
      canvasBorder: '#1e293b',
      sidebar: '#1e293b',
      sidebarBorder: '#334155',
      
      // Stages - Rich warm tones for dark mode
      stage: {
        fill: '#d97706', // Amber
        stroke: '#92400e',
        strokeSelected: '#3b82f6',
        strokeHover: '#60a5fa'
      },
      
      // Seating areas - Dark professional
      seatingArea: {
        fill: '#374151',
        stroke: '#4b5563',
        strokeSelected: '#3b82f6',
        strokeHover: '#60a5fa'
      },
      
      // Individual seats - Vibrant but professional
      seats: {
        regular: '#059669', // Darker emerald
        vip: '#8b5cf6', // Lighter violet
        deactivated: '#9ca3af',
        border: '#1f2937',
        borderHover: '#fbbf24'
      },
      
      // Text and labels
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        onStage: '#111827',
        onSeating: '#f8fafc',
        floorLabel: '#e2e8f0'
      },
      
      // UI elements
      ui: {
        primary: '#3b82f6',
        secondary: '#374151',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        border: '#4b5563',
        shadow: 'rgba(0, 0, 0, 0.3)'
      }
    }
  };

  if (!mounted) {
    return colors.light; // Default to light theme during SSR
  }

  return theme === 'dark' ? colors.dark : colors.light;
};

interface SeatingLayoutDesignerProps {
  seatingDesign: SeatingDesign;
  onSeatingDesignChange: (design: SeatingDesign) => void;
}

// Konva Components for Seating Designer
const DraggableRect = ({ shapeProps, isSelected, onSelect, onChange, type }: {
  shapeProps: any;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
  type: 'stage' | 'seatingArea';
}) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [isHovered, setIsHovered] = useState(false);
  const colors = useSeatingColors();

  useEffect(() => {
    if (isSelected) {
      trRef.current?.nodes([shapeRef.current]);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      {/* Floor label above the rectangle */}
      <Text
        x={shapeProps.x}
        y={shapeProps.y - 20}
        text={shapeProps.name || (type === 'stage' ? 'Stage' : 'Seating Area')}
        fontSize={14}
        fill={colors.text.floorLabel}
        fontStyle="bold"
        shadowColor={colors.ui.shadow}
        shadowBlur={2}
        shadowOffset={{ x: 1, y: 1 }}
      />
      
      <Group
        ref={shapeRef}
        {...shapeProps}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          node.scaleX(1);
          node.scaleY(1);
          
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      >
        <Rect
          width={shapeProps.width}
          height={shapeProps.height}
          fill={type === 'stage' ? colors.stage.fill : colors.seatingArea.fill}
          stroke={isSelected 
            ? (type === 'stage' ? colors.stage.strokeSelected : colors.seatingArea.strokeSelected)
            : (isHovered 
              ? (type === 'stage' ? colors.stage.strokeHover : colors.seatingArea.strokeHover)
              : (type === 'stage' ? colors.stage.stroke : colors.seatingArea.stroke)
            )
          }
          strokeWidth={isSelected ? 3 : (isHovered ? 2 : 1)}
          cornerRadius={type === 'stage' ? 12 : 6}
          shadowColor={colors.ui.shadow}
          shadowBlur={isSelected ? 8 : (isHovered ? 4 : 0)}
          shadowOffset={{ x: 2, y: 2 }}
          shadowOpacity={0.3}
        />
      </Group>
      
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={
            type === 'stage' 
              ? [
                  'top-left', 
                  'top-center', 
                  'top-right', 
                  'middle-right', 
                  'bottom-right', 
                  'bottom-center', 
                  'bottom-left', 
                  'middle-left'
                ]
              : [] // No resize anchors for seating areas
          }
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export const SeatingLayoutDesigner: React.FC<SeatingLayoutDesignerProps> = ({
  seatingDesign,
  onSeatingDesignChange
}) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'stage' | 'seatingArea' | ''>('');
  const [tool, setTool] = useState<'select' | 'stage' | 'seatingArea'>('select');
  const colors = useSeatingColors();
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'stage' | 'seatingArea' | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Seat click handling
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastClickedSeat, setLastClickedSeat] = useState<string | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  // Helper function to calculate seating area dimensions based on rows and columns
  const calculateSeatingAreaDimensions = useCallback((rows: number, columns: number) => {
    const fixedSeatWidth = 25;
    const fixedSeatHeight = 20;
    const seatSpacing = 5;
    const areaPadding = 20; // 10px padding on each side
    
    const width = (columns * (fixedSeatWidth + seatSpacing)) - seatSpacing + areaPadding;
    const height = (rows * (fixedSeatHeight + seatSpacing)) - seatSpacing + areaPadding;
    
    return { width, height };
  }, []);

  const addStage = useCallback((x?: number, y?: number) => {
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: seatingDesign.floorLabel || 'Stage',
      x: x ?? 100,
      y: y ?? 100,
      width: 120,
      height: 50,
      color: '#8B4513' // Brown color for stage
    };
    
    onSeatingDesignChange({
      ...seatingDesign,
      stages: [...seatingDesign.stages, newStage]
    });
  }, [seatingDesign, onSeatingDesignChange]);

  const addSeatingArea = useCallback((x?: number, y?: number) => {
    const rows = 5;
    const columns = 8;
    const { width, height } = calculateSeatingAreaDimensions(rows, columns);
    
    const newArea: SeatingArea = {
      id: `area-${Date.now()}`,
      name: seatingDesign.floorLabel || `Area ${seatingDesign.seatingAreas.length + 1}`,
      x: x ?? 200,
      y: y ?? 150,
      width,
      height,
      rows,
      columns,
      seatPrice: 50,
      vipPrice: 100,
      seatType: 'regular',
      color: '#000000', // Black background for seating areas
      individualSeats: {}
    };
    
    onSeatingDesignChange({
      ...seatingDesign,
      seatingAreas: [...seatingDesign.seatingAreas, newArea]
    });
  }, [seatingDesign, onSeatingDesignChange, calculateSeatingAreaDimensions]);

  const updateStage = useCallback((id: string, newAttrs: Partial<Stage>) => {
    onSeatingDesignChange({
      ...seatingDesign,
      stages: seatingDesign.stages.map(stage =>
        stage.id === id ? { ...stage, ...newAttrs } : stage
      )
    });
  }, [seatingDesign, onSeatingDesignChange]);

  const updateSeatingArea = useCallback((id: string, newAttrs: Partial<SeatingArea>) => {
    onSeatingDesignChange({
      ...seatingDesign,
      seatingAreas: seatingDesign.seatingAreas.map(area => {
        if (area.id === id) {
          let updatedArea = { ...area, ...newAttrs };
          
          // If rows or columns changed, recalculate dimensions
          if (newAttrs.rows !== undefined || newAttrs.columns !== undefined) {
            const { width, height } = calculateSeatingAreaDimensions(
              updatedArea.rows, 
              updatedArea.columns
            );
            updatedArea.width = width;
            updatedArea.height = height;
          }
          
          return updatedArea;
        }
        return area;
      })
    });
  }, [seatingDesign, onSeatingDesignChange, calculateSeatingAreaDimensions]);

  // Helper function to update names based on floor label
  const updateFloorLabelAndNames = useCallback((newFloorLabel: string) => {
    const updatedDesign = { ...seatingDesign, floorLabel: newFloorLabel };
    
    // Update stage names if a stage is selected
    if (selectedType === 'stage' && selectedId) {
      updatedDesign.stages = seatingDesign.stages.map(stage =>
        stage.id === selectedId 
          ? { ...stage, name: newFloorLabel }
          : stage
      );
    }
    
    // Update seating area names if a seating area is selected
    if (selectedType === 'seatingArea' && selectedId) {
      updatedDesign.seatingAreas = seatingDesign.seatingAreas.map(area =>
        area.id === selectedId 
          ? { ...area, name: newFloorLabel }
          : area
      );
    }
    
    onSeatingDesignChange(updatedDesign);
  }, [seatingDesign, onSeatingDesignChange, selectedType, selectedId]);

  // Seat click handlers
  const handleSeatClick = useCallback((areaId: string, row: number, col: number) => {
    const seatKey = `${row}-${col}`;
    const area = seatingDesign.seatingAreas.find(a => a.id === areaId);
    if (!area) return;

    const currentSeat = area.individualSeats?.[seatKey];
    const currentType = currentSeat?.type || area.seatType;

    // Handle double-click detection
    if (lastClickedSeat === `${areaId}-${seatKey}` && clickTimeout) {
      // Double click - deactivate
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      setLastClickedSeat(null);
      
      updateIndividualSeat(areaId, seatKey, 'deactivated', 0);
    } else {
      // Single click - toggle between regular and VIP
      if (clickTimeout) clearTimeout(clickTimeout);
      
      const newTimeout = setTimeout(() => {
        const newType = currentType === 'regular' ? 'vip' : 'regular';
        const newPrice = newType === 'vip' ? area.vipPrice : area.seatPrice;
        updateIndividualSeat(areaId, seatKey, newType, newPrice);
        setLastClickedSeat(null);
      }, 300); // 300ms delay to detect double-click
      
      setClickTimeout(newTimeout);
      setLastClickedSeat(`${areaId}-${seatKey}`);
    }
  }, [seatingDesign, lastClickedSeat, clickTimeout]);

  const updateIndividualSeat = useCallback((areaId: string, seatKey: string, type: 'regular' | 'vip' | 'deactivated', price: number) => {
    onSeatingDesignChange({
      ...seatingDesign,
      seatingAreas: seatingDesign.seatingAreas.map(area => {
        if (area.id === areaId) {
          const individualSeats = { ...area.individualSeats };
          individualSeats[seatKey] = { type, price };
          return { ...area, individualSeats };
        }
        return area;
      })
    });
  }, [seatingDesign, onSeatingDesignChange]);

  const getSeatProperties = useCallback((area: SeatingArea, row: number, col: number) => {
    const seatKey = `${row}-${col}`;
    const individualSeat = area.individualSeats?.[seatKey];
    
    if (individualSeat) {
      return {
        type: individualSeat.type,
        price: individualSeat.price,
        color: individualSeat.type === 'vip' ? colors.seats.vip : 
               individualSeat.type === 'deactivated' ? colors.seats.deactivated : colors.seats.regular
      };
    }
    
    return {
      type: area.seatType,
      price: area.seatType === 'vip' ? area.vipPrice : area.seatPrice,
      color: area.seatType === 'vip' ? colors.seats.vip : 
             area.seatType === 'deactivated' ? colors.seats.deactivated : colors.seats.regular
    };
  }, []);

  const deleteSelected = useCallback(() => {
    if (selectedType === 'stage') {
      onSeatingDesignChange({
        ...seatingDesign,
        stages: seatingDesign.stages.filter(stage => stage.id !== selectedId)
      });
    } else if (selectedType === 'seatingArea') {
      onSeatingDesignChange({
        ...seatingDesign,
        seatingAreas: seatingDesign.seatingAreas.filter(area => area.id !== selectedId)
      });
    }
    setSelectedId('');
    setSelectedType('');
  }, [selectedId, selectedType, seatingDesign, onSeatingDesignChange]);

  const handleCanvasClick = useCallback((e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      if (tool === 'stage') {
        addStage();
        setTool('select');
      } else if (tool === 'seatingArea') {
        addSeatingArea();
        setTool('select');
      } else {
        setSelectedId('');
        setSelectedType('');
      }
    }
  }, [tool, addStage, addSeatingArea]);

  // Drag and drop handlers
  const handleDragStart = useCallback((type: 'stage' | 'seatingArea') => {
    setIsDragging(true);
    setDragType(type);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dragType || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    if (dragType === 'stage') {
      addStage(x, y);
    } else if (dragType === 'seatingArea') {
      addSeatingArea(x, y);
    }

    handleDragEnd();
  }, [dragType, addStage, addSeatingArea, handleDragEnd]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const calculateTotalSeats = useCallback(() => {
    return seatingDesign.seatingAreas.reduce((total, area) => {
      return total + (area.rows * area.columns);
    }, 0);
  }, [seatingDesign.seatingAreas]);

  const generateSeatData = useCallback((): SeatData[] => {
    const seats: SeatData[] = [];
    
    seatingDesign.seatingAreas.forEach(area => {
      const seatWidth = area.width / area.columns;
      const seatHeight = area.height / area.rows;
      
      for (let row = 0; row < area.rows; row++) {
        for (let col = 0; col < area.columns; col++) {
          const seatId = `${area.id}-R${row + 1}-C${col + 1}`;
          const seatCode = `${seatingDesign.floorLabel}-${area.name}-R${row + 1}-C${col + 1}`;
          
          seats.push({
            id: seatId,
            areaId: area.id,
            row: row + 1,
            column: col + 1,
            seatCode: seatCode,
            price: area.seatPrice,
            seatType: area.seatType,
            status: area.seatType === 'deactivated' ? 'inactive' : 'active',
            x: area.x + (col * seatWidth) + (seatWidth / 2),
            y: area.y + (row * seatHeight) + (seatHeight / 2)
          });
        }
      }
    });
    
    return seats;
  }, [seatingDesign]);

  const resetLayout = useCallback(() => {
    onSeatingDesignChange({
      canvasWidth: 800,
      canvasHeight: 600,
      stages: [{
        id: 'stage-1',
        name: 'F1',
        x: 350,
        y: 50,
        width: 100,
        height: 40,
        color: '#8B4513' // Brown color for stage
      }],
      seatingAreas: [],
      floorLabel: 'F1'
    });
    setSelectedId('');
    setSelectedType('');
  }, [onSeatingDesignChange]);

  const selectedStage = selectedType === 'stage' ? seatingDesign.stages.find(s => s.id === selectedId) : null;
  const selectedArea = selectedType === 'seatingArea' ? seatingDesign.seatingAreas.find(a => a.id === selectedId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center">
          <Settings className="h-6 w-6 mr-3 text-primary" />
          Customizable Seating Layout Designer
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Tools */}
          <div 
            className="rounded-lg p-4 border-2 transition-all duration-200"
            style={{ 
              backgroundColor: colors.sidebar,
              borderColor: colors.sidebarBorder,
              color: colors.text.primary
            }}
          >
            <h3 className="font-semibold mb-3" style={{ color: colors.text.primary }}>Tools</h3>
            <div className="text-xs mb-2" style={{ color: colors.text.secondary }}>
              💡 Tip: Drag buttons onto canvas to add elements
            </div>
            <div className="space-y-2">
              <Button
                variant={tool === 'select' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => setTool('select')}
              >
                <MousePointer2 className="h-4 w-4 mr-2" />
                Select
              </Button>
              <Button
                variant={tool === 'stage' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start cursor-grab active:cursor-grabbing group relative"
                onClick={() => setTool('stage')}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'copy';
                  handleDragStart('stage');
                }}
                onDragEnd={handleDragEnd}
              >
                <Square className="h-4 w-4 mr-2" />
                Add Stage
                <GripVertical className="h-3 w-3 ml-auto opacity-50 group-hover:opacity-100" />
              </Button>
              <Button
                variant={tool === 'seatingArea' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start cursor-grab active:cursor-grabbing group relative"
                onClick={() => setTool('seatingArea')}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'copy';
                  handleDragStart('seatingArea');
                }}
                onDragEnd={handleDragEnd}
              >
                <Grid className="h-4 w-4 mr-2" />
                Add Seating Area
                <GripVertical className="h-3 w-3 ml-auto opacity-50 group-hover:opacity-100" />
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div 
            className="rounded-lg p-4 border-2 transition-all duration-200"
            style={{ 
              backgroundColor: colors.sidebar,
              borderColor: colors.sidebarBorder,
              color: colors.text.primary
            }}
          >
            <h3 className="font-semibold mb-3" style={{ color: colors.text.primary }}>Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={deleteSelected}
                disabled={!selectedId}
              >
                <X className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={resetLayout}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Layout
              </Button>
            </div>
          </div>

          {/* Layout Info */}
          <div 
            className="rounded-lg p-4 border-2 transition-all duration-200"
            style={{ 
              backgroundColor: colors.sidebar,
              borderColor: colors.sidebarBorder,
              color: colors.text.primary
            }}
          >
            <h3 className="font-semibold mb-3" style={{ color: colors.text.primary }}>Layout Stats</h3>
            <div className="space-y-2 text-sm" style={{ color: colors.text.secondary }}>
              <div className="flex justify-between">
                <span>Stages:</span>
                <span className="font-medium">{seatingDesign.stages.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Seating Areas:</span>
                <span className="font-medium">{seatingDesign.seatingAreas.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Seats:</span>
                <span className="font-medium">{calculateTotalSeats()}</span>
              </div>
            </div>
          </div>

          {/* Floor Label */}
          <div 
            className="rounded-lg p-4 border-2 transition-all duration-200"
            style={{ 
              backgroundColor: colors.sidebar,
              borderColor: colors.sidebarBorder,
              color: colors.text.primary
            }}
          >
            <h3 className="font-semibold mb-3" style={{ color: colors.text.primary }}>Floor Label</h3>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                {selectedId && selectedType && (
                  <span className="text-xs ml-2" style={{ color: colors.text.secondary }}>
                    (will rename selected {selectedType === 'stage' ? 'stage' : 'seating area'})
                  </span>
                )}
              </label>
              <input
                type="text"
                value={seatingDesign.floorLabel}
                onChange={(e) => updateFloorLabelAndNames(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm transition-all duration-200"
                style={{
                  backgroundColor: colors.canvas,
                  borderColor: colors.ui.border,
                  color: colors.text.primary
                }}
                placeholder="e.g., F1, Balcony"
              />
            </div>
          </div>

          {/* Selected Item Properties */}
          {/* Stage Properties - Hidden from UI but functionality preserved
          {selectedStage && (
            <div className="bg-background/50 rounded-lg p-4 border">
              <h3 className="font-semibold mb-3">Stage Properties</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Width</label>
                    <input
                      type="number"
                      value={Math.round(selectedStage.width)}
                      onChange={(e) => updateStage(selectedStage.id, { width: parseInt(e.target.value) || 100 })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Height</label>
                    <input
                      type="number"
                      value={Math.round(selectedStage.height)}
                      onChange={(e) => updateStage(selectedStage.id, { height: parseInt(e.target.value) || 40 })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          */}

          {selectedArea && (
            <div 
              className="rounded-lg p-4 border-2 transition-all duration-200"
              style={{ 
                backgroundColor: colors.sidebar,
                borderColor: colors.sidebarBorder,
                color: colors.text.primary
              }}
            >
              <h3 className="font-semibold mb-3" style={{ color: colors.text.primary }}>Seating Area Properties</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Rows</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={selectedArea.rows}
                      onChange={(e) => updateSeatingArea(selectedArea.id, { rows: parseInt(e.target.value) || 1 })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Columns</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={selectedArea.columns}
                      onChange={(e) => updateSeatingArea(selectedArea.id, { columns: parseInt(e.target.value) || 1 })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Regular Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={selectedArea.seatPrice}
                      onChange={(e) => updateSeatingArea(selectedArea.id, { seatPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">VIP Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={selectedArea.vipPrice}
                      onChange={(e) => updateSeatingArea(selectedArea.id, { vipPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Seat Type</label>
                  <select
                    value={selectedArea.seatType}
                    onChange={(e) => updateSeatingArea(selectedArea.id, { 
                      seatType: e.target.value as 'regular' | 'vip' | 'deactivated'
                    })}
                    className="w-full px-3 py-2 border rounded text-sm"
                  >
                    <option value="regular">Regular</option>
                    <option value="vip">VIP</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3">
          <div 
            ref={canvasRef}
            className={`rounded-lg border-2 relative overflow-hidden transition-all duration-200 ${
              isDragging 
                ? 'border-blue-500 border-dashed shadow-lg' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            style={{ 
              backgroundColor: colors.canvas,
              borderColor: isDragging ? colors.ui.primary : colors.canvasBorder
            }}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
          >
            {isDragging && (
              <div 
                className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none transition-all duration-200"
                style={{ backgroundColor: `${colors.ui.primary}15` }}
              >
                <div 
                  className="border-2 rounded-lg p-6 shadow-2xl backdrop-blur-sm"
                  style={{ 
                    backgroundColor: colors.sidebar,
                    borderColor: colors.ui.primary,
                    color: colors.text.primary
                  }}
                >
                  <p className="font-semibold text-lg">
                    Drop here to add {dragType === 'stage' ? 'a stage' : 'a seating area'}
                  </p>
                </div>
              </div>
            )}
            <Stage
              width={seatingDesign.canvasWidth}
              height={seatingDesign.canvasHeight}
              onClick={handleCanvasClick}
              onTap={handleCanvasClick}
            >
              <Layer>
                {/* Draw Stages */}
                {seatingDesign.stages.map((stage) => (
                  <DraggableRect
                    key={stage.id}
                    shapeProps={stage}
                    isSelected={selectedId === stage.id}
                    type="stage"
                    onSelect={() => {
                      setSelectedId(stage.id);
                      setSelectedType('stage');
                    }}
                    onChange={(newAttrs) => updateStage(stage.id, newAttrs)}
                  />
                ))}

                {/* Draw Seating Areas */}
                {seatingDesign.seatingAreas.map((area) => (
                  <Group key={area.id}>
                    <DraggableRect
                      shapeProps={area}
                      isSelected={selectedId === area.id}
                      type="seatingArea"
                      onSelect={() => {
                        setSelectedId(area.id);
                        setSelectedType('seatingArea');
                      }}
                      onChange={(newAttrs) => updateSeatingArea(area.id, newAttrs)}
                    />
                    
                    {/* Draw individual seats */}
                    {Array.from({ length: area.rows }, (_, row) => 
                      Array.from({ length: area.columns }, (_, col) => {
                        const fixedSeatWidth = 25;  // Fixed seat width
                        const fixedSeatHeight = 20; // Fixed seat height
                        const seatSpacing = 5;      // Spacing between seats
                        const seatX = area.x + 10 + (col * (fixedSeatWidth + seatSpacing)); // 10px padding from area edge
                        const seatY = area.y + 10 + (row * (fixedSeatHeight + seatSpacing)); // 10px padding from area edge
                        
                        const seatProps = getSeatProperties(area, row, col);
                        
                        return (
                          <Rect
                            key={`seat-${row}-${col}`}
                            x={seatX}
                            y={seatY}
                            width={fixedSeatWidth}
                            height={fixedSeatHeight}
                            cornerRadius={6}
                            fill={seatProps.color}
                            stroke={colors.seats.border}
                            strokeWidth={1}
                            shadowColor={colors.ui.shadow}
                            shadowBlur={2}
                            shadowOffset={{ x: 1, y: 1 }}
                            shadowOpacity={0.3}
                            onClick={(e) => {
                              e.cancelBubble = true; // Prevent event bubbling to area
                              handleSeatClick(area.id, row, col);
                            }}
                            onTap={(e) => {
                              e.cancelBubble = true; // Prevent event bubbling to area
                              handleSeatClick(area.id, row, col);
                            }}
                            onMouseEnter={(e) => {
                              const target = e.target as any;
                              target.stroke(colors.seats.borderHover);
                              target.strokeWidth(2);
                              target.getLayer()?.batchDraw();
                            }}
                            onMouseLeave={(e) => {
                              const target = e.target as any;
                              target.stroke(colors.seats.border);
                              target.strokeWidth(1);
                              target.getLayer()?.batchDraw();
                            }}
                          />
                        );
                      })
                    )}
                  </Group>
                ))}
              </Layer>
            </Stage>
          </div>
          
          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Instructions:</strong>
              {tool === 'select' && ' Click and drag elements to move them. Use corner handles to resize. Click an element to select and edit its properties. You can also drag "Add Stage" and "Add Seating Area" buttons directly onto the canvas.'}
              {tool === 'stage' && ' Click anywhere on the canvas to add a new stage area, or drag the "Add Stage" button onto the canvas.'}
              {tool === 'seatingArea' && ' Click anywhere on the canvas to add a new seating area, or drag the "Add Seating Area" button onto the canvas.'}
            </p>
            <p className="text-sm text-blue-800 mt-2">
              <strong>Seat Controls:</strong> Single click seat: Regular ↔ VIP | Double click seat: Deactivate | Colors: Green (Regular), Purple (VIP), Black (Deactivated)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatingLayoutDesigner;
