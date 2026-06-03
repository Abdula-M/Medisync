export type Role = 'patient' | 'doctor';

export interface User {
  id: string;
  role: Role;
  username: string;
}
