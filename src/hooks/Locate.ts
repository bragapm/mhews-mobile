import {create} from 'zustand';

// Definisi tipe untuk state autentikasi
interface AuthState {
  Locate: string | null;

  setAuthData: (token: string, refreshToken: string) => void;
  getProfile: () => Promise<void>;
  setProfile: (Locate: UserProfile) => void;
  reset: () => void;
}

// Definisi tipe untuk profil pengguna
interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  location: string | null;
  title: string | null;
  description: string | null;
  tags: string | null;
  avatar: string | null;
  language: string | null;
  tfa_secret: string | null;
  status: 'active' | 'inactive' | 'banned';
  role: string;
  token: string | null;
  last_access: string | null;
  last_page: string | null;
  provider: string;
  external_identifier: string | null;
  auth_data: string | null;
  email_notifications: boolean;
  appearance: string | null;
  theme_dark: string | null;
  theme_light: string | null;
  theme_light_overrides: string | null;
  theme_dark_overrides: string | null;
  NIK: string;
  phone: string;
  password: string;
}

// Membuat store Zustand dengan middleware persist
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      userId: null,
      role: null,
      appAccess: false,
      adminAccess: false,
      profile: null,

      // Menyimpan token & refreshToken, lalu mengambil data dari token
      setAuthData: (token, refreshToken) => {
        const decoded = decodeJWT(token);
        if (!decoded || !decoded.id) {
          console.error('Token tidak valid!');
          return;
        }
        set({
          token,
          refreshToken,
          userId: decoded.id,
          role: decoded.role,
          appAccess: decoded.app_access || false,
          adminAccess: decoded.admin_access || false,
        });
      },

      // Mengambil profil pengguna berdasarkan userId
      getProfile: async () => {
        let {token, userId} = get();
        const decoded = await decodeJWT(token);
        userId = userId ? userId : decoded?.id;

        if (!token || !userId) return;
        console.log('Bearer Token:', token);

        try {
          const response = await getData(`users/${userId}`, {
            headers: {Authorization: `Bearer ${token}`},
          });

          if (!response) throw new Error('Gagal mengambil profil');
          set({profile: response?.data});
        } catch (error) {
          console.error('Gagal mengambil profil:', error);
          set({profile: null});
        }
      },

      // Menyimpan profil pengguna ke state
      setProfile: profile => set({profile}),

      // Mereset state (logout)
      reset: () =>
        set({
          token: null,
          refreshToken: null,
          userId: null,
          role: null,
          appAccess: false,
          adminAccess: false,
          profile: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: async key => {
          const value = await AsyncStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: async key => {
          await AsyncStorage.removeItem(key);
        },
      },
    },
  ),
);

export default useAuthStore;
