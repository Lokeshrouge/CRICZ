# Salesforce to Web Application Mapping

## Overview

This document maps the original CRICKSTATS Salesforce implementation to the equivalent web application features. The web application faithfully reproduces all functional requirements while adapting to modern web architecture patterns.

## Architecture Mapping

### Salesforce Platform → Web Platform

| Salesforce Component | Web Implementation | Notes |
|---------------------|-------------------|-------|
| Custom Objects | Database Tables | PostgreSQL tables with equivalent fields |
| Master-Detail Relationships | Foreign Key Relationships | Referential integrity maintained |
| Roll-Up Summary Fields | Database Triggers | Real-time calculation via PostgreSQL triggers |
| Validation Rules | Client & Server Validation | Zod schemas + database constraints |
| Workflows & Process Builder | Business Logic Layer | React services and utilities |
| Screen Flows | React Components | Interactive UI workflows |
| Reports | React Report Pages | Dynamic reports with filtering |
| Dashboards | React Dashboard | Interactive charts and KPIs |
| Profiles & Permission Sets | Role-Based Access Control | RBAC with route protection |
| Apex Classes | TypeScript Services | Business logic in service layer |
| Visualforce Pages | React Pages | Modern component-based UI |

## Data Model Mapping

### Custom Objects

#### 1. Player Object → players Table

**Salesforce Player Object:**
```
Player__c {
  Name: Player_Name__c (Text, 50)
  Player_Number__c (Text, 3)
  Profile_Picture__c (URL)
  Date_of_Birth__c (Date)
  Role__c (Picklist)
  Batting_Style__c (Picklist)
  Bowling_Style__c (Picklist)
  Nationality__c (Picklist)
  Team__c (Picklist)
  
  // Roll-Up Summary Fields
  Matches_Played__c (Number)
  Number_of_50s__c (Number)
  Number_of_100s__c (Number)
  Total_4s__c (Number)
  Total_6s__c (Number)
  Total_runs__c (Number)
  Total_Overs__c (Number)
  Total_Wickets__c (Number)
  Total_Stumpings__c (Number)
  Total_Catches__c (Number)
  Avg_Score__c (Number)
}
```

