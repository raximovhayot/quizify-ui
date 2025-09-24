import { redirect } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';

export default function InstructorPage() {
  redirect(`${ROUTES_APP.baseUrl()}/quizzes`);
}
