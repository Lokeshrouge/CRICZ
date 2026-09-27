# Database Schema Documentation

## Overview

CRICKSTATS uses a PostgreSQL database hosted on Supabase with a carefully designed schema that ensures data integrity, performance, and automatic statistics calculation.

## Schema Design Principles

1. **Referential Integrity**: All relationships use foreign keys with appropriate constraints
2. **Data Validation**: Check constraints enforce business rules at the database level
3. **Automatic Statistics**: Triggers maintain roll-up statistics in real-time
4. **Security**: Row Level Security (RLS) policies protect data access
5. **Performance**: Strategic indexing for optimal query performance

## Tables

### 1. profiles

Extends Supabase's built-in `auth.users` table with application-specific user information.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'ANALYST',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, FK to auth.users | User identifier |
| `email` | TEXT | NOT NULL, UNIQUE | User email address |
| `full_name` | TEXT | NULLABLE | User's display name |
| `role` | user_role | NOT NULL, DEFAULT 'ANALYST' | User role (ADMIN, MANAGER, COACH, ANALYST) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

#### Indexes
- Primary key on `id`
- Unique index on `email`
- Index on `role` for role-based queries

#### RLS Policies
```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );
```

### 2. players

Core player information with automatic roll-up statistics.

```sql
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
  -- Roll-up Statistics (automatically calculated)
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
```

#### Core Fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique player identifier |
| `player_name` | TEXT | NOT NULL, MAX 50 chars | Player's full name |
| `player_number` | TEXT | MAX 3 chars | Jersey number |
| `profile_picture` | TEXT | NULLABLE | URL to player photo |
| `date_of_birth` | DATE | <= CURRENT_DATE | Player's birth date |
| `role` | player_role | NOT NULL | Batsman, Bowler, All Rounder, etc. |
| `batting_style` | batting_style | NOT NULL | Right-Handed, Left-Handed |
| `bowling_style` | bowling_style | NOT NULL | Right-Arm Fast, Left-Arm Spin, etc. |
| `nationality` | nationality | NOT NULL | Player's country |
| `team` | team | NOT NULL | IPL team affiliation |

#### Roll-up Statistics (Auto-calculated)

| Column | Type | Calculation | Description |
|--------|------|-------------|-------------|
| `matches_played` | INTEGER | COUNT(performances) | Total matches played |
| `number_of_50s` | INTEGER | COUNT WHERE runs >= 50 AND < 100 | Fifty scores |
| `number_of_100s` | INTEGER | COUNT WHERE runs >= 100 | Century scores |
| `total_4s` | INTEGER | SUM(fours) | Total boundaries (4s) |
| `total_6s` | INTEGER | SUM(sixes) | Total sixes |
| `total_runs` | INTEGER | SUM(runs_scored) | Career runs |
| `total_overs` | DECIMAL | SUM(overs_bowled) | Total overs bowled |
| `total_wickets` | INTEGER | SUM(wickets_taken) | Career wickets |
| `total_stumpings` | INTEGER | SUM(stumpings) | Total stumpings |
| `total_catches` | INTEGER | SUM(catches) | Total catches |
| `avg_score` | DECIMAL | total_runs / matches_played | Batting average |

#### Indexes
```sql
CREATE INDEX idx_players_team ON players(team);
CREATE INDEX idx_players_role ON players(role);
CREATE INDEX idx_players_nationality ON players(nationality);
```

#### Custom Types (Enums)
```sql
CREATE TYPE player_role AS ENUM (
  'Batsman', 
  'Bowler', 
  'Batsman & Wicket Keeper', 
  'All Rounder'
);

CREATE TYPE batting_style AS ENUM ('Right-Handed', 'Left-Handed');

CREATE TYPE bowling_style AS ENUM (
  'Right-Arm Fast', 'Left-Arm Fast', 
  'Right-Arm Medium', 'Left-Arm Medium',
  'Right-Arm Spin', 'Left-Arm Spin'
);

CREATE TYPE nationality AS ENUM (
  'Australia', 'Bangladesh', 'England', 'India', 'New Zealand',
  'Pakistan', 'South Africa', 'Sri Lanka', 'West Indies',
  'Afghanistan', 'Zimbabwe', 'Ireland', 'Scotland', 
  'Netherlands', 'United Arab Emirates', 'Nepal', 
  'United States of America'
);

CREATE TYPE team AS ENUM (
  'Chennai Super Kings (CSK)', 'Delhi Capitals (DC)',
  'Kolkata Knight Riders (KKR)', 'Mumbai Indians (MI)',
  'Punjab Kings (PBKS)', 'Rajasthan Royals (RR)',
  'Royal Challengers Bangalore (RCB)', 'Sunrisers Hyderabad (SRH)',
  'Gujarat Titans (GT)', 'Lucknow SuperGiants (LSG)'
);
```

