import { Building, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import toast from 'react-hot-toast'
import { ProjectItem } from '@/types'
import { deleteProject } from '@/utils/resumeStorage'

interface ProjectCardProps {
  project: ProjectItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isGridView?: boolean;
  onDelete?: () => void;
}

export function ProjectCard({
  project,
  isExpanded,
  onToggleExpand,
  isGridView = false,
  onDelete
}: ProjectCardProps) {
  const baseClassName = isGridView
    ? "p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors duration-200"
    : "p-4 hover:bg-muted/50 transition-colors duration-200 border-b last:border-b-0";

  return (
    <div className={baseClassName}>
      <div className="flex justify-between items-start">
        <div className="space-y-4 flex-1">
          <div className="flex justify-between items-center gap-4">
            <h2 className="text-lg font-medium text-foreground">{project.project_name}</h2>
            {!isGridView && (
              <Badge variant="secondary" className="rounded-sm font-normal">
                {project.date_range}
              </Badge>
            )}
          </div>
          
          {isGridView && (
            <Badge variant="secondary" className="rounded-sm font-normal">
              {project.date_range}
            </Badge>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Building className="mr-2 h-4 w-4" />
            <span>{project.role}</span>
          </div>

          <div className={`transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-80'}`}>
            <div className="space-y-2">
              {project.details?.map((detail, idx) => (
                <div
                  key={idx}
                  className="flex items-start text-sm group cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(detail)
                      .then(() => toast.success('Detail copied to clipboard!'))
                      .catch(() => toast.error('Failed to copy detail'));
                  }}
                >
                  <span className="inline-block w-1 h-1 bg-primary rounded-full mt-2 mr-3 group-hover:scale-110 transition-transform"></span>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors flex-1">
                    {detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleExpand}
            className="text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
          <Button variant="ghost" size="icon" onClick={async () => {
            try {
              await deleteProject(project);
              toast.success('Project deleted successfully');
              onDelete?.();
            } catch (error) {
              toast.error('Failed to delete project');
              console.error('Delete error:', error);
            }
          }}>
            <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/90" />
          </Button>
        </div>
      </div>
    </div>
  )
}
