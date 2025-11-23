import Link from 'next/link';
import { ROUTES_APP } from '@/features/routes';

export default function Page() {
  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Welcome</h1>
      <p className="text-muted-foreground">Choose an area to get started.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href={ROUTES_APP.quizzes.list()} className="rounded-md border p-4 hover:bg-accent">
          <div className="font-medium">Quizzes</div>
          <div className="text-sm text-muted-foreground">Create and manage quizzes</div>
        </Link>
        <Link href={ROUTES_APP.history()} className="rounded-md border p-4 hover:bg-accent">
          <div className="font-medium">History</div>
          <div className="text-sm text-muted-foreground">Review past attempts</div>
        </Link>
        <Link href={ROUTES_APP.analytics.root()} className="rounded-md border p-4 hover:bg-accent">
          <div className="font-medium">Analytics</div>
          <div className="text-sm text-muted-foreground">Explore performance insights</div>
        </Link>
        <Link href={ROUTES_APP.profile.root()} className="rounded-md border p-4 hover:bg-accent">
          <div className="font-medium">Profile</div>
          <div className="text-sm text-muted-foreground">Manage your account</div>
        </Link>
      </div>
    </div>
  );
}