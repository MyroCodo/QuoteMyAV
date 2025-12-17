# Quote Generators

Specialized quote generators for training AI models with domain-specific AV logic.

## Corporate Conference Generator

**File:** `corporate-conference.js`

**Purpose:** Generates AI-training-quality quotes demonstrating professional AV equipment selection and scaling logic for corporate events.

### Features

#### Equipment Chain Logic
- **Audio Console** → Drives digital snake and stage box needs
- **Speaker Systems** → Matched to room size with proper amplification
- **Wireless RF** → Includes antenna distribution for 8+ channels
- **IMAG Cameras** → Complete with switcher, recording, and feeds
- **Projection** → Proper lens selection based on throw distance
- **Signal Flow** → Converters, scalers, and distribution properly integrated

#### Scaling Formula (Based on Attendee Count)

**Under 50 attendees**
- Portable PA system
- 2 wireless microphones
- Single projector + screen
- Basic mixing console
- Budget: $3k-$7k

**50-150 attendees**
- Small line array or powered point source (4 speakers)
- 4 wireless microphones + 2 lavaliers
- Dual projection system
- Digital console
- Confidence monitors
- Budget: $7k-$15k

**150-300 attendees**
- Medium line array system
- 8 wireless microphones + 4 lavaliers
- Gooseneck mics for Q&A
- Delay speakers for coverage
- LED wall or large projection
- IMAG cameras (optional)
- Digital snake
- Budget: $15k-$35k

**300-500 attendees**
- Large line array + subwoofers
- 12 wireless microphones + 6 lavaliers
- Multiple delay zones
- LED wall system
- 2-3 IMAG cameras with switcher
- Recording system
- Crew communications
- Budget: $35k-$75k

**500+ attendees**
- Touring-grade line array system
- 16+ wireless microphones + lavaliers
- RF coordination and antenna distribution
- Large LED wall or dual projection
- 3-4 camera IMAG production
- Broadcast-quality recording
- Full crew comms system
- Budget: $75k-$150k+

#### Corporate-Specific Elements

- **Breakout Rooms:** Smaller systems per room (audio, video, presentation)
- **Presenter Confidence Monitors:** Stage-facing displays for speaker notes
- **Q&A Microphone Systems:** Gooseneck or audience wireless mics
- **Recording/Streaming:** Professional capture for archival or broadcast
- **Executive Comfort:** Lecterns, teleprompters, premium wireless lavs
- **Professional Labor:** A1, V1, camera operators, setup/strike crew

#### Support Equipment Logic

- **Cables Calculated:** XLR count = wireless channels + DIs + monitors
- **Power Distribution:** Sized for actual equipment load (distros, cables)
- **Rigging:** Based on speaker/screen weight and venue requirements
- **Communications:** 1 headset per tech + spares, walkie-talkies for all crew
- **Trucking:** Vehicle size based on equipment volume

#### Labor Logic

- **Setup Hours:** Complexity factor × equipment count
- **Crew Size:** Based on weight/rigging needs and event scale
- **Engineers Required:**
  - A1 (Audio Lead): Always included
  - A2 (Audio Tech): Added for 8+ wireless channels
  - V1 (Video Lead): Required for any video production
  - Camera Operators: 1 per camera for IMAG
  - L1 (Lighting Lead): Added for 300+ attendees
- **Setup/Strike Crew:** Scaled from 2-6 technicians based on complexity

### Event Types Generated

1. **Annual Conference** (50-1000 attendees)
2. **Product Launch** (100-800 attendees)
3. **Sales Kickoff** (150-1200 attendees)
4. **Board Meeting** (10-50 attendees)
5. **Town Hall** (200-1500 attendees)
6. **Training Seminar** (30-150 attendees)
7. **Investor Day** (50-200 attendees)
8. **Awards Gala** (200-800 attendees)

### Usage

```bash
# Run from project root
node scripts/generators/corporate-conference.js
```

### Output

- **Location:** `docs/mock-quotes/corporate-conference/`
- **Files:** 15 PDF quotes + JSON data file
- **Format:** Professional PDF matching QMAV app format

### Example Output Statistics

```
Event Type Distribution:
  Sales Kickoff: 3
  Investor Day: 3
  Awards Gala: 2
  Training Seminar: 2
  Board Meeting: 2
  Product Launch: 1
  Town Hall: 1
  Annual Conference: 1

Attendee Range Distribution:
  Under 50: 2
  50-150: 5
  150-300: 3
  300-500: 2
  500+: 3

Total quote value:        ~$294k
Average quote value:      ~$20k
Total line items:         ~650
Average items per quote:  ~43
```

