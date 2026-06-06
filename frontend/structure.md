# VendorBridge — UI Structure Documentation

> **Four roles operate this system:** Admin · Manager/Approver · Procurement Officer · Vendor
> Each screen section below explicitly states which role sees which element, what they can do, and what is hidden from them.

---

## Role Quick Reference

| Role | Primary Responsibility | Key Screens |
|---|---|---|
| **Admin** | System oversight, user/vendor management, full audit access | Dashboard, Vendors, Reports, Activity |
| **Manager / Approver** | Approve or reject procurement decisions | Dashboard, Approvals, Reports |
| **Procurement Officer** | Drive the full procurement cycle | Dashboard, Vendors, RFQs, Quotations, PO & Invoice |
| **Vendor** | Respond to RFQs and track own orders | Dashboard, RFQs (received), Quotations, PO & Invoice |

---

---

# Screen 01 — Login Screen

## Purpose

Authenticate users and route them to the correct role-based dashboard.

## Accessible Roles

All four roles share this screen. Post-authentication, each is redirected according to their role.

---

## Layout Structure

Centered authentication card on a clean, minimal background. No ERP modules are visible before login.

---

## Login Card

### Profile / Branding Area

- Circular image placeholder (organization logo or auth icon) centered above the input fields.

### Login Form

**Username Field**
- Type: Text input
- Purpose: Accept registered username or email
- Validation: Required; show inline error when empty

**Password Field**
- Type: Password input (characters hidden)
- Validation: Required; show "Invalid credentials" on mismatch

### Login Button

- Positioned below the password field, center-aligned
- On click: validate → authenticate session → identify role → redirect

---

## Role-Based Redirection After Login

**Admin**
- Lands on: Dashboard (system-wide overview)
- Sidebar unlocks: Dashboard, Vendors, RFQs, Quotations, Approvals, Purchase Orders, Invoices, Reports, Activity

**Manager / Approver**
- Lands on: Dashboard (approval-focused overview)
- Sidebar unlocks: Dashboard, Approvals, Reports, Activity

**Procurement Officer**
- Lands on: Dashboard (procurement-focused overview)
- Sidebar unlocks: Dashboard, Vendors, RFQs, Quotations, Purchase Orders, Invoices, Activity

**Vendor**
- Lands on: Dashboard (RFQ and order overview)
- Sidebar unlocks: Dashboard, RFQs (received only), Quotations, Purchase Orders, Invoices, Activity

---

## UI Rules

- No ERP modules visible before authentication.
- Fields aligned vertically, consistent spacing.
- Role-based redirection is automatic — the user never selects their own destination.

---

---

# Screen 02 — Registration Screen

## Purpose

Onboard new users and vendors into VendorBridge with role assignment and profile information.

## Accessible Roles

This screen is publicly accessible (pre-login). Role is self-selected during registration but access is governed by admin approval for internal roles.

---

## Layout Structure

Single large panel containing: profile image upload → personal info form → additional info → register action.

---

## Profile Section

- Circular photo upload placeholder at the top-center of the form.
- Actions: Upload photo / Replace photo / Remove photo
- Preview selected image before submission.

---

## User Information Form — Two-Column Layout

**Row 1**
- First Name (text, required, alphabets only)
- Last Name (text, required, alphabets only)

**Row 2**
- Email Address (email input, required, unique check, used for login and notifications)
- Phone Number (phone input, required, valid format)

**Row 3**
- Role Selection (dropdown)
- Country (dropdown or text input)

### Role Selection Options & Behavior

| Role Selected | Access Granted |
|---|---|
| Admin | Full system access (requires admin approval) |
| Manager | Approval workflow access |
| Procurement Officer | RFQ, vendor, PO, and invoice management |
| Vendor | External quotation and order access only |

---

## Additional Information Section

Large multiline text area. Content expected varies by selected role:

- **Vendor:** Company name, GST details, vendor category, business address
- **Internal Users (Admin / Manager / Procurement Officer):** Department, employee ID, designation

---

## Register Button

- Position: Bottom center, outside form container
- On click: validate all fields → create profile → assign role → store info → redirect to Login screen

---

## UI Rules