### 3. match_performances

Individual match performance records with detailed statistics.

```sql
CREATE TABLE match_performances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_performance_name TEXT NOT NULL CHECK (length(match_performance_name) <= 80),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player_of_the_match BOOLEAN NOT NULL DEFAULT FALSE,
  match_category match_category NOT NULL,
  match_result match_result NOT NULL,
  -- Batting Statistics
  runs_scored INTEGER NOT NULL DEFAULT 0 CHECK (runs_scored >= 0),
  balls_faced INTEGER NOT NULL DEFAULT 0 CHECK (balls_faced >= 0),
  fours INTEGER NOT NULL DEFAULT 0 CHECK (fours >= 0 AND fours <= balls_faced),
  sixes INTEGER NOT NULL DEFAULT 0 CHECK (sixes >= 0 AND sixes <= balls_faced),
  -- Bowling Statistics  
  overs_bowled DECIMAL(5,1) NOT NULL DEFAULT 0 CHECK (overs_bowled >= 0),
  wickets_taken INTEGER NOT NULL DEFAULT 0 CHECK (wickets_taken >= 0 AND wickets_taken <= 10),
  runs_conceded INTEGER NOT NULL DEFAULT 0 CHECK (runs_conceded >= 0),
  maiden_overs DECIMAL(4,1) NOT NULL DEFAULT 0 CHECK (maiden_overs >= 0 AND maiden_overs <= overs_bowled),
  -- Fielding Statistics
  stumpings INTEGER NOT NULL DEFAULT 0 CHECK (stumpings >= 0),
  catches INTEGER NOT NULL DEFAULT 0 CHECK (catches >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Business Rule Constraints
  CONSTRAINT check_boundary_runs CHECK ((fours * 4) + (sixes * 6) <= runs_scored)
);
```

#### Fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Performance record ID |
| `match_performance_name` | TEXT | NOT NULL, MAX 80 chars | Match description |
| `player_id` | UUID | FK to players | Associated player |
| `player_of_the_match` | BOOLEAN | DEFAULT FALSE | POM award flag |
| `match_category` | match_category | NOT NULL | Domestic/International |
| `match_result` | match_result | NOT NULL | WON/LOST/DRAW |
| `runs_scored` | INTEGER | >= 0 | Runs scored |
| `balls_faced` | INTEGER | >= 0 | Balls faced |
| `fours` | INTEGER | >= 0, <= balls_faced | Boundaries hit |
| `sixes` | INTEGER | >= 0, <= balls_faced | Sixes hit |
| `overs_bowled` | DECIMAL | >= 0 | Overs bowled |
| `wickets_taken` | INTEGER | 0-10 | Wickets taken |
| `runs_conceded` | INTEGER | >= 0 | Runs conceded bowling |
| `maiden_overs` | DECIMAL | >= 0, <= overs_bowled | Maiden overs |
| `stumpings` | INTEGER | >= 0 | Stumpings effected |
| `catches` | INTEGER | >= 0 | Catches taken |

#### Additional Constraints
```sql
-- Boundary runs cannot exceed total runs
CONSTRAINT check_boundary_runs CHECK ((fours * 4) + (sixes * 6) <= runs_scored)

-- Maiden overs cannot exceed total overs
CHECK (maiden_overs <= overs_bowled)

-- Wickets cannot exceed 10 per match
CHECK (wickets_taken <= 10)

-- Fours and sixes cannot exceed balls faced
CHECK (fours <= balls_faced AND sixes <= balls_faced)
```

#### Indexes
```sql
CREATE INDEX idx_match_performances_player_id ON match_performances(player_id);
CREATE INDEX idx_match_performances_category ON match_performances(match_category);
CREATE INDEX idx_match_performances_result ON match_performances(match_result);
CREATE INDEX idx_match_performances_created_at ON match_performances(created_at);
```

