export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'ADMIN' | 'MANAGER' | 'COACH' | 'ANALYST'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'ADMIN' | 'MANAGER' | 'COACH' | 'ANALYST'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'ADMIN' | 'MANAGER' | 'COACH' | 'ANALYST'
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          player_name: string
          player_number: string | null
          profile_picture: string | null
          date_of_birth: string | null
          role: 'Batsman' | 'Bowler' | 'Batsman & Wicket Keeper' | 'All Rounder'
          batting_style: 'Right-Handed' | 'Left-Handed'
          bowling_style: 'Right-Arm Fast' | 'Left-Arm Fast' | 'Right-Arm Medium' | 'Left-Arm Medium' | 'Right-Arm Spin' | 'Left-Arm Spin'
          nationality: 'Australia' | 'Bangladesh' | 'England' | 'India' | 'New Zealand' | 'Pakistan' | 'South Africa' | 'Sri Lanka' | 'West Indies' | 'Afghanistan' | 'Zimbabwe' | 'Ireland' | 'Scotland' | 'Netherlands' | 'United Arab Emirates' | 'Nepal' | 'United States of America'
          team: 'Chennai Super Kings (CSK)' | 'Delhi Capitals (DC)' | 'Kolkata Knight Riders (KKR)' | 'Mumbai Indians (MI)' | 'Punjab Kings (PBKS)' | 'Rajasthan Royals (RR)' | 'Royal Challengers Bangalore (RCB)' | 'Sunrisers Hyderabad (SRH)' | 'Gujarat Titans (GT)' | 'Lucknow SuperGiants (LSG)'
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
        Insert: {
          id?: string
          player_name: string
          player_number?: string | null
          profile_picture?: string | null
          date_of_birth?: string | null
          role: 'Batsman' | 'Bowler' | 'Batsman & Wicket Keeper' | 'All Rounder'
          batting_style: 'Right-Handed' | 'Left-Handed'
          bowling_style: 'Right-Arm Fast' | 'Left-Arm Fast' | 'Right-Arm Medium' | 'Left-Arm Medium' | 'Right-Arm Spin' | 'Left-Arm Spin'
          nationality: 'Australia' | 'Bangladesh' | 'England' | 'India' | 'New Zealand' | 'Pakistan' | 'South Africa' | 'Sri Lanka' | 'West Indies' | 'Afghanistan' | 'Zimbabwe' | 'Ireland' | 'Scotland' | 'Netherlands' | 'United Arab Emirates' | 'Nepal' | 'United States of America'
          team: 'Chennai Super Kings (CSK)' | 'Delhi Capitals (DC)' | 'Kolkata Knight Riders (KKR)' | 'Mumbai Indians (MI)' | 'Punjab Kings (PBKS)' | 'Rajasthan Royals (RR)' | 'Royal Challengers Bangalore (RCB)' | 'Sunrisers Hyderabad (SRH)' | 'Gujarat Titans (GT)' | 'Lucknow SuperGiants (LSG)'
          matches_played?: number
          number_of_50s?: number
          number_of_100s?: number
          total_4s?: number
          total_6s?: number
          total_runs?: number
          total_overs?: number
          total_wickets?: number
          total_stumpings?: number
          total_catches?: number
          avg_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_name?: string
          player_number?: string | null
          profile_picture?: string | null
          date_of_birth?: string | null
          role?: 'Batsman' | 'Bowler' | 'Batsman & Wicket Keeper' | 'All Rounder'
          batting_style?: 'Right-Handed' | 'Left-Handed'
          bowling_style?: 'Right-Arm Fast' | 'Left-Arm Fast' | 'Right-Arm Medium' | 'Left-Arm Medium' | 'Right-Arm Spin' | 'Left-Arm Spin'
          nationality?: 'Australia' | 'Bangladesh' | 'England' | 'India' | 'New Zealand' | 'Pakistan' | 'South Africa' | 'Sri Lanka' | 'West Indies' | 'Afghanistan' | 'Zimbabwe' | 'Ireland' | 'Scotland' | 'Netherlands' | 'United Arab Emirates' | 'Nepal' | 'United States of America'
          team?: 'Chennai Super Kings (CSK)' | 'Delhi Capitals (DC)' | 'Kolkata Knight Riders (KKR)' | 'Mumbai Indians (MI)' | 'Punjab Kings (PBKS)' | 'Rajasthan Royals (RR)' | 'Royal Challengers Bangalore (RCB)' | 'Sunrisers Hyderabad (SRH)' | 'Gujarat Titans (GT)' | 'Lucknow SuperGiants (LSG)'
          matches_played?: number
          number_of_50s?: number
          number_of_100s?: number
          total_4s?: number
          total_6s?: number
          total_runs?: number
          total_overs?: number
          total_wickets?: number
          total_stumpings?: number
          total_catches?: number
          avg_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      match_performances: {
        Row: {
          id: string
          match_performance_name: string
          player_id: string
          player_of_the_match: boolean
          match_category: 'Domestic' | 'International'
          match_result: 'WON' | 'LOST' | 'DRAW'
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
        Insert: {
          id?: string
          match_performance_name: string
          player_id: string
          player_of_the_match?: boolean
          match_category: 'Domestic' | 'International'
          match_result: 'WON' | 'LOST' | 'DRAW'
          runs_scored?: number
          balls_faced?: number
          fours?: number
          sixes?: number
          overs_bowled?: number
          wickets_taken?: number
          runs_conceded?: number
          maiden_overs?: number
          stumpings?: number
          catches?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_performance_name?: string
          player_id?: string
          player_of_the_match?: boolean
          match_category?: 'Domestic' | 'International'
          match_result?: 'WON' | 'LOST' | 'DRAW'
          runs_scored?: number
          balls_faced?: number
          fours?: number
          sixes?: number
          overs_bowled?: number
          wickets_taken?: number
          runs_conceded?: number
          maiden_overs?: number
          stumpings?: number
          catches?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}