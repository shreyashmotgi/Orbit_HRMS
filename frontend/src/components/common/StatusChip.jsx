import { Chip } from '@mui/material';

const COLOR_MAP = {
  Active: 'success',
  Inactive: 'default',
  Present: 'success',
  Absent: 'error',
  'Half Day': 'warning',
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error',
  Processed: 'success',
};

export default function StatusChip({ label, size = 'small' }) {
  return <Chip label={label} color={COLOR_MAP[label] || 'default'} size={size} variant={COLOR_MAP[label] ? 'filled' : 'outlined'} />;
}
