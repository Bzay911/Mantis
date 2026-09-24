import { API_BASE_URL } from '../src/constants/api-config';
import type { User } from '../types/user';

export async function fetchValidatedUser(token: string): Promise<User | null> {
  const response = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) return null;

  const { user } = await response.json();
  return user;
}