# AV Quote Format & Layout Reference

> Reference document analyzing the structure and format of professional AV rental quotes, gearlists, and pullsheets from industry providers (Markey's, CPR Multimedia Solutions).

---

## Document Types

### 1. ESTIMATE / QUOTE
- Formal customer-facing document
- Contains pricing information
- Requires signature acceptance
- Includes legal terms and conditions

### 2. GEARLIST / RESERVATION
- Internal equipment list (may show $0.00 pricing)
- Used for equipment tracking and allocation
- Same structure as Estimate without final pricing

### 3. PULLSHEET
- Warehouse picking document
- Includes checkbox columns for pull/pack/check verification
- Part numbers and warehouse locations
- No pricing shown

---

## Document Header Structure

### Company Branding
```
┌─────────────────────────────────────────────────────────────────┐
│ [COMPANY LOGO]                              ESTIMATE            │
│ CREATING DEFINING EXPERIENCES                                   │
│                                                                 │
│ Remit Payment to:                          Order No: XXXXXXXX   │
│ [Address Line 1]                           Version: X           │
│ [City, State ZIP]                          Status: Quote        │
│ Ph: XXX.XXX.XXXX                           Date Created: MM/DD/YYYY │
│ www.company.com                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Three-Column Contact Block
```
┌────────────────────┬────────────────────┬────────────────────┐
│ Client             │ Venue / Site       │ Prepared By        │
├────────────────────┼────────────────────┼────────────────────┤
│ Company Name       │ Venue Name         │ Rep Name           │
│ Contact Name       │ Street Address     │                    │
│ Street Address     │ City, State ZIP    │ email@company.com  │
│ City, State ZIP    │ Phone:             │                    │
│ Phone: XXX-XXX-XXXX│ Attention:         │                    │
│ Cell: XXX-XXX-XXXX │ Phone:             │                    │
│ email@client.com   │ Room/Booth:        │                    │
└────────────────────┴────────────────────┴────────────────────┘
```

---

## Estimate Information Block

### Key Event Details (Two-Column Layout)
```
┌─────────────────────────────────────────────────────────────────┐
│ Estimate Information                                            │
├─────────────────────────────┬───────────────────────────────────┤
│ Event Name: [Name]          │ Customer No: [ID]                 │
│ Order No: XXXXXXXX          │ Bill To: [Company]                │
│ Ship Date: MM/DD/YYYY HH:MM │ Billing Contact: [Name]           │
│ Load In: MM/DD/YYYY HH:MM   │ Phone: XXX-XXX-XXXX               │
│ Event Dates: [Start - End]  │ Email: email@company.com          │
│ Return By: MM/DD/YYYY HH:MM │ Customer PO#: [Optional]          │
│ Ship Via: [Method]          │ Terms: NET 30 / PIA               │
│ Delivery: [Details]         │                                   │
│ Meal Plan: [If applicable]  │                                   │
└─────────────────────────────┴───────────────────────────────────┘
```

### Common Terms Values
- **NET 30** - Payment due 30 days after invoice
- **PIA** - Payment In Advance
- **Ship Via Options**: Markey Truck, Client Pickup, Third Party Freight

---

## Equipment Section Structure

### Category Organization (Hierarchical)

Equipment is organized into major categories, then sub-sections by location or function:

```
Equipment
├── AUDIO - Main Stage
│   ├── Mixers/Consoles
│   ├── Speakers (Line Array, Powered, Monitors)
│   ├── Subwoofers
│   ├── Amplifiers
│   ├── Microphones (Wired, Wireless, Gooseneck)
│   ├── Intercom/Comms Systems
│   ├── Snakes & Audio Cables
│   └── Accessories (Stands, DI Boxes, Press Mult)
│
├── VIDEO - Main Stage
│   ├── Screens (Stumpfl, Draper, Front/Rear)
│   ├── Projectors & Lenses
│   ├── LED Walls/Panels
│   ├── Switchers (Roland, Blackmagic, etc.)
│   ├── Cameras (PTZ, Broadcast, Robotic)
│   ├── Recording Equipment
│   ├── Monitors/Displays
│   ├── Media Players
│   ├── Converters/Scalers
│   ├── Laptops/Computers
│   └── Video Cables (HDMI, SDI, Fiber)
│
├── LIGHTING
│   ├── Consoles/Controllers
│   ├── Moving Lights (Wash, Profile, Spot)
│   ├── LED Fixtures (PAR, Cyc, Wash)
│   ├── Ellipsoidal/Leko Lights
│   ├── Uplighting
│   └── DMX Cables & Accessories
│
├── STAGING
│   ├── Risers/Platforms (Biljax, StageDex)
│   ├── Stairs
│   ├── Truss (James Thomas, Xtreme)
│   ├── Drape & Pipe (Black, Gray, Custom)
│   ├── Lecterns/Podiums
│   └── Rigging Hardware
│
├── POWER - Main Stage
│   ├── Distros (Lex, Motion Labs)
│   ├── Feeder Cable
│   ├── Edison Power (110V)
│   ├── 208V Power (L21-30, L14-30)
│   ├── Power Strips
│   └── Cable Protectors
│
├── TRUCKING & TRAVEL
│   ├── Trucking (Inter/Intra State)
│   ├── Hotel and Lodging
│   ├── Air-Fare, Taxi
│   └── Per-Diem
│
└── [Location-Specific Sections]
    ├── Convention Center (Inside)
    ├── Breakout Rooms
    ├── Registration Area
    └── Outdoor/Entrance Areas
```

### Line Item Format
```
Qty    Description                                        Amount
─────────────────────────────────────────────────────────────────
 2     JBL VRX932LA-1 12" Two-Way Line Array Loudspeaker  $XXX.XX
 1     Yamaha QL1 Digital Audio Rack                      $XXX.XX
 4     Shure Wireless Quad UHF ULXD-G Microphone System   $XXX.XX
```

### Sub-Category Formatting
- **Bold Headers** for major sections (AUDIO, VIDEO, LIGHTING)
- Regular headers for sub-locations (Main Stage, Convention Center)
- Indentation for kit components (shown in italics)
- Asterisks (*) indicate non-discountable items or special notes

### Section Subtotals
Each major section typically shows:
```
Sub Total                                               $X,XXX.XX
```

---

## Labor Breakdown Structure

### Personnel Scheduling Format
```
┌─────────────────────────────────────────────────────────────────┐
│ Labor Breakdown                                                 │
├─────┬──────────────────────────┬────────┬────────┬────────┬─────┤
│ Qty │ Personnel               │Reg Rate│OT Rate │DT Rate │Hours│
├─────┼──────────────────────────┼────────┼────────┼────────┼─────┤
│ 1   │ Project Manager*        │ $95.00 │$160.00 │$190.00 │30.00│
│ 1   │ Technical Director*     │ $90.00 │$135.00 │$180.00 │10.00│
│ 1   │ Audio Lead Technician*  │ $80.00 │$120.00 │$160.00 │10.00│
│ 1   │ Video Engineer*         │ $80.00 │$120.00 │$160.00 │10.00│
│ 2   │ Camera Operator*        │ $80.00 │$120.00 │$160.00 │10.00│
│ 10  │ Setup Technician*       │ $60.00 │$ 90.00 │$120.00 │10.00│
└─────┴──────────────────────────┴────────┴────────┴────────┴─────┘
```

### Common Personnel Roles
| Role | Typical Rate | Description |
|------|-------------|-------------|
| Project Manager | $85-95/hr | Overall event coordination |
| Technical Director | $85-95/hr | On-site technical lead |
| Audio Lead (A1) | $75-85/hr | Primary audio engineer |
| Audio Technician (A2) | $65-75/hr | Assistant audio |
| Video Lead (V1) | $75-85/hr | Primary video engineer |
| Video Technician (V2) | $65-75/hr | Assistant video |
| Lighting Lead (L1) | $75-85/hr | Primary lighting designer |
| Camera Operator | $75-85/hr | Camera operation |
| Graphics Operator | $75-85/hr | Playback/Graphics |
| Recording Tech | $75-85/hr | Record/Playback |
| General Technician | $55-65/hr | Setup/Strike labor |
| Strike Technician | $55-65/hr | Load-out labor |

### Day-by-Day Scheduling
```
4/28/22 Travel to Austin
    1   Technical Director*                    8.00 hrs

4/29/22 Set Day
    1   Technical Director*                   10.00 hrs
    1   Audio Lead Technician*                10.00 hrs
    10  Setup Technician*                     10.00 hrs

4/30/22 Rehearse, Show
    1   Technical Director/Switch*            10.00 + 1.00 OT
    2   Camera Operator*                      10.00 + 1.00 OT

4/30/22 Strike
    9   Strike Technician*                     4.00 hrs
```

### Rate Multipliers
- **Regular (Reg)**: First 10 hours of billing day
- **Overtime (OT)**: 1.5x after 10 hours
- **Double Time (DT)**: 2x after midnight / before 6am

---

## Estimate Summary / Pricing Block

### Cost Categories
```
┌─────────────────────────────────────────────────────────────────┐
│ Summary of Costs                                                │
├─────────────────────────────────────────────┬───────────────────┤
│ Equipment:                                  │        $39,135.00 │
│ Discount:                                   │        -$9,380.25 │
│ Subtotal:                                   │        $29,779.75 │
│                                             │                   │
│ Sale Items:                                 │            $75.00 │
│ **Consumables:                              │         $1,952.50 │
│ †Labor:                                     │        $28,020.00 │
│ Specialty Charges:                          │             $0.00 │
│ Travel Expenses:                            │             $0.00 │
│ Venue Charges:                              │             $0.00 │
│ Shipping Charges:                           │           $480.00 │
│ Miscellaneous:                              │             $0.00 │
│ Service Charge:                             │             $0.00 │
│ ~Project Management:                        │             $0.00 │
│ Sales Tax:                                  │         $4,975.35 │
│ Pre-Payment:                                │             $0.00 │
├─────────────────────────────────────────────┼───────────────────┤
│ Total:                                      │        $65,282.60 │
│                                             │   Payable in USD  │
└─────────────────────────────────────────────┴───────────────────┘
```

### Special Notation
- `*` Item or service is non-discountable
- `**` Includes cables, batteries, tape, adapters and connectors
- `†` Labor rates estimated, actual hours billed as accrued
- `~` Project Management includes estimating, tracking, consulting

---

## Signature Block

```
┌─────────────────────────────────────────────────────────────────┐
│ _______________________________    ___________________          │
│ Signature and Title as Acceptance  Date of Acceptance           │
│ of the Estimate and Terms                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Terms & Conditions (Footer)

### Standard Disclaimer Text
> Customer shall be responsible for the full replacement value of any equipment that is lost, stolen or damaged under the care of the Customer or their affiliates during the rental period.
>
> Unless notated otherwise, this Estimate may not include venue related charges such as: power, rigging, lift rental or union labor charges. Sales Tax is an estimate only based on information provided in the Estimate.

### Labor Policy
> Labor rates have been estimated based on the information provided. The quoted labor call times are subject to revision as details change. Actual hours and applicable rates will be billed as accrued during event.
>
> All Labor is based on a Ten (10) hour billing day. After Ten (10) hours labor will be billed at 1.5 times the base hourly rate. Additionally after midnight and before 6:00am, labor will be billed at 2 times the base hourly rate.
>
> An 8-hour turnaround is required between work days or billing will start at 1.5 times the base hourly rate. A meal break must be provided every 5 hours.

### Cancellation Policy
> Cancellation Clause: 100% of the Estimate will be charged if the Customer cancels the event within 72 hours of the Ship Date/Time.

---

## Pullsheet Format (Warehouse Document)

### Header Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ [COMPANY LOGO]                    PULLSHEET                     │
│                                   Production Manager: [Name]    │
│                                   Cell: (XXX) XXX-XXXX          │
│                                   Email: email@company.com      │
├─────────────────────────────────────────────────────────────────┤
│ Description: [Job Name]           Ship Via: [Truck Type]        │
│ Our Job # XXXXX                   Quotation Status: Active      │
│                                   Job Type: Rental              │
├─────────────────────────────────────────────────────────────────┤
│ Client: [Client Name]             Job Site: [Location]          │
│                                   Contact: [Name]               │
│ Dates:                            Phone: (XXX) XXX-XXXX         │
│   Prep:    MM/DD/YYYY HH:MM AM                                  │
│   Ship:    MM/DD/YYYY HH:MM PM                                  │
│   Show:    MM/DD/YYYY HH:MM AM                                  │
│   Strike:  MM/DD/YYYY HH:MM PM                                  │
│   Return:  MM/DD/YYYY HH:MM PM                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Line Item Format (with Checkboxes)
```
┌───┬───┬───┬──────────┬────────────────────┬─────────────────────────────────┬───────────┐
│   │   │   │ Quantity │ Part Number        │ Description                     │ Warehouse │
├───┼───┼───┼──────────┼────────────────────┼─────────────────────────────────┼───────────┤
│ □ │ □ │ □ │    1     │ QL1                │ Mixer - Console Digital QL1     │ CPR Main  │
│ □ │ □ │ □ │    2     │ JBL VRX932         │ JBL VRX932LAP Speaker Powered   │ CPR Main  │
│ □ │ □ │ □ │    1     │ PKG - Audio Snake  │ Audio Snake RIO 32 Channel      │ CPR Main  │
└───┴───┴───┴──────────┴────────────────────┴─────────────────────────────────┴───────────┘
```

### Checkbox Columns
1. **Pull** - Item pulled from shelf
2. **Pack** - Item packed in case/crate
3. **Check** - Item verified/quality checked

### Package vs Item Notation
- `PKG - [Name]` = Complete kit/package
- `ITEM - [Name]` = Individual component of a package
- `KIT - [Name]` = Bundled system
- `SPARE` = Backup/extra equipment

---

## Common Equipment Categories & Items

### Audio Equipment
| Category | Common Items |
|----------|-------------|
| Consoles | Yamaha QL1/QL5, Midas M32, QSC TouchMix |
| Line Array | JBL VRX932, JBL VerTec 4886 |
| Powered Speakers | JBL PRX812W, PRX412M, Mackie SRM |
| Subwoofers | JBL SRX818SP, VRX918SP |
| Wireless Mics | Shure ULXD (Dual/Quad), Axient AD |
| Wired Mics | Shure SM58, SM81, MX418 (Gooseneck) |
| Intercom | Clear-Com FreeSpeak, HelixNet, HME DX210 |
| Snakes | Whirlwind, Yamaha RIO, Stage Master |

### Video Equipment
| Category | Common Items |
|----------|-------------|
| Projectors | Epson 12K Laser, Christie LWU701i, Barco 20K |
| Screens | Stumpfl Monoblox (various sizes) |
| LED Walls | Absen A3 Pro, ROE Visual |
| Switchers | Roland VR-50HD, Blackmagic ATEM |
| Cameras | Sony HXC-100, BRC-X400 (PTZ) |
| Converters | Decimator MD-HX, AJA HI5 |
| Recording | Atomos Shogun, HyperDeck |
| Monitors | Samsung/LG 4K LED (43"-82") |

### Lighting Equipment
| Category | Common Items |
|----------|-------------|
| Consoles | High End Hedgehog, Leprecon LP612 |
| Moving Lights | Martin MAC Quantum, Elation Artiste |
| LED Fixtures | Chauvet Freedom Par, Coemar Floor Par |
| Wash Lights | Martin MAC Aura |
| Ellipsoidals | Chauvet Ovation LED |

### Staging & Rigging
| Category | Common Items |
|----------|-------------|
| Stage Decks | Biljax 4'x4', 4'x8' platforms |
| Risers | Biljax (various configurations) |
| Truss | Xtreme 12"x18", James Thomas GP Truss |
| Drape | Black Velour 13'H, 16'H, 26'H |
| Lecterns | Acrylic with Silver Trim, AmpliVox |

### Power Distribution
| Category | Common Items |
|----------|-------------|
| Distros | Lex Viceroy, Bento Box, Motion Labs 200A |
| Feeder | 2/0 AWG, 50'/100' runs |
| Edison | 110V cables (10'-100'), Quad boxes |
| 208V | L21-30, L14-30 cables and breakouts |

---

## Page Layout & Formatting

### Pagination
- Footer: `Order No: XXXXXXXX` (left) | `Page X of Y` (right)
- Header on subsequent pages: Event Name, Venue, Order Number

### Visual Hierarchy
1. **Document Title** - Large, bold (ESTIMATE, PULLSHEET)
2. **Section Headers** - Bold, sometimes underlined
3. **Category Headers** - Bold (AUDIO, VIDEO, LIGHTING)
4. **Sub-Headers** - Regular bold or italics
5. **Line Items** - Normal text with quantity alignment

### Column Alignment
- **Qty** - Right-aligned, typically 2-3 characters wide
- **Description** - Left-aligned, variable width
- **Amount** - Right-aligned with currency formatting

---

## Data Model Summary

### Quote/Estimate Entity
```
Quote
├── header
│   ├── company_info (logo, address, phone, website)
│   ├── document_type (Estimate, Quote, Reservation)
│   ├── order_number
│   ├── version
│   ├── status
│   └── date_created
├── parties
│   ├── client (company, contact, address, phone, email)
│   ├── venue (name, address, attention, room)
│   └── prepared_by (name, email)
├── event_info
│   ├── event_name
│   ├── customer_number
│   ├── dates (ship, load_in, event_start, event_end, return)
│   ├── ship_via
│   ├── billing_contact
│   ├── payment_terms
│   └── customer_po
├── equipment[]
│   ├── category (Audio, Video, Lighting, Staging, Power)
│   ├── sub_location (Main Stage, Breakout, etc.)
│   ├── items[]
│   │   ├── quantity
│   │   ├── description
│   │   ├── part_number (optional)
│   │   └── amount
│   └── subtotal
├── labor[]
│   ├── date
│   ├── phase (Travel, Load-In, Show, Strike)
│   ├── positions[]
│   │   ├── quantity
│   │   ├── role
│   │   ├── reg_rate
│   │   ├── ot_rate
│   │   ├── dt_rate
│   │   ├── reg_hours
│   │   ├── ot_hours
│   │   ├── dt_hours
│   │   └── extended_amount
│   └── subtotal
├── summary
│   ├── equipment_total
│   ├── discount
│   ├── subtotal
│   ├── consumables
│   ├── labor_total
│   ├── travel_expenses
│   ├── shipping
│   ├── service_charge
│   ├── sales_tax
│   └── grand_total
├── signature
│   ├── signature_line
│   └── acceptance_date
└── terms_conditions
    ├── liability_clause
    ├── labor_policy
    └── cancellation_policy
```

---

## QuoteMyAV Implementation Notes

### Key Features to Support
1. **Multi-location equipment grouping** - Items organized by venue area
2. **Kit/Package expansion** - Show individual components under packages
3. **Labor scheduling by day** - Calendar-based crew planning
4. **Rate multipliers** - OT/DT automatic calculation
5. **Discount application** - Percentage or flat discounts
6. **Tax calculation** - By state/jurisdiction
7. **Version control** - Track quote revisions
8. **Status workflow** - Quote > Reservation > Confirmed

### PDF Export Requirements
- Company branding/logo placement
- Consistent page headers/footers
- Professional typography
- Signature capture area
- Terms & conditions (configurable)

---

*Document generated from analysis of Markey's Rental & Staging and CPR Multimedia Solutions quote formats.*