- Two-column form layout throughout.
- Photo upload sits above all form fields.
- Register button is outside and below the form container.
- Form is responsive across screen sizes.

---

---

# Screen 03 — Main Dashboard

## Purpose

Centralized procurement overview. Content and available actions adapt dynamically based on the logged-in role.

## Accessible Roles

All four roles see this screen. The data, cards, tables, and quick actions shown differ per role.

---

## Layout Structure

1. Top Navigation Bar (persistent)
2. Left Sidebar Navigation (role-filtered)
3. Welcome Header
4. Analytics Summary Cards
5. Recent Purchase Orders Table
6. Spending Trend Chart
7. Quick Action Buttons

---

## Top Navigation Bar

- **Left:** VendorBridge branding (always visible)
- **Right:** User profile avatar → View profile / Account settings / Logout

---

## Sidebar Navigation — Role Visibility Matrix

| Menu Item | Admin | Manager | Procurement Officer | Vendor |
|---|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Vendors | ✓ | — | ✓ | — |
| RFQs | ✓ | — | ✓ | ✓ (received only) |
| Quotations | ✓ | — | ✓ | ✓ (own only) |
| Approvals | ✓ | ✓ | — | — |
| Purchase Orders | ✓ | ✓ | ✓ | ✓ |
| Invoices | ✓ | — | ✓ | ✓ |
| Reports | ✓ | ✓ | — | — |
| Activity | ✓ | ✓ | ✓ | ✓ (own only) |

Active item highlighted with background indicator.

---

## Welcome Header (Dynamic by Role)

| Role | Welcome Text |
|---|---|
| Admin | "Welcome back, Admin — System Overview" |
| Manager | "Welcome back, [Name] — Approval Overview" |
| Procurement Officer | "Welcome back, [Name] — Today's Overview" |
| Vendor | "Welcome back, [Name] — RFQ Overview" |

---

## Analytics Summary Cards — Role Visibility Matrix

| Card | Admin | Manager | Procurement Officer | Vendor |
|---|---|---|---|---|
| Active RFQs | ✓ | — | ✓ | ✓ (own) |
| Pending Approvals | ✓ | ✓ | ✓ | — |
| PO Value This Month | ✓ | ✓ | ✓ | — |
| Active Vendor Count | ✓ | — | ✓ | — |

---

## Recent Purchase Orders Table

Columns: PO Number · Vendor · Amount · Status

| Role | Sees |
|---|---|
| Admin | All POs organization-wide |
| Manager | POs linked to approved requests |
| Procurement Officer | POs they created |
| Vendor | Own POs only |

Actions: View PO details · Track status

---

## Spending Trend Analytics Chart

- Component: Bar/line chart showing monthly spending and procurement statistics.
- Visible to: Admin, Manager
- Hidden from: Procurement Officer (sees own PO stats only), Vendor

---

## Quick Action Buttons — Role Visibility

| Button | Visible To | Action |
|---|---|---|
| Create RFQ | Procurement Officer | Navigate to RFQ creation |
| Add Vendor | Admin, Procurement Officer | Open vendor registration |
| View Reports | Admin, Manager | Open Reports & Analytics |

---

## Role-Based Dashboard Summary

**Admin:** Full system metrics — users, vendors, analytics, reports, activity logs.

**Manager:** Pending approvals queue, approval history, procurement performance.

**Procurement Officer:** Active RFQs, vendor status, quotations, purchase orders, invoice actions.

**Vendor:** Assigned RFQs, own submitted quotations, own purchase orders, invoice payment status.

---

## UI Rules

- Sidebar fixed on left, always visible.
- Analytics cards in one horizontal row.
- Tables for recent records; charts for spending analytics.
- Unauthorized modules hidden automatically based on role — never shown as disabled.

---

---

# Screen 04 — Vendor Management Page

## Purpose

Manage supplier profiles, registrations, and vendor status throughout the procurement lifecycle.

## Accessible Roles & Permissions

| Action | Admin | Manager | Procurement Officer | Vendor |
|---|---|---|---|---|
| Add vendor | ✓ | — | ✓ | — |
| View all vendors | ✓ | ✓ (read-only) | ✓ | — |
| Edit vendor information | ✓ | — | — | — |
| Manage vendor status | ✓ | — | — | — |
| Search / filter vendors | ✓ | ✓ | ✓ | — |
| View own profile only | — | — | — | ✓ |

