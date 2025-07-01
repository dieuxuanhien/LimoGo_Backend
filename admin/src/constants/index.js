// API endpoints configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Users
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    ME: '/users/me',
    UPDATE_ME: '/users/updateMe',
    UPDATE_PASSWORD: '/users/updateMyPassword',
    DELETE_ME: '/users/deleteMe',
  },
  
  // Tickets
  TICKETS: {
    LIST: '/tickets',
    CREATE: '/tickets',
    GET: (id) => `/tickets/${id}`,
    UPDATE: (id) => `/tickets/${id}`,
    DELETE: (id) => `/tickets/${id}`,
    SEARCH: '/tickets/search',
  },
  
  // Bookings
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    GET: (id) => `/bookings/${id}`,
    UPDATE: (id) => `/bookings/${id}`,
    DELETE: (id) => `/bookings/${id}`,
    USER_BOOKINGS: (userId) => `/bookings/user/${userId}`,
    CANCEL: (id) => `/bookings/${id}/cancel`,
  },
  
  // Vehicles
  VEHICLES: {
    LIST: '/vehicles',
    CREATE: '/vehicles',
    GET: (id) => `/vehicles/${id}`,
    UPDATE: (id) => `/vehicles/${id}`,
    DELETE: (id) => `/vehicles/${id}`,
    AVAILABLE: '/vehicles/available',
  },
  
  // Routes
  ROUTES: {
    LIST: '/routes',
    CREATE: '/routes',
    GET: (id) => `/routes/${id}`,
    UPDATE: (id) => `/routes/${id}`,
    DELETE: (id) => `/routes/${id}`,
    POPULAR: '/routes/popular',
  },
  
  // Payments
  PAYMENTS: {
    LIST: '/payments',
    CREATE: '/payments',
    GET: (id) => `/payments/${id}`,
    UPDATE: (id) => `/payments/${id}`,
    DELETE: (id) => `/payments/${id}`,
    USER_PAYMENTS: (userId) => `/payments/user/${userId}`,
    REFUND: (id) => `/payments/${id}/refund`,
  },
  
  // Analytics & Reports
  ANALYTICS: {
    DASHBOARD_STATS: '/analytics/dashboard',
    USER_STATS: '/analytics/users',
    BOOKING_STATS: '/analytics/bookings',
    REVENUE_STATS: '/analytics/revenue',
    VEHICLE_UTILIZATION: '/analytics/vehicles',
  },
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  DRIVER: 'driver',
  CUSTOMER: 'customer',
};

// Booking statuses
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress',
};

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

// Payment methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
  E_WALLET: 'e_wallet',
};

// Vehicle types
export const VEHICLE_TYPES = {
  SEDAN: 'sedan',
  SUV: 'suv',
  LIMOUSINE: 'limousine',
  VAN: 'van',
  BUS: 'bus',
};

// Vehicle statuses
export const VEHICLE_STATUS = {
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'inactive',
};

// Ticket statuses
export const TICKET_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  EXPIRED: 'expired',
};

// Gender options
export const GENDER_OPTIONS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
};

// Date formats
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD/MM/YYYY HH:mm',
  TIME_ONLY: 'HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_ROLE: 'userRole',
  USER_DATA: 'userData',
  THEME_PREFERENCE: 'themePreference',
  LANGUAGE_PREFERENCE: 'languagePreference',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error - please check your connection',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Please check your input and try again',
  SERVER_ERROR: 'Server error occurred',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  CREATE_SUCCESS: 'Record created successfully!',
  UPDATE_SUCCESS: 'Record updated successfully!',
  DELETE_SUCCESS: 'Record deleted successfully!',
  SAVE_SUCCESS: 'Changes saved successfully!',
};