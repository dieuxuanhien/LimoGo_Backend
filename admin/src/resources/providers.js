import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EmailField,
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

const ProviderFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search Name" source="name" alwaysOn />
    <TextInput label="Search Email" source="email" />
    <TextInput label="Search Phone" source="phone" />
    <TextInput label="Tax ID" source="taxId" />
    <SelectInput
      label="Status"
      source="status"
      choices={[
        { id: 'active', name: 'Active' },
        { id: 'inactive', name: 'Inactive' },
      ]}
    />
  </Filter>
);

export const ProviderList = (props) => (
  <List {...props} filters={<ProviderFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="phone" />
      <TextField source="status" />
      <ReferenceField source="mainUser" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

export const ProviderEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <TextInput source="phone" />
      <TextInput source="address" />
      <TextInput source="taxId" />
      <SelectInput
        source="status"
        choices={[
          { id: 'active', name: 'Active' },
          { id: 'inactive', name: 'Inactive' },
        ]}
      />
      <ReferenceInput source="mainUser" reference="users">
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

export const ProviderCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" required />
      <TextInput source="email" required />
      <TextInput source="phone" required />
      <TextInput source="address" />
      <TextInput source="taxId" />
      <SelectInput
        source="status"
        choices={[
          { id: 'active', name: 'Active' },
          { id: 'inactive', name: 'Inactive' },
        ]}
        defaultValue="active"
      />
      <ReferenceInput source="mainUser" reference="users">
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export const ProviderShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="phone" />
      <TextField source="address" />
      <TextField source="taxId" />
      <TextField source="status" />
      <ReferenceField source="mainUser" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);