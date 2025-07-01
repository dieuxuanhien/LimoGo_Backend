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

const PaymentFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Transaction ID" source="transactionId" alwaysOn />
    <SelectInput
      label="Status"
      source="status"
      choices={[
        { id: 'pending', name: 'Pending' },
        { id: 'completed', name: 'Completed' },
        { id: 'failed', name: 'Failed' },
        { id: 'refunded', name: 'Refunded' },
      ]}
    />
    <SelectInput
      label="Method"
      source="paymentMethod"
      choices={[
        { id: 'vnpay', name: 'VNPay' },
        { id: 'cash', name: 'Cash' },
        { id: 'transfer', name: 'Bank Transfer' },
      ]}
    />
    <ReferenceInput source="booking" reference="bookings">
      <SelectInput optionText="bookingCode" />
    </ReferenceInput>
    <ReferenceInput source="user" reference="users">
      <SelectInput optionText="name" />
    </ReferenceInput>
  </Filter>
);

export const PaymentList = (props) => (
  <List {...props} filters={<PaymentFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="transactionId" />
      <NumberField source="amount" options={{ style: 'currency', currency: 'VND' }} />
      <TextField source="status" />
      <TextField source="paymentMethod" />
      <ReferenceField source="booking" reference="bookings">
        <TextField source="bookingCode" />
      </ReferenceField>
      <ReferenceField source="user" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

export const PaymentEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="transactionId" disabled />
      <NumberInput source="amount" />
      <SelectInput
        source="status"
        choices={[
          { id: 'pending', name: 'Pending' },
          { id: 'completed', name: 'Completed' },
          { id: 'failed', name: 'Failed' },
          { id: 'refunded', name: 'Refunded' },
        ]}
      />
      <SelectInput
        source="paymentMethod"
        choices={[
          { id: 'vnpay', name: 'VNPay' },
          { id: 'cash', name: 'Cash' },
          { id: 'transfer', name: 'Bank Transfer' },
        ]}
      />
      <ReferenceInput source="booking" reference="bookings">
        <SelectInput optionText="bookingCode" />
      </ReferenceInput>
      <ReferenceInput source="user" reference="users">
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

export const PaymentCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="transactionId" />
      <NumberInput source="amount" required />
      <SelectInput
        source="status"
        choices={[
          { id: 'pending', name: 'Pending' },
          { id: 'completed', name: 'Completed' },
          { id: 'failed', name: 'Failed' },
          { id: 'refunded', name: 'Refunded' },
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
        required
      />
      <ReferenceInput source="booking" reference="bookings" required>
        <SelectInput optionText="bookingCode" />
      </ReferenceInput>
      <ReferenceInput source="user" reference="users" required>
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export const PaymentShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="transactionId" />
      <NumberField source="amount" options={{ style: 'currency', currency: 'VND' }} />
      <TextField source="status" />
      <TextField source="paymentMethod" />
      <ReferenceField source="booking" reference="bookings">
        <TextField source="bookingCode" />
      </ReferenceField>
      <ReferenceField source="user" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);