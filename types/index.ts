export interface ProjectItem {
  project_name: string;
  role: string;
  date_range: string;
  details: string[];
}

export interface TimeGroupedItems<T> {
  [key: string]: T[];
}
