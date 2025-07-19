'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  LinearProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  Fab,
  Badge,
  Container
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Activity,
  MapPin,
  Clock,
  Star,
  AlertTriangle,
  RefreshCw,
  Settings,
  Plus,
  Bell,
  Download
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

// Mock data for analytics
const revenueData = [
  { name: 'Jan', revenue: 45000, tickets: 120, events: 8 },
  { name: 'Feb', revenue: 52000, tickets: 145, events: 12 },
  { name: 'Mar', revenue: 48000, tickets: 132, events: 10 },
  { name: 'Apr', revenue: 61000, tickets: 168, events: 15 },
  { name: 'May', revenue: 58000, tickets: 155, events: 13 },
  { name: 'Jun', revenue: 67000, tickets: 189, events: 18 },
  { name: 'Jul', revenue: 74000, tickets: 210, events: 22 }
];

const categoryData = [
  { name: 'Concerts', value: 35, color: '#8884d8' },
  { name: 'Sports', value: 25, color: '#82ca9d' },
  { name: 'Theater', value: 20, color: '#ffc658' },
  { name: 'Comedy', value: 12, color: '#ff7300' },
  { name: 'Other', value: 8, color: '#00ff88' }
];

const weeklyData = [
  { day: 'Mon', sales: 45, users: 12 },
  { day: 'Tue', sales: 52, users: 19 },
  { day: 'Wed', sales: 48, users: 15 },
  { day: 'Thu', sales: 61, users: 25 },
  { day: 'Fri', sales: 58, users: 22 },
  { day: 'Sat', sales: 67, users: 31 },
  { day: 'Sun', sales: 74, users: 28 }
];

const recentActivities = [
  { id: 1, user: 'John Doe', action: 'Purchased ticket', event: 'Rock Concert 2025', time: '2 min ago', avatar: '/Images/profile-avatar-account-icon.png' },
  { id: 2, user: 'Jane Smith', action: 'Created event', event: 'Theater Night', time: '5 min ago', avatar: '/Images/profile-avatar-account-icon.png' },
  { id: 3, user: 'Mike Johnson', action: 'Cancelled booking', event: 'Sports Match', time: '10 min ago', avatar: '/Images/profile-avatar-account-icon.png' },
  { id: 4, user: 'Sarah Wilson', action: 'Updated profile', event: '', time: '15 min ago', avatar: '/Images/profile-avatar-account-icon.png' },
  { id: 5, user: 'Tom Brown', action: 'Purchased VIP ticket', event: 'Music Festival', time: '20 min ago', avatar: '/Images/profile-avatar-account-icon.png' }
];

