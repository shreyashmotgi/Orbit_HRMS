import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import api from '../../api/axios';

export default function EmployeeHolidays() {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    api.get('/holidays', { params: { year: new Date().getFullYear() } }).then(({ data }) => setHolidays(data.holidays));
  }, []);

  const isPast = (d) => new Date(d) < new Date().setHours(0, 0, 0, 0);

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>Holidays {new Date().getFullYear()}</Typography>
      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Holiday</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holidays.map((h) => (
              <TableRow key={h._id} hover>
                <TableCell>{new Date(h.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{h.name}</TableCell>
                <TableCell>{h.description}</TableCell>
                <TableCell align="right">
                  <Chip size="small" label={isPast(h.date) ? 'Past' : 'Upcoming'} color={isPast(h.date) ? 'default' : 'primary'} variant={isPast(h.date) ? 'outlined' : 'filled'} />
                </TableCell>
              </TableRow>
            ))}
            {holidays.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No holidays announced yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
