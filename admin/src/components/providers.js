import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EmailField,
    DateField,
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    Create,
    Show,
    SimpleShowLayout,
    EditButton,
    ShowButton,
    Filter,
    SearchInput,
    useRecordContext,
} from 'react-admin';
import { Chip } from '@mui/material';

// Custom status field
const StatusField = ({ source }) => {
    const record = useRecordContext();
    if (!record || !record[source]) return null;
    
    const statusColors = {
        active: 'success',
        inactive: 'default',
        suspended: 'error'
    };
    
    return <Chip label={record[source]} color={statusColors[record[source]] || 'default'} size="small" />;
};

// Filter for provider list
const ProviderFilter = (props) => (
    <Filter {...props}>
        <SearchInput source="q" placeholder="Tìm kiếm theo tên hoặc email" alwaysOn />
        <SelectInput 
            source="status" 
            choices={[
                { id: 'active', name: 'Hoạt động' },
                { id: 'inactive', name: 'Không hoạt động' },
                { id: 'suspended', name: 'Đình chỉ' },
            ]} 
            emptyText="Tất cả trạng thái"
        />
    </Filter>
);

export const ProviderList = () => (
    <List filters={<ProviderFilter />} perPage={25} sort={{ field: 'createdAt', order: 'DESC' }}>
        <Datagrid>
            <TextField source="name" label="Tên nhà xe" />
            <EmailField source="email" label="Email" />
            <TextField source="phone" label="Điện thoại" />
            <TextField source="address" label="Địa chỉ" />
            <TextField source="taxId" label="Mã số thuế" />
            <StatusField source="status" label="Trạng thái" />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <ShowButton />
            <EditButton />
        </Datagrid>
    </List>
);

export const ProviderShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="name" label="Tên nhà xe" />
            <EmailField source="email" label="Email" />
            <TextField source="phone" label="Điện thoại" />
            <TextField source="address" label="Địa chỉ" />
            <TextField source="taxId" label="Mã số thuế" />
            <StatusField source="status" label="Trạng thái" />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <DateField source="updatedAt" label="Cập nhật cuối" showTime />
        </SimpleShowLayout>
    </Show>
);

export const ProviderEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="name" label="Tên nhà xe" required fullWidth />
            <TextInput source="email" label="Email" type="email" required fullWidth />
            <TextInput source="phone" label="Điện thoại" fullWidth />
            <TextInput source="address" label="Địa chỉ" required fullWidth multiline />
            <TextInput source="taxId" label="Mã số thuế" fullWidth />
            <SelectInput 
                source="status" 
                label="Trạng thái"
                choices={[
                    { id: 'active', name: 'Hoạt động' },
                    { id: 'inactive', name: 'Không hoạt động' },
                    { id: 'suspended', name: 'Đình chỉ' },
                ]} 
                defaultValue="active"
                required
                fullWidth
            />
        </SimpleForm>
    </Edit>
);

export const ProviderCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" label="Tên nhà xe" required fullWidth />
            <TextInput source="email" label="Email" type="email" required fullWidth />
            <TextInput source="phone" label="Điện thoại" fullWidth />
            <TextInput source="address" label="Địa chỉ" required fullWidth multiline />
            <TextInput source="taxId" label="Mã số thuế" fullWidth />
            <SelectInput 
                source="status" 
                label="Trạng thái"
                choices={[
                    { id: 'active', name: 'Hoạt động' },
                    { id: 'inactive', name: 'Không hoạt động' },
                    { id: 'suspended', name: 'Đình chỉ' },
                ]} 
                defaultValue="active"
                required
                fullWidth
            />
        </SimpleForm>
    </Create>
);