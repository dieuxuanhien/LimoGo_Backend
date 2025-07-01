import React from 'react';
import { Admin, Resource } from 'react-admin';
import { ThemeProvider } from '@mui/material/styles';
import { Dashboard } from './components/Dashboard';
import dataProvider from './providers/dataProvider';
import authProvider from './providers/authProvider';
import { LoginPage } from './components/LoginPage';
import { theme } from './theme';

// Import resource components
import { UserList, UserEdit, UserCreate, UserShow } from './resources/users';
import { TicketList, TicketEdit, TicketCreate, TicketShow } from './resources/tickets';
import { BookingList, BookingEdit, BookingCreate, BookingShow } from './resources/bookings';
import { VehicleList, VehicleEdit, VehicleCreate, VehicleShow } from './resources/vehicles';
import { RouteList, RouteEdit, RouteCreate, RouteShow } from './resources/routes';
import { PaymentList, PaymentEdit, PaymentCreate, PaymentShow } from './resources/payments';
import { TripList, TripEdit, TripCreate, TripShow } from './resources/trips';
import { DriverList, DriverEdit, DriverCreate, DriverShow } from './resources/drivers';
import { StationList, StationEdit, StationCreate, StationShow } from './resources/stations';
import { ProviderList, ProviderEdit, ProviderCreate, ProviderShow } from './resources/providers';
import { ReviewList, ReviewEdit, ReviewCreate, ReviewShow } from './resources/reviews';
import { IssueList, IssueEdit, IssueCreate, IssueShow } from './resources/issues';

// Import icons
import PeopleIcon from '@mui/icons-material/People';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import BookIcon from '@mui/icons-material/Book';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RouteIcon from '@mui/icons-material/Route';
import PaymentIcon from '@mui/icons-material/Payment';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import StarIcon from '@mui/icons-material/Star';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        dashboard={Dashboard}
        loginPage={LoginPage}
        title="LimoGo Admin Panel"
      >
        <Resource 
          name="users" 
          list={UserList} 
          edit={UserEdit} 
          create={UserCreate} 
          show={UserShow}
          icon={PeopleIcon}
          options={{ label: 'Users' }}
        />
        <Resource 
          name="tickets" 
          list={TicketList} 
          edit={TicketEdit} 
          create={TicketCreate} 
          show={TicketShow}
          icon={ConfirmationNumberIcon}
          options={{ label: 'Tickets' }}
        />
        <Resource 
          name="bookings" 
          list={BookingList} 
          edit={BookingEdit} 
          create={BookingCreate} 
          show={BookingShow}
          icon={BookIcon}
          options={{ label: 'Bookings' }}
        />
        <Resource 
          name="vehicles" 
          list={VehicleList} 
          edit={VehicleEdit} 
          create={VehicleCreate} 
          show={VehicleShow}
          icon={DirectionsCarIcon}
          options={{ label: 'Vehicles' }}
        />
        <Resource 
          name="routes" 
          list={RouteList} 
          edit={RouteEdit} 
          create={RouteCreate} 
          show={RouteShow}
          icon={RouteIcon}
          options={{ label: 'Routes' }}
        />
        <Resource 
          name="payments" 
          list={PaymentList} 
          edit={PaymentEdit} 
          create={PaymentCreate} 
          show={PaymentShow}
          icon={PaymentIcon}
          options={{ label: 'Payments' }}
        />
        <Resource 
          name="trips" 
          list={TripList} 
          edit={TripEdit} 
          create={TripCreate} 
          show={TripShow}
          icon={DirectionsBusIcon}
          options={{ label: 'Trips' }}
        />
        <Resource 
          name="drivers" 
          list={DriverList} 
          edit={DriverEdit} 
          create={DriverCreate} 
          show={DriverShow}
          icon={PersonIcon}
          options={{ label: 'Drivers' }}
        />
        <Resource 
          name="stations" 
          list={StationList} 
          edit={StationEdit} 
          create={StationCreate} 
          show={StationShow}
          icon={LocationOnIcon}
          options={{ label: 'Stations' }}
        />
        <Resource 
          name="providers" 
          list={ProviderList} 
          edit={ProviderEdit} 
          create={ProviderCreate} 
          show={ProviderShow}
          icon={BusinessIcon}
          options={{ label: 'Providers' }}
        />
        <Resource 
          name="reviews" 
          list={ReviewList} 
          edit={ReviewEdit} 
          create={ReviewCreate} 
          show={ReviewShow}
          icon={StarIcon}
          options={{ label: 'Reviews' }}
        />
        <Resource 
          name="issues" 
          list={IssueList} 
          edit={IssueEdit} 
          create={IssueCreate} 
          show={IssueShow}
          icon={ReportProblemIcon}
          options={{ label: 'Issues' }}
        />
      </Admin>
    </ThemeProvider>
  );
}

export default App;