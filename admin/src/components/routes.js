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
    Create,
    Show,
    SimpleShowLayout,
    ReferenceField,
    ReferenceInput,
    Filter,
    SearchInput,
} from 'react-admin';

const RouteFilter = (props) => (
    <Filter {...props}>
        <SearchInput source="q" placeholder="Tìm kiếm..." alwaysOn />
        <ReferenceInput source="originStation" reference="stations" label="Bến đi" allowEmpty>
            <SelectInput optionText="name" />
        </ReferenceInput>
        <ReferenceInput source="destinationStation" reference="stations" label="Bến đến" allowEmpty>
            <SelectInput optionText="name" />
        </ReferenceInput>
    </Filter>
);

export const RouteList = (props) => (
    <List {...props} filters={<RouteFilter />} perPage={25}>
        <Datagrid rowClick="edit">
            <ReferenceField source="originStation" reference="stations" label="Bến đi">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="destinationStation" reference="stations" label="Bến đến">
                <TextField source="name" />
            </ReferenceField>
            <NumberField source="distanceKm" label="Khoảng cách (km)" />
            <NumberField source="estimatedDurationMin" label="Thời gian (phút)" />
            <ReferenceField source="ownerProvider" reference="providers" label="Nhà xe sở hữu" allowEmpty>
                <TextField source="name" />
            </ReferenceField>
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export const RouteEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <ReferenceInput source="originStation" reference="stations" label="Bến đi" disabled>
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="destinationStation" reference="stations" label="Bến đến" disabled>
                <SelectInput optionText="name" />
            </ReferenceInput>
            <NumberInput source="distanceKm" label="Khoảng cách (km)" fullWidth />
            <NumberInput source="estimatedDurationMin" label="Thời gian ước tính (phút)" fullWidth />
        </SimpleForm>
    </Edit>
);

export const RouteCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <ReferenceInput source="originStation" reference="stations" label="Bến đi" required>
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="destinationStation" reference="stations" label="Bến đến" required>
                <SelectInput optionText="name" />
            </ReferenceInput>
            <NumberInput source="distanceKm" label="Khoảng cách (km)" fullWidth />
            <NumberInput source="estimatedDurationMin" label="Thời gian ước tính (phút)" fullWidth />
            <ReferenceInput source="ownerProvider" reference="providers" label="Nhà xe sở hữu" allowEmpty>
                <SelectInput optionText="name" />
            </ReferenceInput>
        </SimpleForm>
    </Create>
);

export const RouteShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout>
            <ReferenceField source="originStation" reference="stations" label="Bến đi">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="destinationStation" reference="stations" label="Bến đến">
                <TextField source="name" />
            </ReferenceField>
            <NumberField source="distanceKm" label="Khoảng cách (km)" />
            <NumberField source="estimatedDurationMin" label="Thời gian ước tính (phút)" />
            <ReferenceField source="ownerProvider" reference="providers" label="Nhà xe sở hữu" allowEmpty>
                <TextField source="name" />
            </ReferenceField>
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <DateField source="updatedAt" label="Cập nhật lần cuối" showTime />
        </SimpleShowLayout>
    </Show>
);