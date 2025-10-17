'use client';
import React from "react";  
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 text-center">
        <div className="bg-card rounded-lg border p-8">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold text-muted-foreground">404</span>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="space-y-3">
            <Button 
              className="w-full"
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            
            <Button 
              variant="outline"
              className="w-full"
              asChild
            >
              <Link href="/events">
                <Search className="mr-2 h-4 w-4" />
                Browse Events
              </Link>
            </Button>
            
            <Button 
              variant="ghost"
              className="w-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
