# CRICKSTATS - Cricket Player Performance Tracking & Analytics System

A comprehensive web application for tracking and analyzing cricket player performance, built as a modern web implementation of the original Salesforce-based CRICKSTATS specification.

## 🏏 Overview

CRICKSTATS is a professional cricket performance management system that enables teams to track player statistics, analyze performance trends, and generate detailed reports. The application faithfully reproduces the functional requirements of the original Salesforce specification while providing a modern, responsive web experience.

## ✨ Features

### Core Functionality
- **Player Management**: Complete CRUD operations for player profiles with detailed statistics
- **Match Performance Tracking**: Record and manage individual match performances
- **Automatic Statistics Calculation**: Real-time roll-up statistics using database triggers
- **Role-Based Access Control**: ADMIN, MANAGER, COACH, and ANALYST user roles
- **Comprehensive Dashboard**: Live KPIs and interactive charts
- **Advanced Reports**: 7 different report types with filtering and CSV export
- **Analytics Dashboard**: Performance insights with multiple chart types
- **Global Search**: Real-time search across players and performances
- **Player Flow**: Team selection and player information display

### User Roles & Permissions

| Role | Permissions |
|------|------------|
| **ADMIN** | Full system access, user management, settings |
| **MANAGER** | Player management, performance entry, reports |
| **COACH** | Performance entry, reports, analytics |
| **ANALYST** | View access, reports, analytics, data export |

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Recharts** for data visualization
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **Lucide React** for icons

### Backend & Database
- **Supabase** (PostgreSQL) for database and authentication
- **Row Level Security (RLS)** for data protection
- **Database triggers** for automatic roll-up calculations
- **RESTful API** through Supabase client

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **PostCSS** and **Autoprefixer** for CSS processing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crickstats
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Execute the SQL in `src/lib/database-setup.sql` in your Supabase SQL editor
   - This creates tables, triggers, and RLS policies

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser

6. **Seed Sample Data** (Optional)
   - Sign up as the first user (becomes ADMIN)
   - Navigate to Settings → Database
   - Click "Add Sample Data" to populate with realistic cricket data

## 📊 Database Schema

### Core Tables

#### Players
- Complete player profiles with cricket-specific fields
- Automatic roll-up statistics calculation
- Referential integrity with match performances

#### Match Performances  
- Detailed match performance records
- Foreign key relationship to players
- Comprehensive validation constraints

#### Profiles
- User management and role assignments
- Integration with Supabase authentication

### Key Features
- **Automatic Roll-up Statistics**: Database triggers update player statistics
- **Data Validation**: Comprehensive constraints and business rule enforcement
- **Row Level Security**: User-based data access control

## 🎯 Core Workflows

### 1. Player Management
```
Login → Players → Add/Edit Player → Validation → Database Update → Statistics Recalculation
```

### 2. Performance Entry
```
Login → Match Performances → Select Player → Enter Stats → Validation → Roll-up Update
```

### 3. Analytics & Reporting
```
Login → Dashboard/Reports/Analytics → Filter Data → View Charts → Export CSV
```

### 4. Player Flow (Salesforce equivalent)
```
Dashboard → Select Team → View Player Information → Navigate to Details
```

## 🔒 Security

### Authentication & Authorization
- Supabase authentication with email/password
- Role-based access control (RBAC)
- Protected routes and API endpoints
- Session management and persistence

### Data Security
- Row Level Security (RLS) policies
- Input validation and sanitization
- SQL injection prevention
- XSS protection through React's built-in escaping

### Environment Security
- Environment variables for sensitive configuration
- No hardcoded secrets in codebase
- Gitignore for sensitive files

## 📈 Performance

### Optimization Features
- Database indexing on frequently queried fields
- Debounced search functionality
- Lazy loading and code splitting
- Optimized bundle size with Vite
- Efficient chart rendering with Recharts

### Monitoring
- Error boundaries for graceful error handling
- Console logging for debugging
- Performance metrics tracking
- User feedback through toast notifications

## 🧪 Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full sidebar navigation and multi-column layouts
- **Tablet**: Adaptive grid layouts and collapsible navigation
- **Mobile**: Drawer navigation and single-column layouts

## 🔄 Data Management

### Automatic Statistics
Player statistics are automatically calculated and updated using database triggers:
- Matches played
- Total runs, 4s, 6s, wickets
- Average score
- 50s and 100s count
- Fielding statistics

### Data Integrity
- Foreign key constraints
- Check constraints for business rules
- Referential integrity enforcement
- Cascade deletions where appropriate

## 📋 Reports Available

1. **Player Performance Report**: Comprehensive player statistics
2. **Match Performance Report**: Detailed match-by-match records
3. **Team Performance Report**: Aggregated team statistics  
4. **Batting Report**: Specialized batting analysis
5. **Bowling Report**: Bowling performance metrics
6. **Fielding Report**: Fielding statistics and dismissals
7. **Player Milestone Report**: Achievement tracking (50s, 100s, etc.)

## 🎨 UI/UX Features

