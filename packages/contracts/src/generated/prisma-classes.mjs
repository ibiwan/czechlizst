// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: packages/db/prisma/schema.prisma

export class ProjectRowModel {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class ProjectPostgrestRow {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

export class TaskRowModel {
  constructor(data) {
    this.id = data.id;
    this.projectId = data.projectId;
    this.title = data.title;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class TaskPostgrestRow {
  constructor(data) {
    this.id = data.id;
    this.project_id = data.project_id;
    this.title = data.title;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

export class ProjectNoteRowModel {
  constructor(data) {
    this.id = data.id;
    this.projectId = data.projectId;
    this.body = data.body;
    this.referenceUrl = data.referenceUrl;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class ProjectNotePostgrestRow {
  constructor(data) {
    this.id = data.id;
    this.project_id = data.project_id;
    this.body = data.body;
    this.reference_url = data.reference_url;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

export class TaskNoteRowModel {
  constructor(data) {
    this.id = data.id;
    this.taskId = data.taskId;
    this.body = data.body;
    this.referenceUrl = data.referenceUrl;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class TaskNotePostgrestRow {
  constructor(data) {
    this.id = data.id;
    this.task_id = data.task_id;
    this.body = data.body;
    this.reference_url = data.reference_url;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
