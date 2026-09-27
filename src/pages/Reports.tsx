import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Users,
  Trophy,
  TrendingUp,
  Target,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

import { playerService, matchPerformanceService } from '@/lib/dataService'
import { exportToCSV, debounce, formatDate } from '@/lib/utils'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'

import type { Player, MatchPerformance } from '@/types'
import { TEAMS, PLAYER_ROLES, MATCH_CATEGORIES, MATCH_RESULTS } from '@/types'

type ReportType = 'player_performance' | 'match_performance' | 'team_performance' | 'batting' | 'bowling' | 'fielding' | 'milestones'

export function Reports() {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('player_performance')
  const [players, setPlayers] = useState<Player[]>([])
  const [performances, setPerformances] = useState<MatchPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    team: '',
    role: '',
    nationality: '',
    matchCategory: '',
    matchResult: ''
  })

  const reportTypes = [
    { value: 'player_performance', label: 'Player Performance Report', icon: Users },
    { value: 'match_performance', label: 'Match Performance Report', icon: Trophy },
    { value: 'team_performance', label: 'Team Performance Report', icon: Users },
    { value: 'batting', label: 'Batting Report', icon: Target },
    { value: 'bowling', label: 'Bowling Report', icon: Activity },
    { value: 'fielding', label: 'Fielding Report', icon: Activity },
    { value: 'milestones', label: 'Player Milestone Report', icon: TrendingUp }
  ]

  useEffect(() => {
    loadReportData()
  }, [selectedReportType, filters])

  const loadReportData = async () => {
    try {
      setLoading(true)
      
      if (['player_performance', 'team_performance', 'batting', 'bowling', 'fielding', 'milestones'].includes(selectedReportType)) {
        const { data: playersData, error: playersError } = await playerService.getAll(filters)
        if (playersError) {
          toast.error('Failed to load player data')
          console.error('Error loading players:', playersError)
        } else {
          setPlayers(playersData || [])
        }
      }

      if (['match_performance'].includes(selectedReportType)) {
        const { data: performancesData, error: performancesError } = await matchPerformanceService.getAll(filters)
        if (performancesError) {
          toast.error('Failed to load match performance data')
          console.error('Error loading performances:', performancesError)
        } else {
          setPerformances(performancesData || [])
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    let exportData: any[] = []
    let filename = ''

    switch (selectedReportType) {
      case 'player_performance':
        exportData = players.map(player => ({
          'Player Name': player.player_name,
          'Team': player.team,
          'Matches Played': player.matches_played,
          'Total Runs': player.total_runs,
          'Average Score': player.avg_score,
          'Total 4s': player.total_4s,
          'Total 6s': player.total_6s,
          'Total Wickets': player.total_wickets,
          '50s': player.number_of_50s,
          '100s': player.number_of_100s,
          'Catches': player.total_catches,
          'Stumpings': player.total_stumpings
        }))
        filename = 'player-performance-report'
        break

      case 'match_performance':
        exportData = performances.map(perf => ({
          'Match': perf.match_performance_name,
          'Player': perf.player?.player_name || 'Unknown',
          'Team': perf.player?.team || 'Unknown',
          'Category': perf.match_category,
          'Result': perf.match_result,
          'Player of Match': perf.player_of_the_match ? 'Yes' : 'No',
          'Runs': perf.runs_scored,
          'Balls': perf.balls_faced,
          'Fours': perf.fours,
          'Sixes': perf.sixes,
          'Overs': perf.overs_bowled,
          'Wickets': perf.wickets_taken,
          'Runs Conceded': perf.runs_conceded,
          'Maidens': perf.maiden_overs,
          'Catches': perf.catches,
          'Stumpings': perf.stumpings,
          'Date': formatDate(perf.created_at)
        }))
        filename = 'match-performance-report'
        break

      case 'team_performance':
        const teamStats = calculateTeamStats(players)
        exportData = teamStats
        filename = 'team-performance-report'
        break

      case 'batting':
        exportData = players.filter(p => p.total_runs > 0).map(player => ({
          'Player Name': player.player_name,
          'Team': player.team,
          'Matches': player.matches_played,
          'Total Runs': player.total_runs,
          'Average Score': player.avg_score,
          'Highest Score': 'N/A', // Would need individual match data
          'Strike Rate': 'N/A', // Would need balls faced total
          'Total 4s': player.total_4s,
          'Total 6s': player.total_6s,
          '50s': player.number_of_50s,
          '100s': player.number_of_100s
        }))
        filename = 'batting-report'
        break

      case 'bowling':
        exportData = players.filter(p => p.total_wickets > 0).map(player => ({
          'Player Name': player.player_name,
          'Team': player.team,
          'Matches': player.matches_played,
          'Total Overs': player.total_overs,
          'Total Wickets': player.total_wickets,
          'Best Figures': 'N/A', // Would need individual match data
          'Economy Rate': 'N/A', // Would need runs conceded total
          'Average': 'N/A' // Would need runs conceded total
        }))
        filename = 'bowling-report'
        break

      case 'fielding':
        exportData = players.filter(p => p.total_catches > 0 || p.total_stumpings > 0).map(player => ({
          'Player Name': player.player_name,
          'Team': player.team,
          'Matches': player.matches_played,
          'Total Catches': player.total_catches,
          'Total Stumpings': player.total_stumpings,
          'Total Dismissals': player.total_catches + player.total_stumpings
        }))
        filename = 'fielding-report'
        break

      case 'milestones':
        exportData = players.map(player => ({
          'Player Name': player.player_name,
          'Team': player.team,
          'Matches Played': player.matches_played,
          'Fifties': player.number_of_50s,
          'Hundreds': player.number_of_100s,
          'Total Runs': player.total_runs,
          'Total Wickets': player.total_wickets,
          'Best Performance': player.number_of_100s > 0 ? '100+' : player.number_of_50s > 0 ? '50+' : 'Under 50'
        }))
        filename = 'milestone-report'
        break

      default:
        toast.error('Unknown report type')
        return
    }

    if (exportData.length === 0) {
      toast.error('No data to export')
      return
    }

    exportToCSV(exportData, filename)
    toast.success('Report exported successfully')
  }

  const calculateTeamStats = (players: Player[]) => {
    const teamMap = new Map()
    
    players.forEach(player => {
      const team = player.team
      if (!teamMap.has(team)) {
        teamMap.set(team, {
          team,
          players: 0,
          matches: 0,
          totalRuns: 0,
          totalWickets: 0,
          total4s: 0,
          total6s: 0,
          catches: 0,
          stumpings: 0
        })
      }
      
      const teamStats = teamMap.get(team)
      teamStats.players += 1
      teamStats.matches += player.matches_played
      teamStats.totalRuns += player.total_runs
      teamStats.totalWickets += player.total_wickets
      teamStats.total4s += player.total_4s
      teamStats.total6s += player.total_6s
      teamStats.catches += player.total_catches
      teamStats.stumpings += player.total_stumpings
    })

    return Array.from(teamMap.values()).map(stats => ({
      'Team': stats.team,
      'Players': stats.players,
      'Total Matches': stats.matches,
      'Total Runs': stats.totalRuns,
      'Average Score': stats.matches > 0 ? Math.round((stats.totalRuns / stats.matches) * 100) / 100 : 0,
      'Total Wickets': stats.totalWickets,
      'Total 4s': stats.total4s,
      'Total 6s': stats.total6s,
      'Total Catches': stats.catches,
      'Total Stumpings': stats.stumpings
    }))
  }

  const debouncedSearch = debounce((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value)
  }

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )
    }

    switch (selectedReportType) {
      case 'player_performance':
        return <PlayerPerformanceReport players={players} />
      case 'match_performance':
        return <MatchPerformanceReport performances={performances} />
      case 'team_performance':
        return <TeamPerformanceReport players={players} />
      case 'batting':
        return <BattingReport players={players.filter(p => p.total_runs > 0)} />
      case 'bowling':
        return <BowlingReport players={players.filter(p => p.total_wickets > 0)} />
      case 'fielding':
        return <FieldingReport players={players.filter(p => p.total_catches > 0 || p.total_stumpings > 0)} />
      case 'milestones':
        return <MilestoneReport players={players} />
      default:
        return <div className="text-center py-12 text-gray-500">Select a report type</div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <Button onClick={handleExport} disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Report Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedReportType(type.value as ReportType)}
                className={`p-4 text-left border rounded-lg transition-colors ${
                  selectedReportType === type.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <type.icon className="h-5 w-5" />
                  <span className="font-medium">{type.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Report Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 input"
                onChange={handleSearchChange}
              />
            </div>
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
            <Select
              options={MATCH_RESULTS.map(result => ({ value: result, label: result }))}
              value={filters.matchResult}
              onChange={(e) => setFilters(prev => ({ ...prev, matchResult: e.target.value }))}
              placeholder="All Results"
            />
          </div>
          {(filters.search || filters.team || filters.role || filters.matchCategory || filters.matchResult) && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ search: '', team: '', role: '', nationality: '', matchCategory: '', matchResult: '' })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {reportTypes.find(t => t.value === selectedReportType)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {renderReportContent()}
        </CardContent>
      </Card>
    </div>
  )
}

// Individual Report Components
function PlayerPerformanceReport({ players }: { players: Player[] }) {
  if (players.length === 0) {
    return <div className="text-center py-12 text-gray-500">No players found</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player Name</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Matches</TableHead>
            <TableHead>Runs</TableHead>
            <TableHead>Average</TableHead>
            <TableHead>4s</TableHead>
            <TableHead>6s</TableHead>
            <TableHead>Wickets</TableHead>
            <TableHead>50s</TableHead>
            <TableHead>100s</TableHead>
            <TableHead>Catches</TableHead>
            <TableHead>Stumpings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell className="font-medium">{player.player_name}</TableCell>
              <TableCell>{player.team}</TableCell>
              <TableCell>{player.matches_played}</TableCell>
              <TableCell>{player.total_runs}</TableCell>
              <TableCell>{player.avg_score}</TableCell>
              <TableCell>{player.total_4s}</TableCell>
              <TableCell>{player.total_6s}</TableCell>
              <TableCell>{player.total_wickets}</TableCell>
              <TableCell><Badge variant="success">{player.number_of_50s}</Badge></TableCell>
              <TableCell><Badge variant="warning">{player.number_of_100s}</Badge></TableCell>
              <TableCell>{player.total_catches}</TableCell>
              <TableCell>{player.total_stumpings}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function MatchPerformanceReport({ performances }: { performances: MatchPerformance[] }) {
  if (performances.length === 0) {
    return <div className="text-center py-12 text-gray-500">No match performances found</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Match</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Runs</TableHead>
            <TableHead>Balls</TableHead>
            <TableHead>4s</TableHead>
            <TableHead>6s</TableHead>
            <TableHead>Overs</TableHead>
            <TableHead>Wickets</TableHead>
            <TableHead>Runs Conceded</TableHead>
            <TableHead>Maidens</TableHead>
            <TableHead>Catches</TableHead>
            <TableHead>Stumpings</TableHead>
            <TableHead>POM</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {performances.map((performance) => (
            <TableRow key={performance.id}>
              <TableCell className="font-medium">{performance.match_performance_name}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{performance.player?.player_name || 'Unknown'}</div>
                  <div className="text-sm text-gray-500">{performance.player?.team || 'Unknown Team'}</div>
                </div>
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
              <TableCell>{performance.runs_scored}</TableCell>
              <TableCell>{performance.balls_faced}</TableCell>
              <TableCell>{performance.fours}</TableCell>
              <TableCell>{performance.sixes}</TableCell>
              <TableCell>{performance.overs_bowled}</TableCell>
              <TableCell>{performance.wickets_taken}</TableCell>
              <TableCell>{performance.runs_conceded}</TableCell>
              <TableCell>{performance.maiden_overs}</TableCell>
              <TableCell>{performance.catches}</TableCell>
              <TableCell>{performance.stumpings}</TableCell>
              <TableCell>
                {performance.player_of_the_match && (
                  <Badge variant="warning">★</Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatDate(performance.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function TeamPerformanceReport({ players }: { players: Player[] }) {
  if (players.length === 0) {
    return <div className="text-center py-12 text-gray-500">No team data found</div>
  }

  const teamMap = new Map()
  
  players.forEach(player => {
    const team = player.team
    if (!teamMap.has(team)) {
      teamMap.set(team, {
        team,
        players: 0,
        matches: 0,
        totalRuns: 0,
        totalWickets: 0,
        total4s: 0,
        total6s: 0,
        catches: 0,
        stumpings: 0
      })
    }
    
    const teamStats = teamMap.get(team)
    teamStats.players += 1
    teamStats.matches += player.matches_played
    teamStats.totalRuns += player.total_runs
    teamStats.totalWickets += player.total_wickets
    teamStats.total4s += player.total_4s
    teamStats.total6s += player.total_6s
    teamStats.catches += player.total_catches
    teamStats.stumpings += player.total_stumpings
  })

  const teamStats = Array.from(teamMap.values())

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead>Players</TableHead>
            <TableHead>Total Matches</TableHead>
            <TableHead>Total Runs</TableHead>
            <TableHead>Average Score</TableHead>
            <TableHead>Total Wickets</TableHead>
            <TableHead>Total 4s</TableHead>
            <TableHead>Total 6s</TableHead>
            <TableHead>Total Catches</TableHead>
            <TableHead>Total Stumpings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamStats.map((team) => (
            <TableRow key={team.team}>
              <TableCell className="font-medium">{team.team}</TableCell>
              <TableCell>{team.players}</TableCell>
              <TableCell>{team.matches}</TableCell>
              <TableCell>{team.totalRuns}</TableCell>
              <TableCell>
                {team.matches > 0 ? Math.round((team.totalRuns / team.matches) * 100) / 100 : 0}
              </TableCell>
              <TableCell>{team.totalWickets}</TableCell>
              <TableCell>{team.total4s}</TableCell>
              <TableCell>{team.total6s}</TableCell>
              <TableCell>{team.catches}</TableCell>
              <TableCell>{team.stumpings}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function BattingReport({ players }: { players: Player[] }) {
  if (players.length === 0) {
    return <div className="text-center py-12 text-gray-500">No batting data found</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player Name</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Matches</TableHead>
            <TableHead>Total Runs</TableHead>
            <TableHead>Average</TableHead>
            <TableHead>Total 4s</TableHead>
            <TableHead>Total 6s</TableHead>
            <TableHead>50s</TableHead>
            <TableHead>100s</TableHead>
            <TableHead>Boundary %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const boundaryRuns = (player.total_4s * 4) + (player.total_6s * 6)
            const boundaryPercentage = player.total_runs > 0 ? Math.round((boundaryRuns / player.total_runs) * 100) : 0
            
            return (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.player_name}</TableCell>
                <TableCell>{player.team}</TableCell>
                <TableCell>{player.matches_played}</TableCell>
                <TableCell>{player.total_runs}</TableCell>
                <TableCell>{player.avg_score}</TableCell>
                <TableCell>{player.total_4s}</TableCell>
                <TableCell>{player.total_6s}</TableCell>
                <TableCell><Badge variant="success">{player.number_of_50s}</Badge></TableCell>
                <TableCell><Badge variant="warning">{player.number_of_100s}</Badge></TableCell>
                <TableCell>{boundaryPercentage}%</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function BowlingReport({ players }: { players: Player[] }) {
  if (players.length === 0) {
    return <div className="text-center py-12 text-gray-500">No bowling data found</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player Name</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Matches</TableHead>
            <TableHead>Total Overs</TableHead>
            <TableHead>Total Wickets</TableHead>
            <TableHead>Wickets/Match</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const wicketsPerMatch = player.matches_played > 0 ? Math.round((player.total_wickets / player.matches_played) * 100) / 100 : 0
            
            return (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.player_name}</TableCell>
                <TableCell>{player.team}</TableCell>
                <TableCell>{player.matches_played}</TableCell>
                <TableCell>{player.total_overs}</TableCell>
                <TableCell>{player.total_wickets}</TableCell>
                <TableCell>{wicketsPerMatch}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function FieldingReport({ players }: { players: Player[] }) {
  if (players.length === 0) {
    return <div className="text-center py-12 text-gray-500">No fielding data found</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player Name</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Matches</TableHead>
            <TableHead>Total Catches</TableHead>
            <TableHead>Total Stumpings</TableHead>
            <TableHead>Total Dismissals</TableHead>
            <TableHead>Dismissals/Match</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const totalDismissals = player.total_catches + player.total_stumpings
            const dismissalsPerMatch = player.matches_played > 0 ? Math.round((totalDismissals / player.matches_played) * 100) / 100 : 0
            
            return (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.player_name}</TableCell>
                <TableCell>{player.team}</TableCell>
                <TableCell>{player.matches_played}</TableCell>
                <TableCell>{player.total_catches}</TableCell>
                <TableCell>{player.total_stumpings}</TableCell>
                <TableCell className="font-medium">{totalDismissals}</TableCell>
                <TableCell>{dismissalsPerMatch}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function MilestoneReport({ players }: { players: Player[] }) {
  if (players.length === 0) {
    return <div className="text-center py-12 text-gray-500">No milestone data found</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player Name</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Matches</TableHead>
            <TableHead>Fifties</TableHead>
            <TableHead>Hundreds</TableHead>
            <TableHead>Total Runs</TableHead>
            <TableHead>Total Wickets</TableHead>
            <TableHead>Best Achievement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const bestAchievement = player.number_of_100s > 0 ? '100+' : 
                                  player.number_of_50s > 0 ? '50+' : 
                                  player.total_wickets >= 5 ? '5+ Wickets' :
                                  'In Progress'
            
            return (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.player_name}</TableCell>
                <TableCell>{player.team}</TableCell>
                <TableCell>{player.matches_played}</TableCell>
                <TableCell><Badge variant="success">{player.number_of_50s}</Badge></TableCell>
                <TableCell><Badge variant="warning">{player.number_of_100s}</Badge></TableCell>
                <TableCell>{player.total_runs}</TableCell>
                <TableCell>{player.total_wickets}</TableCell>
                <TableCell>
                  <Badge variant={
                    bestAchievement === '100+' ? 'warning' :
                    bestAchievement === '50+' ? 'success' :
                    bestAchievement === '5+ Wickets' ? 'info' : 'default'
                  }>
                    {bestAchievement}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}