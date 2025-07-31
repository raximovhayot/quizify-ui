'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InstructorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/instructor/quizzes');
  }, [router]);

  return null;
}