// Data service that automatically falls back to localStorage when Supabase is not configured
import { supabase } from './supabase'
import * as localData from './localData'
import type { Player, MatchPerformance } from '../types'

// Check if Supabase is configured
const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return !!(url && key && !url.includes('your-project-url') && !key.includes('your-anon-key'))
}

const USE_LOCAL_STORAGE = !isSupabaseConfigured()

console.log(`Using ${USE_LOCAL_STORAGE ? 'localStorage' : 'Supabase'} for data persistence`)

// Player operations
export const playerService = {
  async getAll(filters?: {
    team?: string
    role?: string
    nationality?: string
    search?: string
  }) {
    if (USE_LOCAL_STORAGE) {
      let players = localData.getPlayers()
      
      if (filters?.team) {
        players = players.filter(p => p.team === filters.team)
      }
      if (filters?.role) {
        players = players.filter(p => p.role === filters.role)
      }
      if (filters?.nationality) {
        players = players.filter(p => p.nationality === filters.nationality)
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase()
        players = players.filter(p => 
          p.player_name?.toLowerCase().includes(search) ||
          p.player_number?.toLowerCase().includes(search)
        )
      }
      
      // Calculate aggregated stats for each player
      const performances = localData.getMatchPerformances()
      const playersWithStats = players.map(player => {
        const playerPerfs = performances.filter(p => p.player_id === player.id)
        
        const totalRuns = playerPerfs.reduce((sum, p) => sum + (p.runs_scored || 0), 0)
        const totalWickets = playerPerfs.reduce((sum, p) => sum + (p.wickets_taken || 0), 0)
        const totalMatches = playerPerfs.length
        const avgScore = totalMatches > 0 ? totalRuns / totalMatches : 0
        const highestScore = totalMatches > 0 ? Math.max(...playerPerfs.map(p => p.runs_scored || 0)) : 0
        const strikeRate = playerPerfs.reduce((sum, p) => {
          if (p.balls_faced && p.balls_faced > 0) {
            return sum + ((p.runs_scored || 0) / p.balls_faced * 100)
          }
          return sum
        }, 0) / (totalMatches || 1)
        
        return {
          ...player,
          total_runs: totalRuns,
          total_wickets: totalWickets,
          total_matches: totalMatches,
          avg_score: avgScore,
          highest_score: highestScore,
          strike_rate: strikeRate
        }
      })
      
      return { data: playersWithStats, error: null }
    }
    
    // Use Supabase
    let query = supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.team) {
      query = query.eq('team', filters.team)
    }
    
    if (filters?.role) {
      query = query.eq('role', filters.role)
    }
    
    if (filters?.nationality) {
      query = query.eq('nationality', filters.nationality)
    }
    
    if (filters?.search) {
      query = query.or(`player_name.ilike.%${filters.search}%,player_number.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    return { data, error }
  },

  async getById(id: string) {
    if (USE_LOCAL_STORAGE) {
      const player = localData.getPlayerById(id)
      
      if (!player) {
        return { data: null, error: { message: 'Player not found' } }
      }
      
      // Calculate stats
      const performances = localData.getMatchPerformancesByPlayerId(id)
      const totalRuns = performances.reduce((sum, p) => sum + (p.runs_scored || 0), 0)
      const totalWickets = performances.reduce((sum, p) => sum + (p.wickets_taken || 0), 0)
      const totalMatches = performances.length
      const avgScore = totalMatches > 0 ? totalRuns / totalMatches : 0
      const highestScore = totalMatches > 0 ? Math.max(...performances.map(p => p.runs_scored || 0)) : 0
      
      return { 
        data: {
          ...player,
          total_runs: totalRuns,
          total_wickets: totalWickets,
          total_matches: totalMatches,
          avg_score: avgScore,
          highest_score: highestScore
        }, 
        error: null 
      }
    }
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  },

  async create(player: Omit<Player, 'id' | 'created_at'>) {
    if (USE_LOCAL_STORAGE) {
      const newPlayer = localData.addPlayer(player)
      return { data: newPlayer, error: null }
    }
    
    const { data, error } = await (supabase
      .from('players') as any)
      .insert([player])
      .select()
      .single()

    return { data, error }
  },

  async update(id: string, updates: Partial<Player>) {
    if (USE_LOCAL_STORAGE) {
      const updated = localData.updatePlayer(id, updates)
      if (!updated) {
        return { data: null, error: { message: 'Player not found' } }
      }
      return { data: updated, error: null }
    }
    
    const { data, error} = await (supabase
      .from('players') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  async delete(id: string) {
    if (USE_LOCAL_STORAGE) {
      const success = localData.deletePlayer(id)
      return { error: success ? null : { message: 'Player not found' } }
    }
    
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id)

    return { error }
  },

  async getByTeam(team: string) {
    if (USE_LOCAL_STORAGE) {
      const players = localData.getPlayers().filter(p => p.team === team)
      return { data: players, error: null }
    }
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('team', team)
      .order('player_name')

    return { data, error }
  }
}

// Match Performance operations
export const matchPerformanceService = {
  async getAll(filters?: {
    playerId?: string
    playerTeam?: string
    matchCategory?: string
    matchResult?: string
    search?: string
  }) {
    if (USE_LOCAL_STORAGE) {
      let performances = localData.getMatchPerformances()
      const players = localData.getPlayers()
      
      if (filters?.playerId) {
        performances = performances.filter(p => p.player_id === filters.playerId)
      }
      
      if (filters?.matchCategory) {
        performances = performances.filter(p => p.match_category === filters.matchCategory)
      }
      
      if (filters?.matchResult) {
        performances = performances.filter(p => p.match_result === filters.matchResult)
      }
      
      if (filters?.search) {
        const search = filters.search.toLowerCase()
        performances = performances.filter(p => 
          p.match_performance_name?.toLowerCase().includes(search)
        )
      }
      
      if (filters?.playerTeam) {
        const teamPlayerIds = players.filter(p => p.team === filters.playerTeam).map(p => p.id)
        performances = performances.filter(p => teamPlayerIds.includes(p.player_id!))
      }
      
      // Add player info to each performance
      const performancesWithPlayer = performances.map(perf => {
        const player = players.find(p => p.id === perf.player_id)
        return {
          ...perf,
          player: player ? {
            id: player.id,
            player_name: player.player_name,
            team: player.team,
            role: player.role
          } : undefined
        }
      })
      
      return { data: performancesWithPlayer as any, error: null }
    }
    
    let query = supabase
      .from('match_performances')
      .select(`
        *,
        player:players (
          id,
          player_name,
          team,
          role
        )
      `)
      .order('created_at', { ascending: false })

    if (filters?.playerId) {
      query = query.eq('player_id', filters.playerId)
    }
    
    if (filters?.matchCategory) {
      query = query.eq('match_category', filters.matchCategory)
    }
    
    if (filters?.matchResult) {
      query = query.eq('match_result', filters.matchResult)
    }
    
    if (filters?.search) {
      query = query.ilike('match_performance_name', `%${filters.search}%`)
    }

    const { data, error } = await query
    return { data, error }
  },

  async getById(id: string) {
    if (USE_LOCAL_STORAGE) {
      const performances = localData.getMatchPerformances()
      const performance = performances.find(p => p.id === id)
      
      if (!performance) {
        return { data: null, error: { message: 'Performance not found' } }
      }
      
      const player = localData.getPlayerById(performance.player_id!)
      return { 
        data: {
          ...performance,
          player: player ? {
            id: player.id,
            player_name: player.player_name,
            team: player.team,
            role: player.role
          } : undefined
        } as any, 
        error: null 
      }
    }
    
    const { data, error } = await supabase
      .from('match_performances')
      .select(`
        *,
        player:players (
          id,
          player_name,
          team,
          role
        )
      `)
      .eq('id', id)
      .single()

    return { data, error }
  },

  async create(performance: Omit<MatchPerformance, 'id' | 'created_at'>) {
    if (USE_LOCAL_STORAGE) {
      const newPerformance = localData.addMatchPerformance(performance)
      const player = localData.getPlayerById(newPerformance.player_id!)
      return { 
        data: {
          ...newPerformance,
          player: player ? {
            id: player.id,
            player_name: player.player_name,
            team: player.team,
            role: player.role
          } : undefined
        } as any, 
        error: null 
      }
    }
    
    const { data, error } = await (supabase
      .from('match_performances') as any)
      .insert([performance])
      .select(`
        *,
        player:players (
          id,
          player_name,
          team,
          role
        )
      `)
      .single()

    return { data, error }
  },

  async update(id: string, updates: Partial<MatchPerformance>) {
    if (USE_LOCAL_STORAGE) {
      const updated = localData.updateMatchPerformance(id, updates)
      if (!updated) {
        return { data: null, error: { message: 'Performance not found' } }
      }
      const player = localData.getPlayerById(updated.player_id!)
      return { 
        data: {
          ...updated,
          player: player ? {
            id: player.id,
            player_name: player.player_name,
            team: player.team,
            role: player.role
          } : undefined
        } as any, 
        error: null 
      }
    }
    
    const { data, error } = await (supabase
      .from('match_performances') as any)
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        player:players (
          id,
          player_name,
          team,
          role
        )
      `)
      .single()

    return { data, error }
  },

  async delete(id: string) {
    if (USE_LOCAL_STORAGE) {
      const success = localData.deleteMatchPerformance(id)
      return { error: success ? null : { message: 'Performance not found' } }
    }
    
    const { error } = await supabase
      .from('match_performances')
      .delete()
      .eq('id', id)

    return { error }
  }
}

