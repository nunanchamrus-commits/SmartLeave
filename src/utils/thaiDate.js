export const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export const THAI_MONTHS_FULL = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

/**
 * แปลงวันที่ ISO (YYYY-MM-DD) หรือ Date ให้เป็นรูปแบบ พ.ศ. ภาษาไทย เช่น "18 พ.ย. 2569"
 */
export function formatThaiDateBE(input) {
  if (!input) return '';
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return '';

    // รูปแบบ ISO: 2026-11-18 หรือ 2026-11-18T...
    const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      let y = parseInt(isoMatch[1], 10);
      const m = parseInt(isoMatch[2], 10) - 1;
      const d = parseInt(isoMatch[3], 10);
      if (y < 2400) y += 543;
      const monthName = THAI_MONTHS_SHORT[m];
      if (monthName && !Number.isNaN(d)) {
        return `${d} ${monthName} ${y}`;
      }
    }

    // หากเป็นรูปแบบไทยอยู่แล้ว (เช่น "18 พ.ย. 2569" หรือ "18 พ.ย. 2026") ให้แน่ใจว่าปีเป็น พ.ศ.
    const thaiMatch = trimmed.match(/^(\d{1,2}\s+[^\s]+\s+)(\d{4})(.*)$/);
    if (thaiMatch) {
      let y = parseInt(thaiMatch[2], 10);
      if (y >= 1900 && y < 2400) y += 543;
      return `${thaiMatch[1]}${y}${thaiMatch[3]}`;
    }

    return trimmed;
  }

  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    return `${input.getDate()} ${THAI_MONTHS_SHORT[input.getMonth()]} ${input.getFullYear() + 543}`;
  }

  return String(input);
}

/**
 * แปลงวันที่ ISO YYYY-MM-DD ทั้งหมดที่ปนอยู่ในข้อความให้เป็น พ.ศ. ภาษาไทย
 */
export function replaceIsoDatesWithThaiBE(text) {
  if (typeof text !== 'string' || !text) return text;
  return text.replace(/\b(19\d{2}|20\d{2}|21\d{2})-(\d{2})-(\d{2})\b/g, (full, yStr, mStr, dStr) => {
    const y = parseInt(yStr, 10) + 543;
    const m = parseInt(mStr, 10) - 1;
    const d = parseInt(dStr, 10);
    const monthName = THAI_MONTHS_SHORT[m];
    if (!monthName || Number.isNaN(d)) return full;
    return `${d} ${monthName} ${y}`;
  });
}

/**
 * สร้างข้อความช่วงวันที่ลาแบบ พ.ศ. เช่น "18 พ.ย. 2569" หรือ "18 พ.ย. 2569 – 20 พ.ย. 2569"
 */
export function formatThaiDateRangeBE(startDate, endDate, fallbackRange = '', days = null) {
  const startClean = typeof startDate === 'string' ? startDate.trim() : '';
  const endClean = typeof endDate === 'string' ? endDate.trim() : '';

  if (startClean && /^\d{4}-\d{1,2}-\d{1,2}/.test(startClean)) {
    const startBE = formatThaiDateBE(startClean);
    if (!endClean || startClean === endClean) {
      const halfSuffix =
        Number(days) === 0.5 ||
        (typeof fallbackRange === 'string' && fallbackRange.includes('ครึ่งวัน'))
          ? ' (ครึ่งวัน)'
          : '';
      return `${startBE}${halfSuffix}`;
    }
    const endBE = formatThaiDateBE(endClean);
    return `${startBE} – ${endBE}`;
  }

  if (typeof fallbackRange === 'string' && fallbackRange.trim()) {
    return replaceIsoDatesWithThaiBE(fallbackRange.trim());
  }

  return '';
}

/**
 * สร้างรายการวันที่ ISO ทั้งหมดตั้งแต่ startIso ถึง endIso เช่น ['2026-11-18', '2026-11-19', ...]
 */
