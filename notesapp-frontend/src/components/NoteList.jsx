import NoteItem from './NoteItem';

const NoteList = ({ notes, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner spinner-dark" style={{ width: '24px', height: '24px' }}></div>
        <p style={{ color: '#71717a', marginTop: '12px', fontSize: '14px' }}>Loading notes...</p>
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">○</div>
        <h3 className="empty-state-title">No notes yet</h3>
        <p className="empty-state-text">Create your first note above</p>
      </div>
    );
  }

  return (
    <div>
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default NoteList;

