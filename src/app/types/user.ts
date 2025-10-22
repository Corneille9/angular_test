export interface User {
  id: number;
  name: string;
  email: string;
  password?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}
