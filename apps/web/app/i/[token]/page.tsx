import { InterviewRoom } from '@/components/interview-room';

export const metadata = { title: 'Interview room · EngineerOS' };

/** Outside the workspace group on purpose: a candidate arrives with a link and no account. */
export default function RoomPage() {
  return <InterviewRoom />;
}
