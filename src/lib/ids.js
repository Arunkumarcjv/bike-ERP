import { FINANCIAL_YEAR } from '../config/constants';

/**
 * Generates sequential, gap-free, immutable document identifiers
 * Target format: PREFIX/FY/SEQUENCE (e.g. VI/2627/00001, max 16 chars)
 */
export function generateDocumentId(prefix, sequenceNumber, fyCode = FINANCIAL_YEAR.code) {
  const seq = String(sequenceNumber).padStart(5, '0');
  const id = `${prefix}/${fyCode}/${seq}`;
  if (id.length > 16) {
    throw new Error(`Generated document ID '${id}' exceeds statutory 16-character limit`);
  }
  return id;
}

export function generateInvoiceNumber(sequenceNumber, fyCode) {
  return generateDocumentId('VI', sequenceNumber, fyCode);
}

export function generateCreditNoteNumber(sequenceNumber, fyCode) {
  return generateDocumentId('CN', sequenceNumber, fyCode);
}

export function generateJobCardNumber(sequenceNumber, fyCode) {
  return generateDocumentId('JC', sequenceNumber, fyCode);
}

export function generateQuotationNumber(sequenceNumber, fyCode) {
  return generateDocumentId('QT', sequenceNumber, fyCode);
}

export function generateBookingNumber(sequenceNumber, fyCode) {
  return generateDocumentId('BK', sequenceNumber, fyCode);
}

export function generatePurchaseOrderNumber(sequenceNumber, fyCode) {
  return generateDocumentId('PO', sequenceNumber, fyCode);
}
