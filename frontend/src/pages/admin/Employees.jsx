import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, MenuItem, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, IconButton, InputAdornment, CircularProgress, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import StatusChip from '../../components/common/StatusChip';
import api from '../../api/axios';

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/employees', {
      params: { search: search || undefined, status: status || undefined, employmentType: type || undefined },
    });
    setEmployees(data.employees);
    setLoading(false);
  }, [search, status, type]);

  useEffect(() => {
    api.get('/employment-types').then(({ data }) => setEmploymentTypes(data.employmentTypes));
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300); // debounce search
    return () => clearTimeout(t);
  }, [load]);

  const handleDelete = async () => {
    await api.delete(`/employees/${confirmDelete._id}`);
    setConfirmDelete(null);
    load();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={800}>Employees</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/admin/employees/new')}>
          Add Employee
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by name, email, ID, designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 280 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <TextField size="small" select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>
        <TextField size="small" select label="Employment Type" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="">All</MenuItem>
          {employmentTypes.map((t) => (
            <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Paper variant="outlined">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Employment Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp._id} hover>
                  <TableCell>{emp.employeeId}</TableCell>
                  <TableCell>{emp.fullName}</TableCell>
                  <TableCell>{emp.designation}</TableCell>
                  <TableCell>{emp.employmentType?.name || '-'}</TableCell>
                  <TableCell><StatusChip label={emp.status} /></TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Profile">
                      <IconButton size="small" component={Link} to={`/admin/employees/${emp._id}`}><VisibilityIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" component={Link} to={`/admin/employees/${emp._id}/edit`}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setConfirmDelete(emp)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No employees found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <b>{confirmDelete?.fullName}</b>? This will also remove their login account. This cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
