---
title: User Manual: Anclora Nexus
version: 1.2.3
date: 2026-03-10
language: en
status: current
---

# User Manual: Anclora Nexus

**Versión 1.2.3 | 10 de March de 2026**

---

## Table of Contents

1. [Introducción](#introducción)
2. [Navegación Principal](#navegación-principal)
3. [Sección CORE](#sección-core)
4. [Sección INTELLIGENCE](#sección-intelligence)
5. [Sección OPERATIONS](#sección-operations)
6. [Casos de Uso Prácticos](#casos-de-uso-prácticos)
7. [Troubleshooting](#troubleshooting)

---

## 1. Introduction

### 1.1 What is Anclora Nexus

Anclora Nexus is a real estate CRM designed specifically for **Anclora Private Estates** by eXp Realty Spain. The system combines traditional **Lead** and **Properties** management with territorial artificial intelligence to optimize **Seller** acquisition and matching with buyers in the southwest of Mallorca.

**Características principales:**
- **Seller Pipeline:** **Seller** acquisition engine with FSBOs and stagnant properties detection
- **Intelligence Territorial:** Integration with NotebookLM for real-time market insights
- **Prospection Matching:** Explainable buyer-property matching algorithm
- **Observabilidad Operativa:** Executive **Command Center** with business metrics and cost governance

**Filosofía del sistema:**
> "Every hour invested should shorten the path to the next mandate."

### 1.2 Previous Requirements

**Técnicos:**
- Updated browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Stable internet connection
- Minimum resolution: 1280x720px (recommended: 1920x1080px)

**Organizativos:**
- Active user account in Supabase Auth
- Active membership in an organization
- Assigned role: `owner`, `manager` or `agent`

**URL de acceso:**
- Development: `http://localhost:3000`
- Production: `https://app.anclora.com` (pending deployment)

### 1.3 Access to the Platform

#### Login

1. Open the application URL
2. Enter your registered **email**
3. Enter your **contraseña**
4. Press **Iniciar sesión**
5. If the credentials are correct and your membership is active, you will be redirected to the **Dashboard**

#### First Access (Invitation)

1. You will receive an invitation email from the Owner
2. Click on the invitation link
3. Complete the registration with email and password
4. Verify your email if required
5. Log in with your credentials

#### Password Recovery

1. On the login screen, press **Olvidé mi contraseña**
2. Enter your email
3. You will receive a recovery link
4. Follow the link and set a new password
5. Log in with the new password

## 2. Main Navigation

Anclora Nexus is organized into two main navigation components:

### 2.1 Sidebar (Left Menu)

The left sidebar contains **3 secciones colapsables** with a total of **17 opciones de menú**.

#### CORE Section (Core Business)

**Propósito:** Daily operational management of the real estate business.

| Option | Route | Description |
|--------|------|-------------|
| **Dashboard** | `/dashboard` | Main panel with operational widgets |
| **Leads** | `/leads` | Management of incoming contacts and Pipeline |
| **Properties** | `/properties` | Properties inventory |
| **Tasks** | `/tasks` | Task and follow-up system |
| **Team** | `/team` | Management of organization members and roles |

#### INTELLIGENCE Section (Intelligence & Prospection)

**Propósito:** Intelligent Prospection and Seller acquisition.

| Option | Route | Description |
|--------|------|-------------|
| **Prospection studio** | `/prospection` | Legacy Prospection (deprecated) |
| **Prospection operativa** | `/prospection-unified` | Unified Prospection work queue |
| **Seller Pipeline** | `/sellers` | Seller acquisition engine (FSBOs, stagnant) |
| **Opportunity Ranking** | `/opportunity-ranking` | Explainable Opportunity Ranking |
| **Intelligence** | `/intelligence` | Command Center with chat and territorial analysis |

#### OPERATIONS Section (Operations & Tools)

**Propósito:** Operational tools and observability.

| Option | Route | Description |
|--------|------|-------------|
| **Ingestion** | `/ingestion` | Unified seller-side data Ingestion |
| **Data Quality** | `/data-quality` | Data Quality and entity resolution |
| **Feed Orchestrator** | `/feed-orchestrator` | Multichannel publication (Idealista, Fotocasa) |
| **Automation & Alerting** | `/automation-alerting` | Automation with HITL guardrails |
| **Command Center** | `/command-center` | Executive KPIs and business metrics |
| **Deal Margin Simulator** | `/deal-margin-simulator` | Deal Margin Simulator |
| **Source Observatory** | `/source-observatory` | Lead source performance |

### 2.2 Header (Top Bar)

The top header contains **6 componentes** functional components:

| Component | Icon | Function |
|------------|-------|---------|
| **Search** | 🔍 | Global search in Leads, Properties, and Tasks |
| **Notifications** | 🔔 | System notification and alert panel |
| **Currency Selector** | 💱 | Currency selection (EUR, USD, GBP) |
| **Language Selector** | 🌐 | Language selection (ES, EN, DE, RU) |
| **Unit Selector** | 📏 | Unit system (m², sqft) |
| **User Menu** | 👤 | Profile, settings, and logout |

## 3. Core Section

### 3.1 Dashboard

The **Dashboard** is your central hub. In one screen, you get complete visibility of:
- Key business metrics
- Recent and prioritized **Leads**
- Today's **Tasks**
- **Properties** pipeline status
- Automated agent activity
- Quick access to critical actions

### 3.1.1 Main Widgets

#### A) QuickStats

- Total **Leads** this week
- **Tasks** completed today
- Active **Properties**
- Conversion rate

Validate in 10 seconds if you are above or below the expected load.

- Compare the trend with your weekly reference
- If you see a drop in activity, prioritize **Prospection**
- If you see a peak of **Leads**, adjust team load

#### B) LeadsPulse

- Last 5-10 incoming **Leads**
- Priority per **Lead** (1-5, being 5 = Whale)
- Current status (new, contacted, qualified)
- Time since entry

Decide quickly which **Lead** to touch first.

1. Identify **Leads** with priority 4-5
2. Review time since entry (goal < 15 min for P5)
3. Click on the **Lead** to open details
4. Register contact immediately

- **Leads** P5 (Whale): respond < 15 minutes
- **Leads** P4: respond < 2 hours
- **Leads** P3: respond < 24 hours

#### C) TasksToday

- Today's **Tasks** (overdue + today)
- **Tasks** assigned to you
- Status (pending, in progress, completed)

Avoid accumulating pending follow-ups.

1. Mentally order by commercial impact (not by ease)
2. Complete critical **Tasks** first
3. Reschedule non-critical **Tasks** with explicit criteria
4. Mark as completed with result notes

#### D) PropertyPipeline

- Distribution of **Properties** by stage:
  - New
  - Valuation
  - Listed
  - Under Offer
  - Sold
  - Lost

Identify bottlenecks in the pipeline.

1. Identify the most saturated stage
2. Open stuck **Properties** in that stage
3. Define concrete action to unlock
4. If there are many in "Valuation", prioritize CMAs
5. If there are many in "Listed" without movement, review price/marketing

#### E) AgentStream

- Latest executions of AI agents
- Skill executed (lead_intake, prospection_weekly, recap_weekly)
- Status (success, failed)
- Timestamp

Operational traceability of automations.

1. Confirm that expected flows were executed (e.g., prospection_weekly every Sunday)
2. If you see an error, click to view error details
3. Report repeated errors to the Tech Lead

#### F) QuickActions

- Quick access buttons:
  - Create **Lead**
  - Create **Task**
  - Create **Property**
  - Execute manual skill

Reduce friction in frequent actions.

- Use these buttons instead of navigating to each module
- Modal forms open in-place
- Save and continue working without losing context

#### G) BudgetStatusWidget

- Monthly LLM budget (tokens/€)
- Current consumption
- % used
- Days left in the month

Cost governance to avoid overspending.

- If you are close to 80%, moderate agent executions
- If you exceed 100%, the system blocks automatically (hard stop)
- Contact the Owner to adjust the budget if necessary

#### H) RadarTerritorial

- NotebookLM insights by zone:
  - Andratx, Calvià, Son Ferrer, Santa Ponça, Paguera
- Active opportunities detected
- Market signals

Territorial context for informed **Prospection**.

1. Review the 3 priority opportunities
2. Click on the zone to view full details
3. Use these insights in your capture copy
4. Refresh data with weekly territorial sync

### 3.1.2 Recommended Daily Routine (15-20 min)

1. Validate general pulse
2. Select top 3 **Leads**
3. Resolve critical pending issues
4. Unblock the most stuck stage
5. Update market context
6. Execute the action with the greatest impact

### 3.2 Leads

### 3.2.1 Purpose

Complete management of the lifecycle of incoming **Leads**, from capture to conversion.

### 3.2.2 Main Functionality

- Filters: status, priority, source, date
- Columns: name, email, budget, status, priority, last interaction
- Actions: edit, change status, create **Task**, mark as won/lost

- Complete contact data
- Interaction history
- Private notes
- Linked **Properties**
- Associated **Tasks**

- **New**, not contacted
- First interaction made
- Confirmed potential
- Commercial offer sent
- Converted to client
- Discarded (with registered reason)

### 3.2.3 How to Use

1. The **Lead** appears in the **Dashboard** with the status "New"
2. You receive a notification if you have alerts enabled
3. Open the **Lead** from the **Dashboard** or from the **Leads** section
4. Review data: budget, area of interest, urgency
5. Call or send an email (register the interaction)
6. Update status to "Contacted"
7. Create a follow-up **Task** (e.g., "Send proposals in 2 days")
8. Link **Properties** that fit their profile

1. Filter **Leads** by status "Contacted"
2. Open each **Lead**'s details
3. Verify that:
   - The budget is realistic
   - The area of interest is within your scope
   - The purchase timing is < 6 months
4. If it meets the criteria, change to "Qualified"
5. If it does not meet the criteria, change to "Lost" and register the reason

- Do not leave **Leads** in "New" > 24h
- Register all interactions (call, email, visit)
- Use private notes for important context
- Update priority if the **Lead**'s situation changes

### 3.3 Properties

### 3.3.1 Purpose

Management of the inventory of **Properties** available for sale or rent.

### 3.3.2 Main Functionality

- Filters: zone, type, price, status
- Columns: address, price, m², type, status, origin
- Actions: edit, change status, publish feed, view history

- Technical data (m², rooms, bathrooms)
- Photos and documentation
- Price change history
- AI valuation (if available)
- Publication status on portals

- **Newly** captured
- In CMA process
- Actively published
- With received offer
- Sold
- Lost (mandate canceled, sold by another)

### 3.3.3 How to Use

1. Enter the **Properties** section
2. Click on **Create Property**
3. Complete the form:
   - Full address
   - Zone (e.g., Andratx, Calvià)
   - Type (villa, apartment, land)
   - Initial price
   - Useful and built m²
   - Rooms, bathrooms
4. Upload photos (minimum 5, recommended 15+)
5. Indicate the origin (own capture, StateFox, other)
6. Save as "New"
7. The system assigns a unique ID

1. Open the **Property** in the "New" status
2. Execute CMA (Comparative Market Analysis):
   - Use RadarTerritorial data for context
   - Compare with similar **Properties** in the zone
   - Validate the price with the Owner if necessary
3. Adjust the price if necessary
4. Change the status to "Listed"
5. Publish on portals via Feed Orchestrator
6. Create a follow-up **Task** to monitor visits

1. When you receive an offer, change the status to "Under Offer"
2. Register the offer details in notes
3. Coordinate with the buyer and seller
4. If accepted and closed, change to "Sold"
5. If canceled, return to "Listed"

### 3.4 Tasks

### 3.4.1 Purpose

**Task** management system for commercial and operational follow-ups.

### 3.4.2 Main Functionality

- Filters: status, assigned to, due date, priority
- Columns: title, description, associated **Lead**/**Property**, status, date
- Actions: mark as completed, reschedule, edit, delete

- Title (required)
- Description
- Due date
- Priority (low, medium, high)
- Assign to (if you are the Owner/Manager)
- Link to **Lead** or **Property**

- Not started
- In progress
- Completed
- Canceled

### 3.4.3 How to Use

1. From the **Lead** details, click on **Create Task**
2. Title: "Call Ana García - proposal follow-up"
3. Description: "Send villa proposals in Andratx 800-1M€"
4. Date: Within 2 days
5. Priority: High
6. Save
7. The **Task** appears in TasksToday when the date arrives

1. Open the **Dashboard** and review TasksToday
2. Click on the **Task**
3. Execute the action (call, email, etc.)
4. Register the result in notes
5. Mark as "Completed"
6. If a new action arises, create a new **Task**

1. If you cannot complete a **Task** today
2. Open the **Task**
3. Click on **Reschedule**
4. Adjust the due date
5. Add a note explaining why it is being rescheduled
6. Save

- Be specific in the title (not "Call **Lead**" but "Call Ana García - proposal follow-up")
- Always link to **Lead** or **Property**
- Do not accumulate overdue **Tasks** (complete or reschedule with criteria)
- Use priorities correctly (not everything is High)

### 3.5 Team

### 3.5.1 Purpose

Management of organization members, roles, and permissions.

### 3.5.2 Main Functionality

- Columns: name, email, role, status, invitation date
- Actions (Owner): invite, change role, suspend, delete

| Role | Permissions |
|-----|----------|
| Owner | Full control: team management, org configuration, access to all |
| Manager | Operational management: **Leads**, **Properties**, **Tasks**, metric visualization |
| Agent | Execution: assigned **Leads**, own **Tasks**, **Properties** (read-only) |

- Active, can log in
- Invited, pending acceptance
- Temporarily blocked
- Out of the organization

### 3.5.3 How to Use (Owner)

1. Enter the **Team** section
2. Click on **Invite Member**
3. Enter the new member's email
4. Select the role (Agent by default)
5. Click on **Invite**
6. The member receives an email with a link
7. They appear in the table with the status "Pending"
8. When they accept, they move to "Active"

1. Locate the member in the table
2. Click on **Change Role**
3. Select the new role
4. Confirm the change
5. The member will see the changes after reloading the session

1. If a member needs temporary access blocked
2. Click on **Suspend** in their row
3. Confirm the action
4. The status changes to "Suspended"
5. The member cannot log in
6. To reactivate, click on **Reactivate**

- Assign the minimum necessary role (principle of minimum privilege)
- Periodically review old "Pending" memberships
- Document the reason for suspending/deleting members
- Always maintain at least 1 active Owner

## 4. Intelligence Section 

Please note that this section is currently protected and only accessible with the proper authorization. 

To access the Intelligence section, navigate to the **Anclora Nexus** Dashboard and click on the Intelligence tab. This section provides an overview of the **Intelligence Layer**, which is the core of the **Anclora Nexus** platform. 

The **Intelligence Layer** is responsible for analyzing data from various sources, including **Leads**, **Sellers**, and **Properties**, to provide valuable insights and recommendations. It also includes tools such as the **Opportunity Ranking**, **Deal Margin Simulator**, and **Source Observatory**, which help users make informed decisions. 

In this section, you will also find the **Feed Orchestrator**, which is responsible for managing data **Ingestion** and **Data Quality**, as well as the **Automation & Alerting** features, which enable users to automate tasks and receive notifications. 

Additionally, the **Command Center** provides a centralized location for managing **Tasks**, **Team**, and **Prospection** activities, while the **StateFox Bridge** enables integration with external systems. 

The **Intelligence** section is a powerful tool that helps users gain a deeper understanding of their **Pipeline** and make data-driven decisions to drive business growth. 

For more information on how to use the **Intelligence** section, please refer to the **Anclora Nexus** user guide. 

__PROTECTED_X_Y__

### 4.1 Prospection Studio (Legacy)

**Ruta:** `/prospection`
**Acceso:** Owner, Manager
**Estado:** Deprecated - Use Operational Prospection

### 4.2 Operational Prospection

**Ruta:** `/prospection-unified`
**Acceso:** Owner, Manager, Agent

#### Purpose

**Cola de trabajo unificada** for buyer-side prospecting: matching, tracking, and closing.

#### Main Functionality

**Tres Colas de Trabajo:**

1. **Cola de Cierre**
   - High-score matches (70-100)
   - Prioritized for immediate contact
   - States: candidate → contacted → viewing → negotiating → offer → closed

2. **Captación Prioritaria**
   - High-ticket properties with a score > 75
   - Pending matching with buyers
   - Require data enrichment

3. **Seguimiento de Buyers**
   - Active buyers with a motivation score > 60
   - Pending matching with properties
   - Require criteria updates

**Matching Score Explicable:**
- 35% budget adjustment
- 25% zone adjustment
- 20% typology adjustment
- 10% purchase timing
- 10% motivation

#### How to Use It

**Caso: Trabajar cola de cierre**

1. Enter `/prospection-unified`
2. Review matches with a score > 80
3. Sort by score in descending order
4. For each match:
   - Open detail (buyer + property)
   - Verify real fit (beyond score)
   - Contact buyer if applicable
   - Register activity
   - Move to the next pipeline state
5. Mark match as "contacted"
6. Create a follow-up task

**Caso: Avanzar match por pipeline**

Prospection pipeline states:
- **Candidate:** Match detected, no contact
- **Contacted:** Buyer contacted, property presented
- **Viewing:** Visit scheduled or performed
- **Negotiating:** Offer in negotiation
- **Offer:** Formal offer presented
- **Closed:** Operation closed (success)
- **Dropped:** Match discarded (reason registered)

Actions by state:
1. **Candidate → Contacted:**
   - Call/email the buyer
   - Present the matched property
   - Register contact result

2. **Contacted → Viewing:**
   - Buyer shows interest
   - Schedule a visit
   - Register date/time

3. **Viewing → Negotiating:**
   - Visit performed, positive feedback
   - Buyer wants to make an offer
   - Initiate negotiation

4. **Negotiating → Offer:**
   - Terms agreed
   - Formal offer presented in writing

5. **Offer → Closed:**
   - Offer accepted
   - Contract signed
   - Operation closed

### 4.3 Seller Pipeline

**Ruta:** `/sellers`
**Acceso:** Owner, Manager, Agent

#### Purpose

**Motor de adquisición de vendedores** through intelligent detection of FSBOs, stagnant properties, and sales motivation signals.

#### Main Functionality

**Tabla de Sellers:**
- Columns: name/company, property, zone, price, priority, state, source
- Filters: zone, state, priority (1-5), source
- Actions: view detail, change state, create interaction, generate dossier

**Prioridades de Seller:**
- **P5 (Whale):** High value + high urgency → almost certain mandate
- **P4:** High potential → intensive follow-up
- **P3:** Medium potential → active nurturing
- **P2:** Low potential → passive follow-up
- **P1:** Cold → backlog

**Estados de Seller:**
- **Detected:** Newly detected by source (StateFox, scraping)
- **Contacted:** First contact made
- **Qualified:** Verified real potential
- **Proposal:** Mandate proposal sent
- **Mandate:** Exclusive mandate signed
- **Lost:** Opportunity lost

**Fuentes de Sellers:**
- **StateFox Telegram:** Captures from Telegram channel
- **StateFox Discovery:** Analysis of Telegram conversations
- **FSBO Scraper:** Real estate portals
- **Manual:** Manual entry by the team

#### How to Use It

**Caso: Revisar nuevos sellers detectados**

1. Enter `/sellers`
2. Filter by "Detected" state
3. Sort by priority in descending order (P5 first)
4. For each P5 seller:
   - Open detail
   - Review property data
   - Read detection context
   - Validate motivation signals
   - If applicable, mark as "Contacted" and call immediately

**Caso: Contactar seller prioritario**

1. P5 or P4 seller in "Detected" state
2. Open detail drawer
3. Review:
   - Property (price, zone, type, state)
   - Motivation signals (days on market, price vs CMA)
   - Available contact channels (email, phone, WhatsApp)
4. Prepare acquisition copy using RadarTerritorial insights
5. Contact via preferred channel
6. Register interaction:
   - Channel used
   - Result (interested, rejected, no response)
   - Relevant notes
7. Change state according to result:
   - If interested → "Qualified"
   - If rejected → "Lost"
   - If no response → maintain "Contacted", create follow-up task

**Caso: Proponer mandato**

1. Seller in "Qualified" state
2. You have validated:
   - Real and verifiable property
   - Genuine sales motivation
   - Realistic price (or adjustable)
3. Generate acquisition dossier:
   - Use "Whale Dossier" widget in detail
   - Include zone CMA
   - Include eXp value proposition
4. Send exclusive mandate proposal
5. Change state to "Proposal"
6. Create follow-up task in 3-5 days

**Caso: Firmar mandato**

1. Seller accepts proposal
2. Coordinate mandate signing
3. Change state to "Mandate"
4. Create corresponding property in `/properties`
5. Link seller to property
6. Celebrate success 

**Memoria Semántica del Seller:**

Each P5 seller (Whale) has semantic memory that records:
- All interactions
- Conversation context
- Objections and responses
- Relationship evolution

To use the memory:
1. Open seller drawer
2. Go to "Memory" tab
3. Query: "What were their main objections?"
4. The system returns relevant context
5. Use this to personalize the next interaction

### 4.4 Opportunity Ranking

**Ruta:** `/opportunity-ranking`
**Acceso:** Owner, Manager

#### Purpose

Explainable ranking of all active opportunities (leads, sellers, matches) prioritized by IA scoring.

#### Main Functionality

**Tabla de Oportunidades:**
- Columns: type (lead/seller/match), name, score, breakdown, state, recommended action
- Filters: type, minimum score, state
- Explainable scoring with visual breakdown

**Tipos de Oportunidades:**
1. **Leads:** Conversion score (budget + zone + timing + motivation)
2. **Sellers:** Acquisition score (property value + urgency + zone + source)
3. **Matches:** Closing score (buyer-property adjustment)

#### How to Use It

1. Enter `/opportunity-ranking`
2. Review top 10 opportunities
3. For each one, verify breakdown of the score
4. Execute the recommended action
5. Use this ranking to prioritize your day

**Ejemplo de Breakdown:**

Seller "Villa Andratx - Calle Mar":
- Total score: 87/100
- Breakdown:
  - Property value (€1.2M): 35/35 
  - Urgency (120 days on market): 23/25 
  - Premium zone (Andratx): 20/25 
  - Source (StateFox Telegram): 9/15 

Recommended action: **Contactar hoy - alta probabilidad de mandato**

### 4.5 Intelligence

**Ruta:** `/intelligence`
**Acceso:** Owner, Manager

#### Purpose

**Centro de control de Intelligence** with conversational chat, territorial analysis, and NotebookLM sync pack status.

#### Main Components

**1. Chat Console**
- Conversational chat with the orchestrator
- Accepts natural language queries
- Examples:
  - "How many P5 sellers do we have in Andratx?"
  - "Give me a summary of this week's activity"
  - "What opportunities are there in Son Ferrer?"

**2. Decision Console**
- Visualization of Governor decisions
- Shows routing logic
- Useful for debugging and transparency

**3. Query Plan Panel**
- Router query plan
- Shows which sources are consulted
- Estimated execution time

**4. Territorial Sync Status Card**
- NotebookLM sync pack status
- Last synchronization
- Next scheduled synchronization
- Territorial coverage (active zones)

**5. StateFox Discovery Card**
- Last discovery executed
- Detected sellers
- Active signals

#### Subpages

**Intelligence / StateFox Bridge**

**Ruta:** `/intelligence/statefox-bridge`
**Propósito:** Bridge to import listings from Telegram StateFox.

**Funcionalidad:**
1. Paste raw text captured from Telegram
2. The system parses:
   - Price
   - Zone
   - Property type
   - Contact
3. Validates structure
4. Imports as a seller in "Detected" state

**Cómo usarlo:**
1. Copy Telegram StateFox message
2. Enter `/intelligence/statefox-bridge`
3. Paste in the textarea
4. Press **Parse & Import**
5. Review preview
6. Confirm import
7. The seller appears in `/sellers`

**Intelligence / StateFox Discovery**

**Ruta:** `/intelligence/statefox-discovery`
**Propósito:** Automatic analysis of Telegram conversations to detect sellers.

**Funcionalidad:**
- Scheduled automatic discovery (every 6 hours)
- Conversation pattern analysis
- Detection of sales signals
- Urgency scoring

**Cómo usarlo:**
1. Enter `/intelligence/statefox-discovery`
2. Review the last executed discovery
3. See the list of detected sellers
4. For each seller:
   - Read detection context
   - Validate if it's a genuine signal
   - Import to sellers if applicable

## 5. OPERATIONS Section

### 5.1 Ingestion

### Purpose

Ingest data from multiple sources with canonical contract and automatic dedupe.

### Main Functionality

* Processed events table
* Columns: timestamp, source, entity_type (seller_signal), status, dedupe_key
* States: pending, processed, failed, duplicated

### Data Sources

* StateFox Telegram
* StateFox Live Capture
* FSBO Scraper (Idealista, Fotocasa)
* Manual import

### How to Use

1. Events are processed automatically
2. Review this screen for observability
3. Filter by "failed" status to view errors
4. Filter by "duplicated" status to view dedupe in action

### 5.2 Data Quality

### Purpose

Ensure data quality through duplicate detection with explainable scoring.

### Main Functionality

* % of records with valid email
* % of records with valid phone
* % of detected duplicates
* % of resolved duplicates

### Duplicate Detection

* Suspicious record pairs
* Similarity score (0-100)
* Breakdown: email match, phone match, fuzzy name match
* Action: merge (merge) or keep both (keep separate)

### How to Use

1. Enter `/data-quality`
2. Review global metrics
3. Go to "Duplicate Candidates" section
4. For each pair:
   - Review data from both records
   - Verify similarity score
   - If they are real duplicates, press **Merge**
   - If they are different, press **Keep Both**
5. When merging:
   - Select master record (the one that stays)
   - Data from the other record is merged
   - References are updated

### 5.3 Feed Orchestrator

### Purpose

Orchestrate property feeds on real estate portals (Idealista, Fotocasa, etc.) with prior validation.

### Main Functionality

* Idealista
* Fotocasa
* (Extensible to more portals)

### Validation Rules

* Complete required fields
* Minimum 5 photos
* Price within reasonable range
* Description > 100 characters

### Execution History

* Execution history
* Status: success, partial, failed
* Published properties
* Issues found

### How to Use

1. Ensure the property in `/properties` is:
   - Complete (all fields)
   - With photos (minimum 5)
   - With professional description
2. Enter `/feed-orchestrator`
3. Select "Idealista" channel
4. Press **Validate**
5. Review issues (if any)
6. Fix issues in `/properties`
7. Press **Publish**
8. Verify in "Runs" that status = success

### 5.4 Automation & Alerting

### Purpose

Human-In-The-Loop (HITL) and operational alert system.

### Main Functionality

* Trigger: system event
* Condition: criteria to meet
* Action: action to execute
* HITL checkpoint: mandatory human review before critical action

### Alert Examples

* Budget > 80% consumed
* Territorial cron not executed in 48h
* Scraping without coverage
* Error rate > 10% in skill

### How to Use

1. Enter `/automation-alerting`
2. Press **Nueva Regla**
3. Configure:
   - Trigger: "New P5 seller detected"
   - Condition: "Zone = Andratx AND Price > €800k"
   - Action: "Create urgent task assigned to Owner"
   - HITL: "Require approval before contacting"
4. Save rule
5. The next time a seller that meets the criteria is detected, it will be executed

1. Enter `/automation-alerting`
2. Go to "Active Alerts" section
3. For each alert:
   - Read details
   - Press **Acknowledge** if you already know
   - Press **Resolve** if you solved it
4. Critical alerts cannot be ignored until resolved

### 5.5 Command Center

### Purpose

Centralized dashboard for strategic decision-making.

### Main Functionality

* Leads: total, conversion rate, pipeline value
* Sellers: total, active P5, signed mandates this month
* Properties: inventory, under offer, sold this month
* Matches: active, closure rate, estimated commission

### Metrics and Trends

* Trend charts (last 30/60/90 days)
* Comparison with previous period
* Anomaly detection

### Budget and Consumption

* Monthly LLM budget
* Consumption by capability (reasoning, synthesis, classification)
* End-of-month projection
* Active hard stops

### How to Use

1. On Monday morning, open `/command-center`
2. Review executive snapshot:
   - Are we generating enough leads?
   - How many active P5 sellers do we have?
   - How many mandates did we sign this week?
   - What is the total pipeline value?
3. Compare with the previous week
4. Identify trends:
   - If leads are low → prioritize prospecting
   - If P5 sellers are high but mandates are low → review capture copy
   - If matches are high but closures are low → review follow-up process
5. Make strategic decisions based on data

### 5.6 Deal Margin Simulator

### Purpose

Simulate commissions, costs, and net profit.

### Main Functionality

* Sale price
* Commission percentage (default: 3%)
* Variable costs (marketing, staging, etc.)
* Fixed costs

### Simulation Results

* Gross commission
* Total costs
* Net margin
* Margin percentage

### Scenario Simulation

* Simulate multiple scenarios
* Compare side-by-side
* Identify optimal scenario

### How to Use

1. Enter `/deal-margin-simulator`
2. Introduce:
   - Sale price: €1,200,000
   - Commission: 3% (€36,000)
   - Variable costs: €2,000 (professional photography, virtual staging)
   - Fixed costs: €500 (administrative)
3. Press **Simulate**
4. Result:
   - Gross commission: €36,000
   - Total costs: €2,500
   - Net margin: €33,500
   - Margin percentage: 92.9%

1. Simulate base scenario (3% commission)
2. Press **Add Scenario**
3. Simulate alternative scenario (2.5% commission)
4. Compare results
5. Decide which one to negotiate with the client

### 5.7 Source Observatory

### Purpose

Optimize investment in acquisition channels.

### Main Functionality

* Source (web form, StateFox, referrals, etc.)
* Leads generated
* Conversion rate
* Cost per lead (CPL)
* Cost per acquisition (CPA)
* ROI

### Source Analysis

* Lead distribution by source
* Temporal evolution by source
* Conversion comparison

### How to Use

1. Enter `/source-observatory`
2. Sort sources by ROI in descending order
3. Identify:
   - Sources with high ROI → scale investment
   - Sources with low ROI → optimize or pause
4. Analyze conversion rate:
   - If conversion is low → review lead quality
   - If conversion is high → prioritize follow-up
5. Make investment decisions based on data

## 6. Practical Use Cases

### 6.1 By Role: Owner

### Case 1: Weekly Business Review

### Evaluate commercial health in 20 minutes and assign priorities to the **Team**.

1. Monday 9:00h, open **Command Center**
2. Review executive snapshot:
   - **Leads**: 25 this week (vs 30 last week) 
   - **Sellers** P5: 8 active (excellent) 
   - Mandates signed: 2 this month (target: 3) 
   - Active matches: 45 (20 with score > 80) 
3. Open **Dashboard** and review **AgentStream**:
   - **Prospection**_weekly executed OK 
   - recap_weekly executed OK 
   - territorial_sync 5 days ago  → schedule refresh
4. Open **Leads** and filter by "New" unattended:
   - 3 new **Leads** without contact > 24h 
   - Assign to Manager for urgent follow-up
5. Open **Sellers** and filter by P5 in "Detected":
   - 2 **Sellers** P5 without contact
   - Assign to yourself for contact today
6. Create **Tasks** for **Team**:
   - Manager: "Contact 3 new **Leads** urgent"
   - Agent: "Follow-up 5 matches score > 85"
7. Execute territorial refresh in `/intelligence`
8. Close week with clear plan

### 
- Clean **Dashboard** of critical **Tasks**
- Clear priorities by **Team** member
- **Pipeline** with concrete actions to generate closures

### Case 2: Optimize Investment in Sources

### Decide where to invest marketing budget.

### 
1. Open **Source Observatory**
2. Review ROI by source (last 30 days):
   - Web form: 25 **Leads**, conversion 20%, CPL €15, ROI 400% 
   - Facebook Ads: 40 **Leads**, conversion 5%, CPL €30, ROI 50% 
   - **StateFox Bridge**: 15 **Sellers**, conversion 40%, CPL €0, ROI ∞ 
   - Referrals: 5 **Leads**, conversion 60%, CPL €0, ROI ∞ 
3. Decisions:
   - **Escalar:** Web form (high ROI), referrals (high conversion)
   - **Optimizar:** Facebook Ads (low conversion) → review targeting
   - **Mantener:** **StateFox Bridge** (high-value organic source)
4. Adjust budget:
   - Reduce Facebook Ads from €1200/month to €600/month
   - Increase investment in SEO (web form) from €800 to €1400/month
5. Communicate changes to **Team**

### 
- Budget optimized according to real data
- Higher global ROI
- Reduction of average CPL

### 6.2 By Role: Manager

### Case 1: Daily **Leads** Management

### Convert **Leads** into active opportunities in < 2h.

### 
1. 9:00h, open **Dashboard**
2. Review **LeadsPulse**:
   - 3 new **Leads** detected
   - Lead 1: P4, budget €900k, Andratx area 
   - Lead 2: P3, budget €500k, Calvià area
   - Lead 3: P2, budget €300k, Son Ferrer area
3. Prioritize Lead 1 (P4):
   - Open detail
   - Read notes: "Looking for villa with views, max 3 months"
   - Verify email and phone available
4. Call immediately:
   - Present Anclora and eXp
   - Confirm budget and criteria
   - Schedule visit for tomorrow
5. Register interaction:
   - Channel: phone
   - Result: interested, visit scheduled
   - Notes: "Prefers sea views, flexible in m²"
6. Update status to "Qualified"
7. Link with 3 **Properties** from portfolio that fit
8. Create **Task**: "Send dossier of 3 villas to Lead 1 today 14:00h"
9. Repeat with Lead 2 and 3 (emails if they don't answer phone)

### 
- **Leads** attended to < 2h since entry
- Increase in effective contact ratio
- **Pipeline** full of active opportunities

### Case 2: Unblock **Properties** Pipeline

### Move **Properties** stuck in "Valuation".

### 
1. Open **Dashboard** and review **PropertyPipeline**
2. Detect: 8 **Properties** in "Valuation" (bottleneck)
3. Open **Properties** and filter by status "Valuation"
4. For each **Property**:
   - Verify complete data (address, m², photos)
   - If data is missing → contact owner to complete
   - If data is complete → execute CMA:
     - Use **RadarTerritorial** for area context
     - Compare with similar **Properties**
     - Calculate recommended price
   - Register CMA in **Property** notes
   - Change status to "Listed"
5. For listed **Properties**, publish on portals:
   - Open **Feed Orchestrator**
   - Select Idealista
   - Validate each **Property**
   - Press **Publish**
6. Create follow-up **Tasks**:
   - "Monitor Idealista visits - Andratx Villa" (in 3 days)

### 
- **Pipeline** unblocked
- 8 **Properties** actively published
- Increased visibility on portals

### 6.3 By Role: Agent

### Case 1: Execution of Daily **Tasks**

### Complete assigned **Tasks** without accumulating backlog.

### 
1. 9:00h, open **Dashboard**
2. Review **TasksToday**:
   - 5 pending **Tasks**
   - 2 overdue (yesterday) 
   - 3 for today
3. Mentally order by commercial impact:
   - **Task** 1 (overdue): "Call Ana García - proposal follow-up" → URGENT
   - **Task** 2 (today): "Send villa dossier to Lead X" → HIGH
   - **Task** 3 (today): "Update **Property** Y photos" → MEDIUM
   - **Task** 4 (today): "Review CMA zone Z" → LOW
   - **Task** 5 (overdue): "Organize files" → LOW
4. Execute **Task** 1:
   - Call Ana García
   - Result: "Interested but needs to consult with husband"
   - Register result in notes
   - Reschedule follow-up for within 2 days
   - Mark as completed (with rescheduling)
5. Execute **Task** 2:
   - Open Lead X
   - Select 3 villas from portfolio
   - Send dossier by email
   - Register action
   - Mark as completed
6. Execute **Task** 3:
   - Open **Property** Y in `/properties`
   - Upload new photos (7 HD photos)
   - Update description
   - Save changes
   - Mark **Task** as completed
7. **Tasks** 4 and 5 (not critical):
   - Reschedule for tomorrow
   - Add note: "Prioritized commercial **Tasks**"

### 
- Zero critical **Tasks** overdue
- Commercial follow-ups executed
- Backlog managed with criteria

### Case 2: Follow-up of Active Match

### Advance match through **Pipeline** until visit.

### 
1. Open **Prospection operativa**
2. Filter by "Contacted" (matches already contacted)
3. Locate match "Ana García - Andratx Villa" (score 88)
4. Open match detail
5. Review last interaction:
   - Date: 3 days ago
   - Channel: email
   - Result: "Interested, wants to know more"
6. Follow-up action:
   - Call Ana
   - Present villa in detail
   - Answer questions
   - Propose visit for this Friday
7. Ana accepts visit:
   - Register activity: "Visit scheduled Friday 14:00h"
   - Change match status to "Viewing"
   - Create **Task**: "Prepare villa for visit Friday"
   - Create **Task**: "Call Ana Friday 13:00h to confirm"

### 
- Match advanced in **Pipeline**
- Visit scheduled
- Higher probability of closure

## 7. Troubleshooting

### 7.1 Common Errors

#### Error: "Email or password incorrect"

Invalid credentials or user does not exist.

1. Check that the email is correct (no spaces, lowercase)
2. Check that the password is correct
3. If you forgot your password:
   - Click "Forgot my password"
   - Enter your email
   - Check your inbox (and spam)
   - Follow the recovery link
4. If the issue persists:
   - Check that your account is created
   - Contact the Owner to verify your membership

---

#### Error: "Access restricted" in Team module

Your role does not have permissions to manage the team.

1. Check your role in 
2. Only the Owner has full access to 
3. If you are a Manager or Agent, you cannot:
   - Invite members
   - Change roles
   - Suspend accounts
4. If you need these permissions:
   - Contact the Owner
   - Request a promotion to Owner (if applicable)
   - The Owner can adjust your role from 

---

#### Error: "Inactive account"

Your membership is not active in the organization.

1. Your status may be:
   -  Invitation not accepted → accept the invitation
   -  Account temporarily blocked → contact the Owner
   -  Out of organization → request a new invitation
2. Contact the Owner:
   - Provide your email
   - Request reactivation
3. The Owner can:
   - Reactivate your account from 
   - Resend the invitation
   - Create a new membership

---

#### Error: "Not invited / Invitation required"

You are trying to create an account without a valid invitation.

1. Anclora Nexus is invite-only
2. You cannot create an account without a prior invitation
3. Request an invitation from the Owner:
   - Provide your email
   - Specify your expected role (Agent, Manager)
4. The Owner will send you an invitation from 
5. You will receive an email with a link
6. Follow the link to complete registration

---

#### Error: Correct login but cannot access the Dashboard

Successful authentication but membership is not active or does not exist.

1. Check that your membership is active:
   - Ask the Owner to review your status in 
   - It should be in the "Active" state
2. Reload the page (Ctrl+F5 or Cmd+Shift+R)
3. Clear browser cache
4. Try in incognito mode
5. If the issue persists:
   - Log out completely
   - Log back in
6. If it still does not work:
   - Contact the Tech Lead
   - Provide: email, expected role, timestamp of attempt

---

#### Error: Widget does not load data (infinite spinner)

Backend error, timeout, or insufficient permissions.

1. Reload the page (F5)
2. Check your internet connection
3. Open the browser console (F12):
   - Go to the "Console" tab
   - Look for errors in red
   - Copy the error message
4. If you see a 403 (Forbidden) error:
   - Your role does not have access to that data
   - Check permissions with the Owner
5. If you see a 500 (Server Error):
   - Backend error
   - Report to the Tech Lead with:
     - Affected widget
     - Exact time
     - Error message (screenshot)

---

#### Error: "Budget limit exceeded"

You have reached the hard stop of the monthly LLM budget.

1. This is a constitutional hard stop
2. The system automatically blocks agent executions
3. Options:
   -  The limit resets on the 1st
   - 
     - Contact the Owner
     - Justify the need for an increase
     - The Owner can adjust from  → FinOps
4. In the meantime:
   - You can use manual functionality (without AI agents)
   - Prioritize critical tasks
   - Reduce non-essential executions

---

#### Error: Cannot upload property photos

File is too large, unsupported format, or storage permissions.

1. Check the format:
   - Supported: JPG, PNG, WebP
   - Not supported: TIFF, BMP, RAW
2. Check the size:
   - Maximum per photo: 10MB
   - If it is larger, compress the image:
     - Use tools like TinyPNG
     - Reduce resolution to 1920x1080 maximum
3. Check permissions:
   - Agent and Manager roles can upload photos
   - If you are an Agent, check that there is no restrictive policy
4. If the issue persists:
   - Try uploading one photo at a time
   - Reload the page and try again
   - Contact the Tech Lead if it fails systematically

---

### 7.2 FAQ

#### Can I use Anclora Nexus from my mobile device?

Yes, the interface is responsive and works on mobile browsers.

- For a better experience, use a tablet (10"+) or desktop
- On mobile (< 7"), some widgets may be difficult to use
- Critical functions (leads, tasks) are optimized for mobile

---

#### How do I change the interface language?

1. Use the language selector (🌐) in the top right header
2. Supported languages:
   - ES (Spanish) - Default
   - EN (English)
   - DE (German)
   - RU (Russian)
3. The change is instantaneous (no need to reload)
4. Your preference is saved in localStorage

---

#### What does each lead status mean?

| Status | Meaning | Typical next action |
|--------|-------------|-------------------------|
|  | New lead, not contacted | Contact within 24h |
|  | First interaction made | Qualify and validate budget |
|  | Lead with confirmed potential | Send proposals |
|  | Commercial offer sent | Follow up, schedule visit |
|  | Lead converted to client | Close operation |
|  | Lead discarded | Record reason, archive |

---

#### Can I export data from the application?

Yes, most tables have an export option.

1. Go to the module (Leads, Properties, Tasks)
2. Apply filters if you want to export a subset
3. Look for the "Export" button (📥 icon)
4. Select the format:
   - CSV (for Excel, Google Sheets)
   - JSON (for processing)
5. The file will be downloaded automatically

- Owner and Manager: can export everything
- Agent: can export only assigned leads/tasks

Data sensitive (passwords, API keys) is not included in exports.

---

#### How often is the RadarTerritorial updated?

It depends on the NotebookLM sync pack.

- Scheduled sync:  (automatic cron)
- Manual sync: You can run it on-demand from 

1. Open 
2. Go to the "Territorial Sync Status" card
3. Check the timestamp of the last execution

1. Run a manual refresh:
   - "Refresh Territorial Sync" button
   - Estimated time: 2-5 minutes
2. If it fails:
   - Check  for alerts
   - Contact the Tech Lead

---

#### How do I know if a seller is P5 (Whale)?

The system calculates priority automatically with IA scoring.

-  Property value (absolute price and €/m²)
-  Urgency of sale (days on market, motivation signals)
-  Fit with target area (Andratx, Calvià premium)
-  Quality of source (StateFox > FSBO > manual)

-  Score 80-100 → Almost certain mandate
-  Score 60-79 → High potential
-  Score 40-59 → Medium potential
-  Score 20-39 → Low potential
-  Score 0-19 → Cold

- Golden badge with "P5" in the sellers table
- Automatic notification when a new P5 is detected
- Appears first in default sorting

---

#### What do I do if I detect an error in the application?

Report the error with as much detail as possible.

1.  Your user
2.  Eg: "/leads, when trying to change lead status"
3.  Screenshot or full text
4.  Eg: "Today 10:30h"
5.  Eg: "Chrome 120 on Windows 11"
6.  What you did before the error

- Create a task in  with title "BUG: [short description]"
- Assign to Owner
- Owner will escalate to Tech Lead if necessary

-  You cannot work → Report immediately (call/WA)
-  Affects key functionality → Report today
-  Affects secondary functionality → Report this week
-  Cosmetic or typo → Report when you have time

---

#### Can I use Anclora Nexus offline?

No, Anclora Nexus requires an active internet connection.

- Real-time data from Supabase
- Execution of AI agents requires connectivity
- Territorial sync consumes external APIs

- Ensure a stable connection before working
- If you lose connection, save local changes when it returns
- Some browsers cache the UI, but functionality requires internet

## 8. Appendices

### 8.1 Permission Matrix by Role

| Module / Action | Owner | Manager | Agent |
|------------------|-------|---------|-------|
| **Dashboard** (view) | ✅ | ✅ | ✅ |
| **Leads** (view all) | ✅ | ✅ | ❌ (only assigned) |
| **Leads** (create/edit) | ✅ | ✅ | ✅ |
| **Properties** (view) | ✅ | ✅ | ✅ (read-only) |
| **Properties** (create/edit) | ✅ | ✅ | ❌ |
| **Tasks** (view all) | ✅ | ✅ | ❌ (only assigned) |
| **Tasks** (create/assign) | ✅ | ✅ | ✅ (only to self) |
| **Team** (view) | ✅ | ✅ (read-only) | ❌ |
| **Team** (manage) | ✅ | ❌ | ❌ |
| **Prospection** (view) | ✅ | ✅ | ✅ |
| **Sellers** (view) | ✅ | ✅ | ✅ |
| **Sellers** (contact) | ✅ | ✅ | ✅ |
| **Intelligence** (view) | ✅ | ✅ | ❌ |
| **Ingestion** (view) | ✅ | ✅ | ❌ |
| **Data Quality** (resolve) | ✅ | ✅ | ❌ |
| **Feed Orchestrator** (publish) | ✅ | ✅ | ❌ |
| **Automation** (manage) | ✅ | ❌ | ❌ |
| **Command Center** (view) | ✅ | ❌ | ❌ |

### 8.2 Glossary of Terms

| Term | Definition |
|---------|------------|
| **CMA** | Comparative Market Analysis - Comparative market analysis |
| **FSBO** | For Sale By Owner - Property for sale without an agent |
| **HITL** | Human-In-The-Loop - Mandatory human review |
| **ICP** | Ideal Client Profile - Ideal client profile |
| **NotebookLM** | Google tool for RAG (Retrieval-Augmented Generation) |
| **P5 (Whale)** | High-priority Seller (score 80-100) |
| **RLS** | Row-Level Security - Row-level security in database |
| **StateFox** | Telegram channel for seller-side opportunity detection |
| **Sync Pack** | Document package synchronized with NotebookLM |

### 8.3 Keyboard Shortcuts

| Shortcut | Action |
|-------|--------|
| `Ctrl + K` (or `Cmd + K`) | Open global search |
| `Ctrl + /` | Open command palette |
| `Escape` | Close modal/drawer |
| `Ctrl + S` | Save changes (in forms) |
| `Ctrl + Enter` | Submit form |

---

## 9. Contact Information and Support

**Organización:** Anclora Private Estates by eXp Realty Spain

**Owner:** Toni Amengual
- Email: toni@anclora.com
- Phone: [Confidential]

**Soporte Técnico:**
- Email: tech@anclora.com
- Hours: Monday to Friday, 9:00h - 18:00h CET

**Reportar Bugs:**
- Create task in `/tasks` with prefix "BUG:"
- For critical issues: direct contact with Owner

---

## 10. Version History of the Manual

| Version | Date | Changes |
|---------|-------|---------|
| 1.2.3 | 2026-03-10 | Complete manual generated automatically with ANCLORA-UMG-001 |
| 1.2.2 | 2026-03-05 | Previous manual version (partial) |

---

**Fin del Manual de Usuario - Anclora Nexus v1.2.3**

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>

---

© 2026 Anclora Private Estates. All rights reserved.