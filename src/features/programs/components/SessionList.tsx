import type { ProgramExercise, Session } from '../../../types';
import SessionCard from './SessionCard';

interface SessionListProps {
  sessions: Session[];
  onUpdateLabel: (sessionId: string, label: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onAddExercise: (sessionId: string) => void;
  onUpdateParams: (
    sessionId: string,
    programExerciseId: string,
    params: Partial<Pick<ProgramExercise, 'sets' | 'reps' | 'holdTime' | 'restSeconds' | 'notes'>>
  ) => void;
  onRemoveExercise: (sessionId: string, programExerciseId: string) => void;
  onReorder: (sessionId: string, oldIndex: number, newIndex: number) => void;
}

export default function SessionList({
  sessions,
  onUpdateLabel,
  onDeleteSession,
  onAddExercise,
  onUpdateParams,
  onRemoveExercise,
  onReorder,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
        No sessions yet — click Add Session to begin
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onUpdateLabel={(label) => onUpdateLabel(session.id, label)}
          onDelete={() => onDeleteSession(session.id)}
          onAddExercise={() => onAddExercise(session.id)}
          onUpdateParams={(peId, params) => onUpdateParams(session.id, peId, params)}
          onRemoveExercise={(peId) => onRemoveExercise(session.id, peId)}
          onReorder={(oldIndex, newIndex) => onReorder(session.id, oldIndex, newIndex)}
        />
      ))}
    </div>
  );
}
