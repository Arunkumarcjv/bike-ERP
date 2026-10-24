/**
 * Converts Indian currency in Rupees or Paise to English Words
 * e.g. 15245000 paise (₹1,52,450) -> "Rupees One Lakh Fifty-Two Thousand Four Hundred and Fifty Only"
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertBelowThousand(n) {
  let word = '';
  if (n >= 100) {
    word += ONES[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n > 0) {
    if (word !== '') word += 'and ';
    if (n < 20) {
      word += ONES[n] + ' ';
    } else {
      word += TENS[Math.floor(n / 10)] + ' ';
      if (n % 10 > 0) {
        word += ONES[n % 10] + ' ';
      }
    }
  }
  return word;
}

export function amountInWords(paiseAmount) {
  if (paiseAmount == null || isNaN(paiseAmount)) return 'Zero Rupees Only';

  const totalRupees = Math.floor(Math.abs(paiseAmount) / 100);
  const paise = Math.round(Math.abs(paiseAmount) % 100);

  if (totalRupees === 0 && paise === 0) return 'Zero Rupees Only';

  let rupees = totalRupees;
  let words = '';

  const crores = Math.floor(rupees / 10000000);
  rupees %= 10000000;

  const lakhs = Math.floor(rupees / 100000);
  rupees %= 100000;

  const thousands = Math.floor(rupees / 1000);
  rupees %= 1000;

  const hundreds = rupees;

  if (crores > 0) {
    words += convertBelowThousand(crores).trim() + ' Crore ';
  }
  if (lakhs > 0) {
    words += convertBelowThousand(lakhs).trim() + ' Lakh ';
  }
  if (thousands > 0) {
    words += convertBelowThousand(thousands).trim() + ' Thousand ';
  }
  if (hundreds > 0) {
    words += convertBelowThousand(hundreds).trim() + ' ';
  }

  words = words.trim();
  let result = words.length > 0 ? `Rupees ${words}` : '';

  if (paise > 0) {
    const paiseWords = convertBelowThousand(paise).trim();
    if (result.length > 0) {
      result += ` and ${paiseWords} Paise`;
    } else {
      result = `${paiseWords} Paise`;
    }
  }

  return (result + ' Only').replace(/\s+/g, ' ');
}
