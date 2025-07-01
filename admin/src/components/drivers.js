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
    EditButton,
    ShowButton,
    Filter,
    SearchInput,
} from 'react-admin';

const DriverFilter = (props) => (
    <Filter {...props}>
        <SearchInput source="q" placeholder="Tìm kiếm theo tên" alwaysOn />
        <ReferenceInput source="provider" reference="providers" label="Nhà xe">
            <SelectInput optionText="name" />
        </ReferenceInput>
        <SelectInput 
            source="status" 
            choices={[
                { id: 'available', name: 'Sẵn sàng' },
                { id: 'assigned', name: 'Đã phân công' },
                { id: 'off_duty', name: 'Nghỉ việc' },
            ]} 
        />
    </Filter>
);

export const DriverList = () => (
    <List filters={<DriverFilter />} perPage={25} sort={{ field: 'createdAt', order: 'DESC' }}>
        <Datagrid>
            <TextField source="name" label="Tên tài xế" />
            <NumberField source="age" label="Tuổi" />
            <ReferenceField source="provider" reference="providers" label="Nhà xe">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="currentStation" reference="stations" label="Bến hiện tại">
                <TextField source="name" />
            </ReferenceField>
            <TextField source="status" label="Trạng thái" />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <ShowButton />
            <EditButton />
        </Datagrid>
    </List>
);

export const DriverShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="name" label="Tên tài xế" />
            <NumberField source="age" label="Tuổi" />
            <ReferenceField source="provider" reference="providers" label="Nhà xe">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="currentStation" reference="stations" label="Bến hiện tại">
                <TextField source="name" />
            </ReferenceField>
            <TextField source="status" label="Trạng thái" />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <DateField source="updatedAt" label="Cập nhật cuối" showTime />
        </SimpleShowLayout>
    </Show>
);

export const DriverEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="name" label="Tên tài xế" required fullWidth />
            <NumberInput source="age" label="Tuổi" required fullWidth />
            <ReferenceInput source="provider" reference="providers" label="Nhà xe">
                <SelectInput optionText="name" required fullWidth />
            </ReferenceInput>
            <ReferenceInput source="currentStation" reference="stations" label="Bến hiện tại">
                <SelectInput optionText="name" fullWidth />
            </ReferenceInput>
            <SelectInput 
                source="status" 
                label="Trạng thái"
                choices={[
                    { id: 'available', name: 'Sẵn sàng' },
                    { id: 'assigned', name: 'Đã phân công' },
                    { id: 'off_duty', name: 'Nghỉ việc' },
                ]} 
                required
                fullWidth
            />
        </SimpleForm>
    </Edit>
);

export const DriverCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" label="Tên tài xế" required fullWidth />
            <NumberInput source="age" label="Tuổi" required fullWidth />
            <ReferenceInput source="provider" reference="providers" label="Nhà xe">
                <SelectInput optionText="name" required fullWidth />
            </ReferenceInput>
            <ReferenceInput source="currentStation" reference="stations" label="Bến hiện tại">
                <SelectInput optionText="name" fullWidth />
            </ReferenceInput>
            <SelectInput 
                source="status" 
                label="Trạng thái"
                choices={[
                    { id: 'available', name: 'Sẵn sàng' },
                    { id: 'assigned', name: 'Đã phân công' },
                    { id: 'off_duty', name: 'Nghỉ việc' },
                ]} 
                defaultValue="available"
                required
                fullWidth
            />
        </SimpleForm>
    </Create>
);