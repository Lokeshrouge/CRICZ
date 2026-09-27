-- CRICKSTATS Database Setup SQL

-- Enable RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create custom types for enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'COACH', 'ANALYST');
CREATE TYPE player_role AS ENUM ('Batsman', 'Bowler', 'Batsman & Wicket Keeper', 'All Rounder');
CREATE TYPE batting_style AS ENUM ('Right-Handed', 'Left-Handed');
CREATE TYPE bowling_style AS ENUM ('Right-Arm Fast', 'Left-Arm Fast', 'Right-Arm Medium', 'Left-Arm Medium', 'Right-Arm Spin', 'Left-Arm Spin');
CREATE TYPE nationality AS ENUM ('Australia', 'Bangladesh', 'England', 'India', 'New Zealand', 'Pakistan', 'South Africa', 'Sri Lanka', 'West Indies', 'Afghanistan', 'Zimbabwe', 'Ireland', 'Scotland', 'Netherlands', 'United Arab Emirates', 'Nepal', 'United States of America');
CREATE TYPE team AS ENUM ('Chennai Super Kings (CSK)', 'Delhi Capitals (DC)', 'Kolkata Knight Riders (KKR)', 'Mumbai Indians (MI)', 'Punjab Kings (PBKS)', 'Rajasthan Royals (RR)', 'Royal Challengers Bangalore (RCB)', 'Sunrisers Hyderabad (SRH)', 'Gujarat Titans (GT)', 'Lucknow SuperGiants (LSG)');
CREATE TYPE match_category AS ENUM ('Domestic', 'International');
CREATE TYPE match_result AS ENUM ('WON', 'LOST', 'DRAW');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'ANALYST',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL CHECK (length(player_name) <= 50),
  player_number TEXT CHECK (length(player_number) <= 3),
  profile_picture TEXT,
  date_of_birth DATE CHECK (date_of_birth <= CURRENT_DATE),
  role player_role NOT NULL,
  batting_style batting_style NOT NULL,
  bowling_style bowling_style NOT NULL,
  nationality nationality NOT NULL,
  team team NOT NULL,
  matches_played INTEGER NOT NULL DEFAULT 0 CHECK (matches_played >= 0),
  number_of_50s INTEGER NOT NULL DEFAULT 0 CHECK (number_of_50s >= 0),
  number_of_100s INTEGER NOT NULL DEFAULT 0 CHECK (number_of_100s >= 0),
  total_4s INTEGER NOT NULL DEFAULT 0 CHECK (total_4s >= 0),
  total_6s INTEGER NOT NULL DEFAULT 0 CHECK (total_6s >= 0),
  total_runs INTEGER NOT NULL DEFAULT 0 CHECK (total_runs >= 0),
  total_overs DECIMAL(5,1) NOT NULL DEFAULT 0 CHECK (total_overs >= 0),
  total_wickets INTEGER NOT NULL DEFAULT 0 CHECK (total_wickets >= 0),
  total_stumpings INTEGER NOT NULL DEFAULT 0 CHECK (total_stumpings >= 0),
  total_catches INTEGER NOT NULL DEFAULT 0 CHECK (total_catches >= 0),
  avg_score DECIMAL(6,2) NOT NULL DEFAULT 0 CHECK (avg_score >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create match_performances table
CREATE TABLE match_performances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_performance_name TEXT NOT NULL CHECK (length(match_performance_name) <= 80),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player_of_the_match BOOLEAN NOT NULL DEFAULT FALSE,
  match_category match_category NOT NULL,
  match_result match_result NOT NULL,
  runs_scored INTEGER NOT NULL DEFAULT 0 CHECK (runs_scored >= 0),
  balls_faced INTEGER NOT NULL DEFAULT 0 CHECK (balls_faced >= 0),
  fours INTEGER NOT NULL DEFAULT 0 CHECK (fours >= 0 AND fours <= balls_faced),
  sixes INTEGER NOT NULL DEFAULT 0 CHECK (sixes >= 0 AND sixes <= balls_faced),
  overs_bowled DECIMAL(5,1) NOT NULL DEFAULT 0 CHECK (overs_bowled >= 0),
  wickets_taken INTEGER NOT NULL DEFAULT 0 CHECK (wickets_taken >= 0 AND wickets_taken <= 10),
  runs_conceded INTEGER NOT NULL DEFAULT 0 CHECK (runs_conceded >= 0),
  maiden_overs DECIMAL(4,1) NOT NULL DEFAULT 0 CHECK (maiden_overs >= 0 AND maiden_overs <= overs_bowled),
  stumpings INTEGER NOT NULL DEFAULT 0 CHECK (stumpings >= 0),
  catches INTEGER NOT NULL DEFAULT 0 CHECK (catches >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Additional constraints
  CONSTRAINT check_boundary_runs CHECK ((fours * 4) + (sixes * 6) <= runs_scored)
);

-- Create indexes for better performance
CREATE INDEX idx_players_team ON players(team);
CREATE INDEX idx_players_role ON players(role);
CREATE INDEX idx_players_nationality ON players(nationality);
CREATE INDEX idx_match_performances_player_id ON match_performances(player_id);
CREATE INDEX idx_match_performances_category ON match_performances(match_category);
CREATE INDEX idx_match_performances_result ON match_performances(match_result);
CREATE INDEX idx_match_performances_created_at ON match_performances(created_at);

-- Create function to update player statistics
CREATE OR REPLACE FUNCTION update_player_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update player statistics based on all their match performances
  UPDATE players 
  SET 
    matches_played = (
      SELECT COUNT(*) 
      FROM match_performances 
      WHERE player_id = COALESCE(NEW.player_id, OLD.player_id)
    ),
    number_of_50s = (
      SELECT COUNT(*) 
      FROM match_performances 
      WHERE player_id = COALESCE(NEW.player_id, OLD.player_id) 
      AND runs_scored >= 50 
      AND runs_scored < 100
    ),
    number_of_100s = (
      SELECT COUNT(*) 
      FROM match_performances 
      WHERE player_id = COALESCE(NEW.player_id, OLD.player_id) 
      AND runs_scored >= 100
    ),
    total_4s = (
      SELECT COALESCE(SUM(fours), 0) 
      FROM match_performances 
      WHERE player_id = COALESCE(NEW.player_id, OLD.player_id)
    ),
    total_6s = (
      SELECT COALESCE(SUM(sixes), 0) 
      FROM match_performances 
      WHERE player_id = COALESCE(NEW.player_id, OLD.player_id)
    ),
    total_runs = (
      SELECT COALESCE(SUM(runs_scored), 0) 
      FROM match_performances 
      WHERE player_id = COALESCE(NEW.player_id, OLD.player_id)
    ),
    total_overs = (
      SELECT COALESCE(SUM(overs_bowled), 0) 
      FROM match_performances 
      WHERE player_id = COALESCE(NEW.player_id, OLD.player_id)
    ),
    total_wickets = (
      SELECT COALESCE(SUM(wickets_taken), 0) 
      FROM match_performances 
      WHERE player_id = COALESCE(NEW.player_id, OLD.player_id)
    ),
    total_stumpings = (
      SELECT COALESCE(SUM(stumpings), 0) 
      FROM match_performances 
      WHERE player_id = COALESCE(NEW.player_id, OLD.player_id)
    ),
    total_catches = (
      SELECT COALESCE(SUM(catches), 0) 
      FROM match_performances 
      WHERE player_id = COALESCE(NEW.player_id, OLD.player_id)
    ),
    avg_score = (
      SELECT 
        CASE 
          WHEN COUNT(*) > 0 
          THEN ROUND(COALESCE(SUM(runs_scored), 0)::DECIMAL / COUNT(*), 2)
          ELSE 0 
        END
      FROM match_performances 
      WHERE player_id = COALESCE(NEW.player_id, OLD.player_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.player_id, OLD.player_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update player statistics
CREATE TRIGGER trigger_update_player_stats_insert
  AFTER INSERT ON match_performances
  FOR EACH ROW EXECUTE FUNCTION update_player_statistics();

CREATE TRIGGER trigger_update_player_stats_update
  AFTER UPDATE ON match_performances
  FOR EACH ROW EXECUTE FUNCTION update_player_statistics();

CREATE TRIGGER trigger_update_player_stats_delete
  AFTER DELETE ON match_performances
  FOR EACH ROW EXECUTE FUNCTION update_player_statistics();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at 
  BEFORE UPDATE ON players 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_performances_updated_at 
  BEFORE UPDATE ON match_performances 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_performances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'ADMIN'
    )
  );

-- Create RLS policies for players (all authenticated users can read)
CREATE POLICY "All authenticated users can view players" ON players
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and Managers can insert players" ON players
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );

CREATE POLICY "Admins and Managers can update players" ON players
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );

CREATE POLICY "Admins can delete players" ON players
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'ADMIN'
    )
  );

-- Create RLS policies for match_performances
CREATE POLICY "All authenticated users can view match performances" ON match_performances
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins, Managers, and Coaches can insert match performances" ON match_performances
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN', 'MANAGER', 'COACH')
    )
  );

CREATE POLICY "Admins, Managers, and Coaches can update match performances" ON match_performances
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN', 'MANAGER', 'COACH')
    )
  );

CREATE POLICY "Admins can delete match performances" ON match_performances
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'ADMIN'
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'ANALYST');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();