import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Box, Typography, Grid } from '@mui/material';
import { Title } from 'react-admin';
import { useDataProvider } from 'react-admin';
import PeopleIcon from '@mui/icons-material/People';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import BookIcon from '@mui/icons-material/Book';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const StatCard = ({ title, value, icon, color }) => (
  <Card elevation={1}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="subtitle2" color="textSecondary">
            {title}
          </Typography>
          <Typography variant="h4" component="h2">
            {value}
          </Typography>
        </Box>
        <Box sx={{ 
          backgroundColor: `${color}15`, 
          borderRadius: '50%', 
          width: 48, 
          height: 48, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          {React.cloneElement(icon, { sx: { color: color } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const dataProvider = useDataProvider();
  const [state, setState] = useState({
    users: 0,
    tickets: 0,
    bookings: 0,
    vehicles: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { total: users }, 
          { total: tickets }, 
          { total: bookings }, 
          { total: vehicles }
        ] = await Promise.all([
          dataProvider.getList('users', { 
            pagination: { page: 1, perPage: 1 }, 
            sort: { field: 'id', order: 'DESC' },
            filter: {} 
          }),
          dataProvider.getList('tickets', { 
            pagination: { page: 1, perPage: 1 }, 
            sort: { field: 'id', order: 'DESC' },
            filter: {} 
          }),
          dataProvider.getList('bookings', { 
            pagination: { page: 1, perPage: 1 }, 
            sort: { field: 'id', order: 'DESC' },
            filter: {} 
          }),
          dataProvider.getList('vehicles', { 
            pagination: { page: 1, perPage: 1 }, 
            sort: { field: 'id', order: 'DESC' },
            filter: {} 
          }),
        ]);

        setState({
          users,
          tickets,
          bookings,
          vehicles,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState(state => ({ ...state, loading: false, error }));
      }
    };

    fetchData();
  }, [dataProvider]);

  if (state.loading) return <Box p={2}>Loading...</Box>;
  if (state.error) return <Box p={2}>Error loading dashboard data</Box>;

  return (
    <Box p={3}>
      <Title title="Dashboard" />
      <Typography variant="h5" component="h2" gutterBottom>
        LimoGo Admin Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ marginTop: 1, marginBottom: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Users" 
            value={state.users} 
            icon={<PeopleIcon />} 
            color="#1976d2" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Tickets" 
            value={state.tickets} 
            icon={<ConfirmationNumberIcon />} 
            color="#4caf50" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Bookings" 
            value={state.bookings} 
            icon={<BookIcon />} 
            color="#ff9800" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Vehicles" 
            value={state.vehicles} 
            icon={<DirectionsCarIcon />} 
            color="#f44336" 
          />
        </Grid>
      </Grid>
      
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      <Card>
        <CardContent>
          <Typography>
            Welcome to the LimoGo Admin Dashboard. Use the navigation menu to manage all resources.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};