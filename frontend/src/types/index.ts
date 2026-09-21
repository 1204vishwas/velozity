export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  _count?: {
    projects: number;
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  clientId: string;
  client?: Client;
  managerId: string;
  manager?: User;
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  taskNumber: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue: boolean;
  projectId: string;
  project?: {
    id: string;
    name: string;
    managerId: string;
  };
  assignedToId?: string | null;
  assignedTo?: User | null;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
  };
  activityLogs?: ActivityLog[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  taskId?: string | null;
  task?: {
    id: string;
    taskNumber: number;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
  } | null;
  projectId: string;
  project?: {
    id: string;
    name: string;
    managerId: string;
  } | null;
  userId?: string | null;
  userName?: string | null;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    role?: Role;
  } | null;
  action: string;
  fromStatus?: TaskStatus | null;
  toStatus?: TaskStatus | null;
  message: string;
  details?: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  taskId?: string | null;
  task?: {
    id: string;
    taskNumber: number;
    title: string;
    projectId: string;
  } | null;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminDashboardStats {
  role: 'ADMIN';
  totalProjects: number;
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  overdueTaskCount: number;
  activeUsersOnline: number;
  totalClients: number;
  totalUsers: number;
}

export interface PMDashboardStats {
  role: 'PROJECT_MANAGER';
  myProjectsCount: number;
  projects: Array<{
    id: string;
    name: string;
    status: ProjectStatus;
    _count: { tasks: number };
  }>;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
  overdueTaskCount: number;
  upcomingDueDatesThisWeek: Array<{
    id: string;
    taskNumber: number;
    title: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignedTo?: { name: string } | null;
  }>;
}

export interface DeveloperDashboardStats {
  role: 'DEVELOPER';
  assignedTasksCount: number;
  tasksByStatus: Record<TaskStatus, number>;
  overdueTaskCount: number;
  upcomingDueDatesThisWeek: Array<{
    id: string;
    taskNumber: number;
    title: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    project?: { name: string } | null;
  }>;
}

export type DashboardStats = AdminDashboardStats | PMDashboardStats | DeveloperDashboardStats;

export interface TaskFilterParams {
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  dueStart?: string;
  dueEnd?: string;
  projectId?: string;
  isOverdue?: boolean | '';
  search?: string;
}
