import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { 
  Users, 
  Shield, 
  Database, 
  Bell,
  Info,
  User as UserIcon,
  Edit,
  Save
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

import { userService } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/utils'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'

import type { User, UserRole } from '@/types'

const userRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'COACH', 'ANALYST'] as const)
})

export function Settings() {
  const { user } = useAuth()
  const location = useLocation()

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need administrator privileges to access settings.</p>
        </div>
      </div>
    )
  }

  const settingsNavigation = [
    { name: 'System Info', path: '/settings', icon: Info },
    { name: 'User Management', path: '/settings/users', icon: Users },
    { name: 'Database', path: '/settings/database', icon: Database },
    { name: 'Notifications', path: '/settings/notifications', icon: Bell }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage system configuration and users</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {settingsNavigation.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <Routes>
        <Route path="/" element={<SystemInfo />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/database" element={<DatabaseSettings />} />
        <Route path="/notifications" element={<NotificationSettings />} />
      </Routes>
    </div>
  )
}

function SystemInfo() {
  const systemInfo = {
    appName: 'CRICKSTATS',
    version: '1.0.0',
    environment: 'Development',
    database: 'Supabase PostgreSQL',
    lastBackup: '2024-01-15 10:30:00',
    uptime: '5 days, 14 hours',
    totalUsers: 25,
    activeUsers: 18,
    storageUsed: '2.3 GB',
    storageLimit: '10 GB'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Application Name</label>
                <p className="text-lg font-semibold">{systemInfo.appName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Version</label>
                <p className="text-lg font-semibold">{systemInfo.version}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Environment</label>
                <Badge variant="info">{systemInfo.environment}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Database</label>
                <p className="text-lg font-semibold">{systemInfo.database}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Backup</label>
                <p className="text-lg font-semibold">{systemInfo.lastBackup}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">System Uptime</label>
                <p className="text-lg font-semibold text-green-600">{systemInfo.uptime}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Users</label>
                <p className="text-lg font-semibold">{systemInfo.totalUsers}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Active Users</label>
                <p className="text-lg font-semibold text-green-600">{systemInfo.activeUsers}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Storage Usage</label>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-semibold">{systemInfo.storageUsed}</p>
                  <span className="text-gray-500">/ {systemInfo.storageLimit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">New user registered</p>
                <p className="text-sm text-gray-500">john.doe@email.com joined as Analyst</p>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Database backup completed</p>
                <p className="text-sm text-gray-500">Automatic backup successful</p>
              </div>
              <span className="text-sm text-gray-500">6 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">System update deployed</p>
                <p className="text-sm text-gray-500">Version 1.0.0 released</p>
              </div>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const form = useForm<{ role: UserRole }>({
    resolver: zodResolver(userRoleSchema),
    defaultValues: {
      role: 'ANALYST'
    }
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await userService.getAll()
      if (error) {
        toast.error('Failed to load users')
        console.error('Error loading users:', error)
      } else {
        setUsers(data || [])
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    form.reset({ role: user.role })
    setIsEditModalOpen(true)
  }

  const handleUpdateRole = async (data: { role: UserRole }) => {
    if (!editingUser) return

    try {
      const { error } = await userService.updateRole(editingUser.id, data.role)
      if (error) {
        toast.error('Failed to update user role')
        console.error('Error updating user role:', error)
      } else {
        toast.success('User role updated successfully')
        setIsEditModalOpen(false)
        setEditingUser(null)
        form.reset()
        loadUsers()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    }
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'danger'
      case 'MANAGER': return 'warning'
      case 'COACH': return 'info'
      case 'ANALYST': return 'default'
      default: return 'default'
    }
  }

  const getRolePermissions = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'Full system access, user management, settings'
      case 'MANAGER':
        return 'Player management, performance entry, reports'
      case 'COACH':
        return 'Performance entry, reports, analytics'
      case 'ANALYST':
        return 'View access, reports, analytics, data export'
      default:
        return 'Limited access'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            System Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-primary-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.full_name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs">
                          {getRolePermissions(user.role)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(user.updated_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(['ADMIN', 'MANAGER', 'COACH', 'ANALYST'] as UserRole[]).map((role) => {
          const count = users.filter(user => user.role === role).length
          return (
            <Card key={role}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-gray-500">{role}S</p>
                  </div>
                  <Badge variant={getRoleBadgeVariant(role)}>{role}</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit User Role Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingUser(null)
          form.reset()
        }}
        title={`Edit User Role - ${editingUser?.full_name || editingUser?.email}`}
      >
        <form onSubmit={form.handleSubmit(handleUpdateRole)} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Current role: <Badge variant={getRoleBadgeVariant(editingUser?.role || 'ANALYST')}>
                {editingUser?.role}
              </Badge>
            </p>
            <Select
              label="New Role"
              options={[
                { value: 'ADMIN', label: 'Administrator - Full system access' },
                { value: 'MANAGER', label: 'Manager - Player & performance management' },
                { value: 'COACH', label: 'Coach - Performance entry & analysis' },
                { value: 'ANALYST', label: 'Analyst - View access & reports' }
              ]}
              {...form.register('role')}
              error={form.formState.errors.role?.message}
            />
            <div className="p-3 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Changing user roles will immediately affect their access permissions.
                Make sure this change is intentional and authorized.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingUser(null)
                form.reset()
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={form.formState.isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              Update Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function DatabaseSettings() {
  const [backupInProgress, setBackupInProgress] = useState(false)
  const [seedInProgress, setSeedInProgress] = useState(false)
  const [clearInProgress, setClearInProgress] = useState(false)

  const handleBackup = async () => {
    setBackupInProgress(true)
    // Simulate backup process
    setTimeout(() => {
      setBackupInProgress(false)
      toast.success('Database backup completed successfully')
    }, 3000)
  }

  const handleSeedDatabase = async () => {
    if (!confirm('This will add sample data to the database. Continue?')) {
      return
    }
    
    setSeedInProgress(true)
    try {
      const { seedDatabase } = await import('@/lib/seed-data')
      const result = await seedDatabase()
      
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to seed database')
      console.error('Error seeding database:', error)
    } finally {
      setSeedInProgress(false)
    }
  }

  const handleClearDatabase = async () => {
    if (!confirm('WARNING: This will delete ALL data in the database. This action cannot be undone. Are you sure?')) {
      return
    }
    
    if (!confirm('This is your final warning. ALL player and match performance data will be permanently deleted. Continue?')) {
      return
    }
    
    setClearInProgress(true)
    try {
      const { clearDatabase } = await import('@/lib/seed-data')
      const result = await clearDatabase()
      
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to clear database')
      console.error('Error clearing database:', error)
    } finally {
      setClearInProgress(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Database Management</h2>
        <p className="text-gray-600">Manage database operations and maintenance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Database Operations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Backup & Recovery</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Create a manual backup of the database. Automated backups run daily at 2:00 AM UTC.
                </p>
                <Button 
                  onClick={handleBackup} 
                  loading={backupInProgress}
                  disabled={backupInProgress}
                >
                  {backupInProgress ? 'Creating Backup...' : 'Create Manual Backup'}
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Database Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Players:</span>
                  <span className="font-medium">247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Performances:</span>
                  <span className="font-medium">1,423</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Database Size:</span>
                  <span className="font-medium">2.3 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Optimized:</span>
                  <span className="font-medium">2 days ago</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium mb-4">Data Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Seed Sample Data</h4>
                <p className="text-sm text-gray-600">
                  Add realistic cricket player and match performance data for testing and demonstration.
                </p>
                <Button 
                  onClick={handleSeedDatabase}
                  loading={seedInProgress}
                  disabled={seedInProgress}
                  variant="secondary"
                >
                  {seedInProgress ? 'Adding Data...' : 'Add Sample Data'}
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-red-700">Clear All Data</h4>
                <p className="text-sm text-gray-600">
                  ⚠️ Permanently delete all players and match performances. This cannot be undone!
                </p>
                <Button 
                  onClick={handleClearDatabase}
                  loading={clearInProgress}
                  disabled={clearInProgress}
                  variant="danger"
                >
                  {clearInProgress ? 'Clearing Data...' : 'Clear All Data'}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium mb-4">Maintenance Schedule</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium">Daily Backup</p>
                  <p className="text-sm text-gray-600">Automated database backup</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium">Weekly Optimization</p>
                  <p className="text-sm text-gray-600">Database performance optimization</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium">Monthly Archive</p>
                  <p className="text-sm text-gray-600">Archive old performance data</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    performanceAlerts: true,
    systemUpdates: false,
    weeklyReports: true,
    userRegistrations: true
  })

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    toast.success('Notification setting updated')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Notification Settings</h2>
        <p className="text-gray-600">Configure system notifications and alerts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(settings).map(([key, value]) => {
            const labels = {
              emailNotifications: {
                title: 'Email Notifications',
                description: 'Receive important updates via email'
              },
              performanceAlerts: {
                title: 'Performance Alerts',
                description: 'Get notified of exceptional player performances'
              },
              systemUpdates: {
                title: 'System Updates',
                description: 'Notifications about system maintenance and updates'
              },
              weeklyReports: {
                title: 'Weekly Reports',
                description: 'Automated weekly performance summary reports'
              },
              userRegistrations: {
                title: 'User Registrations',
                description: 'Alerts when new users register for the system'
              }
            }

            return (
              <div key={key} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">{labels[key as keyof typeof labels].title}</p>
                  <p className="text-sm text-gray-600">{labels[key as keyof typeof labels].description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleSettingChange(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 border-l-4 border-blue-500 bg-blue-50">
              <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">New century scored</p>
                <p className="text-sm text-blue-700">Player John Smith scored 127 runs in today's match</p>
                <p className="text-xs text-blue-600 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 border-l-4 border-green-500 bg-green-50">
              <Bell className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900">System backup completed</p>
                <p className="text-sm text-green-700">Daily automated backup finished successfully</p>
                <p className="text-xs text-green-600 mt-1">6 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 border-l-4 border-yellow-500 bg-yellow-50">
              <Bell className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900">New user registration</p>
                <p className="text-sm text-yellow-700">jane.doe@email.com registered as Coach</p>
                <p className="text-xs text-yellow-600 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}