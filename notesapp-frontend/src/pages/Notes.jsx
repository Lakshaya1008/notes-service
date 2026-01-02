import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../hooks/useToast';
import notesApi from '../api/notesApi';
import { ApiError } from '../api/httpClient';
import NoteForm from '../components/NoteForm';
import NoteList from '../components/NoteList';
import UpgradeBanner from '../components/UpgradeBanner';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
  const [upgradeBannerMessage, setUpgradeBannerMessage] = useState('');

  const { user, logout, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const fetchNotes = useCallback(async () => {
    try {
      const data = await notesApi.getAll();
      setNotes(data);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          navigate('/login');
        } else {
          showError(error.message);
        }
      } else {
        showError('Failed to load notes');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, showError]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async (noteData) => {
    try {
      const newNote = await notesApi.create(noteData);
      setNotes((prev) => [...prev, newNote]);
      setShowUpgradeBanner(false);
      showSuccess('Note created');
    } catch (error) {
      if (error instanceof ApiError) {
        showError(error.message);
        // Show upgrade banner on 403 (subscription limit)
        if (error.status === 403) {
          setShowUpgradeBanner(true);
          setUpgradeBannerMessage(error.message);
        } else if (error.status === 401) {
          navigate('/login');
        }
      } else {
        showError('Failed to create note');
      }
    }
  };

  const handleUpdateNote = async (noteData) => {
    if (!editingNote) return;

    try {
      const updatedNote = await notesApi.update(editingNote.id, noteData);
      setNotes((prev) =>
        prev.map((note) => (note.id === editingNote.id ? updatedNote : note))
      );
      setEditingNote(null);
      showSuccess('Note updated');
    } catch (error) {
      if (error instanceof ApiError) {
        showError(error.message);
        if (error.status === 401) {
          navigate('/login');
        }
      } else {
        showError('Failed to update note');
      }
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await notesApi.delete(noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      showSuccess('Note deleted');
    } catch (error) {
      if (error instanceof ApiError) {
        showError(error.message);
        if (error.status === 401) {
          navigate('/login');
        }
      } else {
        showError('Failed to delete note');
      }
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
  };

  const handleLogout = () => {
    logout();
    showSuccess('Logged out');
    navigate('/login');
  };

  return (
    <div className="notes-page">
      {/* Header */}
      <header className="notes-header">
        <div className="notes-header-content">
          <div>
            <h1>Notes</h1>
            <p className="notes-header-info">
              Tenant {user?.tenantId} · {isAdmin ? 'Admin' : 'Member'}
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-outline">
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="notes-container">
        {/* Upgrade Banner */}
        {showUpgradeBanner && (
          <UpgradeBanner message={upgradeBannerMessage} />
        )}

        {/* Create/Edit Note Form */}
        <div className="create-note-card">
          <h2 className="create-note-title">
            {editingNote ? 'Edit note' : 'New note'}
          </h2>
          <NoteForm
            onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
            initialNote={editingNote}
            onCancel={editingNote ? handleCancelEdit : undefined}
          />
        </div>

        {/* Notes List */}
        <div className="section-header">
          <h2 className="section-title">
            Your notes
            <span className="section-badge">{notes.length}</span>
          </h2>
        </div>

        <NoteList
          notes={notes}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Notes;

