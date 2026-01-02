import { useAuth } from '../auth/AuthContext';

const NoteItem = ({ note, onEdit, onDelete, style }) => {
  const { isAdmin } = useAuth();

  return (
    <div className="note-card" style={style}>
      <h3 className="note-card-title">{note.title}</h3>
      {note.content && (
        <p className="note-card-content">{note.content}</p>
      )}
      <div className="note-card-actions">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onEdit(note)}
        >
          Edit
        </button>
        {/* Delete button only visible for ADMIN users */}
        {isAdmin && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(note.id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default NoteItem;
