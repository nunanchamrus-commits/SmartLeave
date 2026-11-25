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
 * คำนวณข้อมูลปีงบประมาณและรอบการตัดวันลาตามระเบียบทางราชการไทย
 * - ปีงบประมาณ: 1 ตุลาคม ปีก่อนหน้า ถึง 30 กันยายน ปีงบประมาณ
 * - รอบที่ 1: 1 ตุลาคม ถึง 31 มีนาคม (เช่น ปี 2569: 1 ต.ค. 2568 - 31 มี.ค. 2569)
 * - รอบที่ 2: 1 เมษายน ถึง 30 กันยายน (เช่น ปี 2569: 1 เม.ย. 2569 - 30 ก.ย. 2569)
 */
export function getFiscalYearInfo(dateInput = new Date()) {
  let d;
  if (!dateInput) {
    d = new Date();
  } else if (dateInput instanceof Date) {
    d = dateInput;
  } else if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      let y = parseInt(isoMatch[1], 10);
      const mo = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);
      if (y > 2400) y -= 543;
      d = new Date(y, mo, day);
    } else {
      d = new Date(dateInput);
    }
  } else {
    d = new Date(dateInput);
  }

  if (isNaN(d.getTime())) {
    d = new Date();
  }

  const month = d.getMonth() + 1; // 1-12
  let yearCE = d.getFullYear();
  if (yearCE > 2400) yearCE -= 543;

  // เดือน ต.ค. (10), พ.ย. (11), ธ.ค. (12) เข้าสู่ปีงบประมาณถัดไป
  const fiscalYearCE = month >= 10 ? yearCE + 1 : yearCE;
  const fiscalYearBE = fiscalYearCE + 543;

  // รอบที่ 1: 1 ต.ค. - 31 มี.ค. (เดือน 10, 11, 12, 1, 2, 3)
  // รอบที่ 2: 1 เม.ย. - 30 ก.ย. (เดือน 4, 5, 6, 7, 8, 9)
  const round = (month >= 10 || month <= 3) ? 1 : 2;
  const roundLabel = `รอบที่ ${round}`;
  const roundTitle = round === 1
    ? `รอบที่ 1 (1 ต.ค. ${fiscalYearBE - 1} - 31 มี.ค. ${fiscalYearBE})`
    : `รอบที่ 2 (1 เม.ย. ${fiscalYearBE} - 30 ก.ย. ${fiscalYearBE})`;

  const roundStartDateCE = round === 1 ? `${fiscalYearCE - 1}-10-01` : `${fiscalYearCE}-04-01`;
  const roundEndDateCE = round === 1 ? `${fiscalYearCE}-03-31` : `${fiscalYearCE}-09-30`;

  const roundDateRangeBE = round === 1
    ? `1 ตุลาคม ${fiscalYearBE - 1} - 31 มีนาคม ${fiscalYearBE}`
    : `1 เมษายน ${fiscalYearBE} - 30 กันยายน ${fiscalYearBE}`;

  const roundDateRangeShortBE = round === 1
    ? `1 ต.ค. ${fiscalYearBE - 1} - 31 มี.ค. ${fiscalYearBE}`
    : `1 เม.ย. ${fiscalYearBE} - 30 ก.ย. ${fiscalYearBE}`;

  const fiscalYearStartDateCE = `${fiscalYearCE - 1}-10-01`;
  const fiscalYearEndDateCE = `${fiscalYearCE}-09-30`;
  const fiscalYearRangeBE = `1 ตุลาคม ${fiscalYearBE - 1} - 30 กันยายน ${fiscalYearBE}`;
  const fiscalYearRangeShortBE = `1 ต.ค. ${fiscalYearBE - 1} - 30 ก.ย. ${fiscalYearBE}`;

  return {
    fiscalYearCE,
    fiscalYearBE,
    round,
    roundLabel,
    roundTitle,
    roundStartDateCE,
    roundEndDateCE,
    roundDateRangeBE,
    roundDateRangeShortBE,
    fiscalYearStartDateCE,
    fiscalYearEndDateCE,
    fiscalYearRangeBE,
    fiscalYearRangeShortBE,
  };
}

