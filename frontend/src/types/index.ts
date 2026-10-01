export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

export type Status = 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  total: number;
  toDo: number;
  inProgress: number;
  completed: number;
  overdue: number;
}