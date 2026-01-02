const Toast = ({ id, message, type, onClose }) => {
  const typeConfig = {
    success: { bg: '#10b981', border: '#059669' },
    error: { bg: '#dc2626', border: '#b91c1c' },
    warning: { bg: '#f59e0b', border: '#d97706' },
    info: { bg: '#0d9488', border: '#0f766e' }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        minWidth: '280px',
        maxWidth: '380px',
        fontSize: '14px',
        animation: 'slideInRight 0.2s ease'
      }}
    >
      <span style={{ flex: 1, fontWeight: '500' }}>{message}</span>
      <button
        onClick={() => onClose(id)}
        style={{
          background: 'rgba(0, 0, 0, 0.2)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '14px',
          padding: '2px 6px',
          borderRadius: '4px',
          lineHeight: 1
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
