// components/team-members/TeamMemberActions.tsx
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Shield, Trash2, Loader2 } from 'lucide-react';
import { useDeleteTeamMember, useResetPassword, type TeamMember } from '@/hooks/useTeamMembers';

interface TeamMemberActionsProps {
  member: TeamMember;
}

export function TeamMemberActions({ member }: TeamMemberActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteTeamMember = useDeleteTeamMember();
  const resetPassword = useResetPassword();

  const handleDelete = async () => {
    try {
      await deleteTeamMember.mutateAsync(member.id);
      setShowDeleteDialog(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword.mutateAsync(member.id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleResetPassword} disabled={resetPassword.isPending}>
            {resetPassword.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            Reset Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
            disabled={deleteTeamMember.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deactivate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate {member.name}'s account. They will no longer be able to access the system.
              You can reactivate their account later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteTeamMember.isPending}
            >
              {deleteTeamMember.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
