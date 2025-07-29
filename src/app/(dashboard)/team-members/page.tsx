// app/dashboard/team-members/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Users, Filter } from 'lucide-react';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { CreateTeamMemberDialog } from '@/components/team-members/CreateTeamMemberDialog';
import { EditTeamMemberDialog } from '@/components/team-members/EditTeamMemberDialog';
import { TeamMemberActions } from '@/components/team-members/TeamMemberActions';
import { TeamMembersTableSkeleton } from '@/components/team-members/TeamMembersSkeleton';
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

export default function TeamMembersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useTeamMembers(page, 10, roleFilter, search);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center ">
          <div>
            <h1 className="text-2xl font-bold">Team Members</h1>
            <p className="text-muted-foreground">Manage your hospital staff</p>
          </div>
        </div>
        <TeamMembersTableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Team Members</h1>
            <p className="text-muted-foreground">Manage your hospital staff</p>
          </div>
          <CreateTeamMemberDialog />
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg font-medium text-red-600">Error loading team members</p>
              <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { users = [], pagination } = data || {};

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage your hospital staff</p>
        </div>
        <CreateTeamMemberDialog />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, email, or employee ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
          <Button 
            onClick={handleSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
            size="sm"
          >
            Search
          </Button>
        </div>
        
        <Select value={roleFilter} onValueChange={handleRoleFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="DOCTOR">Doctor</SelectItem>
            <SelectItem value="NURSE">Nurse</SelectItem>
            <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>
              {pagination?.total || 0} total members
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No team members found</h3>
              <p className="text-muted-foreground mb-4">
                {search ? 'Try adjusting your search criteria' : 'Get started by adding your first team member'}
              </p>
              <CreateTeamMemberDialog />
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{member.name}</h3>
                        {!member.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {member.employeeId && (
                          <span>ID: {member.employeeId}</span>
                        )}
                        {member.phone && (
                          <>
                            {member.employeeId && <span>•</span>}
                            <span>{member.phone}</span>
                          </>
                        )}
                        {member.lastLoginAt && (
                          <>
                            <span>•</span>
                            <span>Last login: {format(new Date(member.lastLoginAt), 'MMM d, yyyy')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={roleColors[member.role]}
                    >
                      {roleLabels[member.role]}
                    </Badge>
                    
                    <EditTeamMemberDialog member={member} />
                    <TeamMemberActions member={member} />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(pageNum => {
                      return pageNum === 1 || 
                             pageNum === pagination.pages || 
                             Math.abs(pageNum - page) <= 1;
                    })
                    .map((pageNum, index, array) => {
                      const showEllipsis = index > 0 && pageNum - array[index - 1] > 1;
                      return (
                        <div key={pageNum} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={pageNum === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        </div>
                      );
                    })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"  
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}