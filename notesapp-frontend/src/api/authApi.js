import httpClient from './httpClient';

/**
 * Authentication API
 * - login: POST /auth/login
 * - register: POST /auth/register
 * Both return JWT as text/plain
 */
const authApi = {
  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<string>} JWT token as plain text
   */
  async login(email, password) {
    return httpClient.post('/auth/login', { email, password }, true);
  },

  /**
   * Register a new user
   * @param {string} email
   * @param {string} password
   * @param {string} [inviteCode] - Optional invite code
   * @returns {Promise<string>} JWT token as plain text
   */
  async register(email, password, inviteCode) {
    const body = { email, password };
    if (inviteCode) {
      body.inviteCode = inviteCode;
    }
    return httpClient.post('/auth/register', body, true);
  }
};

export default authApi;

