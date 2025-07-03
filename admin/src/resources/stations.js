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
  NumberInput,
  FormDataConsumer,
  useRecordContext,
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
        { id: 'shared_point', name: 'Shared Point' },
        { id: 'private_point', name: 'Private Point' },
      ]}
    />
    <ReferenceInput source="ownerProvider" reference="providers" label="Provider">
      <SelectInput optionText="name" />
    </ReferenceInput>
  </Filter>
);

// Component to display coordinates in list view

// Component to display coordinates in list view - updated to use useRecordContext
const CoordinatesField = (props) => {
  const record = useRecordContext(props);
  if (!record || !record.coordinates) return null;
  if (!record.coordinates.lat && !record.coordinates.lng) return <span>No coordinates</span>;
  return <span>{record.coordinates.lat}, {record.coordinates.lng}</span>;
};

// Enhanced coordinates field for show view - updated to use useRecordContext
const CoordinatesDetailField = (props) => {
  const record = useRecordContext(props);
  if (!record || !record.coordinates) return null;
  
  return (
    <div>
      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Coordinates</div>
      {record.coordinates.lat || record.coordinates.lng ? (
        <>
          <div>Latitude: {record.coordinates.lat}</div>
          <div>Longitude: {record.coordinates.lng}</div>
        </>
      ) : (
        <div>No coordinates available</div>
      )}
    </div>
  );
};


export const StationList = (props) => (
  <List {...props} filters={<StationFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="name" />
      <TextField source="city" />
      <TextField source="address" />
      <TextField source="type" />
      <CoordinatesField source="coordinates" label="Coordinates" />
      <ReferenceField source="ownerProvider" reference="providers" emptyText="System">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

// Common form component for both Create and Edit
const StationForm = ({ isCreate = false }) => (
  <SimpleForm>
    <TextInput source="name" required />
    <TextInput source="city" required />
    <TextInput source="address" required />
    
    {/* Coordinates section */}
    <FormDataConsumer>
      {({ formData, ...rest }) => (
        <>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <NumberInput
              source="coordinates.lat"
              label="Latitude"
              helperText="Decimal degrees (e.g. 10.762622)"
              step={0.000001}
              {...rest}
            />
            <NumberInput
              source="coordinates.lng"
              label="Longitude"
              helperText="Decimal degrees (e.g. 106.660172)"
              step={0.000001}
              {...rest}
            />
          </div>
        </>
      )}
    </FormDataConsumer>
    
    <SelectInput
      source="type"
      choices={[
        { id: 'main_station', name: 'Main Station' },
        { id: 'shared_point', name: 'Shared Point' },
        { id: 'private_point', name: 'Private Point' },
      ]}
      defaultValue={isCreate ? "main_station" : undefined}
      required
    />
    
    <ReferenceInput source="ownerProvider" reference="providers" allowEmpty>
      <SelectInput optionText="name" />
    </ReferenceInput>
  </SimpleForm>
);

export const StationEdit = (props) => (
  <Edit {...props}>
    <StationForm />
  </Edit>
);

export const StationCreate = (props) => (
  <Create {...props}>
    <StationForm isCreate={true} />
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
      
      {/* Use the custom field instead of FormDataConsumer */}
      <CoordinatesDetailField source="coordinates" label="Coordinates" />
      
      <ReferenceField source="ownerProvider" reference="providers" emptyText="System">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);