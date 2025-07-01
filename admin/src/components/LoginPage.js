import React from 'react';
import { Login, LoginForm } from 'react-admin';
import { Typography, Box, Card } from '@mui/material';

const CustomLoginForm = (props) => (
  <Box sx={{ pt: 2 }}>
    <Card sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          LimoGo Admin
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Login to access the admin panel
        </Typography>
      </Box>
      <LoginForm {...props} />
    </Card>
  </Box>
);

export const LoginPage = (props) => (
  <Login
    {...props}
    backgroundImage="/admin-background.jpg"
    sx={{
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    <CustomLoginForm />
  </Login>
);