---

## Layout Structure

1. Top Navigation Bar
2. Left Sidebar (Vendors highlighted)
3. Page Header + Add Vendor button
4. Search Bar
5. Status Filter Tabs
6. Vendor Data Table

---

## Page Header

- Title: "Vendors"
- Subtitle: "Manage supplier profiles and registrations"
- **Add Vendor button** (top-right): Visible to Admin and Procurement Officer only.

### Add Vendor Form Fields (on click)

Vendor Name · Category · GST Number · Contact Person · Email · Phone Number · Address · Country · Vendor Status

---

## Search Bar

- Placeholder: "Search vendor name, contact, category..."
- Searches by: Vendor name / Category / GST number / Contact person

---

## Status Filter Tabs

| Filter | Shows |
|---|---|
| All | All registered vendors |
| Active | Approved vendors eligible for RFQs |
| Pending | Vendors awaiting approval |
| Removed | Disabled/inactive vendors |

---

## Vendor Data Table

Columns: Vendor Name · Category · GST No. · Contact · Status · Actions

**Status values:** Active · Pending · Removed

**Actions column:**

| Action | Admin | Manager | Procurement Officer | Vendor |
|---|---|---|---|---|
| View | ✓ | ✓ | ✓ | Own only |
| Edit | ✓ | — | — | — |
| Remove / Deactivate | ✓ | — | — | — |

---

## Vendor Detail View (on "View" click)

Sections displayed:
- **Company:** Name, category, GST details
- **Contact:** Contact person, email, phone
- **Procurement history:** Assigned RFQs, submitted quotations, purchase orders, performance rating

---

## Role-Based Behavior Summary

**Admin:** Full management — add, edit, remove, status control.

**Manager:** Read-only vendor list and performance view. No add/edit controls shown.

**Procurement Officer:** Add vendor, search, filter, select vendors for RFQ assignment.

**Vendor:** Sees only their own profile page. Vendor table and all management controls are hidden.

---

## UI Rules

- Highlight "Vendors" in sidebar.
- Add Vendor button top-right (hidden for Manager and Vendor).
- Search bar above table; filter tabs between search and table.
- Pagination for large vendor lists.
- Actions restricted by role — hidden rather than disabled where unauthorized.

---

---

# Screen 05 — RFQ Creation Page

## Purpose

Allow procurement officers to create Request for Quotations, define procurement requirements, assign vendors, and launch the procurement workflow.

## Accessible Roles & Permissions

| Role | Access |
|---|---|
| Procurement Officer | Create, edit, publish RFQs; assign vendors; upload attachments |
| Admin | View all RFQs; monitor activity |
| Manager | View RFQ details during approval process |
| Vendor | Receive assigned RFQs only — cannot create or view creation form |

---

## Layout Structure

1. Top Navigation Bar
2. Left Sidebar (RFQs highlighted)
3. Page Header
4. 3-Step Progress Indicator
5. RFQ Information Form (left pane)
6. Item List + Vendor Selection (right pane)
7. Attachment Upload Section
8. Action Buttons (bottom)

---

## 3-Step Progress Indicator

| Step | Label | Active When |
|---|---|---|
| 1 | RFQ Information | Entering basic details |
| 2 | Vendor & Item Details | After step 1 complete |
| 3 | Review & Publish | Final verification |

---

## RFQ Information Form (Left Pane)

**RFQ Title** — Text input, required, unique identifier.
Example: "Office Network Equipment RFQ"

**Category** — Dropdown. Options: Hardware / Software / Office Supplies / Services / other.

**Deadline** — Date picker. Cannot select a past date.

**Description** — Multiline text area.
Contains: product/service requirements, technical specifications, special instructions.

---

## Item List (Right Pane — Upper)

Editable table. Columns: Item Name · Quantity · Unit

"+ Add Item" button adds a new row. Each row allows quantity editing and item removal.

---

## Vendor Selection (Right Pane — Lower)

Displays selected vendors as removable chips: "Vendor Name ×"

