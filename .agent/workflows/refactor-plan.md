# Refactoring Plan - Inbox Money Vault

## Goals
- Clean up code without changing UI.
- Improve performance and organization.
- Optimize for Supabase backend integration.
- Standardize patterns and types.

## Tasks

### 1. Preparation & Standards
- [ ] Audit all pages for common patterns.
- [ ] Audit `src/components/ui` for consistency.
- [ ] Standardize the Supabase client usage across the app.

### 2. Infrastructure Layer
- [ ] Create a `useSupabase` hook for easy access to the client.
- [ ] Create a `useAuth` hook to manage user session state.
- [ ] Create domain-specific hooks:
    - [ ] `useLeads`: Fetching, allocating, and updating leads.
    - [ ] `useUsageLimit`: Tracking daily limits.
    - [ ] `useOffers`: CRUD for offers.

### 3. Component Refactoring
- [ ] Create a `PageContainer` component for consistent layout/spacing/animations.
- [ ] Create a `PageHeader` component to handle title, description, and tooltips.
- [ ] Create a `LoadingState` component.
- [ ] Refactor existing UI components in `src/components/ui` to ensure they follow best practices.

### 4. Page Refactoring
- [ ] **Dashboard (`/dashboard`)**: Extract logic into `useUsageLimit` and use shared components.
- [ ] **Leads (`/leads`)**: Extract allocation and fetching logic into `useLeads`.
- [ ] **Email Builder (`/email-builder`)**: Simplify the heavy logic and state management.
- [ ] **Activity Log (`/activity`)**: Optimize table rendering and data fetching.
- [ ] **Offers (`/offers`)**: Refactor form management.

### 5. API Routes Refactoring (if any)
- [ ] Ensure all API routes have consistent error handling and type safety.

### 6. Final Polish
- [ ] Remove unused imports and variables.
- [ ] Optimize images and assets.
- [ ] Verify build and performance.
