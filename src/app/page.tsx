import { redirect } from 'next/navigation';

import { ROUTES_APP } from '@/features/dashboard/routes';

export default function Page() {
  redirect(ROUTES_APP.root());
}
