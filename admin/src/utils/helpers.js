// Utility functions for the admin panel
export const formatCurrency = (amount, currency = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return new Intl.DateTimeFormat('vi-VN', { ...defaultOptions, ...options }).format(new Date(date));
};

export const getStatusColor = (status) => {
  const statusColors = {
    // User statuses
    active: '#4caf50',
    inactive: '#f44336',
    verified: '#2196f3',
    unverified: '#ff9800',
    
    // Booking statuses
    pending: '#ff9800',
    confirmed: '#4caf50',
    cancelled: '#f44336',
    completed: '#2196f3',
    
    // Payment statuses
    paid: '#4caf50',
    unpaid: '#f44336',
    refunded: '#9c27b0',
    failed: '#f44336',
    
    // Ticket statuses
    available: '#4caf50',
    booked: '#ff9800',
    expired: '#f44336',
    
    // Vehicle statuses
    maintenance: '#ff9800',
  };
  
  return statusColors[status?.toLowerCase()] || '#757575';
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 'N/A';
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const duration = Math.abs(end - start) / (1000 * 60 * 60); // in hours
  
  if (duration < 1) {
    return `${Math.round(duration * 60)} minutes`;
  } else if (duration < 24) {
    return `${duration.toFixed(1)} hours`;
  } else {
    return `${Math.round(duration / 24)} days`;
  }
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const generateRandomCode = (prefix = '', length = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || 'Server error occurred';
  } else if (error.request) {
    // Request made but no response received
    return 'Network error - please check your connection';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};