/**
 * ดึงปีงบประมาณ พ.ศ. ปัจจุบัน
 */
export function getCurrentFiscalYearBE() {
  return getFiscalYearInfo(new Date()).fiscalYearBE;
}

/**
 * รายละเอียดของปีงบประมาณและทั้ง 2 รอบการตัดวันลา
 */
export function getFiscalYearDetails(fiscalYearBE) {
  const be = Number(fiscalYearBE) || getCurrentFiscalYearBE();
  const ce = be - 543;
  return {
    fiscalYearBE: be,
    fiscalYearCE: ce,
    fiscalYearLabel: `ประจำปีงบประมาณ ${be}`,
    fiscalYearRangeBE: `1 ตุลาคม ${be - 1} - 30 กันยายน ${be}`,
    fiscalYearRangeShortBE: `1 ต.ค. ${be - 1} - 30 ก.ย. ${be}`,
    startDateCE: `${ce - 1}-10-01`,
    endDateCE: `${ce}-09-30`,
    rounds: [
      {
        round: 1,
        roundLabel: 'รอบที่ 1',
        roundTitle: `รอบที่ 1 (1 ต.ค. ${be - 1} - 31 มี.ค. ${be})`,
        roundDateRangeBE: `1 ตุลาคม ${be - 1} - 31 มีนาคม ${be}`,
        roundDateRangeShortBE: `1 ต.ค. ${be - 1} - 31 มี.ค. ${be}`,
        startDateCE: `${ce - 1}-10-01`,
        endDateCE: `${ce}-03-31`,
      },
      {
        round: 2,
        roundLabel: 'รอบที่ 2',
        roundTitle: `รอบที่ 2 (1 เม.ย. ${be} - 30 ก.ย. ${be})`,
        roundDateRangeBE: `1 เมษายน ${be} - 30 กันยายน ${be}`,
        roundDateRangeShortBE: `1 เม.ย. ${be} - 30 ก.ย. ${be}`,
        startDateCE: `${ce}-04-01`,
        endDateCE: `${ce}-09-30`,
      },
    ],
  };
}

/**
 * แปลงวันที่หรือสตริงวันที่ให้ได้ปีงบประมาณ พ.ศ.
 */
export function getFiscalYearBE(dateInput) {
  return getFiscalYearInfo(dateInput).fiscalYearBE;
}

/**
 * ตรวจสอบว่าวันที่ที่กำหนดอยู่ในปีงบประมาณเป้าหมายหรือไม่
 */
export function isDateInFiscalYear(dateInput, targetFiscalYearBE) {
  if (!dateInput) return false;
  const info = getFiscalYearInfo(dateInput);
  return info.fiscalYearBE === Number(targetFiscalYearBE);
}

/**
 * ตรวจสอบว่าวันที่ที่กำหนดอยู่ในรอบการตัดวันลาที่กำหนดหรือไม่
 * targetRound: 1, 2 หรือ 'all'
 */
export function isDateInFiscalRound(dateInput, targetFiscalYearBE, targetRound = 'all') {
  if (!dateInput) return false;
  const info = getFiscalYearInfo(dateInput);
  if (targetFiscalYearBE && info.fiscalYearBE !== Number(targetFiscalYearBE)) {
    return false;
  }
  if (targetRound === 'all' || !targetRound) {
    return true;
  }
  return info.round === Number(targetRound);
}

/**
 * ดึงรายการ 12 เดือนของปีงบประมาณ เรียงตามลำดับปีงบประมาณ (ต.ค. -> ก.ย.)
 */
