// src/seeder.js - PHIÊN BẢN KIỂM TRA LOGIC BÊN TRONG

const mongoose = require('mongoose');

// Bước này đã được xác nhận là an toàn
console.log('Requiring models...');
const Station = require('./models/station');
const Provider = require('./models/provider');
const Vehicle = require('./models/vehicle');
const Driver = require('./models/driver');
const Route = require('./models/route');
const Trip = require('./models/trip');
const Ticket = require('./models/ticket');
console.log('All models required successfully.');


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
        await Ticket.deleteMany({});
        await Trip.deleteMany({});
        await Route.deleteMany({});
        await Vehicle.deleteMany({});
        await Driver.deleteMany({});
        await Provider.deleteMany({});
        await Station.deleteMany({});
        console.log('--- Old data deleted successfully.');   
        
        console.log('--- Creating new sample data...');
        // Tạo Providers (Nhà xe)
        const providers = await Provider.insertMany([
            { name: 'Nhà xe Phương Trang', email: 'contact@futa.vn', phone: '19006067', address: '80 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh', username: 'futabus', password: 'password123', status: 'active', taxId: '0302959827' },
            { name: 'Nhà xe Thành Bưởi', email: 'contact@thanhbuoi.com', phone: '19006079', address: '266 Lê Hồng Phong, Quận 5, TP. Hồ Chí Minh', username: 'thanhbuoibus', password: 'password123', status: 'active', taxId: '0301402216' }
        ]);
        const [futaProvider, thanhBuoiProvider] = providers;
        console.log(`${providers.length} Providers đã được tạo.`);


        // Tạo Stations
        const stations = await Station.insertMany([
            { name: 'Bến xe Miền Đông', city: 'Hồ Chí Minh' },
            { name: 'Bến xe An Sương', city: 'Hồ Chí Minh' },
            { name: 'Bến xe Phía Nam Nha Trang', city: 'Nha Trang' },
            { name: 'Bến xe Liên Tỉnh Đà Lạt', city: 'Đà Lạt' }
        ]);
        const [hcmStation1, hcmStation2, nhaTrangStation, daLatStation] = stations;
        console.log(`${stations.length} Stations đã được tạo.`);

        // Tạo Drivers
        const drivers = await Driver.insertMany([
            { name: 'Nguyễn Văn A', age: 35, photo: 'url_to_photo_a.jpg', provider: futaProvider._id, currentStation: hcmStation1._id, status: 'available' },
            { name: 'Trần Thị B', age: 40, photo: 'url_to_photo_b.jpg', provider: thanhBuoiProvider._id, currentStation: hcmStation2._id, status: 'available' }
        ]);
        const [driver1, driver2] = drivers;
        console.log(`${drivers.length} Drivers đã được tạo.`);

        // Tạo Vehicles
        const vehicles = await Vehicle.insertMany([
            { type: 'Giường nằm 40 chỗ', licensePlate: '51A-123.45', capacity: 40, currentStation: hcmStation1._id },
            { type: 'Limousine 29 chỗ', licensePlate: '51B-678.90', capacity: 29, currentStation: hcmStation2._id }
        ]);
        const [vehicle1, vehicle2] = vehicles;
        console.log(`${vehicles.length} Vehicles đã được tạo.`);

        // Tạo Routes
        const routes = await Route.insertMany([
            { originStation: hcmStation1._id, destinationStation: nhaTrangStation._id, distanceKm: 430, estimatedDurationMin: 480 },
            { originStation: hcmStation2._id, destinationStation: daLatStation._id, distanceKm: 310, estimatedDurationMin: 420 },
            { originStation: daLatStation._id, destinationStation: hcmStation1._id, distanceKm: 310, estimatedDurationMin: 420 }
        ]);
        const [routeHCM_NT, routeHCM_DL, routeDL_HCM] = routes;
        console.log(`${routes.length} Routes đã được tạo.`);

        // Tạo Trips
        const trip1 = new Trip({ route: routeHCM_NT._id, vehicle: vehicle1._id, driver: driver1._id, departureTime: new Date('2025-09-15T07:00:00'), arrivalTime: new Date('2025-09-15T15:00:00'), price: 350000 });
        const trip2 = new Trip({ route: routeHCM_DL._id, vehicle: vehicle2._id, driver: driver2._id, departureTime: new Date('2025-09-16T09:30:00'), arrivalTime: new Date('2025-09-16T16:30:00'), price: 400000 });
        const trip3 = new Trip({ route: routeDL_HCM._id, vehicle: vehicle2._id, driver: driver2._id, departureTime: new Date('2025-09-17T13:00:00'), arrivalTime: new Date('2025-09-17T20:00:00'), price: 400000 });
        await trip1.save();
        await trip2.save();
        await trip3.save();
        console.log(`3 Trips đã được tạo (và các Tickets tương ứng).`);

        console.log('--- Sample data created successfully!');
    } catch (error) {
        console.error("!!! ERROR DURING SEEDING:", error);
    }
    console.log('>>> seedData function finished.');
};
    

const run = async () => {
    await connectDB();
    // Chỉ chạy seedData nếu kết nối thực sự thành công
    if (mongoose.connection.readyState === 1) { 
        await seedData();
    }
    await mongoose.disconnect();
    console.log('Disconnected.');
};

// Chạy và bắt lỗi ở cấp cao nhất
run().catch(err => {
    console.error("!!! SCRIPT FAILED AT TOP LEVEL !!!", err);
    mongoose.disconnect();
});