### Design System
- Consistent color palette and typography
- Reusable component library
- Accessible design patterns
- Professional cricket-themed aesthetics

### User Experience
- Intuitive navigation and workflows
- Real-time feedback and validation
- Loading states and error handling
- Global search functionality
- Export capabilities for all reports

## 🏆 Salesforce Mapping

This web application implements the equivalent functionality of the original Salesforce CRICKSTATS specification:

| Salesforce Feature | Web Implementation |
|-------------------|-------------------|
| Custom Objects | Database Tables |
| Master-Detail Relationships | Foreign Keys |
| Roll-Up Summary Fields | Database Triggers |
| Screen Flows | Player Flow Component |
| Reports & Dashboards | Reports & Analytics Pages |
| Profiles & Permission Sets | Role-Based Access Control |

See `docs/salesforce-mapping.md` for detailed mapping information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review the inline code comments for implementation details

## 🙏 Acknowledgments

- Built as a web implementation of the original CRICKSTATS Salesforce specification
- Inspired by modern cricket analytics platforms
- Uses realistic cricket data for demonstration purposes (fictional player performances)

---

**Note**: This application contains fictional cricket statistics for demonstration purposes and should not be used as a source of real cricket data.


---

## 🎮 Demo Mode

**IMPORTANT:** This application runs in demo mode without requiring authentication.

- **No Login Required**: The application opens directly to the Dashboard
- **Demo User**: Automatically logged in as an ADMIN user with full access
- **All Features Available**: Full functionality without database authentication
- **Ideal for Testing**: Perfect for exploring features and testing functionality

To access the application, simply navigate to **http://localhost:3000/** in your browser.

## 📸 Player Photographs

Player profile images are included from licensed sources:

### Image Sources
- **Wikimedia Commons**: Professional cricket player photographs (CC-licensed)
  - MS Dhoni, Virat Kohli, Rohit Sharma, Jasprit Bumrah, and other international players
  - All images are properly attributed and used under Creative Commons licenses
  
- **Default Avatar**: SVG fallback for players without photographs
  - Located at `/images/default-avatar.svg`
  - Automatically used when image URLs fail to load or are unavailable

### Supported Players with Photos
The seed data includes real photographs for prominent international cricket players including:
- MS Dhoni (Chennai Super Kings)
- Virat Kohli (Royal Challengers Bangalore)
- Rohit Sharma (Mumbai Indians)
- Jasprit Bumrah (Mumbai Indians)
- Ravindra Jadeja (Chennai Super Kings)
- AB de Villiers (Royal Challengers Bangalore)
- Mohammed Siraj (Royal Challengers Bangalore)
- Rishabh Pant (Delhi Capitals)
- Kagiso Rabada (Delhi Capitals)
- Andre Russell (Kolkata Knight Riders)
- Jos Buttler (Rajasthan Royals)
- KL Rahul (Lucknow SuperGiants)
- Hardik Pandya (Gujarat Titans)
- Shubman Gill (Gujarat Titans)

### Image Attribution
All player photographs from Wikimedia Commons are used in compliance with their respective Creative Commons licenses. Original image sources and attributions are available through the Wikimedia Commons platform.

## 🚀 Quick Start (Updated)

### Prerequisites
- Node.js 18+ and npm
- **No database configuration required!** The app works immediately with localStorage

### Installation

