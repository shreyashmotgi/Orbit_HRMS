import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button,
  MenuItem, TextField, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import StatusChip from '../../components/common/StatusChip';
import api from '../../api/axios';

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState(null);
  const [remarks, setRemarks] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/leaves', { params: { status: status || undefined } })
      .then(({ data }) => setLeaves(data.leaves))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]); 

  const confirmAction = async () => {
    await api.put(`/leaves/${actionTarget.leave._id}/status`, { status: actionTarget.decision, remarks });
    setActionTarget(null);
    setRemarks('');
    load();
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>Leave Requests</Typography>
        <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Approved">Approved</MenuItem>
          <MenuItem value="Rejected">Rejected</MenuItem>
        </TextField>
      </Box>

      <Paper variant="outlined">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((l) => (
                <TableRow key={l._id} hover>
                  <TableCell>{l.employee?.fullName} ({l.employee?.employeeId})</TableCell>
                  <TableCell>{l.leaveType}{l.isHalfDay ? ` (${l.halfDaySession})` : ''}</TableCell>
                  <TableCell>{fmtDate(l.fromDate)}</TableCell>
                  <TableCell>{fmtDate(l.toDate)}</TableCell>
                  <TableCell>{l.totalDays}</TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>{l.reason}</TableCell>
                  <TableCell><StatusChip label={l.status} /></TableCell>
                  <TableCell align="right">
                    {l.status === 'Pending' ? (
                      <>
                        <Button size="small" color="success" onClick={() => setActionTarget({ leave: l, decision: 'Approved' })}>Approve</Button>
                        <Button size="small" color="error" onClick={() => setActionTarget({ leave: l, decision: 'Rejected' })}>Reject</Button>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        {l.status} {l.actionedAt ? `on ${fmtDate(l.actionedAt)}` : ''}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {leaves.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>No leave requests found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={!!actionTarget} onClose={() => setActionTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>{actionTarget?.decision} Leave Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {actionTarget?.leave.employee?.fullName} — {actionTarget?.leave.leaveType} ({actionTarget?.leave.totalDays} day(s))
          </Typography>
          <TextField label="Remarks (optional)" fullWidth multiline rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionTarget(null)}>Cancel</Button>
          <Button variant="contained" color={actionTarget?.decision === 'Approved' ? 'success' : 'error'} onClick={confirmAction}>
            Confirm {actionTarget?.decision}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
