import api from '~/api/index'
import type { AuthResponse, User } from '@@/types/index'

/**
 * Authenticate an existing user.
 * @param email - User email address.
 * @param password - Plain-text password.
 */
export const loginUser = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password })

/**
 * Register a new user account.
 * @param firstName - First name.
 * @param lastName - Last name.
 * @param gender - Preferred salutation.
 * @param email - User email address.
 * @param phoneCode - Country calling code.
 * @param phone - Phone number.
 * @param password - Plain-text password.
 */
export const registerUser = (
  firstName: string,
  lastName: string,
  gender: 'Ella' | 'Él',
  email: string,
  phoneCode: string,
  phone: string,
  password: string,
) =>
  api.post<AuthResponse>('/auth/register', {
    first_name: firstName,
    last_name: lastName,
    gender,
    email,
    phone_code: phoneCode,
    phone,
    password,
    password_confirmation: password,
  })

/**
 * Invalidate the current Bearer token on the server.
 */
export const logoutUser = () => api.post('/auth/logout')

/**
 * Obtiene la información del perfil del usuario autenticado.
 * Responde `{ data: User }` desde `GET /api/profile`.
 */
export const getProfile = () => api.get<{ data: User }>('/profile')

/**
 * Fetch the currently authenticated user's profile.
 */
export const fetchCurrentUser = () => api.get<User>('/auth/me')
