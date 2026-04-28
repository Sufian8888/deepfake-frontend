// API Base URL
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${rawApiUrl.replace(/\/$/, '')}/api`;

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge existing headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify({ email }));
    }
    return data;
  },

  signup: async (email: string, password: string, fullName: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Signup failed' }));
      throw new Error(error.detail || 'Signup failed');
    }

    const data = await response.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify({ email, username: fullName }));
    }
    return data;
  },

  logout: async () => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  getMe: async () => {
    return fetchWithAuth(`${API_BASE_URL}/auth/me`);
  },
};

// Upload API
export const uploadAPI = {
  uploadVideo: async (file: File, onProgress?: (progress: number) => void) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${API_BASE_URL}/upload/video`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  },

  listFiles: async () => {
    return fetchWithAuth(`${API_BASE_URL}/upload/videos`);
  },

  getFile: async (videoId: number) => {
    return fetchWithAuth(`${API_BASE_URL}/upload/videos/${videoId}`);
  },

  deleteFile: async (videoId: number) => {
    return fetchWithAuth(`${API_BASE_URL}/upload/videos/${videoId}`, {
      method: 'DELETE',
    });
  },
};

// Predictions API
export const predictionsAPI = {
  startAnalysis: async (videoId: number, modelKey: string = 'final_model') => {
    const encodedModelKey = encodeURIComponent(modelKey);
    return fetchWithAuth(`${API_BASE_URL}/predictions/${videoId}/analyze?model_key=${encodedModelKey}`, {
      method: 'POST',
    });
  },

  getResult: async (videoId: number) => {
    return fetchWithAuth(`${API_BASE_URL}/predictions/${videoId}/result`);
  },

  getStatus: async (videoId: number) => {
    return fetchWithAuth(`${API_BASE_URL}/predictions/${videoId}/status`);
  },

  listModels: async () => {
    return fetchWithAuth(`${API_BASE_URL}/predictions/models`);
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    return fetchWithAuth(`${API_BASE_URL}/dashboard/stats`);
  },

  getRecentActivity: async () => {
    return fetchWithAuth(`${API_BASE_URL}/dashboard/recent-activity`);
  },
};

// Admin API
export const adminAPI = {
  getSystemStats: async () => {
    return fetchWithAuth(`${API_BASE_URL}/admin/stats`);
  },

  getAllUsers: async () => {
    return fetchWithAuth(`${API_BASE_URL}/admin/users`);
  },

  getUser: async (userId: number) => {
    return fetchWithAuth(`${API_BASE_URL}/admin/users/${userId}`);
  },

  updateUserRole: async (userId: number, role: 'admin' | 'user') => {
    return fetchWithAuth(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });
  },

  deleteUser: async (userId: number) => {
    return fetchWithAuth(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  getAllVideos: async () => {
    return fetchWithAuth(`${API_BASE_URL}/admin/videos`);
  },
};