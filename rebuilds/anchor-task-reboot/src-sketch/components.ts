export type RebootComponentBoundary = {
  name: string;
  owns: string[];
  reads: string[];
  emits?: string[];
};

export const rebootComponentBoundaries: RebootComponentBoundary[] = [
  {
    name: 'AppShell',
    owns: ['bootstrap', 'loading state', 'error state'],
    reads: ['all tasks', 'all notes', 'all relations']
  },
  {
    name: 'MainLayout',
    owns: ['three-pane wiring', 'top-level random-pick action'],
    reads: ['selectedAnchorId', 'focusedTaskId', 'selectedTaskId'],
    emits: ['select_anchor', 'select_task', 'pick_random_leaf']
  },
  {
    name: 'AnchorPane',
    owns: ['anchor list UI', 'anchor create UI'],
    reads: ['anchor tasks', 'effective task statuses'],
    emits: ['create_anchor', 'select_anchor']
  },
  {
    name: 'ChildrenPane',
    owns: ['child list UI', 'child create UI', 'breadcrumb UI'],
    reads: ['focusedTaskId', 'child tasks', 'parent chain'],
    emits: ['create_child_task', 'select_task']
  },
  {
    name: 'TaskDetailPane',
    owns: ['task edit UI', 'notes UI', 'relations UI'],
    reads: ['selectedTask', 'task notes', 'task relations', 'effective task status'],
    emits: [
      'update_task',
      'delete_task',
      'create_note',
      'update_note',
      'delete_note',
      'create_relation',
      'update_relation',
      'delete_relation',
      'navigate_to_related_task'
    ]
  }
];

export type RebootSelectorSketch = {
  name: string;
  inputs: string[];
  output: string;
};

export const rebootSelectorSketches: RebootSelectorSketch[] = [
  {
    name: 'selectAnchorTasks',
    inputs: ['all tasks'],
    output: 'tasks where is_anchor = true'
  },
  {
    name: 'selectFocusedChildren',
    inputs: ['all tasks', 'focusedTaskId'],
    output: 'tasks where parent_task_id = focusedTaskId'
  },
  {
    name: 'selectSelectedTask',
    inputs: ['all tasks', 'selectedTaskId'],
    output: 'single selected task'
  },
  {
    name: 'selectSelectedTaskNotes',
    inputs: ['all task notes', 'selectedTaskId'],
    output: 'notes for selected task'
  },
  {
    name: 'selectSelectedTaskRelations',
    inputs: ['all task relations', 'selectedTaskId'],
    output: 'relations where task_id = selectedTaskId'
  },
  {
    name: 'selectBreadcrumbChain',
    inputs: ['all tasks', 'selectedTaskId'],
    output: 'parent chain from root to selected task'
  },
  {
    name: 'selectLeafTasks',
    inputs: ['all tasks'],
    output: 'tasks with no children'
  }
];
