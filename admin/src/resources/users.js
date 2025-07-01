import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  BooleanField,
  DateField,
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  SelectInput,
  DateInput,
  Create,
  Show,
  SimpleShowLayout,
  Filter,
  PasswordInput,
} from 'react-admin';

const UserFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search Name" source="name" alwaysOn />
    <TextInput label="Search Email" source="email" alwaysOn />
    <TextInput label="Search Phone" source="phoneNumber" />
    <SelectInput
      label="Role"
      source="userRole"
      choices={[
        { id: 'admin', name: 'Admin' },
        { id: 'customer', name: 'Customer' },
        { id: 'provider', name: 'Provider' },
      ]}
    />
    <SelectInput
      label="Verified"
      source="verified"
      choices={[
        { id: true, name: 'Yes' },
        { id: false, name: 'No' },
      ]}
    />
  </Filter>
);

export const UserList = (props) => (
  <List {...props} filters={<UserFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="phoneNumber" />
      <TextField source="userRole" />
      <BooleanField source="verified" />
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

export const UserEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <TextInput source="phoneNumber" />
      <DateInput source="dateOfBirth" />
      <SelectInput
        source="gender"
        choices={[
          { id: 'Male', name: 'Male' },
          { id: 'Female', name: 'Female' },
          { id: 'Others', name: 'Others' },
        ]}
      />
      <SelectInput
        source="userRole"
        choices={[
          { id: 'admin', name: 'Admin' },
          { id: 'customer', name: 'Customer' },
          { id: 'provider', name: 'Provider' },
        ]}
      />
      <BooleanInput source="verified" />
    </SimpleForm>
  </Edit>
);

export const UserCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" required />
      <PasswordInput source="password" required />
      <TextInput source="phoneNumber" required />
      <DateInput source="dateOfBirth" />
      <SelectInput
        source="gender"
        choices={[
          { id: 'Male', name: 'Male' },
          { id: 'Female', name: 'Female' },
          { id: 'Others', name: 'Others' },
        ]}
      />
      <SelectInput
        source="userRole"
        choices={[
          { id: 'admin', name: 'Admin' },
          { id: 'customer', name: 'Customer' },
          { id: 'provider', name: 'Provider' },
        ]}
        defaultValue="customer"
      />
      <BooleanInput source="verified" defaultValue={false} />
    </SimpleForm>
  </Create>
);

export const UserShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="phoneNumber" />
      <TextField source="dateOfBirth" />
      <TextField source="gender" />
      <TextField source="userRole" />
      <BooleanField source="verified" />
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);