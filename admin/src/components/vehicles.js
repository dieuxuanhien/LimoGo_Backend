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

const VehicleFilter = (props) => (
    <Filter {...props}>
        <SearchInput source="q" placeholder="Tìm kiếm theo biển số hoặc loại xe" alwaysOn />
        <ReferenceInput source="provider" reference="providers" label="Nhà xe">
            <SelectInput optionText="name" />
        </ReferenceInput>
        <SelectInput 
            source="type" 
            choices={[
                { id: 'bus', name: 'Xe buýt' },
                { id: 'limousine', name: 'Limousine' },
                { id: 'van', name: 'Xe van' },
            ]} 
        />
        <SelectInput 
            source="status" 
            choices={[
                { id: 'available', name: 'Sẵn sàng' },
                { id: 'maintenance', name: 'Bảo trì' },
                { id: 'assigned', name: 'Đã phân công' },
            ]} 
        />
    </Filter>
);

export const VehicleList = () => (
    <List filters={<VehicleFilter />} perPage={25} sort={{ field: 'createdAt', order: 'DESC' }}>
        <Datagrid>
            <TextField source="licensePlate" label="Biển số" />
            <TextField source="type" label="Loại xe" />
            <TextField source="manufacturer" label="Hãng xe" />
            <TextField source="model" label="Model" />
            <NumberField source="capacity" label="Sức chứa" />
            <ReferenceField source="provider" reference="providers" label="Nhà xe">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="currentStation" reference="stations" label="Bến hiện tại">
                <TextField source="name" />
            </ReferenceField>
            <TextField source="status" label="Trạng thái" />
            <ShowButton />
            <EditButton />
        </Datagrid>
    </List>
);

export const VehicleShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="licensePlate" label="Biển số" />
            <TextField source="type" label="Loại xe" />
            <TextField source="manufacturer" label="Hãng xe" />
            <TextField source="model" label="Model" />
            <NumberField source="capacity" label="Sức chứa" />
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

export const VehicleEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="licensePlate" label="Biển số" required fullWidth />
            <SelectInput 
                source="type" 
                label="Loại xe"
                choices={[
                    { id: 'bus', name: 'Xe buýt' },
                    { id: 'limousine', name: 'Limousine' },
                    { id: 'van', name: 'Xe van' },
                ]} 
                required
                fullWidth
            />
            <TextInput source="manufacturer" label="Hãng xe" fullWidth />
            <TextInput source="model" label="Model" fullWidth />
            <NumberInput source="capacity" label="Sức chứa" required fullWidth />
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
                    { id: 'maintenance', name: 'Bảo trì' },
                    { id: 'assigned', name: 'Đã phân công' },
                ]} 
                required
                fullWidth
            />
        </SimpleForm>
    </Edit>
);

export const VehicleCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="licensePlate" label="Biển số" required fullWidth />
            <SelectInput 
                source="type" 
                label="Loại xe"
                choices={[
                    { id: 'bus', name: 'Xe buýt' },
                    { id: 'limousine', name: 'Limousine' },
                    { id: 'van', name: 'Xe van' },
                ]} 
                required
                fullWidth
            />
            <TextInput source="manufacturer" label="Hãng xe" fullWidth />
            <TextInput source="model" label="Model" fullWidth />
            <NumberInput source="capacity" label="Sức chứa" required fullWidth />
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
                    { id: 'maintenance', name: 'Bảo trì' },
                    { id: 'assigned', name: 'Đã phân công' },
                ]} 
                defaultValue="available"
                required
                fullWidth
            />
        </SimpleForm>
    </Create>
);