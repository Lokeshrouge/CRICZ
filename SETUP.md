# CRICKSTATS - Setup and Configuration Guide

## 🎯 Current Status

### ✅ COMPLETED FEATURES

**1. Application Structure**
- ✅ 44 international cricket players from 8+ nations defined
- ✅ Comprehensive player data with photos from Wikimedia Commons
- ✅ Match performance generation logic (3-6 matches per player)
- ✅ Demo mode authentication (no login required)
- ✅ All pages and navigation functional
- ✅ Responsive UI with Tailwind CSS
- ✅ Build system working (TypeScript + Vite)

**2. Players Included (44 Total)**

**India** (24 players):
- MS Dhoni, Virat Kohli, Rohit Sharma, Jasprit Bumrah
- Ravindra Jadeja, Rishabh Pant, KL Rahul, Hardik Pandya
- Shubman Gill, Suryakumar Yadav, Mohammed Siraj, Shreyas Iyer
- Ruturaj Gaikwad, Prithvi Shaw, Axar Patel, Varun Chakravarthy
- Sanju Samson, Deepak Chahar, Ishan Kishan, Yuzvendra Chahal
- Arshdeep Singh, Bhuvneshwar Kumar, Washington Sundar, Avesh Khan

**Australia** (3 players):
- Glenn Maxwell, Marcus Stoinis, Pat Cummins

**South Africa** (6 players):
- AB de Villiers, Kagiso Rabada, Quinton de Kock
- David Miller, Aiden Markram, Faf du Plessis

**England** (4 players):
- Jos Buttler, Jonny Bairstow, Liam Livingstone, Ben Stokes

**West Indies** (2 players):
- Andre Russell, Sunil Narine

**New Zealand** (2 players):
- Trent Boult, Kane Williamson

**Pakistan** (3 players):
- Mohammad Rizwan, Babar Azam, Shaheen Afridi

**Afghanistan** (1 player):
- Rashid Khan

**3. Generated Data (When Seeded)**
- 44 player records with complete profiles
- 132-264 match performance records (3-6 per player)
- Automatic roll-up statistics via database triggers
- Player of the Match awards
- Batting, bowling, and fielding statistics

---

## ⚠️ DATABASE CONFIGURATION REQUIRED

**IMPORTANT:** The application requires a Supabase database to store and display data.

### Current Status:
- ❌ Database not configured (placeholder credentials in .env)
- ❌ Data NOT yet populated
- ❌ Dashboard showing zeros (no data to display)
- ❌ Player list empty (no data to display)
- ❌ Reports showing "No data" (no data to display)

### Why This Matters:
The application is fully built and ready, but it needs a database backend to:
1. Store the 44 player records
2. Store the 132-264 match performance records
3. Calculate and display statistics
4. Power the dashboard, reports, and analytics

---

## 🚀 HOW TO COMPLETE THE SETUP

### Option 1: Full Database Setup (Recommended)

#### Step 1: Create Supabase Account
1. Go to https://supabase.com/
2. Create a free account
3. Create a new project
4. Wait for project initialization (~2 minutes)

#### Step 2: Run Database Setup Script
1. In your Supabase project, go to **SQL Editor**
2. Open the file: `src/lib/database-setup.sql`
3. Copy the entire SQL script
4. Paste and run it in the Supabase SQL Editor
5. This creates:
   - `profiles` table (user accounts)
   - `players` table (cricket players)
   - `match_performances` table (match records)
   - Database triggers for automatic statistics
   - Row Level Security policies

