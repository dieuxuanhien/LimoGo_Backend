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


        // --- 3. Tạo Stations ---
        const stations = await Station.insertMany([
            { name: 'Bến xe Miền Đông', city: 'Hồ Chí Minh' },
            { name: 'Bến xe An Sương', city: 'Hồ Chí Minh' },
            { name: 'Bến xe Phía Nam Nha Trang', city: 'Nha Trang' },
            { name: 'Bến xe Liên Tỉnh Đà Lạt', city: 'Đà Lạt' }
        ]);
        const [hcmStation1, hcmStation2, nhaTrangStation, daLatStation] = stations;
        console.log(`${stations.length} Stations đã được tạo.`);
        
        // --- 4. Tạo Drivers ---
        const drivers = await Driver.insertMany([
            { name: 'Nguyễn Văn A', age: 35, photo: 'url_to_photo_a.jpg', provider: futaProvider._id, currentStation: hcmStation1._id, status: 'available' },
            { name: 'Trần Thị B', age: 40, photo: 'url_to_photo_b.jpg', provider: thanhBuoiProvider._id, currentStation: hcmStation2._id, status: 'available' }
        ]);
        const [driver1, driver2] = drivers;
        console.log(`${drivers.length} Drivers đã được tạo.`);

        // --- 5. Tạo Vehicles ---
        const vehicles = await Vehicle.insertMany([
            { type: 'Giường nằm 40 chỗ', licensePlate: '51A-123.45', capacity: 40, currentStation: hcmStation1._id },
            { type: 'Limousine 29 chỗ', licensePlate: '51B-678.90', capacity: 29, currentStation: hcmStation2._id }
        ]);
        const [vehicle1, vehicle2] = vehicles;
        console.log(`${vehicles.length} Vehicles đã được tạo.`);
        
        // --- 6. Tạo Routes ---
        const routes = await Route.insertMany([
            { originStation: hcmStation1._id, destinationStation: nhaTrangStation._id, distanceKm: 430, estimatedDurationMin: 480 },
            { originStation: hcmStation2._id, destinationStation: daLatStation._id, distanceKm: 310, estimatedDurationMin: 420 }
        ]);
        const [routeHCM_NT, routeHCM_DL] = routes;
        console.log(`${routes.length} Routes đã được tạo.`);

        // --- 7. Tạo Trips ---
        const trip1 = new Trip({ route: routeHCM_NT._id, vehicle: vehicle1._id, driver: driver1._id, provider: futaProvider._id, departureTime: new Date('2025-09-15T07:00:00'), arrivalTime: new Date('2025-09-15T15:00:00'), price: 350000 });
        const trip2 = new Trip({ route: routeHCM_DL._id, vehicle: vehicle2._id, driver: driver2._id, provider: thanhBuoiProvider._id, departureTime: new Date('2025-09-16T09:30:00'), arrivalTime: new Date('2025-09-16T16:30:00'), price: 400000 });
        await trip1.save();
        await trip2.save();
        console.log(`2 Trips đã được tạo (và các Tickets tương ứng).`);
        
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