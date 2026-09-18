import type { ProjectRecord } from '../project/types';

export const FLOWEXTRACT_BACKUP_VERSION = 1;

interface BackupEnvelope {
  version: number;
  exportedAt: string;
  project: ProjectRecord;
}

const SENSITIVE_PROPERTY_NAMES = new Set(['apikey', 'authorization', 'authorizationheader', 'accesstoken', 'refreshtoken', 'clientsecret']);

function containsSecretKey(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(containsSecretKey);
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const normalizedKey = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (SENSITIVE_PROPERTY_NAMES.has(normalizedKey)) return true;
    if (containsSecretKey(child)) return true;
  }
  return false;
}

function isProjectRecord(value: unknown): value is ProjectRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const project = value as Partial<ProjectRecord>;
  return typeof project.id === 'string'
    && typeof project.name === 'string'
    && typeof project.updatedAt === 'string'
    && !!project.schema
    && typeof project.schema === 'object'
    && typeof project.schema.id === 'string'
    && Array.isArray(project.schema.fields);
}

export function exportProjectBackup(project: ProjectRecord): string {
  const envelope: BackupEnvelope = {
    version: FLOWEXTRACT_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    project,
  };
  return JSON.stringify(envelope, null, 2);
}

export function importProjectBackup(text: string): ProjectRecord {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Backup is not valid JSON.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Backup envelope is invalid.');
  const envelope = parsed as Partial<BackupEnvelope>;
  if (envelope.version !== FLOWEXTRACT_BACKUP_VERSION) throw new Error(`Unsupported backup version: ${String(envelope.version)}.`);
  if (containsSecretKey(envelope.project)) throw new Error('Backup contains a secret-like field and was rejected.');
  if (!isProjectRecord(envelope.project)) throw new Error('Backup project data is invalid.');
  return envelope.project;
}
