import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from '../../components/App';
import { api } from '@api';
import { store } from '@store/store';
import { buildTestName, deleteProjectsByPrefix } from './helpers';

describe('Browser smoke: projects/tasks', () => {
  beforeAll(async () => {
    await deleteProjectsByPrefix();
  });

  beforeEach(() => {
    store.dispatch(api.util.resetApiState());
    document.body.innerHTML = '';
  });

  afterAll(async () => {
    await deleteProjectsByPrefix();
  });

  test('renders core panes and empty states', async () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(await screen.findByTestId('projects-title')).toBeVisible();
    expect(await screen.findByTestId('birds-eye-title')).toBeVisible();
    expect(await screen.findByTestId('task-notes-empty-project')).toBeVisible();
  });

  test('creates project and task via UI and updates panes', async () => {
    const projectName = buildTestName('New Project');
    const taskName = buildTestName('New Task');

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    (await screen.findByTestId('projects-add-button')).click();
    const projectInput = await screen.findByTestId('projects-add-input');
    fireEvent.change(projectInput, { target: { value: projectName } });
    (await screen.findByTestId('projects-add-save')).click();
    await waitFor(() => expect(screen.queryByTestId('projects-add-input')).toBeNull(), {
      timeout: 10_000
    });

    const projectNameNode = await within(await screen.findByTestId('project-list-pane')).findByText(
      projectName
    );
    const projectRow = projectNameNode.closest<HTMLElement>(`[data-testid^="project-row-"]`);
    expect(projectRow).not.toBeNull();
    expect(projectRow).toHaveTextContent(projectName);
    projectRow!.click();
    await waitFor(() => expect(projectRow).toHaveClass('is-selected'));
    const activeProjectRowTestId = projectRow!.getAttribute('data-testid');

    expect(await screen.findByTestId('tasks-table')).toBeVisible();
    expect(await screen.findByTestId('task-notes-pane')).toHaveTextContent(
      'Select a task first.'
    );

    (await screen.findByTestId('tasks-add-button')).click();
    const taskInput = await screen.findByTestId('tasks-add-input');
    fireEvent.change(taskInput, { target: { value: taskName } });
    (await screen.findByTestId('tasks-add-save')).click();
    await waitFor(() => expect(screen.queryByTestId('tasks-add-input')).toBeNull(), {
      timeout: 10_000
    });
    await waitFor(() => {
      const selected = document.querySelector<HTMLElement>(
        '[data-testid^="project-row-"].is-selected'
      );
      expect(selected?.getAttribute('data-testid')).toBe(activeProjectRowTestId);
    });

    const taskTitleNode = await within(await screen.findByTestId('tasks-table')).findByText(
      taskName,
      undefined,
      { timeout: 10_000 }
    );
    const taskRow = taskTitleNode.closest<HTMLElement>(`[data-testid^="task-row-"]`);
    expect(taskRow).not.toBeNull();
    taskRow!.click();

    expect(await screen.findByTestId('task-notes')).toBeVisible();
  });
});
