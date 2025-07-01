import React from 'react';
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
} from 'react-admin';

const TripFilter = (props) => (
  <Filter {...props}>
    <ReferenceInput label="Route" source="route" reference="routes" alwaysOn>
      <SelectInput optionText={(record) => 
        record ? `${record.originStation.name} -> ${record.destinationStation.name}` : ''
      } />
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
      <ReferenceField source="route" reference="routes">
        <TextField source="id" />
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
      <ReferenceInput source="route" reference="routes">
        <SelectInput optionText={(record) => 
          record ? `${record.originStation?.name} -> ${record.destinationStation?.name}` : ''
        } />
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
      <ReferenceInput source="route" reference="routes" required>
        <SelectInput optionText={(record) => 
          record ? `${record.originStation?.name} -> ${record.destinationStation?.name}` : ''
        } />
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
        <TextField source="id" />
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