**Web Implementation (PostgreSQL):**
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY,
  player_name TEXT CHECK (length(player_name) <= 50),
  player_number TEXT CHECK (length(player_number) <= 3),
  profile_picture TEXT,
  date_of_birth DATE,
  role player_role,
  batting_style batting_style,
  bowling_style bowling_style,
  nationality nationality,
  team team,
  
  -- Auto-calculated via triggers
  matches_played INTEGER DEFAULT 0,
  number_of_50s INTEGER DEFAULT 0,
  number_of_100s INTEGER DEFAULT 0,
  total_4s INTEGER DEFAULT 0,
  total_6s INTEGER DEFAULT 0,
  total_runs INTEGER DEFAULT 0,
  total_overs DECIMAL(5,1) DEFAULT 0,
  total_wickets INTEGER DEFAULT 0,
  total_stumpings INTEGER DEFAULT 0,
  total_catches INTEGER DEFAULT 0,
  avg_score DECIMAL(6,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. Match Performance Object → match_performances Table

**Salesforce Match Performance Object:**
```
Match_Performance__c {
  Name: Match_Performance_Name__c (Text, 80)
  Player__c (Lookup to Player__c)
  Player_of_the_Match__c (Checkbox)
  Match_Category__c (Picklist: Domestic, International)
  Match_Result__c (Picklist: WON, LOST, DRAW)
  Runs_Scored__c (Number)
  Balls_Faced__c (Number)
  Fours__c (Number)
  Sixes__c (Number)
  Overs_Bowled__c (Number)
  Wickets_Taken__c (Number)
  Runs_Conceded__c (Number)
  Maiden_Overs__c (Number)
  Stumpings__c (Number)
  Catches__c (Number)
}
```

**Web Implementation (PostgreSQL):**
```sql
CREATE TABLE match_performances (
  id UUID PRIMARY KEY,
  match_performance_name TEXT CHECK (length(match_performance_name) <= 80),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  player_of_the_match BOOLEAN DEFAULT FALSE,
  match_category match_category,
  match_result match_result,
  runs_scored INTEGER DEFAULT 0,
  balls_faced INTEGER DEFAULT 0,
  fours INTEGER DEFAULT 0,
  sixes INTEGER DEFAULT 0,
  overs_bowled DECIMAL(5,1) DEFAULT 0,
  wickets_taken INTEGER DEFAULT 0,
  runs_conceded INTEGER DEFAULT 0,
  maiden_overs DECIMAL(4,1) DEFAULT 0,
  stumpings INTEGER DEFAULT 0,
  catches INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Relationships

#### Master-Detail Relationship → Foreign Key

**Salesforce:**
```
Match_Performance__c.Player__c → Player__c (Master-Detail)
```

**Web Implementation:**
```sql
-- Foreign key with cascade delete
player_id UUID REFERENCES players(id) ON DELETE CASCADE
```

**Key Differences:**
- Salesforce: Automatic relationship handling, sharing inheritance
- Web: Explicit foreign key constraints, manual cascade handling
- Both: Referential integrity maintained

### Roll-Up Summary Fields → Database Triggers

#### Salesforce Roll-Up Summary

**Salesforce Configuration:**
```
Player__c.Matches_Played__c = COUNT(Match_Performance__c)
Player__c.Total_Runs__c = SUM(Match_Performance__c.Runs_Scored__c)
Player__c.Number_of_50s__c = COUNT(Match_Performance__c WHERE Runs_Scored__c >= 50 AND < 100)
```

**Web Implementation (PostgreSQL Trigger):**
```sql
CREATE OR REPLACE FUNCTION update_player_statistics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE players 
  SET 
    matches_played = (SELECT COUNT(*) FROM match_performances WHERE player_id = NEW.player_id),
    total_runs = (SELECT COALESCE(SUM(runs_scored), 0) FROM match_performances WHERE player_id = NEW.player_id),
    number_of_50s = (SELECT COUNT(*) FROM match_performances WHERE player_id = NEW.player_id AND runs_scored >= 50 AND runs_scored < 100),
    updated_at = NOW()
  WHERE id = NEW.player_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_stats_insert
  AFTER INSERT ON match_performances
  FOR EACH ROW EXECUTE FUNCTION update_player_statistics();
```

## User Interface Mapping

### Screen Flows → React Components

#### Player Flow

**Salesforce Screen Flow: "Player_Flow"**
```
Screen 1: Team Selection
  - Display Name: "SELECT TEAM"
  - Component: Picklist (Team values)
  - Variable: selectedTeam

Screen 2: Player Information
  - Display Name: "PLAYER INFORMATION" 
  - Component: Data Table
  - Columns: Profile Picture, Player Name, Total Runs, AVG Score, 
           Batting Style, Bowling Style, Matches Played, 50s, 100s
  - Filter: Team = {selectedTeam}
```

**Web Implementation: Player Flow Component**
```tsx
// Dashboard.tsx - Player Flow Section
function PlayerFlow() {
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([])

  const handleTeamSelect = async (team: string) => {
    const { data } = await playerService.getByTeam(team)
    setTeamPlayers(data || [])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Flow - Team Selection</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Step 1: Team Selection */}
        <Select
          label="Select Team"
          options={TEAMS.map(team => ({ value: team, label: team }))}
          value={selectedTeam}
          onChange={(e) => handleTeamSelect(e.target.value)}
        />

        {/* Step 2: Player Information Table */}
        {selectedTeam && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Total Runs</TableHead>
                <TableHead>AVG Score</TableHead>
                <TableHead>Batting Style</TableHead>
                <TableHead>Bowling Style</TableHead>
                <TableHead>Matches Played</TableHead>
                <TableHead>50s</TableHead>
                <TableHead>100s</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamPlayers.map((player) => (
                <TableRow key={player.id}>
                  {/* Player data display */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
```

### Reports → React Report Pages

#### Salesforce Reports

**Salesforce Report Types:**
1. Player Performance Report
2. Match Performance Report  
3. Team Analysis Report
4. Batting Statistics Report
5. Bowling Performance Report

**Web Implementation:**
```tsx
// Reports.tsx
function Reports() {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('player_performance')
  
  const reportTypes = [
    { value: 'player_performance', label: 'Player Performance Report' },
    { value: 'match_performance', label: 'Match Performance Report' },
    { value: 'team_performance', label: 'Team Performance Report' },
    { value: 'batting', label: 'Batting Report' },
    { value: 'bowling', label: 'Bowling Report' },
    { value: 'fielding', label: 'Fielding Report' },
    { value: 'milestones', label: 'Player Milestone Report' }
  ]

  return (
    <div>
      {/* Report Type Selection */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {reportTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedReportType(type.value)}
                className={selectedReportType === type.value ? 'selected' : ''}
              >
                {type.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Report Content */}
      {renderReportContent()}
    </div>
  )
}
```

### Dashboards → React Analytics

**Salesforce Dashboard Components:**
- Chart: Top Run Scorers (Bar Chart)
- Chart: Wickets by Player (Bar Chart)  
- Chart: Team Performance (Pie Chart)
- Table: Recent Performances
- KPI: Total Players, Matches, Runs

**Web Implementation:**
```tsx
// Dashboard.tsx
function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Players" value={stats.totalPlayers} />
        <StatCard title="Total Matches" value={stats.totalMatches} />
        <StatCard title="Total Runs" value={stats.totalRuns} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Top Run Scorers</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={runsByPlayer}>
                <Bar dataKey="total_runs" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Team Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={teamData} dataKey="count" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

## Security & Access Control

### Profiles & Permission Sets → RBAC

#### Salesforce Security Model

**Salesforce Profiles:**
```
Administrator Profile:
  - Object Permissions: CRUDX on all objects
  - System Permissions: Modify All Data, Manage Users

Manager Profile:  
  - Object Permissions: CRUD on Player__c, Match_Performance__c
  - Field Permissions: Edit all fields

Coach Profile:
  - Object Permissions: CRU on Match_Performance__c, Read on Player__c
  - Field Permissions: Limited edit access

Analyst Profile:
  - Object Permissions: Read on all objects
  - Field Permissions: Read-only access
```

**Web Implementation (RBAC):**
```tsx
// types/index.ts
export type UserRole = 'ADMIN' | 'MANAGER' | 'COACH' | 'ANALYST'

// Role Permissions Mapping
const ROLE_PERMISSIONS = {
  ADMIN: {
    players: { create: true, read: true, update: true, delete: true },
    performances: { create: true, read: true, update: true, delete: true },
    users: { create: true, read: true, update: true, delete: true },
    settings: { access: true }
  },
  MANAGER: {
    players: { create: true, read: true, update: true, delete: false },
    performances: { create: true, read: true, update: true, delete: false },
    users: { create: false, read: true, update: false, delete: false },
    settings: { access: false }
  },
  COACH: {
    players: { create: false, read: true, update: false, delete: false },
    performances: { create: true, read: true, update: true, delete: false },
    users: { create: false, read: false, update: false, delete: false },
    settings: { access: false }
  },
  ANALYST: {
    players: { create: false, read: true, update: false, delete: false },
    performances: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false },
    settings: { access: false }
  }
}

// Protected Route Implementation
function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user } = useAuth()
  
  if (!user) return <Navigate to="/login" />
  
  if (requiredRole && !hasRequiredRole(user.role, requiredRole)) {
    return <div>Access Denied</div>
  }
  
  return <>{children}</>
}
```

## Business Logic Mapping

### Validation Rules → Form Validation

#### Salesforce Validation Rules

**Example: Player Name Validation**
```
RULE NAME: Player_Name_Required
FORMULA: LEN(Player_Name__c) = 0
ERROR MESSAGE: Player Name is required
```

**Example: Match Performance Validation**
```  
RULE NAME: Boundary_Runs_Validation
FORMULA: (Fours__c * 4) + (Sixes__c * 6) > Runs_Scored__c
ERROR MESSAGE: Boundary runs cannot exceed total runs scored
```

**Web Implementation (Zod Validation):**
```tsx
// lib/validations.ts
export const playerSchema = z.object({
  player_name: z.string()
    .min(1, 'Player name is required')
    .max(50, 'Player name must not exceed 50 characters'),
  
  // Other validations...
})

export const matchPerformanceSchema = z.object({
  runs_scored: z.number().min(0, 'Runs scored cannot be negative'),
  fours: z.number().min(0, 'Fours cannot be negative'),
  sixes: z.number().min(0, 'Sixes cannot be negative')
}).refine((data) => {
  const boundaryRuns = (data.fours * 4) + (data.sixes * 6)
  return boundaryRuns <= data.runs_scored
}, {
  message: 'Boundary runs cannot exceed total runs scored',
  path: ['runs_scored']
})
```

## Functional Requirements Mapping

### FR-1: Player Registration → Player CRUD

**Salesforce:** Custom Player__c object with validation rules
**Web:** React forms with Zod validation + PostgreSQL table

### FR-2: Match Performance Entry → Performance CRUD  

**Salesforce:** Custom Match_Performance__c object with roll-up fields
**Web:** React forms with live validation + database triggers

### FR-3: Dashboard Generation → Analytics Dashboard

**Salesforce:** Dashboard with charts and reports
**Web:** React dashboard with Recharts visualization

### FR-4: Report Creation → Reports System

**Salesforce:** Standard and custom reports
**Web:** Dynamic report generation with filtering and export

### FR-5: Flow Automation → Player Flow Component

**Salesforce:** Screen Flow for team selection and player display  
**Web:** Interactive React component with team selection and data table

## Key Differences & Adaptations

### Advantages of Web Implementation

1. **Performance**: Direct database queries vs. SOQL limitations
2. **User Experience**: Modern responsive UI vs. Lightning limitations  
3. **Customization**: Full control over UI/UX vs. platform constraints
4. **Cost**: No per-user licensing vs. Salesforce user costs
5. **Integration**: RESTful APIs vs. Salesforce API limits

### Salesforce Advantages

1. **Built-in Features**: Automatic audit trail, built-in user management
2. **Declarative Development**: No-code configuration vs. custom development
3. **Enterprise Features**: Advanced workflow, approval processes
4. **Ecosystem**: AppExchange integrations, Salesforce Mobile

### Web Implementation Considerations

1. **Manual Development**: Custom implementation of Salesforce built-ins
2. **Maintenance**: Ongoing updates vs. platform maintenance
3. **Security**: Manual security implementation vs. platform security
4. **Scalability**: Manual optimization vs. platform scaling

## Migration Path

### Data Migration

```sql
-- Example: Salesforce to PostgreSQL data migration
INSERT INTO players (
  player_name, player_number, role, batting_style, 
  bowling_style, nationality, team, date_of_birth
)
SELECT 
  Player_Name__c, Player_Number__c, Role__c, 
  Batting_Style__c, Bowling_Style__c, Nationality__c, 
  Team__c, Date_of_Birth__c
FROM salesforce_export.Player__c;
```

### Business Process Migration

1. **Workflows** → Service layer functions
2. **Process Builder** → Event-driven triggers  
3. **Approval Processes** → Custom workflow implementation
4. **Email Templates** → React email components

## Testing Equivalence

### Salesforce Test Coverage → Web Testing

**Salesforce Tests:**
- Apex Test Classes for business logic
- UI Tests for Lightning components
- Integration tests for external systems

**Web Implementation Tests:**
- Unit tests for service functions (Jest)
- Component tests for React components (React Testing Library)
- Integration tests for API endpoints (Cypress)
- End-to-end tests for user workflows (Playwright)

This mapping ensures that all original Salesforce functionality is preserved while taking advantage of modern web development practices and performance optimizations.