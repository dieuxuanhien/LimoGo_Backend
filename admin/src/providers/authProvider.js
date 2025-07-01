import { fetchUtils } from 'react-admin';

const authProvider = {
  // Fix: transform username to email for backend compatibility
  login: ({ username, password }) => {
    // Map username field to email field expected by backend
    const email = username;
    
    return fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => {
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText || 'Login failed');
        }
        return response.json();
      })
      .then(responseData => {
        // Handle different response structures
        if (responseData.data && responseData.data.token) {
          // Standard response: { data: { token: '...' } }
          localStorage.setItem('auth', responseData.data.token);
          localStorage.setItem('user', JSON.stringify(responseData.data));
          return Promise.resolve();
        } 
        else if (responseData.token) {
          // Alternative response: { token: '...' }
          localStorage.setItem('auth', responseData.token);
          localStorage.setItem('user', JSON.stringify(responseData.data || {}));
          return Promise.resolve();
        }
        return Promise.reject('Login failed: No token received');
      })
      .catch(error => {
        console.error('Login error:', error);
        return Promise.reject(error.message || 'Login failed');
      });
  },

  logout: () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('user');
    return Promise.resolve();
  },

  checkError: (error) => {
    // Handle case when error is undefined or doesn't have status
    if (!error || !error.status) return Promise.resolve();
    
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem('auth');
      localStorage.removeItem('user');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  checkAuth: () => {
    return localStorage.getItem('auth') ? Promise.resolve() : Promise.reject();
  },

  getPermissions: () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return Promise.resolve(user.userRole || 'guest');
    } catch (e) {
      return Promise.resolve('guest');
    }
  },

  getIdentity: () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return Promise.resolve({
        id: user._id || '',
        fullName: user.name || 'Admin User',
        avatar: user.avatar || 'https://ui-avatars.com/api/?name=Admin+User',
      });
    } catch (e) {
      return Promise.resolve({
        id: '',
        fullName: 'Admin User',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User',
      });
    }
  },
};

export default authProvider;