"+ Add Vendor" opens a popup allowing search, filter, and multi-select from the registered vendor list.

Visible to: Procurement Officer only.

---

## Attachment Upload

Drag-and-drop file area. Supported: PDF, documents, images.
Purpose: Product specifications, requirement documents, supporting files.

---

## Action Buttons

| Button | Behavior | Status Set |
|---|---|---|
| Save as Draft | Saves incomplete RFQ without notifying vendors | Draft |
| Save & Publish | Validates → saves → notifies assigned vendors → activates RFQ | Active |

---

## Role-Based Screen Behavior

**Procurement Officer:** Full creation form, vendor assignment, publish controls visible.

**Admin:** RFQ list and monitoring view. Creation form accessible if permitted.

**Manager:** Read-only RFQ details view, approval-related information. No editing controls.

**Vendor:** Sees assigned RFQs in RFQ list. RFQ creation form is entirely hidden.

---

## UI Rules

- Step indicator at top of content area.
- Left pane: RFQ form. Right pane: items and vendors.
- Attachment upload below vendor section.
- Action buttons at bottom of page.
- Unauthorized roles cannot access or trigger creation controls.

---

---

# Screen 06 — Quotation Submission Page

## Purpose

Allow vendors to submit structured quotations against assigned RFQs, including pricing, delivery timelines, tax, and notes.

## Accessible Roles & Permissions

| Role | Access |
|---|---|
| Vendor | View assigned RFQ; enter prices and delivery; save draft; submit quotation |
| Procurement Officer | View submitted quotations; access comparison from this screen |
| Manager | Review quotation during approval; read-only |
| Admin | Monitor all quotation activity; read-only audit access |

---

## Layout Structure

1. Top Navigation Bar
2. Left Sidebar (Quotations highlighted)
3. Page Header + RFQ Information
4. RFQ Summary Box (read-only)
5. Quotation Items Table (editable by Vendor)
6. Additional Cost Section (tax/GST)
7. Vendor Notes Section
8. Quotation Summary Card (right)
9. Action Buttons

---

## Page Header

- Title: "Submit Quotation"
- RFQ context line: "RFQ: Office Furniture Procurement · Deadline: 15 June 2025"
- Informs vendor which procurement request they are responding to.

---

## RFQ Summary Box (Read-Only)

Displays: RFQ title · requested items · quantity requirements · description summary.
Example: "Requirement: Chairs ×20, Standing Desk ×10, ergonomic furniture"

---

## Quotation Items Table

| Column | Editable | Notes |
|---|---|---|
| Item Name | No (read-only) | Pulled from RFQ |
| Quantity | No (read-only) | Pulled from RFQ |
| Unit Price | Yes (Vendor only) | Required, numeric |
| Total | No (auto-calculated) | Quantity × Unit Price |
| Delivery Days | Yes (Vendor only) | Required, numeric |

---

## Additional Cost Section (Bottom-Left)

**Tax / GST %** — Numeric input. Used to calculate tax on the summary card.

---

## Vendor Notes Section

Multiline text area. Placeholder: "Payment terms, delivery notes..."
Vendor can include: payment terms / warranty / special conditions / additional comments.

---

## Quotation Summary Card (Right Side)

Auto-calculated, updates in real time:
- Subtotal (sum of all item totals)
- GST / Tax (based on entered percentage)
- **Grand Total** (Subtotal + Tax)

---

## Action Buttons

| Button | Behavior | Status Set |
|---|---|---|
| Save Draft | Stores quotation temporarily; allows editing before deadline; not sent to procurement | Draft |
| Submit Quotation | Validates → calculates → locks → sends to procurement team | Submitted |

Editing is disabled after final submission.

---

## Role-Based Screen Behavior

**Vendor:** Full quotation entry form — price input, delivery days, notes, submit button all active.

**Procurement Officer:** Read-only view of submitted quotation. Link to comparison page visible.

**Manager:** Read-only quotation summary. Approval-related information displayed.

**Admin:** All quotation records accessible for audit. No editing controls.

---

## UI Rules

