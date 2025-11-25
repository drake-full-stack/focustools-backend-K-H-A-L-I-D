import { useState } from 'react';

function TaskItem({ task, isActive, onSelect, onToggleComplete, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditedTitle(task.title);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedTitle(task.title);
    }
  };

  const handleSave = () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      onEdit(task._id, editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleBlur = () => {
    handleSave();
  };

  return (
    <div className={`task-item ${isActive ? 'active' : ''} ${task.completed ? 'completed' : ''}`}>
      {/* Checkbox for completion */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggleComplete}
        className="task-checkbox"
      />

      {/* Task content - clicking selects for Pomodoro, double-click to edit */}
      <div className="task-content" onClick={isEditing ? undefined : onSelect}>
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="task-edit-input"
            autoFocus
          />
        ) : (
          <h3 className="task-title" onDoubleClick={handleDoubleClick}>
            {task.title}
          </h3>
        )}
        <div className="task-meta">
          {task.pomodoroCount > 0 && (
            <span className="pomodoro-badge">
              🍅 × {task.pomodoroCount}
            </span>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="delete-button"
        aria-label="Delete task"
      >
        🗑️
      </button>
    </div>
  );
}

export default TaskItem;
