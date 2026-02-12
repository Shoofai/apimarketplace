'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  is_completed: boolean;
  completed_at?: string;
}

interface Deliverable {
  id: string;
  title: string;
  is_completed: boolean;
}

interface Sprint {
  id: string;
  sprint_number: number;
  name: string;
  phase: string;
  status: string;
  duration_weeks: number;
  dependencies: string[];
  notes?: string;
  start_date?: string;
  end_date?: string;
  completed_at?: string;
  tasks: Task[];
  deliverables: Deliverable[];
  progress: {
    tasks: { total: number; completed: number };
    deliverables: { total: number; completed: number };
    percentage: number;
  };
}

interface SprintDetailProps {
  sprint: Sprint;
  onUpdate: (updates: Partial<Sprint>) => Promise<void>;
  onTaskToggle: (taskId: string, completed: boolean) => Promise<void>;
  onDeliverableToggle: (deliverableId: string, completed: boolean) => Promise<void>;
}

export function SprintDetail({
  sprint,
  onUpdate,
  onTaskToggle,
  onDeliverableToggle,
}: SprintDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const statusIcons = {
    not_started: <Circle className="h-4 w-4 text-gray-400" />,
    in_progress: <Clock className="h-4 w-4 text-blue-500" />,
    completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    blocked: <XCircle className="h-4 w-4 text-red-500" />,
  };

  const statusColors = {
    not_started: 'secondary',
    in_progress: 'default',
    completed: 'success',
    blocked: 'destructive',
  } as const;

  async function handleStatusChange(newStatus: string) {
    setIsUpdating(true);
    await onUpdate({ status: newStatus });
    setIsUpdating(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>
              Sprint {sprint.sprint_number}: {sprint.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {sprint.phase} • {sprint.duration_weeks} weeks
            </p>
          </div>
          <div className="flex items-center gap-2">
            {statusIcons[sprint.status as keyof typeof statusIcons]}
            <Select
              value={sprint.status}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{sprint.progress.percentage}%</span>
          </div>
          <Progress value={sprint.progress.percentage} />
        </div>

        {/* Tasks */}
        <div>
          <h4 className="font-medium mb-3">
            Tasks ({sprint.progress.tasks.completed}/{sprint.progress.tasks.total})
          </h4>
          <div className="space-y-2">
            {sprint.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <Checkbox
                  checked={task.is_completed}
                  onCheckedChange={(checked) =>
                    onTaskToggle(task.id, checked as boolean)
                  }
                />
                <span
                  className={`text-sm flex-1 ${
                    task.is_completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverables */}
        <div>
          <h4 className="font-medium mb-3">
            Deliverables ({sprint.progress.deliverables.completed}/
            {sprint.progress.deliverables.total})
          </h4>
          <div className="space-y-2">
            {sprint.deliverables.map((deliverable) => (
              <div key={deliverable.id} className="flex items-center gap-2">
                <Checkbox
                  checked={deliverable.is_completed}
                  onCheckedChange={(checked) =>
                    onDeliverableToggle(deliverable.id, checked as boolean)
                  }
                />
                <span
                  className={`text-sm flex-1 ${
                    deliverable.is_completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {deliverable.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dependencies */}
        {sprint.dependencies && sprint.dependencies.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Dependencies</h4>
            <div className="flex flex-wrap gap-2">
              {sprint.dependencies.map((dep) => (
                <Badge key={dep} variant="outline">
                  {dep}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {sprint.notes && (
          <div>
            <h4 className="font-medium mb-2">Notes</h4>
            <p className="text-sm text-muted-foreground">{sprint.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
