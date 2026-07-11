import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import BadgeIcon from '@mui/icons-material/BadgeOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailableOutlined';
import BeachAccessIcon from '@mui/icons-material/BeachAccessOutlined';
import CelebrationIcon from '@mui/icons-material/CelebrationOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 250;

const ADMIN_NAV = [
  { label: 'My Profile', to: '/profile', icon: <PersonIcon /> },
  { label: 'Dashboard', to: '/admin/dashboard', icon: <DashboardIcon /> },
  { label: 'Employees', to: '/admin/employees', icon: <PeopleIcon /> },
  { label: 'Employment Types', to: '/admin/employment-types', icon: <BadgeIcon /> },
  { label: 'Attendance', to: '/admin/attendance', icon: <EventAvailableIcon /> },
  { label: 'Leave Requests', to: '/admin/leaves', icon: <BeachAccessIcon /> },
  { label: 'Holidays', to: '/admin/holidays', icon: <CelebrationIcon /> },
  ];

const EMPLOYEE_NAV = [
  { label: 'My Profile', to: '/profile', icon: <PersonIcon /> },
  { label: 'Dashboard', to: '/employee/dashboard', icon: <DashboardIcon /> },
  { label: 'My Leaves', to: '/employee/leaves', icon: <BeachAccessIcon /> },
  { label: 'Holidays', to: '/employee/holidays', icon: <CelebrationIcon /> },
  ];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const nav = user?.role === 'admin' ? ADMIN_NAV : EMPLOYEE_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3 }}>
        <Typography variant="h6" fontWeight={800} color="primary.main">
          Orbit HRMS
        </Typography>
      </Toolbar>
      <List sx={{ px: 1.5, flexGrow: 1 }}>
        {nav.map((item) => {
          const active = location.pathname === item.to;
          return (
            <ListItemButton
              key={item.to}
              component={Link}
              to={item.to}
              selected={active}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: '1px solid #e5e7eb',
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton sx={{ display: { md: 'none' } }} onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>
            {nav.find((n) => n.to === location.pathname)?.label || ''}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.name}
            </Typography>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled>{user?.email}</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none', borderRight: '1px solid #e5e7eb' },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { md: `${DRAWER_WIDTH}px` }, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
