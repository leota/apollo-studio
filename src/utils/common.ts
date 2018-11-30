import { Project } from '../models/project';

export const getProjectPath = (project: Project | string): string => {
  const projectId = typeof project == 'object'
   ? project.id
   : project;
  return `projects/org/${projectId}`;
};
