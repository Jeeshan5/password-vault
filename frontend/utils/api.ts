import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface VaultItem {
  _id?: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  ciphertext?: string;
  iv?: string;
  salt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVaultItemData {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

export interface UpdateVaultItemData extends CreateVaultItemData {}

// Vault API functions
export const vaultAPI = {
  // Get all vault items
  getAll: async (): Promise<{ data: { items: VaultItem[] } }> => {
    const response = await api.get('/vault');
    return { data: { items: response.data } };
  },

  getItems: async (): Promise<VaultItem[]> => {
    const response = await api.get('/vault');
    return response.data;
  },

  // Create a new vault item
  create: async (data: CreateVaultItemData): Promise<VaultItem> => {
    const response = await api.post('/vault', data);
    return response.data;
  },

  createItem: async (data: CreateVaultItemData): Promise<VaultItem> => {
    const response = await api.post('/vault', data);
    return response.data;
  },

  // Update a vault item
  update: async (id: string, data: UpdateVaultItemData): Promise<VaultItem> => {
    const response = await api.put(`/vault/${id}`, data);
    return response.data;
  },

  updateItem: async (id: string, data: UpdateVaultItemData): Promise<VaultItem> => {
    const response = await api.put(`/vault/${id}`, data);
    return response.data;
  },

  // Delete a vault item
  delete: async (id: string): Promise<void> => {
    await api.delete(`/vault/${id}`);
  },

  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/vault/${id}`);
  },
};

// Auth API functions
export const authAPI = {
  // Login
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Signup
  signup: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    const response = await api.post('/auth/signup', { email, password });
    return response.data;
  },
};

export default api;