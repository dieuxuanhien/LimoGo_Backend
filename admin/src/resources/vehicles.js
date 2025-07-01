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

const VehicleFilter = (props) => (
  <Filter {...props}>
    <TextInput label="License Plate" source="licensePlate" alwaysOn />
    <SelectInput
      label="Type"
      source="type"
      choices={[
        { id: 'sedan', name: 'Sedan' },
        { id: 'suv', name: 'SUV' },
        { id: 'van', name: 'Van' },
        { id: 'bus', name: 'Bus' },
        { id: 'minibus', name: 'Minibus' },
      ]}
    />
    <SelectInput
      label="Status"
      source="status"
      choices={[
        { id: 'active', name: 'Active' },
        { id: 'maintenance', name: 'Maintenance' },
        { id: 'inactive', name: 'Inactive' },
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

export const VehicleList = (props) => (
  <List {...props} filters={<VehicleFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="licensePlate" />
      <TextField source="type" />
      <TextField source="manufacturer" />
      <TextField source="model" />
      <NumberField source="capacity" />
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

export const VehicleEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="licensePlate" />
      <SelectInput
        source="type"
        choices={[
          { id: 'sedan', name: 'Sedan' },
          { id: 'suv', name: 'SUV' },
          { id: 'van', name: 'Van' },
          { id: 'bus', name: 'Bus' },
          { id: 'minibus', name: 'Minibus' },
        ]}
      />
      <TextInput source="manufacturer" />
      <TextInput source="model" />
      <NumberInput source="capacity" />
      <SelectInput
        source="status"
        choices={[
          { id: 'active', name: 'Active' },
          { id: 'maintenance', name: 'Maintenance' },
          { id: 'inactive', name: 'Inactive' },
        ]}
      />
      <ReferenceInput source="provider" reference="providers">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="currentStation" reference="stations">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ImageInput source="image" label="Vehicle Image" accept="image/*">
        <ImageField source="src" title="title" />
      </ImageInput>
    </SimpleForm>
  </Edit>
);

export const VehicleCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="licensePlate" required />
      <SelectInput
        source="type"
        choices={[
          { id: 'sedan', name: 'Sedan' },
          { id: 'suv', name: 'SUV' },
          { id: 'van', name: 'Van' },
          { id: 'bus', name: 'Bus' },
          { id: 'minibus', name: 'Minibus' },
        ]}
        required
      />
      <TextInput source="manufacturer" />
      <TextInput source="model" />
      <NumberInput source="capacity" />
      <SelectInput
        source="status"
        choices={[
          { id: 'active', name: 'Active' },
          { id: 'maintenance', name: 'Maintenance' },
          { id: 'inactive', name: 'Inactive' },
        ]}
        defaultValue="active"
      />
      <ReferenceInput source="provider" reference="providers" required>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="currentStation" reference="stations" required>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ImageInput source="image" label="Vehicle Image" accept="image/*">
        <ImageField source="src" title="title" />
      </ImageInput>
    </SimpleForm>
  </Create>
);

export const VehicleShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="licensePlate" />
      <TextField source="type" />
      <TextField source="manufacturer" />
      <TextField source="model" />
      <NumberField source="capacity" />
      <TextField source="status" />
      <ReferenceField source="provider" reference="providers">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="currentStation" reference="stations">
        <TextField source="name" />
      </ReferenceField>
      <ImageField source="image" />
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);