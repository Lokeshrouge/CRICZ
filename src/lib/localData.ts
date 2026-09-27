// localStorage-based data persistence layer
// This allows the application to work without Supabase configuration

import { Player, MatchPerformance } from '../types'

const STORAGE_KEYS = {
  PLAYERS: 'crickstats_players',
  MATCH_PERFORMANCES: 'crickstats_match_performances',
  INITIALIZED: 'crickstats_initialized',
}

// Generate unique IDs
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Player seed data with photos
const seedPlayers = [
  // Chennai Super Kings (CSK)
  {
    player_name: 'MS Dhoni',
    player_number: '7',
    role: 'Batsman & Wicket Keeper',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'India',
    team: 'Chennai Super Kings (CSK)',
    date_of_birth: '1981-07-07',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/MS_Dhoni_2016_%28cropped%29.jpg/220px-MS_Dhoni_2016_%28cropped%29.jpg'
  },
  {
    player_name: 'Ravindra Jadeja',
    player_number: '8',
    role: 'All Rounder',
    batting_style: 'Left-Handed',
    bowling_style: 'Left-Arm Spin',
    nationality: 'India',
    team: 'Chennai Super Kings (CSK)',
    date_of_birth: '1988-12-06',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Ravindra_Jadeja_in_2018_%28cropped%29.jpg/220px-Ravindra_Jadeja_in_2018_%28cropped%29.jpg'
  },
  {
    player_name: 'Ruturaj Gaikwad',
    player_number: '31',
    role: 'Batsman',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'India',
    team: 'Chennai Super Kings (CSK)',
    date_of_birth: '1997-01-31',
    profile_picture: '/images/default-avatar.svg'
  },
  {
    player_name: 'Deepak Chahar',
    player_number: '90',
    role: 'Bowler',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Fast',
    nationality: 'India',
    team: 'Chennai Super Kings (CSK)',
    date_of_birth: '1992-08-07',
    profile_picture: '/images/default-avatar.svg'
  },
  
  // Mumbai Indians (MI)
  {
    player_name: 'Rohit Sharma',
    player_number: '45',
    role: 'Batsman',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'India',
    team: 'Mumbai Indians (MI)',
    date_of_birth: '1987-04-30',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Rohit_Gurunath_Sharma.jpg/220px-Rohit_Gurunath_Sharma.jpg'
  },
  {
    player_name: 'Jasprit Bumrah',
    player_number: '93',
    role: 'Bowler',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Fast',
    nationality: 'India',
    team: 'Mumbai Indians (MI)',
    date_of_birth: '1993-12-06',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Jasprit_Bumrah_in_2018_%28cropped%29.jpg/220px-Jasprit_Bumrah_in_2018_%28cropped%29.jpg'
  },
  {
    player_name: 'Suryakumar Yadav',
    player_number: '63',
    role: 'Batsman',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'India',
    team: 'Mumbai Indians (MI)',
    date_of_birth: '1990-09-14',
    profile_picture: '/images/default-avatar.svg'
  },
  {
    player_name: 'Ishan Kishan',
    player_number: '23',
    role: 'Batsman & Wicket Keeper',
    batting_style: 'Left-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'India',
    team: 'Mumbai Indians (MI)',
    date_of_birth: '1998-07-18',
    profile_picture: '/images/default-avatar.svg'
  },

  // Royal Challengers Bangalore (RCB)
  {
    player_name: 'Virat Kohli',
    player_number: '18',
    role: 'Batsman',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'India',
    team: 'Royal Challengers Bangalore (RCB)',
    date_of_birth: '1988-11-05',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg/220px-Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg'
  },
  {
    player_name: 'AB de Villiers',
    player_number: '17',
    role: 'Batsman & Wicket Keeper',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'South Africa',
    team: 'Royal Challengers Bangalore (RCB)',
    date_of_birth: '1984-02-17',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/AB_de_Villiers_in_2018.jpg/220px-AB_de_Villiers_in_2018.jpg'
  },
  {
    player_name: 'Mohammed Siraj',
    player_number: '13',
    role: 'Bowler',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Fast',
    nationality: 'India',
    team: 'Royal Challengers Bangalore (RCB)',
    date_of_birth: '1994-03-13',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Mohammed_Siraj_%28cropped%29.jpg/220px-Mohammed_Siraj_%28cropped%29.jpg'
  },
  {
    player_name: 'Glenn Maxwell',
    player_number: '32',
    role: 'All Rounder',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Spin',
    nationality: 'Australia',
    team: 'Royal Challengers Bangalore (RCB)',
    date_of_birth: '1988-10-14',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Glenn_Maxwell.jpg/220px-Glenn_Maxwell.jpg'
  },

  // Delhi Capitals (DC)
  {
    player_name: 'Rishabh Pant',
    player_number: '17',
    role: 'Batsman & Wicket Keeper',
    batting_style: 'Left-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'India',
    team: 'Delhi Capitals (DC)',
    date_of_birth: '1997-10-04',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Rishabh_Pant_at_Femina_Miss_India_2018.jpg/220px-Rishabh_Pant_at_Femina_Miss_India_2018.jpg'
  },
  {
    player_name: 'Prithvi Shaw',
    player_number: '41',
    role: 'Batsman',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'India',
    team: 'Delhi Capitals (DC)',
    date_of_birth: '1999-11-09',
    profile_picture: '/images/default-avatar.svg'
  },
  {
    player_name: 'Kagiso Rabada',
    player_number: '25',
    role: 'Bowler',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Fast',
    nationality: 'South Africa',
    team: 'Delhi Capitals (DC)',
    date_of_birth: '1995-05-25',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Kagiso_Rabada_%28cropped%29.jpg/220px-Kagiso_Rabada_%28cropped%29.jpg'
  },
  {
    player_name: 'Axar Patel',
    player_number: '20',
    role: 'All Rounder',
    batting_style: 'Left-Handed',
    bowling_style: 'Left-Arm Spin',
    nationality: 'India',
    team: 'Delhi Capitals (DC)',
    date_of_birth: '1994-01-20',
    profile_picture: '/images/default-avatar.svg'
  },

  // Kolkata Knight Riders (KKR)
  {
    player_name: 'Shreyas Iyer',
    player_number: '41',
    role: 'Batsman',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'India',
    team: 'Kolkata Knight Riders (KKR)',
    date_of_birth: '1994-12-06',
    profile_picture: '/images/default-avatar.svg'
  },
  {
    player_name: 'Andre Russell',
    player_number: '12',
    role: 'All Rounder',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Fast',
    nationality: 'West Indies',
    team: 'Kolkata Knight Riders (KKR)',
    date_of_birth: '1988-04-29',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Andre_Russell_%28cropped%29.jpg/220px-Andre_Russell_%28cropped%29.jpg'
  },
  {
    player_name: 'Sunil Narine',
    player_number: '74',
    role: 'All Rounder',
    batting_style: 'Left-Handed',
    bowling_style: 'Right-Arm Spin',
    nationality: 'West Indies',
    team: 'Kolkata Knight Riders (KKR)',
    date_of_birth: '1988-05-26',
    profile_picture: '/images/default-avatar.svg'
  },
  {
    player_name: 'Varun Chakravarthy',
    player_number: '29',
    role: 'Bowler',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Spin',
    nationality: 'India',
    team: 'Kolkata Knight Riders (KKR)',
    date_of_birth: '1991-08-28',
    profile_picture: '/images/default-avatar.svg'
  },

  // Rajasthan Royals (RR)
  {
    player_name: 'Sanju Samson',
    player_number: '9',
    role: 'Batsman & Wicket Keeper',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'India',
    team: 'Rajasthan Royals (RR)',
    date_of_birth: '1994-11-11',
    profile_picture: '/images/default-avatar.svg'
  },
  {
    player_name: 'Jos Buttler',
    player_number: '63',
    role: 'Batsman & Wicket Keeper',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'England',
    team: 'Rajasthan Royals (RR)',
    date_of_birth: '1990-09-08',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Jos_Buttler_in_2018.jpg/220px-Jos_Buttler_in_2018.jpg'
  },
  {
    player_name: 'Yuzvendra Chahal',
    player_number: '22',
    role: 'Bowler',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Spin',
    nationality: 'India',
    team: 'Rajasthan Royals (RR)',
    date_of_birth: '1990-07-23',
    profile_picture: '/images/default-avatar.svg'
  },
  {
    player_name: 'Trent Boult',
    player_number: '18',
    role: 'Bowler',
    batting_style: 'Left-Handed',
    bowling_style: 'Left-Arm Fast',
    nationality: 'New Zealand',
    team: 'Rajasthan Royals (RR)',
    date_of_birth: '1989-07-22',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Trent_Boult_2015_%28cropped%29.jpg/220px-Trent_Boult_2015_%28cropped%29.jpg'
  },

  // Lucknow SuperGiants (LSG)
  {
    player_name: 'KL Rahul',
    player_number: '1',
    role: 'Batsman & Wicket Keeper',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'India',
    team: 'Lucknow SuperGiants (LSG)',
    date_of_birth: '1992-04-18',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/KL_Rahul_%28cropped%29.jpg/220px-KL_Rahul_%28cropped%29.jpg'
  },
  {
    player_name: 'Marcus Stoinis',
    player_number: '32',
    role: 'All Rounder',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Fast',
    nationality: 'Australia',
    team: 'Lucknow SuperGiants (LSG)',
    date_of_birth: '1989-08-16',
    profile_picture: '/images/default-avatar.svg'
  },
  {
    player_name: 'Quinton de Kock',
    player_number: '14',
    role: 'Batsman & Wicket Keeper',
    batting_style: 'Left-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'South Africa',
    team: 'Lucknow SuperGiants (LSG)',
    date_of_birth: '1992-12-17',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Quinton_de_Kock_%28cropped%29.jpg/220px-Quinton_de_Kock_%28cropped%29.jpg'
  },
  {
    player_name: 'Avesh Khan',
    player_number: '9',
    role: 'Bowler',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Fast',
    nationality: 'India',
    team: 'Lucknow SuperGiants (LSG)',
    date_of_birth: '1996-12-13',
    profile_picture: '/images/default-avatar.svg'
  },

  // Gujarat Titans (GT)
  {
    player_name: 'Hardik Pandya',
    player_number: '33',
    role: 'All Rounder',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Fast',
    nationality: 'India',
    team: 'Gujarat Titans (GT)',
    date_of_birth: '1993-10-11',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Hardik_Pandya.jpg/220px-Hardik_Pandya.jpg'
  },
  {
    player_name: 'Shubman Gill',
    player_number: '77',
    role: 'Batsman',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'India',
    team: 'Gujarat Titans (GT)',
    date_of_birth: '1999-09-08',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Shubman_Gill_in_2023.jpg/220px-Shubman_Gill_in_2023.jpg'
  },
  {
    player_name: 'Rashid Khan',
    player_number: '19',
    role: 'Bowler',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Spin',
    nationality: 'Afghanistan',
    team: 'Gujarat Titans (GT)',
    date_of_birth: '1998-09-20',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Rashid_Khan_in_2018_%28cropped%29.jpg/220px-Rashid_Khan_in_2018_%28cropped%29.jpg'
  },
  {
    player_name: 'David Miller',
    player_number: '9',
    role: 'Batsman',
    batting_style: 'Left-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'South Africa',
    team: 'Gujarat Titans (GT)',
    date_of_birth: '1989-06-10',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/David_Miller_%28cropped%29.jpg/220px-David_Miller_%28cropped%29.jpg'
  },

  // Punjab Kings (PBKS)
  {
    player_name: 'Shikhar Dhawan',
    player_number: '25',
    role: 'Batsman',
    batting_style: 'Left-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'India',
    team: 'Punjab Kings (PBKS)',
    date_of_birth: '1985-12-05',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Shikhar_Dhawan_in_2018_%28cropped%29.jpg/220px-Shikhar_Dhawan_in_2018_%28cropped%29.jpg'
  },
  {
    player_name: 'Arshdeep Singh',
    player_number: '2',
    role: 'Bowler',
    batting_style: 'Left-Handed',
    bowling_style: 'Left-Arm Fast',
    nationality: 'India',
    team: 'Punjab Kings (PBKS)',
    date_of_birth: '1999-02-05',
    profile_picture: '/images/default-avatar.svg'
  },
  {
    player_name: 'Jonny Bairstow',
    player_number: '21',
    role: 'Batsman & Wicket Keeper',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'England',
    team: 'Punjab Kings (PBKS)',
    date_of_birth: '1989-09-26',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Jonny_Bairstow_at_Trent_Bridge%2C_August_2018_%28cropped%29.jpg/220px-Jonny_Bairstow_at_Trent_Bridge%2C_August_2018_%28cropped%29.jpg'
  },
  {
    player_name: 'Liam Livingstone',
    player_number: '32',
    role: 'All Rounder',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Spin',
    nationality: 'England',
    team: 'Punjab Kings (PBKS)',
    date_of_birth: '1993-08-04',
    profile_picture: '/images/default-avatar.svg'
  },

  // Sunrisers Hyderabad (SRH)
  {
    player_name: 'Kane Williamson',
    player_number: '22',
    role: 'Batsman',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'New Zealand',
    team: 'Sunrisers Hyderabad (SRH)',
    date_of_birth: '1990-08-08',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Kane_Williamson_in_2023.jpg/220px-Kane_Williamson_in_2023.jpg'
  },
  {
    player_name: 'Bhuvneshwar Kumar',
    player_number: '15',
    role: 'Bowler',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Fast',
    nationality: 'India',
    team: 'Sunrisers Hyderabad (SRH)',
    date_of_birth: '1990-02-05',
    profile_picture: '/images/default-avatar.svg'
  },
  {
    player_name: 'Washington Sundar',
    player_number: '10',
    role: 'All Rounder',
    batting_style: 'Left-Handed',
    bowling_style: 'Right-Arm Spin',
    nationality: 'India',
    team: 'Sunrisers Hyderabad (SRH)',
    date_of_birth: '1999-10-05',
    profile_picture: '/images/default-avatar.svg'
  },
  {
    player_name: 'Aiden Markram',
    player_number: '28',
    role: 'Batsman',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Spin',
    nationality: 'South Africa',
    team: 'Sunrisers Hyderabad (SRH)',
    date_of_birth: '1994-10-04',
    profile_picture: '/images/default-avatar.svg'
  },

  // International Players - Additional Stars
  {
    player_name: 'Ben Stokes',
    player_number: '55',
    role: 'All Rounder',
    batting_style: 'Left-Handed',
    bowling_style: 'Right-Arm Fast',
    nationality: 'England',
    team: 'Chennai Super Kings (CSK)',
    date_of_birth: '1991-06-04',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Ben_Stokes_in_2023.jpg/220px-Ben_Stokes_in_2023.jpg'
  },
  {
    player_name: 'Pat Cummins',
    player_number: '30',
    role: 'Bowler',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Fast',
    nationality: 'Australia',
    team: 'Kolkata Knight Riders (KKR)',
    date_of_birth: '1993-05-08',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Pat_Cummins_in_2023.jpg/220px-Pat_Cummins_in_2023.jpg'
  },
  {
    player_name: 'Faf du Plessis',
    player_number: '19',
    role: 'Batsman',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'South Africa',
    team: 'Royal Challengers Bangalore (RCB)',
    date_of_birth: '1984-07-13',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Faf_du_Plessis_in_2023.jpg/220px-Faf_du_Plessis_in_2023.jpg'
  },
  {
    player_name: 'Mohammad Rizwan',
    player_number: '39',
    role: 'Batsman & Wicket Keeper',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'Pakistan',
    team: 'Punjab Kings (PBKS)',
    date_of_birth: '1992-06-01',
    profile_picture: '/images/default-avatar.svg'
  },
  {
    player_name: 'Babar Azam',
    player_number: '56',
    role: 'Batsman',
    batting_style: 'Right-Handed',
    bowling_style: 'Right-Arm Medium',
    nationality: 'Pakistan',
    team: 'Rajasthan Royals (RR)',
    date_of_birth: '1994-10-15',
    profile_picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Babar_Azam_2023.jpg/220px-Babar_Azam_2023.jpg'
  },
  {
    player_name: 'Shaheen Afridi',
    player_number: '10',
    role: 'Bowler',
    batting_style: 'Left-Handed',
    bowling_style: 'Left-Arm Fast',
    nationality: 'Pakistan',
    team: 'Delhi Capitals (DC)',
    date_of_birth: '2000-04-06',
    profile_picture: '/images/default-avatar.svg'
  }
]

