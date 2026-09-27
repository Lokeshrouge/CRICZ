import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trophy, Target, Activity, Calendar, Globe, Users, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

import { playerService, matchPerformanceService } from '@/lib/dataService'
import { formatDate, calculateAge, calculateStrikeRate, calculateEconomy } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'

import type { Player, MatchPerformance } from '@/types'

export function PlayerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [player, setPlayer] = useState<Player | null>(null)
  const [performances, setPerformances] = useState<MatchPerformance[]>([])
  const [loading, setLoading] = useState(true)

  const canEdit = user?.role && ['ADMIN', 'MANAGER'].includes(user.role)

  useEffect(() => {
    if (id) {
      loadPlayerData()
    }
  }, [id])

  const loadPlayerData = async () => {
    if (!id) return

    try {
      setLoading(true)
      const [playerRes, performancesRes] = await Promise.all([
        playerService.getById(id),
        matchPerformanceService.getAll({ playerId: id })
      ])

      if (playerRes.error) {
        toast.error('Failed to load player details')
        console.error('Error loading player:', playerRes.error)
        navigate('/players')
        return
      }

      if (performancesRes.error) {
        console.error('Error loading performances:', performancesRes.error)
      }

      setPlayer(playerRes.data)
      setPerformances(performancesRes.data || [])
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
      navigate('/players')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Player Not Found</h2>
        <p className="text-gray-600 mb-4">The requested player could not be found.</p>
        <Link to="/players">
          <Button>Back to Players</Button>
        </Link>
      </div>
    )
  }

  // Prepare chart data for performance trend
  const chartData = performances
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((perf, index) => ({
      match: index + 1,
      runs: perf.runs_scored,
      wickets: perf.wickets_taken,
      strikeRate: calculateStrikeRate(perf.runs_scored, perf.balls_faced)
    }))

  const statCards = [
    {
      title: 'Matches Played',
      value: player.matches_played,
      icon: Trophy,
      color: 'text-blue-600'
    },
    {
      title: 'Total Runs',
      value: player.total_runs,
      icon: Target,
      color: 'text-green-600'
    },
    {
      title: 'Average Score',
      value: player.avg_score,
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      title: 'Total Wickets',
      value: player.total_wickets,
      icon: Target,
      color: 'text-red-600'
    },
    {
      title: 'Fifties',
      value: player.number_of_50s,
      icon: TrendingUp,
      color: 'text-orange-600'
    },
    {
      title: 'Hundreds',
      value: player.number_of_100s,
      icon: TrendingUp,
      color: 'text-yellow-600'
    },
    {
      title: 'Total 4s',
      value: player.total_4s,
      icon: Target,
      color: 'text-blue-600'
    },
    {
      title: 'Total 6s',
      value: player.total_6s,
      icon: Target,
      color: 'text-red-600'
    },
    {
      title: 'Catches',
      value: player.total_catches,
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Stumpings',
      value: player.total_stumpings,
      icon: Activity,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/players">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Players
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Player Details</h1>
        </div>
        {canEdit && (
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Player
          </Button>
        )}
      </div>

      {/* Player Profile */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {player.profile_picture ? (
                <img
                  src={player.profile_picture}
                  alt={`${player.player_name} profile photo`}
                  className="h-24 w-24 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/default-avatar.svg'
                  }}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-2xl">
                    {player.player_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h2 className="text-3xl font-bold text-gray-900">{player.player_name}</h2>
                {player.player_number && (
                  <Badge variant="default" className="text-lg px-3 py-1">
                    #{player.player_number}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Team</p>
                    <p className="font-medium">{player.team}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <Badge variant="info">{player.role}</Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nationality</p>
                    <p className="font-medium">{player.nationality}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Batting Style</p>
                    <p className="font-medium">{player.batting_style}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Bowling Style</p>
                    <p className="font-medium">{player.bowling_style}</p>
                  </div>
                </div>
                {player.date_of_birth && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{calculateAge(player.date_of_birth)} years</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div className="flex-1">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Trend Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="match" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="runs" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="wickets" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Performances */}
      <Card>
        <CardHeader>
          <CardTitle>Match Performance History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {performances.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No match performances found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>POM</TableHead>
                    <TableHead>Batting</TableHead>
                    <TableHead>Bowling</TableHead>
                    <TableHead>Fielding</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performances.map((performance) => (
                    <TableRow key={performance.id}>
                      <TableCell className="font-medium">
                        {performance.match_performance_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={performance.match_category === 'International' ? 'info' : 'default'}>
                          {performance.match_category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            performance.match_result === 'WON' ? 'success' :
                            performance.match_result === 'LOST' ? 'danger' : 'warning'
                          }
                        >
                          {performance.match_result}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {performance.player_of_the_match && (
                          <Badge variant="warning">★ POM</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{performance.runs_scored} runs ({performance.balls_faced} balls)</div>
                          <div className="text-gray-500">
                            {performance.fours} × 4, {performance.sixes} × 6
                          </div>
                          <div className="text-gray-500">
                            SR: {calculateStrikeRate(performance.runs_scored, performance.balls_faced)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{performance.wickets_taken}/{performance.runs_conceded} ({performance.overs_bowled} ov)</div>
                          <div className="text-gray-500">
                            Economy: {calculateEconomy(performance.runs_conceded, performance.overs_bowled)}
                          </div>
                          <div className="text-gray-500">
                            Maidens: {performance.maiden_overs}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Catches: {performance.catches}</div>
                          <div>Stumpings: {performance.stumpings}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(performance.created_at)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}