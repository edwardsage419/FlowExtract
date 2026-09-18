import { beforeEach, describe, expect, it } from 'vitest';
import { deleteProject, listProjects, loadProject, openProjectDatabase, saveProject } from './projectStore';
import type { ProjectRecord } from '../project/types';

const project: ProjectRecord = {
  id: 'p1', name: 'Test', updatedAt: '2026-09-18T00:00:00.000Z',
  schema: { id: 's', name: 'Schema', updatedAt: '2026-09-18T00:00:00.000Z', fields: [] },
};

beforeEach(async () => {
  const db = await openProjectDatabase();
  db.close();
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('flowextract');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
});

describe('project store', () => {
  it('saves, lists, loads and deletes a project', async () => {
    await saveProject(project);
    expect(await loadProject(project.id)).toEqual(project);
    expect(await listProjects()).toEqual([project]);
    await deleteProject(project.id);
    expect(await loadProject(project.id)).toBeUndefined();
  });
});