// Helper functions
const getRandomOpponent = (team: string): string => {
  const teams = [
    'Chennai Super Kings (CSK)', 'Delhi Capitals (DC)', 'Kolkata Knight Riders (KKR)',
    'Mumbai Indians (MI)', 'Punjab Kings (PBKS)', 'Rajasthan Royals (RR)',
    'Royal Challengers Bangalore (RCB)', 'Sunrisers Hyderabad (SRH)',
    'Gujarat Titans (GT)', 'Lucknow SuperGiants (LSG)'
  ]
  
  const opponents = teams.filter(t => t !== team)
  return opponents[Math.floor(Math.random() * opponents.length)]
}

const getRandomDate = (): Date => {
  // Generate dates within the last 6 months
  const start = new Date()
  start.setMonth(start.getMonth() - 6)
  const end = new Date()
  
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Generate match performances for players
const generateMatchPerformances = (players: any[]): any[] => {
  const performances: any[] = []
  const matchNames = [
    'IPL 2024 - Match 1', 'IPL 2024 - Match 2', 'IPL 2024 - Match 3', 'IPL 2024 - Match 4',
    'IPL 2024 - Match 5', 'T20 World Cup - Group Stage', 'T20 World Cup - Quarter Final',
    'ODI Series - Match 1', 'ODI Series - Match 2', 'Test Match - Day 1', 'Test Match - Day 2',
    'Champions Trophy - Final', 'Asia Cup - Semi Final', 'Bilateral Series - Match 1',
    'Bilateral Series - Match 2', 'Warm-up Match', 'Practice Match', 'League Match - Round 1',
    'League Match - Round 2', 'Playoff Match - Qualifier 1', 'Playoff Match - Qualifier 2',
    'Eliminator Match', 'Final Match', 'Super Over Match', 'Rain Affected Match'
  ]
  
  const categories = ['Domestic', 'International']
  const results = ['WON', 'LOST', 'DRAW']

  players.forEach((player) => {
    // Generate 3-6 performances per player for better statistics
    const performanceCount = Math.floor(Math.random() * 4) + 3
    
    for (let i = 0; i < performanceCount; i++) {
      const isBatsman = player.role.includes('Batsman') || player.role === 'All Rounder'
      const isBowler = player.role.includes('Bowler') || player.role === 'All Rounder'
      const isWicketKeeper = player.role.includes('Wicket Keeper')
      
      // Generate batting performance
      const runs = isBatsman ? Math.floor(Math.random() * 150) : Math.floor(Math.random() * 30)
      const balls = runs > 0 ? Math.max(runs + Math.floor(Math.random() * 50), runs) : 0
      const fours = runs > 20 ? Math.floor(Math.random() * Math.min(runs / 4, 15)) : 0
      const sixes = runs > 40 ? Math.floor(Math.random() * Math.min(runs / 6, 8)) : 0
      
      // Generate bowling performance
      const overs = isBowler ? Math.round((Math.random() * 10 + 2) * 2) / 2 : 0 // 0.5 increments
      const wickets = overs > 0 ? Math.floor(Math.random() * Math.min(overs, 5)) : 0
      const runsConceded = overs > 0 ? Math.floor(overs * (Math.random() * 8 + 4)) : 0 // 4-12 economy
      const maidens = overs > 2 ? Math.floor(Math.random() * Math.min(overs / 3, 2)) : 0
      
      // Generate fielding performance
      const catches = Math.floor(Math.random() * 3) // 0-2 catches
      const stumpings = isWicketKeeper ? Math.floor(Math.random() * 2) : 0 // 0-1 stumpings for keepers
      
      // Determine if player of the match (7% chance for good performances)
      const isPlayerOfMatch = (runs > 70 || wickets >= 3) && Math.random() < 0.07
      
      performances.push({
        id: generateId(),
        match_performance_name: matchNames[Math.floor(Math.random() * matchNames.length)] + ` vs ${getRandomOpponent(player.team)}`,
        player_id: player.id,
        player_of_the_match: isPlayerOfMatch,
        match_category: categories[Math.floor(Math.random() * categories.length)],
        match_result: results[Math.floor(Math.random() * results.length)],
        runs_scored: runs,
        balls_faced: balls,
        fours: fours,
        sixes: sixes,
        overs_bowled: overs,
        wickets_taken: wickets,
        runs_conceded: runsConceded,
        maiden_overs: maidens,
        stumpings: stumpings,
        catches: catches,
        created_at: getRandomDate().toISOString()
      })
    }
  })
  
  return performances
}

// Initialize data on first load
export const initializeData = (): void => {
  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED)
  
  if (!initialized) {
    console.log('Initializing CRICKSTATS data...')
    
    // Create players with IDs
    const players = seedPlayers.map(p => ({
      ...p,
      id: generateId(),
      created_at: new Date().toISOString()
    }))
    
    // Generate match performances
    const performances = generateMatchPerformances(players)
    
    // Store in localStorage
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players))
    localStorage.setItem(STORAGE_KEYS.MATCH_PERFORMANCES, JSON.stringify(performances))
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true')
    
    console.log(`Initialized ${players.length} players and ${performances.length} match performances`)
  }
}

