export interface User {
  id: string;
  displayName: string;
  email: string;
  credits: number;
  createdAt: Date | null;
}