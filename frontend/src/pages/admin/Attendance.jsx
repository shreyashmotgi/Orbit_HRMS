import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Table, TableHead, TableRow,
  TableCell, TableBody, CircularProgress, Button,
} from '@mui/material';
import StatusChip from '../../components/common/StatusChip';
import api from '../../api/axios';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AdminAttendance() {
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState('');
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/employees').then(({ data }) => setEmployees(data.employees));
  }, []);

  const load = () => {
    setLoading(true);
    api.get('/attendance', { params: { employee: employee || undefined, month, year } })
      .then(({ data }) => setLogs(data.logs))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [employee, month, year]); 
  const totals = logs.reduce(
    (acc, l) => {
      if (l.status === 'Present') acc.present += 1;
      else if (l.status === 'Half Day') acc.halfDay += 1;
      else acc.absent += 1;
      if (l.isLate) acc.late += 1;
      return acc;
    },
    { present: 0, halfDay: 0, absent: 0, late: 0 }
  );

  const fmtTime = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fmtHours = (mins) => `${Math.floor(mins / 60)}h ${Math.round(mins % 60)}m`;

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>Attendance</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField select size="small" label="Employee" value={employee} onChange={(e) => setEmployee(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="">All Employees</MenuItem>
          {employees.map((e) => <MenuItem key={e._id} value={e._id}>{e.fullName} ({e.employeeId})</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Month" value={month} onChange={(e) => setMonth(Number(e.target.value))} sx={{ minWidth: 150 }}>
          {MONTHS.map((m, i) => <MenuItem key={m} value={i + 1}>{m}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))} sx={{ minWidth: 120 }}>
          {[now.getFullYear(), now.getFullYear() - 1].map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </TextField>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: 'Present Days', value: totals.present, color: 'success.main' },
          { label: 'Half Days', value: totals.halfDay, color: 'warning.main' },
          { label: 'Absent Days', value: totals.absent, color: 'error.main' },
          { label: 'Late Marks', value: totals.late, color: 'info.main' },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={800} color={s.color}>{s.value}</Typography>
              <Typography variant="body2" color="text.secondary">{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper variant="outlined">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Punches</TableCell>
                <TableCell>Working Hours</TableCell>
                <TableCell>Break</TableCell>
                <TableCell>Late</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id} hover>
                  <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                  <TableCell>{log.employee?.fullName} ({log.employee?.employeeId})</TableCell>
                  <TableCell>{log.punches.map((p) => `${p.type === 'in' ? 'In' : 'Out'} ${fmtTime(p.time)}`).join(', ')}</TableCell>
                  <TableCell>{fmtHours(log.totalWorkingMinutes)}</TableCell>
                  <TableCell>{fmtHours(log.totalBreakMinutes)}</TableCell>
                  <TableCell>{log.isLate ? 'Yes' : 'No'}</TableCell>
                  <TableCell><StatusChip label={log.status} /></TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>No attendance records found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
