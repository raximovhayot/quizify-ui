'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { BookOpen, Users, GraduationCap, ClipboardList } from 'lucide-react';

interface RoleOption {
  role: 'STUDENT' | 'INSTRUCTOR';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  redirectPath: string;
}

export default function SelectRolePage() {
  const { user, hasRole, isAuthenticated, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'INSTRUCTOR' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    // If user is not authenticated, redirect to sign-in
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in');
      return;
    }

    // If user doesn't have multiple roles, redirect to appropriate dashboard
    if (!isLoading && user) {
      const hasStudent = hasRole('STUDENT');
      const hasInstructor = hasRole('INSTRUCTOR');

      if (hasStudent && hasInstructor) {
        // User has both roles, show role selection
        return;
      } else if (hasStudent) {
        router.push('/student');
        return;
      } else if (hasInstructor) {
        router.push('/instructor');
        return;
      } else {
        // User has no valid roles, redirect to sign-in
        router.push('/sign-in');
        return;
      }
    }
  }, [user, hasRole, isAuthenticated, isLoading, router]);

  const roleOptions: RoleOption[] = [
    {
      role: 'STUDENT',
      title: 'Continue as Student',
      description: 'Access your assignments, take quizzes, and view your progress',
      icon: GraduationCap,
      features: [
        'Take quizzes and assignments',
        'View your progress and results',
        'Join assignments with codes',
        'Track your learning journey'
      ],
      redirectPath: '/student'
    },
    {
      role: 'INSTRUCTOR',
      title: 'Continue as Instructor',
      description: 'Create quizzes, manage assignments, and track student progress',
      icon: Users,
      features: [
        'Create and manage quizzes',
        'Set up assignments',
        'View detailed analytics',
        'Monitor student progress'
      ],
      redirectPath: '/instructor'
    }
  ];

  // Filter role options based on user's actual roles
  const availableRoles = roleOptions.filter(option => hasRole(option.role));

  const handleRoleSelect = async (role: 'STUDENT' | 'INSTRUCTOR') => {
    setSelectedRole(role);
    setIsSubmitting(true);

    try {
      // TODO: In a real app, you might want to store the selected role in localStorage
      // or send it to the backend to track user's preferred role
      localStorage.setItem('selectedRole', role);
      
      // Simulate a brief loading state for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const selectedOption = roleOptions.find(option => option.role === role);
      if (selectedOption) {
        toast.success(`Continuing as ${role.toLowerCase()}`);
        router.push(selectedOption.redirectPath);
      }
    } catch (error) {
      toast.error('Failed to select role. Please try again.');
      console.error('Role selection error:', error);
    } finally {
      setIsSubmitting(false);
      setSelectedRole(null);
    }
  };

  if (isLoading) {
    return (
      <AuthLayout title="Quizify">
        <div className="flex items-center justify-center py-12">
          <InlineLoading text={t('common.loading')} />
        </div>
      </AuthLayout>
    );
  }

  if (!user || availableRoles.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <AuthLayout title="Quizify">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">
              Welcome back, {user.firstName}!
            </CardTitle>
            <CardDescription>
              You have multiple roles. Please select how you&apos;d like to continue.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {availableRoles.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedRole === option.role;
            const isCurrentlySubmitting = isSubmitting && isSelected;

            return (
              <Card 
                key={option.role}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{option.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {option.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      What you can do:
                    </h4>
                    <ul className="space-y-1">
                      {option.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => handleRoleSelect(option.role)}
                    disabled={isSubmitting}
                    className="w-full"
                    variant={isSelected ? "default" : "outline"}
                  >
                    {isCurrentlySubmitting ? (
                      <InlineLoading text="Loading..." />
                    ) : (
                      `Continue as ${option.role.toLowerCase()}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats or Additional Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Switch roles anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClipboardList className="w-4 h-4" />
                <span>All your data is synced</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}