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

const StationFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search Name" source="name" alwaysOn />
    <TextInput label="City" source="city" />
    <SelectInput
      label="Type"
      source="type"
      choices={[
        { id: 'main_station', name: 'Main Station' },
        { id: 'pickup_point', name: 'Pickup Point' },
      ]}
    />
    <ReferenceInput source="ownerProvider" reference="providers">
      <SelectInput optionText="name" />
    </ReferenceInput>
  </Filter>
);

export const StationList = (props) => (
  <List {...props} filters={<StationFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="name" />
      <TextField source="city" />
      <TextField source="address" />
      <TextField source="type" />
      <ReferenceField source="ownerProvider" reference="providers" emptyText="System">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

export const StationEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="city" />
      <TextInput source="address" />
      <SelectInput
        source="type"
        choices={[
          { id: 'main_station', name: 'Main Station' },
          { id: 'pickup_point', name: 'Pickup Point' },
        ]}
      />
      <ReferenceInput source="ownerProvider" reference="providers" allowEmpty>
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

export const StationCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" required />
      <TextInput source="city" required />
      <TextInput source="address" />
      <SelectInput
        source="type"
        choices={[
          { id: 'main_station', name: 'Main Station' },
          { id: 'pickup_point', name: 'Pickup Point' },
        ]}
        defaultValue="main_station"
      />
      <ReferenceInput source="ownerProvider" reference="providers" allowEmpty>
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export const StationShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="city" />
      <TextField source="address" />
      <TextField source="type" />
      <ReferenceField source="ownerProvider" reference="providers" emptyText="System">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);