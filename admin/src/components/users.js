import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EmailField,
    DateField,
    BooleanField,
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    BooleanInput,
    Create,
    Show,
    SimpleShowLayout,
    EditButton,
    ShowButton,
    DeleteButton,
    Toolbar,
    SaveButton,
    Filter,
    SearchInput,
    useRecordContext,
} from 'react-admin';
import { Chip } from '@mui/material';

// Custom role field
const RoleField = ({ source }) => {
    const record = useRecordContext();
    if (!record || !record[source]) return null;
    
    const roleColors = {
        admin: 'error',
        provider: 'warning', 
        customer: 'primary'
    };
    
    return <Chip label={record[source]} color={roleColors[record[source]] || 'default'} size="small" />;
};

// Filter for user list
const UserFilter = (props) => (
    <Filter {...props}>
        <SearchInput source="q" placeholder="Tìm kiếm theo tên hoặc email" alwaysOn />
        <SelectInput 
            source="userRole" 
            choices={[
                { id: 'admin', name: 'Admin' },
                { id: 'provider', name: 'Provider' },
                { id: 'customer', name: 'Customer' },
            ]} 
            emptyText="Tất cả vai trò"
        />
        <BooleanInput source="verified" label="Đã xác thực" />
    </Filter>
);

// Custom toolbar without delete button for edit
const UserEditToolbar = (props) => (
    <Toolbar {...props}>
        <SaveButton />
    </Toolbar>
);

export const UserList = () => (
    <List filters={<UserFilter />} perPage={25} sort={{ field: 'createdAt', order: 'DESC' }}>
        <Datagrid>
            <TextField source="name" label="Tên" />
            <EmailField source="email" label="Email" />
            <TextField source="phoneNumber" label="Số điện thoại" />
            <RoleField source="userRole" label="Vai trò" />
            <BooleanField source="verified" label="Đã xác thực" />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <ShowButton />
            <EditButton />
        </Datagrid>
    </List>
);

export const UserShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="name" label="Tên" />
            <EmailField source="email" label="Email" />
            <TextField source="phoneNumber" label="Số điện thoại" />
            <RoleField source="userRole" label="Vai trò" />
            <BooleanField source="verified" label="Đã xác thực" />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <DateField source="updatedAt" label="Cập nhật cuối" showTime />
        </SimpleShowLayout>
    </Show>
);

export const UserEdit = () => (
    <Edit>
        <SimpleForm toolbar={<UserEditToolbar />}>
            <TextInput source="name" label="Tên" required fullWidth />
            <TextInput source="email" label="Email" type="email" required fullWidth />
            <TextInput source="phoneNumber" label="Số điện thoại" fullWidth />
            <SelectInput 
                source="userRole" 
                label="Vai trò"
                choices={[
                    { id: 'customer', name: 'Customer' },
                    { id: 'provider', name: 'Provider' },
                    { id: 'admin', name: 'Admin' },
                ]} 
                required
                fullWidth
            />
            <BooleanInput source="verified" label="Đã xác thực" />
        </SimpleForm>
    </Edit>
);

export const UserCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" label="Tên" required fullWidth />
            <TextInput source="email" label="Email" type="email" required fullWidth />
            <TextInput source="password" label="Mật khẩu" type="password" required fullWidth />
            <TextInput source="phoneNumber" label="Số điện thoại" fullWidth />
            <SelectInput 
                source="userRole" 
                label="Vai trò"
                choices={[
                    { id: 'customer', name: 'Customer' },
                    { id: 'provider', name: 'Provider' },
                    { id: 'admin', name: 'Admin' },
                ]} 
                defaultValue="customer"
                required
                fullWidth
            />
            <BooleanInput source="verified" label="Đã xác thực" defaultValue={false} />
        </SimpleForm>
    </Create>
);