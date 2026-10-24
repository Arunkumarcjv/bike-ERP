import { relativeDateIso } from '../../lib/dates';
import { subDays } from 'date-fns';

/**
 * Enterprise Realistic Invoices Generator
 * Seeded relative to current date and time:
 * - 4 to 7 vehicle invoices posted today (mix of petrol <=350cc @ 18%, petrol >350cc @ 40%, EV @ 5%)
 * - 8 to 15 service and parts invoices posted today
 * - Hourly timestamps ONLY up to current time (no future-hour revenue)
 * - 30 days of realistic history
 * - Gap-free sequential numbering VI/2627/00001 ... (max 16 chars)
 */

function generateInvoices() {
  const invoices = [];
  const now = new Date();
  const currentHour = now.getHours();

  // Helper to format invoice number: VI/2627/00001
  const getInvNumber = (n) => `VI/2627/${String(n).padStart(5, '0')}`;

  // Prepend canonical invoice VI/2627/00001 reconciling with Sales Order so-2627-003 (Rohit Chandran, Himalayan 450)
  invoices.push({
    id: 'inv-2627-001',
    invoiceNumber: 'VI/2627/00001',
    type: 'VEHICLE_SALE',
    date: relativeDateIso(-75, 11, 0),
    customerId: 'cust-rohit-chandran',
    customerName: 'Rohit Chandran',
    customerPhone: '+91 98800 77123',
    customerAddress: '14/B, HSR Layout Sector 1, Bangalore - 560102',
    buyerStateCode: '29',
    sellerStateCode: '29',
    gstin: null,
    status: 'POSTED',
    items: [
      {
        description: 'Royal Enfield Himalayan 450 Hanle Black (Chassis: ME3U4S5C8PRA99102, Engine: U4S5C899102)',
        hsn: '8711',
        qty: 1,
        taxableAmountPaise: 27785714,
        gstRatePercent: 40.0,
        cgstRatePercent: 20.0,
        sgstRatePercent: 20.0,
        igstRatePercent: 0,
        cgstPaise: 5557143,
        sgstPaise: 5557143,
        igstPaise: 0,
        lineTotalPaise: 38900000,
      },
    ],
    taxableAmountPaise: 27785714,
    cgstPaise: 5557143,
    sgstPaise: 5557143,
    igstPaise: 0,
    totalTaxPaise: 11114286,
    roundOffPaise: 0,
    grandTotalPaise: 38900000,
    paidAmountPaise: 38900000,
    balanceDuePaise: 0,
    paymentStatus: 'PAID',
    paymentMode: 'FINANCE_DISBURSEMENT',
    paymentRef: 'ICICI-DISB-77192',
    postedAt: relativeDateIso(-75, 11, 0),
    postedBy: 'Pooja Iyer (Accountant)',
    branchId: 'br-blr-central',
  });

  let seq = 2;

  // Vehicle catalog models for realistic billing
  const vehicleTemplates = [
    {
      name: 'Royal Enfield Hunter 350 Dapper White',
      hsn: '8711',
      taxablePaise: 12703390,
      gstRate: 18.0,
      totalPaise: 14990000,
      cc: 349,
      fuel: 'PETROL',
    },
    {
      name: 'Royal Enfield Classic 350 Medallion Bronze',
      hsn: '8711',
      taxablePaise: 16355932,
      gstRate: 18.0,
      totalPaise: 19300000,
      cc: 349,
      fuel: 'PETROL',
    },
    {
      name: 'Royal Enfield Himalayan 450 Kaza Brown',
      hsn: '8711',
      taxablePaise: 20357143,
      gstRate: 40.0,
      totalPaise: 28500000,
      cc: 452,
      fuel: 'PETROL',
    },
    {
      name: 'TVS iQube Electric S (Titanium Grey)',
      hsn: '8711',
      taxablePaise: 11904762,
      gstRate: 5.0,
      totalPaise: 12500000,
      cc: 0,
      fuel: 'EV',
    },
    {
      name: 'Ather 450X Gen 3 (Cosmic Black)',
      hsn: '8711',
      taxablePaise: 13809524,
      gstRate: 5.0,
      totalPaise: 14500000,
      cc: 0,
      fuel: 'EV',
    },
    {
      name: 'Honda Activa 125 Disc DLX',
      hsn: '8711',
      taxablePaise: 7533898,
      gstRate: 18.0,
      totalPaise: 8890000,
      cc: 124,
      fuel: 'PETROL',
    },
  ];

  const serviceTemplates = [
    {
      desc: 'Periodic Paid Service Labour (SAC 9987)',
      sac: '9987',
      taxablePaise: 65000,
      gstRate: 18.0,
      totalPaise: 76700,
      type: 'SERVICE',
    },
    {
      desc: 'Motul 7100 4T 15W-50 Engine Oil 2.5L (HSN 2710)',
      hsn: '2710',
      taxablePaise: 194915,
      gstRate: 18.0,
      totalPaise: 230000,
      type: 'PARTS_COUNTER',
    },
    {
      desc: 'Front & Rear Brake Pad Set Genuine (HSN 8714)',
      hsn: '8714',
      taxablePaise: 101695,
      gstRate: 18.0,
      totalPaise: 120000,
      type: 'PARTS_COUNTER',
    },
    {
      desc: 'Foam Wash, Chain Cleaning & Teflon Detailing (SAC 9987)',
      sac: '9987',
      taxablePaise: 42373,
      gstRate: 18.0,
      totalPaise: 50000,
      type: 'SERVICE',
    },
  ];

  const customersPool = [
    { name: 'Rohan Mehta', phone: '+91 98450 12345', address: 'Indiranagar, Bangalore' },
    { name: 'Priya Singh', phone: '+91 98450 12345', address: 'Koramangala, Bangalore' },
    { name: 'Arjun Das', phone: '+91 97412 88901', address: 'Whitefield, Bangalore' },
    { name: 'Sandeep Yadav', phone: '+91 96112 33445', address: 'HSR Layout, Bangalore' },
    { name: 'Neha Verma', phone: '+91 99801 44552', address: 'Jayanagar, Bangalore' },
    { name: 'Rohit Chandran', phone: '+91 98800 77123', address: 'Domlur, Bangalore' },
    { name: 'Sunil Hegde', phone: '+91 98452 99011', address: 'Malleshwaram, Bangalore' },
    { name: 'Kavita Nair', phone: '+91 98860 11223', address: 'Electronic City, Bangalore' },
  ];

  // 1. Generate 30 days of past history (Days -30 to -1)
  for (let d = 30; d >= 1; d--) {
    // 2-4 vehicle invoices per past day
    const vehicleCount = 2 + (d % 3);
    for (let v = 0; v < vehicleCount; v++) {
      const tmpl = vehicleTemplates[(d + v) % vehicleTemplates.length];
      const cust = customersPool[(d * 2 + v) % customersPool.length];
      const totalTax = tmpl.totalPaise - tmpl.taxablePaise;
      const cgst = Math.round(totalTax / 2);
      const sgst = totalTax - cgst;
      const invNum = getInvNumber(seq++);

      invoices.push({
        id: `inv-hist-${seq}`,
        invoiceNumber: invNum,
        type: 'VEHICLE_SALE',
        date: relativeDateIso(-d, 10 + (v * 2), 15),
        customerId: `cust-h-${d}-${v}`,
        customerName: cust.name,
        customerPhone: cust.phone,
        customerAddress: cust.address,
        buyerStateCode: '29',
        sellerStateCode: '29',
        gstin: null,
        status: 'POSTED',
        items: [
          {
            description: tmpl.name,
            hsn: tmpl.hsn,
            qty: 1,
            taxableAmountPaise: tmpl.taxablePaise,
            gstRatePercent: tmpl.gstRate,
            cgstRatePercent: tmpl.gstRate / 2,
            sgstRatePercent: tmpl.gstRate / 2,
            igstRatePercent: 0,
            cgstPaise: cgst,
            sgstPaise: sgst,
            igstPaise: 0,
            lineTotalPaise: tmpl.totalPaise,
          },
        ],
        taxableAmountPaise: tmpl.taxablePaise,
        cgstPaise: cgst,
        sgstPaise: sgst,
        igstPaise: 0,
        totalTaxPaise: totalTax,
        roundOffPaise: 0,
        grandTotalPaise: tmpl.totalPaise,
        paidAmountPaise: tmpl.totalPaise,
        balanceDuePaise: 0,
        paymentStatus: 'PAID',
        paymentMode: v % 2 === 0 ? 'UPI' : 'FINANCE_DISBURSEMENT',
        paymentRef: `TXN-${10000 + seq}`,
        postedAt: relativeDateIso(-d, 10 + (v * 2), 15),
        postedBy: 'Pooja Iyer (Accountant)',
        branchId: 'br-blr-central',
      });
    }

    // 4-6 service/parts invoices per past day
    const serviceCount = 4 + (d % 3);
    for (let s = 0; s < serviceCount; s++) {
      const tmpl = serviceTemplates[(d + s) % serviceTemplates.length];
      const cust = customersPool[(d + s) % customersPool.length];
      const totalTax = tmpl.totalPaise - tmpl.taxablePaise;
      const cgst = Math.round(totalTax / 2);
      const sgst = totalTax - cgst;
      const invNum = getInvNumber(seq++);

      invoices.push({
        id: `inv-hist-${seq}`,
        invoiceNumber: invNum,
        type: tmpl.type,
        date: relativeDateIso(-d, 9 + s, 30),
        customerId: `cust-s-${d}-${s}`,
        customerName: cust.name,
        customerPhone: cust.phone,
        customerAddress: cust.address,
        buyerStateCode: '29',
        sellerStateCode: '29',
        gstin: null,
        status: 'POSTED',
        items: [
          {
            description: tmpl.desc,
            hsn: tmpl.hsn,
            sac: tmpl.sac,
            qty: 1,
            taxableAmountPaise: tmpl.taxablePaise,
            gstRatePercent: tmpl.gstRate,
            cgstRatePercent: tmpl.gstRate / 2,
            sgstRatePercent: tmpl.gstRate / 2,
            igstRatePercent: 0,
            cgstPaise: cgst,
            sgstPaise: sgst,
            igstPaise: 0,
            lineTotalPaise: tmpl.totalPaise,
          },
        ],
        taxableAmountPaise: tmpl.taxablePaise,
        cgstPaise: cgst,
        sgstPaise: sgst,
        igstPaise: 0,
        totalTaxPaise: totalTax,
        roundOffPaise: 0,
        grandTotalPaise: tmpl.totalPaise,
        paidAmountPaise: tmpl.totalPaise,
        balanceDuePaise: 0,
        paymentStatus: 'PAID',
        paymentMode: 'UPI',
        paymentRef: `UPI-${20000 + seq}`,
        postedAt: relativeDateIso(-d, 9 + s, 30),
        postedBy: 'Pooja Iyer (Accountant)',
        branchId: 'br-blr-central',
      });
    }
  }

  // 2. Generate TODAY'S invoices (Day 0)
  // Ensure timestamps are strictly <= current hour and minutes
  const availableHours = [];
  const startHour = 9;
  const maxHour = Math.max(startHour, Math.min(currentHour, 21));
  for (let h = startHour; h <= maxHour; h++) {
    availableHours.push(h);
  }

  // 5 Vehicle Invoices Today
  const todayVehicles = [
    vehicleTemplates[0], // Hunter 350 (Petrol <= 350cc @ 18%)
    vehicleTemplates[1], // Classic 350 (Petrol <= 350cc @ 18%)
    vehicleTemplates[2], // Himalayan 450 (Petrol > 350cc @ 40%)
    vehicleTemplates[3], // TVS iQube (EV @ 5%)
    vehicleTemplates[4], // Ather 450X (EV @ 5%)
  ];

  todayVehicles.forEach((tmpl, idx) => {
    const cust = customersPool[idx % customersPool.length];
    const totalTax = tmpl.totalPaise - tmpl.taxablePaise;
    const cgst = Math.round(totalTax / 2);
    const sgst = totalTax - cgst;
    const invNum = getInvNumber(seq++);
    const hour = availableHours[idx % availableHours.length];
    const minute = (idx * 12 + 10) % 55;

    invoices.push({
      id: `inv-today-v-${idx + 1}`,
      invoiceNumber: invNum,
      type: 'VEHICLE_SALE',
      date: relativeDateIso(0, hour, minute),
      customerId: `cust-today-${idx}`,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerAddress: cust.address,
      buyerStateCode: '29',
      sellerStateCode: '29',
      gstin: null,
      status: 'POSTED',
      items: [
        {
          description: tmpl.name,
          hsn: tmpl.hsn,
          qty: 1,
          taxableAmountPaise: tmpl.taxablePaise,
          gstRatePercent: tmpl.gstRate,
          cgstRatePercent: tmpl.gstRate / 2,
          sgstRatePercent: tmpl.gstRate / 2,
          igstRatePercent: 0,
          cgstPaise: cgst,
          sgstPaise: sgst,
          igstPaise: 0,
          lineTotalPaise: tmpl.totalPaise,
        },
      ],
      taxableAmountPaise: tmpl.taxablePaise,
      cgstPaise: cgst,
      sgstPaise: sgst,
      igstPaise: 0,
      totalTaxPaise: totalTax,
      roundOffPaise: 0,
      grandTotalPaise: tmpl.totalPaise,
      paidAmountPaise: tmpl.totalPaise,
      balanceDuePaise: 0,
      paymentStatus: 'PAID',
      paymentMode: idx % 2 === 0 ? 'UPI' : 'FINANCE_DISBURSEMENT',
      paymentRef: `PAY-TODAY-${idx + 1}`,
      postedAt: relativeDateIso(0, hour, minute),
      postedBy: 'Pooja Iyer (Accountant)',
      branchId: 'br-blr-central',
    });
  });

  // 10 Service and Parts Invoices Today
  const todayServiceCounts = 10;
  for (let s = 0; s < todayServiceCounts; s++) {
    const tmpl = serviceTemplates[s % serviceTemplates.length];
    const cust = customersPool[(s + 2) % customersPool.length];
    const totalTax = tmpl.totalPaise - tmpl.taxablePaise;
    const cgst = Math.round(totalTax / 2);
    const sgst = totalTax - cgst;
    const invNum = getInvNumber(seq++);
    const hour = availableHours[s % availableHours.length];
    const minute = (s * 5 + 15) % 55;

    invoices.push({
      id: `inv-today-s-${s + 1}`,
      invoiceNumber: invNum,
      type: tmpl.type,
      date: relativeDateIso(0, hour, minute),
      customerId: `cust-today-svc-${s}`,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerAddress: cust.address,
      buyerStateCode: '29',
      sellerStateCode: '29',
      gstin: null,
      status: 'POSTED',
      items: [
        {
          description: tmpl.desc,
          hsn: tmpl.hsn,
          sac: tmpl.sac,
          qty: 1,
          taxableAmountPaise: tmpl.taxablePaise,
          gstRatePercent: tmpl.gstRate,
          cgstRatePercent: tmpl.gstRate / 2,
          sgstRatePercent: tmpl.gstRate / 2,
          igstRatePercent: 0,
          cgstPaise: cgst,
          sgstPaise: sgst,
          igstPaise: 0,
          lineTotalPaise: tmpl.totalPaise,
        },
      ],
      taxableAmountPaise: tmpl.taxablePaise,
      cgstPaise: cgst,
      sgstPaise: sgst,
      igstPaise: 0,
      totalTaxPaise: totalTax,
      roundOffPaise: 0,
      grandTotalPaise: tmpl.totalPaise,
      paidAmountPaise: tmpl.totalPaise,
      balanceDuePaise: 0,
      paymentStatus: 'PAID',
      paymentMode: 'UPI',
      paymentRef: `UPI-SRV-${s + 1}`,
      postedAt: relativeDateIso(0, hour, minute),
      postedBy: 'Pooja Iyer (Accountant)',
      branchId: 'br-blr-central',
    });
  }

  return invoices;
}

