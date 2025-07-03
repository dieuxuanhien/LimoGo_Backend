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
  NumberInput,
  ReferenceInput,
  SelectInput,
  Create,
  Show,
  SimpleShowLayout,
  Filter,
  DateTimeInput,
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
        { id: 'in-progress', name: 'In Progress' },
        { id: 'completed', name: 'Completed' },
        { id: 'cancelled', name: 'Cancelled' },
      ]}
    />
    <ReferenceInput source="vehicle" reference="vehicles" label="Vehicle">
      <SelectInput optionText="licensePlate" />
    </ReferenceInput>
    <ReferenceInput source="driver" reference="drivers" label="Driver">
      <SelectInput optionText="name" />
    </ReferenceInput>
    <ReferenceInput source="provider" reference="providers" label="Provider">
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
      <ReferenceField source="vehicle" reference="vehicles" label="Vehicle">
        <TextField source="licensePlate" />
      </ReferenceField>
      <ReferenceField source="driver" reference="drivers" label="Driver">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="departureTime" showTime label="Departure Time" />
      <DateField source="arrivalTime" showTime label="Arrival Time" />
      <NumberField source="price" options={{ style: 'currency', currency: 'VND' }} label="Price" />
      <TextField source="status" label="Status" />
      <ReferenceField source="provider" reference="providers" label="Provider">
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
        label="Route"
        perPage={100}
        sort={{ field: 'createdAt', order: 'DESC' }}
      >
        <RouteSelectInput />
      </ReferenceInput>
      <ReferenceInput source="vehicle" reference="vehicles" label="Vehicle">
        <SelectInput optionText="licensePlate" />
      </ReferenceInput>
      <ReferenceInput source="driver" reference="drivers" label="Driver">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <DateTimeInput source="departureTime" label="Departure Time" />
      <DateTimeInput source="arrivalTime" label="Arrival Time" />
      <NumberInput source="price" label="Price" />
      <SelectInput
        source="status"
        label="Status"
        choices={[
          { id: 'scheduled', name: 'Scheduled' },
          { id: 'in-progress', name: 'In Progress' },
          { id: 'completed', name: 'Completed' },
          { id: 'cancelled', name: 'Cancelled' },
        ]}
      />
      <ReferenceInput source="provider" reference="providers" label="Provider">
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
        label="Route" 
        required
        perPage={100}
        sort={{ field: 'createdAt', order: 'DESC' }}
      >
        <RouteSelectInput />
      </ReferenceInput>
      <ReferenceInput source="vehicle" reference="vehicles" label="Vehicle" required>
        <SelectInput optionText="licensePlate" />
      </ReferenceInput>
      <ReferenceInput source="driver" reference="drivers" label="Driver" required>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <DateTimeInput source="departureTime" label="Departure Time" required />
      <DateTimeInput source="arrivalTime" label="Arrival Time" required />
      <NumberInput source="price" label="Price" required />
      <SelectInput
        source="status"
        label="Status"
        choices={[
          { id: 'scheduled', name: 'Scheduled' },
          { id: 'in-progress', name: 'In Progress' },
          { id: 'completed', name: 'Completed' },
          { id: 'cancelled', name: 'Cancelled' },
        ]}
        defaultValue="scheduled"
      />
      <ReferenceInput source="provider" reference="providers" label="Provider" required>
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export const TripShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <ReferenceField source="route" reference="routes" label="Route">
        <ReferenceField source="originStation" reference="stations" link={false}>
          <TextField source="name" />
        </ReferenceField>
        {" → "}
        <ReferenceField source="destinationStation" reference="stations" link={false}>
          <TextField source="name" />
        </ReferenceField>
      </ReferenceField>
      <ReferenceField source="vehicle" reference="vehicles" label="Vehicle">
        <TextField source="licensePlate" />
      </ReferenceField>
      <ReferenceField source="driver" reference="drivers" label="Driver">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="departureTime" showTime label="Departure Time" />
      <DateField source="arrivalTime" showTime label="Arrival Time" />
      <NumberField source="price" options={{ style: 'currency', currency: 'VND' }} label="Price" />
      <TextField source="status" label="Status" />
      <ReferenceField source="provider" reference="providers" label="Provider">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" showTime label="Created At" />
      <DateField source="updatedAt" showTime label="Updated At" />
    </SimpleShowLayout>
  </Show>
);