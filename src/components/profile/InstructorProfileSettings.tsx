'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNextAuth } from '@/hooks/useNextAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { User, Phone, Lock, Globe, Shield, AlertCircle } from 'lucide-react';
import { ProfileApiService, UpdateDetailsRequest, UpdatePasswordRequest, AccountDTO } from '@/lib/profile-api';
import { hasApiErrors, BackendError } from '@/types/api';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Profile update validation schema
const profileUpdateSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(30, 'First name must be at most 30 characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(30, 'Last name must be at most 30 characters'),
  language: z.enum(['EN', 'UZ', 'RU'], {
    required_error: 'Please select a language',
  }),
  dashboardType: z.enum(['STUDENT', 'INSTRUCTOR'], {
    required_error: 'Please select a dashboard type',
  }),
});

// Password change validation schema
const passwordChangeSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  newPassword: z.string()
    .min(1, 'New password is required')
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

export function InstructorProfileSettings() {
  const { getAccessToken } = useNextAuth();
  const [profile, setProfile] = useState<AccountDTO | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const t = useTranslations();

  const profileForm = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      language: 'EN',
      dashboardType: 'INSTRUCTOR',
    },
  });

  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          toast.error('Authentication required');
          return;
        }

        const response = await ProfileApiService.getCurrentProfile(token);
        
        if (hasApiErrors(response)) {
          toast.error('Failed to load profile');
          return;
        }

        const profileData = response.data;
        setProfile(profileData);
        
        // Populate form with profile data
        profileForm.reset({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          language: profileData.language || 'EN',
          dashboardType: profileData.dashboardType || 'INSTRUCTOR',
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [getAccessToken, profileForm]);

  const handleProfileUpdate = async (data: ProfileUpdateFormData) => {
    setIsUpdatingProfile(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const updateRequest: UpdateDetailsRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        language: data.language,
        dashboardType: data.dashboardType,
      };

      const response = await ProfileApiService.updateDetails(updateRequest, token);
      
      if (hasApiErrors(response)) {
        const error = new BackendError(response);
        
        // Handle field-specific errors
        if (error.hasFieldErrors('firstName')) {
          profileForm.setError('firstName', { message: error.getFieldErrors('firstName')[0].message });
        }
        if (error.hasFieldErrors('lastName')) {
          profileForm.setError('lastName', { message: error.getFieldErrors('lastName')[0].message });
        }
        if (error.hasFieldErrors('language')) {
          profileForm.setError('language', { message: error.getFieldErrors('language')[0].message });
        }
        
        toast.error('Failed to update profile. Please check the form.');
        return;
      }

      const updatedProfile = response.data;
      setProfile(updatedProfile);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (data: PasswordChangeFormData) => {
    setIsChangingPassword(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const passwordRequest: UpdatePasswordRequest = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };

      const response = await ProfileApiService.updatePassword(passwordRequest, token);
      
      if (hasApiErrors(response)) {
        const error = new BackendError(response);
        
        // Handle field-specific errors
        if (error.hasFieldErrors('currentPassword')) {
          passwordForm.setError('currentPassword', { message: error.getFieldErrors('currentPassword')[0].message });
        }
        if (error.hasFieldErrors('newPassword')) {
          passwordForm.setError('newPassword', { message: error.getFieldErrors('newPassword')[0].message });
        }
        
        toast.error('Failed to change password. Please check the form.');
        return;
      }

      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-center">
          <InlineLoading text={t('common.loading', { default: 'Loading profile...' })} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {profile?.firstName} {profile?.lastName}
              </CardTitle>
              <CardDescription className="flex items-center space-x-4 mt-1">
                <span className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>{profile?.phone}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span>{profile?.roles?.join(', ') || 'No roles'}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span className="capitalize">Instructor</span>
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Phone Number Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Phone Number Updates</h4>
              <p className="text-sm text-amber-700 mt-1">
                Phone number updates are currently not supported through this interface. 
                Please contact support if you need to change your phone number.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings - All in One Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Profile Settings</span>
          </CardTitle>
          <CardDescription>
            Update your personal information, preferences, and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Profile Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Personal Information</h3>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EN">English</SelectItem>
                            <SelectItem value="UZ">O&apos;zbek</SelectItem>
                            <SelectItem value="RU">Русский</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="dashboardType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dashboard Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select dashboard type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                            <SelectItem value="STUDENT">Student</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isUpdatingProfile} className="w-full md:w-auto">
                  {isUpdatingProfile ? (
                    <>
                      <InlineLoading text="Updating..." />
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Password Change */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Change Password</span>
            </h3>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isChangingPassword} className="w-full md:w-auto">
                  {isChangingPassword ? (
                    <>
                      <InlineLoading text="Changing..." />
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}