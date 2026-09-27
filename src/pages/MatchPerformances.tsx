import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Download, Trophy } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

import { matchPerformanceService, playerService } from '@/lib/dataService'
import { matchPerformanceSchema, type MatchPerformanceFormData } from '@/lib/validations'
import { useAuth } from '@/contexts/AuthContext'
import { debounce, exportToCSV, formatDate, calculateStrikeRate, calculateEconomy } from '@/lib/utils'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'

import type { MatchPerformance, Player } from '@/types'
import { MATCH_CATEGORIES, MATCH_RESULTS, TEAMS } from '@/types'

export function MatchPerformances() {
  const { user } = useAuth()
  const [performances, setPerformances] = useState<MatchPerformance[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPerformance, setEditingPerformance] = useState<MatchPerformance | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    playerTeam: '',
    matchCategory: '',
    matchResult: ''
  })

  const form = useForm<MatchPerformanceFormData>({
    resolver: zodResolver(matchPerformanceSchema),
    defaultValues: {
      match_performance_name: '',
      player_id: '',
      player_of_the_match: false,
      match_category: undefined,
      match_result: undefined,
      runs_scored: 0,
      balls_faced: 0,
      fours: 0,
      sixes: 0,
      overs_bowled: 0,
      wickets_taken: 0,
      runs_conceded: 0,
      maiden_overs: 0,
      stumpings: 0,
      catches: 0
    }
  })

  const canWrite = user?.role && ['ADMIN', 'MANAGER', 'COACH'].includes(user.role)
  const canDelete = user?.role === 'ADMIN'

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadPerformances()
  }, [filters])

  const loadInitialData = async () => {
    try {
      const [performancesRes, playersRes] = await Promise.all([
        matchPerformanceService.getAll(filters),
        playerService.getAll()
      ])

      if (performancesRes.error) {
        toast.error('Failed to load match performances')
        console.error('Error loading performances:', performancesRes.error)
      } else {
        setPerformances(performancesRes.data || [])
      }

      if (playersRes.error) {
        console.error('Error loading players:', playersRes.error)
      } else {
        setPlayers(playersRes.data || [])
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPerformances = async () => {
    try {
      setLoading(true)
      const { data, error } = await matchPerformanceService.getAll(filters)
      if (error) {
        toast.error('Failed to load match performances')
        console.error('Error loading performances:', error)
      } else {
        setPerformances(data || [])
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: MatchPerformanceFormData) => {
    try {
      if (editingPerformance) {
        const { error } = await matchPerformanceService.update(editingPerformance.id, data as any)
        if (error) {
          toast.error('Failed to update match performance')
          console.error('Error updating performance:', error)
        } else {
          toast.success('Match performance updated successfully')
          setIsModalOpen(false)
          setEditingPerformance(null)
          form.reset()
          loadPerformances()
        }
      } else {
        const { error } = await matchPerformanceService.create(data as any)
        if (error) {
          toast.error('Failed to create match performance')
          console.error('Error creating performance:', error)
        } else {
          toast.success('Match performance created successfully')
          setIsModalOpen(false)
          form.reset()
          loadPerformances()
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    }
  }

  const handleEdit = (performance: MatchPerformance) => {
    setEditingPerformance(performance)
    form.reset({
      match_performance_name: performance.match_performance_name,
      player_id: performance.player_id,
      player_of_the_match: performance.player_of_the_match,
      match_category: performance.match_category,
      match_result: performance.match_result,
      runs_scored: performance.runs_scored,
      balls_faced: performance.balls_faced,
      fours: performance.fours,
      sixes: performance.sixes,
      overs_bowled: performance.overs_bowled,
      wickets_taken: performance.wickets_taken,
      runs_conceded: performance.runs_conceded,
      maiden_overs: performance.maiden_overs,
      stumpings: performance.stumpings,
      catches: performance.catches
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (performance: MatchPerformance) => {
    if (!confirm(`Are you sure you want to delete the performance "${performance.match_performance_name}"?`)) {
      return
    }

    try {
      const { error } = await matchPerformanceService.delete(performance.id)
      if (error) {
        toast.error('Failed to delete match performance')
        console.error('Error deleting performance:', error)
      } else {
        toast.success('Match performance deleted successfully')
        loadPerformances()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    }
  }

  const handleExport = () => {
    const exportData = performances.map(performance => ({
      'Match': performance.match_performance_name,
      'Player': performance.player?.player_name || 'Unknown',
      'Team': performance.player?.team || 'Unknown',
      'Category': performance.match_category,
      'Result': performance.match_result,
      'Player of Match': performance.player_of_the_match ? 'Yes' : 'No',
      'Runs': performance.runs_scored,
      'Balls Faced': performance.balls_faced,
      'Fours': performance.fours,
      'Sixes': performance.sixes,
      'Strike Rate': calculateStrikeRate(performance.runs_scored, performance.balls_faced),
      'Overs Bowled': performance.overs_bowled,
      'Wickets': performance.wickets_taken,
      'Runs Conceded': performance.runs_conceded,
      'Maiden Overs': performance.maiden_overs,
      'Economy': calculateEconomy(performance.runs_conceded, performance.overs_bowled),
      'Catches': performance.catches,
      'Stumpings': performance.stumpings,
      'Date': formatDate(performance.created_at)
    }))
    exportToCSV(exportData, 'match-performances')
  }

  const debouncedSearch = debounce((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value)
  }

  const openCreateModal = () => {
    setEditingPerformance(null)
    form.reset()
    setIsModalOpen(true)
  }

  // Calculate performance summary for form preview
  const watchedValues = form.watch()
  const strikeRate = calculateStrikeRate(watchedValues.runs_scored || 0, watchedValues.balls_faced || 0)
  const economy = calculateEconomy(watchedValues.runs_conceded || 0, watchedValues.overs_bowled || 0)
  const boundaryRuns = ((watchedValues.fours || 0) * 4) + ((watchedValues.sixes || 0) * 6)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Match Performances</h1>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {canWrite && (
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Performance
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search matches..."
                className="pl-10 input"
                onChange={handleSearchChange}
              />
            </div>
            <Select
              options={TEAMS.map(team => ({ value: team, label: team }))}
              value={filters.playerTeam}
              onChange={(e) => setFilters(prev => ({ ...prev, playerTeam: e.target.value }))}
              placeholder="Filter by team"
            />
            <Select
              options={MATCH_CATEGORIES.map(category => ({ value: category, label: category }))}
              value={filters.matchCategory}
              onChange={(e) => setFilters(prev => ({ ...prev, matchCategory: e.target.value }))}
              placeholder="Filter by category"
            />
            <Select
              options={MATCH_RESULTS.map(result => ({ value: result, label: result }))}
              value={filters.matchResult}
              onChange={(e) => setFilters(prev => ({ ...prev, matchResult: e.target.value }))}
              placeholder="Filter by result"
            />
          </div>
          {(filters.search || filters.playerTeam || filters.matchCategory || filters.matchResult) && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ search: '', playerTeam: '', matchCategory: '', matchResult: '' })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performances Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : performances.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No match performances found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Batting</TableHead>
                    <TableHead>Bowling</TableHead>
                    <TableHead>Fielding</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performances.map((performance) => (
                    <TableRow key={performance.id}>
                      <TableCell>
                        <div className="font-medium">{performance.match_performance_name}</div>
                        {performance.player_of_the_match && (
                          <Badge variant="warning" className="mt-1">
                            <Trophy className="h-3 w-3 mr-1" />
                            Player of Match
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{performance.player?.player_name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{performance.player?.team || 'Unknown Team'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={performance.match_category === 'International' ? 'info' : 'default'}>
                          {performance.match_category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            performance.match_result === 'WON' ? 'success' :
                            performance.match_result === 'LOST' ? 'danger' : 'warning'
                          }
                        >
                          {performance.match_result}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{performance.runs_scored} runs ({performance.balls_faced} balls)</div>
                          <div className="text-gray-500">
                            {performance.fours} × 4, {performance.sixes} × 6
                          </div>
                          <div className="text-gray-500">
                            SR: {calculateStrikeRate(performance.runs_scored, performance.balls_faced)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {performance.wickets_taken > 0 ? (
                            <>
                              <div>{performance.wickets_taken}/{performance.runs_conceded} ({performance.overs_bowled} ov)</div>
                              <div className="text-gray-500">
                                Economy: {calculateEconomy(performance.runs_conceded, performance.overs_bowled)}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">No bowling</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(performance.catches > 0 || performance.stumpings > 0) ? (
                            <>
                              <div>Catches: {performance.catches}</div>
                              <div>Stumpings: {performance.stumpings}</div>
                            </>
                          ) : (
                            <span className="text-gray-400">No fielding</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(performance.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {canWrite && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(performance)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(performance)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingPerformance(null)
          form.reset()
        }}
        title={editingPerformance ? 'Edit Match Performance' : 'Add New Match Performance'}
        size="xl"
      >
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Match Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Match Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Match Performance Name *"
                  {...form.register('match_performance_name')}
                  error={form.formState.errors.match_performance_name?.message}
                />
              </div>
              <Select
                label="Player *"
                options={players.map(player => ({ 
                  value: player.id, 
                  label: `${player.player_name} (${player.team})` 
                }))}
                {...form.register('player_id')}
                error={form.formState.errors.player_id?.message}
              />
              <Select
                label="Match Category *"
                options={MATCH_CATEGORIES.map(category => ({ value: category, label: category }))}
                {...form.register('match_category')}
                error={form.formState.errors.match_category?.message}
              />
              <Select
                label="Match Result *"
                options={MATCH_RESULTS.map(result => ({ value: result, label: result }))}
                {...form.register('match_result')}
                error={form.formState.errors.match_result?.message}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="player_of_the_match"
                  {...form.register('player_of_the_match')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="player_of_the_match" className="text-sm font-medium text-gray-700">
                  Player of the Match
                </label>
              </div>
            </div>
          </div>

          {/* Batting Performance */}
          <div>
            <h3 className="text-lg font-medium mb-4">Batting Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="Runs Scored"
                type="number"
                min="0"
                {...form.register('runs_scored', { valueAsNumber: true })}
                error={form.formState.errors.runs_scored?.message}
              />
              <Input
                label="Balls Faced"
                type="number"
                min="0"
                {...form.register('balls_faced', { valueAsNumber: true })}
                error={form.formState.errors.balls_faced?.message}
              />
              <Input
                label="Fours"
                type="number"
                min="0"
                {...form.register('fours', { valueAsNumber: true })}
                error={form.formState.errors.fours?.message}
              />
              <Input
                label="Sixes"
                type="number"
                min="0"
                {...form.register('sixes', { valueAsNumber: true })}
                error={form.formState.errors.sixes?.message}
              />
            </div>
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Strike Rate:</span> {strikeRate} | 
                <span className="font-medium ml-2">Boundary Runs:</span> {boundaryRuns}/{watchedValues.runs_scored || 0}
              </p>
            </div>
          </div>

          {/* Bowling Performance */}
          <div>
            <h3 className="text-lg font-medium mb-4">Bowling Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="Overs Bowled"
                type="number"
                min="0"
                step="0.1"
                {...form.register('overs_bowled', { valueAsNumber: true })}
                error={form.formState.errors.overs_bowled?.message}
              />
              <Input
                label="Wickets Taken"
                type="number"
                min="0"
                max="10"
                {...form.register('wickets_taken', { valueAsNumber: true })}
                error={form.formState.errors.wickets_taken?.message}
              />
              <Input
                label="Runs Conceded"
                type="number"
                min="0"
                {...form.register('runs_conceded', { valueAsNumber: true })}
                error={form.formState.errors.runs_conceded?.message}
              />
              <Input
                label="Maiden Overs"
                type="number"
                min="0"
                step="0.1"
                {...form.register('maiden_overs', { valueAsNumber: true })}
                error={form.formState.errors.maiden_overs?.message}
              />
            </div>
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Economy Rate:</span> {economy}
              </p>
            </div>
          </div>

          {/* Fielding Performance */}
          <div>
            <h3 className="text-lg font-medium mb-4">Fielding Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Catches"
                type="number"
                min="0"
                {...form.register('catches', { valueAsNumber: true })}
                error={form.formState.errors.catches?.message}
              />
              <Input
                label="Stumpings"
                type="number"
                min="0"
                {...form.register('stumpings', { valueAsNumber: true })}
                error={form.formState.errors.stumpings?.message}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setEditingPerformance(null)
                form.reset()
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={form.formState.isSubmitting}
            >
              {editingPerformance ? 'Update Performance' : 'Create Performance'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}