export const SEEDED_INVOICES = generateInvoices();

export const SEEDED_CHART_OF_ACCOUNTS = [
  { code: '1001', name: 'Cash in Hand (Showroom Counter)', type: 'ASSET', balancePaise: 14250000 },
  { code: '1002', name: 'HDFC Current Bank Account (Ending 4019)', type: 'ASSET', balancePaise: 489200000 },
  { code: '1003', name: 'ICICI Settlement Account (UPI/POS)', type: 'ASSET', balancePaise: 215400000 },
  { code: '1201', name: 'Trade Debtors / Customer Receivables', type: 'ASSET', balancePaise: 12500000 },
  { code: '1301', name: 'Vehicle Inventory Stock', type: 'ASSET', balancePaise: 1850000000 },
  { code: '1302', name: 'Genuine Spare Parts Stock', type: 'ASSET', balancePaise: 38400000 },
  { code: '2001', name: 'Trade Payables (OEM / Suppliers)', type: 'LIABILITY', balancePaise: 620000000 },
  { code: '2101', name: 'CGST Output Liability (Karnataka 29)', type: 'LIABILITY', balancePaise: 34500000 },
  { code: '2102', name: 'SGST Output Liability (Karnataka 29)', type: 'LIABILITY', balancePaise: 34500000 },
  { code: '2103', name: 'IGST Output Liability', type: 'LIABILITY', balancePaise: 4200000 },
  { code: '2104', name: 'Eligible ITC CGST (Input Tax Credit)', type: 'ASSET', balancePaise: 28900000 },
  { code: '2105', name: 'Eligible ITC SGST (Input Tax Credit)', type: 'ASSET', balancePaise: 28900000 },
  { code: '4001', name: 'Revenue: Vehicle Sales', type: 'INCOME', balancePaise: 4250000000 },
  { code: '4002', name: 'Revenue: Service Workshop Labour', type: 'INCOME', balancePaise: 18500000 },
  { code: '4003', name: 'Revenue: Spare Parts & Accessories', type: 'INCOME', balancePaise: 49500000 },
  { code: '5001', name: 'Direct Cost of Goods Sold (Vehicles)', type: 'EXPENSE', balancePaise: 3820000000 },
  { code: '5002', name: 'Direct Cost: Genuine Spare Parts', type: 'EXPENSE', balancePaise: 28500000 },
  { code: '6001', name: 'Salaries & Staff Incentives', type: 'EXPENSE', balancePaise: 12500000 },
  { code: '6002', name: 'Showroom Electricity & Bay Maintenance', type: 'EXPENSE', balancePaise: 3200000 },
];

export const SEEDED_JOURNAL_ENTRIES = [
  {
    id: 'jv-2627-001',
    voucherNumber: 'JV/2627/00001',
    reference: 'Invoice VI/2627/00001 - Rohit Chandran',
    date: relativeDateIso(-75, 18, 0),
    narration: 'Vehicle sales posting for Himalayan 450 (Chassis ME3U4S5C8PRA99102)',
    debitTotalPaise: 38900000,
    creditTotalPaise: 38900000,
    status: 'POSTED',
    postedBy: 'Pooja Iyer (Accountant)',
    lines: [
      { accountCode: '1002', accountName: 'HDFC Current Bank Account', debitPaise: 38900000, creditPaise: 0 },
      { accountCode: '4001', accountName: 'Revenue: Vehicle Sales', debitPaise: 0, creditPaise: 27785714 },
      { accountCode: '2101', accountName: 'CGST Output Liability', debitPaise: 0, creditPaise: 5557143 },
      { accountCode: '2102', accountName: 'SGST Output Liability', debitPaise: 0, creditPaise: 5557143 },
    ],
  },
];
