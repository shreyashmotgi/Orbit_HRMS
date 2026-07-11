import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import api from '../../api/axios';

const emptyForm = { name: '', date: '', description: '' };

export default function AdminHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.get('/holidays', { params: { year: new Date().getFullYear() } }).then(({ data }) => setHolidays(data.holidays));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (h) => { setEditing(h); setForm({ name: h.name, date: h.date.slice(0, 10), description: h.description || '' }); setDialogOpen(true); };

  const handleSave = async () => {
    if (editing) await api.put(`/holidays/${editing._id}`, form);
    else await api.post('/holidays', form);
    setDialogOpen(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this holiday?')) return;
    await api.delete(`/holidays/${id}`);
    load();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>Holidays</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Holiday</Button>
      </Box>

      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holidays.map((h) => (
              <TableRow key={h._id} hover>
                <TableCell>{new Date(h.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                <TableCell>{h.name}</TableCell>
                <TableCell>{h.description}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(h)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(h._id)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {holidays.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No holidays added yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>
        <DialogContent>
          <TextField label="Holiday Name" fullWidth margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Date" type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <TextField label="Description (optional)" fullWidth margin="normal" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
