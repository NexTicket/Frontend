"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckinScannerPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const [scannerActive, setScannerActive] = useState(true);
  // Add your scanner logic here

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-orange-50 to-purple-50">
      <div className="max-w-md w-full bg-white/80 border border-purple-200 rounded-2xl p-8 shadow-xl shadow-purple-100/50 text-center">
        <h1 className="text-2xl font-bold text-purple-900 mb-4">Check-in Scanner</h1>
        <p className="text-purple-700 mb-6">Event ID: <span className="font-mono text-purple-800">{params.eventId}</span></p>
        {scannerActive ? (
          <>
            <div className="w-64 h-64 bg-gray-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <div className="text-white text-center">
                <QrCode className="w-16 h-16 mx-auto mb-2 animate-pulse" />
                <p className="text-sm">Camera Active</p>
                <p className="text-xs text-gray-300">Point camera at QR code</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" className="flex-1" onClick={() => setScannerActive(false)}>
                Stop Scanner
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                Manual Entry
              </Button>
            </div>
          </>
        ) : (
          <Button size="lg" className="w-full bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600" onClick={() => setScannerActive(true)}>
            <QrCode className="w-5 h-5 mr-2" />
            Activate Scanner
          </Button>
        )}
        <Button variant="ghost" className="w-full mt-8" onClick={() => router.back()}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </div>
    </div>
  );
}