- RFQ information displayed at top for context.
- Quotation table in center.
- Notes and tax section below table.
- Summary card on right side.
- Totals auto-calculate instantly on price entry.
- Submission locks all fields permanently.

---

---

# Screen 07 — Quotation Comparison Page

## Purpose

Allow procurement teams to compare multiple vendor quotations side-by-side and select the most suitable vendor before initiating the approval workflow.

## Accessible Roles & Permissions

| Role | Access |
|---|---|
| Procurement Officer | View full comparison; select preferred quotation; forward for approval |
| Manager | Review selected quotation and comparison history; approve/reject from Approvals screen |
| Admin | View complete comparison records and audit trail |
| Vendor | Cannot view competitor quotations — sees only own quotation status |

---

## Layout Structure

1. Top Navigation Bar
2. Left Sidebar (Quotations highlighted)
3. Page Header + RFQ Context
4. Comparison Matrix Table
5. Best Quotation Highlight
6. Vendor Selection Actions
7. Recommendation Message

---

## Page Header

- Title: "Quotation Comparison"
- RFQ context: "RFQ: Office Furniture Procurement · 3 quotations received"

---

## Comparison Matrix Table

**Structure:** First column = criteria labels. Each subsequent column = one vendor's quotation.

**Criteria Rows:**

| Criteria | Description |
|---|---|
| Grand Total | Full quoted amount |
| GST % | Applied tax rate |
| Delivery Days | Expected delivery timeline |
| Vendor Rating | Historical performance score |
| Payment Terms | Number of days for payment |

**Example vendor columns:** ABC Supplier · TechStore LTD · Office Mart Corp

---

## Best Quotation Highlight

System automatically highlights the recommended column using a weighted score of: lowest total price + fastest delivery + highest vendor rating + favorable payment terms.

Visual rule: Highlighted column (green background) = system recommendation.

---

## Vendor Selection Actions

Each vendor column has a "Select" button at the bottom.

**On click:**
1. Mark that vendor's quotation as selected.
2. Store the procurement decision.
3. Forward quotation to approval workflow.
4. Notify manager.

**Status changes:**
- RFQ → "Under Review"
- Selected Quotation → "Pending Approval"
- Manager → receives approval request notification

---

## Recommendation Message

Displayed below the comparison table.
Example: "Green = Best overall score. Delivery timeline requires validation through the approval workflow."

---

## Role-Based Screen Behavior

**Procurement Officer:** Full matrix, all vendor pricing visible, selection buttons active.

**Manager:** Selected quotation highlighted; comparison visible for context; selection cannot be modified here (approval actions are on Screen 08).

**Admin:** Complete comparison records and audit trail.

**Vendor:** Competitor quotations and pricing are entirely hidden. Vendor sees only the status of their own submitted quotation.

---

## UI Rules

- Vendor columns displayed horizontally.
- Comparison criteria fixed on the left column.
- Recommended quotation highlighted with distinct color.
- Selection button below each vendor column.
- Competitor data is never exposed to vendor accounts under any condition.

---

---

# Screen 08 — Approval Workflow Page

## Purpose

Provide a structured authorization step where managers review selected vendor quotations, add remarks, and approve or reject procurement decisions before purchase orders are generated.

## Accessible Roles & Permissions

| Role | Access |
|---|---|
| Manager / Approver | View pending requests; review quotation; add remarks; approve or reject |
| Procurement Officer | Track approval status; view manager remarks; receive outcome notifications |
| Admin | Monitor all approval workflows; complete audit history |
| Vendor | Cannot access approval workflow — sees only final RFQ/order status |

---

## Layout Structure

1. Top Navigation Bar
2. Left Sidebar (Approvals highlighted)
3. Approval Header with Procurement Context
4. 4-Step Workflow Progress Tracker
5. Approval Timeline (left)
6. Quotation Summary Card (right)
7. Approval Remarks Text Area
8. Approve / Reject Action Buttons

---

## Page Header

- Title: "Approval Workflow"
- Context line: "RFQ: Office Furniture RFQ · Vendor: Infra Supplies · ₹18,500"
- Gives approver immediate procurement context without additional navigation.

---

## 4-Step Workflow Progress Tracker

