import React, { useState, useEffect } from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  ReferenceField,
  DateField,
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  ReferenceInput,
  SelectInput,
  Create,
  Show,
  SimpleShowLayout,
  Filter,
  DateTimeInput,
  useGetMany,
  Loading,
  useGetList
} from 'react-admin';

// Enhanced RouteSelectInput component that fetches station data
const RouteSelectInput = props => {
  const [stations, setStations] = useState({});
  const { data: stationsData, isLoading } = useGetList(
    'stations',
    { 
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'name', order: 'ASC' }
    }
  );
  
  useEffect(() => {
    if (stationsData) {
      const stationsMap = {};
      Object.keys(stationsData).forEach(key => {
        const station = stationsData[key];
        stationsMap[station.id] = station;
      });
      setStations(stationsMap);
    }
  }, [stationsData]);

  return isLoading ? (
    <Loading />
  ) : (
    <SelectInput
      {...props}
      optionText={(record) => {
        if (!record) return '';
        
        // Case 1: Fully populated objects
        if (record.originStation && typeof record.originStation === 'object' && 
            record.destinationStation && typeof record.destinationStation === 'object') {
          return `${record.originStation.name} → ${record.destinationStation.name}`;
        }
        
        // Case 2: We have station IDs and our station cache
        if (record.originStation && record.destinationStation && 
            stations[record.originStation] && stations[record.destinationStation]) {
          return `${stations[record.originStation].name} → ${stations[record.destinationStation].name}`;
        }
        
        // Fallback: Show route ID or available information
        return `Route ${record.id || record._id}`;
      }}
    />
  );
};

// Original RouteNameField component
const RouteNameField = ({ record }) => {
  if (!record || !record.route) return null;
  
  // If route is already populated with station information
  if (
    record.route.originStation && 
    typeof record.route.originStation === 'object' && 
    record.route.destinationStation && 
    typeof record.route.destinationStation === 'object'
  ) {
    return <span>{record.route.originStation.name} → {record.route.destinationStation.name}</span>;
  }
  
  // Fallback to route ID
  return <span>Route {record.route.id || record.route._id || record.route}</span>;
};

const TripFilter = (props) => (
  <Filter {...props}>
    <ReferenceInput label="Route" source="route" reference="routes" alwaysOn>
      <RouteSelectInput />
    </ReferenceInput>
    <SelectInput
      label="Status"
      source="status"
      choices={[
        { id: 'scheduled', name: 'Scheduled' },
        { id: 'in_progress', name: 'In Progress' },
        { id: 'completed', name: 'Completed' },
        { id: 'cancelled', name: 'Cancelled' },
      ]}
    />
    <ReferenceInput source="vehicle" reference="vehicles">
      <SelectInput optionText="licensePlate" />
    </ReferenceInput>
    <ReferenceInput source="driver" reference="drivers">
      <SelectInput optionText="name" />
    </ReferenceInput>
    <ReferenceInput source="provider" reference="providers">
      <SelectInput optionText="name" />
    </ReferenceInput>
  </Filter>
);

export const TripList = (props) => (
  <List {...props} filters={<TripFilter />} sort={{ field: 'departureTime', order: 'DESC' }}>
    <Datagrid rowClick="show">
       <ReferenceField
        source="route"
        reference="routes"
        label="Route"
        link={false}
      >
        <ReferenceField source="originStation" reference="stations" link={false}>
          <TextField source="name" />
        </ReferenceField>
        {" → "}
        <ReferenceField source="destinationStation" reference="stations" link={false}>
          <TextField source="name" />
        </ReferenceField>
      </ReferenceField>
      <ReferenceField source="vehicle" reference="vehicles">
        <TextField source="licensePlate" />
      </ReferenceField>
      <ReferenceField source="driver" reference="drivers">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="departureTime" showTime />
      <DateField source="arrivalTime" showTime />
      <NumberField source="price" options={{ style: 'currency', currency: 'VND' }} />
      <TextField source="status" />
      <ReferenceField source="provider" reference="providers">
        <TextField source="name" />
      </ReferenceField>
    </Datagrid>
  </List>
);

export const TripEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <ReferenceInput 
        source="route" 
        reference="routes"
        perPage={100}
        sort={{ field: 'createdAt', order: 'DESC' }}
      >
        <RouteSelectInput />
      </ReferenceInput>
      <ReferenceInput source="vehicle" reference="vehicles">
        <SelectInput optionText="licensePlate" />
      </ReferenceInput>
      <ReferenceInput source="driver" reference="drivers">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <DateTimeInput source="departureTime" />
      <DateTimeInput source="arrivalTime" />
      <NumberInput source="price" />
      <SelectInput
        source="status"
        choices={[
          { id: 'scheduled', name: 'Scheduled' },
          { id: 'in_progress', name: 'In Progress' },
          { id: 'completed', name: 'Completed' },
          { id: 'cancelled', name: 'Cancelled' },
        ]}
      />
      <ReferenceInput source="provider" reference="providers">
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

export const TripCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
        <ReferenceInput 
        source="route" 
        reference="routes" 
        required
        perPage={100}
        sort={{ field: 'createdAt', order: 'DESC' }}
      >
        <RouteSelectInput />
      </ReferenceInput>
      <ReferenceInput source="vehicle" reference="vehicles" required>
        <SelectInput optionText="licensePlate" />
      </ReferenceInput>
      <ReferenceInput source="driver" reference="drivers" required>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <DateTimeInput source="departureTime" required />
      <DateTimeInput source="arrivalTime" required />
      <NumberInput source="price" required />
      <SelectInput
        source="status"
        choices={[
          { id: 'scheduled', name: 'Scheduled' },
          { id: 'in_progress', name: 'In Progress' },
          { id: 'completed', name: 'Completed' },
          { id: 'cancelled', name: 'Cancelled' },
        ]}
        defaultValue="scheduled"
      />
      <ReferenceInput source="provider" reference="providers" required>
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export const TripShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <ReferenceField source="route" reference="routes">
        <ReferenceField source="originStation" reference="stations" link={false}>
          <TextField source="name" />
        </ReferenceField>
        {" → "}
        <ReferenceField source="destinationStation" reference="stations" link={false}>
          <TextField source="name" />
        </ReferenceField>
      </ReferenceField>
      <ReferenceField source="vehicle" reference="vehicles">
        <TextField source="licensePlate" />
      </ReferenceField>
      <ReferenceField source="driver" reference="drivers">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="departureTime" showTime />
      <DateField source="arrivalTime" showTime />
      <NumberField source="price" options={{ style: 'currency', currency: 'VND' }} />
      <TextField source="status" />
      <ReferenceField source="provider" reference="providers">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);