export type UserRole = 'ADMIN' | 'MANAGER' | 'COACH' | 'ANALYST'

export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  player_name: string
  player_number: string | null
  profile_picture: string | null
  date_of_birth: string | null
  role: PlayerRole
  batting_style: BattingStyle
  bowling_style: BowlingStyle
  nationality: Nationality
  team: Team
  matches_played: number
  number_of_50s: number
  number_of_100s: number
  total_4s: number
  total_6s: number
  total_runs: number
  total_overs: number
  total_wickets: number
  total_stumpings: number
  total_catches: number
  avg_score: number
  created_at: string
  updated_at: string
}

export interface MatchPerformance {
  id: string
  match_performance_name: string
  player_id: string
  player?: Player
  player_of_the_match: boolean
  match_category: MatchCategory
  match_result: MatchResult
  runs_scored: number
  balls_faced: number
  fours: number
  sixes: number
  overs_bowled: number
  wickets_taken: number
  runs_conceded: number
  maiden_overs: number
  stumpings: number
  catches: number
  created_at: string
  updated_at: string
}

export type PlayerRole = 'Batsman' | 'Bowler' | 'Batsman & Wicket Keeper' | 'All Rounder'

export type BattingStyle = 'Right-Handed' | 'Left-Handed'

export type BowlingStyle = 
  | 'Right-Arm Fast'
  | 'Left-Arm Fast'
  | 'Right-Arm Medium'
  | 'Left-Arm Medium'
  | 'Right-Arm Spin'
  | 'Left-Arm Spin'

export type Nationality = 
  | 'Australia'
  | 'Bangladesh'
  | 'England'
  | 'India'
  | 'New Zealand'
  | 'Pakistan'
  | 'South Africa'
  | 'Sri Lanka'
  | 'West Indies'
  | 'Afghanistan'
  | 'Zimbabwe'
  | 'Ireland'
  | 'Scotland'
  | 'Netherlands'
  | 'United Arab Emirates'
  | 'Nepal'
  | 'United States of America'

export type Team = 
  | 'Chennai Super Kings (CSK)'
  | 'Delhi Capitals (DC)'
  | 'Kolkata Knight Riders (KKR)'
  | 'Mumbai Indians (MI)'
  | 'Punjab Kings (PBKS)'
  | 'Rajasthan Royals (RR)'
  | 'Royal Challengers Bangalore (RCB)'
  | 'Sunrisers Hyderabad (SRH)'
  | 'Gujarat Titans (GT)'
  | 'Lucknow SuperGiants (LSG)'

export type MatchCategory = 'Domestic' | 'International'

export type MatchResult = 'WON' | 'LOST' | 'DRAW'

export const PLAYER_ROLES: PlayerRole[] = [
  'Batsman',
  'Bowler',
  'Batsman & Wicket Keeper',
  'All Rounder'
]

export const BATTING_STYLES: BattingStyle[] = [
  'Right-Handed',
  'Left-Handed'
]

export const BOWLING_STYLES: BowlingStyle[] = [
  'Right-Arm Fast',
  'Left-Arm Fast',
  'Right-Arm Medium',
  'Left-Arm Medium',
  'Right-Arm Spin',
  'Left-Arm Spin'
]

export const NATIONALITIES: Nationality[] = [
  'Australia',
  'Bangladesh',
  'England',
  'India',
  'New Zealand',
  'Pakistan',
  'South Africa',
  'Sri Lanka',
  'West Indies',
  'Afghanistan',
  'Zimbabwe',
  'Ireland',
  'Scotland',
  'Netherlands',
  'United Arab Emirates',
  'Nepal',
  'United States of America'
]

export const TEAMS: Team[] = [
  'Chennai Super Kings (CSK)',
  'Delhi Capitals (DC)',
  'Kolkata Knight Riders (KKR)',
  'Mumbai Indians (MI)',
  'Punjab Kings (PBKS)',
  'Rajasthan Royals (RR)',
  'Royal Challengers Bangalore (RCB)',
  'Sunrisers Hyderabad (SRH)',
  'Gujarat Titans (GT)',
  'Lucknow SuperGiants (LSG)'
]

export const MATCH_CATEGORIES: MatchCategory[] = [
  'Domestic',
  'International'
]

export const MATCH_RESULTS: MatchResult[] = [
  'WON',
  'LOST',
  'DRAW'
]