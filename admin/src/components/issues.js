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

const IssueFilter = (props) => (
    <Filter {...props}>
        <SearchInput source="q" placeholder="Tìm kiếm theo tiêu đề..." alwaysOn />
        <SelectInput 
            source="status" 
            choices={[
                { id: 'open', name: 'Mở' },
                { id: 'in_progress', name: 'Đang xử lý' },
                { id: 'resolved', name: 'Đã giải quyết' },
                { id: 'closed', name: 'Đã đóng' },
            ]} 
            allowEmpty
        />
        <SelectInput 
            source="category" 
            choices={[
                { id: 'technical', name: 'Kỹ thuật' },
                { id: 'service', name: 'Dịch vụ' },
                { id: 'payment', name: 'Thanh toán' },
                { id: 'other', name: 'Khác' },
            ]} 
            allowEmpty
        />
    </Filter>
);

export const IssueList = (props) => (
    <List {...props} filters={<IssueFilter />} perPage={25}>
        <Datagrid rowClick="edit">
            <TextField source="title" label="Tiêu đề" />
            <TextField source="category" label="Loại" />
            <TextField source="status" label="Trạng thái" />
            <ReferenceField source="user" reference="users" label="Người báo cáo">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="trip" reference="trips" label="Chuyến đi" allowEmpty>
                <TextField source="id" />
            </ReferenceField>
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export const IssueEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="title" label="Tiêu đề" fullWidth />
            <TextInput source="description" label="Mô tả" multiline rows={4} fullWidth />
            <SelectInput 
                source="category" 
                label="Loại vấn đề"
                choices={[
                    { id: 'technical', name: 'Kỹ thuật' },
                    { id: 'service', name: 'Dịch vụ' },
                    { id: 'payment', name: 'Thanh toán' },
                    { id: 'other', name: 'Khác' },
                ]} 
                fullWidth
            />
            <SelectInput 
                source="status" 
                label="Trạng thái"
                choices={[
                    { id: 'open', name: 'Mở' },
                    { id: 'in_progress', name: 'Đang xử lý' },
                    { id: 'resolved', name: 'Đã giải quyết' },
                    { id: 'closed', name: 'Đã đóng' },
                ]} 
                fullWidth
            />
            <ReferenceInput source="user" reference="users" label="Người báo cáo" disabled>
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="trip" reference="trips" label="Chuyến đi" allowEmpty>
                <SelectInput optionText="id" />
            </ReferenceInput>
            <ReferenceInput source="booking" reference="bookings" label="Đơn hàng" allowEmpty>
                <SelectInput optionText="id" />
            </ReferenceInput>
        </SimpleForm>
    </Edit>
);

export const IssueCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="title" label="Tiêu đề" required fullWidth />
            <TextInput source="description" label="Mô tả" multiline rows={4} fullWidth />
            <SelectInput 
                source="category" 
                label="Loại vấn đề"
                choices={[
                    { id: 'technical', name: 'Kỹ thuật' },
                    { id: 'service', name: 'Dịch vụ' },
                    { id: 'payment', name: 'Thanh toán' },
                    { id: 'other', name: 'Khác' },
                ]} 
                required
                fullWidth
            />
            <SelectInput 
                source="status" 
                label="Trạng thái"
                choices={[
                    { id: 'open', name: 'Mở' },
                    { id: 'in_progress', name: 'Đang xử lý' },
                    { id: 'resolved', name: 'Đã giải quyết' },
                    { id: 'closed', name: 'Đã đóng' },
                ]} 
                defaultValue="open"
                fullWidth
            />
            <ReferenceInput source="user" reference="users" label="Người báo cáo" required>
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="trip" reference="trips" label="Chuyến đi" allowEmpty>
                <SelectInput optionText="id" />
            </ReferenceInput>
            <ReferenceInput source="booking" reference="bookings" label="Đơn hàng" allowEmpty>
                <SelectInput optionText="id" />
            </ReferenceInput>
        </SimpleForm>
    </Create>
);

export const IssueShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="title" label="Tiêu đề" />
            <TextField source="description" label="Mô tả" />
            <TextField source="category" label="Loại vấn đề" />
            <TextField source="status" label="Trạng thái" />
            <ReferenceField source="user" reference="users" label="Người báo cáo">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="trip" reference="trips" label="Chuyến đi" allowEmpty>
                <TextField source="id" />
            </ReferenceField>
            <ReferenceField source="booking" reference="bookings" label="Đơn hàng" allowEmpty>
                <TextField source="id" />
            </ReferenceField>
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <DateField source="updatedAt" label="Cập nhật lần cuối" showTime />
        </SimpleShowLayout>
    </Show>
);