import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Users, Trophy, Loader2 } from 'lucide-react'
import { playerService, matchPerformanceService } from '@/lib/dataService'
import { debounce } from '@/lib/utils'
import type { Player, MatchPerformance } from '@/types'

interface SearchResults {
  players: Player[]
  performances: MatchPerformance[]
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({ players: [], performances: [] })
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ players: [], performances: [] })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const [playersRes, performancesRes] = await Promise.all([
        playerService.getAll({ search: searchQuery }),
        matchPerformanceService.getAll({ search: searchQuery })
      ])

      setResults({
        players: playersRes.data?.slice(0, 5) || [],
        performances: performancesRes.data?.slice(0, 5) || []
      })
    } catch (error) {
      console.error('Search error:', error)
      setResults({ players: [], performances: [] })
    } finally {
      setLoading(false)
    }
  }, 300)

  useEffect(() => {
    if (query) {
      debouncedSearch(query)
    } else {
      setResults({ players: [], performances: [] })
    }
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleResultClick = (path: string) => {
    setIsOpen(false)
    setQuery('')
    navigate(path)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const totalResults = results.players.length + results.performances.length

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search players, teams, matches..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          ) : totalResults === 0 && query ? (
            <div className="p-4 text-center text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            <div className="py-2">
              {/* Players Section */}
              {results.players.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b">
                    Players ({results.players.length})
                  </div>
                  {results.players.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => handleResultClick(`/players/${player.id}`)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 group"
                    >
                      <div className="flex-shrink-0">
                        {player.profile_picture ? (
                          <img
                            src={player.profile_picture}
                            alt={player.player_name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                            {player.player_name}
                          </p>
                          {player.player_number && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              #{player.player_number}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {player.team} • {player.role}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                          <span>{player.matches_played} matches</span>
                          <span>{player.total_runs} runs</span>
                          <span>{player.total_wickets} wickets</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Match Performances Section */}
              {results.performances.length > 0 && (
                <div className={results.players.length > 0 ? 'border-t' : ''}>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b">
                    Match Performances ({results.performances.length})
                  </div>
                  {results.performances.map((performance) => (
                    <button
                      key={performance.id}
                      onClick={() => handleResultClick(`/match-performances`)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 group"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 truncate">
                            {performance.match_performance_name}
                          </p>
                          {performance.player_of_the_match && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                              ★ POM
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {performance.player?.player_name || 'Unknown Player'} • {performance.player?.team || 'Unknown Team'}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                          <span>{performance.runs_scored} runs</span>
                          <span>{performance.wickets_taken} wickets</span>
                          <span className={`
                            ${performance.match_result === 'WON' ? 'text-green-600' : 
                              performance.match_result === 'LOST' ? 'text-red-600' : 'text-yellow-600'}
                          `}>
                            {performance.match_result}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Show All Results Link */}
              {totalResults > 0 && (
                <div className="border-t p-2">
                  <Link
                    to={`/players?search=${encodeURIComponent(query)}`}
                    onClick={() => {
                      setIsOpen(false)
                      setQuery('')
                    }}
                    className="block w-full text-center py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View all results for "{query}"
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}