import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from '../../App';
import { api } from '../../api';
import { store } from '../../store';
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
    expect(await screen.findByTestId('tasks-title')).toBeVisible();
    expect(await screen.findByTestId('tasks-empty-project')).toBeVisible();
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

    (await screen.findByText(projectName)).click();

    expect(await screen.findByTestId('tasks-table')).toBeVisible();
    expect(await screen.findByTestId('task-notes-panel')).toHaveTextContent(
      'Select a task first.'
    );

    (await screen.findByTestId('tasks-add-button')).click();
    const taskInput = await screen.findByTestId('tasks-add-input');
    fireEvent.change(taskInput, { target: { value: taskName } });
    (await screen.findByTestId('tasks-add-save')).click();

    (await screen.findByText(taskName)).click();

    expect(await screen.findByTestId('task-notes-panel')).not.toHaveTextContent(
      'Select a task first.'
    );
  });
});
