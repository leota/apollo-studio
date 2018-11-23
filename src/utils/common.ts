import { Project } from '../models/project';

export const getProjectPath = (project: Project): string => {
  return `projects/org/${project.id}`
};
