import { create } from "zustand";

// Definisi tipe untuk state autentikasi
interface AuthState {
  token: string | null;
  profile: UserProfile | null;
  setToken: (token: string) => void;
  getProfile: () => Promise<void>;
  setProfile: (profile: UserProfile) => void;
  reset: () => void;
}

// Definisi tipe untuk profil pengguna
interface UserProfile {
  id: number;
  name: string;
  email: string;
}

// Membuat store Zustand untuk autentikasi
const useAuthStore = create<AuthState>((set) => ({
  token: null,
  profile: null,

  
  setToken: (token) => set({ token }),

 
  getProfile: async () => {
    try {
    
      const response = await fetch("https://api.example.com/profile", {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
      });
      const data: UserProfile = await response.json();
      set({ profile: data });
    } catch (error) {
      console.error("Gagal mengambil profil:", error);
    }
  },

  // Set data profil secara manual
  setProfile: (profile) => set({ profile }),

  // Reset state saat logout
  reset: () => set({ token: null, profile: null }),
}));

export default useAuthStore;
