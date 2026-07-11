import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import BeachAccessIcon from '@mui/icons-material/BeachAccessOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailableOutlined';
import CelebrationIcon from '@mui/icons-material/CelebrationOutlined';
import api from '../../api/axios';

function StatCard({ icon, label, value, color }) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.main`,
            color: '#fff',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [employeesRes, leavesRes, holidaysRes] = await Promise.all([
        api.get('/employees'),
        api.get('/leaves', { params: { status: 'Pending' } }),
        api.get('/holidays', { params: { year: new Date().getFullYear() } }),
      ]);
      const activeCount = employeesRes.data.employees.filter((e) => e.status === 'Active').length;
      setStats({
        totalEmployees: employeesRes.data.count,
        activeEmployees: activeCount,
        pendingLeaves: leavesRes.data.count,
        upcomingHolidays: holidaysRes.data.holidays.filter((h) => new Date(h.date) >= new Date()).length,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Welcome back
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Here's what's happening across your organization.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<PeopleIcon />} label="Total Employees" value={stats.totalEmployees} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<PeopleIcon />} label="Active Employees" value={stats.activeEmployees} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<BeachAccessIcon />} label="Pending Leave Requests" value={stats.pendingLeaves} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<CelebrationIcon />} label="Upcoming Holidays" value={stats.upcomingHolidays} color="info" />
        </Grid>
      </Grid>
    </Box>
  );
}
