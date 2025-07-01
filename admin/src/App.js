import React from 'react';
import { Admin, Resource, Layout, AppBar, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Data providers
import dataProvider from './dataProvider';
import authProvider from './authProvider';

// Import CRUD components
import { UserList, UserEdit, UserCreate, UserShow } from './components/users';
import { StationList, StationEdit, StationCreate, StationShow } from './components/stations';
import { BookingList, BookingEdit, BookingShow } from './components/bookings';
import { ProviderList, ProviderEdit, ProviderCreate, ProviderShow } from './components/providers';
import { VehicleList, VehicleEdit, VehicleCreate, VehicleShow } from './components/vehicles';
import { DriverList, DriverEdit, DriverCreate, DriverShow } from './components/drivers';

// Import icons
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RouteIcon from '@mui/icons-material/Route';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PersonIcon from '@mui/icons-material/Person';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

// Custom theme with mobile-friendly settings
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    // Make components more mobile-friendly
    MuiDataGrid: {
      styleOverrides: {
        root: {
          '& .RaDatagrid-table': {
            minWidth: '100%',
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
          '@media (max-width: 600px)': {
            padding: '4px 8px',
            fontSize: '0.75rem',
          },
        },
      },
    },
  },
});

// Custom AppBar with title
const MyAppBar = (props) => <AppBar {...props} title="LimoGo Admin Panel" />;

// Custom Layout
const MyLayout = (props) => <Layout {...props} appBar={MyAppBar} />;

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Admin 
      dataProvider={dataProvider} 
      authProvider={authProvider}
      layout={MyLayout}
      title="LimoGo Admin"
    >
      {/* User Management */}
      <Resource 
        name="users" 
        list={UserList} 
        edit={UserEdit} 
        create={UserCreate} 
        show={UserShow}
        icon={PeopleIcon}
        options={{ label: 'Người dùng' }}
      />
      
      {/* Provider Management */}
      <Resource 
        name="providers" 
        list={ProviderList} 
        edit={ProviderEdit} 
        create={ProviderCreate} 
        show={ProviderShow}
        icon={BusinessIcon}
        options={{ label: 'Nhà xe' }}
      />
      
      {/* Station Management */}
      <Resource 
        name="stations" 
        list={StationList} 
        edit={StationEdit} 
        create={StationCreate} 
        show={StationShow}
        icon={LocationOnIcon}
        options={{ label: 'Bến xe' }}
      />
      
      {/* Route Management */}
      <Resource 
        name="routes" 
        list={ListGuesser} 
        edit={EditGuesser} 
        create={EditGuesser} 
        show={ShowGuesser}
        icon={RouteIcon}
        options={{ label: 'Tuyến đường' }}
      />
      
      {/* Vehicle Management */}
      <Resource 
        name="vehicles" 
        list={VehicleList} 
        edit={VehicleEdit} 
        create={VehicleCreate} 
        show={VehicleShow}
        icon={DirectionsBusIcon}
        options={{ label: 'Xe' }}
      />
      
      {/* Driver Management */}
      <Resource 
        name="drivers" 
        list={DriverList} 
        edit={DriverEdit} 
        create={DriverCreate} 
        show={DriverShow}
        icon={PersonIcon}
        options={{ label: 'Tài xế' }}
      />
      
      {/* Trip Management */}
      <Resource 
        name="trips" 
        list={ListGuesser} 
        edit={EditGuesser} 
        create={EditGuesser} 
        show={ShowGuesser}
        icon={TripOriginIcon}
        options={{ label: 'Chuyến đi' }}
      />
      
      {/* Booking Management */}
      <Resource 
        name="bookings" 
        list={BookingList} 
        edit={BookingEdit} 
        show={BookingShow}
        icon={BookOnlineIcon}
        options={{ label: 'Đặt vé' }}
      />
      
      {/* Issue Management */}
      <Resource 
        name="issues" 
        list={ListGuesser} 
        edit={EditGuesser} 
        create={EditGuesser} 
        show={ShowGuesser}
        icon={ReportProblemIcon}
        options={{ label: 'Sự cố' }}
      />
      
      {/* Review Management */}
      <Resource 
        name="reviews" 
        list={ListGuesser} 
        edit={EditGuesser} 
        create={EditGuesser} 
        show={ShowGuesser}
        icon={RateReviewIcon}
        options={{ label: 'Đánh giá' }}
      />
      
      {/* Ticket Management */}
      <Resource 
        name="tickets" 
        list={ListGuesser} 
        edit={EditGuesser} 
        show={ShowGuesser}
        icon={ConfirmationNumberIcon}
        options={{ label: 'Vé' }}
      />
    </Admin>
  </ThemeProvider>
);

export default App;