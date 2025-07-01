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

const ReviewFilter = (props) => (
    <Filter {...props}>
        <SearchInput source="q" placeholder="Tìm kiếm..." alwaysOn />
        <NumberInput source="rating" label="Đánh giá" />
        <ReferenceInput source="trip" reference="trips" label="Chuyến đi" allowEmpty>
            <SelectInput optionText="id" />
        </ReferenceInput>
    </Filter>
);

export const ReviewList = (props) => (
    <List {...props} filters={<ReviewFilter />} perPage={25}>
        <Datagrid rowClick="edit">
            <ReferenceField source="user" reference="users" label="Người đánh giá">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="trip" reference="trips" label="Chuyến đi">
                <TextField source="id" />
            </ReferenceField>
            <NumberField source="rating" label="Đánh giá" />
            <TextField source="comment" label="Bình luận" />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export const ReviewEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <ReferenceInput source="user" reference="users" label="Người đánh giá" disabled>
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="trip" reference="trips" label="Chuyến đi" disabled>
                <SelectInput optionText="id" />
            </ReferenceInput>
            <NumberInput source="rating" label="Đánh giá" min={1} max={5} fullWidth />
            <TextInput source="comment" label="Bình luận" multiline rows={4} fullWidth />
        </SimpleForm>
    </Edit>
);

export const ReviewCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <ReferenceInput source="user" reference="users" label="Người đánh giá" required>
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="trip" reference="trips" label="Chuyến đi" required>
                <SelectInput optionText="id" />
            </ReferenceInput>
            <NumberInput source="rating" label="Đánh giá" min={1} max={5} required fullWidth />
            <TextInput source="comment" label="Bình luận" multiline rows={4} fullWidth />
        </SimpleForm>
    </Create>
);

export const ReviewShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout>
            <ReferenceField source="user" reference="users" label="Người đánh giá">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="trip" reference="trips" label="Chuyến đi">
                <TextField source="id" />
            </ReferenceField>
            <NumberField source="rating" label="Đánh giá" />
            <TextField source="comment" label="Bình luận" />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <DateField source="updatedAt" label="Cập nhật lần cuối" showTime />
        </SimpleShowLayout>
    </Show>
);