import Roles from '#users/enums/role'

export function getUserDashboardRoute(roleId: number) {
  const roleRoutes = {
    [Roles.ADMIN]: 'admin.dashboard',
    [Roles.STAFF]: 'staff.dashboard',
    [Roles.USER]: 'booking',
  } as Record<number, string>

  return roleRoutes[roleId]
}
