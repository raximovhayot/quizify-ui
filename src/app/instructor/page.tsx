import { redirect } from 'next/navigation';

import { ROUTES_APP } from '@/features/instructor/routes';

export default function InstructorPage() {
  redirect(ROUTES_APP.quizzes.list());
}
