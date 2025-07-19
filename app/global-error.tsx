"use client"

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="max-w-md w-full mx-auto px-4 text-center">
            <div className="bg-card rounded-lg border p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold mb-2">Application Error</h1>
              <p className="text-muted-foreground mb-6">
                A critical error occurred. Please refresh the page or contact support if the problem persists.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={reset}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Link>
                </Button>
              </div>
              
              {error.digest && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Error ID: {error.digest}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
