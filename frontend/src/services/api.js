const API_URL = "https://dyno-app-q9pp.onrender.com";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  auth: {
    async register(data) {
      return request('/api/auth/register', {
        method: 'POST',
        body: data,
      });
    },
    async verifyOTP(email, code) {
      const response = await request('/api/auth/verify', {
        method: 'POST',
        body: { email, code },
      });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    },
    async login(email, password) {
      const response = await request('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    },
    async getCurrentUser() {
      return request('/api/auth/me');
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    getUser() {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    },
    isAuthenticated() {
      return !!localStorage.getItem('token');
    },
    async forgotPassword(email) {
      return request('/api/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
    },
    async resetPassword(email, code, newPassword) {
      return request('/api/auth/reset-password', {
        method: 'POST',
        body: { email, code, newPassword },
      });
    }
  },
  workers: {
    async getAll(filters = {}) {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return request(`/api/workers${queryString}`);
    },
    async getById(id) {
      return request(`/api/workers/${id}`);
    },
    async getMe() {
      return request('/api/workers/me');
    },
    async updateProfile(profileData) {
      return request('/api/workers/profile', {
        method: 'PUT',
        body: profileData,
      });
    }
  },
  bookings: {
    async getAll() {
      return request('/api/bookings');
    },
    async create(bookingData) {
      return request('/api/bookings', {
        method: 'POST',
        body: bookingData,
      });
    },
    async updateStatus(id, status) {
      return request(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        body: { status },
      });
    }
  },
  jobs: {
    async getAll() {
      return request('/api/jobs');
    },
    async create(jobData) {
      return request('/api/jobs', {
        method: 'POST',
        body: jobData,
      });
    }
  }
};
