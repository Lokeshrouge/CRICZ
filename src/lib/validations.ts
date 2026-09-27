import { z } from 'zod'
import { 
  PLAYER_ROLES, 
  BATTING_STYLES, 
  BOWLING_STYLES, 
  NATIONALITIES, 
  TEAMS, 
  MATCH_CATEGORIES, 
  MATCH_RESULTS 
} from '@/types'

export const playerSchema = z.object({
  player_name: z.string()
    .min(1, 'Player name is required')
    .max(50, 'Player name must not exceed 50 characters'),
  
  player_number: z.string()
    .max(3, 'Player number must not exceed 3 characters')
    .optional()
    .or(z.literal('')),
  
  profile_picture: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  
  date_of_birth: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true
      const birthDate = new Date(date)
      const today = new Date()
      return birthDate <= today
    }, 'Date of birth cannot be in the future'),
  
  role: z.enum(PLAYER_ROLES as [string, ...string[]], {
    required_error: 'Role is required'
  }),
  
  batting_style: z.enum(BATTING_STYLES as [string, ...string[]], {
    required_error: 'Batting style is required'
  }),
  
  bowling_style: z.enum(BOWLING_STYLES as [string, ...string[]], {
    required_error: 'Bowling style is required'
  }),
  
  nationality: z.enum(NATIONALITIES as [string, ...string[]], {
    required_error: 'Nationality is required'
  }),
  
  team: z.enum(TEAMS as [string, ...string[]], {
    required_error: 'Team is required'
  })
})

export const matchPerformanceSchema = z.object({
  match_performance_name: z.string()
    .min(1, 'Match performance name is required')
    .max(80, 'Match performance name must not exceed 80 characters'),
  
  player_id: z.string()
    .min(1, 'Player is required'),
  
  player_of_the_match: z.boolean().default(false),
  
  match_category: z.enum(MATCH_CATEGORIES as [string, ...string[]], {
    required_error: 'Match category is required'
  }),
  
  match_result: z.enum(MATCH_RESULTS as [string, ...string[]], {
    required_error: 'Match result is required'
  }),
  
  runs_scored: z.number()
    .min(0, 'Runs scored cannot be negative')
    .default(0),
  
  balls_faced: z.number()
    .min(0, 'Balls faced cannot be negative')
    .default(0),
  
  fours: z.number()
    .min(0, 'Fours cannot be negative')
    .default(0),
  
  sixes: z.number()
    .min(0, 'Sixes cannot be negative')
    .default(0),
  
  overs_bowled: z.number()
    .min(0, 'Overs bowled cannot be negative')
    .default(0),
  
  wickets_taken: z.number()
    .min(0, 'Wickets taken cannot be negative')
    .max(10, 'Wickets taken cannot exceed 10')
    .default(0),
  
  runs_conceded: z.number()
    .min(0, 'Runs conceded cannot be negative')
    .default(0),
  
  maiden_overs: z.number()
    .min(0, 'Maiden overs cannot be negative')
    .default(0),
  
  stumpings: z.number()
    .min(0, 'Stumpings cannot be negative')
    .default(0),
  
  catches: z.number()
    .min(0, 'Catches cannot be negative')
    .default(0)
}).refine((data) => {
  // Validate that fours don't exceed balls faced
  return data.fours <= data.balls_faced
}, {
  message: 'Fours cannot exceed balls faced',
  path: ['fours']
}).refine((data) => {
  // Validate that sixes don't exceed balls faced
  return data.sixes <= data.balls_faced
}, {
  message: 'Sixes cannot exceed balls faced',
  path: ['sixes']
}).refine((data) => {
  // Validate that boundary runs don't exceed total runs
  const boundaryRuns = (data.fours * 4) + (data.sixes * 6)
  return boundaryRuns <= data.runs_scored
}, {
  message: 'Boundary runs cannot exceed total runs scored',
  path: ['runs_scored']
}).refine((data) => {
  // Validate that maiden overs don't exceed overs bowled
  return data.maiden_overs <= data.overs_bowled
}, {
  message: 'Maiden overs cannot exceed overs bowled',
  path: ['maiden_overs']
})

export type PlayerFormData = z.infer<typeof playerSchema>
export type MatchPerformanceFormData = z.infer<typeof matchPerformanceSchema>