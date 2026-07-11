import { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Alert, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function ReadOnlyField({ label, value }) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={600}>{value ?? '-'}</Typography>
    </Grid>
  );
}

export default function Profile() {
  const { user, profile } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || user?.phoneNumber || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError(''); setProfileMsg('');
    setSavingProfile(true);
    try {
      await api.put('/auth/profile', { phoneNumber });
      setProfileMsg('Profile updated successfully. Changes will fully reflect after your next login.');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError(''); setPwMsg('');
    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation do not match');
      return;
    }
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPwMsg('Password changed successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <Box maxWidth={700}>
      <Typography variant="h5" fontWeight={800} gutterBottom>My Profile</Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Account Details</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {user.role === 'employee' && <ReadOnlyField label="Employee ID" value={profile?.employeeId} />}
          <ReadOnlyField label="Full Name" value={user.name} />
          <ReadOnlyField label="Email" value={user.email} />
          <ReadOnlyField label="Role" value={user.role === 'admin' ? 'Admin' : 'Employee'} />
          {user.role === 'employee' && <ReadOnlyField label="Date of Joining" value={profile?.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : '-'} />}
          {user.role === 'employee' && <ReadOnlyField label="Designation" value={profile?.designation} />}
          {user.role === 'employee' && <ReadOnlyField label="Employment Type" value={profile?.employmentType?.name} />}
          {user.role === 'employee' && <ReadOnlyField label="Monthly Salary" value={profile?.monthlySalary ? `Rs. ${profile.monthlySalary.toLocaleString()}` : '-'} />}
          {user.role === 'employee' && <ReadOnlyField label="Reporting Manager" value={profile?.reportingManager?.fullName || 'None'} />}
          {user.role === 'employee' && <ReadOnlyField label="Account Status" value={profile?.status} />}
        </Grid>

        {user.role === 'employee' && (
  <>
    <Divider sx={{ my: 2 }} />
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      Editable — Personal Information
    </Typography>
    {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}
    {profileMsg && <Alert severity="success" sx={{ mb: 2 }}>{profileMsg}</Alert>}
    <Box component="form" onSubmit={handleProfileSave} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <TextField label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} sx={{ flex: 1 }} />
      <Button type="submit" variant="contained" disabled={savingProfile} sx={{ mt: 0.3 }}>
        {savingProfile ? 'Saving...' : 'Save'}
      </Button>
    </Box>
  </>
)}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Change Password</Typography>
        {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
        {pwMsg && <Alert severity="success" sx={{ mb: 2 }}>{pwMsg}</Alert>}
        <Box component="form" onSubmit={handlePasswordChange}>
          <TextField label="Current Password" type="password" fullWidth margin="normal" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <TextField label="New Password" type="password" fullWidth margin="normal" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <TextField label="Confirm New Password" type="password" fullWidth margin="normal" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <Button type="submit" variant="contained" sx={{ mt: 1 }} disabled={savingPw}>
            {savingPw ? 'Updating...' : 'Update Password'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}