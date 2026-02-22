'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SprintDetail } from './SprintDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

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
  tasks: any[];
  deliverables: any[];
  progress: {
    tasks: { total: number; completed: number };
    deliverables: { total: number; completed: number };
    percentage: number;
  };
}

// Phase ranges by sprint_number (so totals are correct even if DB phase field differs)
const PHASES: { name: string; count: number; start: number; end: number }[] = [
  { name: 'Phase 1: Foundation', count: 4, start: 1, end: 4 },
  { name: 'Phase 2: Core Marketplace', count: 8, start: 5, end: 12 },
  { name: 'Phase 3: Killer Features', count: 5, start: 13, end: 17 },
  { name: 'Phase 4: Advanced Features', count: 5, start: 18, end: 22 },
  { name: 'Phase 5: Operations & Launch', count: 6, start: 23, end: 28 },
  { name: 'Phase 6: Post-launch changelog', count: 1, start: 29, end: 29 },
];

export function TrackerOverview() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  useEffect(() => {
    fetchSprints();
  }, []);

  async function fetchSprints() {
    try {
      const response = await fetch('/api/admin/tracker/sprints');
      const data = await response.json();
      setSprints(data.sprints || []);
    } catch (error) {
      console.error('Failed to fetch sprints:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateSprint(sprintId: string, updates: any) {
    await fetch(`/api/admin/tracker/sprints/${sprintId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    await fetchSprints();
  }

  async function toggleTask(taskId: string, completed: boolean) {
    await fetch(`/api/admin/tracker/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed: completed }),
    });
    await fetchSprints();
  }

  async function toggleDeliverable(deliverableId: string, completed: boolean) {
    await fetch(`/api/admin/tracker/deliverables/${deliverableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed: completed }),
    });
    await fetchSprints();
  }

  if (loading) {
    return <TrackerSkeleton />;
  }

  const totalSprints = sprints.length;
  const completedSprints = sprints.filter((s) => s.status === 'completed').length;
  const overallProgress = Math.round((completedSprints / totalSprints) * 100);

  // Group sprints by phase (by sprint_number so totals match regardless of DB phase field)
  const sprintsByPhase = PHASES.map((phase) => {
    const phaseSprints = sprints.filter(
      (s) => s.sprint_number >= phase.start && s.sprint_number <= phase.end
    );
    return { ...phase, sprints: phaseSprints };
  });

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall</span>
              <span className="text-sm text-muted-foreground">
                {completedSprints}/{totalSprints} sprints ({overallProgress}%)
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Phase Progress */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sprintsByPhase.map((phase) => {
          const phaseCompleted = phase.sprints.filter((s) => s.status === 'completed').length;
          const phaseTotal = phase.sprints.length;
          const phaseProgress =
            phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;

          return (
            <Card key={phase.name}>
              <CardHeader>
                <CardTitle className="text-base">{phase.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {phaseCompleted}/{phaseTotal} sprints
                    </span>
                    <span className="text-muted-foreground">{phaseProgress}%</span>
                  </div>
                  <Progress value={phaseProgress} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sprint List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">All Sprints</h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sprints.map((sprint) => (
            <div
              key={sprint.id}
              className="border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setSelectedSprint(sprint)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    Sprint {sprint.sprint_number}: {sprint.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{sprint.phase}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{sprint.progress.percentage}%</p>
                  <p className="text-xs text-muted-foreground capitalize">{sprint.status}</p>
                </div>
              </div>
              <Progress value={sprint.progress.percentage} className="mt-3" />
            </div>
          ))}
        </div>
      </div>

      {/* Selected Sprint Detail */}
      {selectedSprint && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <SprintDetail
              sprint={selectedSprint}
              onUpdate={(updates) => updateSprint(selectedSprint.id, updates)}
              onTaskToggle={toggleTask}
              onDeliverableToggle={toggleDeliverable}
            />
            <button
              onClick={() => setSelectedSprint(null)}
              className="mt-4 w-full py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TrackerSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
