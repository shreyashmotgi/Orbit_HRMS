import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Button, Alert,
} from '@mui/material';
import api from '../../api/axios';

const emptyForm = {
  fullName: '', email: '', password: '', phoneNumber: '', dateOfJoining: '',
  designation: '', monthlySalary: '', employmentType: '', reportingManager: '', status: 'Active',
};

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/employment-types').then(({ data }) => setEmploymentTypes(data.employmentTypes));
    api.get('/employees/managers/list').then(({ data }) => setManagers(data.managers));
    if (isEdit) {
      api.get(`/employees/${id}`).then(({ data }) => {
        const e = data.employee;
        setForm({
          fullName: e.fullName,
          email: e.email,
          password: '',
          phoneNumber: e.phoneNumber,
          dateOfJoining: e.dateOfJoining?.slice(0, 10),
          designation: e.designation,
          monthlySalary: e.monthlySalary,
          employmentType: e.employmentType?._id || '',
          reportingManager: e.reportingManager?._id || '',
          status: e.status,
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        const { password, email, ...payload } = form; // email/password not editable here
        await api.put(`/employees/${id}`, payload);
      } else {
        await api.post('/employees', form);
      }
      navigate('/admin/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box maxWidth={800}>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        {isEdit ? 'Edit Employee' : 'Add Employee'}
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Full Name" fullWidth required value={form.fullName} onChange={handleChange('fullName')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" type="email" fullWidth required disabled={isEdit} value={form.email} onChange={handleChange('email')} />
            </Grid>
            {!isEdit && (
              <Grid item xs={12} sm={6}>
                <TextField label="Password (for employee login)" type="password" fullWidth required value={form.password} onChange={handleChange('password')} />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField label="Phone Number" fullWidth required value={form.phoneNumber} onChange={handleChange('phoneNumber')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Date of Joining" type="date" fullWidth required InputLabelProps={{ shrink: true }} value={form.dateOfJoining} onChange={handleChange('dateOfJoining')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Designation" fullWidth required value={form.designation} onChange={handleChange('designation')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Monthly Salary (Rs.)" type="number" fullWidth required value={form.monthlySalary} onChange={handleChange('monthlySalary')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Employment Type" fullWidth required value={form.employmentType} onChange={handleChange('employmentType')}>
                {employmentTypes.map((t) => <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Reporting Manager (optional)" fullWidth value={form.reportingManager} onChange={handleChange('reportingManager')}>
                <MenuItem value="">None</MenuItem>
                {managers.map((m) => <MenuItem key={m._id} value={m._id}>{m.fullName} ({m.employeeId})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Status" fullWidth value={form.status} onChange={handleChange('status')}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Employee'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/admin/employees')}>Cancel</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
