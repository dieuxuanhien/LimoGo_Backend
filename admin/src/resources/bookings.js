import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  NumberField,
  DateField,
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  SelectInput,
  NumberInput,
  Create,
  Show,
  SimpleShowLayout,
  Filter,
  ArrayField,
  SingleFieldList,
  ChipField,
} from 'react-admin';

const BookingFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search by ID" source="id" alwaysOn />
    <SelectInput
      label="Payment Status"
      source="paymentStatus"
      choices={[
        { id: 'pending', name: 'Pending' },
        { id: 'paid', name: 'Paid' },
        { id: 'refunded', name: 'Refunded' },
        { id: 'failed', name: 'Failed' },
      ]}
    />
    <SelectInput
      label="Approval Status"
      source="approvalStatus"
      choices={[
        { id: 'pending', name: 'Pending' },
        { id: 'approved', name: 'Approved' },
        { id: 'rejected', name: 'Rejected' },
      ]}
    />
    <SelectInput
      label="Payment Method"
      source="paymentMethod"
      choices={[
        { id: 'vnpay', name: 'VNPay' },
        { id: 'cash', name: 'Cash' },
        { id: 'transfer', name: 'Bank Transfer' },
      ]}
    />
    <ReferenceInput source="user" reference="users">
      <SelectInput optionText="name" />
    </ReferenceInput>
    <ReferenceInput source="provider" reference="providers">
      <SelectInput optionText="name" />
    </ReferenceInput>
  </Filter>
);

export const BookingList = (props) => (
  <List {...props} filters={<BookingFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="bookingCode" />
      <ReferenceField source="user" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="provider" reference="providers">
        <TextField source="name" />
      </ReferenceField>
      <NumberField source="totalPrice" options={{ style: 'currency', currency: 'VND' }} />
      <TextField source="paymentStatus" />
      <TextField source="approvalStatus" />
      <TextField source="paymentMethod" />
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

export const BookingEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="bookingCode" disabled />
      <ReferenceInput source="user" reference="users">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="provider" reference="providers">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="totalPrice" />
      <SelectInput
        source="paymentStatus"
        choices={[
          { id: 'pending', name: 'Pending' },
          { id: 'paid', name: 'Paid' },
          { id: 'refunded', name: 'Refunded' },
          { id: 'failed', name: 'Failed' },
        ]}
      />
      <SelectInput
        source="approvalStatus"
        choices={[
          { id: 'pending', name: 'Pending' },
          { id: 'approved', name: 'Approved' },
          { id: 'cancelled', name: 'Cancelled' },
        ]}
      />
      <SelectInput
        source="paymentMethod"
        choices={[
          
          { id: 'cash', name: 'Cash' },
          { id: 'transfer', name: 'Bank Transfer' },
        ]}
      />
    </SimpleForm>
  </Edit>
);

export const BookingCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput source="user" reference="users">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="provider" reference="providers">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="totalPrice" />
      <SelectInput
        source="paymentStatus"
        choices={[
          { id: 'pending', name: 'Pending' },
          { id: 'paid', name: 'Paid' },
          { id: 'failed', name: 'Failed' },
        ]}
        defaultValue="pending"
      />
      <SelectInput
        source="approvalStatus"
        choices={[
          { id: 'pending', name: 'Pending' },
          { id: 'approved', name: 'Approved' },
          { id: 'cancelled', name: 'Cancelled' },
        ]}
        defaultValue="pending"
      />
      <SelectInput
        source="paymentMethod"
        choices={[
          { id: 'vnpay', name: 'VNPay' },
          { id: 'cash', name: 'Cash' },
          { id: 'transfer', name: 'Bank Transfer' },
        ]}
      />
    </SimpleForm>
  </Create>
);

export const BookingShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="bookingCode" />
      <ReferenceField source="user" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="provider" reference="providers">
        <TextField source="name" />
      </ReferenceField>
      <NumberField source="totalPrice" options={{ style: 'currency', currency: 'VND' }} />
      <TextField source="paymentStatus" />
      <TextField source="approvalStatus" />
      <TextField source="paymentMethod" />
      <ArrayField source="tickets">
        <SingleFieldList>
          <ReferenceField source="id" reference="tickets">
            <ChipField source="seatNumber" />
          </ReferenceField>
        </SingleFieldList>
      </ArrayField>
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);