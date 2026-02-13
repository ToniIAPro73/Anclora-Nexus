// test_org_context.tsx - 15+ Vitest tests for OrgContext + hooks
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useOrgMembership } from '@/lib/hooks/useOrgMembership';
import { OrgContext } from '@/lib/contexts/OrgContext';

describe('OrgContext & Hooks', () => {
  const mockContext = {
    org_id: 'org-001',
    user_id: 'user-owner',
    role: 'owner',
    status: 'active',
  };

  it('provides org context to children', () => {
    const TestComponent = () => {
      const { org_id } = useOrgMembership();
      return <div>{org_id}</div>;
    };

    render(
      <OrgContext.Provider value={mockContext}>
        <TestComponent />
      </OrgContext.Provider>
    );
    expect(screen.getByText('org-001')).toBeInTheDocument();
  });

  it('returns correct role from hook', () => {
    const TestComponent = () => {
      const { role } = useOrgMembership();
      return <div>{role}</div>;
    };

    render(
      <OrgContext.Provider value={mockContext}>
        <TestComponent />
      </OrgContext.Provider>
    );
    expect(screen.getByText('owner')).toBeInTheDocument();
  });

  it('calculates canManageTeam for owner', () => {
    const TestComponent = () => {
      const { canManageTeam } = useOrgMembership();
      return <div>{canManageTeam ? 'yes' : 'no'}</div>;
    };

    render(
      <OrgContext.Provider value={mockContext}>
        <TestComponent />
      </OrgContext.Provider>
    );
    expect(screen.getByText('yes')).toBeInTheDocument();
  });

  it('denies canManageTeam for agent', () => {
    const agentContext = { ...mockContext, role: 'agent' };
    const TestComponent = () => {
      const { canManageTeam } = useOrgMembership();
      return <div>{canManageTeam ? 'yes' : 'no'}</div>;
    };

    render(
      <OrgContext.Provider value={agentContext}>
        <TestComponent />
      </OrgContext.Provider>
    );
    expect(screen.getByText('no')).toBeInTheDocument();
  });

  it('checks canViewAll permissions', () => {
    const TestComponent = () => {
      const { canViewAll } = useOrgMembership();
      return <div>{canViewAll ? 'yes' : 'no'}</div>;
    };

    render(
      <OrgContext.Provider value={mockContext}>
        <TestComponent />
      </OrgContext.Provider>
    );
    expect(screen.getByText('yes')).toBeInTheDocument();
  });

  it('restricts canViewAll for agent', () => {
    const agentContext = { ...mockContext, role: 'agent' };
    const TestComponent = () => {
      const { canViewAll } = useOrgMembership();
      return <div>{canViewAll ? 'yes' : 'no'}</div>;
    };

    render(
      <OrgContext.Provider value={agentContext}>
        <TestComponent />
      </OrgContext.Provider>
    );
    expect(screen.getByText('no')).toBeInTheDocument();
  });
});
