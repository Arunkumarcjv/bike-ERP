# BikeERP Design System & Architecture Specification

## Overview
BikeERP is an enterprise two-wheeler dealership and service workshop management platform designed for **Vennila Bike Showroom** (Bangalore Central Flagship). The visual aesthetic combines industrial precision, high-density automotive data display, and clean operational elegance.

---

## 1. Color Tokens & Theme System

All colors are controlled via CSS custom properties in `src/styles/tokens.css` and mapped to Tailwind utilities in `tailwind.config.js`.

### 1.1 Core Palette (Light Theme Default)
- **Sidebar Background**: Deep Navy `#0B1F4B` (`var(--bg-sidebar)`)
- **Sidebar Item Hover**: `#132c66` (`var(--bg-sidebar-hover)`)
- **Sidebar Active Pill**: Vivid Blue `#2563EB` with pure white text (`var(--bg-sidebar-active)`)
- **Main Workspace Canvas**: Light Blue-Grey `#F3F7FD` (`var(--bg-main)`)
- **Card / Surface**: Pure White `#FFFFFF` with 1px border `#E2E8F0` (`var(--bg-surface)`)
- **Subtle Surface**: `#F8FAFC` (`var(--bg-surface-subtle)`)
- **Muted Surface**: `#EDF2F9` (`var(--bg-surface-muted)`)

### 1.2 Dark Theme Tokens
Activated via `data-theme="dark"` attribute on `<html>`:
- **Sidebar Background**: `#07132E`
- **Main Workspace Canvas**: `#0B132B`
- **Card / Surface**: `#111C44` with 1px border `#1E293B`
- **Subtle Surface**: `#162252`
- **Text Main**: `#F1F5F9`, **Text Muted**: `#94A3B8`

### 1.3 Semantic Status Colors
All status indicators adhere strictly to operational status semantics:
| Semantic State | Tailwind Key | Hex / CSS Var | Purpose / Context |
|---|---|---|---|
| **Green** | `status-green` | `#16A34A` / `#DCFCE7` | Paid, Confirmed, Ready, Approved, Delivered, Available |
| **Amber** | `status-amber` | `#D97706` / `#FEF3C7` | Pending, Waiting, Scheduled, Inspection Due |
| **Blue** | `status-blue` | `#2563EB` / `#DBEAFE` | In Progress, Completed (Info), Filed, Allocated |
| **Red** | `status-red` | `#DC2626` / `#FEE2E2` | Cancelled, Low Stock, Overdue, Rejected, SLA Breach |
| **Grey** | `status-grey` | `#64748B` / `#F1F5F9` | Draft, Closed, Archived, Inactive |

---

## 2. Typography Rules

1. **Primary Interface Font**: `Inter, system-ui, sans-serif`
   - High legibility at 12px-14px desktop UI scales.
   - Money and financial values MUST use tabular numbers: `.tabular-nums` / `font-feature-settings: "tnum"`.
   - **CRITICAL RULE**: Do **NOT** use monospace for KPI summary numbers. KPI numbers must be crisp Inter Bold/Semibold with tabular numerals.
2. **Identification & Serial Font**: `"JetBrains Mono", monospace`
   - Used **EXCLUSIVELY** for:
     - 17-character Vehicle Identification Numbers (VIN / Chassis Numbers)
     - Engine serial numbers
     - Vehicle Registration numbers (e.g., `KA-05-EV-4091`)
     - Invoice series IDs (`VI/2627/00001`)
     - Job Card numbers (`JC-2627-0104`)

---

## 3. Geometry & Elevation
- **Border Radii**:
  - Cards: `12px` (`rounded-card`)
  - Buttons: `8px` (`rounded-button`)
  - Inputs / Selects: `8px` (`rounded-input`)
  - Status Badges: `9999px` / `6px` pill badges (`rounded-badge`)
- **Borders & Shadows**:
  - Soft 1px border: `border border-border` (light slate #E2E8F0, dark #1E293B).
  - Shadows are subtle: `box-shadow: 0 1px 3px 0 rgba(11, 31, 75, 0.04)`.
  - Heavy drop shadows are strictly prohibited to maintain flat enterprise clarity.

---

## 4. Layout Responsive Grid
- **Desktop Target**: Optimized for 1366x768 and 1920x1080 workshop and showroom terminals.
- **Tablet (Workshop / Floor)**: 12-bay live grid collapses gracefully with large tap targets (minimum 44x44px).
- **Mobile-First Screens**:
  - Technician "My Jobs" view (`/service/my-jobs`)
  - Customer Self-Service Portal (`/portal`)
  - Both feature persistent bottom navigation bars.

---

## 5. Standard Component Behavioral States
Every table and data view includes:
1. **Loading Skeleton**: Shimmering placeholders matching target geometry.
2. **Empty State**: Clear contextual illustration, explanation, and primary action button.
3. **Error State**: Resilient alert box with retry callback.
4. **Destructive Safeguard**: Irreversible operations (cancellations, write-offs, deletions) require `ConfirmDialog`.
