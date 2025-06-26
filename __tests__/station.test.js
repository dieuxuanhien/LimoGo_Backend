const request = require('supertest');
const app = require('../src/app'); // Import ứng dụng Express đã được tách
const User = require('../src/models/user');
const Provider = require('../src/models/provider');
const Station = require('../src/models/station');
const jwt = require('jsonwebtoken');

// describe() dùng để nhóm các bài test có liên quan
describe('POST /api/stations', () => {

    // BÀI TEST 1: KỊCH BẢN THÀNH CÔNG (đã PASS)
    // it() hoặc test() là một kịch bản kiểm thử cụ thể
    it('should allow a provider to create a new pickup_point and return 201', async () => {
        // --- 1. Sắp xếp (Arrange) ---
        // Tạo dữ liệu giả cho User và Provider để test
        const user = await User.create({
            email: 'provider@test.com',
            password: 'password123',
            phoneNumber: '+84123456789',
            userRole: 'provider',
            verified: true,
        });

        const provider = await Provider.create({
            name: 'Test Provider',
            email: 'provider@test.com',
            phone: '0123456789',
            address: '123 Test Street',
            mainUser: user._id
        });
        
        // Tạo một token JWT hợp lệ cho user này
        const token = jwt.sign({ _id: user._id, role: user.userRole }, process.env.JWT_SECRET);
        
        // Dữ liệu cho station mới cần tạo
        const newStationData = {
            name: 'Điểm đón riêng quận 1',
            city: 'TP. Hồ Chí Minh',
            address: '123 Nguyễn Huệ, P. Bến Nghé, Q.1',
            type: "pickup_point"
        };

        // --- 2. Hành động (Act) ---
        // Dùng supertest để gửi request POST đến endpoint
        const response = await request(app)
            .post('/api/stations')
            .set('Authorization', `Bearer ${token}`) // Giả lập việc gửi token của user đã đăng nhập
            .send(newStationData);

        // --- 3. Khẳng định (Assert) ---
        // expect() là cách Jest kiểm tra kết quả
        expect(response.statusCode).toBe(201); // Mong đợi status code là 201 Created
        expect(response.body.success).toBe(true); // Mong đợi response có success: true
        expect(response.body.data.name).toBe(newStationData.name); // Mong đợi tên station khớp

        // KIỂM TRA LOGIC NGHIỆP VỤ QUAN TRỌNG
        // Mong đợi controller đã tự động gán đúng type và ownerProvider
        expect(response.body.data.type).toBe('pickup_point'); 
        expect(response.body.data.ownerProvider).toBe(provider._id.toString());
    });


    // --- THÊM MỚI BÀI TEST 2: KỊCH BẢN THẤT BẠI ---
    it('should return a 400 error if a provider tries to create a main_station', async () => {
        // --- Arrange ---
        // Phần setup user, provider và token tương tự
        const user = await User.create({
            email: 'provider2@test.com',
            password: 'password123',
            phoneNumber: '+84987654321',
            userRole: 'provider',
            verified: true,
        });
        const provider = await Provider.create({
            name: 'Test Provider 2',
            email: 'provider2@test.com',
            phone: '0987654321',
            address: '456 Test Street',
            mainUser: user._id
        });
        const token = jwt.sign({ _id: user._id, role: user.userRole }, process.env.JWT_SECRET);
        
        // Dữ liệu không hợp lệ: Provider cố gắng tạo 'main_station'
        const invalidStationData = {
            name: 'Bến xe Miền Đông Mới',
            city: 'TP. Hồ Chí Minh',
            address: 'Xa lộ Hà Nội',
            type: 'main_station' // <-- Điểm không hợp lệ
        };

        // --- Act ---
        const response = await request(app)
            .post('/api/stations')
            .set('Authorization', `Bearer ${token}`)
            .send(invalidStationData);

        // --- Assert ---
        expect(response.statusCode).toBe(400); // Mong đợi lỗi 400 Bad Request
        expect(response.body.success).toBe(false); // Mong đợi success: false
        expect(response.body.errors).toHaveProperty('type'); // Mong đợi có lỗi trả về cho trường 'type'
        // Kiểm tra nội dung thông báo lỗi để chắc chắn nó đến từ đúng validator
        expect(response.body.errors.type.msg).toContain('Nhà xe chỉ có thể tạo');
    });
});




// --- THÊM MỚI: NHÓM TEST CHO PATCH VÀ DELETE ---
describe('PATCH & DELETE /api/stations/:id', () => {
    let providerUser, provider, token, myStation;

    // Hook 'beforeEach' này sẽ chạy trước mỗi bài test trong khối describe này
    // Giúp chúng ta tạo sẵn dữ liệu nền mà không cần lặp lại code
    beforeEach(async () => {
        // Tạo một provider và một station của provider đó
        providerUser = await User.create({
            email: 'owner@test.com',
            password: 'password123',
            phoneNumber: '+84111222333',
            userRole: 'provider',
            verified: true,
        });
        provider = await Provider.create({
            name: 'Owner Provider',
            email: 'owner@test.com',
            phone: '0111222333',
            address: '1 Owner Street',
            mainUser: providerUser._id
        });
        token = jwt.sign({ _id: providerUser._id, role: providerUser.userRole }, process.env.JWT_SECRET);
        
        myStation = await Station.create({
            name: 'Điểm đón ban đầu',
            city: 'TP. Hồ Chí Minh',
            address: 'Địa chỉ cũ',
            type: 'pickup_point',
            ownerProvider: provider._id
        });
    });

    it('should allow a provider to update their own pickup_point', async () => {
        const updateData = {
            name: 'Điểm đón đã đổi tên',
            address: 'Địa chỉ mới sau khi cập nhật'
        };

        const response = await request(app)
            .patch(`/api/stations/${myStation._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateData);
        
        expect(response.statusCode).toBe(200);
        expect(response.body.data.name).toBe(updateData.name);
        expect(response.body.data.address).toBe(updateData.address);
    });

    it('should return 403 Forbidden if a provider tries to update another provider\'s station', async () => {
        // Tạo một provider khác (kẻ tấn công)
        const attackerUser = await User.create({ email: 'attacker@test.com', password: 'password123', phoneNumber: '+84444555666', userRole: 'provider', verified: true });
        const attackerToken = jwt.sign({ _id: attackerUser._id, role: attackerUser.userRole }, process.env.JWT_SECRET);

        const updateData = { name: 'Tên bị hack' };

        const response = await request(app)
            .patch(`/api/stations/${myStation._id}`) // Cố gắng sửa station của 'owner'
            .set('Authorization', `Bearer ${attackerToken}`) // bằng token của 'attacker'
            .send(updateData);

        // Mong đợi middleware checkOwnership chặn lại
        expect(response.statusCode).toBe(403);
    });

    it('should return 400 Bad Request when trying to delete a station that is in use by a route', async () => {
        // Tạo một Route đang sử dụng station này
        const otherStation = await Station.create({ name: 'Bến xe trung tâm', city: 'Hà Nội', address: '123 Giải Phóng', type: 'main_station' });
        const Route = require('../src/models/route');
        await Route.create({
            originStation: myStation._id,
            destinationStation: otherStation._id,
            ownerProvider: provider._id
        });

        const response = await request(app)
            .delete(`/api/stations/${myStation._id}`)
            .set('Authorization', `Bearer ${token}`);
            
        // Mong đợi controller trả về lỗi nghiệp vụ
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain('đang được sử dụng trong một tuyến đường');
    });
});