export function getFiscalMonthsList(fiscalYearBE) {
  const be = Number(fiscalYearBE) || getCurrentFiscalYearBE();
  const ce = be - 543;
  return [
    { monthIndex: 9, monthNum: '10', nameShort: 'ต.ค.', yearCE: ce - 1, yearBE: be - 1, round: 1, label: `ต.ค. ${be - 1}` },
    { monthIndex: 10, monthNum: '11', nameShort: 'พ.ย.', yearCE: ce - 1, yearBE: be - 1, round: 1, label: `พ.ย. ${be - 1}` },
    { monthIndex: 11, monthNum: '12', nameShort: 'ธ.ค.', yearCE: ce - 1, yearBE: be - 1, round: 1, label: `ธ.ค. ${be - 1}` },
    { monthIndex: 0, monthNum: '01', nameShort: 'ม.ค.', yearCE: ce, yearBE: be, round: 1, label: `ม.ค. ${be}` },
    { monthIndex: 1, monthNum: '02', nameShort: 'ก.พ.', yearCE: ce, yearBE: be, round: 1, label: `ก.พ. ${be}` },
    { monthIndex: 2, monthNum: '03', nameShort: 'มี.ค.', yearCE: ce, yearBE: be, round: 1, label: `มี.ค. ${be}` },
    { monthIndex: 3, monthNum: '04', nameShort: 'เม.ย.', yearCE: ce, yearBE: be, round: 2, label: `เม.ย. ${be}` },
    { monthIndex: 4, monthNum: '05', nameShort: 'พ.ค.', yearCE: ce, yearBE: be, round: 2, label: `พ.ค. ${be}` },
    { monthIndex: 5, monthNum: '06', nameShort: 'มิ.ย.', yearCE: ce, yearBE: be, round: 2, label: `มิ.ย. ${be}` },
    { monthIndex: 6, monthNum: '07', nameShort: 'ก.ค.', yearCE: ce, yearBE: be, round: 2, label: `ก.ค. ${be}` },
    { monthIndex: 7, monthNum: '08', nameShort: 'ส.ค.', yearCE: ce, yearBE: be, round: 2, label: `ส.ค. ${be}` },
    { monthIndex: 8, monthNum: '09', nameShort: 'ก.ย.', yearCE: ce, yearBE: be, round: 2, label: `ก.ย. ${be}` },
  ];
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

/**
 * ดึงวันที่ปัจจุบันตามเวลาประเทศไทย (Asia/Bangkok, UTC+7) ในรูปแบบ YYYY-MM-DD
 */
export function getTodayThaiISO() {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
  } catch (e) {
    const d = new Date(Date.now() + 7 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  }
}

/**
 * ดึงวันลาวันสุดท้ายของคำขอ (endDate หรือ startDate) ในรูปแบบ ISO YYYY-MM-DD
 */
export function getLastLeaveDateISO(req) {
  if (!req) return '';
  return req.endDate || req.startDate || '';
}

/**
 * ตรวจสอบว่าคำขอลานี้สามารถขอยกเลิกได้หรือไม่
 * ตามระเบียบ: ขอยกเลิกได้ถึงวันที่ลาวันสุดท้าย (เช่น ลา 25-28 ยกเลิกได้ถึงวันที่ 28)
 * หากพ้นวันลาวันสุดท้ายไปแล้ว (เช่น วันที่ 29) จะไม่อนุญาตให้ยกเลิก
 */
export function isLeaveCancellable(req, todayIso = getTodayThaiISO()) {
  if (!req) return false;
  // คำขอที่ไม่อนุมัติ หรือถูกยกเลิกไปแล้ว ไม่สามารถยกเลิกซ้ำได้
  if (req.status === 'ไม่อนุมัติ' || req.status === 'ยกเลิกการลา' || req.status === 'ยกเลิกวันลา') {
    return false;
  }
  // หากมีคำขอยกเลิกที่อยู่ระหว่างรอพิจารณา
  if (req.cancelStatus === 'pending') {
    return false;
  }
  // หากไม่มีจำนวนวันลาเหลืออยู่
  if (Number(req.days || 0) <= 0) {
    return false;
  }
  // ตรวจสอบวันลาวันสุดท้าย: ขอยกเลิกได้ถึงวันสุดท้ายของการลา
  const lastDate = getLastLeaveDateISO(req);
  if (lastDate && todayIso > lastDate) {
    return false; // พ้นกำหนดวันลาวันสุดท้ายแล้ว
  }
  return true;
}

