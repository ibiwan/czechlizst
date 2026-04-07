import * as Ariakit from '@ariakit/react';

import type { Task } from '../types';

export function RelatedTaskCombobox({
  groups,
  onSelectTask,
  query,
  selectedTask,
  setQuery
}: {
  groups: Array<{ label: string; tasks: Task[] }>;
  onSelectTask: (task: Task) => void;
  query: string;
  selectedTask: Task | null;
  setQuery: (value: string) => void;
}) {
  return (
    <Ariakit.ComboboxProvider resetValueOnHide={false} setValue={setQuery} value={query}>
      <div className="stack-form relation-combobox">
        <Ariakit.Combobox
          className="relation-combobox-input"
          placeholder="Type to filter siblings, aunts, and cousins"
        />
        <Ariakit.ComboboxPopover className="relation-combobox-popover" gutter={8}>
          {groups.length > 0 ? (
            groups.map((group) => (
              <div className="relation-combobox-group" key={group.label}>
                <div className="relation-combobox-label">{group.label}</div>
                <div className="relation-combobox-list">
                  {group.tasks.map((task) => (
                    <Ariakit.ComboboxItem
                      className="relation-combobox-item"
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      value={task.title}
                    >
                      {task.title}
                    </Ariakit.ComboboxItem>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="relation-combobox-empty">No nearby tasks match.</div>
          )}
        </Ariakit.ComboboxPopover>
        {selectedTask ? (
          <p className="empty-copy">Linking to: {selectedTask.title}</p>
        ) : (
          <p className="empty-copy">No related task selected.</p>
        )}
      </div>
    </Ariakit.ComboboxProvider>
  );
}
