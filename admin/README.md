# LimoGo Admin Panel

A comprehensive admin dashboard for managing the LimoGo luxury transportation service.

## Features

- **User Management**: View, create, edit, and delete users with role-based access
- **Ticket Management**: Manage transportation tickets and schedules
- **Booking Management**: Track and manage customer bookings
- **Vehicle Management**: Maintain fleet information and status
- **Route Management**: Configure transportation routes and pricing
- **Payment Management**: Monitor payment transactions and status
- **Dashboard Analytics**: Visual insights into business performance

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Access to the LimoGo backend API

### Installation

1. Navigate to the admin directory:
   ```bash
   cd admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3001](http://localhost:3001) to view the admin panel

### Login Credentials

Use your admin account credentials to access the panel. The system supports role-based authentication with admin-level access required.

## API Configuration

The admin panel connects to the backend API at `http://localhost:3000/api`. If your backend runs on a different port or domain, update the configuration in:

- `src/providers/dataProvider.js`
- `src/providers/authProvider.js`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (not recommended)

## Architecture

The admin panel is built using:

- **React Admin**: Framework for admin interfaces
- **Material-UI**: UI component library
- **Recharts**: Charts and data visualization
- **React**: Frontend framework

## File Structure

```
admin/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Dashboard.js
│   │   └── LoginPage.js
│   ├── providers/
│   │   ├── authProvider.js
│   │   └── dataProvider.js
│   ├── resources/
│   │   ├── users.js
│   │   ├── tickets.js
│   │   ├── bookings.js
│   │   ├── vehicles.js
│   │   ├── routes.js
│   │   └── payments.js
│   ├── App.js
│   ├── index.js
│   └── index.css
└── package.json
```

## Contributing

1. Follow the existing code structure and naming conventions
2. Test your changes thoroughly
3. Update documentation as needed
4. Ensure all CRUD operations work correctly with the backend API

## Support

For issues related to the admin panel, check the browser console for errors and verify API connectivity.
