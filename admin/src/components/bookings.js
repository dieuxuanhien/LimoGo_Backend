import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    ReferenceField,
    Edit,
    SimpleForm,
    SelectInput,
    Show,
    SimpleShowLayout,
    EditButton,
    ShowButton,
    Filter,
    SearchInput,
    useRecordContext,
} from 'react-admin';
import { Chip } from '@mui/material';

// Custom status fields
const PaymentStatusField = ({ source }) => {
    const record = useRecordContext();
    if (!record || !record[source]) return null;
    
    const statusColors = {
        pending: 'warning',
        completed: 'success',
        failed: 'error',
        expired: 'default'
    };
    
    const statusLabels = {
        pending: 'Đang chờ',
        completed: 'Hoàn thành',
        failed: 'Thất bại',
        expired: 'Hết hạn'
    };
    
    return (
        <Chip 
            label={statusLabels[record[source]] || record[source]} 
            color={statusColors[record[source]] || 'default'} 
            size="small" 
        />
    );
};

const ApprovalStatusField = ({ source }) => {
    const record = useRecordContext();
    if (!record || !record[source]) return null;
    
    const statusColors = {
        pending_approval: 'warning',
        confirmed_by_provider: 'info',
        confirmed: 'success',
        cancelled: 'error'
    };
    
    const statusLabels = {
        pending_approval: 'Chờ duyệt',
        confirmed_by_provider: 'Nhà xe đã duyệt',
        confirmed: 'Đã xác nhận',
        cancelled: 'Đã hủy'
    };
    
    return (
        <Chip 
            label={statusLabels[record[source]] || record[source]} 
            color={statusColors[record[source]] || 'default'} 
            size="small" 
        />
    );
};

const BookingFilter = (props) => (
    <Filter {...props}>
        <SearchInput source="q" placeholder="Tìm kiếm" alwaysOn />
        <SelectInput 
            source="paymentStatus" 
            label="Trạng thái thanh toán"
            choices={[
                { id: 'pending', name: 'Đang chờ' },
                { id: 'completed', name: 'Hoàn thành' },
                { id: 'failed', name: 'Thất bại' },
                { id: 'expired', name: 'Hết hạn' },
            ]} 
        />
        <SelectInput 
            source="paymentMethod" 
            label="Phương thức thanh toán"
            choices={[
                { id: 'cash', name: 'Tiền mặt' },
                { id: 'bank_transfer', name: 'Chuyển khoản' },
            ]} 
        />
    </Filter>
);

export const BookingList = () => (
    <List filters={<BookingFilter />} perPage={25} sort={{ field: 'createdAt', order: 'DESC' }}>
        <Datagrid>
            <ReferenceField source="user" reference="users" label="Người dùng">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="provider" reference="providers" label="Nhà xe">
                <TextField source="name" />
            </ReferenceField>
            <NumberField source="totalPrice" label="Tổng tiền" options={{ style: 'currency', currency: 'VND' }} />
            <TextField source="paymentMethod" label="Phương thức" />
            <PaymentStatusField source="paymentStatus" label="TT Thanh toán" />
            <ApprovalStatusField source="approvalStatus" label="TT Duyệt" />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <ShowButton />
            <EditButton />
        </Datagrid>
    </List>
);

export const BookingShow = () => (
    <Show>
        <SimpleShowLayout>
            <ReferenceField source="user" reference="users" label="Người dùng">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="provider" reference="providers" label="Nhà xe">
                <TextField source="name" />
            </ReferenceField>
            <NumberField source="totalPrice" label="Tổng tiền" options={{ style: 'currency', currency: 'VND' }} />
            <TextField source="paymentMethod" label="Phương thức thanh toán" />
            <PaymentStatusField source="paymentStatus" label="Trạng thái thanh toán" />
            <ApprovalStatusField source="approvalStatus" label="Trạng thái duyệt" />
            <DateField source="bookingExpiresAt" label="Hết hạn lúc" showTime />
            <DateField source="createdAt" label="Ngày tạo" showTime />
            <DateField source="updatedAt" label="Cập nhật cuối" showTime />
        </SimpleShowLayout>
    </Show>
);

export const BookingEdit = () => (
    <Edit>
        <SimpleForm>
            <NumberField source="totalPrice" label="Tổng tiền" />
            <SelectInput 
                source="paymentMethod" 
                label="Phương thức thanh toán"
                choices={[
                    { id: 'cash', name: 'Tiền mặt' },
                    { id: 'bank_transfer', name: 'Chuyển khoản' },
                ]} 
                disabled
            />
            <SelectInput 
                source="paymentStatus" 
                label="Trạng thái thanh toán"
                choices={[
                    { id: 'pending', name: 'Đang chờ' },
                    { id: 'completed', name: 'Hoàn thành' },
                    { id: 'failed', name: 'Thất bại' },
                    { id: 'expired', name: 'Hết hạn' },
                ]} 
            />
            <SelectInput 
                source="approvalStatus" 
                label="Trạng thái duyệt"
                choices={[
                    { id: 'pending_approval', name: 'Chờ duyệt' },
                    { id: 'confirmed_by_provider', name: 'Nhà xe đã duyệt' },
                    { id: 'confirmed', name: 'Đã xác nhận' },
                    { id: 'cancelled', name: 'Đã hủy' },
                ]} 
            />
        </SimpleForm>
    </Edit>
);