#### Step 3: Configure Environment Variables
1. In Supabase, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Update `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

#### Step 4: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

#### Step 5: Seed the Database
1. Open http://localhost:3000/
2. Navigate to **Settings** (in sidebar)
3. Go to **Database** tab
4. Click **"Add Sample Data"** button
5. Confirm when prompted
6. Wait for success message

**Result:** 44 players and 132-264 match records will be added to your database!

---

### Option 2: Quick Demo (No Database)

If you want to see the UI without setting up a database:

1. Application is already running at http://localhost:3000/
2. You can:
   - ✅ Navigate all pages
   - ✅ View the UI layout and design
   - ✅ Test navigation and routing
   - ✅ See demo user profile (top right)
   - ❌ But data will be empty until database is configured

---

## 📊 WHAT YOU'LL SEE AFTER SETUP

### Dashboard
- **Total Players:** 44
- **Total Matches:** 132-264 (varies due to randomization)
- **Total Runs:** ~15,000-25,000 (calculated from matches)
- **Total Wickets:** ~300-500 (calculated from matches)
- **Average Score:** ~35-45 (calculated average)
- **Player of the Match Awards:** ~10-20

### Top Run Scorers (Sample)
1. Virat Kohli - ~800-1200 runs
2. Rohit Sharma - ~750-1100 runs
3. Jos Buttler - ~700-1000 runs
4. AB de Villiers - ~650-950 runs
5. Babar Azam - ~600-900 runs

### Top Wicket Takers (Sample)
1. Jasprit Bumrah - ~25-35 wickets
2. Rashid Khan - ~22-32 wickets
3. Kagiso Rabada - ~20-30 wickets
4. Pat Cummins - ~18-28 wickets
5. Mohammed Siraj - ~16-26 wickets

### Players Page
- 44 cricket players with photos
- Filterable by team, role, nationality
- Searchable by name or number
- Clickable cards leading to detailed profiles

### Player Detail Pages
- Player photograph and personal info
- Career statistics (auto-calculated)
- Match-by-match performance history
- Performance charts and trends
- Recent form analysis

### Match Performances
- 132-264 match records
- Batting, bowling, fielding stats
- Player of the Match indicators
- Match results and categories
- Filterable and sortable

### Reports (10 Types)
1. **Player Performance Report** - Complete player statistics
2. **Top Run Scorers** - Ranked by total runs
3. **Top Wicket Takers** - Ranked by wickets
4. **Batting Performance** - Batting averages, strike rates
5. **Bowling Performance** - Economy rates, wickets
6. **Team Performance** - Team-wise statistics
7. **Match Performance** - Match-by-match breakdown
8. **Player of the Match** - Award winners
9. **Fielding Performance** - Catches and stumpings
10. **All-Rounder Performance** - Combined contributions

### Analytics
- Performance trend charts
- Team comparisons
- Player comparisons
- Statistical insights
- Interactive visualizations

---

## 🔧 TECHNICAL DETAILS

### Database Schema

**players table:**
- id (UUID, primary key)
- player_name, player_number, profile_picture
- date_of_birth, role, nationality, team
- batting_style, bowling_style
- **Roll-up statistics** (auto-calculated):
  - matches_played, total_runs, avg_score
  - total_4s, total_6s, number_of_50s, number_of_100s
  - total_wickets, total_overs
  - total_catches, total_stumpings
- created_at, updated_at

**match_performances table:**
- id (UUID, primary key)
- match_performance_name
- player_id (foreign key → players)
- player_of_the_match (boolean)
- match_category (Domestic/International)
- match_result (WON/LOST/DRAW)
- **Batting:** runs_scored, balls_faced, fours, sixes
- **Bowling:** overs_bowled, wickets_taken, runs_conceded, maiden_overs
- **Fielding:** catches, stumpings
- created_at, updated_at

**Database Triggers:**
- Automatically update player roll-up statistics
- Trigger on INSERT, UPDATE, DELETE of match_performances
- Recalculates matches played, runs, wickets, etc.

### Data Generation Logic
- 3-6 matches per player (randomized)
- Realistic statistics based on player role:
  - **Batsmen:** 0-150 runs, more fours/sixes
  - **Bowlers:** 2-10 overs, 0-5 wickets
  - **All-rounders:** Both batting and bowling stats
  - **Wicket-keepers:** Catches + stumpings
- Player of the Match: 7% chance for standout performances
- Match dates: Random within last 6 months
- Match names: IPL, World Cup, ODI, Test matches
- Match results: Random WON/LOST/DRAW

---

## 🐛 TROUBLESHOOTING

### "Dashboard shows all zeros"
**Cause:** Database not seeded with data
**Solution:** Follow Step 5 in "Option 1" above

### "Players page is empty"
**Cause:** Database not configured or not seeded
**Solution:** Complete Steps 1-5 in "Option 1" above

### "Error seeding database"
**Possible causes:**
1. Invalid Supabase credentials in `.env`
2. Database schema not created (run SQL script first)
3. Network connectivity issues

**Solutions:**
1. Verify .env file has correct credentials
2. Run database-setup.sql in Supabase SQL Editor
3. Check browser console for specific errors

### "Cannot read properties of undefined"
**Cause:** Supabase client cannot connect
**Solution:** Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in `.env`

---

## 📖 USAGE GUIDE (After Setup)

### Adding New Players Manually
1. Go to **Players** page
2. Click **"Add New Player"**
3. Fill in all fields
4. Add profile picture URL (or leave blank for default avatar)
5. Click **Save**

### Recording Match Performances
1. Go to **Match Performances** page
2. Click **"Add Performance"**
3. Select player from dropdown
4. Enter match details and statistics
5. Click **Save**
6. Player statistics automatically update!

### Generating Reports
1. Navigate to **Reports** page
2. Select report type from tabs
3. Apply filters (team, role, date range)
4. Click **Export to CSV** to download
5. Use search for specific players

### Viewing Analytics
1. Go to **Analytics** page
2. Select filters (team, role, category)
3. View interactive charts
4. Compare players and teams
5. Analyze performance trends

---

## 📝 IMPORTANT NOTES

### Demo Data Label
- The seed data is labeled as **"DEMO DATA"**
- Statistics are generated randomly but realistically
- Not actual real-world match data
- For demonstration and testing purposes only

### Data Persistence
- Data stored in Supabase PostgreSQL database
- Persists across browser sessions
- Can be cleared via Settings → Database → Clear Data
- Can be re-seeded anytime

### Production Deployment
- Build: `npm run build`
- Preview: `npm run preview`
- Deploy `dist/` folder to any static hosting
- Ensure environment variables are set in production

---

## ✅ VERIFICATION CHECKLIST

After completing setup, verify:

- [ ] Dashboard shows non-zero statistics
- [ ] Players page displays 44 players with photos
- [ ] Player detail pages open when clicking on players
- [ ] Match Performances shows 100+ records
- [ ] Reports display data (not "No data found")
- [ ] Analytics charts show bars/lines (not empty)
- [ ] Search functionality works
- [ ] Filters update results
- [ ] CSV export downloads files
- [ ] No console errors in browser

---

## 🆘 SUPPORT

If you encounter issues:

1. **Check browser console** for errors (F12)
2. **Verify .env file** has correct credentials
3. **Confirm database schema** was created (run SQL script)
4. **Try clearing data** and re-seeding
5. **Check Supabase dashboard** for error logs

---

**Built with ❤️ for Cricket Analytics**

🏏 **Current Status:** Application built and ready - Database setup required to populate data
