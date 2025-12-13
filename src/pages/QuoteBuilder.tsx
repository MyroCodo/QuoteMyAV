import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Stepper, Card } from '../components/ui';
import {
  QuoteTypeSelector,
  EventDetailsForm,
  EquipmentCategoryPicker,
  LiveQuoteEditor,
  type QuoteType,
  type EventDetails,
  type EquipmentSelection,
  type EquipmentCategory,
} from '../components/quote';
import { useQuoteStore } from '../stores/quoteStore';
import { useAuthStore } from '../stores/authStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { generateAIQuote, isAIConfigured } from '../services/ai-quote';
import type { Quote } from '../types';

const steps = [
  { label: 'Type' },
  { label: 'Event' },
  { label: 'Gear' },
  { label: 'Review' },
];

const initialEventDetails: EventDetails = {
  eventName: '',
  eventType: '',
  venueSize: '',
  venueName: '',
  startDate: '',
  endDate: '',
  setupDays: 1,
  strikeDays: 1,
  notes: '',
};

const initialEquipmentSelection: EquipmentSelection = {
  categories: [],
  budgetRange: '',
  specificRequests: '',
};

export function QuoteBuilder() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id?: string }>();
  const { createQuote, updateQuote, quotes } = useQuoteStore();
  const { user } = useAuthStore();
  const {
    initialize: initializeSubscription,
    canCreateQuote,
    incrementUsage,
    isAtLimit,
    getQuotaUsage,
  } = useSubscriptionStore();

  const isEditMode = Boolean(editId);
  const existingQuote = isEditMode ? quotes.find((q) => q.id === editId) : null;

  const [currentStep, setCurrentStep] = useState(0);
  const [quoteType, setQuoteType] = useState<QuoteType | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetails>(initialEventDetails);
  const [equipment, setEquipment] = useState<EquipmentSelection>(initialEquipmentSelection);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewGenerating, setIsPreviewGenerating] = useState(false);
  const [editedLineItems, setEditedLineItems] = useState<Quote['lineItems'] | null>(null);

  // Initialize subscription when user is available
  useEffect(() => {
    if (user?.id) {
      initializeSubscription(user.id);
    }
  }, [user?.id, initializeSubscription]);

  // Initialize editedLineItems for new quotes
  useEffect(() => {
    if (!isEditMode && editedLineItems === null) {
      setEditedLineItems([]);
    }
  }, [isEditMode, editedLineItems]);

  // Load existing quote data when editing
  useEffect(() => {
    if (isEditMode && existingQuote) {
      // Pre-fill event details from existing quote
      setEventDetails({
        eventName: existingQuote.eventName || '',
        eventType: '', // Not stored in quote, default empty
        venueSize: '',
        venueName: existingQuote.venue || '',
        startDate: existingQuote.eventDate?.split('T')[0] || '',
        endDate: '',
        setupDays: 1,
        strikeDays: 1,
        notes: '',
      });

      // Extract categories from existing line items (filter out labor/other which aren't equipment)
      const equipmentCategories = ['audio', 'video', 'lighting', 'staging', 'rigging', 'cables', 'signal', 'decor', 'power', 'comms'];
      const categories = [...new Set(existingQuote.lineItems.map((item) => item.category))]
        .filter((cat): cat is EquipmentCategory => equipmentCategories.includes(cat));
      setEquipment({
        categories,
        budgetRange: '',
        specificRequests: '',
      });

      // Store existing line items for update
      setEditedLineItems(existingQuote.lineItems);

      // Set quote type based on existing data (default to rental)
      setQuoteType('rental');

      // In edit mode, go directly to Review step with line items
      setCurrentStep(3);
    }
  }, [isEditMode, existingQuote]);

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return quoteType !== null;
      case 1:
        return eventDetails.eventName && eventDetails.eventType && eventDetails.startDate;
      case 2:
        return equipment.categories.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Generate AI line items for preview in the editor
  const handlePreviewGenerate = async () => {
    setIsPreviewGenerating(true);

    try {
      let lineItems;

      if (isAIConfigured()) {
        console.log('AI is configured, generating preview items...');
        const result = await generateAIQuote(eventDetails, equipment);
        lineItems = result.lineItems;
        console.log('AI preview generation successful!');
      } else {
        console.log('AI not configured, using mock items for preview...');
        lineItems = generateMockLineItems();
      }

      setEditedLineItems(lineItems);
    } catch (error) {
      console.error('Preview generation failed, falling back to mock:', error);
      const lineItems = generateMockLineItems();
      setEditedLineItems(lineItems);
    } finally {
      setIsPreviewGenerating(false);
    }
  };

  const handleGenerateQuote = async () => {
    // Check usage limit for new quotes only (editing doesn't count)
    if (!isEditMode && !canCreateQuote()) {
      const usage = getQuotaUsage();
      alert(
        `You've reached your monthly limit of ${usage.limit} quotes. ` +
        `Please upgrade your plan to create more quotes.`
      );
      navigate('/settings?upgrade=true');
      return;
    }

    setIsGenerating(true);

    try {
      let lineItems;
      let totalAmount;

      // Use edited line items if user has modified them in the editor
      if (editedLineItems && editedLineItems.length > 0) {
        // Use the line items from the editor (user may have edited them)
        lineItems = editedLineItems;
        totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);
      } else if (isAIConfigured()) {
        // Try AI generation
        console.log('AI is configured, attempting AI quote generation...');
        const result = await generateAIQuote(eventDetails, equipment);
        lineItems = result.lineItems;
        totalAmount = result.totalAmount;
        console.log('AI generation successful!');
      } else {
        // Fall back to mock if AI not configured
        console.log('AI not configured, using mock generation...');
        lineItems = generateMockLineItems();
        totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);
      }

      if (isEditMode && editId) {
        // Update existing quote
        await updateQuote(editId, {
          eventName: eventDetails.eventName,
          eventDate: eventDetails.startDate,
          venue: eventDetails.venueName,
          totalAmount,
          lineItems,
        });
        navigate(`/quotes/${editId}`);
      } else {
        // Create new quote
        const quoteData = {
          userId: user?.id || 'demo-user',
          clientName: '', // Would come from form or user settings
          clientEmail: '',
          eventName: eventDetails.eventName,
          eventDate: eventDetails.startDate,
          venue: eventDetails.venueName,
          status: 'draft' as const,
          totalAmount,
          lineItems,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const newQuote = await createQuote(quoteData);
        if (newQuote) {
          // Increment usage counter for new quotes
          incrementUsage();
          navigate(`/quotes/${newQuote.id}`);
        } else {
          setIsGenerating(false);
        }
      }
    } catch (error) {
      console.error('AI generation failed, falling back to mock:', error);
      // Fall back to mock on error
      const lineItems = generateMockLineItems();
      const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

      if (isEditMode && editId) {
        await updateQuote(editId, {
          eventName: eventDetails.eventName,
          eventDate: eventDetails.startDate,
          venue: eventDetails.venueName,
          totalAmount,
          lineItems,
        });
        navigate(`/quotes/${editId}`);
      } else {
        const quoteData = {
          userId: user?.id || 'demo-user',
          clientName: '',
          clientEmail: '',
          eventName: eventDetails.eventName,
          eventDate: eventDetails.startDate,
          venue: eventDetails.venueName,
          status: 'draft' as const,
          totalAmount,
          lineItems,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const newQuote = await createQuote(quoteData);
        if (newQuote) {
          // Increment usage counter for new quotes
          incrementUsage();
          navigate(`/quotes/${newQuote.id}`);
        } else {
          setIsGenerating(false);
        }
      }
    }
  };

  const generateMockLineItems = () => {
    const items: Array<{
      id: string;
      category: 'audio' | 'video' | 'lighting' | 'staging' | 'rigging' | 'cables' | 'signal' | 'decor' | 'power' | 'comms' | 'labor' | 'other';
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }> = [];

    let itemId = 1;
    const addItem = (category: typeof items[0]['category'], description: string, quantity: number, unitPrice: number) => {
      items.push({
        id: String(itemId++),
        category,
        description,
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      });
    };

    // AUDIO
    if (equipment.categories.includes('audio')) {
      // Main PA
      addItem('audio', "L'Acoustics A10 Line Array (8 per side)", 16, 150);
      addItem('audio', "L'Acoustics KS21 Subs (4)", 4, 200);
      addItem('audio', "L'Acoustics A10 Front Fill (4)", 4, 150);
      // Console & Processing
      addItem('audio', 'Yamaha CL5 Digital Console', 1, 750);
      addItem('audio', 'Yamaha Rio3224-D Stage Box', 2, 200);
      addItem('audio', 'Lake LM44 Processor', 1, 150);
      // Wireless Mics
      addItem('audio', 'Shure ULXD4Q Wireless Receiver', 2, 200);
      addItem('audio', 'Shure ULXD2/SM58 Handheld Transmitter', 8, 75);
      addItem('audio', 'Shure ULXD1 Bodypack Transmitter', 4, 65);
      addItem('audio', 'DPA 4088 Headset Mic', 4, 50);
      // Wired Mics
      addItem('audio', 'Shure SM58 Dynamic Mic', 8, 15);
      addItem('audio', 'Shure SM57 Instrument Mic', 4, 15);
      addItem('audio', 'Shure Beta 91A Kick Mic', 1, 35);
      addItem('audio', 'Sennheiser e604 Drum Mic Kit', 1, 75);
      // Monitors
      addItem('audio', "L'Acoustics X12 Stage Monitor (6)", 6, 100);
      addItem('audio', 'Shure PSM1000 IEM System', 4, 150);
      // Playback & Recording
      addItem('audio', 'Denon DN-500BD Playback', 1, 50);
      addItem('audio', 'Tascam SD-20M Recorder', 1, 40);
      // DI & Misc
      addItem('audio', 'Radial JDI Passive DI', 8, 15);
      addItem('audio', 'Whirlwind 32-Ch Audio Snake (150ft)', 1, 125);
      addItem('audio', 'Mic Stand Package (20)', 1, 60);
    }

    // VIDEO
    if (equipment.categories.includes('video')) {
      // Projection
      addItem('video', 'Panasonic PT-RZ120 12K Laser Projector', 2, 800);
      addItem('video', 'Panasonic ET-DLE150 Standard Lens', 2, 100);
      addItem('video', 'Chief RPA Projector Mount', 2, 40);
      // Screens
      addItem('video', 'Da-Lite 16x9 Fast-Fold Screen (12x7)', 2, 350);
      addItem('video', 'Da-Lite Legs & Frame Kit', 2, 75);
      // LED Wall (if large venue)
      addItem('video', 'ROE Visual CB5 LED Panel (50 panels)', 50, 150);
      addItem('video', 'LED Processor NovaStar VX6s', 1, 400);
      addItem('video', 'LED Ground Support Frame', 1, 500);
      // Cameras
      addItem('video', 'Sony PTZ Camera BRC-X1000', 3, 250);
      addItem('video', 'Sony HXR-NX5R Camcorder', 1, 200);
      addItem('video', 'Manfrotto 546B Tripod w/ Head', 2, 50);
      // Confidence Monitors
      addItem('video', '55" Samsung QN55 Confidence Monitor', 2, 125);
      addItem('video', '24" Talent Monitor on Stand', 2, 75);
      // Recording
      addItem('video', 'Blackmagic HyperDeck Studio 4K', 1, 150);
      addItem('video', 'SSD Recording Media (1TB)', 2, 50);
    }

    // SIGNAL/SWITCHING
    if (equipment.categories.includes('signal') || equipment.categories.includes('video')) {
      addItem('signal', 'Barco E2 Presentation Switcher', 1, 1500);
      addItem('signal', 'Barco E2 Input Card (8)', 2, 200);
      addItem('signal', 'Decimator MD-HX Scaler', 4, 50);
      addItem('signal', 'Blackmagic ATEM Mini Extreme ISO', 1, 150);
      addItem('signal', 'Blackmagic SDI Distribution (1x8)', 4, 35);
      addItem('signal', 'AJA HA5-4K HDMI to SDI Converter', 4, 40);
      addItem('signal', 'Kramer TP-580T HDBaseT Extender Set', 4, 75);
      addItem('signal', 'TV One C2-2375A Scaler', 2, 100);
    }

    // LIGHTING
    if (equipment.categories.includes('lighting')) {
      // Conventional
      addItem('lighting', 'ETC Source Four 26° (750W)', 24, 25);
      addItem('lighting', 'ETC Source Four PAR', 12, 20);
      addItem('lighting', 'ETC ColorSource PAR', 16, 35);
      // Moving Lights
      addItem('lighting', 'Robe BMFL Spot', 8, 250);
      addItem('lighting', 'Robe BMFL Wash', 8, 225);
      addItem('lighting', 'Chauvet Rogue R2 Wash', 12, 100);
      addItem('lighting', 'Chauvet Maverick MK3 Profile', 6, 175);
      // LED Wash/Effects
      addItem('lighting', 'Chroma-Q Color Force II 72"', 8, 125);
      addItem('lighting', 'ETC ColorSource CYC', 8, 75);
      addItem('lighting', 'Elation Proteus Hybrid', 4, 200);
      // Followspots
      addItem('lighting', 'Robert Juliat Cyrano Followspot', 2, 350);
      addItem('lighting', 'Followspot Stand & Chair', 2, 50);
      // Control
      addItem('lighting', 'GrandMA3 Light Console', 1, 500);
      addItem('lighting', 'GrandMA3 Fader Wing', 1, 200);
      addItem('lighting', 'MA NPU (Network Processing Unit)', 1, 300);
      // Atmospherics
      addItem('lighting', 'MDG theOne Hazer', 2, 150);
      addItem('lighting', 'MDG Haze Fluid (4L)', 4, 35);
      // Accessories
      addItem('lighting', 'Gobo Package (Custom)', 1, 200);
      addItem('lighting', 'Color Gel Package', 1, 100);
    }

    // RIGGING
    if (equipment.categories.includes('rigging') || equipment.categories.includes('lighting')) {
      // Truss
      addItem('rigging', '12" Box Truss (10ft section)', 16, 50);
      addItem('rigging', '12" Box Truss (8ft section)', 8, 45);
      addItem('rigging', '12" Box Truss Corner Block', 8, 35);
      addItem('rigging', '12" Box Truss Base Plate', 8, 40);
      // Ground Support
      addItem('rigging', 'Ground Support Tower (20ft)', 4, 200);
      addItem('rigging', 'Ground Support Sleeve Block', 4, 75);
      addItem('rigging', 'Outrigger Set w/ Leveling Jacks', 4, 50);
      // Motors
      addItem('rigging', 'CM Lodestar 1-Ton Motor', 8, 125);
      addItem('rigging', 'Motor Controller (8-way)', 1, 150);
      addItem('rigging', 'Motor Chain Bag', 8, 10);
      // Hardware
      addItem('rigging', 'Shackle 1/2" (20 pack)', 1, 40);
      addItem('rigging', 'Safety Cable 30" (20 pack)', 1, 30);
      addItem('rigging', 'Beam Clamp (10 pack)', 1, 50);
      addItem('rigging', 'Cheeseborough Clamp (20 pack)', 1, 60);
      addItem('rigging', 'C-Clamp (20 pack)', 1, 40);
    }

    // STAGING
    if (equipment.categories.includes('staging')) {
      // Stage Deck
      addItem('staging', '4x8 Stage Deck (24" height)', 20, 45);
      addItem('staging', '4x4 Stage Deck (24" height)', 8, 35);
      addItem('staging', 'Stage Stairs (4-step)', 2, 75);
      addItem('staging', 'ADA Ramp (8ft)', 1, 150);
      addItem('staging', 'Stage Skirting (per linear ft)', 60, 3);
      addItem('staging', 'Guardrail (8ft section)', 8, 25);
      // Risers
      addItem('staging', '4x8 Choir Riser (8" / 16" / 24")', 12, 40);
      // Lecterns & Furniture
      addItem('staging', 'Custom Lectern w/ Logo', 1, 200);
      addItem('staging', 'Presenter Table (6ft)', 2, 35);
      addItem('staging', 'Director Chair', 4, 25);
      addItem('staging', 'Stool (30" height)', 4, 15);
    }

    // DRAPE & DECOR
    if (equipment.categories.includes('decor')) {
      // Pipe & Drape
      addItem('decor', 'Pipe & Drape 8ft Uprights (pair)', 20, 20);
      addItem('decor', 'Pipe & Drape 10ft Horizontal', 20, 15);
      addItem('decor', 'Banjo Drape Panel 8x10 (Black)', 40, 25);
      addItem('decor', 'Velour Drape Panel 8x10 (Black)', 20, 45);
      // Backdrops
      addItem('decor', 'Sharkstooth Scrim 30x20', 1, 250);
      addItem('decor', 'Cyclorama 30x20 (White)', 1, 300);
      addItem('decor', 'Custom Printed Backdrop 20x10', 1, 500);
      // Set Pieces
      addItem('decor', 'Kabuki Drop System (30ft)', 1, 400);
      addItem('decor', 'Uplighting Sleeve (8ft)', 12, 15);
      // Carpet & Flooring
      addItem('decor', 'Black Carpet (per sq ft)', 500, 1.50);
      addItem('decor', 'Dance Floor (per 3x3 section)', 20, 25);
    }

    // CABLES
    if (equipment.categories.includes('cables') || items.length > 5) {
      // Audio Cables
      addItem('cables', 'XLR Cable 50ft', 20, 8);
      addItem('cables', 'XLR Cable 25ft', 30, 6);
      addItem('cables', 'XLR Cable 10ft', 20, 4);
      addItem('cables', '1/4" TRS Cable 25ft', 10, 8);
      addItem('cables', 'NL4 Speakon Cable 50ft', 12, 15);
      addItem('cables', 'NL4 Speakon Cable 25ft', 8, 12);
      // Video Cables
      addItem('cables', 'SDI Cable 100ft', 8, 25);
      addItem('cables', 'SDI Cable 50ft', 16, 18);
      addItem('cables', 'SDI Cable 25ft', 12, 12);
      addItem('cables', 'HDMI Cable 50ft (Active)', 6, 35);
      addItem('cables', 'HDMI Cable 25ft', 10, 15);
      addItem('cables', 'Cat6 Shielded 100ft', 12, 20);
      addItem('cables', 'Cat6 Shielded 50ft', 20, 12);
      addItem('cables', 'Fiber Optic HDMI 100ft', 4, 75);
      // Data Cables
      addItem('cables', 'DMX Cable 100ft', 8, 20);
      addItem('cables', 'DMX Cable 50ft', 16, 15);
      addItem('cables', 'DMX Cable 25ft', 20, 10);
      addItem('cables', 'Ethernet/etherCON 100ft', 12, 25);
      // Power Cables
      addItem('cables', 'Stinger 25ft (Edison)', 30, 5);
      addItem('cables', 'Stinger 50ft (Edison)', 15, 8);
      addItem('cables', '12/3 SOOW 50ft', 10, 15);
      addItem('cables', 'L21-30 Feeder 50ft', 4, 45);
      addItem('cables', 'Cam-Lock Feeder Set (5-wire) 100ft', 2, 150);
    }

    // POWER
    if (equipment.categories.includes('power')) {
      // Distro
      addItem('power', '400A Cam-Lock Distro', 1, 350);
      addItem('power', '200A Company Switch', 1, 200);
      addItem('power', '100A Lunch Box Distro', 4, 75);
      addItem('power', '20A Quad Box', 12, 20);
      addItem('power', 'Power Strip (6-outlet)', 20, 5);
      // UPS
      addItem('power', 'APC Smart-UPS 3000VA', 2, 100);
      // Generator (if needed)
      addItem('power', 'Generator 45kW Whisper Quiet', 1, 800);
      addItem('power', 'Fuel Service (per day)', 3, 150);
    }

    // COMMS
    if (equipment.categories.includes('comms')) {
      // Intercom
      addItem('comms', 'Clear-Com MS-702 Base Station', 1, 150);
      addItem('comms', 'Clear-Com RS-701 Beltpack', 8, 40);
      addItem('comms', 'Clear-Com CC-300 Headset', 8, 25);
      addItem('comms', 'Clear-Com HelixNet Partyline', 1, 200);
      // Wireless Intercom
      addItem('comms', 'Clear-Com FreeSpeak II Base', 1, 300);
      addItem('comms', 'Clear-Com FreeSpeak II Beltpack', 4, 125);
      // Radios
      addItem('comms', 'Motorola CP200d Radio', 12, 25);
      addItem('comms', 'Radio Surveillance Earpiece', 12, 8);
      addItem('comms', '6-Bank Radio Charger', 2, 30);
      // IFB
      addItem('comms', 'Comtek BST-75 IFB Transmitter', 2, 75);
      addItem('comms', 'Comtek PR-75a IFB Receiver', 8, 35);
    }

    // LABOR (always include)
    const showDays = eventDetails.endDate
      ? Math.ceil((new Date(eventDetails.endDate).getTime() - new Date(eventDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 1;
    const setupDays = eventDetails.setupDays || 1;
    const strikeDays = eventDetails.strikeDays || 1;
    const totalDays = setupDays + showDays + strikeDays;

    addItem('labor', 'Technical Director', totalDays, 650);
    addItem('labor', 'Audio Engineer (A1)', totalDays, 550);
    addItem('labor', 'Audio Tech (A2)', totalDays, 400);
    if (equipment.categories.includes('video')) {
      addItem('labor', 'Video Engineer (V1)', totalDays, 550);
      addItem('labor', 'Video Tech/Shader', totalDays, 400);
      addItem('labor', 'Camera Operator', showDays * 2, 350); // 2 ops for show days
    }
    if (equipment.categories.includes('lighting')) {
      addItem('labor', 'Lighting Designer/Programmer', totalDays, 600);
      addItem('labor', 'Lighting Tech (L1)', totalDays, 400);
      addItem('labor', 'Followspot Operator', showDays * 2, 250);
    }
    addItem('labor', 'Stagehand (Load In/Out)', (setupDays + strikeDays) * 4, 300);
    addItem('labor', 'Truck & Driver', 2, 450);
    addItem('labor', 'Project Management', 1, 500);

    return items;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <QuoteTypeSelector selected={quoteType} onChange={setQuoteType} />;
      case 1:
        return <EventDetailsForm data={eventDetails} onChange={setEventDetails} />;
      case 2:
        return <EquipmentCategoryPicker data={equipment} onChange={setEquipment} />;
      case 3:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderReviewStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Review Your Quote</h2>

      {/* Event & Equipment Summary - Collapsible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="teal" padding="sm" className="relative group">
          <button
            onClick={() => setCurrentStep(1)}
            className="absolute top-3 right-3 p-1 text-slate-400 hover:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Edit Event Details"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <h3 className="text-sm font-medium text-white mb-3">Event Details</h3>
          <dl className="space-y-1 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-400">Event</dt>
              <dd className="text-white">{eventDetails.eventName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Type</dt>
              <dd className="text-white capitalize">{eventDetails.eventType || 'Not set'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Venue</dt>
              <dd className="text-white">{eventDetails.venueName || 'TBD'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Dates</dt>
              <dd className="text-white">
                {eventDetails.startDate || 'Not set'}
                {eventDetails.endDate && ` - ${eventDetails.endDate}`}
              </dd>
            </div>
          </dl>
        </Card>

        <Card variant="blue" padding="sm" className="relative group">
          <button
            onClick={() => setCurrentStep(2)}
            className="absolute top-3 right-3 p-1 text-slate-400 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Edit Equipment Categories"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <h3 className="text-sm font-medium text-white mb-3">Equipment Categories</h3>
          <div className="flex flex-wrap gap-1.5">
            {equipment.categories.length > 0 ? (
              equipment.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs capitalize"
                >
                  {cat}
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-xs">No categories selected</span>
            )}
          </div>
        </Card>
      </div>

      {/* Live Quote Editor */}
      <LiveQuoteEditor
        lineItems={editedLineItems || []}
        onChange={setEditedLineItems}
        selectedCategories={equipment.categories}
        onGenerateAI={handlePreviewGenerate}
        isGenerating={isPreviewGenerating}
        eventContext={{
          eventName: eventDetails.eventName,
          eventType: eventDetails.eventType,
          venue: eventDetails.venueName,
        }}
      />
    </div>
  );

  if (isGenerating) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-teal-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">AI is building your quote...</h2>
            <p className="text-slate-400">Usually takes 10-30 seconds</p>
          </div>

          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400">✓</span>
              <span className="text-slate-300">Analyzing requirements</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400">✓</span>
              <span className="text-slate-300">Selecting equipment</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-teal-400 animate-pulse">●</span>
              <span className="text-white">Calculating pricing</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500">○</span>
              <span className="text-slate-500">Formatting output</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={isEditMode ? `/quotes/${editId}` : '/dashboard'}
          className="inline-flex items-center text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {isEditMode ? 'Back to Quote' : 'Back to Dashboard'}
        </Link>
        <h1 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Quote' : 'New Quote'}</h1>
      </div>

      {/* Usage Warning Banner */}
      {!isEditMode && (() => {
        const usage = getQuotaUsage();
        if (usage.limit === Infinity) return null;
        if (isAtLimit()) {
          return (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-red-400 font-medium">You've reached your monthly limit</p>
                  <p className="text-sm text-slate-400">{usage.used}/{usage.limit} quotes used this month</p>
                </div>
              </div>
              <Link to="/settings?upgrade=true">
                <Button size="sm">Upgrade Plan</Button>
              </Link>
            </div>
          );
        }
        if (usage.percentage >= 75) {
          return (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-amber-400 font-medium">Running low on quotes</p>
                  <p className="text-sm text-slate-400">{usage.limit - usage.used} quotes remaining this month</p>
                </div>
              </div>
              <Link to="/settings">
                <Button variant="secondary" size="sm">View Usage</Button>
              </Link>
            </div>
          );
        }
        return null;
      })()}

      {/* Stepper */}
      <div className="mb-10">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <div className="mb-8">{renderStepContent()}</div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
          ← Back
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Next →
          </Button>
        ) : (
          <Button onClick={handleGenerateQuote} disabled={!canProceed()}>
            {isEditMode ? 'Update Quote' : 'Generate Quote'}
          </Button>
        )}
      </div>
    </div>
  );
}