// Dashboard statistics
export const dashboardService = {
  async getStats() {
    if (USE_LOCAL_STORAGE) {
      const players = localData.getPlayers()
      const performances = localData.getMatchPerformances()
      
      const totalRuns = performances.reduce((sum, p) => sum + (p.runs_scored || 0), 0)
      const totalWickets = performances.reduce((sum, p) => sum + (p.wickets_taken || 0), 0)
      const totalBalls = performances.reduce((sum, p) => sum + (p.balls_faced || 0), 0)
      const avgScore = totalBalls > 0 ? totalRuns / performances.filter(p => p.balls_faced && p.balls_faced > 0).length : 0
      const playerOfMatchAwards = performances.filter(p => p.player_of_the_match).length
      
      return {
        totalPlayers: players.length,
        totalMatches: performances.length,
        totalRuns,
        totalWickets,
        avgScore: Number(avgScore.toFixed(2)),
        playerOfMatchAwards
      }
    }
    
    // Use Supabase
    const [playersRes, matchesRes, totalRunsRes, totalWicketsRes, avgScoreRes, playerOfMatchRes] = await Promise.all([
      supabase.from('players').select('id', { count: 'exact', head: true }),
      supabase.from('match_performances').select('id', { count: 'exact', head: true }),
      supabase.from('players').select('total_runs'),
      supabase.from('players').select('total_wickets'),
      supabase.from('players').select('avg_score'),
      supabase.from('match_performances').select('id', { count: 'exact', head: true }).eq('player_of_the_match', true)
    ])

    const totalRuns = totalRunsRes.data?.reduce((sum: number, player: any) => sum + (player.total_runs || 0), 0) || 0
    const totalWickets = totalWicketsRes.data?.reduce((sum: number, player: any) => sum + (player.total_wickets || 0), 0) || 0
    const avgScore = avgScoreRes.data?.length 
      ? (avgScoreRes.data.reduce((sum: number, player: any) => sum + (player.avg_score || 0), 0) / avgScoreRes.data.length)
      : 0

    return {
      totalPlayers: playersRes.count || 0,
      totalMatches: matchesRes.count || 0,
      totalRuns,
      totalWickets,
      avgScore: Number(avgScore.toFixed(2)),
      playerOfMatchAwards: playerOfMatchRes.count || 0
    }
  },

  async getChartData() {
    if (USE_LOCAL_STORAGE) {
      const players = localData.getPlayers()
      const performances = localData.getMatchPerformances()
      
      // Calculate runs and wickets per player
      const playerStats = players.map(player => {
        const playerPerfs = performances.filter(p => p.player_id === player.id)
        const totalRuns = playerPerfs.reduce((sum, p) => sum + (p.runs_scored || 0), 0)
        const totalWickets = playerPerfs.reduce((sum, p) => sum + (p.wickets_taken || 0), 0)
        const totalOvers = playerPerfs.reduce((sum, p) => sum + (p.overs_bowled || 0), 0)
        const matchesPlayed = playerPerfs.length
        const avgScore = matchesPlayed > 0 ? totalRuns / matchesPlayed : 0
        
        return {
          player_name: player.player_name,
          total_runs: totalRuns,
          total_wickets: totalWickets,
          total_overs: totalOvers,
          matches_played: matchesPlayed,
          avg_score: avgScore,
          team: player.team
        }
      })
      
      const runsByPlayer = playerStats
        .sort((a, b) => b.total_runs - a.total_runs)
        .slice(0, 10)
      
      const wicketsByPlayer = playerStats
        .filter(p => p.total_wickets > 0)
        .sort((a, b) => b.total_wickets - a.total_wickets)
        .slice(0, 10)
      
      // Team counts
      const teamCounts = players.reduce((acc: Record<string, number>, player) => {
        acc[player.team!] = (acc[player.team!] || 0) + 1
        return acc
      }, {})
      
      // Match results
      const resultCounts = performances.reduce((acc: Record<string, number>, match) => {
        acc[match.match_result!] = (acc[match.match_result!] || 0) + 1
        return acc
      }, {})
      
      return {
        runsByPlayer,
        wicketsByPlayer,
        matchesByTeam: Object.entries(teamCounts).map(([team, count]) => ({ team, count })),
        matchResults: Object.entries(resultCounts).map(([result, count]) => ({ result, count }))
      }
    }
    
    // Use Supabase
    const [runsByPlayer, wicketsByPlayer, matchesByTeam, matchResults] = await Promise.all([
      supabase.from('players').select('player_name, total_runs').order('total_runs', { ascending: false }).limit(10),
      supabase.from('players').select('player_name, total_wickets').order('total_wickets', { ascending: false }).limit(10),
      supabase.from('players').select('team').order('team'),
      supabase.from('match_performances').select('match_result').order('match_result')
    ])

    // Process team data
    const teamCounts = matchesByTeam.data?.reduce((acc: Record<string, number>, player: any) => {
      acc[player.team] = (acc[player.team] || 0) + 1
      return acc
    }, {}) || {}

    // Process match results
    const resultCounts = matchResults.data?.reduce((acc: Record<string, number>, match: any) => {
      acc[match.match_result] = (acc[match.match_result] || 0) + 1
      return acc
    }, {}) || {}

    return {
      runsByPlayer: runsByPlayer.data || [],
      wicketsByPlayer: wicketsByPlayer.data || [],
      matchesByTeam: Object.entries(teamCounts).map(([team, count]) => ({ team, count })),
      matchResults: Object.entries(resultCounts).map(([result, count]) => ({ result, count }))
    }
  }
}
