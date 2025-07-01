import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    NumberField,
    EditButton,
    DeleteButton,
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    SelectInput,
    Create,
    Show,
    SimpleShowLayout,
    ReferenceField,
    ReferenceInput,
    Filter,
    SearchInput,
} from 'react-admin';

const TicketFilter = (props) => (
    <Filter {...props}>
        <SearchInput source="q" placeholder="Tìm kiếm..." alwaysOn />
        <SelectInput 
            source="status" 
            choices={[
                { id: 'available', name: 'Còn trống' },
                { id: 'locked', name: 'Đang giữ chỗ' },
                { id: 'booked', name: 'Đã đặt' },
            ]} 
            allowEmpty
        />
        <ReferenceInput source="trip" reference="trips" label="Chuyến đi" allowEmpty>
            <SelectInput optionText="id" />
        </ReferenceInput>
    </Filter>
);

export const TicketList = (props) => (
    <List {...props} filters={<TicketFilter />} perPage={25}>
        <Datagrid rowClick="edit">
            <ReferenceField source="trip" reference="trips" label="Chuyến đi">
                <TextField source="id" />
            </ReferenceField>
            <TextField source="seatNumber" label="Số ghế" />
            <NumberField source="price" label="Giá vé" />
            <TextField source="status" label="Trạng thái" />
            <ReferenceField source="user" reference="users" label="Khách hàng" allowEmpty>
                <TextField source="name" />
            </ReferenceField>
            <DateField source="lockExpires" label="Hết hạn giữ chỗ" showTime allowEmpty />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export const TicketEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <ReferenceInput source="trip" reference="trips" label="Chuyến đi" disabled>
                <SelectInput optionText="id" />
            </ReferenceInput>
            <TextInput source="seatNumber" label="Số ghế" disabled fullWidth />
            <NumberInput source="price" label="Giá vé" fullWidth />
            <SelectInput 
                source="status" 
                label="Trạng thái"
                choices={[
                    { id: 'available', name: 'Còn trống' },
                    { id: 'locked', name: 'Đang giữ chỗ' },
                    { id: 'booked', name: 'Đã đặt' },
                ]} 
                fullWidth
            />
            <ReferenceInput source="user" reference="users" label="Khách hàng" allowEmpty>
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="booking" reference="bookings" label="Đơn hàng" allowEmpty>
                <SelectInput optionText="id" />
            </ReferenceInput>
        </SimpleForm>
    </Edit>
);

export const TicketShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout>
            <ReferenceField source="trip" reference="trips" label="Chuyến đi">
                <TextField source="id" />
            </ReferenceField>
            <TextField source="seatNumber" label="Số ghế" />
            <NumberField source="price" label="Giá vé" />
            <TextField source="status" label="Trạng thái" />
            <ReferenceField source="user" reference="users" label="Khách hàng" allowEmpty>
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="booking" reference="bookings" label="Đơn hàng" allowEmpty>
                <TextField source="id" />
            </ReferenceField>
            <DateField source="lockExpires" label="Hết hạn giữ chỗ" showTime allowEmpty />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <DateField source="updatedAt" label="Cập nhật lần cuối" showTime />
        </SimpleShowLayout>
    </Show>
);

// Không cho phép tạo ticket từ admin vì được tự động tạo khi tạo trip
export const TicketCreate = null;