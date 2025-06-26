const mongoose = require('mongoose');
const hash = require('./utils/hashing'); 


// Import các model
const User = require('./models/user');
const Station = require('./models/station');
const Provider = require('./models/provider');
const Vehicle = require('./models/vehicle');
const Driver = require('./models/driver');
const Route = require('./models/route');
const Trip = require('./models/trip');
const Ticket = require('./models/ticket');

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    if (!MONGO_URI) {
        console.error('Lỗi: MONGO_URI chưa được định nghĩa trong file .env');
        process.exit(1);
    }
    try {
        await mongoose.connect(MONGO_URI);
        console.log('>>> SUCCESS: MongoDB connected successfully!');
    } catch (error) {
        console.error('>>> FAILED: MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        console.log('--- Deleting old data...');
        // Xóa dữ liệu cũ
        await Ticket.deleteMany({});
        await Trip.deleteMany({});
        await Route.deleteMany({});
        await Vehicle.deleteMany({});
        await Driver.deleteMany({});
        await Provider.deleteMany({});
        await Station.deleteMany({});
        await User.deleteMany({}); 
        console.log('--- Old data deleted successfully.');

        console.log('--- Creating new sample data...');

        // --- 1. Tạo Users ---
        let usersToCreate = [
            { email: 'admin@limogo.com', password: 'password123', phoneNumber: '+84111111111', userRole: 'admin', name: 'Admin LimoGo', verified: true },
            { email: 'provider.futa@limogo.com', password: 'password123', phoneNumber: '+84222222222', userRole: 'provider', name: 'Provider Futa', verified: true },
            { email: 'provider.thanhbuoi@limogo.com', password: 'password123', phoneNumber: '+84333333333', userRole: 'provider', name: 'Provider Thanh Buoi', verified: true },
            { email: 'customer1@gmail.com', password: 'password123', phoneNumber: '+84444444444', userRole: 'customer', name: 'Customer A', verified: true },
            { email: 'customer2@gmail.com', password: 'password123', phoneNumber: '+85555555555', userRole: 'customer', name: 'Customer B', verified: true }
        ];

        // Băm mật khẩu cho từng user
        for (let user of usersToCreate) {
            user.password = await hash.hashPassword(user.password);
        }

        const users = await User.insertMany(usersToCreate);
        console.log(`${users.length} Users đã được tạo.`);

        console.log('--- Finding specific users for linking...');
        const futaProviderUser = await User.findOne({ email: 'provider.futa@limogo.com' });
        const thanhBuoiProviderUser = await User.findOne({ email: 'provider.thanhbuoi@limogo.com' });


         // --- 2. Tạo Providers và liên kết với User một cách an toàn ---
        const providers = await Provider.insertMany([
            { name: 'Nhà xe Phương Trang', email: 'contact@futa.vn', phone: '19006067', address: '80 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh', status: 'active', mainUser: futaProviderUser._id },
            { name: 'Nhà xe Thành Bưởi', email: 'contact@thanhbuoi.com', phone: '19006079', address: '266 Lê Hồng Phong, Quận 5, TP. Hồ Chí Minh', status: 'active', mainUser: thanhBuoiProviderUser._id }
        ]);
        const [futaProvider, thanhBuoiProvider] = providers;
        console.log(`${providers.length} Providers đã được tạo.`);


        // === BƯỚC 3: TẠO STATIONS (ĐÃ CẬP NHẬT) ===
        console.log('--- Creating Stations (Hybrid Model)...');
        // A. Tạo các Bến xe chính thức (do Admin quản lý)
        const mainStations = await Station.insertMany([
            { 
                name: 'Bến xe Miền Đông', 
                city: 'Hồ Chí Minh', 
                address: 'Quốc lộ 13, Phường 26, Bình Thạnh, Thành phố Hồ Chí Minh',
                type: 'main_station' // Loại: Bến xe chính
            },
            { 
                name: 'Bến xe Phía Nam Nha Trang', 
                city: 'Nha Trang', 
                address: 'ĐL Võ Nguyên Giáp, Vĩnh Trung, Nha Trang, Khánh Hòa',
                type: 'main_station' 
            },
            { 
                name: 'Bến xe Liên Tỉnh Đà Lạt', 
                city: 'Đà Lạt', 
                address: '1 Tô Hiến Thành, Phường 3, Thành phố Đà Lạt, Lâm Đồng',
                type: 'main_station' 
            }
        ]);
        const [mainStationHCM, mainStationNT, mainStationDL] = mainStations;
        console.log(`${mainStations.length} Main Stations đã được tạo.`);

        // B. Tạo các Điểm đón/trả riêng (do Provider sở hữu)
        const pickupPoints = await Station.insertMany([
            {
                name: 'Văn phòng Phương Trang - Lê Hồng Phong',
                city: 'Hồ Chí Minh',
                address: '202-204 Lê Hồng Phong, Phường 4, Quận 5, Thành phố Hồ Chí Minh',
                type: 'pickup_point', // Loại: Điểm đón riêng
                ownerProvider: futaProvider._id // Thuộc sở hữu của Phương Trang
            },
            {
                name: 'Văn phòng Thành Bưởi - Lê Hồng Phong',
                city: 'Hồ Chí Minh',
                address: '266-268 Lê Hồng Phong, Phường 4, Quận 5, Thành phố Hồ Chí Minh',
                type: 'pickup_point',
                ownerProvider: thanhBuoiProvider._id // Thuộc sở hữu của Thành Bưởi
            }
        ]);
        const [futaPickupPoint, thanhBuoiPickupPoint] = pickupPoints;
        console.log(`${pickupPoints.length} Pickup Points đã được tạo.`);

         // --- 4. Tạo Drivers (cập nhật currentStation cho đúng) ---
         const drivers = await Driver.insertMany([
         { name: 'Nguyễn Văn A', age: 35, photo: '...', provider: futaProvider._id, currentStation: mainStationHCM._id },
         { name: 'Trần Thị C', age: 40, photo: '...', provider: thanhBuoiProvider._id, currentStation: mainStationDL._id }
        ]);
         const [driverFuta, driverThanhBuoi] = drivers;
         console.log(`${drivers.length} Drivers đã được tạo.`);


        // --- 5. Tạo Vehicles (ĐÃ SỬA ĐỔI) ---
        console.log('--- Creating vehicles with provider links...');
        // Xe để test xóa thành công (thuộc Phương Trang)
        const vehicleA1_ok_to_delete = await Vehicle.create(
            { type: 'Giường nằm 40 chỗ', licensePlate: '51A-OKDELETE', capacity: 40, currentStation: mainStationHCM._id, provider: futaProvider._id }
        );
        // Xe để test xóa thất bại (thuộc Phương Trang)
        const vehicleA2_for_trip = await Vehicle.create(
            { type: 'Limousine 29 chỗ', licensePlate: '51B-FORTRIP', capacity: 29, currentStation: futaPickupPoint._id, provider: futaProvider._id }
        );
        // Xe của nhà xe khác để test cấm truy cập (thuộc Thành Bưởi)
        const vehicleB1_foreign = await Vehicle.create(
            { type: 'Limousine 9 chỗ', licensePlate: '51C-FOREIGN', capacity: 9, currentStation: thanhBuoiPickupPoint._id, provider: thanhBuoiProvider._id }
        );

        // Tạo thêm 12 xe cho Phương Trang để test phân trang
        for (let i = 1; i <= 12; i++) {
            await Vehicle.create({
                type: 'Xe Test Phân Trang',
                licensePlate: `51P-PAGE${i.toString().padStart(2, '0')}`,
                capacity: 30,
                currentStation: mainStationHCM._id,
                provider: futaProvider._id
            });
        }
        console.log(`15 Vehicles đã được tạo (3 xe test chính + 12 xe test phân trang).`);
        
        

        // --- 6. Tạo Routes (cập nhật để dùng các station mới) ---
        const routes = await Route.insertMany([
            // Tuyến chính: Bến xe <-> Bến xe
            { originStation: mainStationHCM._id, destinationStation: mainStationDL._id },
            // Tuyến lai: Bến xe chính <-> Điểm đón riêng
            { originStation: mainStationNT._id, destinationStation: futaPickupPoint._id }
        ]);
        const [routeHCM_DL, routeHCM_NT] = routes;
        console.log(`${routes.length} Routes đã được tạo.`);


        // --- 7. Tạo Trips ---
        const trip1 = new Trip({ route: routeHCM_NT._id, vehicle: vehicleA1_ok_to_delete._id, driver: driverFuta._id, provider: futaProvider._id, departureTime: new Date('2025-09-15T07:00:00'), arrivalTime: new Date('2025-09-15T15:00:00'), price: 350000 });
        const trip2 = new Trip({ route: routeHCM_DL._id, vehicle: vehicleB1_foreign._id, driver: driverThanhBuoi._id, provider: thanhBuoiProvider._id, departureTime: new Date('2025-09-16T09:30:00'), arrivalTime: new Date('2025-09-16T16:30:00'), price: 400000 });
        const tripForDeletionTest = new Trip({ 
            route: routeHCM_DL._id, 
            vehicle: vehicleA2_for_trip._id, 
            driver: driverFuta._id, 
            provider: futaProvider._id, 
            departureTime: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // 10 ngày sau
            arrivalTime: new Date(new Date().getTime() + 10.5 * 24 * 60 * 60 * 1000), 
            price: 400000 
        });
        const tripForReview = new Trip({ 
            route: routeHCM_NT._id, 
            vehicle: vehicleA2_for_trip._id, 
            driver: driverFuta._id, 
            provider: futaProvider._id, 
            status: 'completed', // <-- Sửa thành 'completed'
            departureTime: new Date('2024-06-20T07:00:00Z'), // <-- Đổi thành ngày trong quá khứ
            arrivalTime: new Date('2024-06-20T15:00:00Z'),   // <-- Đổi thành ngày trong quá khứ
            price: 350000 
        });
        await trip1.save();
        await trip2.save();
        await tripForDeletionTest.save(); 
        await tripForReview.save();
        console.log(`4 Trips đã được tạo (và các Tickets tương ứng).`);
        
        console.log('--- Sample data created successfully!');

    } catch (error) {
        console.error("!!! ERROR DURING SEEDING:", error);
    }
};

const run = async () => {
    await connectDB();
    if (mongoose.connection.readyState === 1) {
        await seedData();
    }
    await mongoose.disconnect();
    console.log('Disconnected.');
};

run().catch(err => {
    console.error("!!! SCRIPT FAILED AT TOP LEVEL !!!", err);
    mongoose.disconnect();
});