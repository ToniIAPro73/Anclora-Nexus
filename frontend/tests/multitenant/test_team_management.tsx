/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TeamManagement from '@/components/TeamManagement'
import { useOrgMembership } from '@/lib/hooks/useOrgMembership'
import { useTeamManagement } from '@/lib/hooks/useTeamManagement'

// Mock hooks
vi.mock('@/lib/hooks/useOrgMembership')
vi.mock('@/lib/hooks/useTeamManagement')
vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({ t: (key: string) => key })
}))

describe('TeamManagement Component', () => {
  const mockFetchMembers = vi.fn()
  const mockInviteMember = vi.fn()
  const mockChangeMemberRole = vi.fn()
  const mockRemoveMember = vi.fn()

  const defaultMembership = {
    canManageTeam: true,
    org_id: 'org-123',
    role: 'owner'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useOrgMembership as any).mockReturnValue(defaultMembership)
    ;(useTeamManagement as any).mockReturnValue({
      fetchMembers: mockFetchMembers,
      inviteMember: mockInviteMember,
      changeMemberRole: mockChangeMemberRole,
      removeMember: mockRemoveMember,
      loading: false
    })
    mockFetchMembers.mockResolvedValue([
      { id: '1', user_id: 'u1', role: 'owner', status: 'active' },
      { id: '2', user_id: 'u2', role: 'manager', status: 'active' },
      { id: '3', user_id: null, role: 'agent', status: 'pending' }
    ])
  })

  it('renders correctly for authorized owners', async () => {
    render(<TeamManagement />)
    expect(screen.getByText('3 Members')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('agent@anclora.es')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(4) // Header + 3 members
    })
  })

  it('restricts access for non-owners', () => {
    ;(useOrgMembership as any).mockReturnValue({ ...defaultMembership, canManageTeam: false })
    render(<TeamManagement />)
    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('agent@anclora.es')).not.toBeInTheDocument()
  })

  it('handles invitation submission', async () => {
    render(<TeamManagement />)
    const input = screen.getByPlaceholderText('agent@anclora.es')
    const button = screen.getByRole('button', { name: /invite/i })

    fireEvent.change(input, { target: { value: 'new@test.com' } })
    fireEvent.click(button)

    expect(mockInviteMember).toHaveBeenCalledWith('new@test.com', 'manager')
    await waitFor(() => {
      expect(screen.getByText(/Invitation sent/i)).toBeInTheDocument()
    })
  })

  it('handles role change', async () => {
    render(<TeamManagement />)
    await waitFor(() => screen.getByText('3 Members'))
    
    const roleSelects = screen.getAllByRole('combobox')
    fireEvent.change(roleSelects[1], { target: { value: 'agent' } })

    expect(mockChangeMemberRole).toHaveBeenCalledWith('2', 'agent')
  })

  it('handles member removal with confirmation', async () => {
    window.confirm = vi.fn(() => true)
    render(<TeamManagement />)
    await waitFor(() => screen.getByText('3 Members'))

    const removeButtons = screen.getAllByRole('button').filter((b: HTMLElement) => b.querySelector('svg.lucide-trash2'))
    fireEvent.click(removeButtons[0])

    expect(window.confirm).toHaveBeenCalled()
    expect(mockRemoveMember).toHaveBeenCalledWith('1')
  })

  it('shows loading state during action', () => {
    ;(useTeamManagement as any).mockReturnValue({
      fetchMembers: mockFetchMembers,
      inviteMember: mockInviteMember,
      loading: true
    })
    render(<TeamManagement />)
    const button = screen.getByRole('button', { name: /invite/i })
    expect(button).toBeDisabled()
  })
})
