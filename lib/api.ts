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

export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';

export function clearAuthStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  const hadToken = Boolean(localStorage.getItem('token'));
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  if (hadToken) {
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
  }
}

export const isNetworkError = (error: unknown) =>
  error instanceof TypeError && error.message === "Failed to fetch";

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

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    if (isNetworkError(error)) {
      throw new Error(
        `Cannot reach API at ${API_BASE_URL}. Is the backend running on port 8000?`
      );
    }
    throw error;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));

    if (response.status === 401 && typeof window !== 'undefined') {
      clearAuthStorage();
    }

    throw new Error(
      typeof error.detail === 'string'
        ? error.detail
        : `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

const parseApiError = (payload: { detail?: unknown }, fallback: string) => {
  const { detail } = payload;
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item === "object" && item && "msg" in item ? String(item.msg) : String(item)))
      .join(", ");
  }
  return fallback;
};

const normalizeUser = (user: any) => ({
  id: user?.id,
  email: user?.email,
  full_name: user?.full_name ?? user?.username ?? user?.email ?? "",
  username: user?.username ?? user?.full_name ?? user?.email ?? "",
  role: user?.role ?? "user",
  created_at: user?.created_at,
  subscription_plan: user?.subscription_plan,
  subscription_status: user?.subscription_status,
  subscription_cycle: user?.subscription_cycle,
});

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
      throw new Error(parseApiError(error, 'Login failed'));
    }

    const data = await response.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(normalizeUser(data.user)));
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
      throw new Error(parseApiError(error, 'Signup failed'));
    }

    const data = await response.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(normalizeUser(data.user)));
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

  sendOTP: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to send verification code' }));
      throw new Error(error.detail || 'Failed to send verification code');
    }

    return response.json();
  },

  verifyOTP: async (email: string, otp: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to verify code' }));
      throw new Error(error.detail || 'Failed to verify code');
    }

    return response.json();
  },

  updateProfile: async (fullName: string) => {
    return fetchWithAuth(`${API_BASE_URL}/auth/profile`, {
      method: 'PATCH',
      body: JSON.stringify({ full_name: fullName }),
    });
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    return fetchWithAuth(`${API_BASE_URL}/auth/password`, {
      method: 'PATCH',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  },
};

// Contact API
export const contactAPI = {
  submit: async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to send message' }));
      throw new Error(error.detail || 'Failed to send message');
    }

    return response.json();
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

  listFiles: async (skip = 0, limit = 10) => {
    return fetchWithAuth(`${API_BASE_URL}/upload/videos?skip=${skip}&limit=${limit}`);
  },

  getFile: async (videoId: number) => {
    return fetchWithAuth(`${API_BASE_URL}/upload/videos/${videoId}`);
  },

  getLatestCompleted: async () => {
    return fetchWithAuth(`${API_BASE_URL}/upload/videos/latest-completed`);
  },

  getVideoStreamUrl: (videoId: number) => {
    const token = getAuthToken();
    const base = `${API_BASE_URL}/upload/videos/${videoId}/stream`;
    return token ? `${base}?access_token=${encodeURIComponent(token)}` : base;
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

  getResult: async (videoId: number, options?: { includeThumbnails?: boolean }) => {
    const includeThumbnails = options?.includeThumbnails ?? false;
    const query = includeThumbnails ? '?include_thumbnails=true' : '?include_thumbnails=false';
    return fetchWithAuth(`${API_BASE_URL}/predictions/${videoId}/result${query}`);
  },

  getFrameThumbnails: async (videoId: number, offset = 0, limit = 50) => {
    const query = new URLSearchParams({
      offset: String(offset),
      limit: String(limit),
    });
    return fetchWithAuth(`${API_BASE_URL}/predictions/${videoId}/frames/thumbnails?${query}`);
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

// Billing API
export const billingAPI = {
  createCheckoutSession: async (plan: 'pro' | 'enterprise', billingCycle: 'monthly' | 'yearly') => {
    return fetchWithAuth(`${API_BASE_URL}/billing/checkout-session`, {
      method: 'POST',
      body: JSON.stringify({ plan, billing_cycle: billingCycle }),
    });
  },

  createPortalSession: async () => {
    return fetchWithAuth(`${API_BASE_URL}/billing/portal-session`, {
      method: 'POST',
    });
  },

  confirmCheckoutSession: async (sessionId: string) => {
    return fetchWithAuth(`${API_BASE_URL}/billing/confirm-session`, {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  },

  getMe: async () => {
    return fetchWithAuth(`${API_BASE_URL}/billing/me`);
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

  getRecentActivity: async () => {
    return fetchWithAuth(`${API_BASE_URL}/admin/recent-activity`);
  },
};

// Chatbot API
export const chatbotAPI = {
  faqChat: async (message: string, history: Array<{ role: string; content: string }>) => {
    const response = await fetch(`${API_BASE_URL}/faq-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Failed to connect to chatbot" }));
      throw new Error(error.detail || "Failed to connect to chatbot");
    }

    return response.json();
  },

  analysisChat: async (message: string, history: Array<{ role: string; content: string }>) => {
    return fetchWithAuth(`${API_BASE_URL}/chatbot/query`, {
      method: "POST",
      body: JSON.stringify({ message, history }),
    });
  },
};

