// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Source: packages/db/prisma/schema.prisma

export class ProjectRowModel {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class ProjectPostgrestRow {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

export class TaskRowModel {
  constructor(data) {
    this.id = data.id;
    this.projectId = data.projectId;
    this.title = data.title;
    this.isPlaceholder = data.isPlaceholder;
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
    this.is_placeholder = data.is_placeholder;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

export class TaskRelationRowModel {
  constructor(data) {
    this.id = data.id;
    this.taskId = data.taskId;
    this.relatedTaskId = data.relatedTaskId;
    this.relationType = data.relationType;
    this.commentary = data.commentary;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class TaskRelationPostgrestRow {
  constructor(data) {
    this.id = data.id;
    this.task_id = data.task_id;
    this.related_task_id = data.related_task_id;
    this.relation_type = data.relation_type;
    this.commentary = data.commentary;
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
