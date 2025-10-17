import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Download, Share2 } from "lucide-react";

export type TicketCardStatus = 'active' | 'used' | 'cancelled';

export interface TicketCardEvent {
  id: string | number;
  title: string;
  date: string;
  time: string;
  venue: string;
}

export interface TicketCardData {
  id: string | number;
  eventId: string | number;
  status: TicketCardStatus;
  purchaseDate: string;
  price: number;
  event: TicketCardEvent;
}

interface TicketCardProps {
  ticket: TicketCardData;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{ticket.event.title}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              ticket.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : ticket.status === 'used'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {ticket.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(ticket.event.date).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              {ticket.event.time}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              {ticket.event.venue}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground">Purchased: </span>
              <span>{new Date(ticket.purchaseDate).toLocaleDateString()}</span>
              <span className="text-muted-foreground ml-4">Price: </span>
              <span className="font-medium">${ticket.price}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;