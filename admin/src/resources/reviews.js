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

const ReviewFilter = (props) => (
  <Filter {...props}>
    <NumberInput label="Rating" source="rating" alwaysOn />
    <ReferenceInput source="user" reference="users">
      <SelectInput optionText="name" />
    </ReferenceInput>
    <ReferenceInput source="trip" reference="trips">
      <SelectInput optionText="id" />
    </ReferenceInput>
  </Filter>
);

export const ReviewList = (props) => (
  <List {...props} filters={<ReviewFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <ReferenceField source="user" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="trip" reference="trips">
        <TextField source="id" />
      </ReferenceField>
      <NumberField source="rating" />
      <TextField source="comment" />
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

export const ReviewEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <ReferenceInput source="user" reference="users">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="trip" reference="trips">
        <SelectInput optionText="id" />
      </ReferenceInput>
      <NumberInput source="rating" min={1} max={5} />
      <TextInput source="comment" multiline />
    </SimpleForm>
  </Edit>
);

export const ReviewCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput source="user" reference="users" required>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="trip" reference="trips" required>
        <SelectInput optionText="id" />
      </ReferenceInput>
      <NumberInput source="rating" min={1} max={5} required />
      <TextInput source="comment" multiline />
    </SimpleForm>
  </Create>
);

export const ReviewShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <ReferenceField source="user" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="trip" reference="trips">
        <TextField source="id" />
      </ReferenceField>
      <NumberField source="rating" />
      <TextField source="comment" />
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);