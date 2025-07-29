// app/dashboard/team-members/[id]/page.tsx
'use client';

import { use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Shield,
  Edit,
  UserCheck,
  UserX
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTeamMember, useResetPassword } from '@/hooks/useTeamMembers';
import { TeamMemberFormSkeleton } from '@/components/team-members/TeamMembersSkeleton';
import { EditTeamMemberDialog } from '@/components/team-members/EditTeamMemberDialog';
import { format } from 'date-fns';

const roleColors = {
  ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
  DOCTOR: 'bg-blue-100 text-blue-800 border-blue-200',
  NURSE: 'bg-green-100 text-green-800 border-green-200',
  RECEPTIONIST: 'bg-orange-100 text-orange-800 border-orange-200',
};

const roleLabels = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  RECEPTIONIST: 'Receptionist',
};

interface TeamMemberDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TeamMemberDetailPage({ params }: TeamMemberDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, error } = useTeamMember(id);
  const resetPassword = useResetPassword();

  const handleResetPassword = async () => {
    if (!data?.user) return;
    try {
      await resetPassword.mutateAsync(data.user.id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <TeamMemberFormSkeleton />
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg font-medium text-red-600">Team member not found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error?.message || 'The requested team member could not be found.'}
              </p>
              <Button onClick={() => router.back()} className="mt-4">
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user: member } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Team Member Details</h1>
            <p className="text-muted-foreground">View and manage team member information</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <EditTeamMemberDialog member={member} />
          <Button 
            variant="outline" 
            onClick={handleResetPassword}
            disabled={resetPassword.isPending}
          >
            <Shield className="h-4 w-4 mr-2" />
            Reset Password
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarFallback className="text-lg">
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="flex items-center justify-center gap-2">
              {member.name}
              {member.isActive ? (
                <UserCheck className="h-4 w-4 text-green-600" />
              ) : (
                <UserX className="h-4 w-4 text-red-600" />
              )}
            </CardTitle>
            <div className="flex justify-center">
              <Badge 
                variant="outline" 
                className={roleColors[member.role]}
              >
                {roleLabels[member.role]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{member.email}</span>
              </div>
              
              {member.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phone}</span>
                </div>
              )}
              
              {member.employeeId && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">
                    ID: {member.employeeId}
                  </Badge>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge 
                  variant={member.isActive ? "default" : "secondary"}
                  className={member.isActive ? "bg-green-100 text-green-800" : ""}
                >
                  {member.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span>{format(new Date(member.createdAt), 'MMM d, yyyy')}</span>
              </div>
              
              {member.lastLoginAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last login</span>
                  <span>{format(new Date(member.lastLoginAt), 'MMM d, yyyy HH:mm')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Activity Overview
              </CardTitle>
              <CardDescription>
                Recent activity and login history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Account Created</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(member.createdAt), 'MMMM d, yyyy \'at\' HH:mm')}
                  </p>
                </div>
                
                {member.updatedAt && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      {format(new Date(member.updatedAt), 'MMMM d, yyyy \'at\' HH:mm')}
                    </p>
                  </div>
                )}
                
                {member.lastLoginAt && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {format(new Date(member.lastLoginAt), 'MMMM d, yyyy \'at\' HH:mm')}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Access Level</p>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge 
                      variant="outline" 
                      className={roleColors[member.role]}
                    >
                      {roleLabels[member.role]}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage this team member's account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditTeamMemberDialog member={member} />
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleResetPassword}
                  disabled={resetPassword.isPending}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}