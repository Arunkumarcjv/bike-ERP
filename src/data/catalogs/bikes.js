/**
 * Master Bike Models & Variants Catalog
 * All prices in integer paise. Body types map directly to BikeThumb SVG vector types.
 */

export const BIKE_BODY_TYPES = {
  COMMUTER: 'commuter',
  SPORTS: 'sports',
  CRUISER: 'cruiser',
  ADVENTURE: 'adventure',
  SCOOTER: 'scooter',
  EV: 'ev',
};

export const BIKE_CATALOG = [
  {
    id: 'bike-re-hunter350',
    brand: 'Royal Enfield',
    model: 'Hunter 350',
    tagline: 'A Shot of Motorcycling',
    bodyType: BIKE_BODY_TYPES.CRUISER,
    displacementCc: 349,
    fuelType: 'PETROL',
    fuelTankLitres: 13,
    mileageKmpl: 36,
    hsn: '8711',
    exShowroomPaise: 16990000, // ₹1,69,900
    colors: [
      { name: 'Dapper White', hex: '#E2E8F0', code: 'DAP_WHT' },
      { name: 'Rebel Blue', hex: '#2563EB', code: 'REB_BLU' },
      { name: 'Dapper Ash', hex: '#64748B', code: 'DAP_ASH' },
    ],
    variants: [
      { id: 'v-hunter-retro', name: 'Retro Factory', priceDiffPaise: -2000000 },
      { id: 'v-hunter-metro', name: 'Metro Dapper', priceDiffPaise: 0 },
      { id: 'v-hunter-rebel', name: 'Metro Rebel', priceDiffPaise: 500000 },
    ],
    fastMover: true,
  },
  {
    id: 'bike-re-classic350',
    brand: 'Royal Enfield',
    model: 'Classic 350',
    tagline: 'Timeless Classic',
    bodyType: BIKE_BODY_TYPES.CRUISER,
    displacementCc: 349,
    fuelType: 'PETROL',
    fuelTankLitres: 13,
    mileageKmpl: 35,
    hsn: '8711',
    exShowroomPaise: 19308000, // ₹1,93,080
    colors: [
      { name: 'Halcyon Green', hex: '#166534', code: 'HAL_GRN' },
      { name: 'Signals Marsh Grey', hex: '#78716C', code: 'SIG_GRY' },
      { name: 'Dark Stealth Black', hex: '#1E293B', code: 'DRK_BLK' },
    ],
    variants: [
      { id: 'v-classic-redditch', name: 'Redditch Series', priceDiffPaise: -800000 },
      { id: 'v-classic-halcyon', name: 'Halcyon Series', priceDiffPaise: 0 },
      { id: 'v-classic-stealth', name: 'Dark Stealth', priceDiffPaise: 2200000 },
    ],
    fastMover: true,
  },
  {
    id: 'bike-re-him450',
    brand: 'Royal Enfield',
    model: 'Himalayan 450',
    tagline: 'Built for All Roads. Built for No Roads.',
    bodyType: BIKE_BODY_TYPES.ADVENTURE,
    displacementCc: 452, // > 350cc => 40% GST tier
    fuelType: 'PETROL',
    fuelTankLitres: 17,
    mileageKmpl: 30,
    hsn: '8711',
    exShowroomPaise: 28500000, // ₹2,85,000
    colors: [
      { name: 'Kaza Brown', hex: '#9A3412', code: 'KAZ_BRN' },
      { name: 'Slate Himalayan Salt', hex: '#FCA5A5', code: 'SLT_SLT' },
      { name: 'Hanle Black', hex: '#0F172A', code: 'HAN_BLK' },
    ],
    variants: [
      { id: 'v-him-base', name: 'Base', priceDiffPaise: 0 },
      { id: 'v-him-pass', name: 'Pass', priceDiffPaise: 500000 },
      { id: 'v-him-summit', name: 'Summit Tubeless', priceDiffPaise: 1500000 },
    ],
    fastMover: true,
  },
  {
    id: 'bike-honda-activa125',
    brand: 'Honda',
    model: 'Activa 125',
    tagline: 'The Leader with Modern Style',
    bodyType: BIKE_BODY_TYPES.SCOOTER,
    displacementCc: 124,
    fuelType: 'PETROL',
    fuelTankLitres: 5.3,
    mileageKmpl: 48,
    hsn: '8711',
    exShowroomPaise: 8250000, // ₹82,500
    colors: [
      { name: 'Rebel Red Metallic', hex: '#B91C1C', code: 'REB_RED' },
      { name: 'Pearl Precious White', hex: '#F8FAFC', code: 'PRL_WHT' },
      { name: 'Heavy Gray Metallic', hex: '#475569', code: 'HVY_GRY' },
    ],
    variants: [
      { id: 'v-activa-drum', name: 'Drum', priceDiffPaise: 0 },
      { id: 'v-activa-disc', name: 'Disc', priceDiffPaise: 380000 },
      { id: 'v-activa-hsmart', name: 'H-Smart Key', priceDiffPaise: 750000 },
    ],
    fastMover: true,
  },
  {
    id: 'bike-honda-sp125',
    brand: 'Honda',
    model: 'SP125',
    tagline: 'Strictly Advanced Performance',
    bodyType: BIKE_BODY_TYPES.COMMUTER,
    displacementCc: 124,
    fuelType: 'PETROL',
    fuelTankLitres: 11,
    mileageKmpl: 65,
    hsn: '8711',
    exShowroomPaise: 8700000, // ₹87,000
    colors: [
      { name: 'Imperial Red Metallic', hex: '#991B1B', code: 'IMP_RED' },
      { name: 'Black', hex: '#18181B', code: 'BLK' },
      { name: 'Matte Marvel Blue', hex: '#1D4ED8', code: 'MTT_BLU' },
    ],
    variants: [
      { id: 'v-sp125-drum', name: 'Drum Brake', priceDiffPaise: 0 },
      { id: 'v-sp125-disc', name: 'Front Disc', priceDiffPaise: 420000 },
    ],
    fastMover: true,
  },
  {
    id: 'bike-bajaj-pulsarns200',
    brand: 'Bajaj',
    model: 'Pulsar NS200',
    tagline: 'Born of the Street Fighter DNA',
    bodyType: BIKE_BODY_TYPES.SPORTS,
    displacementCc: 199,
    fuelType: 'PETROL',
    fuelTankLitres: 12,
    mileageKmpl: 36,
    hsn: '8711',
    exShowroomPaise: 15800000, // ₹1,58,000
    colors: [
      { name: 'Burnt Red', hex: '#DC2626', code: 'BRN_RED' },
      { name: 'Metallic Pearl White', hex: '#F1F5F9', code: 'MTL_WHT' },
      { name: 'Pewter Grey', hex: '#334155', code: 'PWT_GRY' },
    ],
    variants: [
      { id: 'v-ns200-dual-abs', name: 'Dual Channel ABS & USD Forks', priceDiffPaise: 0 },
    ],
    fastMover: false,
  },
  {
    id: 'bike-tvs-apache160',
    brand: 'TVS',
    model: 'Apache RTR 160 4V',
    tagline: 'Racing DNA Unleashed',
    bodyType: BIKE_BODY_TYPES.SPORTS,
    displacementCc: 159,
    fuelType: 'PETROL',
    fuelTankLitres: 12,
    mileageKmpl: 42,
    hsn: '8711',
    exShowroomPaise: 12400000, // ₹1,24,000
    colors: [
      { name: 'Racing Red', hex: '#EF4444', code: 'RCG_RED' },
      { name: 'Knight Black', hex: '#09090B', code: 'KNT_BLK' },
      { name: 'Metallic Blue', hex: '#2563EB', code: 'MTL_BLU' },
    ],
    variants: [
      { id: 'v-apache-special', name: 'Special Edition Disc', priceDiffPaise: 0 },
      { id: 'v-apache-smart', name: 'SmartXonnect Bluetooth', priceDiffPaise: 500000 },
    ],
    fastMover: true,
  },
  {
    id: 'bike-tvs-iqube',
    brand: 'TVS',
    model: 'iQube Electric',
    tagline: 'The Smart Electric Scooter',
    bodyType: BIKE_BODY_TYPES.EV,
    displacementCc: 0,
    fuelType: 'EV',
    fuelTankLitres: 0,
    mileageKmpl: 100, // Range km per charge
    hsn: '8711',
    exShowroomPaise: 11700000, // ₹1,17,000 (5% GST)
    colors: [
      { name: 'Pearl White', hex: '#F8FAFC', code: 'PRL_WHT' },
      { name: 'Titanium Grey', hex: '#475569', code: 'TTN_GRY' },
      { name: 'Mint Blue', hex: '#06B6D4', code: 'MNT_BLU' },
    ],
    variants: [
      { id: 'v-iqube-22', name: 'iQube 2.2 kWh', priceDiffPaise: -1000000 },
      { id: 'v-iqube-34', name: 'iQube 3.4 kWh', priceDiffPaise: 0 },
      { id: 'v-iqube-st', name: 'iQube ST 5.1 kWh', priceDiffPaise: 2800000 },
    ],
    fastMover: true,
  },
  {
    id: 'bike-hero-xtreme160r',
    brand: 'Hero',
    model: 'Xtreme 160R',
    tagline: 'Boomstyle Precision',
    bodyType: BIKE_BODY_TYPES.COMMUTER,
    displacementCc: 163,
    fuelType: 'PETROL',
    fuelTankLitres: 12,
    mileageKmpl: 45,
    hsn: '8711',
    exShowroomPaise: 12100000, // ₹1,21,000
    colors: [
      { name: 'Sports Red', hex: '#DC2626', code: 'SPT_RED' },
      { name: 'Stealth Black', hex: '#18181B', code: 'STL_BLK' },
    ],
    variants: [
      { id: 'v-xtreme-single', name: 'Single Disc', priceDiffPaise: 0 },
      { id: 'v-xtreme-dual', name: 'Dual Disc 4V', priceDiffPaise: 650000 },
    ],
    fastMover: false,
  },
  {
    id: 'bike-yamaha-fzs-v3',
    brand: 'Yamaha',
    model: 'FZ-S V3',
    tagline: 'Lord of the Streets',
    bodyType: BIKE_BODY_TYPES.SPORTS,
    displacementCc: 149,
    fuelType: 'PETROL',
    fuelTankLitres: 13,
    mileageKmpl: 45,
    hsn: '8711',
    exShowroomPaise: 12170000, // ₹1,21,700
    colors: [
      { name: 'Matte Grey', hex: '#52525B', code: 'MTT_GRY' },
      { name: 'Racing Blue', hex: '#1D4ED8', code: 'RCG_BLU' },
      { name: 'Metallic Black', hex: '#09090B', code: 'MTL_BLK' },
    ],
    variants: [
      { id: 'v-fzs-deluxe', name: 'Deluxe Edition', priceDiffPaise: 0 },
    ],
    fastMover: false,
  },
  {
    id: 'bike-ktm-duke390',
    brand: 'KTM',
    model: 'Duke 390 Gen 3',
    tagline: 'No Bullshit Naked Superbike',
    bodyType: BIKE_BODY_TYPES.SPORTS,
    displacementCc: 399, // > 350cc => 40% GST tier
    fuelType: 'PETROL',
    fuelTankLitres: 15,
    mileageKmpl: 28,
    hsn: '8711',
    exShowroomPaise: 31050000, // ₹3,10,500
    colors: [
      { name: 'Electronic Orange', hex: '#EA580C', code: 'ELC_ORG' },
      { name: 'Atlantic Blue', hex: '#0284C7', code: 'ATL_BLU' },
    ],
    variants: [
      { id: 'v-duke390-standard', name: 'Standard with Launch Control', priceDiffPaise: 0 },
    ],
    fastMover: false,
  },
  {
    id: 'bike-ather-450x',
    brand: 'Ather',
    model: '450X Gen 3',
    tagline: 'Warp Mode Redefined',
    bodyType: BIKE_BODY_TYPES.EV,
    displacementCc: 0,
    fuelType: 'EV',
    fuelTankLitres: 0,
    mileageKmpl: 110, // TrueRange km
    hsn: '8711',
    exShowroomPaise: 14490000, // ₹1,44,900 (5% GST)
    colors: [
      { name: 'Space Grey', hex: '#374151', code: 'SPC_GRY' },
      { name: 'True Red', hex: '#EF4444', code: 'TRU_RED' },
      { name: 'Still White', hex: '#F9FAFB', code: 'STL_WHT' },
    ],
    variants: [
      { id: 'v-ather-29', name: '450X 2.9 kWh', priceDiffPaise: -1500000 },
      { id: 'v-ather-37', name: '450X 3.7 kWh Pro Pack', priceDiffPaise: 0 },
    ],
    fastMover: true,
  },
];
