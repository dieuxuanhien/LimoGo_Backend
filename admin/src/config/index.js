// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const ENV_CONFIG = {
  isDevelopment,
  isProduction,
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  appName: process.env.REACT_APP_NAME || 'LimoGo Admin Panel',
  version: process.env.REACT_APP_VERSION || '1.0.0',
  enableDebugMode: isDevelopment || process.env.REACT_APP_DEBUG === 'true',
  maxFileSize: parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  supportedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  supportedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Feature flags
export const FEATURES = {
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS !== 'false',
  enableNotifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false',
  enableExport: process.env.REACT_APP_ENABLE_EXPORT !== 'false',
  enableBulkOperations: process.env.REACT_APP_ENABLE_BULK_OPS !== 'false',
  enableAdvancedFilters: process.env.REACT_APP_ENABLE_ADVANCED_FILTERS !== 'false',
};

// Default configurations
export const DEFAULT_CONFIG = {
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',
  currency: 'VND',
  locale: 'vi-VN',
  timezone: 'Asia/Ho_Chi_Minh',
  pageSize: 25,
  maxRetries: 3,
  timeout: 30000, // 30 seconds
};

// Validation rules
export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    required: true,
    pattern: /^[+]?[\d\s\-\(\)]{10,}$/,
    message: 'Please enter a valid phone number',
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must contain at least 8 characters with uppercase, lowercase, number and special character',
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Name must be between 2 and 100 characters',
  },
  licensePlate: {
    required: true,
    pattern: /^[A-Z0-9\-]{6,12}$/,
    message: 'Please enter a valid license plate',
  },
  price: {
    required: true,
    min: 0,
    message: 'Price must be greater than 0',
  },
};

// Chart colors for dashboard
export const CHART_COLORS = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
  '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
];

// Application routes
export const ROUTES = {
  DASHBOARD: '/',
  LOGIN: '/login',
  USERS: '/users',
  TICKETS: '/tickets',
  BOOKINGS: '/bookings',
  VEHICLES: '/vehicles',
  ROUTES: '/routes',
  PAYMENTS: '/payments',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  PROFILE: '/profile',
};