import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ExperienceCard } from "./experience-card"
import { ProjectCard } from "./project-card"
import { ExperienceItem } from '@/utils/fileUploadManager'
import { ProjectItem, TimeGroupedItems } from '@/types'

interface ContentViewProps {
  contentType: 'experience' | 'project';
  viewMode: 'list' | 'grid';
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  groupedExperiences: TimeGroupedItems<ExperienceItem>;
  expandedItems: { [key: string]: boolean };
  onToggleExpand: (index: number) => void;
  onItemDeleted?: () => void;
}

export function ContentView({
  contentType,
  viewMode,
  experiences,
  projects,
  groupedExperiences,
  expandedItems,
  onToggleExpand,
  onItemDeleted
}: ContentViewProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-muted-foreground mb-2">
        {contentType === 'experience' ? 'Experiences' : 'Projects'}
      </div>
      
      <Tabs value={viewMode}>
        {/* List View */}
        <TabsContent value="list" className="mt-0">
          <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
            <div className="rounded-lg border bg-background">
              {contentType === 'experience' ? (
                experiences.length > 0 ? (
                  Object.entries(groupedExperiences).map(([timeGroup, groupExps]) => (
                    groupExps.length > 0 && (
                      <div key={timeGroup}>
                        <div className="px-4 py-2 bg-muted/50">
                          <h3 className="text-sm font-medium text-muted-foreground">{timeGroup}</h3>
                        </div>
                        {groupExps.map((exp, index) => (
                          <ExperienceCard
                            key={`${timeGroup}-${index}`}
                            experience={exp}
                            isExpanded={expandedItems[index]}
                            onToggleExpand={() => onToggleExpand(index)}
                            onDelete={onItemDeleted}
                          />
                        ))}
                      </div>
                    )
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No experiences found</p>
                  </div>
                )
              ) : (
                projects.length > 0 ? (
                  <div>
                    {projects.map((project, index) => (
                      <ProjectCard
                        key={index}
                        project={project}
                        isExpanded={expandedItems[index]}
                        onToggleExpand={() => onToggleExpand(index)}
                        onDelete={onItemDeleted}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No projects found</p>
                  </div>
                )
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Grid View */}
        <TabsContent value="grid" className="mt-0">
          <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
            {contentType === 'experience' ? (
              experiences.length > 0 ? (
                Object.entries(groupedExperiences).map(([timeGroup, groupExps]) => (
                  groupExps.length > 0 && (
                    <div key={timeGroup} className="mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-4">{timeGroup}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupExps.map((exp, index) => (
                          <ExperienceCard
                            key={`${timeGroup}-${index}`}
                            experience={exp}
                            isExpanded={expandedItems[index]}
                            onToggleExpand={() => onToggleExpand(index)}
                            onDelete={onItemDeleted}
                            isGridView
                          />
                        ))}
                      </div>
                    </div>
                  )
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No experiences found</p>
                </div>
              )
            ) : (
              projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project, index) => (
                    <ProjectCard
                      key={index}
                      project={project}
                      isExpanded={expandedItems[index]}
                      onToggleExpand={() => onToggleExpand(index)}
                      onDelete={onItemDeleted}
                      isGridView
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No projects found</p>
                </div>
              )
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
