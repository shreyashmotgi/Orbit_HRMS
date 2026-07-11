import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, Grid, TextField, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Divider, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import api from '../../api/axios';

export default function EmploymentTypes() {
  const [types, setTypes] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newType, setNewType] = useState({ name: '', description: '' });
  const [policyDialogFor, setPolicyDialogFor] = useState(null); 
  const [policyDraft, setPolicyDraft] = useState([]);
  const [error, setError] = useState('');

  const load = () => api.get('/employment-types').then(({ data }) => setTypes(data.employmentTypes));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setError('');
    try {
      await api.post('/employment-types', newType);
      setCreateOpen(false);
      setNewType({ name: '', description: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this employment type?')) return;
    try {
      await api.delete(`/employment-types/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const openPolicyEditor = (type) => {
    setPolicyDialogFor(type);
    setPolicyDraft(type.leavePolicy.length ? [...type.leavePolicy] : [{ leaveType: '', annualDays: 0 }]);
  };

  const savePolicy = async () => {
    const cleaned = policyDraft.filter((p) => p.leaveType.trim());
    await api.put(`/employment-types/${policyDialogFor._id}/leave-policy`, { leavePolicy: cleaned });
    setPolicyDialogFor(null);
    load();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>Employment Types & Leave Policies</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>Add Type</Button>
      </Box>

      <Grid container spacing={2}>
        {types.map((t) => (
          <Grid item xs={12} sm={6} md={4} key={t._id}>
            <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h6" fontWeight={700}>{t.name}</Typography>
                <Box>
                  <IconButton size="small" onClick={() => openPolicyEditor(t)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(t._id)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              </Box>
              {t.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{t.description}</Typography>}
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="text.secondary">Leave Policy</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {t.leavePolicy.length === 0 && <Typography variant="body2" color="text.secondary">No leave policy set</Typography>}
                {t.leavePolicy.map((p) => (
                  <Chip key={p.leaveType} size="small" label={`${p.leaveType}: ${p.annualDays >= 999 ? 'Unlimited' : p.annualDays}`} />
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Employment Type</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField label="Name (e.g. Full Time)" fullWidth margin="normal" value={newType.name} onChange={(e) => setNewType({ ...newType, name: e.target.value })} />
          <TextField label="Description (optional)" fullWidth margin="normal" value={newType.description} onChange={(e) => setNewType({ ...newType, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Leave Policy Editor Dialog */}
      <Dialog open={!!policyDialogFor} onClose={() => setPolicyDialogFor(null)} fullWidth maxWidth="sm">
        <DialogTitle>Leave Policy — {policyDialogFor?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set annual day allowance per leave type. Use 999 to represent "Unlimited".
          </Typography>
          {policyDraft.map((item, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center' }}>
              <TextField
                label="Leave Type"
                size="small"
                value={item.leaveType}
                onChange={(e) => {
                  const next = [...policyDraft];
                  next[idx].leaveType = e.target.value;
                  setPolicyDraft(next);
                }}
                sx={{ flex: 2 }}
              />
              <TextField
                label="Annual Days"
                type="number"
                size="small"
                value={item.annualDays}
                onChange={(e) => {
                  const next = [...policyDraft];
                  next[idx].annualDays = Number(e.target.value);
                  setPolicyDraft(next);
                }}
                sx={{ flex: 1 }}
              />
              <IconButton size="small" color="error" onClick={() => setPolicyDraft(policyDraft.filter((_, i) => i !== idx))}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={() => setPolicyDraft([...policyDraft, { leaveType: '', annualDays: 0 }])}>
            Add Leave Type
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPolicyDialogFor(null)}>Cancel</Button>
          <Button variant="contained" onClick={savePolicy}>Save Policy</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
