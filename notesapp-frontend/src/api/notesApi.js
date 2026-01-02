import httpClient from './httpClient';

/**
 * Notes API
 * All endpoints require JWT
 * - GET    /api/notes
 * - GET    /api/notes/{id}
 * - POST   /api/notes
 * - PUT    /api/notes/{id}
 * - DELETE /api/notes/{id} (ADMIN only)
 */
const notesApi = {
  /**
   * Get all notes for the current tenant
   * @returns {Promise<Array>} List of notes
   */
  async getAll() {
    return httpClient.get('/api/notes');
  },

  /**
   * Get a single note by ID
   * @param {string|number} id
   * @returns {Promise<Object>} Note object
   */
  async getById(id) {
    return httpClient.get(`/api/notes/${id}`);
  },

  /**
   * Create a new note
   * @param {Object} noteData - Note data (title, content, etc.)
   * @returns {Promise<Object>} Created note
   */
  async create(noteData) {
    return httpClient.post('/api/notes', noteData);
  },

  /**
   * Update an existing note
   * @param {string|number} id
   * @param {Object} noteData - Updated note data
   * @returns {Promise<Object>} Updated note
   */
  async update(id, noteData) {
    return httpClient.put(`/api/notes/${id}`, noteData);
  },

  /**
   * Delete a note (ADMIN only)
   * @param {string|number} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    return httpClient.delete(`/api/notes/${id}`);
  }
};

export default notesApi;

