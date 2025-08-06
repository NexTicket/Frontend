'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import {
  Crown,
  Building,
  QrCode,
  Users,
  Calendar,
  MapPin,
  Settings,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Sparkles,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { userProfile } = useAuth();

  const roleOptions = [
    {
      id: 'organizer',
      title: 'Event Organizer',
      description: 'Create and manage amazing events',
      icon: Crown,
      color: 'from-amber-500 to-orange-600',
      features: ['Event Creation', 'Venue Selection', 'Attendee Management', 'Revenue Analytics'],
      benefits: 'Access to 5K+ venues, automated attendee management, and real-time analytics'
    },
    {
      id: 'venue_owner',
      title: 'Venue Owner',
      description: 'List and manage your venues',
      icon: Building,
      color: 'from-emerald-500 to-teal-600',
      features: ['Venue Listing', 'Seating Charts', 'Booking Management', 'Revenue Tracking'],
      benefits: 'Increase bookings by 300%, interactive seating layouts, and automated billing'
    },
    {
      id: 'customer',
      title: 'Event Attendee',
      description: 'Discover and book amazing events',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      features: ['Event Discovery', 'Seat Selection', 'Digital Tickets', 'Event Reminders'],
      benefits: 'Exclusive early access, personalized recommendations, and seamless booking'
    }
  ];

  const steps = [
    {
      title: 'Welcome to NexTicket!',
      description: 'The ultimate platform connecting organizers, venues, and audiences',
      component: 'welcome'
    },
    {
      title: 'Choose Your Role',
      description: 'Select how you want to use NexTicket',
      component: 'role-selection'
    },
    {
      title: 'Get Started',
      description: 'Your personalized dashboard awaits',
      component: 'completion'
    }
  ];

  useEffect(() => {
    if (userProfile?.role) {
      setSelectedRole(userProfile.role);
    }
  }, [userProfile]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleComplete = () => {
    // Here you would typically update the user's role in the database
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="p-8 md:p-12">
            {/* Welcome Step */}
            {currentStep === 0 && (
              <div className="text-center">
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-primary to-purple-600 p-6 rounded-full w-fit mx-auto mb-6">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                    {steps[currentStep].title}
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {steps[currentStep].description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                    <Target className="h-8 w-8 text-blue-600 mb-3 mx-auto" />
                    <h3 className="font-semibold text-gray-900 mb-2">Comprehensive Platform</h3>
                    <p className="text-sm text-gray-600">All-in-one solution for event management</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-purple-600 mb-3 mx-auto" />
                    <h3 className="font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
                    <p className="text-sm text-gray-600">Track performance and insights</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                    <Shield className="h-8 w-8 text-green-600 mb-3 mx-auto" />
                    <h3 className="font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
                    <p className="text-sm text-gray-600">Bank-level security for all transactions</p>
                  </div>
                </div>
              </div>
            )}

            {/* Role Selection Step */}
            {currentStep === 1 && (
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">{steps[currentStep].title}</h2>
                <p className="text-lg text-gray-600 mb-8">{steps[currentStep].description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;
                    
                    return (
                      <div
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                          isSelected ? 'ring-4 ring-primary/30' : ''
                        }`}
                      >
                        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-primary/30 transition-colors">
                          {/* Selection indicator */}
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}

                          <div className={`bg-gradient-to-br ${role.color} p-4 rounded-xl w-fit mx-auto mb-4`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          
                          <h3 className="text-xl font-bold mb-2 text-gray-900">{role.title}</h3>
                          <p className="text-gray-600 mb-4">{role.description}</p>
                          
                          <div className="text-sm text-gray-500 mb-4">
                            {role.benefits}
                          </div>

                          <div className="space-y-2">
                            {role.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center text-sm text-gray-600">
                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${role.color} mr-2`}></div>
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completion Step */}
            {currentStep === 2 && selectedRole && (
              <div className="text-center">
                <div className="mb-8">
                  {(() => {
                    const selectedRoleData = roleOptions.find(r => r.id === selectedRole);
                    const Icon = selectedRoleData?.icon || Crown;
                    return (
                      <div className={`bg-gradient-to-br ${selectedRoleData?.color} p-6 rounded-full w-fit mx-auto mb-6`}>
                        <Icon className="h-12 w-12 text-white" />
                      </div>
                    );
                  })()}
                  
                  <h2 className="text-3xl font-bold mb-4 text-gray-900">You're All Set!</h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Welcome to your personalized {roleOptions.find(r => r.id === selectedRole)?.title} dashboard
                  </p>
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-purple-600/5 rounded-2xl p-8 mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">What's Next?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary/20 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Explore Dashboard</h4>
                        <p className="text-sm text-gray-600">Access your personalized control panel</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Settings className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Complete Profile</h4>
                        <p className="text-sm text-gray-600">Add more details to your account</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={nextStep}
                  disabled={currentStep === 1 && !selectedRole}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="flex items-center space-x-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
