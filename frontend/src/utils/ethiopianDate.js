/**
 * Ethiopian Calendar Utilities for EthioShop
 * Converts Gregorian dates to Ethiopian Calendar (E.C. / ዓ.ም.)
 * Supports leap years, the 13th month (Pagume), and dynamic countdown calculations.
 */

export const ETHIOPIAN_MONTHS = [
  { id: 1, en: 'Meskerem', am: 'መስከረም' },
  { id: 2, en: 'Tikimt', am: 'ጥቅምት' },
  { id: 3, en: 'Hidar', am: 'ኅዳር' },
  { id: 4, en: 'Tahsas', am: 'ታኅሣሥ' },
  { id: 5, en: 'Tir', am: 'ጥር' },
  { id: 6, en: 'Yakatit', am: 'የካቲት' },
  { id: 7, en: 'Magabit', am: 'መጋቢት' },
  { id: 8, en: 'Miyazya', am: 'ሚያዝያ' },
  { id: 9, en: 'Ginbot', am: 'ግንቦት' },
  { id: 10, en: 'Sene', am: 'ሰኔ' },
  { id: 11, en: 'Hamle', am: 'ሐምሌ' },
  { id: 12, en: 'Nehase', am: 'ነሐሴ' },
  { id: 13, en: 'Pagume', am: 'ጳጉሜ' },
];

function gregorianToJDN(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function jdnToEthiopian(jdn) {
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

/**
 * Convert Gregorian date to Ethiopian calendar date
 * @param {Date|string|number} dateInput
 * @returns {{ year: number, month: number, day: number, monthNameEn: string, monthNameAm: string }}
 */
export function gregorianToEthiopian(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) {
    return { year: 2018, month: 1, day: 1, monthNameEn: 'Meskerem', monthNameAm: 'መስከረም' };
  }
  const jdn = gregorianToJDN(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const eth = jdnToEthiopian(jdn);
  const monthInfo = ETHIOPIAN_MONTHS[eth.month - 1] || ETHIOPIAN_MONTHS[0];
  return {
    ...eth,
    monthNameEn: monthInfo.en,
    monthNameAm: monthInfo.am,
  };
}

/**
 * Formats date into Ethiopian calendar string
 * @param {Date|string|number} dateInput
 * @param {'full'|'short'|'both'} format
 * @returns {string} e.g. "Pagume 3, 2018 E.C."
 */
export function formatEthiopianDate(dateInput, format = 'full') {
  const eth = gregorianToEthiopian(dateInput);
  if (format === 'short') {
    return `${eth.day}/${eth.month}/${eth.year} ዓ.ም.`;
  }
  if (format === 'both') {
    return `${eth.monthNameEn} ${eth.day}, ${eth.year} E.C. (${eth.monthNameAm} ${eth.day}, ${eth.year} ዓ.ም.)`;
  }
  return `${eth.monthNameEn} ${eth.day}, ${eth.year} E.C.`;
}

/**
 * Calculates remaining time until discount end date
 * @param {Date|string|number} endDateInput
 * @returns {{
 *   isExpired: boolean,
 *   days: number,
 *   hours: number,
 *   minutes: number,
 *   seconds: number,
 *   ethiopianEndDate: string
 * }}
 */
export function getRemainingDiscountTime(endDateInput) {
  if (!endDateInput) {
    return {
      isExpired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      ethiopianEndDate: '',
    };
  }

  const endMs = new Date(endDateInput).getTime();
  const diffMs = endMs - Date.now();

  if (isNaN(diffMs) || diffMs <= 0) {
    return {
      isExpired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      ethiopianEndDate: formatEthiopianDate(endDateInput),
    };
  }

  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return {
    isExpired: false,
    days,
    hours,
    minutes,
    seconds,
    ethiopianEndDate: formatEthiopianDate(endDateInput),
  };
}