export function enumerateIsoDates(startIso, endIso, maxDays = 120) {
  if (!startIso || typeof startIso !== 'string') return [];
  const sMatch = startIso.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!sMatch) return [];
  const start = new Date(
    parseInt(sMatch[1], 10),
    parseInt(sMatch[2], 10) - 1,
    parseInt(sMatch[3], 10)
  );
  let end = start;
  if (endIso && typeof endIso === 'string') {
    const eMatch = endIso.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (eMatch) {
      end = new Date(
        parseInt(eMatch[1], 10),
        parseInt(eMatch[2], 10) - 1,
        parseInt(eMatch[3], 10)
      );
    }
  }
  if (end < start) end = start;

  const dates = [];
  const cur = new Date(start.getTime());
  while (cur <= end && dates.length < maxDays) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/**
 * แปลงรายการวันที่ขอยกเลิก (array หรือ start/end) เป็นข้อความ พ.ศ. ที่อ่านง่าย
 */
export function formatCancelDatesBE(cancelDates, cancelStartDate, cancelEndDate, cancelDays = null) {
  let arr = [];
  if (Array.isArray(cancelDates)) {
    arr = cancelDates.filter((d) => typeof d === 'string' && /^\d{4}-\d{1,2}-\d{1,2}/.test(d));
  } else if (typeof cancelDates === 'string' && cancelDates.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(cancelDates);
      if (Array.isArray(parsed)) {
        arr = parsed.filter((d) => typeof d === 'string' && /^\d{4}-\d{1,2}-\d{1,2}/.test(d));
      }
    } catch (e) {}
  }

  if (arr.length === 1) {
    const label = formatThaiDateBE(arr[0]);
    return Number(cancelDays) === 0.5 ? `${label} (ครึ่งวัน)` : label;
  }

  if (arr.length > 1) {
    const sorted = [...arr].sort();
    // ตรวจสอบว่าวันที่เรียงติดกันทั้งหมดหรือไม่
    const fullSpan = enumerateIsoDates(sorted[0], sorted[sorted.length - 1]);
    if (fullSpan.length === sorted.length) {
      return `${formatThaiDateBE(sorted[0])} – ${formatThaiDateBE(sorted[sorted.length - 1])}`;
    }
    return sorted.map((d) => formatThaiDateBE(d)).join(', ');
  }

  if (cancelStartDate) {
    return formatThaiDateRangeBE(cancelStartDate, cancelEndDate || cancelStartDate, '', cancelDays);
  }

  return '';
}

/**
 * คำนวณวันที่คงเหลือหลังหักวันที่ขอยกเลิกออก
 */
export function computeRemainingDatesAfterCancel(startIso, endIso, cancelDates, cancelStartDate, cancelEndDate) {
  const allDates = enumerateIsoDates(startIso, endIso);
  if (allDates.length === 0) {
    return { remainingDates: [], nextStartDate: startIso, nextEndDate: endIso };
  }

  let cancelSet = new Set();
  if (Array.isArray(cancelDates) && cancelDates.length > 0) {
    cancelDates.forEach((d) => cancelSet.add(d));
  } else if (typeof cancelDates === 'string' && cancelDates.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(cancelDates);
      if (Array.isArray(parsed)) parsed.forEach((d) => cancelSet.add(d));
    } catch (e) {}
  }

  if (cancelSet.size === 0 && cancelStartDate) {
    enumerateIsoDates(cancelStartDate, cancelEndDate || cancelStartDate).forEach((d) =>
      cancelSet.add(d)
    );
  }

  const remainingDates = allDates.filter((d) => !cancelSet.has(d));
  return {
    remainingDates,
    nextStartDate: remainingDates.length > 0 ? remainingDates[0] : startIso,
    nextEndDate: remainingDates.length > 0 ? remainingDates[remainingDates.length - 1] : endIso,
  };
}
