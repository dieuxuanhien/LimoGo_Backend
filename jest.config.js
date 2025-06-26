module.exports = {
  // Môi trường test là Node.js
  testEnvironment: 'node',

  // Jest sẽ tìm các file test trong các thư mục __tests__
  // và có đuôi là .test.js
  testMatch: ['**/__tests__/**/*.test.js'],
  
  // Chạy file setup.js trước khi các bài test được thực thi
  // Đây là phần quan trọng nhất để quản lý database
  setupFilesAfterEnv: ['./__tests__/setup.js'],
  
  // Thời gian chờ tối đa cho một bài test (tăng lên để db-memory-server có thời gian khởi động)
  testTimeout: 30000, 
};