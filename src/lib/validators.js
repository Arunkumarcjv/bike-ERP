import { z } from 'zod';
import { isValidGstin } from './gst';

// Standard Regexes
export const PHONE_REGEX = /^(?:\+91|91)?[6-9]\d{9}$/;
export const CHASSIS_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i; // 17 chars, no I, O, Q
export const REGISTRATION_REGEX = /^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4}$/i;

// Reusable Zod Primitives
export const phoneSchema = z.string().refine((val) => PHONE_REGEX.test(val.replace(/\s+/g, '')), {
  message: 'Enter a valid 10-digit Indian mobile number (+91)',
});

export const gstinSchema = z.string().refine(isValidGstin, {
  message: 'Enter a valid 15-character GSTIN with recognized State Code',
});

export const chassisSchema = z.string().refine((val) => CHASSIS_REGEX.test(val.trim()), {
  message: 'Chassis / VIN must be exactly 17 alphanumeric characters (excluding I, O, Q)',
});

export const registrationSchema = z.string().refine((val) => REGISTRATION_REGEX.test(val.trim()), {
  message: 'Registration number must match Indian RTO format (e.g. KA-05-EV-4091)',
});

export const moneyPaiseSchema = z.number().int().nonnegative('Amount must be positive');

// Domain Schemas
export const customerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: phoneSchema,
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().min(5, 'Address is required for invoicing & RTO'),
  city: z.string().min(2, 'City is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter valid 6-digit PIN code'),
  stateCode: z.string().default('29'),
  gstin: z.string().optional().refine((val) => !val || isValidGstin(val), {
    message: 'Invalid GSTIN format',
  }),
});

export const leadFormSchema = z.object({
  customerName: z.string().min(2, 'Customer name required'),
  phone: phoneSchema,
  email: z.string().email().optional().or(z.literal('')),
  modelId: z.string().min(1, 'Select interested bike model'),
  source: z.enum(['WALK_IN', 'PHONE', 'WEBSITE', 'WHATSAPP', 'REFERRAL']),
  budgetPaise: z.number().optional(),
  assignedTo: z.string().min(1, 'Assign sales executive'),
  notes: z.string().optional(),
});