| Step | Label | Status |
|---|---|---|
| 1 | Submitted | Completed (Procurement Officer submitted) |
| 2 | Review | Completed / In Progress |
| 3 | Approval | Current active step |
| 4 | Ordered | Unlocked after approval |

---

## Approval Timeline (Left Panel)

Vertical event log showing:
- Submission date and time
- Review actions
- Any prior remarks or partial steps

---

## Quotation Summary Card (Right Panel)

Read-only display for the approver:
- Vendor Name
- Total Amount
- Delivery Timeline
- Vendor Rating

Allows approval decision without navigating away from the screen.

---

## Approval Remarks Text Area

- Placeholder: "Add your comments or conditions..."
- Manager enters: approval comments / rejection reason / additional instructions
- **Remarks are mandatory before rejection.** Optional for approval.

---

## Decision Action Buttons

| Button | Visible To | On Click Behavior |
|---|---|---|
| Approve | Manager / Approver | Save remarks → set status to Approved → enable PO generation → notify Procurement Officer |
| Reject | Manager / Approver | Require remarks → save rejection reason → set status to Rejected → notify Procurement Officer |

---

## Workflow State Machine

```
Draft
  ↓
Quotation Submitted
  ↓
Under Review
  ↓
Pending Approval
  ↓
Approved ──→ Purchase Order Created
  ↓ (or)
Rejected ──→ Procurement Officer notified to restart
```

---

## Role-Based Screen Behavior

**Manager:** Full workflow view — timeline, quotation summary, remarks box, approve and reject buttons all active.

**Procurement Officer:** Approval stage tracker and manager remarks visible. Approve/Reject buttons are hidden.

**Admin:** All approval workflows and complete audit history accessible.

**Vendor:** Internal approval process is entirely hidden. Vendor sees only the final order status.

---

## UI Rules

- Approvals sidebar item highlighted.
- Workflow tracker at top of content area.
- Timeline on left; quotation summary card on right.
- Approve/Reject buttons below quotation details.
- Rejection requires remarks before button activates.
- Every approval action is stored in Activity & Logs automatically.
- Unauthorized users cannot trigger approval actions under any condition.

---

---

# Screen 09 — Purchase Order & Invoice Page

## Purpose

Convert approved vendor quotations into official purchase orders, generate invoices with full tax calculation, and support printing, PDF download, email delivery, and payment tracking.

## Accessible Roles & Permissions

| Action | Admin | Manager | Procurement Officer | Vendor |
|---|---|---|---|---|
| View PO / Invoice | ✓ | ✓ (read-only) | ✓ | Own only |
| Download PDF | ✓ | — | ✓ | ✓ |
| Print | ✓ | — | ✓ | ✓ |
| Email Invoice | ✓ | — | ✓ | — |
| Mark as Paid | ✓ | — | ✓ | — |
| Edit invoice details | — | — | — | — |

Invoice details are never editable post-generation — all data comes from the approved quotation.

---

## Layout Structure

1. Top Navigation Bar
2. Left Sidebar (Invoices highlighted)
3. PO Header + Auto-generated PO Number
4. Document Action Buttons (top-right)
5. Buyer Details Card (left)
6. Vendor Details Card (right)
7. PO / Invoice Date Information
8. Invoice Item Table
9. Calculation Summary (bottom-right)
10. Payment Status Section (bottom-left)

---

## PO Header

- Title: "Purchase Order & Invoice"
- PO Number: Auto-generated on approval (e.g., PO-2025-006). Unique, system-generated, cannot be manually set.

---

## Document Action Buttons (Top-Right)

| Button | Available To | Behavior |
|---|---|---|
| Download PDF | Admin, Procurement Officer, Vendor | Generate and download complete invoice as PDF |
| Print | Admin, Procurement Officer, Vendor | Open system print dialog |
| Email Invoice | Admin, Procurement Officer | Attach invoice PDF and send to vendor email; log event in Activity |

---

## Buyer Details Card

Fields: Organization name · Address · GST number · Contact information

---

## Vendor Details Card

Fields: Vendor company name · Address · GST number · Contact information

---

## Purchase Information Section

PO Number · PO Date · Invoice Date · Due Date (payment deadline)

---

## Invoice Item Table

