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
    videoUrl: '/hunter.mp4',
    imageUrl: '/hunter-thumb.png',
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
    videoUrl: '/classic.mp4',
    imageUrl: '/classic-thumb.png',
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
    videoUrl: '/himalaya.mp4',
    imageUrl: '/himalayan-thumb.png',
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
    videoUrl: '/scooty.mp4',
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
    videoUrl: '/splendor.mp4',
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
    videoUrl: '/pulsar.mp4',
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
    videoUrl: '/apache.mp4',
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
];