// Get all players
export const getPlayers = (): Player[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PLAYERS)
  return data ? JSON.parse(data) : []
}

// Get player by ID
export const getPlayerById = (id: string): Player | null => {
  const players = getPlayers()
  return players.find(p => p.id === id) || null
}

// Get all match performances
export const getMatchPerformances = (): MatchPerformance[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MATCH_PERFORMANCES)
  return data ? JSON.parse(data) : []
}

// Get match performances by player ID
export const getMatchPerformancesByPlayerId = (playerId: string): MatchPerformance[] => {
  const performances = getMatchPerformances()
  return performances.filter(p => p.player_id === playerId)
}

// Add a new player
export const addPlayer = (player: Omit<Player, 'id' | 'created_at'>): Player => {
  const players = getPlayers()
  const newPlayer: Player = {
    ...player,
    id: generateId(),
    created_at: new Date().toISOString()
  } as Player
  
  players.push(newPlayer)
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players))
  return newPlayer
}

// Update a player
export const updatePlayer = (id: string, updates: Partial<Player>): Player | null => {
  const players = getPlayers()
  const index = players.findIndex(p => p.id === id)
  
  if (index === -1) return null
  
  players[index] = { ...players[index], ...updates }
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players))
  return players[index]
}

// Delete a player
export const deletePlayer = (id: string): boolean => {
  const players = getPlayers()
  const filtered = players.filter(p => p.id !== id)
  
  if (filtered.length === players.length) return false
  
  // Also delete related match performances
  const performances = getMatchPerformances()
  const filteredPerformances = performances.filter(p => p.player_id !== id)
  
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(filtered))
  localStorage.setItem(STORAGE_KEYS.MATCH_PERFORMANCES, JSON.stringify(filteredPerformances))
  return true
}

