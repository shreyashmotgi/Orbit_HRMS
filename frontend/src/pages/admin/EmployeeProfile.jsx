import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, CircularProgress, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  RadioGroup, FormControlLabel, Radio, Alert, IconButton, Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/EditOutlined';
import LockResetIcon from '@mui/icons-material/LockResetOutlined';
import StatusChip from '../../components/common/StatusChip';
import api from '../../api/axios';

function Field({ label, value }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={600}>{value ?? '-'}</Typography>
    </Box>
  );
}

export default function EmployeeProfile() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);

  // Reset-password dialog state - lives here (not inside Field), since this
  // component is the one that has `id` and renders the dialog.
  const [resetOpen, setResetOpen] = useState(false);
  const [mode, setMode] = useState('random');
  const [customPassword, setCustomPassword] = useState('');
  const [resultPassword, setResultPassword] = useState('');

  useEffect(() => {
    api.get(`/employees/${id}`).then(({ data }) => setEmployee(data.employee));
  }, [id]);

  const handleReset = async () => {
    const { data } = await api.put(
      `/employees/${id}/reset-password`,
      mode === 'custom' ? { newPassword: customPassword } : {}
    );
    setResultPassword(data.temporaryPassword);
  };

  if (!employee) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
  }

  return (
    <Box maxWidth={800}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>{employee.fullName}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Reset Password">
            <IconButton onClick={() => { setResetOpen(true); setResultPassword(''); }}>
              <LockResetIcon />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" startIcon={<EditIcon />} component={Link} to={`/admin/employees/${id}/edit`}>
            Edit
          </Button>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><Field label="Employee ID" value={employee.employeeId} /></Grid>
          <Grid item xs={12} sm={4}><Field label="Email" value={employee.email} /></Grid>
          <Grid item xs={12} sm={4}><Field label="Phone Number" value={employee.phoneNumber} /></Grid>
          <Grid item xs={12} sm={4}><Field label="Designation" value={employee.designation} /></Grid>
          <Grid item xs={12} sm={4}><Field label="Date of Joining" value={new Date(employee.dateOfJoining).toLocaleDateString()} /></Grid>
          <Grid item xs={12} sm={4}><Field label="Monthly Salary" value={`Rs. ${employee.monthlySalary.toLocaleString()}`} /></Grid>
          <Grid item xs={12} sm={4}><Field label="Employment Type" value={employee.employmentType?.name} /></Grid>
          <Grid item xs={12} sm={4}><Field label="Reporting Manager" value={employee.reportingManager ? `${employee.reportingManager.fullName} (${employee.reportingManager.employeeId})` : 'None'} /></Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Box sx={{ mt: 0.5 }}><StatusChip label={employee.status} /></Box>
          </Grid>
        </Grid>

        {employee.employmentType?.leavePolicy?.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Leave Policy ({employee.employmentType.name})</Typography>
            <Grid container spacing={1}>
              {employee.employmentType.leavePolicy.map((p) => (
                <Grid item xs={6} sm={4} key={p.leaveType}>
                  <Typography variant="body2" color="text.secondary">{p.leaveType}</Typography>
                  <Typography variant="body1" fontWeight={600}>{p.annualDays >= 999 ? 'Unlimited' : `${p.annualDays} days/year`}</Typography>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Paper>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Reset Password — {employee.fullName}</DialogTitle>
        <DialogContent>
          {resultPassword ? (
            <Alert severity="success">
              New temporary password: <b>{resultPassword}</b><br />
              Share this with the employee securely — they should change it immediately after logging in.
            </Alert>
          ) : (
            <>
              <RadioGroup value={mode} onChange={(e) => setMode(e.target.value)}>
                <FormControlLabel value="random" control={<Radio />} label="Generate random temporary password" />
                <FormControlLabel value="custom" control={<Radio />} label="Set a specific password" />
              </RadioGroup>
              {mode === 'custom' && (
                <TextField label="New Password" fullWidth margin="normal" value={customPassword} onChange={(e) => setCustomPassword(e.target.value)} />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>{resultPassword ? 'Close' : 'Cancel'}</Button>
          {!resultPassword && <Button variant="contained" onClick={handleReset}>Reset Password</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
}