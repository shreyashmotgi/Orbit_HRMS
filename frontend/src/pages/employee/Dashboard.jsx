import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, Grid, CircularProgress, Chip, Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import LoginIcon from '@mui/icons-material/LoginRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import api from '../../api/axios';

const STATUS_COLORS = {
  Present: '#2e7d32',
  Absent: '#c62828',
  'Paid Leave': '#0277bd',
  'Unpaid Leave': '#ed6c02',
  Holiday: '#7b1fa2',
  'Half Day': '#f9a825',
  'Not Applicable': '#9e9e9e',
};

function fmtHM(mins) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h}h ${m}m`;
}

export default function EmployeeDashboard() {
  const { profile } = useAuth(); 

  const [today, setToday] = useState(null);
  const [punchedIn, setPunchedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const now = new Date();
  const [logs, setLogs] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const loadToday = useCallback(() => {
    return api.get('/attendance/today').then(({ data }) => {
      setToday(data.log);
      setPunchedIn(data.currentlyPunchedIn);
    });
  }, []);

  const loadMonth = useCallback(() => {
    return Promise.all([
      api.get('/attendance/my-history', { params: { month: now.getMonth() + 1, year: now.getFullYear() } }),
      api.get('/holidays', { params: { year: now.getFullYear() } }),
      api.get('/leaves/my'),
    ]).then(([a, h, l]) => {
      setLogs(a.data.logs);
      setHolidays(h.data.holidays);
      setLeaves(l.data.leaves.filter((x) => x.status === 'Approved'));
    });
  }, []); 

  useEffect(() => {
    Promise.all([loadToday(), loadMonth()]).finally(() => setLoading(false));
  }, [loadToday, loadMonth]);

  const handlePunch = async (type) => {
    setBusy(true);
    try {
      await api.post(`/attendance/punch-${type}`);
      await Promise.all([loadToday(), loadMonth()]);
    } catch (err) {
      alert(err.response?.data?.message || 'Punch failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;

  // Build calendar grid for current month
  const year = now.getFullYear();
  const monthIdx = now.getMonth();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, monthIdx, 1).getDay();

  const logByDay = new Map(logs.map((l) => [new Date(l.date).getDate(), l]));
  const holidayByDay = new Map(
    holidays.filter((h) => new Date(h.date).getMonth() === monthIdx).map((h) => [new Date(h.date).getDate(), h])
  );
  const leaveByDay = new Map();
  leaves.forEach((l) => {
    const from = new Date(l.fromDate);
    const to = new Date(l.toDate);
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      if (d.getMonth() === monthIdx) leaveByDay.set(d.getDate(), l);
    }
  });

  const getDayStatus = (day) => {
    const dateObj = new Date(year, monthIdx, day);

    const joiningDate = profile?.dateOfJoining ? new Date(profile.dateOfJoining) : null;
    if (joiningDate) {
      const joiningKey = new Date(joiningDate.getFullYear(), joiningDate.getMonth(), joiningDate.getDate());
      if (dateObj < joiningKey) return 'Not Applicable';
    }

    if (holidayByDay.has(day)) return 'Holiday';
    const leave = leaveByDay.get(day);
    if (leave) return /unpaid/i.test(leave.leaveType) ? 'Unpaid Leave' : 'Paid Leave';
    const log = logByDay.get(day);
    if (log) return log.status;
    if (dateObj > now) return null;
    if (dateObj.getDay() === 0) return null;
    return 'Absent';
  };

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>My Dashboard</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Today's Attendance</Typography>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              {punchedIn ? 'Currently Punched In' : 'Not Punched In'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
              <Button variant="contained" color="success" startIcon={<LoginIcon />} disabled={punchedIn || busy} onClick={() => handlePunch('in')}>
                Punch In
              </Button>
              <Button variant="contained" color="error" startIcon={<LogoutIcon />} disabled={!punchedIn || busy} onClick={() => handlePunch('out')}>
                Punch Out
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} md={4}>
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Today's Working Hours</Typography>
            <Typography variant="h4" fontWeight={800} color="primary.main">{fmtHM(today?.totalWorkingMinutes || 0)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={4}>
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Today's Break Duration</Typography>
            <Typography variant="h4" fontWeight={800} color="secondary.main">{fmtHM(today?.totalBreakMinutes || 0)}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {now.toLocaleString('default', { month: 'long' })} {year}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(STATUS_COLORS).map(([label, color]) => (
              <Chip key={label} size="small" label={label} sx={{ bgcolor: color, color: '#fff' }} />
            ))}
          </Box>
        </Box>

        <Grid container spacing={1}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <Grid item xs={12 / 7} key={d}>
              <Typography variant="caption" align="center" display="block" color="text.secondary" fontWeight={700}>{d}</Typography>
            </Grid>
          ))}
          {cells.map((day, idx) => {
            const status = day ? getDayStatus(day) : null;
            return (
              <Grid item xs={12 / 7} key={idx}>
                <Box
                  onClick={() => day && setSelectedDay(day)}
                  sx={{
                    height: 56,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: day ? 'pointer' : 'default',
                    bgcolor: status ? STATUS_COLORS[status] : 'transparent',
                    color: status ? '#fff' : 'text.primary',
                    border: day ? '1px solid #e5e7eb' : 'none',
                    fontWeight: 600,
                  }}
                >
                  {day || ''}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      <Dialog open={!!selectedDay} onClose={() => setSelectedDay(null)} fullWidth maxWidth="xs">
        <DialogTitle>
          {selectedDay ? new Date(year, monthIdx, selectedDay).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
        </DialogTitle>
        <DialogContent>
          {selectedDay && (() => {
            const status = getDayStatus(selectedDay);
            const log = logByDay.get(selectedDay);
            const holiday = holidayByDay.get(selectedDay);
            const leave = leaveByDay.get(selectedDay);
            return (
              <Box>
                <Chip label={status || 'No record'} sx={{ mb: 2, bgcolor: status ? STATUS_COLORS[status] : undefined, color: status ? '#fff' : undefined }} />
                {holiday && <Typography variant="body2">{holiday.name} — {holiday.description}</Typography>}
                {leave && <Typography variant="body2">{leave.leaveType}: {leave.reason}</Typography>}
                {log && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">Working Hours: {fmtHM(log.totalWorkingMinutes)}</Typography>
                    <Typography variant="body2">Break: {fmtHM(log.totalBreakMinutes)}</Typography>
                    <Typography variant="body2">Late: {log.isLate ? 'Yes' : 'No'}</Typography>
                  </Box>
                )}
              </Box>
            );
          })()}
        </DialogContent>
      </Dialog>
    </Box>
  );
}