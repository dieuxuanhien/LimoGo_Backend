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
    DateTimeInput,
    Create,
    Show,
    SimpleShowLayout,
    ReferenceField,
    ReferenceInput,
    Filter,
    SearchInput,
} from 'react-admin';

const TripFilter = (props) => (
    <Filter {...props}>
        <SearchInput source="q" placeholder="Tìm kiếm..." alwaysOn />
        <SelectInput 
            source="status" 
            choices={[
                { id: 'scheduled', name: 'Đã lên lịch' },
                { id: 'in-progress', name: 'Đang diễn ra' },
                { id: 'completed', name: 'Hoàn thành' },
                { id: 'cancelled', name: 'Đã hủy' },
            ]} 
            allowEmpty
        />
        <ReferenceInput source="provider" reference="providers" label="Nhà xe" allowEmpty>
            <SelectInput optionText="name" />
        </ReferenceInput>
    </Filter>
);

export const TripList = (props) => (
    <List {...props} filters={<TripFilter />} perPage={25}>
        <Datagrid rowClick="edit">
            <ReferenceField source="route" reference="routes" label="Tuyến đường">
                <TextField source="id" />
            </ReferenceField>
            <ReferenceField source="provider" reference="providers" label="Nhà xe">
                <TextField source="name" />
            </ReferenceField>
            <DateField source="departureTime" label="Giờ đi" showTime />
            <DateField source="arrivalTime" label="Giờ đến" showTime />
            <NumberField source="price" label="Giá vé" />
            <TextField source="status" label="Trạng thái" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export const TripEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <ReferenceInput source="route" reference="routes" label="Tuyến đường" disabled>
                <SelectInput optionText="id" />
            </ReferenceInput>
            <ReferenceInput source="vehicle" reference="vehicles" label="Xe">
                <SelectInput optionText="licensePlate" />
            </ReferenceInput>
            <ReferenceInput source="driver" reference="drivers" label="Tài xế">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="provider" reference="providers" label="Nhà xe">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <DateTimeInput source="departureTime" label="Giờ đi" fullWidth />
            <DateTimeInput source="arrivalTime" label="Giờ đến" fullWidth />
            <NumberInput source="price" label="Giá vé" fullWidth />
            <SelectInput 
                source="status" 
                label="Trạng thái"
                choices={[
                    { id: 'scheduled', name: 'Đã lên lịch' },
                    { id: 'in-progress', name: 'Đang diễn ra' },
                    { id: 'completed', name: 'Hoàn thành' },
                    { id: 'cancelled', name: 'Đã hủy' },
                ]} 
                fullWidth
            />
        </SimpleForm>
    </Edit>
);

export const TripCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <ReferenceInput source="route" reference="routes" label="Tuyến đường" required>
                <SelectInput optionText="id" />
            </ReferenceInput>
            <ReferenceInput source="vehicle" reference="vehicles" label="Xe" required>
                <SelectInput optionText="licensePlate" />
            </ReferenceInput>
            <ReferenceInput source="driver" reference="drivers" label="Tài xế" required>
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="provider" reference="providers" label="Nhà xe" required>
                <SelectInput optionText="name" />
            </ReferenceInput>
            <DateTimeInput source="departureTime" label="Giờ đi" required fullWidth />
            <DateTimeInput source="arrivalTime" label="Giờ đến" required fullWidth />
            <NumberInput source="price" label="Giá vé" required fullWidth />
            <SelectInput 
                source="status" 
                label="Trạng thái"
                choices={[
                    { id: 'scheduled', name: 'Đã lên lịch' },
                    { id: 'in-progress', name: 'Đang diễn ra' },
                    { id: 'completed', name: 'Hoàn thành' },
                    { id: 'cancelled', name: 'Đã hủy' },
                ]} 
                defaultValue="scheduled"
                fullWidth
            />
        </SimpleForm>
    </Create>
);

export const TripShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout>
            <ReferenceField source="route" reference="routes" label="Tuyến đường">
                <TextField source="id" />
            </ReferenceField>
            <ReferenceField source="vehicle" reference="vehicles" label="Xe">
                <TextField source="licensePlate" />
            </ReferenceField>
            <ReferenceField source="driver" reference="drivers" label="Tài xế">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="provider" reference="providers" label="Nhà xe">
                <TextField source="name" />
            </ReferenceField>
            <DateField source="departureTime" label="Giờ đi" showTime />
            <DateField source="arrivalTime" label="Giờ đến" showTime />
            <NumberField source="price" label="Giá vé" />
            <TextField source="status" label="Trạng thái" />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <DateField source="updatedAt" label="Cập nhật lần cuối" showTime />
        </SimpleShowLayout>
    </Show>
);