const topEvents = [
  { id: 1, name: 'Summer Music Festival', tickets: 1250, revenue: 125000, growth: 15.2 },
  { id: 2, name: 'Comedy Night Special', tickets: 890, revenue: 89000, growth: 8.7 },
  { id: 3, name: 'Tech Conference 2025', tickets: 650, revenue: 195000, growth: 22.1 },
  { id: 4, name: 'Basketball Championship', tickets: 2100, revenue: 210000, growth: -3.2 },
  { id: 5, name: 'Art Exhibition', tickets: 320, revenue: 32000, growth: 12.5 }
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color, subtitle }) => {
  const TrendIcon = trend && trend > 0 ? TrendingUp : TrendingDown;
  const trendColor = trend && trend > 0 ? '#10b981' : '#ef4444';

  return (
    <Card elevation={2} sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendIcon size={16} color={trendColor} />
                <Typography variant="body2" color={trendColor} ml={0.5}>
                  {Math.abs(trend)}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      icon: <Users size={24} color="#3b82f6" />,
      trend: 12.5,
      color: '#3b82f6',
      subtitle: '145 new this week'
    },
    {
      title: 'Active Events',
      value: '186',
      icon: <Calendar size={24} color="#10b981" />,
      trend: 8.2,
      color: '#10b981',
      subtitle: '23 ending soon'
    },
    {
      title: 'Monthly Revenue',
      value: 'LKR 847K',
      icon: <DollarSign size={24} color="#f59e0b" />,
      trend: 15.8,
      color: '#f59e0b',
      subtitle: 'Target: LKR 1M'
    },
    {
      title: 'Tickets Sold',
      value: '12,493',
      icon: <Activity size={24} color="#8b5cf6" />,
      trend: 23.1,
      color: '#8b5cf6',
      subtitle: '1,847 today'
    },
    {
      title: 'Active Venues',
      value: '67',
      icon: <MapPin size={24} color="#ef4444" />,
      trend: 5.4,
      color: '#ef4444',
      subtitle: '12 pending approval'
    },
    {
      title: 'Avg. Rating',
      value: '4.8',
      icon: <Star size={24} color="#f97316" />,
      trend: 2.1,
      color: '#f97316',
      subtitle: 'From 2,847 reviews'
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="#1e293b">
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={0.5}>
              Welcome back! Here's what's happening with NexTicket today.
            </Typography>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              sx={{ backgroundColor: 'white', boxShadow: 1 }}
            >
              <RefreshCw className={refreshing ? 'animate-spin' : ''} size={20} />
            </IconButton>
            <Badge badgeContent={notifications} color="error">
              <IconButton sx={{ backgroundColor: 'white', boxShadow: 1 }}>
                <Bell size={20} />
              </IconButton>
            </Badge>
            <Button
              variant="contained"
              startIcon={<Download size={16} />}
              sx={{ textTransform: 'none' }}
            >
              Export Report
            </Button>
          </Box>
        </Box>

        {/* System Alerts */}
        <Box mb={3}>
          <Alert 
            severity="warning" 
            icon={<AlertTriangle size={20} />}
            action={
              <Button color="inherit" size="small">
                Review
              </Button>
            }
          >
            <strong>System Maintenance:</strong> Scheduled maintenance on July 25, 2025 from 2:00 AM - 4:00 AM LKT
          </Alert>
        </Box>

        {/* Stats Grid */}
        <Box display="grid" 
             gridTemplateColumns={{ 
               xs: '1fr', 
               sm: 'repeat(2, 1fr)', 
               md: 'repeat(3, 1fr)', 
               lg: 'repeat(6, 1fr)' 
             }} 
             gap={3} 
             mb={4}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </Box>

        {/* Charts Section */}
        <Box display="grid" 
             gridTemplateColumns={{ xs: '1fr', lg: '2fr 1fr' }} 
             gap={3} 
             mb={4}>
          {/* Revenue Trend */}
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Revenue Trend
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'revenue' ? `LKR ${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : name
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>

          {/* Event Categories */}
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Event Categories
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        {/* Weekly Performance & Recent Activity */}
        <Box display="grid" 
             gridTemplateColumns={{ xs: '1fr', lg: '2fr 1fr' }} 
             gap={3} 
             mb={4}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Weekly Performance
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#10b981" name="Ticket Sales" />
                <Bar dataKey="users" fill="#3b82f6" name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Recent Activity
              </Typography>
              <Button 
                size="small" 
                onClick={() => setActivityDialogOpen(true)}
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Box>
            <List sx={{ maxHeight: 320, overflow: 'auto' }}>
              {recentActivities.slice(0, 5).map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar src={activity.avatar} sx={{ width: 32, height: 32 }} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          <strong>{activity.user}</strong> {activity.action}
                          {activity.event && ` for ${activity.event}`}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Top Events */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Top Performing Events
          </Typography>
          <Box display="grid" 
               gridTemplateColumns={{ 
                 xs: '1fr', 
                 sm: 'repeat(2, 1fr)', 
                 md: 'repeat(3, 1fr)', 
                 lg: 'repeat(5, 1fr)' 
               }} 
               gap={2}>
            {topEvents.map((event) => (
              <Card variant="outlined" sx={{ height: '100%' }} key={event.id}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {event.name}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Tickets
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {event.tickets.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Revenue
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      LKR {(event.revenue / 1000).toFixed(0)}K
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Growth
                    </Typography>
                    <Chip
                      size="small"
                      label={`${event.growth > 0 ? '+' : ''}${event.growth}%`}
                      color={event.growth > 0 ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>

        {/* Recent Activity Dialog */}
        <Dialog 
          open={activityDialogOpen} 
          onClose={() => setActivityDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>All Recent Activities</DialogTitle>
          <DialogContent>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar src={activity.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1">
                          <strong>{activity.user}</strong> {activity.action}
                          {activity.event && ` for ${activity.event}`}
                        </Typography>
                      }
                      secondary={activity.time}
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </DialogContent>
        </Dialog>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
        >
          <Plus />
        </Fab>
      </Container>
    </Box>
  );
}