1. **Navigate to the project directory**
   ```bash
   cd path/to/NM
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   - Navigate to **http://localhost:3000/**
   - Application will open directly to the Dashboard (no login required)
   - **44 players and 132+ match performances automatically populated!**

### Data Persistence

The application uses **localStorage** by default, which means:
- ✅ **No Supabase configuration required** - works immediately out of the box
- ✅ **44 real cricket players** automatically populated on first load
- ✅ **132-264 match performance records** with realistic statistics
- ✅ **Data persists across browser sessions** using localStorage
- ✅ **All CRUD operations work** - add, edit, delete players and performances
- ✅ **Statistics automatically calculated** from match performances

### Optional: Use Supabase Database (Advanced)

If you want to use Supabase instead of localStorage:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set up database**
   - Execute SQL from `src/lib/database-setup.sql` in Supabase SQL editor
   - This creates tables, triggers, and RLS policies

4. **Restart the application**
   ```bash
   npm run dev
   ```
   
   The app will automatically detect Supabase and use it instead of localStorage.

### Production Build

```bash
npm run build
npm run preview  # Preview production build
```

## 🎯 Usage

### Automatic Data Population
On first load, the application automatically:
- Creates **44 real cricket players** from international teams
- Generates **132-264 match performance records** (3-6 per player)
- Calculates aggregate statistics for each player
- Populates dashboard with live data
- Makes all reports and analytics functional immediately

**Note:** Data is stored in browser localStorage and persists across sessions. Clear browser data to reset.

### Included Players (44 total)
- **India**: MS Dhoni, Virat Kohli, Rohit Sharma, Jasprit Bumrah, Ravindra Jadeja, and 19 more
- **South Africa**: AB de Villiers, Kagiso Rabada, Quinton de Kock, Faf du Plessis, David Miller, Aiden Markram
- **Australia**: Glenn Maxwell, Marcus Stoinis, Pat Cummins
- **England**: Jos Buttler, Jonny Bairstow, Liam Livingstone, Ben Stokes
- **Pakistan**: Babar Azam, Mohammad Rizwan, Shaheen Afridi
- **West Indies**: Andre Russell, Sunil Narine
- **New Zealand**: Kane Williamson, Trent Boult
- **Afghanistan**: Rashid Khan

### Demo Mode Features
- **Instant Access**: No registration or login required
- **Full Admin Access**: All features and pages available
- **Populated Data**: 44 players and 100+ matches ready to explore
- **Persistent Storage**: Data saved in localStorage (survives page refresh)
- **Safe Testing**: Explore all features without authentication concerns

### Navigation
- **Dashboard**: Live statistics and team player flow with real data
- **Players**: Browse 44 players with photos, stats, and filtering
- **Match Performances**: View 132+ match records with detailed statistics
- **Reports**: Generate reports from actual match data
- **Analytics**: View performance insights with populated charts
- **Settings**: System information and database management (Admin only)

### Adding New Players
1. Navigate to the **Players** page
2. Click **"Add New Player"**
3. Fill in player details:
   - Personal information (name, number, date of birth)
   - Role and playing style
   - Team affiliation
   - Profile picture URL (optional)
4. Save to create the player

### Recording Match Performances
1. Go to **Match Performances** page
2. Click **"Add Performance"**
3. Select player and enter match details
4. Record batting, bowling, and fielding statistics
5. Save to update player roll-up statistics automatically

### Viewing Reports
1. Navigate to **Reports** page
2. Select report type:
   - Player Performance
   - Match Performance
   - Team Performance
   - Batting Statistics
   - Bowling Statistics
   - Fielding Statistics
   - Milestone Reports
3. Apply filters (team, role, category, date range)
4. Export to CSV for external analysis

## 📊 Data Information

### Real vs. Demo Data

**✅ REAL DATA (Verified):**
- Player names, teams, roles, nationalities - all from real cricketers
- Player photographs - from Wikimedia Commons (real photos where available)
- Batting/bowling styles - accurate for each player
- Team affiliations - current/recent IPL teams

**⚠️ DEMO DATA (Generated for demonstration):**
- Match performance statistics (runs, wickets, catches, etc.)
- Match dates, opponents, and results
- Aggregate statistics (total runs, averages, strike rates)
- Player of the match awards

The application generates realistic sample statistics for demonstration purposes. These statistics are clearly labeled as "DEMO DATA" in the seed data comments and should not be used as actual cricket statistics.

### Database Schema

### Tables
- **players**: Player profiles with roll-up statistics
- **match_performances**: Individual match performance records
- **profiles**: User profiles with role-based access (when using Supabase)

### localStorage Structure
When not using Supabase, data is stored in browser localStorage:
- `crickstats_players`: Array of player objects
- `crickstats_match_performances`: Array of match performance objects
- `crickstats_initialized`: Flag to prevent duplicate initialization

### Automatic Roll-up Statistics
Statistics are calculated in real-time from match performances:
- Total runs, wickets, catches, stumpings
- Matches played
- Average scores
- Highest score
- Strike rates and economy rates
- Fours and sixes

## 🔒 Security (Demo Mode)

In demo mode:
- **No authentication required** - instant access to all features
- **Demo user automatically provided** with ADMIN role
- **All CRUD operations available** without login
- **Data operations work normally** if database is configured
- **Safe for testing and demonstration** purposes

To enable full authentication:
1. Configure Supabase credentials in `.env`
2. Modify `src/contexts/AuthContext.tsx` to enable real authentication
3. Update `src/App.tsx` to restore login route
4. Rebuild the application

## 🐛 Known Features & Limitations

### Current Features
✅ **44 real cricket players** with names, teams, roles, and photographs
✅ **132-264 match performance records** automatically generated
✅ **localStorage persistence** - data survives browser refresh
✅ **All CRUD operations** - add, edit, delete players and performances
✅ **Dashboard with live statistics** from actual match data
✅ **Functional reports** with filtering and CSV export
✅ **Analytics charts** populated with real data
✅ **Global search** across players and performances
✅ **No login or database configuration required**

### Limitations
- Match statistics are **demo data** (generated for demonstration)
- Player photos require **internet connection** for external URLs
- Data stored in **browser localStorage** (cleared if browser data is cleared)
- **Large bundle size** due to included libraries (consider code splitting for production)
- **Settings page** user management requires Supabase configuration
- **No server-side persistence** without Supabase (localStorage only)

### To Enable Full Features with Supabase
1. Configure Supabase credentials in `.env`
2. Run database setup SQL in Supabase
3. Rebuild and restart the application
4. Enable authentication in `AuthContext.tsx` if desired

## 📝 License

This project implementation is provided as-is for educational and demonstration purposes.

Player photographs from Wikimedia Commons are used under their respective Creative Commons licenses with proper attribution.

---

**Built with ❤️ for Cricket Analytics**