| Column | Source | Editable |
|---|---|---|
| Item | Approved quotation | No |
| Quantity | Approved quotation | No |
| Unit Price | Vendor's quoted price | No |
| Total | Quantity × Unit Price (auto) | No |

---

## Calculation Summary (Bottom-Right)

- Subtotal: Sum of all line item totals
- GST / Tax: Auto-calculated from quotation tax rate
- Discount: Applied if available
- **Grand Total: Subtotal + Tax − Discount**

---

## Payment Status Section (Bottom-Left)

Current status displayed: Pending Payment · Paid

**Mark as Paid button:** Visible to Procurement Officer and Admin only.
On click: update invoice status → log payment activity → notify vendor.

---

## Invoice Workflow

```
Approved Quotation
  ↓
Purchase Order Auto-Generated
  ↓
Invoice Generated
  ↓
Send / Print / Download
  ↓
Payment Tracking
  ↓
Completed Procurement
```

---

## Role-Based Screen Behavior

**Procurement Officer:** Generate invoice, download PDF, print, email, mark as paid.

**Vendor:** View own purchase order and invoice. Track payment status. Download PDF. No financial controls shown.

**Manager:** Read-only view of procurement documents linked to approvals they authorized.

**Admin:** All purchase orders and all invoices. Full document and reporting access.

---

## UI Rules

- Invoices sidebar item highlighted.
- Document action buttons fixed top-right.
- Buyer/vendor info in bordered side-by-side cards.
- Invoice-style table with auto-calculated totals.
- Calculation summary clearly separated at bottom-right.
- PO number auto-generated; never editable.
- PDF output matches displayed invoice exactly.
- Every invoice action (download, print, email, payment update) logged in Activity automatically.

---

---

# Screen 10 — Activity & Logs Page

## Purpose

Maintain a complete, read-only procurement audit trail. Records all RFQ actions, vendor responses, approval decisions, PO events, and invoice updates across the system.

## Accessible Roles & Permissions

| Role | Sees |
|---|---|
| Admin | Complete organization-wide log — all users, all events, full system audit trail |
| Manager | Approval-related activity only — pending and completed approval records |
| Procurement Officer | RFQ events, vendor responses, approval updates, PO and invoice activity |
| Vendor | Own activity only — received RFQs, own quotations, own orders, own invoice updates. Other vendors and internal approval details are fully hidden. |

---

## Layout Structure

1. Top Navigation Bar
2. Left Sidebar (Activity highlighted)
3. Page Header
4. Log Category Filter Tabs
5. Activity Timeline

---

## Page Header

- Title: "Activity & Logs"
- Subtitle: "Procurement audit trail"

---

## Log Category Filter Tabs

| Filter | Shows |
|---|---|
| All (default) | All event types in chronological order |
| RFQ | RFQ creation, updates, publishing, closing |
| Approval | Approval requests, decisions, rejections, remarks |
| Invoice | Invoice generation, downloads, emails, payment changes |
| Vendor | Vendor registration, status changes, quotation submissions |

Filter tabs are visible to all roles but results are pre-scoped by role permissions automatically.

---

## Activity Timeline

Vertical list, newest events first. Each log item contains:

| Element | Content |
|---|---|
| Icon | Category indicator (document / check / payment / user) |
| Event Title | Main action summary |
| Description | Detailed context |
| Timestamp | Date and time (e.g., 20 Apr 2025, 10:30 AM) |

### Example Log Items

- "Quotation submitted — Vendor Infra Supplies submitted quotation for Office Furniture RFQ" — 20 Apr 2025, 10:30 AM
- "Approval granted — ₹18,500 approved by [Manager Name]" — 21 Apr 2025, 09:15 AM
- "Invoice generated — PO-2025-006 created and emailed to vendor" — 21 Apr 2025, 11:00 AM

---

## Events That Auto-Trigger a Log Entry

**RFQ Events:** RFQ created · RFQ updated · RFQ published · RFQ closed

**Vendor Events:** Vendor registered · Vendor status changed · Quotation submitted

**Approval Events:** Approval request generated · Manager approved · Manager rejected · Remarks added

**Purchase Order Events:** PO generated · PO updated · PO sent

