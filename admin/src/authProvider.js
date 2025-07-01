const apiUrl = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api';

// Helper function to decode JWT token
const decodeJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
};

const authProvider = {
    login: ({ username, password }) => {
        const request = new Request(`${apiUrl}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email: username, password }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        });
        
        return fetch(request)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(auth => {
                if (!auth.success) {
                    throw new Error(auth.message || 'Login failed');
                }
                
                const token = auth.data.token;
                const decodedToken = decodeJWT(token);
                
                if (!decodedToken) {
                    throw new Error('Invalid token');
                }
                
                // Lấy role từ JWT token (trong JWT là 'role', không phải 'userRole')
                if (decodedToken.role !== 'admin') { 
                    throw new Error('Bạn không có quyền truy cập trang quản trị.');
                }
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify({
                    _id: decodedToken._id,
                    email: decodedToken.email,
                    role: decodedToken.role,
                    phoneNumber: decodedToken.phoneNumber,
                    verified: decodedToken.verified
                }));
                localStorage.setItem('permissions', decodedToken.role);
            })
            .catch(error => {
                throw new Error(error.message || 'Network error');
            });
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
        return Promise.resolve();
    },
    
    checkError: ({ status }) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('permissions');
            return Promise.reject();
        }
        return Promise.resolve();
    },
    
    checkAuth: () => {
        return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
    },
    
    getPermissions: () => {
        const role = localStorage.getItem('permissions');
        return role ? Promise.resolve(role) : Promise.reject();
    },
    
    getIdentity: () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return Promise.resolve({
                id: user._id || user.id,
                fullName: user.name || user.email,
                avatar: user.avatar || undefined,
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },
};

export default authProvider;