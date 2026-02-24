export type ContactAction =
  | "update_stage"
  | "add_category"
  | "remove_category"
  | "log_note"
  | "assign_contact";

export interface UpdateContactNodeData {
  action?: ContactAction;
  stage?: string;
  categoryName?: string;
  noteTemplate?: string;
  assigneeId?: string;
}

export type UpdateContactDialogDefaults = UpdateContactNodeData;
