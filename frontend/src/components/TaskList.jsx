import TaskItem from './TaskItem';

function TaskList({ tasks, activeTask, onSelectTask, onToggleComplete, onDeleteTask, onEditTask }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks yet. Add one above to get started!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          isActive={activeTask?._id === task._id}
          onSelect={() => onSelectTask(task)}
          onToggleComplete={() => onToggleComplete(task._id)}
          onDelete={() => onDeleteTask(task._id)}
          onEdit={onEditTask}
        />
      ))}
    </div>
  );
}

export default TaskList;

