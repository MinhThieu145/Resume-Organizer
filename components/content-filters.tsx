import { Grid, List } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ContentFiltersProps {
  contentType: 'experience' | 'project';
  onContentTypeChange: (checked: boolean) => void;
  onViewModeChange: (value: 'list' | 'grid') => void;
}

export function ContentFilters({
  contentType,
  onContentTypeChange,
  onViewModeChange
}: ContentFiltersProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Files</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="older">Older</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Switch
            id="content-toggle"
            checked={contentType === 'project'}
            onCheckedChange={onContentTypeChange}
          />
          <Label htmlFor="content-toggle">
            {contentType === 'experience' ? 'Experience' : 'Projects'}
          </Label>
        </div>
      </div>

      <Tabs defaultValue="list" onValueChange={(value) => onViewModeChange(value as 'list' | 'grid')}>
        <TabsList>
          <TabsTrigger value="grid">
            <Grid className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