---

## Wedding & Social Events Generator

**File:** `wedding-social.js`

**Run:** `node scripts/generators/wedding-social.js`

**Output:** `docs/mock-quotes/wedding-social/`

### Key Features

This generator produces AI-training-quality quotes that demonstrate the **LOGIC** of professional AV quote building for weddings and social events.

#### 1. Equipment Chain Logic

Items are selected to work together as complete systems:

**Ceremony Audio:**
- 2 wireless microphones (officiant + reader)
- Small speakers for ambient music
- Simple mixer
- DI for music playback

**Reception Audio - DJ Setup:**
- Main PA speakers scaled by guest count
- Subwoofers for larger events
- DJ mixer
- DI boxes for playback

**Reception Audio - Live Band:**
- Main PA speakers
- Stage monitors (4-6 depending on guest count)
- Instrument microphones (SM57, SM58)
- DI boxes for instruments
- Audio snake for stage connections
- Larger mixing console

#### 2. Scaling Formulas

Equipment quantities scale logically based on guest count:

**Audio Scaling:**
- Under 75 guests: 2 speakers
- 75-150 guests: 4 speakers + 1 subwoofer
- 150-250 guests: 4 better speakers + 2 subs
- 250+ guests: Line array consideration + 2 subs

**Uplighting Scaling:**
- Based on room perimeter (1 uplight per 8-10 feet)
- Under 75 guests: 12 uplights (~100 ft perimeter)
- 75-150 guests: 20 uplights (~180 ft perimeter)
- 150-250 guests: 28 uplights (~250 ft perimeter)
- 250+ guests: 36 uplights

**Dance Floor Lighting:**
- Under 100 guests: Basic LED pars
- 100-200 guests: Moving wash lights
- 200+ guests: Professional moving lights + haze

#### 3. Wedding-Specific Elements

**Event Phases:**
- Ceremony (separate location often)
- Cocktail hour (background music zone)
- Reception (dinner, toasts, dancing)

**Special Moments:**
- First dance spotlight
- Cake cutting
- Toast microphones
- Photo/video lighting considerations

**Equipment Logic:**
- Ceremony + reception = separate systems OR quick changeover
- Cocktail hour uses minimal background speakers
- Reception scales based on entertainment type (DJ vs Band)

#### 4. Support Equipment Logic

**Cables:**
- XLR audio cables (quantity based on band vs DJ)
- Speaker cables (NL4)
- Power cables (scaled by equipment count)
- DMX cables for lighting

**Power:**
- Power strips
- Cable protection (guard dogs)
- Generator for outdoor events (100+ guests)

**Outdoor Considerations:**
- Weather contingency equipment
- Generator power
- Additional cable protection

#### 5. Labor Logic

**Setup:**
- 2-4 hours depending on complexity
- 1-2 technicians based on guest count

**Operation:**
- Audio lead/DJ operator for event duration
- Additional audio tech if live band
- Lighting tech if intelligent fixtures

**Teardown:**
- Often next-day for weddings
- 1-2 techs based on system size

### Event Types Generated

1. **Intimate Wedding** (30-75 guests)
2. **Small Wedding** (75-125 guests)
3. **Medium Wedding** (125-200 guests)
4. **Large Wedding** (200-300 guests)
5. **Anniversary Celebration** (50-150 guests)
6. **Birthday Party** (40-100 guests)
7. **Rehearsal Dinner** (30-60 guests)

### Configuration Options

Each quote randomly includes:
- Live band (30% probability)
- Toasts/speeches (80% probability)
- Slideshow/video (50% probability)
- Cocktail hour (70% probability)
- Ceremony at same venue (50% probability)
- String lights (40% probability)
- Outdoor venue (varies by venue)

### Output Statistics

From a typical run of 15 quotes:
- **Total line items:** ~566 (avg 38 per quote)
- **Total value:** ~$100,000 (avg $6,600 per quote)
- **Guest count range:** 45-203 guests
- **Average guests:** 117

### Professional Logic Demonstrated

