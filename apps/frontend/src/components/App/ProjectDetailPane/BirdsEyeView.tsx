import { useEffect, useMemo, useState } from 'react';
import { formatProjectTimestamp } from '@lib/format';
import { useProjectsPanel } from '@state/projects/useProjectsPanel';
import { type TasksPanelModel } from '@state/tasks/TasksPanelModel';
import { OverflowReveal } from '@utilities/OverflowReveal';
import {
  buildBirdsEyeItems,
  getItemRecency,
  shuffleItems,
  type BirdsEyeItem
} from './birdsEyeItems';

function BirdsEyeTile({
  item,
  onSelect
}: {
  item: BirdsEyeItem;
  onSelect: (item: BirdsEyeItem) => void;
}) {
  const title = item.type === 'task' ? item.data.title : item.data.name;
  const timestamp = getItemRecency(item);

  return (
    <button
      type="button"
      className="project-card birds-eye-tile"
      onClick={() => onSelect(item)}
      data-testid={`birds-eye-tile-${item.type}-${item.data.id}`}
    >
      <OverflowReveal as="div" className="project-card-title">
        {title}
      </OverflowReveal>
      <div className="project-card-meta">
        <span className={`status-pill status-${item.data.status}`}>
          {item.data.status}
        </span>
        <span className="project-created">
          {formatProjectTimestamp(timestamp)}
        </span>
      </div>
    </button>
  );
}

export function BirdsEyeView({ isDetailOpen, tasksModel }: { isDetailOpen: boolean; tasksModel: TasksPanelModel }) {
  const { projects, selectProject } = useProjectsPanel();
  const { selectTask, tasks: activeProjectTasks } = tasksModel;
  const allTasks = tasksModel.effectiveAllTasks;
  const [pendingTaskSelection, setPendingTaskSelection] = useState<{
    projectId: number;
    taskId: number;
  } | null>(null);
  useEffect(() => {
    if (!pendingTaskSelection) {
      return;
    }

    const matchingTask = activeProjectTasks.find((task) => task.id === pendingTaskSelection.taskId);
    if (!matchingTask || matchingTask.projectId !== pendingTaskSelection.projectId) {
      return;
    }

    selectTask(pendingTaskSelection.taskId);
    setPendingTaskSelection(null);
  }, [activeProjectTasks, pendingTaskSelection, selectTask]);

  function handleSelect(item: BirdsEyeItem) {
    if (item.type === 'project') {
      setPendingTaskSelection(null);
      selectProject(item.data.id);
      return;
    }

    setPendingTaskSelection({ projectId: item.data.projectId, taskId: item.data.id });
    selectProject(item.data.projectId);
  }

  const { row1Items, row2Items } = useMemo(
    () => buildBirdsEyeItems(projects, allTasks),
    [allTasks, projects]
  );
  const visibleRow1Items = row1Items.slice(0, 10);

  const visibleRow2Items = useMemo(() => shuffleItems(row2Items).slice(0, 10), [row2Items]);

  return (
    <div
      className={`
        project-detail-layer 
        birds-eye-view
      `}
      aria-hidden={isDetailOpen}    >
      <div className="panel project-detail-surface">
        <div className="project-detail-scroll">
          <div className="birds-eye-content">
            <div className="birds-eye-section">
              <h3 className="birds-eye-section-label">In Progress</h3>
              <div className="birds-eye-row">
                {visibleRow1Items.map((item) => (
                  <BirdsEyeTile
                    key={`${item.type}-${item.data.id}`}
                    item={item}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>

            <div className="birds-eye-section">
              <h3 className="birds-eye-section-label">Up Next</h3>
              <div className="birds-eye-row">
                {visibleRow2Items.map((item) => (
                  <BirdsEyeTile
                    key={`${item.type}-${item.data.id}`}
                    item={item}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
