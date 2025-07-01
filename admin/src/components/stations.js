import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    Edit,
    SimpleForm,
    TextInput,
    Create,
    Show,
    SimpleShowLayout,
    EditButton,
    ShowButton,
    Filter,
    SearchInput,
} from 'react-admin';

const StationFilter = (props) => (
    <Filter {...props}>
        <SearchInput source="q" placeholder="Tìm kiếm theo tên hoặc thành phố" alwaysOn />
        <TextInput source="city" label="Thành phố" />
    </Filter>
);

export const StationList = () => (
    <List filters={<StationFilter />} perPage={25} sort={{ field: 'name', order: 'ASC' }}>
        <Datagrid>
            <TextField source="name" label="Tên bến xe" />
            <TextField source="address" label="Địa chỉ" />
            <TextField source="city" label="Thành phố" />
            <TextField source="province" label="Tỉnh/Thành" />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <ShowButton />
            <EditButton />
        </Datagrid>
    </List>
);

export const StationShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="name" label="Tên bến xe" />
            <TextField source="address" label="Địa chỉ" />
            <TextField source="city" label="Thành phố" />
            <TextField source="province" label="Tỉnh/Thành" />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <DateField source="updatedAt" label="Cập nhật cuối" showTime />
        </SimpleShowLayout>
    </Show>
);

export const StationEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="name" label="Tên bến xe" required fullWidth />
            <TextInput source="address" label="Địa chỉ" required fullWidth multiline />
            <TextInput source="city" label="Thành phố" required fullWidth />
            <TextInput source="province" label="Tỉnh/Thành" required fullWidth />
        </SimpleForm>
    </Edit>
);

export const StationCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" label="Tên bến xe" required fullWidth />
            <TextInput source="address" label="Địa chỉ" required fullWidth multiline />
            <TextInput source="city" label="Thành phố" required fullWidth />
            <TextInput source="province" label="Tỉnh/Thành" required fullWidth />
        </SimpleForm>
    </Create>
);