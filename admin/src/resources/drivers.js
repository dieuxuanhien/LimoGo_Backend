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
  ImageField,
  ImageInput,
} from 'react-admin';

const DriverFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search Name" source="name" alwaysOn />
    <NumberInput label="Age" source="age" />
    <SelectInput
      label="Status"
      source="status"
      choices={[
        { id: 'available', name: 'Available' },
        { id: 'on_trip', name: 'On Trip' },
        { id: 'off_duty', name: 'Off Duty' },
      ]}
    />
    <ReferenceInput source="provider" reference="providers">
      <SelectInput optionText="name" />
    </ReferenceInput>
    <ReferenceInput source="currentStation" reference="stations">
      <SelectInput optionText="name" />
    </ReferenceInput>
  </Filter>
);

export const DriverList = (props) => (
  <List {...props} filters={<DriverFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="name" />
      <NumberField source="age" />
      <TextField source="status" />
      <ReferenceField source="provider" reference="providers">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="currentStation" reference="stations">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

export const DriverEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <NumberInput source="age" />
      <SelectInput
        source="status"
        choices={[
          { id: 'available', name: 'Available' },
          { id: 'on_trip', name: 'On Trip' },
          { id: 'off_duty', name: 'Off Duty' },
        ]}
      />
      <ReferenceInput source="provider" reference="providers">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="currentStation" reference="stations">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ImageInput source="photo" label="Driver Photo" accept="image/*">
        <ImageField source="src" title="title" />
      </ImageInput>
    </SimpleForm>
  </Edit>
);

export const DriverCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" required />
      <NumberInput source="age" />
      <SelectInput
        source="status"
        choices={[
          { id: 'available', name: 'Available' },
          { id: 'on_trip', name: 'On Trip' },
          { id: 'off_duty', name: 'Off Duty' },
        ]}
        defaultValue="available"
      />
      <ReferenceInput source="provider" reference="providers">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="currentStation" reference="stations">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ImageInput source="photo" label="Driver Photo" accept="image/*">
        <ImageField source="src" title="title" />
      </ImageInput>
    </SimpleForm>
  </Create>
);

export const DriverShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <NumberField source="age" />
      <TextField source="status" />
      <ReferenceField source="provider" reference="providers">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="currentStation" reference="stations">
        <TextField source="name" />
      </ReferenceField>
      <ImageField source="photo" />
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);