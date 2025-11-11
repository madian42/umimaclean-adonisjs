import Roles from '#users/enums/role_enum'

export function getUserDashboardRoute(roleId: number) {
  const roleRoutes = {
    [Roles.ADMIN]: 'admin.dashboard',
    [Roles.STAFF]: 'staff.dashboard',
    [Roles.USER]: 'bookings.create',
  } as Record<number, string>

  return roleRoutes[roleId] || 'bookings.create'
}
