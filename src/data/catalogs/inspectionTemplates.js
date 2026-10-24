export const PDI_CHECKLIST_TEMPLATE = [
  { id: 'pdi-vin', label: 'VIN & Engine Serial Match with Invoice & RTO Form 20', category: 'DOCUMENTATION' },
  { id: 'pdi-battery', label: 'Battery Terminal Voltage (Min 12.6V / EV SOC > 85%)', category: 'ELECTRICAL' },
  { id: 'pdi-oil', label: 'Engine Oil / Transmission Fluid Level & Viscosity', category: 'MECHANICAL' },
  { id: 'pdi-brakes', label: 'Front & Rear Brake Lever Travel & Disc Play', category: 'MECHANICAL' },
  { id: 'pdi-lights', label: 'Headlamp High/Low, Indicators, Hazard & Brake Lamps', category: 'ELECTRICAL' },
  { id: 'pdi-tyre', label: 'Tyre Pressure (Front 28 PSI, Rear 32 PSI) & Tread Check', category: 'TYRES' },
  { id: 'pdi-body', label: 'Body Paint Finish, Decal Alignment, Zero Transit Scratches', category: 'BODY' },
  { id: 'pdi-toolkit', label: 'Tool Kit, First Aid Kit & Owner Manual in Storage', category: 'ACCESSORIES' },
  { id: 'pdi-mirrors', label: 'Rearview Mirrors Installed & Torque Spec Verified', category: 'ACCESSORIES' },
  { id: 'pdi-fuel', label: 'Delivery Fuel Added (5 Litres / Full EV Charge)', category: 'DELIVERY' },
];

export const SERVICE_CHECKIN_INSPECTION = [
  { id: 'chk-fuel', label: 'Fuel Level / Battery SOC (%)', type: 'GAUGE' },
  { id: 'chk-odo', label: 'Odometer Reading (KM)', type: 'NUMBER' },
  { id: 'chk-scratches', label: 'Pre-existing Body Scratches / Dents', type: 'PHOTO_CHECK' },
  { id: 'chk-horn-lights', label: 'Horn & All Lights Functional', type: 'PASS_FAIL' },
  { id: 'chk-brakes', label: 'Brake Bite & Fluid Level', type: 'PASS_FAIL' },
  { id: 'chk-tyres', label: 'Tyre Condition & Tread Depth', type: 'PASS_FAIL' },
  { id: 'chk-battery', label: 'Self Start & Battery Health', type: 'PASS_FAIL' },
];
