export interface User {
  id: number;
  name: string;
  email: string;
  role_name: string;
  role_id: number;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: number;
  name: string;
  created_at: string;
}

export interface FileRecord {
  id: number;
  user_id: number;
  original_name: string;
  file_path: string;
  output_path?: string;
  extracted_text?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'error';
  upload_time: string;
  processed_at?: string;
  user_name: string;
  user_email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

declare global {
  interface Window {
    electronAPI: {
      // Auth methods
      login: (credentials: { email: string; password: string }) => Promise<any>;
      register: (userData: any) => Promise<any>;
      verifyToken: (token: string) => Promise<any>;

      // User methods
      getAllUsers: () => Promise<any>;
      createUser: (userData: any) => Promise<any>;
      updateUser: (id: number, userData: any) => Promise<any>;
      deleteUser: (id: number) => Promise<any>;

      // Role methods
      getAllRoles: () => Promise<any>;
      createRole: (roleData: any) => Promise<any>;
      updateRole: (id: number, roleData: any) => Promise<any>;
      deleteRole: (id: number) => Promise<any>;

      // File methods
      uploadFile: (fileData: any) => Promise<any>;
      getAllFiles: () => Promise<any>;
      getUserFiles: (userId: number) => Promise<any>;

      // Dialog methods
      showOpenDialog: () => Promise<any>;
    };
  }
}