import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  useActivateUserMutation,
  useAdminUsersQuery,
  useDeactivateUserMutation,
} from '@/features/admin/hooks/useAdmin';
import { Spinner } from '@/components/Spinner';
import { ErrorState } from '@/components/ErrorState';
import { useToast } from '@/components/Toast';
import { getApiErrorMessage } from '@/utils/apiError';

export function UsersTable() {
  const { user: currentUser } = useAuth();
  const usersQuery = useAdminUsersQuery();
  const activateUser = useActivateUserMutation();
  const deactivateUser = useDeactivateUserMutation();
  const { toast } = useToast();

  async function handleToggleStatus(userId: string, isActive: boolean) {
    try {
      if (isActive) {
        await deactivateUser.mutateAsync(userId);
        toast({ title: 'User deactivated', variant: 'success' });
      } else {
        await activateUser.mutateAsync(userId);
        toast({ title: 'User activated', variant: 'success' });
      }
    } catch (error) {
      toast({ title: 'Could not update this user', description: getApiErrorMessage(error), variant: 'error' });
    }
  }

  if (usersQuery.isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner label="Loading users" />
      </div>
    );
  }

  if (usersQuery.isError) {
    return (
      <ErrorState
        title="Couldn't load users"
        description={getApiErrorMessage(usersQuery.error)}
        onRetry={() => usersQuery.refetch()}
      />
    );
  }

  return (
    <div className="dw-panel overflow-x-auto bg-paper">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="p-3 font-medium text-muted-foreground">Name</th>
            <th className="p-3 font-medium text-muted-foreground">Email</th>
            <th className="p-3 font-medium text-muted-foreground">Role</th>
            <th className="p-3 font-medium text-muted-foreground">Status</th>
            <th className="p-3 font-medium text-muted-foreground" />
          </tr>
        </thead>
        <tbody>
          {usersQuery.data?.map((user) => {
            const isSelf = user.id === currentUser?.id;
            const isActive = user.status === 'ACTIVE';
            return (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="p-3 text-foreground">
                  {user.firstName} {user.lastName}
                </td>
                <td className="p-3 text-muted-foreground">{user.email}</td>
                <td className="p-3">
                  <Badge variant="outline">{user.role}</Badge>
                </td>
                <td className="p-3">
                  <Badge variant={isActive ? 'accent' : 'outline'}>{user.status}</Badge>
                </td>
                <td className="p-3 text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant={isActive ? 'destructive' : 'outline'}
                    disabled={isSelf || activateUser.isPending || deactivateUser.isPending}
                    title={isSelf ? 'You cannot deactivate your own account' : undefined}
                    onClick={() => handleToggleStatus(user.id, isActive)}
                  >
                    {isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
