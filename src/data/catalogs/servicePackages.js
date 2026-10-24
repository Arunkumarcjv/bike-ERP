export const SERVICE_PACKAGES = [
  {
    id: 'pkg-free-1',
    name: '1st Free Periodic Maintenance',
    type: 'FREE',
    kmDue: 500,
    daysDue: 45,
    labourPaise: 0,
    description: 'Engine oil replacement, oil filter check, chain tension & lubrication, safety 24-point inspection',
    sac: '9987',
  },
  {
    id: 'pkg-free-2',
    name: '2nd Free Periodic Maintenance',
    type: 'FREE',
    kmDue: 4000,
    daysDue: 180,
    labourPaise: 0,
    description: 'Spark plug cleaning, carburetor/throttle body cleaning, brake inspection, electricals audit',
    sac: '9987',
  },
  {
    id: 'pkg-free-3',
    name: '3rd Free Periodic Maintenance',
    type: 'FREE',
    kmDue: 8000,
    daysDue: 360,
    labourPaise: 0,
    description: 'Tappet clearance inspection, brake fluid flush, fork oil inspection, general lube',
    sac: '9987',
  },
  {
    id: 'pkg-paid-minor',
    name: 'General Minor Service (Express)',
    type: 'PAID',
    labourPaise: 65000, // ₹650 + GST
    description: 'Oil change, washing, chain lube, basic electrical checks, mirror & lever adjustment',
    sac: '9987',
  },
  {
    id: 'pkg-paid-major',
    name: 'Comprehensive Major Service',
    type: 'PAID',
    labourPaise: 165000, // ₹1,650 + GST
    description: 'Full engine de-carbonization, brake pads overhaul, cone set greasing, wheel balancing, water wash & polish',
    sac: '9987',
  },
  {
    id: 'pkg-ev-tune',
    name: 'EV Diagnostics & Battery Health Audit',
    type: 'PAID',
    labourPaise: 85000, // ₹850 + GST
    description: 'BMS telematics scan, motor insulation resistance check, firmware flashing, regenerative brake calibration',
    sac: '9987',
  },
];
