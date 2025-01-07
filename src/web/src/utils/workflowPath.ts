import { Workflow } from "@/interfaces/Workflows";

/**
 * Get the name of a workflow without its path
 * @param fullPath The full path of the workflow (e.g. "Github/Push Workflow")
 * @returns The name of the workflow (e.g. "Push Workflow")
 */
export function getWorkflowName(fullPath: string): string {
  const parts = fullPath.split('/');
  return parts[parts.length - 1];
}

/**
 * Get the path of a workflow without its name
 * @param fullPath The full path of the workflow (e.g. "Github/Push Workflow")
 * @returns The path of the workflow (e.g. "Github")
 */
export function getWorkflowPath(fullPath: string): string {
  const parts = fullPath.split('/');
  return parts.slice(0, -1).join('/');
}

/**
 * Get all unique folders from a list of workflow paths
 * @param workflows List of workflows
 * @returns Array of unique folder paths
 */
export function getAllFolders(workflows: { name: string }[]): string[] {
  const folders = new Set<string>();

  workflows.forEach(workflow => {
    const path = getWorkflowPath(workflow.name);
    if (path) {
      // Add all parent folders as well
      const parts = path.split('/');
      let currentPath = '';
      parts.forEach(part => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        folders.add(currentPath);
      });
    }
  });

  return Array.from(folders).sort();
}

/**
 * Move a workflow to a new path
 * @param currentName Current full path/name of the workflow
 * @param newPath New path (without workflow name)
 * @returns New full path/name
 */
export function moveWorkflow(currentName: string, newPath: string): string {
  const name = getWorkflowName(currentName);
  return newPath ? `${newPath}/${name}` : name;
}

/**
 * Rename a folder and update all workflow paths accordingly
 * @param workflows List of workflows
 * @param oldPath Old folder path
 * @param newPath New folder path
 * @returns Updated workflow names
 */
export function renameFolder(workflows: { name: string }[], oldPath: string, newPath: string): { name: string }[] {
  return workflows.map(workflow => ({
    ...workflow,
    name: workflow.name.startsWith(oldPath + '/')
      ? workflow.name.replace(oldPath, newPath)
      : workflow.name
  }));
}

/**
 * Group workflows by their folders
 * @param workflows List of workflows
 * @returns Object with folders as keys and arrays of workflows as values
 */
export function groupWorkflowsByFolder(workflows: Workflow[]): { [key: string]: Workflow[] } {
  const groups: { [key: string]: Workflow[] } = {
    '': [] // Root folder
  };

  workflows.forEach(workflow => {
    const path = getWorkflowPath(workflow.name);
    if (!groups[path]) {
      groups[path] = [];
    }
    groups[path].push(workflow);
  });

  return groups;
}

/**
 * Check if a path is a subfolder of another path
 * @param parentPath Potential parent path
 * @param childPath Potential child path
 * @returns boolean
 */
export function isSubfolder(parentPath: string, childPath: string): boolean {
  if (!parentPath) return true; // Root is parent of all
  return childPath.startsWith(parentPath + '/');
}
