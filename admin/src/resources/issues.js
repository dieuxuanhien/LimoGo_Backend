import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  DateField,
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  SelectInput,
  Create,
  Show,
  SimpleShowLayout,
  Filter,
} from 'react-admin';

const IssueFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Title" source="title" alwaysOn />
    <SelectInput
      label="Category"
      source="category"
      choices={[
        { id: 'booking', name: 'Booking Issues' },
        { id: 'payment', name: 'Payment Issues' },
        { id: 'service', name: 'Service Issues' },
        { id: 'app', name: 'App Issues' },
        { id: 'other', name: 'Other Issues' },
      ]}
    />
    <SelectInput
      label="Status"
      source="status"
      choices={[
        { id: 'open', name: 'Open' },
        { id: 'in-progress', name: 'In Progress' },
        { id: 'resolved', name: 'Resolved' },
        { id: 'closed', name: 'Closed' },
      ]}
    />
    <ReferenceInput source="user" reference="users">
      <SelectInput optionText="name" />
    </ReferenceInput>
    <ReferenceInput source="trip" reference="trips" allowEmpty>
      <SelectInput optionText="id" />
    </ReferenceInput>
    <ReferenceInput source="booking" reference="bookings" allowEmpty>
      <SelectInput optionText="bookingCode" />
    </ReferenceInput>
  </Filter>
);

export const IssueList = (props) => (
  <List {...props} filters={<IssueFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="title" />
      <TextField source="category" />
      <TextField source="status" />
      <ReferenceField source="user" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="trip" reference="trips" emptyText="N/A">
        <TextField source="id" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

export const IssueEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="description" multiline rows={4} />
      <SelectInput
        source="category"
        choices={[
          { id: 'booking', name: 'Booking Issues' },
          { id: 'payment', name: 'Payment Issues' },
          { id: 'service', name: 'Service Issues' },
          { id: 'app', name: 'App Issues' },
          { id: 'other', name: 'Other Issues' },
        ]}
      />
      <SelectInput
        source="status"
        choices={[
          { id: 'open', name: 'Open' },
          { id: 'in-progress', name: 'In Progress' },
          { id: 'resolved', name: 'Resolved' },
          { id: 'closed', name: 'Closed' },
        ]}
      />
      <ReferenceInput source="user" reference="users">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="trip" reference="trips" allowEmpty>
        <SelectInput optionText="id" />
      </ReferenceInput>
      <ReferenceInput source="booking" reference="bookings" allowEmpty>
        <SelectInput optionText="bookingCode" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

export const IssueCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="title" required />
      <TextInput source="description" multiline rows={4} required />
      <SelectInput
        source="category"
        choices={[
          { id: 'booking', name: 'Booking Issues' },
          { id: 'payment', name: 'Payment Issues' },
          { id: 'service', name: 'Service Issues' },
          { id: 'app', name: 'App Issues' },
          { id: 'other', name: 'Other Issues' },
        ]}
        required
      />
      <SelectInput
        source="status"
        choices={[
          { id: 'open', name: 'Open' },
          { id: 'in-progress', name: 'In Progress' },
          { id: 'resolved', name: 'Resolved' },
          { id: 'closed', name: 'Closed' },
        ]}
        defaultValue="open"
      />
      <ReferenceInput source="user" reference="users" required>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="trip" reference="trips" allowEmpty>
        <SelectInput optionText="id" />
      </ReferenceInput>
      <ReferenceInput source="booking" reference="bookings" allowEmpty>
        <SelectInput optionText="bookingCode" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export const IssueShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="description" />
      <TextField source="category" />
      <TextField source="status" />
      <ReferenceField source="user" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="trip" reference="trips" emptyText="N/A">
        <TextField source="id" />
      </ReferenceField>
      <ReferenceField source="booking" reference="bookings" emptyText="N/A">
        <TextField source="bookingCode" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);