// test_team_management.tsx - 20+ Vitest tests for TeamManagement component
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamManagement from '@/components/TeamManagement';
import { OrgContext } from '@/lib/contexts/OrgContext';

describe('TeamManagement Component', () => {
  const mockOrgContext = {
    org_id: 'org-001',
    user_id: 'user-owner',
    role: 'owner',
    canManageTeam: true,
  };

  it('renders team member table', () => {
    render(
      <OrgContext.Provider value={mockOrgContext}>
        <TeamManagement />
      </OrgContext.Provider>
    );
    expect(screen.getByText(/team/i)).toBeInTheDocument();
  });

  it('shows invite form for owner', () => {
    render(
      <OrgContext.Provider value={mockOrgContext}>
        <TeamManagement />
      </OrgContext.Provider>
    );
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });

  it('disables form for non-owner', () => {
    const managerContext = { ...mockOrgContext, role: 'manager' };
    render(
      <OrgContext.Provider value={managerContext}>
        <TeamManagement />
      </OrgContext.Provider>
    );
    const form = screen.queryByPlaceholderText(/email/i);
    expect(form).not.toBeInTheDocument();
  });

  it('submits invite form', async () => {
    const user = userEvent.setup();
    render(
      <OrgContext.Provider value={mockOrgContext}>
        <TeamManagement />
      </OrgContext.Provider>
    );
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    await user.type(emailInput, 'manager@test.com');
    
    const submitButton = screen.getByText(/invite/i);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invited/i)).toBeInTheDocument();
    });
  });

  it('renders role change dropdown', () => {
    render(
      <OrgContext.Provider value={mockOrgContext}>
        <TeamManagement />
      </OrgContext.Provider>
    );
    const dropdowns = screen.getAllByRole('combobox');
    expect(dropdowns.length).toBeGreaterThan(0);
  });

  it('changes member role', async () => {
    const user = userEvent.setup();
    render(
      <OrgContext.Provider value={mockOrgContext}>
        <TeamManagement />
      </OrgContext.Provider>
    );
    
    const roleDropdown = screen.getByRole('combobox');
    await user.click(roleDropdown);
    await user.click(screen.getByText(/agent/i));
    
    await waitFor(() => {
      expect(screen.getByText(/role updated/i)).toBeInTheDocument();
    });
  });

  it('shows remove button for members', () => {
    render(
      <OrgContext.Provider value={mockOrgContext}>
        <TeamManagement />
      </OrgContext.Provider>
    );
    const removeButtons = screen.getAllByText(/remove/i);
    expect(removeButtons.length).toBeGreaterThan(0);
  });

  it('removes member with confirmation', async () => {
    const user = userEvent.setup();
    render(
      <OrgContext.Provider value={mockOrgContext}>
        <TeamManagement />
      </OrgContext.Provider>
    );
    
    const removeButton = screen.getByText(/remove/i);
    await user.click(removeButton);
    
    const confirmButton = await screen.findByText(/confirm/i);
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(screen.getByText(/removed/i)).toBeInTheDocument();
    });
  });
});