#### Custom Types
```sql
CREATE TYPE match_category AS ENUM ('Domestic', 'International');
CREATE TYPE match_result AS ENUM ('WON', 'LOST', 'DRAW');
```

## Database Triggers

### Automatic Statistics Calculation

The roll-up statistics in the `players` table are automatically maintained using PostgreSQL triggers:

```sql
CREATE OR REPLACE FUNCTION update_player_statistics()
RETURNS TRIGGER AS $$
BEGIN
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

-- Triggers for all DML operations
CREATE TRIGGER trigger_update_player_stats_insert
  AFTER INSERT ON match_performances
  FOR EACH ROW EXECUTE FUNCTION update_player_statistics();

CREATE TRIGGER trigger_update_player_stats_update
  AFTER UPDATE ON match_performances
  FOR EACH ROW EXECUTE FUNCTION update_player_statistics();

CREATE TRIGGER trigger_update_player_stats_delete
  AFTER DELETE ON match_performances
  FOR EACH ROW EXECUTE FUNCTION update_player_statistics();
```

### Updated Timestamp Triggers

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at 
  BEFORE UPDATE ON players 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_performances_updated_at 
  BEFORE UPDATE ON match_performances 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Row Level Security (RLS)

### Profile Policies
```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );
```

### Player Policies
```sql
-- All authenticated users can view players
CREATE POLICY "All authenticated users can view players" ON players
  FOR SELECT TO authenticated USING (true);

-- Admins and Managers can insert/update players
CREATE POLICY "Admins and Managers can insert players" ON players
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER'))
  );

-- Admins can delete players
CREATE POLICY "Admins can delete players" ON players
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );
```

### Match Performance Policies
```sql
-- All authenticated users can view performances
CREATE POLICY "All authenticated users can view match performances" ON match_performances
  FOR SELECT TO authenticated USING (true);

-- Admins, Managers, and Coaches can insert/update
CREATE POLICY "Admins, Managers, and Coaches can insert match performances" ON match_performances
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'COACH'))
  );

-- Admins can delete performances
CREATE POLICY "Admins can delete match performances" ON match_performances
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );
```

## Data Integrity & Constraints

### Foreign Key Relationships
- `profiles.id` → `auth.users.id` (CASCADE DELETE)
- `match_performances.player_id` → `players.id` (CASCADE DELETE)

### Check Constraints
1. **String Length Limits**: Player names (50), player numbers (3), match names (80)
2. **Numeric Ranges**: Non-negative values for statistics
3. **Business Rules**: Boundary runs ≤ total runs, wickets ≤ 10, etc.
4. **Date Validation**: Birth dates cannot be in the future

### Unique Constraints
- `profiles.email` - Unique email addresses
- Composite unique constraints could be added for player numbers within teams

## Performance Optimization

### Indexing Strategy
1. **Primary Keys**: Clustered indexes on UUID primary keys
2. **Foreign Keys**: Indexes on all foreign key columns
3. **Query Optimization**: Indexes on frequently filtered columns (team, role, category)
4. **Temporal Queries**: Indexes on created_at for chronological queries

### Query Performance
- Use of COALESCE for null handling in aggregations
- Efficient trigger functions with single-pass calculations
- Selective queries with appropriate WHERE clauses

### Monitoring
- PostgreSQL query performance tracking
- Supabase dashboard metrics
- Slow query identification and optimization

## Backup & Recovery

### Automated Backups
- Supabase provides automated daily backups
- Point-in-time recovery capability
- Cross-region backup replication

### Data Export
- CSV export functionality for all reports
- SQL dump capabilities through Supabase
- API-based data extraction for migrations

## Future Schema Enhancements

### Planned Additions
1. **Audit Trail**: Track all data changes with timestamps and user IDs
2. **File Storage**: Integration with Supabase Storage for images/documents
3. **Notifications**: Table for system notifications and alerts
4. **Teams Management**: More detailed team information and hierarchies
5. **Tournaments**: Support for multiple tournaments and series
6. **Advanced Statistics**: Additional calculated fields for deeper analytics

### Scalability Considerations
1. **Partitioning**: Date-based partitioning for match_performances
2. **Archival**: Move old performance data to archive tables
3. **Read Replicas**: Separate read replicas for reporting queries
4. **Materialized Views**: Pre-calculated aggregations for complex reports

This schema design provides a robust foundation for cricket performance tracking while maintaining data integrity, security, and performance.