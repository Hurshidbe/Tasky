export interface UserProfile {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  avatar?: string;
  username?: string;
  profession?: string;
  about?: string;
  createdAt?: string;
}

export interface Task {
  _id: string;
  name: string;
  description?: string;
  assignedTo?: UserProfile;
  cardId: string;
  projectId: string;
  order: string;
  completed?: boolean;
  createdAt?: string;
  history?: TaskHistory[];
}

export interface TaskHistory {
  action: 'created' | 'moved' | 'updated';
  fromCard?: string;
  toCard?: string;
  by: UserProfile;
  at: string;
}

export interface Card {
  _id: string;
  title: string;
  projectId: string;
  order: number;
  tasks?: Task[];
}

export interface ProjectData {
  _id: string;
  name: string;
  description?: string;
  owner: UserProfile;
  collaborators: UserProfile[];

  background?: string;
  project_icon?: string;
  createdAt: string;
}

export interface ActivityEvent {
  _id: string;
  type: 'task_created' | 'task_moved' | 'user_joined' | 'column_created' | 'task_updated' | 'task_deleted' | 'task_reordered' | 'column_deleted' | 'column_renamed' | 'collaborator_invited' | 'collaborator_joined' | 'project_updated' | 'background_updated';
  userId: string;
  userName?: string;
  userAvatar?: string;
  taskId?: string;
  taskName?: string;
  cardId?: string;
  fromCard?: string;
  toCard?: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface BoardContextType {
  cards: Card[];
  tasks: Task[];
  project: ProjectData | null;
  loading: boolean;
  error: string | null;
  activities: ActivityEvent[];
}
