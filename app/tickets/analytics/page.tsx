'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Users, 
  Ticket, 
  DollarSign, 
  Calendar, 
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { 
  fetchDashboardAnalytics,
  fetchSalesAnalytics,
  fetchUserAnalytics,
  fetchRevenueAnalytics,
  fetchTicketAnalytics
} from '@/lib/api'
import { useAuth } from '@/components/auth/auth-provider'

interface AnalyticsData {
  total_tickets_sold: number;
  total_revenue: number;
  total_active_events: number;
  total_users: number;
  popular_events: any[];
  revenue_by_month: { [key: string]: number };
}

interface EventAnalytics {
  event_id: number;
  event_name: string;
  tickets_sold: number;
  revenue: number;
  attendance_rate: number;
}

export default function TicketAnalyticsPage() {
  const { firebaseUser, userProfile } = useAuth()
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics[]>([])
  const [userAnalytics, setUserAnalytics] = useState<any>(null)
  const [venueAnalytics, setVenueAnalytics] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    if (firebaseUser) {
      loadAnalyticsData()
    } else {
      setLoading(false)
      setError('Please log in to view analytics')
    }
  }, [firebaseUser, selectedTimeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Load general analytics
      const analytics = await fetchDashboardAnalytics()
      setAnalyticsData(analytics)
      
      // Load sales analytics (for event data)
      const sales = await fetchSalesAnalytics()
      setEventAnalytics(sales?.events || [])
      
      // Load user analytics
      const users = await fetchUserAnalytics()
      setUserAnalytics(users)
      
      // Load revenue data
      const revenue = await fetchRevenueAnalytics()
      setRevenueData(revenue)
      
      // Load ticket analytics (for venue data)
      const tickets = await fetchTicketAnalytics()
      setVenueAnalytics(tickets?.venues || [])
      
    } catch (err) {
      console.error('Failed to load analytics:', err)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-red-600 text-lg mb-4">{error || 'No analytics data available'}</div>
          <Button onClick={loadAnalyticsData}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ticket Analytics Dashboard</h1>
          <p className="text-gray-600">Track your ticket sales, revenue, and event performance</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex space-x-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange(range)}
            >
              {range === '7d' ? '7 Days' :
               range === '30d' ? '30 Days' :
               range === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.total_tickets_sold.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.total_revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.total_active_events}</div>
            <p className="text-xs text-muted-foreground">
              Currently ongoing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.total_users.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +15% new users
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Popular Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.popular_events?.slice(0, 5).map((event: any, index: number) => (
                <div key={event.id || index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{event.name || event.event_name}</p>
                    <p className="text-sm text-gray-600">{event.tickets_sold} tickets sold</p>
                  </div>
                  <Badge variant="secondary">
                    ${event.revenue?.toLocaleString() || '0'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Event Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventAnalytics.slice(0, 5).map((event, index) => (
                <div key={event.event_id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{event.event_name}</p>
                    <Badge 
                      variant={event.attendance_rate > 80 ? 'default' : 
                              event.attendance_rate > 50 ? 'secondary' : 'outline'}
                    >
                      {event.attendance_rate?.toFixed(1)}% attendance
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{event.tickets_sold} sold</span>
                    <span>${event.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(event.attendance_rate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Revenue by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analyticsData.revenue_by_month || {}).map(([month, revenue]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{month}</span>
                  <span className="text-sm">${(revenue as number).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Venue Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Top Venues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {venueAnalytics.slice(0, 5).map((venue: any, index: number) => (
                <div key={venue.venue_id || index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{venue.venue_name}</p>
                    <p className="text-sm text-gray-600">{venue.total_events} events hosted</p>
                  </div>
                  <Badge variant="outline">
                    {venue.utilization_rate?.toFixed(1)}% utilization
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Analytics Section */}
      {userAnalytics && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{userAnalytics.new_users?.toLocaleString() || '0'}</div>
                <p className="text-sm text-gray-600">New Users (30d)</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userAnalytics.returning_users?.toLocaleString() || '0'}</div>
                <p className="text-sm text-gray-600">Returning Users</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userAnalytics.avg_tickets_per_user?.toFixed(1) || '0.0'}</div>
                <p className="text-sm text-gray-600">Avg Tickets per User</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}