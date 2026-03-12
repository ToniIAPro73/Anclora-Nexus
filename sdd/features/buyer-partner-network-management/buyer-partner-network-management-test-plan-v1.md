# Test Plan · ANCLORA-BPNM-001

1. La red partner lista solo workspaces con admisión aceptada.
2. Buyer referrals se agregan desde `buyer_profiles`.
3. `PATCH /api/partners/network/{workspace_id}` persiste tier, trust y flags.
4. `/partner-network` permite revisar y editar un partner.

