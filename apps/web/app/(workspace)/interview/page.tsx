import { QuestionBank } from '@/components/question-bank';

export default function InterviewPage() {
  return (
    <QuestionBank
      bank="interview"
      title="Interview"
      blurb="What a 2026 senior loop actually asks: LLMs as production dependencies, agents with permissions, evals, and the backend rounds that never went away. Level is Easy, Medium and Hard on the same ladder the rest of the app uses."
    />
  );
}
