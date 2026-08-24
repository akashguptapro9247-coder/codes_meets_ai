# CODE MEETS AI — Database Schema & Mission Control Reference

This document explains the complete database architecture and admin control system for the **CODE MEETS AI** competition platform built on **Supabase PostgreSQL**.

---

## ⚡ Execution Order in Supabase SQL Editor

> [!IMPORTANT]
> Run schema files in this exact order in the Supabase SQL Editor:

| Step | File | Description |
| :--- | :--- | :--- |
| 1 | `user_schema.sql` | Creates `users` table and shared trigger functions |
| 2 | `layer1_schema.sql` | Creates `layer_1` table — requires `users` to exist |
| 3 | `layer2_schema.sql` | Creates `layer_2` table — requires `users` to exist |
| 4 | `duo_schema.sql` | Creates `duos` table (Layer 3 & 4) — requires `users` |
| 5 | `event_settings_schema.sql` | Creates `event_settings` table for realtime layer locking & track activation |

---

## 🚀 Supabase SQL Editor Instructions

1. Open your **Supabase project → SQL Editor**.
2. Click **New Query**.
3. Paste the contents of `user_schema.sql` → Click **Run**.
4. Paste the contents of `layer1_schema.sql` → Click **Run**.
5. Paste the contents of `layer2_schema.sql` → Click **Run**.
6. Paste the contents of `duo_schema.sql` → Click **Run**.
7. Paste the contents of `event_settings_schema.sql` → Click **Run**.

---

## 📐 Table Relationships

```
                            USERS
                      (user_id UUID PK)
                             │
     ──────────────────────────────────────────────────
     │                       │                        │
  LAYER 1                 LAYER 2                   DUOS
 (user_id FK)            (user_id FK)         (player_1_id FK,
 UNIQUE per user         UNIQUE per user       player_2_id FK)
```

- All relationships use `users.user_id` (UUID), not `roll_number`.
- Each user has at most ONE Layer 1 and ONE Layer 2 record.
- Duos pair two distinct users with database-level duplicate protection (`UNIQUE (LEAST(p1, p2), GREATEST(p1, p2))`).

---

## 📊 Score Calculation & Synchronization Chain

Scores are maintained **100% by PostgreSQL database triggers** — the frontend never calculates or writes stale scores.

```
Layer 1:
  layer_1_gen_ai_marks + layer_1_manual_marks
     => (BEFORE trigger) => layer_1.average_marks
     => (AFTER trigger)  => users.average_layer_1
     => (BEFORE trigger) => users.total_score = average_layer_1 + average_layer_2

Layer 2:
  layer_2_gen_ai_marks + layer_2_manual_marks
     => (BEFORE trigger) => layer_2.average_marks
     => (AFTER trigger)  => users.average_layer_2
     => (BEFORE trigger) => users.total_score = average_layer_1 + average_layer_2

Duo (Layer 3 & 4):
  player_1 (total_score) + player_2 (total_score)
     => (BEFORE trigger / user update trigger) => duos.combined_layer_1_average (0-10 scale)
     => duos.total_marks = combined_layer_1_average + layer_3_marks + layer_4_marks (0-30 scale)
```

---

## 🛡️ Row Level Security & Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
2. **SECURITY NOTE**: ONLY use the public `anon` key in the frontend. Never expose the `service_role` key in React source code or client bundles.

---

## 🎮 Admin Mission Control Capabilities

Access the Admin Panel in the top header: `[ 🛠️ ADMIN PANEL ]`.

- **Mission Overview**: Live KPI counts, layer lock toggles, track activation switches.
- **Users Management**: Search by Name/Roll/UUID, filter by Branch, edit participant info, delete users.
- **Layer 01 Arena**: View participant scores, edit GenAI/Manual marks with automatic average recalculation.
- **Layer 02 Arena**: View participant scores, edit GenAI/Manual marks with automatic average recalculation.
- **Duo Arena**: `+ CREATE NEW DUO` modal with live player selection and score preview, enter Layer 3 & Layer 4 marks (0-10), delete duos.