**Invoice Events:** Invoice generated · Invoice downloaded · Invoice printed · Invoice emailed · Payment status changed

---

## UI Rules

- Activity sidebar item highlighted.
- Filter tabs immediately below page title.
- Vertical timeline layout, newest first.
- All records are permanently read-only. Editing and deletion of audit records are never permitted.
- Role-based filtering applied automatically — no manual switching required.
- Every significant ERP transaction generates a log entry without manual action.

---

---

# Screen 11 — Reports & Analytics Page

## Purpose

Provide procurement insights through spending summaries, vendor performance metrics, category analysis, and monthly trends. Supports data-driven decision-making for management roles.

## Accessible Roles & Permissions

| Role | Access |
|---|---|
| Admin | Complete analytics, all vendor performance data, financial reports, export |
| Manager | Approval statistics, procurement performance trends, vendor ranking |
| Procurement Officer | RFQ analytics, PO statistics, own vendor activity |
| Vendor | Restricted — own quotation performance and own order history only (if enabled). Organization-wide spending data is fully hidden. |

---

## Layout Structure

1. Top Navigation Bar
2. Left Sidebar (Reports highlighted)
3. Page Header + Date Filter + Export Button
4. Analytics Summary Cards (4 cards)
5. Spending by Category Chart
6. Top Vendors by Spend Table
7. Monthly Procurement Trend Chart

---

## Page Header

- Title: "Reports & Analytics"
- Subtitle: "Procurement Insights — [Selected Month/Period]"
- Example: "Procurement Insights — May 2025"

---

## Report Controls (Top-Right)

| Control | Function |
|---|---|
| Month Selector (dropdown) | Filter all analytics by month, quarter, or year |
| Export Button | Download report as PDF or Excel — available to Admin and Manager only |

Export includes: procurement summary, vendor analytics, spending data, monthly trends.

---

## Analytics Summary Cards

| Card | Metric | Visible To |
|---|---|---|
| Total Spend | Sum of completed POs (e.g., ₹12.4L) | Admin, Manager, Procurement Officer |
| Active Vendors | Count of approved suppliers (e.g., 28) | Admin, Manager, Procurement Officer |
| PO Fulfilled % | Completed POs ÷ Total POs (e.g., 94%) | Admin, Manager, Procurement Officer |
| Pending Issues | Unresolved approvals + delayed orders + invoice problems (e.g., 3) | Admin, Manager |

---

## Spending by Category Chart

- Component: Horizontal bar chart
- Purpose: Show expense distribution across procurement categories

| Category | Example Amount |
|---|---|
| IT Hardware | ₹4.8L |
| Furniture | ₹3.2L |
| Stationery | ₹2.1L |
| Logistics | ₹2.3L |

Visible to: Admin, Manager, Procurement Officer (own category data)

---

## Top Vendors by Spend Table

Columns: Vendor Name · Total Spend · Number of POs

Example rows: TechCore Ltd · ₹4,20,000 · 6 POs

Visible to: Admin, Manager
Hidden from: Vendor (competitors' data never exposed)

---

## Monthly Procurement Trend Chart

- Component: Bar chart
- X-axis: Months (Jan–May example)
- Y-axis: Procurement value or order volume
- Purpose: Track procurement activity trends over time

Visible to: Admin, Manager

---

## Role-Based Screen Behavior

**Admin:** Full reports — all analytics, vendor performance, spending trends, export controls.

**Manager:** Approval statistics, procurement performance, vendor ranking.

**Procurement Officer:** RFQ analytics, PO statistics, own vendor activity. Spending trend chart hidden.

**Vendor:** If enabled — own quotation performance and own order history only. All organization-wide spending, vendor comparisons, and financial data are completely hidden.

---

## Data Sources for Calculations

Analytics are derived from: RFQ records · Approved quotations · Purchase orders · Invoice data · Vendor activity logs

---

## UI Rules

- Reports sidebar item highlighted.
- Month filter and export button fixed top-right.
- Summary cards in one horizontal row.
- Charts for visual analytics; tables for vendor rankings.
- Financial information is role-protected — never shown outside authorized roles.
- All analytics update dynamically when the date range selection changes.

---

