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
} from 'react-admin';

const RouteFilter = (props) => (
  <Filter {...props}>
    <ReferenceInput label="Origin Station" source="originStation" reference="stations" alwaysOn>
      <SelectInput optionText="name" />
    </ReferenceInput>
    <ReferenceInput label="Destination Station" source="destinationStation" reference="stations" alwaysOn>
      <SelectInput optionText="name" />
    </ReferenceInput>
    <ReferenceInput source="ownerProvider" reference="providers" allowEmpty>
      <SelectInput optionText="name" />
    </ReferenceInput>
  </Filter>
);

export const RouteList = (props) => (
  <List {...props} filters={<RouteFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <ReferenceField source="originStation" reference="stations">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="destinationStation" reference="stations">
        <TextField source="name" />
      </ReferenceField>
      <NumberField source="distanceKm" />
      <NumberField source="estimatedDurationMin" />
      <ReferenceField source="ownerProvider" reference="providers" emptyText="System">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

export const RouteEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <ReferenceInput source="originStation" reference="stations">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="destinationStation" reference="stations">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="distanceKm" />
      <NumberInput source="estimatedDurationMin" />
      <ReferenceInput source="ownerProvider" reference="providers" allowEmpty>
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

export const RouteCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput source="originStation" reference="stations" required>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="destinationStation" reference="stations" required>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="distanceKm" />
      <NumberInput source="estimatedDurationMin" />
      <ReferenceInput source="ownerProvider" reference="providers" allowEmpty>
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export const RouteShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <ReferenceField source="originStation" reference="stations">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="destinationStation" reference="stations">
        <TextField source="name" />
      </ReferenceField>
      <NumberField source="distanceKm" />
      <NumberField source="estimatedDurationMin" />
      <ReferenceField source="ownerProvider" reference="providers" emptyText="System">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);