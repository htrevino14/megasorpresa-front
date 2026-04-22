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
 * @param name - Full name.
 * @param email - User email address.
 * @param password - Plain-text password.
 * @param passwordConfirmation - Must match password.
 */
export const registerUser = (
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
) =>
  api.post<AuthResponse>('/auth/register', {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
  })

/**
 * Invalidate the current Bearer token on the server.
 */
export const logoutUser = () => api.post('/auth/logout')

/**
 * Fetch the currently authenticated user's profile.
 */
export const fetchCurrentUser = () => api.get<User>('/auth/me')
