import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Eye, Trash2, Download } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

import { playerService } from '@/lib/dataService'
import { playerSchema, type PlayerFormData } from '@/lib/validations'
import { useAuth } from '@/contexts/AuthContext'
import { debounce, exportToCSV, calculateAge } from '@/lib/utils'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'

import type { Player } from '@/types'
import { PLAYER_ROLES, BATTING_STYLES, BOWLING_STYLES, NATIONALITIES, TEAMS } from '@/types'

export function Players() {
  const { user } = useAuth()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    team: '',
    role: '',
    nationality: ''
  })

  const form = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      player_name: '',
      player_number: '',
      profile_picture: '',
      date_of_birth: '',
      role: undefined,
      batting_style: undefined,
      bowling_style: undefined,
      nationality: undefined,
      team: undefined
    }
  })

  const canWrite = user?.role && ['ADMIN', 'MANAGER'].includes(user.role)
  const canDelete = user?.role === 'ADMIN'

  useEffect(() => {
    loadPlayers()
  }, [filters])

  const loadPlayers = async () => {
    try {
      setLoading(true)
      const { data, error } = await playerService.getAll(filters)
      if (error) {
        toast.error('Failed to load players')
        console.error('Error loading players:', error)
      } else {
        setPlayers(data || [])
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: PlayerFormData) => {
    try {
      if (editingPlayer) {
        const { error } = await playerService.update(editingPlayer.id, data as any)
        if (error) {
          toast.error('Failed to update player')
          console.error('Error updating player:', error)
        } else {
          toast.success('Player updated successfully')
          setIsModalOpen(false)
          setEditingPlayer(null)
          form.reset()
          loadPlayers()
        }
      } else {
        const { error } = await playerService.create(data as any)
        if (error) {
          toast.error('Failed to create player')
          console.error('Error creating player:', error)
        } else {
          toast.success('Player created successfully')
          setIsModalOpen(false)
          form.reset()
          loadPlayers()
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    }
  }

  const handleEdit = (player: Player) => {
    setEditingPlayer(player)
    form.reset({
      player_name: player.player_name,
      player_number: player.player_number || '',
      profile_picture: player.profile_picture || '',
      date_of_birth: player.date_of_birth || '',
      role: player.role,
      batting_style: player.batting_style,
      bowling_style: player.bowling_style,
      nationality: player.nationality,
      team: player.team
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (player: Player) => {
    if (!confirm(`Are you sure you want to delete ${player.player_name}? This will also delete all their match performances.`)) {
      return
    }

    try {
      const { error } = await playerService.delete(player.id)
      if (error) {
        toast.error('Failed to delete player')
        console.error('Error deleting player:', error)
      } else {
        toast.success('Player deleted successfully')
        loadPlayers()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error:', error)
    }
  }

  const handleExport = () => {
    const exportData = players.map(player => ({
      Name: player.player_name,
      Number: player.player_number || '',
      Team: player.team,
      Role: player.role,
      'Batting Style': player.batting_style,
      'Bowling Style': player.bowling_style,
      Nationality: player.nationality,
      Age: player.date_of_birth ? calculateAge(player.date_of_birth) : '',
      'Matches Played': player.matches_played,
      'Total Runs': player.total_runs,
      'Average Score': player.avg_score,
      'Total Wickets': player.total_wickets,
      '50s': player.number_of_50s,
      '100s': player.number_of_100s,
      'Total 4s': player.total_4s,
      'Total 6s': player.total_6s,
      'Total Catches': player.total_catches,
      'Total Stumpings': player.total_stumpings
    }))
    exportToCSV(exportData, 'players')
  }

  const debouncedSearch = debounce((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value)
  }

  const openCreateModal = () => {
    setEditingPlayer(null)
    form.reset()
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Players</h1>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {canWrite && (
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Player
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
                placeholder="Search players..."
                className="pl-10 input"
                onChange={handleSearchChange}
              />
            </div>
            <Select
              options={TEAMS.map(team => ({ value: team, label: team }))}
              value={filters.team}
              onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
              placeholder="Filter by team"
            />
            <Select
              options={PLAYER_ROLES.map(role => ({ value: role, label: role }))}
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              placeholder="Filter by role"
            />
            <Select
              options={NATIONALITIES.map(nationality => ({ value: nationality, label: nationality }))}
              value={filters.nationality}
              onChange={(e) => setFilters(prev => ({ ...prev, nationality: e.target.value }))}
              placeholder="Filter by nationality"
            />
          </div>
          {(filters.search || filters.team || filters.role || filters.nationality) && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ search: '', team: '', role: '', nationality: '' })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Players Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No players found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>Matches</TableHead>
                    <TableHead>Runs</TableHead>
                    <TableHead>Avg</TableHead>
                    <TableHead>Wickets</TableHead>
                    <TableHead>50s/100s</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {player.profile_picture ? (
                            <img
                              src={player.profile_picture}
                              alt={`${player.player_name} profile photo`}
                              className="h-8 w-8 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/images/default-avatar.svg'
                              }}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 font-medium text-sm">
                                {player.player_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{player.player_name}</div>
                            <div className="text-sm text-gray-500">
                              {player.batting_style} • {player.bowling_style}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{player.player_number || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{player.team}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="info">{player.role}</Badge>
                      </TableCell>
                      <TableCell>{player.nationality}</TableCell>
                      <TableCell>{player.matches_played}</TableCell>
                      <TableCell>{player.total_runs}</TableCell>
                      <TableCell>{player.avg_score}</TableCell>
                      <TableCell>{player.total_wickets}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600">{player.number_of_50s}</span> / 
                          <span className="text-orange-600 ml-1">{player.number_of_100s}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Link to={`/players/${player.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {canWrite && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(player)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(player)}
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
          setEditingPlayer(null)
          form.reset()
        }}
        title={editingPlayer ? 'Edit Player' : 'Add New Player'}
        size="lg"
      >
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Player Name *"
              {...form.register('player_name')}
              error={form.formState.errors.player_name?.message}
            />
            <Input
              label="Player Number"
              {...form.register('player_number')}
              error={form.formState.errors.player_number?.message}
            />
            <Input
              label="Profile Picture URL"
              type="url"
              {...form.register('profile_picture')}
              error={form.formState.errors.profile_picture?.message}
            />
            <Input
              label="Date of Birth"
              type="date"
              {...form.register('date_of_birth')}
              error={form.formState.errors.date_of_birth?.message}
            />
            <Select
              label="Role *"
              options={PLAYER_ROLES.map(role => ({ value: role, label: role }))}
              {...form.register('role')}
              error={form.formState.errors.role?.message}
            />
            <Select
              label="Batting Style *"
              options={BATTING_STYLES.map(style => ({ value: style, label: style }))}
              {...form.register('batting_style')}
              error={form.formState.errors.batting_style?.message}
            />
            <Select
              label="Bowling Style *"
              options={BOWLING_STYLES.map(style => ({ value: style, label: style }))}
              {...form.register('bowling_style')}
              error={form.formState.errors.bowling_style?.message}
            />
            <Select
              label="Nationality *"
              options={NATIONALITIES.map(nationality => ({ value: nationality, label: nationality }))}
              {...form.register('nationality')}
              error={form.formState.errors.nationality?.message}
            />
            <div className="md:col-span-2">
              <Select
                label="Team *"
                options={TEAMS.map(team => ({ value: team, label: team }))}
                {...form.register('team')}
                error={form.formState.errors.team?.message}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setEditingPlayer(null)
                form.reset()
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={form.formState.isSubmitting}
            >
              {editingPlayer ? 'Update Player' : 'Create Player'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}