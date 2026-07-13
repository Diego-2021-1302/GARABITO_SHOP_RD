import api from './axios';

export const authService = {
  login: async (credentials: any) => {
    const { data } = await api.post('/login', credentials);
    return data;
  },
  register: async (userData: any) => {
    const { data } = await api.post('/register', userData);
    return data;
  },
  logout: async () => {
    return await api.post('/logout');
  },
  getMe: async () => {
    const { data } = await api.get('/user');
    return data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await api.post('/forgot-password', { email });
    return data;
  },
  resetPassword: async (resetData: any) => {
    const { data } = await api.post('/reset-password', resetData);
    return data;
  },
  resendVerificationEmail: async () => {
    const { data } = await api.post('/email/verification-notification');
    return data;
  },
  verifyEmail: async (url: string) => {
    const { data } = await api.get(url);
    return data;
  }
};

export default authService;
