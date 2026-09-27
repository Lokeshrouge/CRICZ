import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  Trophy, 
  Target,
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
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import toast from 'react-hot-toast'

import { dashboardService, playerService } from '@/lib/dataService'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

import { TEAMS, PLAYER_ROLES, MATCH_CATEGORIES } from '@/types'

interface AnalyticsData {
  runsByPlayer: Array<{ player_name: string; total_runs: number; matches_played: number; avg_score: number }>
  wicketsByPlayer: Array<{ player_name: string; total_wickets: number; total_overs: number }>
  matchesByTeam: Array<{ team: string; count: number }>
  matchResults: Array<{ result: string; count: number }>
  teamComparison: Array<{ team: string; totalRuns: number; totalWickets: number; players: number }>
  performanceCategories: Array<{ category: string; domestic: number; international: number }>
}

export function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    runsByPlayer: [],
    wicketsByPlayer: [],
    matchesByTeam: [],
    matchResults: [],
    teamComparison: [],
    performanceCategories: []
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    team: '',
    role: '',
    matchCategory: ''
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [filters])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const [chartData, playersData] = await Promise.all([
        dashboardService.getChartData(),
        playerService.getAll(filters)
      ])

      // Process team comparison data
      const teamMap = new Map()
      playersData.data?.forEach(player => {
        const team = (player as any).team
        if (!teamMap.has(team)) {
          teamMap.set(team, { team, totalRuns: 0, totalWickets: 0, players: 0 })
        }
        const teamStats = teamMap.get(team)
        teamStats.totalRuns += (player as any).total_runs
        teamStats.totalWickets += (player as any).total_wickets
        teamStats.players += 1
      })

      setAnalyticsData({
        runsByPlayer: chartData.runsByPlayer,
        wicketsByPlayer: chartData.wicketsByPlayer,
        matchesByTeam: chartData.matchesByTeam,
        matchResults: chartData.matchResults,
        teamComparison: Array.from(teamMap.values()),
        performanceCategories: [
          { category: 'Runs', domestic: 2500, international: 1800 },
          { category: 'Wickets', domestic: 120, international: 85 },
          { category: 'Matches', domestic: 150, international: 95 }
        ]
      })
    } catch (error) {
      toast.error('Failed to load analytics data')
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadAnalyticsData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Advanced performance insights and comparisons</p>
        </div>
        <Button variant="secondary" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Analytics Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              options={TEAMS.map(team => ({ value: team, label: team }))}
              value={filters.team}
              onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
              placeholder="All Teams"
            />
            <Select
              options={PLAYER_ROLES.map(role => ({ value: role, label: role }))}
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              placeholder="All Roles"
            />
            <Select
              options={MATCH_CATEGORIES.map(category => ({ value: category, label: category }))}
              value={filters.matchCategory}
              onChange={(e) => setFilters(prev => ({ ...prev, matchCategory: e.target.value }))}
              placeholder="All Categories"
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
      {/* Top Performers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Run Scorers with Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Top Run Scorers Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.runsByPlayer.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="player_name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis yAxisId="runs" orientation="left" />
                  <YAxis yAxisId="avg" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'total_runs' ? `${value} runs` : `${value} avg`,
                      name === 'total_runs' ? 'Total Runs' : 'Average Score'
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="runs" dataKey="total_runs" fill="#3b82f6" name="Total Runs" />
                  <Bar yAxisId="avg" dataKey="avg_score" fill="#10b981" name="Average Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Wicket Takers Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-red-600" />
              Top Wicket Takers Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.wicketsByPlayer.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="player_name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis yAxisId="wickets" orientation="left" />
                  <YAxis yAxisId="overs" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'total_wickets' ? `${value} wickets` : `${value} overs`,
                      name === 'total_wickets' ? 'Total Wickets' : 'Total Overs'
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="wickets" dataKey="total_wickets" fill="#ef4444" name="Total Wickets" />
                  <Bar yAxisId="overs" dataKey="total_overs" fill="#f59e0b" name="Total Overs" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Team Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.teamComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="team" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={10}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalRuns" fill="#3b82f6" name="Total Runs" />
                  <Bar dataKey="totalWickets" fill="#ef4444" name="Total Wickets" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Match Results Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-green-600" />
              Match Results Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={analyticsData.matchResults}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ result, percent }) => `${result}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="result"
                  >
                    {analyticsData.matchResults.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.result === 'WON' ? '#10b981' :
                        entry.result === 'LOST' ? '#ef4444' : '#f59e0b'
                      } />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance vs Experience Scatter Plot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
              Performance vs Experience Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={analyticsData.runsByPlayer}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="matches_played" name="Matches Played" />
                  <YAxis dataKey="total_runs" name="Total Runs" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => [
                      value,
                      name === 'total_runs' ? 'Total Runs' : 'Matches Played'
                    ]}
                    labelFormatter={(label) => `Player: ${label}`}
                  />
                  <Scatter dataKey="total_runs" fill="#8b5cf6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Domestic vs International Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
              Domestic vs International Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.performanceCategories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="domestic" fill="#3b82f6" name="Domestic" />
                  <Bar dataKey="international" fill="#ef4444" name="International" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player Performance Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            Top Player Skills Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { skill: 'Batting', playerA: 85, playerB: 70, playerC: 95 },
                { skill: 'Bowling', playerA: 60, playerB: 90, playerC: 40 },
                { skill: 'Fielding', playerA: 75, playerB: 80, playerC: 85 },
                { skill: 'Consistency', playerA: 80, playerB: 85, playerC: 75 },
                { skill: 'Match Impact', playerA: 90, playerB: 75, playerC: 80 },
                { skill: 'Experience', playerA: 70, playerB: 95, playerC: 60 }
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={0} domain={[0, 100]} />
                <Radar name="Top Batsman" dataKey="playerA" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                <Radar name="Top Bowler" dataKey="playerB" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                <Radar name="Top All-rounder" dataKey="playerC" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Team Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { month: 'Jan', runs: 2400, wickets: 45 },
                { month: 'Feb', runs: 2800, wickets: 52 },
                { month: 'Mar', runs: 3200, wickets: 48 },
                { month: 'Apr', runs: 2900, wickets: 61 },
                { month: 'May', runs: 3500, wickets: 55 },
                { month: 'Jun', runs: 3800, wickets: 67 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="runs" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="wickets" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Analytics Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">Top Performer</h4>
              <p className="text-blue-700">
                {analyticsData.runsByPlayer[0]?.player_name || 'No data'} leads with{' '}
                {analyticsData.runsByPlayer[0]?.total_runs || 0} runs
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-900">Best Bowler</h4>
              <p className="text-red-700">
                {analyticsData.wicketsByPlayer[0]?.player_name || 'No data'} leads with{' '}
                {analyticsData.wicketsByPlayer[0]?.total_wickets || 0} wickets
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">Team Leader</h4>
              <p className="text-green-700">
                {analyticsData.teamComparison[0]?.team || 'No data'} dominates with{' '}
                {analyticsData.teamComparison[0]?.totalRuns || 0} total runs
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900">Win Rate</h4>
              <p className="text-purple-700">
                {analyticsData.matchResults.find(r => r.result === 'WON')?.count || 0} wins out of{' '}
                {analyticsData.matchResults.reduce((sum, r) => sum + r.count, 0)} matches
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Performance Summary</h4>
            <ul className="text-gray-700 space-y-1">
              <li>• Individual performance varies significantly across teams and roles</li>
              <li>• Experience (matches played) shows positive correlation with total performance</li>
              <li>• International matches tend to have lower scoring rates but higher wicket counts</li>
              <li>• All-rounders provide balanced contributions across multiple skill areas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}