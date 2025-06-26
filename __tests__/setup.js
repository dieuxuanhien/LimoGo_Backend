const dotenv = require('dotenv');
dotenv.config({path: './.env'});

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo; // Biến để giữ instance của memory server

// Hook này sẽ chạy MỘT LẦN trước khi tất cả các bài test bắt đầu
beforeAll(async () => {
  mongo = await MongoMemoryServer.create(); // Khởi động MongoDB trên RAM
  const mongoUri = mongo.getUri(); // Lấy đường dẫn kết nối

  // Thêm các option để tăng thời gian chờ của Mongoose, đảm bảo nó
  // có đủ thời gian để kết nối tới DB ảo vừa khởi động.
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 30000, // Cho Mongoose 30s để chọn server
  });
});

// Hook này sẽ chạy TRƯỚC MỖI bài test
beforeEach(async () => {
  // Lấy tất cả các collection hiện có
  const collections = await mongoose.connection.db.collections();
  // Xóa sạch dữ liệu trong tất cả các collection
  for (let collection of collections) {
    await collection.deleteMany({});
  }
  // => Đảm bảo mỗi bài test chạy trên một DB "sạch"
});

// Hook này sẽ chạy MỘT LẦN sau khi tất cả các bài test kết thúc
afterAll(async () => {
  if (mongo) {
    await mongo.stop(); // Dừng server MongoDB ảo
  }
  await mongoose.connection.close(); // Đóng kết nối Mongoose
});