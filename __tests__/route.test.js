const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const Provider = require('../src/models/provider');
const Station = require('../src/models/station');
const jwt = require('jsonwebtoken');

describe('POST /api/routes', () => {
    let providerUser, provider, token, mainStation, pickupPoint;

    // Tạo sẵn dữ liệu nền cho các bài test trong khối describe này
    beforeEach(async () => {
        // 1. Tạo một Provider để thực hiện test
        providerUser = await User.create({
            email: 'routeprovider@test.com',
            password: 'password123',
            phoneNumber: '+84123123123',
            userRole: 'provider',
            verified: true,
        });
        provider = await Provider.create({
            name: 'Route Test Provider',
            email: 'routeprovider@test.com',
            phone: '0123123123',
            address: '123 Route Street',
            mainUser: providerUser._id
        });
        token = jwt.sign({ _id: providerUser._id, role: providerUser.userRole }, process.env.JWT_SECRET);

        // 2. Tạo một bến xe chính (do Admin quản lý, không có ownerProvider)
        mainStation = await Station.create({
            name: 'Bến xe Trung tâm Thành phố',
            city: 'Thành phố Lớn',
            address: '1 Trung tâm',
            type: 'main_station'
        });

        // 3. Tạo một điểm đón riêng (thuộc sở hữu của Provider ở trên)
        pickupPoint = await Station.create({
            name: 'Điểm đón riêng của tôi',
            city: 'Thành phố Lớn',
            address: '123 Đường riêng',
            type: 'pickup_point',
            ownerProvider: provider._id
        });
    });

    it('should allow a provider to create a route using a main_station and their own pickup_point', async () => {
        // --- Arrange ---
        // Dữ liệu cho tuyến đường mới, sử dụng các bến xe vừa tạo ở trên
        const newRouteData = {
            originStation: mainStation._id,
            destinationStation: pickupPoint._id,
            distanceKm: 50,
            estimatedDurationMin: 90
        };

        // --- Act ---
        const response = await request(app)
            .post('/api/routes')
            .set('Authorization', `Bearer ${token}`)
            .send(newRouteData);

        // --- Assert ---
        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('ownerProvider');
        
        // KIỂM TRA LOGIC NGHIỆP VỤ QUAN TRỌNG
        // Đảm bảo tuyến đường được tạo ra thuộc sở hữu của đúng provider
        expect(response.body.data.ownerProvider).toBe(provider._id.toString());
    });

    // --- THÊM MỚI BÀI TEST 2: KỊCH BẢN THẤT BẠI QUAN TRỌNG ---
    it('should return 400 when a provider tries to use another provider\'s pickup_point', async () => {
        // --- Arrange ---
        // 1. Tạo Provider B và điểm đón riêng của họ
        const providerUserB = await User.create({ email: 'providerB@test.com', password: 'password123', phoneNumber: '+84456456456', userRole: 'provider', verified: true });
        const providerB = await Provider.create({ name: 'Provider B', email: 'providerB@test.com', phone: '0456456456', address: '456 Street B', mainUser: providerUserB._id });
        const otherProvidersPickupPoint = await Station.create({
            name: 'Điểm đón bí mật của B',
            city: 'Thành phố Lớn',
            address: '456 Đường B',
            type: 'pickup_point',
            ownerProvider: providerB._id // Điểm này thuộc sở hữu của B
        });

        // 2. Provider A cố gắng tạo route bằng điểm đón của Provider B
        const invalidRouteData = {
            originStation: mainStation._id,
            destinationStation: otherProvidersPickupPoint._id // Sử dụng điểm đón của B
        };
        
        // --- Act ---
        // Gửi request bằng token của Provider A
        const response = await request(app)
            .post('/api/routes')
            .set('Authorization', `Bearer ${token}`) 
            .send(invalidRouteData);

        // --- Assert ---
        // Mong đợi custom validator sẽ chặn request này
        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        // Kiểm tra xem có lỗi trả về cho đúng trường không
        expect(response.body.errors).toHaveProperty('destinationStation');
        // Kiểm tra nội dung thông báo lỗi
        expect(response.body.errors.destinationStation.msg).toContain('Bạn không có quyền sử dụng bến xe/trạm đón');
    });

});


describe('GET & DELETE /api/routes', () => {
    let providerA_User, providerA, tokenA;
    let providerB_User, providerB;
    let systemRoute, routeOfA;

    beforeEach(async () => {
        // Tạo Provider A
        providerA_User = await User.create({ email: 'providerA_get@test.com', password: 'password123', phoneNumber: '+84111111111', userRole: 'provider', verified: true });
        providerA = await Provider.create({ name: 'Provider A', email: 'providerA_get@test.com', phone: '0111111111', address: '1 A Street', mainUser: providerA_User._id });
        tokenA = jwt.sign({ _id: providerA_User._id, role: providerA_User.userRole }, process.env.JWT_SECRET);
        
        // Tạo Provider B
        providerB_User = await User.create({ email: 'providerB_get@test.com', password: 'password123', phoneNumber: '+84222222222', userRole: 'provider', verified: true });
        providerB = await Provider.create({ name: 'Provider B', email: 'providerB_get@test.com', phone: '0222222222', address: '2 B Street', mainUser: providerB_User._id });

        // Tạo 2 bến xe chính
        const mainStation1 = await Station.create({ name: 'BX Trung tâm 1', city: 'City', address: '1 Center', type: 'main_station' });
        const mainStation2 = await Station.create({ name: 'BX Trung tâm 2', city: 'City', address: '2 Center', type: 'main_station' });

        // Tạo 1 tuyến đường hệ thống (do Admin tạo -> ownerProvider là null)
        const Route = require('../src/models/route'); // require ở đây để tránh lỗi circular dependency nếu import ở đầu file
        systemRoute = await Route.create({ originStation: mainStation1._id, destinationStation: mainStation2._id });

        // Tạo 1 tuyến đường riêng của Provider A
        routeOfA = await Route.create({ originStation: mainStation1._id, destinationStation: mainStation2._id, ownerProvider: providerA._id });

        // Tạo 1 tuyến đường riêng của Provider B (để kiểm tra xem A có thấy không)
        await Route.create({ originStation: mainStation1._id, destinationStation: mainStation2._id, ownerProvider: providerB._id });
    });

    it('should return 403 Forbidden when a provider tries to delete a system route', async () => {
        const response = await request(app)
            .delete(`/api/routes/${systemRoute._id}`) // Cố gắng xóa tuyến của hệ thống
            .set('Authorization', `Bearer ${tokenA}`); // bằng token của A

        // Mong đợi middleware checkOwnership chặn lại
        expect(response.statusCode).toBe(403);
        expect(response.body.message).toContain('Bạn không có quyền chỉnh sửa tài nguyên này.');
    });

    it('should return only system routes and self-owned routes for a provider', async () => {
        const response = await request(app)
            .get('/api/routes')
            .set('Authorization', `Bearer ${tokenA}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        
        // Mong đợi chỉ nhận được 2 tuyến đường
        expect(response.body.data).toHaveLength(2);

        const receivedRouteIds = response.body.data.map(r => r._id.toString());
        // Kiểm tra xem 2 tuyến đường nhận được có phải là systemRoute và routeOfA không
        expect(receivedRouteIds).toContain(systemRoute._id.toString());
        expect(receivedRouteIds).toContain(routeOfA._id.toString());
    });
});