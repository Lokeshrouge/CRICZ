# CRICKSTATS Architecture Documentation

## Overview

CRICKSTATS is built using a modern web architecture with a React frontend and Supabase backend. The system follows a layered architecture pattern with clear separation of concerns.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Login     │ │  Dashboard  │ │   Reports   │           │
│  │    Page     │ │    Page     │ │    Page     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Players   │ │ Performance │ │  Analytics  │           │
│  │    Page     │ │    Page     │ │    Page     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Auth Context│ │   Services  │ │ Validation  │           │
│  │             │ │             │ │   Schemas   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Utilities  │ │ Components  │ │   Hooks     │           │
│  │             │ │   Library   │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Supabase   │ │ PostgreSQL  │ │     RLS     │           │
│  │   Client    │ │  Database   │ │  Policies   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Tables    │ │  Triggers   │ │   Indexes   │           │
│  │             │ │             │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI primitives
│   ├── GlobalSearch.tsx # Search functionality
│   ├── Layout.tsx      # Application layout
│   └── ProtectedRoute.tsx # Route protection
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── hooks/              # Custom React hooks
├── lib/                # Utilities and services
│   ├── database.ts     # Database service layer
│   ├── supabase.ts     # Supabase client
│   ├── utils.ts        # Utility functions
│   └── validations.ts  # Form validation schemas
├── pages/              # Route components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Players.tsx     # Player management
│   ├── Reports.tsx     # Reporting system
│   └── ...
├── types/              # TypeScript type definitions
└── ...
```

## Data Flow Architecture

### Authentication Flow
```
User Login → Supabase Auth → Profile Fetch → Context Update → Route Protection
```

### CRUD Operations Flow
```
User Input → Form Validation → Service Layer → Supabase Client → Database → Triggers → UI Update
```

### Statistics Calculation Flow
```
Match Performance Change → Database Trigger → Roll-up Calculation → Player Stats Update
```

## Key Architectural Patterns

### 1. Service Layer Pattern
All database operations are abstracted through service functions:
- `playerService` - Player CRUD operations
- `matchPerformanceService` - Performance CRUD operations
- `userService` - User management operations
- `dashboardService` - Statistics aggregation

### 2. Repository Pattern (via Supabase)
Database access is centralized through the Supabase client, providing:
- Consistent API interface
- Built-in caching and optimization
- Real-time subscriptions (future enhancement)
- Automatic query generation

### 3. Context Pattern for State Management
Authentication and global state managed through React Context:
- User authentication state
- Role-based permissions
- Session management
- Error boundaries

### 4. Compound Component Pattern
UI components built using composition:
- Card components (Header, Content, Footer)
- Table components (Header, Body, Row, Cell)
- Form components with validation integration

## Database Architecture

### Entity Relationship Diagram

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│    profiles     │     │       players        │     │match_performances│
├─────────────────┤     ├──────────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)              │ ┌───│ id (PK)         │
│ email           │     │ player_name          │ │   │ player_id (FK)  │
│ full_name       │     │ player_number        │ │   │ match_name      │
│ role            │     │ profile_picture      │ │   │ runs_scored     │
│ created_at      │     │ date_of_birth        │ │   │ balls_faced     │
│ updated_at      │     │ role                 │ │   │ wickets_taken   │
└─────────────────┘     │ batting_style        │ │   │ ...             │
                        │ bowling_style        │ │   │ created_at      │
                        │ nationality          │ │   │ updated_at      │
                        │ team                 │ │   └─────────────────┘
                        │ matches_played       │ │            
                        │ total_runs          │ │   
                        │ avg_score           │ │   
                        │ number_of_50s       │ │   
                        │ number_of_100s      │ │   
                        │ ...                 │ │   
                        │ created_at          │ │   
                        │ updated_at          │ │   
                        └──────────────────────┘ │   
                                  │              │   
                                  └──────────────┘   
                                        1:M
```

### Database Triggers
Automatic statistics calculation using PostgreSQL triggers:

