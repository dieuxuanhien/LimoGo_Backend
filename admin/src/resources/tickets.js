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

const TicketFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Seat Number" source="seatNumber" alwaysOn />
    <SelectInput
      label="Status"
      source="status"
      choices={[
        { id: 'available', name: 'Available' },
        { id: 'locked', name: 'Locked' },
        { id: 'booked', name: 'Booked' },
      ]}
    />
    <ReferenceInput source="trip" reference="trips">
      <SelectInput optionText="id" />
    </ReferenceInput>
    <ReferenceInput source="user" reference="users">
      <SelectInput optionText="name" />
    </ReferenceInput>
    <ReferenceInput source="booking" reference="bookings">
      <SelectInput optionText="bookingCode" />
    </ReferenceInput>
  </Filter>
);

export const TicketList = (props) => (
  <List {...props} filters={<TicketFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="seatNumber" />
      <NumberField source="price" options={{ style: 'currency', currency: 'VND' }} />
      <TextField source="status" />
      <ReferenceField source="trip" reference="trips">
        <TextField source="id" />
      </ReferenceField>
      <ReferenceField source="user" reference="users" emptyText="Not booked">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

export const TicketEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="seatNumber" />
      <NumberInput source="price" />
      <SelectInput
        source="status"
        choices={[
          { id: 'available', name: 'Available' },
          { id: 'locked', name: 'Locked' },
          { id: 'booked', name: 'Booked' },
        ]}
      />
      <ReferenceInput source="trip" reference="trips">
        <SelectInput optionText="id" />
      </ReferenceInput>
      <ReferenceInput source="user" reference="users" allowEmpty>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="booking" reference="bookings" allowEmpty>
        <SelectInput optionText="bookingCode" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

export const TicketCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="seatNumber" required />
      <NumberInput source="price" required />
      <SelectInput
        source="status"
        choices={[
          { id: 'available', name: 'Available' },
          { id: 'locked', name: 'Locked' },
          { id: 'booked', name: 'Booked' },
        ]}
        defaultValue="available"
      />
      <ReferenceInput source="trip" reference="trips" required>
        <SelectInput optionText="id" />
      </ReferenceInput>
      <ReferenceInput source="user" reference="users" allowEmpty>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="booking" reference="bookings" allowEmpty>
        <SelectInput optionText="bookingCode" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export const TicketShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="seatNumber" />
      <NumberField source="price" options={{ style: 'currency', currency: 'VND' }} />
      <TextField source="status" />
      <ReferenceField source="trip" reference="trips">
        <TextField source="id" />
      </ReferenceField>
      <ReferenceField source="user" reference="users" emptyText="Not booked">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="booking" reference="bookings" emptyText="No booking">
        <TextField source="bookingCode" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);