1. **Equipment compatibility:** Items selected work together (speakers + subs, mics + mixers)
2. **Scaling relationships:** More guests = more speakers, uplights, power
3. **Venue adaptation:** Outdoor = generator, indoor = venue power
4. **Entertainment logic:** Band = monitors + mics, DJ = simpler setup
5. **Phase separation:** Ceremony vs cocktail vs reception equipment
6. **Support requirements:** Cables, power, labor scale with equipment
7. **Safety/standards:** Cable protection, proper grounding, redundancy

---

## House of Worship Generator

**File:** `house-of-worship.js`

**Purpose:** Generates AI-training-quality quotes that demonstrate professional AV logic for worship services, special events, and installations.

### Features

#### Equipment Chain Logic
- Worship band: Full instrument micing (drums, keys, guitars, bass)
- Choir: Proper choir micing (shotguns or area mics)
- Streaming: Broadcast audio split from house
- Lyrics/IMAG: Integrated display system
- IEM systems for worship team with individual mixes

#### Scaling Formula (Based on Congregation/Sanctuary Size)

**Small (100-250 people)**
- Point source speakers
- 16 input channels
- Single display
- Basic streaming
- Budget: $15k-$35k

**Medium (250-600 people)**
- Small line array or point source clusters
- 24 input channels
- Dual displays
- Multi-camera setup
- Budget: $35k-$75k

**Large (600-1,800 people)**
- Line array system
- 32 input channels
- 3 displays (IMAG)
- 4-camera production
- Budget: $75k-$150k

**Mega (1,800-8,000 people)**
- Touring-grade line array
- 48+ input channels
- 5 displays / LED walls
- 6-camera broadcast quality
- Budget: $150k-$350k

#### Worship-Specific Elements

- **ProPresenter Integration:** Lyrics and presentation control
- **Multi-Campus Streaming:** Low latency distribution to satellite campuses
- **Hearing Assist Systems:** ADA compliance with IFB receivers
- **Baptistry Coverage:** Special audio/lighting for baptismal area
- **Overflow Feeds:** Cry room and lobby distribution
- **Recording:** Multi-track capture for podcast/archive/remix
- **Volunteer Considerations:** Setup accounts for training and recurring services

#### Support Equipment Logic

- IEM (In-Ear Monitor) systems for worship team
- Aviom/ME systems for personal monitoring
- Multi-track recording every service
- Backup systems for critical path
- Confidence monitors for speakers and worship leaders

#### Labor Logic

- Often volunteer-operated (training considerations included)
- Setup for recurring services (install vs rental approach)
- Special events: Easter, Christmas (enhanced production)
- Multi-service days accounted for

### Event Types Generated

1. **Sunday Morning Worship Service** (all sizes)
2. **Christmas Eve Service** (medium, large, mega)
3. **Easter Sunday Service** (large, mega)
4. **Worship Conference** (medium, large, mega)
5. **Youth Ministry Event** (small, medium, large)
6. **Baptism Service** (small, medium)
7. **Church Plant Launch** (small, medium)
8. **Multi-Site Broadcast** (large, mega)
9. **Outdoor Festival Service** (large, mega)
10. **Guest Speaker Event** (medium, large)
11. **Worship Night** (medium, large)
12. **Church Anniversary Celebration** (medium, large)
13. **VBS Setup** (small, medium)
14. **Prayer & Healing Service** (small, medium)
15. **Live Recording Session** (medium, large)

### Usage

```bash
# Run from project root
node scripts/generators/house-of-worship.js
```

### Output

- **Location:** `docs/mock-quotes/house-of-worship/`
- **Files:** 15 PDF quotes + JSON data file
- **Format:** Same professional PDF format as main quote generator

### Example Output Statistics

```
Small sanctuary quotes:        1
Medium sanctuary quotes:       4
Large sanctuary quotes:        6
Mega sanctuary quotes:         4

Total quote value:             ~$285k
Average quote value:           ~$19k
Total line items generated:    ~920
```

## Adding New Generators

To create a new specialized generator:

1. Copy `house-of-worship.js` as a template
2. Define your domain-specific data:
   - Client types
   - Venue types
   - Event types
   - Equipment scaling logic
3. Implement `generateQuote()` function with equipment chain logic
4. Use the same PDF generation structure
5. Update this README with documentation

### Key Principles for AI Training Quotes

1. **Equipment must work together** - No orphaned items
2. **Quantities must be realistic** - Based on event scale
3. **Signal flow must be complete** - Source → Processing → Output
4. **Support equipment included** - Cables, power, stands
5. **Labor matches complexity** - More crew for larger/complex events
6. **Industry standards followed** - Professional nomenclature and practices