```sql
-- Trigger function for updating player statistics
CREATE OR REPLACE FUNCTION update_player_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate and update player roll-up statistics
  UPDATE players SET 
    matches_played = (SELECT COUNT(*) FROM match_performances WHERE player_id = NEW.player_id),
    total_runs = (SELECT COALESCE(SUM(runs_scored), 0) FROM match_performances WHERE player_id = NEW.player_id),
    -- ... other calculations
  WHERE id = NEW.player_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Route     │ │     UI      │ │  Component  │           │
│  │ Protection  │ │ Conditional │ │ Access      │           │
│  │             │ │ Rendering   │ │ Control     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                              │                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    RLS      │ │ Database    │ │ Validation  │           │
│  │  Policies   │ │ Triggers    │ │  Schemas    │           │
│  │             │ │             │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Row Level Security (RLS) Policies
Database-level security ensuring users can only access appropriate data:

```sql
-- Example: Users can only view players based on their role
CREATE POLICY "All authenticated users can view players" ON players
  FOR SELECT TO authenticated USING (true);

-- Admins and Managers can modify players
CREATE POLICY "Admins and Managers can update players" ON players
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );
```

## Performance Considerations

### Frontend Performance
- **Code Splitting**: Route-based code splitting with React Router
- **Lazy Loading**: Component-level lazy loading for heavy features
- **Memoization**: Strategic use of React.memo and useMemo
- **Debouncing**: Search and filter operations are debounced
- **Bundle Optimization**: Tree-shaking and dead code elimination

### Database Performance
- **Indexing**: Strategic indexes on frequently queried columns
- **Query Optimization**: Efficient joins and selective queries
- **Caching**: Supabase built-in query caching
- **Connection Pooling**: Managed by Supabase infrastructure

### Chart Performance
- **Data Sampling**: Large datasets are sampled for chart rendering
- **Virtualization**: Large lists use virtual scrolling
- **Lazy Chart Loading**: Charts loaded on-demand
- **Responsive Breakpoints**: Chart complexity reduces on mobile

## Scalability Architecture

### Horizontal Scaling
- **Stateless Frontend**: React app can be deployed to multiple CDN nodes
- **Database Scaling**: Supabase handles database scaling automatically
- **API Rate Limiting**: Built into Supabase infrastructure
- **Caching Strategy**: Multiple layers of caching

### Vertical Scaling
- **Component Reusability**: DRY principle reduces bundle size
- **Efficient Queries**: Minimize database round trips
- **Lazy Loading**: Features loaded on demand
- **Progressive Web App**: PWA capabilities for offline usage (future)

## Monitoring & Logging

### Frontend Monitoring
- **Error Boundaries**: Graceful error handling and reporting
- **Console Logging**: Structured logging for debugging
- **User Feedback**: Toast notifications for user actions
- **Performance Metrics**: Core Web Vitals tracking (future)

### Backend Monitoring
- **Supabase Dashboard**: Built-in monitoring and metrics
- **Database Logs**: Query performance and error tracking
- **API Analytics**: Request patterns and response times
- **Security Monitoring**: Authentication and authorization logs

## Deployment Architecture

### Development Environment
```
Local Dev → Vite Dev Server → Supabase Dev Instance
```

### Production Environment
```
Source Code → Build Process → Static CDN → Supabase Production
```

### CI/CD Pipeline (Recommended)
```
Git Push → Tests → Build → Deploy → Health Check → Rollback (if needed)
```

## Future Architecture Enhancements

### Planned Improvements
1. **Real-time Features**: WebSocket integration for live updates
2. **Caching Layer**: Redis integration for improved performance
3. **Mobile App**: React Native app sharing business logic
4. **Advanced Analytics**: Machine learning integration
5. **Multi-tenancy**: Support for multiple organizations
6. **Audit Trail**: Comprehensive change logging
7. **Data Export**: Advanced export formats (Excel, PDF)
8. **Backup Strategy**: Automated backup and recovery procedures

### Microservices Migration
For future scaling, the monolithic structure could be migrated to:
- **Authentication Service**: Dedicated auth microservice
- **Analytics Service**: Separate analytics processing
- **Notification Service**: Email and push notification handling
- **File Service**: Image and document management
- **Reporting Service**: Advanced report generation

This architecture provides a solid foundation for the current requirements while allowing for future growth and enhancement.