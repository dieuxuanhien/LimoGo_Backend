// Setup Instructions for LimoGo Admin Panel

## Prerequisites Setup

1. **Node.js Installation**
   - Download and install Node.js (v16 or higher) from https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Backend API Setup**
   - Ensure your LimoGo backend is running on http://localhost:3000
   - Verify API endpoints are accessible
   - Make sure CORS is properly configured to allow requests from http://localhost:3001

## Installation Steps

1. **Navigate to Admin Directory**
   ```bash
   cd c:\Users\hien\Documents\GitHub\LimoGo_Backend\admin
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Create a `.env` file in the admin directory:
   ```
   REACT_APP_API_URL=http://localhost:3000/api
   REACT_APP_NAME=LimoGo Admin Panel
   REACT_APP_VERSION=1.0.0
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```
   - The admin panel will open at http://localhost:3001

## Admin User Setup

1. **Create Admin User** (if not exists)
   - Use your backend API to create a user with `userRole: 'admin'`
   - Or use an existing admin account

2. **Login Credentials**
   - Use admin email and password to login
   - Example: admin@limogo.com / your_password

## Features Available

### 1. Dashboard
- Overview statistics
- Charts and analytics
- Quick access to all modules

### 2. User Management
- View all users (customers, drivers, admins)
- Create new users
- Edit user details
- Delete users
- Filter by role, status, etc.

### 3. Ticket Management
- Manage transportation tickets
- Set pricing and availability
- Schedule departures/arrivals
- Track ticket status

### 4. Booking Management
- View all bookings
- Update booking status
- Cancel bookings
- Customer booking history

### 5. Vehicle Management
- Fleet management
- Vehicle status tracking
- Maintenance scheduling
- Driver assignments

### 6. Route Management
- Configure routes
- Set base pricing
- Manage waypoints
- Route optimization

### 7. Payment Management
- Transaction monitoring
- Payment status tracking
- Refund processing
- Financial reporting

## API Endpoints Used

The admin panel connects to these backend endpoints:

- **Authentication**: `/api/auth/login`
- **Users**: `/api/users` (GET, POST, PUT, DELETE)
- **Tickets**: `/api/tickets` (GET, POST, PUT, DELETE)
- **Bookings**: `/api/bookings` (GET, POST, PUT, DELETE)
- **Vehicles**: `/api/vehicles` (GET, POST, PUT, DELETE)
- **Routes**: `/api/routes` (GET, POST, PUT, DELETE)
- **Payments**: `/api/payments` (GET, POST, PUT, DELETE)

## Troubleshooting

### Common Issues:

1. **Cannot Connect to API**
   - Check if backend server is running
   - Verify API URL in configuration
   - Check CORS settings

2. **Login Issues**
   - Verify admin user exists in database
   - Check userRole is set to 'admin'
   - Ensure JWT_SECRET is configured

3. **Port Conflicts**
   - Admin runs on port 3001 by default
   - Backend should run on port 3000
   - Change ports if needed

4. **Build Issues**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear cache: `npm start -- --reset-cache`

### Performance Tips:

1. **Data Loading**
   - Use pagination for large datasets
   - Implement proper filtering
   - Cache frequently accessed data

2. **Image Optimization**
   - Compress images before upload
   - Use appropriate image formats
   - Implement lazy loading

## Production Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Serve Static Files**
   - Use nginx or Apache to serve the build folder
   - Configure proper routing for SPA
   - Set up SSL certificates

3. **Environment Variables**
   - Update API URL for production
   - Configure proper security settings
   - Set up monitoring and logging

## Security Considerations

1. **Authentication**
   - Use strong JWT secrets
   - implement proper token expiration
   - Enable refresh token mechanism

2. **Authorization**
   - Verify admin roles on backend
   - Implement proper access controls
   - Audit admin actions

3. **Data Protection**
   - Encrypt sensitive data
   - Use HTTPS in production
   - Implement proper input validation

## Support

For technical issues:
1. Check browser console for errors
2. Verify API responses in Network tab
3. Check backend logs for errors
4. Ensure all dependencies are up to date

## Additional Features

### Custom Styling
- Modify `src/theme.js` for custom colors
- Update `src/index.css` for global styles
- Use Material-UI components for consistency

### Adding New Resources
1. Create resource file in `src/resources/`
2. Add to `src/App.js`
3. Configure API endpoints
4. Add appropriate icons and labels

### Extending Functionality
- Add new dashboard widgets
- Implement advanced filtering
- Create custom reports
- Add bulk operations