// Add a new match performance
export const addMatchPerformance = (performance: Omit<MatchPerformance, 'id' | 'created_at'>): MatchPerformance => {
  const performances = getMatchPerformances()
  const newPerformance: MatchPerformance = {
    ...performance,
    id: generateId(),
    created_at: new Date().toISOString()
  } as MatchPerformance
  
  performances.push(newPerformance)
  localStorage.setItem(STORAGE_KEYS.MATCH_PERFORMANCES, JSON.stringify(performances))
  return newPerformance
}

// Update a match performance
export const updateMatchPerformance = (id: string, updates: Partial<MatchPerformance>): MatchPerformance | null => {
  const performances = getMatchPerformances()
  const index = performances.findIndex(p => p.id === id)
  
  if (index === -1) return null
  
  performances[index] = { ...performances[index], ...updates }
  localStorage.setItem(STORAGE_KEYS.MATCH_PERFORMANCES, JSON.stringify(performances))
  return performances[index]
}

// Delete a match performance
export const deleteMatchPerformance = (id: string): boolean => {
  const performances = getMatchPerformances()
  const filtered = performances.filter(p => p.id !== id)
  
  if (filtered.length === performances.length) return false
  
  localStorage.setItem(STORAGE_KEYS.MATCH_PERFORMANCES, JSON.stringify(filtered))
  return true
}

// Clear all data (for testing)
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.PLAYERS)
  localStorage.removeItem(STORAGE_KEYS.MATCH_PERFORMANCES)
  localStorage.removeItem(STORAGE_KEYS.INITIALIZED)
}
