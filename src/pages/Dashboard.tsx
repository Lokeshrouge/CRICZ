import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Trophy, 
  Target, 
  TrendingUp, 
  Award, 
  Activity,
  Filter,
  RefreshCw
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import toast from 'react-hot-toast'

import { dashboardService, playerService } from '@/lib/dataService'
import { useAuth } from '@/contexts/AuthContext'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'

import type { Player } from '@/types'
import { TEAMS, PLAYER_ROLES, MATCH_CATEGORIES } from '@/types'

interface DashboardStats {
  totalPlayers: number
  totalMatches: number
  totalRuns: number
  totalWickets: number
  avgScore: number
  playerOfMatchAwards: number
  total4s?: number
  total6s?: number
}

interface ChartData {
  runsByPlayer: Array<{ player_name: string; total_runs: number }>
  wicketsByPlayer: Array<{ player_name: string; total_wickets: number }>
  matchesByTeam: Array<{ team: string; count: number }>
  matchResults: Array<{ result: string; count: number }>
}

interface PlayerFlowData {
  selectedTeam: string
  teamPlayers: Player[]
  loading: boolean
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

export function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalPlayers: 0,
    totalMatches: 0,
    totalRuns: 0,
    totalWickets: 0,
    avgScore: 0,
    playerOfMatchAwards: 0,
    total4s: 0,
    total6s: 0
  })
  const [chartData, setChartData] = useState<ChartData>({
    runsByPlayer: [],
    wicketsByPlayer: [],
    matchesByTeam: [],
    matchResults: []
  })
  const [playerFlow, setPlayerFlow] = useState<PlayerFlowData>({
    selectedTeam: '',
    teamPlayers: [],
    loading: false
  })
  const [filters, setFilters] = useState({
    team: '',
    role: '',
    matchCategory: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [filters])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, chartsData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getChartData()
      ])

      setStats(statsData)
      setChartData(chartsData)
    } catch (error) {
      toast.error('Failed to load dashboard data')
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamSelect = async (team: string) => {
    if (!team) {
      setPlayerFlow({
        selectedTeam: '',
        teamPlayers: [],
        loading: false
      })
      return
    }

    try {
      setPlayerFlow(prev => ({ ...prev, selectedTeam: team, loading: true }))
      const { data, error } = await playerService.getByTeam(team)
      
      if (error) {
        toast.error('Failed to load team players')
        console.error('Error loading team players:', error)
      } else {
        setPlayerFlow({
          selectedTeam: team,
          teamPlayers: data || [],
          loading: false
        })
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
      setPlayerFlow(prev => ({ ...prev, loading: false }))
    }
  }

  const handleRefresh = () => {
    loadDashboardData()
  }

  const statCards = [
    {
      title: 'Total Players',
      value: stats.totalPlayers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/players'
    },
    {
      title: 'Total Matches',
      value: stats.totalMatches,
      icon: Trophy,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/match-performances'
    },
    {
      title: 'Total Runs',
      value: stats.totalRuns.toLocaleString(),
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Wickets',
      value: stats.totalWickets,
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Average Score',
      value: stats.avgScore,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Player of Match',
      value: stats.playerOfMatchAwards,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRICKSTATS Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.full_name || user?.email}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Dashboard Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              options={TEAMS.map(team => ({ value: team, label: team }))}
              value={filters.team}
              onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
              placeholder="Filter by team"
            />
            <Select
              options={PLAYER_ROLES.map(role => ({ value: role, label: role }))}
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              placeholder="Filter by role"
            />
            <Select
              options={MATCH_CATEGORIES.map(category => ({ value: category, label: category }))}
              value={filters.matchCategory}
              onChange={(e) => setFilters(prev => ({ ...prev, matchCategory: e.target.value }))}
              placeholder="Filter by match category"
            />
          </div>
          {(filters.team || filters.role || filters.matchCategory) && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ team: '', role: '', matchCategory: '' })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {stat.link ? (
                <Link to={stat.link} className="block">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Run Scorers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Run Scorers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.runsByPlayer}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="player_name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_runs" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Wicket Takers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Wicket Takers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.wicketsByPlayer}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="player_name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_wickets" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matches by Team */}
        <Card>
          <CardHeader>
            <CardTitle>Matches by Team</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.matchesByTeam}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ team, percent }) => `${team}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="team"
                    >
                      {chartData.matchesByTeam.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Results */}
        <Card>
          <CardHeader>
            <CardTitle>Match Results Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.matchResults}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="result" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Player Flow Section */}
      <Card>
        <CardHeader>
          <CardTitle>Player Flow - Team Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-md">
            <Select
              label="Select Team"
              options={TEAMS.map(team => ({ value: team, label: team }))}
              value={playerFlow.selectedTeam}
              onChange={(e) => handleTeamSelect(e.target.value)}
              placeholder="Choose a team to view players..."
            />
          </div>

          {playerFlow.selectedTeam && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Player Information - {playerFlow.selectedTeam}
              </h3>
              
              {playerFlow.loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : playerFlow.teamPlayers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No players found for this team</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Total Runs</TableHead>
                        <TableHead>AVG Score</TableHead>
                        <TableHead>Batting Style</TableHead>
                        <TableHead>Bowling Style</TableHead>
                        <TableHead>Matches Played</TableHead>
                        <TableHead>50s</TableHead>
                        <TableHead>100s</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {playerFlow.teamPlayers.map((player) => (
                        <TableRow key={player.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {player.profile_picture ? (
                                <img
                                  src={player.profile_picture}
                                  alt={`${player.player_name} profile photo`}
                                  className="h-8 w-8 rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/default-avatar.svg'
                                  }}
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                  <span className="text-primary-600 font-medium text-sm">
                                    {player.player_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </span>
                                </div>
                              )}
                              <Link 
                                to={`/players/${player.id}`}
                                className="font-medium text-primary-600 hover:text-primary-700"
                              >
                                {player.player_name}
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{player.total_runs}</TableCell>
                          <TableCell>{player.avg_score}</TableCell>
                          <TableCell>{player.batting_style}</TableCell>
                          <TableCell>{player.bowling_style}</TableCell>
                          <TableCell>{player.matches_played}</TableCell>
                          <TableCell>
                            <Badge variant="success">{player.number_of_50s}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="warning">{player.number_of_100s}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {user?.role && ['ADMIN', 'MANAGER'].includes(user.role) && (
              <Link to="/players">
                <Button className="w-full" variant="secondary">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Players
                </Button>
              </Link>
            )}
            {user?.role && ['ADMIN', 'MANAGER', 'COACH'].includes(user.role) && (
              <Link to="/match-performances">
                <Button className="w-full" variant="secondary">
                  <Trophy className="h-4 w-4 mr-2" />
                  Add Performance
                </Button>
              </Link>
            )}
            <Link to="/reports">
              <Button className="w-full" variant="secondary">
                <Activity className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </Link>
            <Link to="/analytics">
              <Button className="w-full" variant="secondary">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}