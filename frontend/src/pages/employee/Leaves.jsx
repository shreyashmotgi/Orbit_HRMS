import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Button, TextField, MenuItem, Table, TableHead,
  TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, FormControlLabel, Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StatusChip from '../../components/common/StatusChip';
import api from '../../api/axios';

const emptyForm = { leaveType: '', fromDate: '', toDate: '', isHalfDay: false, halfDaySession: 'First Half', reason: '' };

export default function EmployeeLeaves() {
  const [balance, setBalance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/leaves/my/balance').then(({ data }) => {
      setBalance(data.balance);
      setLeaveTypes(data.balance.map((b) => b.leaveType));
    });
    api.get('/leaves/my').then(({ data }) => setLeaves(data.leaves));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, toDate: form.isHalfDay ? form.fromDate : form.toDate };
      await api.post('/leaves', payload);
      setDialogOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>My Leaves</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>Apply for Leave</Button>
      </Box>

      <Typography variant="subtitle1" fontWeight={700} gutterBottom>Leave Balance</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {balance.map((b) => (
          <Grid item xs={12} sm={6} md={4} key={b.leaveType}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">{b.leaveType}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Box><Typography variant="caption" color="text.secondary">Available</Typography><Typography fontWeight={700}>{b.available}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Used</Typography><Typography fontWeight={700}>{b.used}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Remaining</Typography><Typography fontWeight={700} color="primary.main">{b.remaining}</Typography></Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="subtitle1" fontWeight={700} gutterBottom>My Requests</Typography>
      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Leave Type</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaves.map((l) => (
              <TableRow key={l._id} hover>
                <TableCell>{l.leaveType}{l.isHalfDay ? ` (${l.halfDaySession})` : ''}</TableCell>
                <TableCell>{fmtDate(l.fromDate)}</TableCell>
                <TableCell>{fmtDate(l.toDate)}</TableCell>
                <TableCell>{l.totalDays}</TableCell>
                <TableCell sx={{ maxWidth: 220 }}>{l.reason}</TableCell>
                <TableCell><StatusChip label={l.status} /></TableCell>
              </TableRow>
            ))}
            {leaves.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No leave requests yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField select label="Leave Type" fullWidth margin="normal" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
            {leaveTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <FormControlLabel
            control={<Checkbox checked={form.isHalfDay} onChange={(e) => setForm({ ...form, isHalfDay: e.target.checked })} />}
            label="Half Day Leave"
          />
          {form.isHalfDay && (
            <TextField select label="Session" fullWidth margin="normal" value={form.halfDaySession} onChange={(e) => setForm({ ...form, halfDaySession: e.target.value })}>
              <MenuItem value="First Half">First Half</MenuItem>
              <MenuItem value="Second Half">Second Half</MenuItem>
            </TextField>
          )}
          <TextField
            label={form.isHalfDay ? 'Date' : 'From Date'}
            type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }}
            value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
          />
          {!form.isHalfDay && (
            <TextField
              label="To Date" type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }}
              value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })}
            />
          )}
          <TextField label="Reason" fullWidth multiline rows={2} margin="normal" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>{saving ? 'Submitting...' : 'Submit Request'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
