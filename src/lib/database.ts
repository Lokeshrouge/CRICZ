import { supabase } from './supabase'
import type { Database } from '@/types/database'

type PlayersTable = Database['public']['Tables']['players']
type MatchPerformancesTable = Database['public']['Tables']['match_performances'] 
type ProfilesTable = Database['public']['Tables']['profiles']

// Player operations
export const playerService = {
  async getAll(filters?: {
    team?: string
    role?: string
    nationality?: string
    search?: string
  }) {
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
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  },

  async create(player: PlayersTable['Insert']) {
    const { data, error } = await (supabase
      .from('players') as any)
      .insert([player])
      .select()
      .single()

    return { data, error }
  },

  async update(id: string, updates: PlayersTable['Update']) {
    const { data, error} = await (supabase
      .from('players') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id)

    return { error }
  },

  async getByTeam(team: string) {
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

  async create(performance: MatchPerformancesTable['Insert']) {
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

  async update(id: string, updates: MatchPerformancesTable['Update']) {
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
    const { error } = await supabase
      .from('match_performances')
      .delete()
      .eq('id', id)

    return { error }
  }
}

// User profile operations
export const userService = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  },

  async updateRole(id: string, role: ProfilesTable['Update']['role']) {
    const { data, error } = await (supabase
      .from('profiles') as any)
      .update({ role })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }
}

// Dashboard statistics
export const dashboardService = {
  async getStats() {
    // Get total counts
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
    // Get data for various charts
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