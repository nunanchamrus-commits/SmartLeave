import html2pdf from 'html2pdf.js';
import { PDFDocument, PDFName, PDFNumber, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const MONTHS_THAI_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const MONTHS_THAI_SHORT_LIST = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

const MONTHS_THAI_SHORT_MAP = {
  'ม.ค.': 0, 'ก.พ.': 1, 'มี.ค.': 2, 'เม.ย.': 3, 'พ.ค.': 4, 'มิ.ย.': 5,
  'ก.ค.': 6, 'ส.ค.': 7, 'ก.ย.': 8, 'ต.ค.': 9, 'พ.ย.': 10, 'ธ.ค.': 11,
};

let cachedFonts = null;
const cachedTemplateBytes = {};

/**
 * Robust Thai Date Parser Helper
 */
function parseDateParts(dateVal, fallbackDate = new Date()) {
  if (!dateVal) {
    const d = fallbackDate;
    return {
      day: d.getDate(),
      month: MONTHS_THAI_FULL[d.getMonth()],
      shortMonth: MONTHS_THAI_SHORT_LIST[d.getMonth()],
      year: d.getFullYear() + 543,
    };
  }

  // ISO Date string: '2026-11-20'
  if (typeof dateVal === 'string' && /^\d{4}-\d{1,2}-\d{1,2}/.test(dateVal.trim())) {
    const parts = dateVal.trim().split('-');
    if (parts.length >= 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const validM = m >= 0 && m < 12 ? m : fallbackDate.getMonth();
      return {
        day: isNaN(day) ? fallbackDate.getDate() : day,
        month: MONTHS_THAI_FULL[validM],
        shortMonth: MONTHS_THAI_SHORT_LIST[validM],
        year: (isNaN(y) ? fallbackDate.getFullYear() : y) + 543,
      };
    }
  }

  // Thai Date String: '20 พ.ย. 2569' or '20 พฤศจิกายน 2569'
  if (typeof dateVal === 'string') {
    const match = dateVal.match(/(\d+)\s+([^\s]+)\s+(\d+)/);
    if (match) {
      const d = parseInt(match[1], 10);
      const mStr = match[2];
      const y = parseInt(match[3], 10);
      const mIdx =
        MONTHS_THAI_SHORT_MAP[mStr] !== undefined
          ? MONTHS_THAI_SHORT_MAP[mStr]
          : MONTHS_THAI_FULL.indexOf(mStr);
      return {
        day: d,
        month: mIdx >= 0 ? MONTHS_THAI_FULL[mIdx] : mStr,
        shortMonth: mIdx >= 0 ? MONTHS_THAI_SHORT_LIST[mIdx] : mStr,
        year: y,
      };
    }
  }

  const d = new Date(dateVal);
  if (!isNaN(d.getTime())) {
    return {
      day: d.getDate(),
      month: MONTHS_THAI_FULL[d.getMonth()],
      shortMonth: MONTHS_THAI_SHORT_LIST[d.getMonth()],
      year: d.getFullYear() + 543,
    };
  }

  return {
    day: fallbackDate.getDate(),
    month: MONTHS_THAI_FULL[fallbackDate.getMonth()],
    shortMonth: MONTHS_THAI_SHORT_LIST[fallbackDate.getMonth()],
    year: fallbackDate.getFullYear() + 543,
  };
}

function getLeaveCategory(req) {
  if (!req) return 'other';
  if (
    req.typeKey === 'vacation' ||
    (req.type && (req.type.includes('พักผ่อน') || req.type.includes('พักร้อน')))
  ) {
    return 'vacation';
  }
  if (req.typeKey === 'sick' || (req.type && req.type.includes('ป่วย'))) {
    return 'sick';
  }
  if (req.typeKey === 'personal' || (req.type && req.type.includes('กิจ'))) {
    return 'personal';
  }
  if (req.typeKey === 'maternity' || (req.type && req.type.includes('คลอด'))) {
    return 'maternity';
  }
  return 'other';
}

function isVacationLeaveRequest(req) {
  return getLeaveCategory(req) === 'vacation';
}

function isSickPersonalMaternityRequest(req) {
  const cat = getLeaveCategory(req);
  return cat === 'sick' || cat === 'personal' || cat === 'maternity';
}

function formatLeaveDays(val) {
  const n = Number(val) || 0;
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(1)));
}

function parseComparableTimestamp(req) {
  if (!req) return 0;
  const src = req.startDate || req.appliedDate;
  if (!src) return 0;

  if (typeof src === 'string' && /^\d{4}-\d{1,2}-\d{1,2}/.test(src.trim())) {
    const parts = src.trim().split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d).getTime();
    }
  }

  if (typeof src === 'string') {
    const match = src.match(/(\d+)\s+([^\s]+)\s+(\d+)/);
    if (match) {
      const d = parseInt(match[1], 10);
      const mStr = match[2];
      let y = parseInt(match[3], 10);
      if (y > 2400) y -= 543;
      const mIdx =
        MONTHS_THAI_SHORT_MAP[mStr] !== undefined
          ? MONTHS_THAI_SHORT_MAP[mStr]
          : MONTHS_THAI_FULL.indexOf(mStr);
      if (!isNaN(y) && mIdx >= 0 && !isNaN(d)) {
        return new Date(y, mIdx, d).getTime();
      }
    }
  }

  const parsed = new Date(src);
  return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

/**
 * Fix zero-width Thai combining marks (e.g. GSUB-substituted tone marks/vowels)
 * so PDF viewers don't apply default width 1000 and create phantom spaces.
 */
async function fixZeroWidthGlyphs(pdfDoc, pdfFont) {
  await pdfFont.embed();
  const fkFont = pdfFont.embedder?.font;
  const fObj = pdfFont.ref ? pdfDoc.context.lookup(pdfFont.ref) : null;
  if (!fkFont || !fObj) return;
  const descArr = fObj.get(PDFName.of('DescendantFonts'));
  if (!descArr || typeof descArr.get !== 'function') return;
  const desc = pdfDoc.context.lookup(descArr.get(0));
  const wArr = desc?.get(PDFName.of('W'));
  if (!wArr) return;
  for (let id = 0; id < fkFont.numGlyphs; id++) {
    if (fkFont.getGlyph(id).advanceWidth === 0) {
      wArr.push(PDFNumber.of(id));
      wArr.push(pdfDoc.context.obj([0]));
    }
  }
}

/**
 * Resolve shared base employee profile from SmartLeave state / localStorage / req
 */
function resolveEmployeeBaseProfile(req) {
  let savedUser = null;
  let savedEmployees = [];
  let savedQuotas = null;

  try {
    const rawUser = localStorage.getItem('smartleave_user');
    if (rawUser) savedUser = JSON.parse(rawUser);
  } catch (e) {}

  try {
    const rawEmployees =
      localStorage.getItem('smartleave_employees') || localStorage.getItem('leaveflow_employees');
    if (rawEmployees) savedEmployees = JSON.parse(rawEmployees) || [];
  } catch (e) {}

  try {
    const rawQuotas =
      localStorage.getItem('smartleave_quotas') || localStorage.getItem('leaveflow_quotas');
    if (rawQuotas) savedQuotas = JSON.parse(rawQuotas);
  } catch (e) {}

  const empFromList = Array.isArray(savedEmployees)
    ? savedEmployees.find(
        (e) =>
          (req.employeeId && e.id === req.employeeId) ||
          (req.employeeName && e.name === req.employeeName)
      )
    : null;

  const isCurrentUser =
    savedUser &&
    ((req.employeeId && savedUser.id === req.employeeId) ||
      (req.employeeName && savedUser.name === req.employeeName));

  // Merge user profile: active savedUser takes priority if matching, then employee directory, then req itself
  const employeeName =
    req.employeeName || (isCurrentUser ? savedUser.name : null) || empFromList?.name || 'พนักงาน';

  const title =
    req.title || (isCurrentUser ? savedUser.title : null) || empFromList?.title || 'พนักงาน';

  const profileDept = (isCurrentUser ? savedUser.department : null) || empFromList?.department || '';
  const reqDept = req.department || '';
  const department =
    profileDept && profileDept.length >= reqDept.length
      ? profileDept
      : reqDept || profileDept || 'สำนักงานสหกรณ์จังหวัดขอนแก่น';

  const phone = req.phone || (isCurrentUser ? savedUser.phone : null) || empFromList?.phone || '';
  const email = req.email || (isCurrentUser ? savedUser.email : null) || empFromList?.email || '';
  const approverName = req.approver || 'นายสมชาย มั่นคง';

  return {
    savedUser,
    savedEmployees,
    savedQuotas,
    empFromList,
    isCurrentUser,
    employeeName,
    title,
    department,
    phone,
    email,
    approverName,
  };
}

/**
 * Resolve full existing employee profile, leave balance, and statistics from state/localStorage
 */
function resolveVacationEmployeeData(req) {
  const {
    savedUser,
    savedQuotas,
    empFromList,
    isCurrentUser,
    employeeName,
    title,
    department,
    phone,
    email,
    approverName,
  } = resolveEmployeeBaseProfile(req);

  const annualQuota = Number(savedQuotas?.vacation?.limit ?? 10);
  const accumulatedDays = Number(
    req.accumulatedVacation ?? (isCurrentUser ? savedUser?.accumulatedVacation : null) ?? empFromList?.accumulatedVacation ?? 0
  );
  const totalQuota = accumulatedDays + annualQuota;
  const thisLeaveDays = Number(req.days) || 1;

  // Determine previously used vacation days cleanly and consistently with dashboard/admin tables
  const isDefaultMainEmployee =
    req.employeeId === 'usr-101' || employeeName === 'นางสาวพนิกา ธรรมเมือง';

  let previouslyUsed = 0;
  if (req.previouslyUsed !== undefined && req.previouslyUsed !== null) {
    previouslyUsed = Number(req.previouslyUsed) || 0;
  } else if (isDefaultMainEmployee && savedQuotas?.vacation?.used !== undefined) {
    const usedTotal = Number(savedQuotas.vacation.used) || 0;
    previouslyUsed =
      req.status === 'อนุมัติ' ? Math.max(0, usedTotal - thisLeaveDays) : usedTotal;
  } else if (empFromList && empFromList.vacationRem !== undefined) {
    const baseUsed = Math.max(0, annualQuota - Number(empFromList.vacationRem));
    previouslyUsed = baseUsed;
  } else if (isCurrentUser && savedQuotas?.vacation?.used !== undefined) {
    const usedTotal = Number(savedQuotas.vacation.used) || 0;
    previouslyUsed =
      req.status === 'อนุมัติ' ? Math.max(0, usedTotal - thisLeaveDays) : usedTotal;
  }

  const totalUsedWithThis = previouslyUsed + thisLeaveDays;

  const substitute =
    req.substitute && req.substitute !== '-' && req.substitute !== 'ไม่มี'
      ? String(req.substitute).trim()
      : '';

  const cleanReason = req.reason ? String(req.reason).replace(/[\r\n]+/g, ' ').trim() : '';
  let contactLine = '';
  if (cleanReason && phone) {
    contactLine = `${cleanReason} (โทร. ${phone})`;
  } else if (cleanReason && email) {
    contactLine = `${cleanReason} (ติดต่อ: ${email})`;
  } else if (cleanReason) {
    contactLine = cleanReason;
  } else if (phone) {
    contactLine = `ติดต่อได้ที่เบอร์โทรศัพท์ ${phone}`;
  } else if (email) {
    contactLine = `ติดต่อได้ที่อีเมล ${email}`;
  } else {
    contactLine = 'ติดต่อได้ทางระบบ SmartLeave';
  }

  return {
    employeeName,
    title,
    department,
    phone,
    email,
    accumulatedDays,
    annualQuota,
    totalQuota,
    previouslyUsed,
    thisLeaveDays,
    totalUsedWithThis,
    substitute,
    approverName,
    contactLine,
  };
}

/**
 * Resolve existing employee profile, leave reason, previous leave of same type, and statistics
 * for "แบบใบลาป่วย ลาคลอดบุตร ลากิจส่วนตัว"
 */
function resolveSickPersonalMaternityData(req) {
  const category = getLeaveCategory(req);
  const {
    employeeName,
    title,
    department,
    phone,
    email,
    approverName,
  } = resolveEmployeeBaseProfile(req);

  const thisLeaveDays = Number(req.days) || 1;
  const reasonText = req.reason ? String(req.reason).replace(/[\r\n]+/g, ' ').trim() : '-';

  let contactLine = '';
  if (req.contactAddress && String(req.contactAddress).trim()) {
    contactLine = String(req.contactAddress).replace(/[\r\n]+/g, ' ').trim();
  } else if (email) {
    contactLine = `ติดต่อได้ทางระบบ SmartLeave หรืออีเมล ${email}`;
  } else {
    contactLine = `ติดต่อได้ทางระบบ SmartLeave (${department})`;
  }

  const phoneText = phone || '-';

  // Load saved requests from localStorage (or explicit req.allRequests) to find last leave & stats
  let allRequests = [];
  if (Array.isArray(req.allRequests)) {
    allRequests = req.allRequests;
  } else {
    try {
      const rawReqs = localStorage.getItem('smartleave_requests');
      if (rawReqs) {
        const parsed = JSON.parse(rawReqs);
        if (Array.isArray(parsed)) allRequests = parsed;
      }
    } catch (e) {}
  }

  const reqTime = parseComparableTimestamp(req);

  const priorApproved = allRequests
    .filter((r) => {
      if (!r || r.id === req.id || r.status !== 'อนุมัติ') return false;
      const sameEmp =
        (req.employeeId && r.employeeId && r.employeeId === req.employeeId) ||
        (employeeName && r.employeeName === employeeName);
      if (!sameEmp) return false;
      const rTime = parseComparableTimestamp(r);
      if (reqTime && rTime && rTime > reqTime) return false;
      return true;
    })
    .sort((a, b) => parseComparableTimestamp(b) - parseComparableTimestamp(a));

  // Previous leave of the SAME category (for "ข้าพเจ้าได้ลา ... ครั้งสุดท้ายตั้งแต่วันที่ ...")
  let prevLeave = null;
  if (req.lastLeave && (req.lastLeave.startDate || req.lastLeave.days !== undefined)) {
    prevLeave = req.lastLeave;
  } else {
    const sameCatPrior = priorApproved.filter((r) => getLeaveCategory(r) === category);
    if (sameCatPrior.length > 0) {
      prevLeave = sameCatPrior[0];
    }
  }

  // Build statistics rows for ป่วย / กิจส่วนตัว / คลอดบุตร
  const buildRowStats = (cat) => {
    const catPrior = priorApproved.filter((r) => getLeaveCategory(r) === cat);
    const prevCount = catPrior.length;
    const prevDays = catPrior.reduce((sum, r) => sum + (Number(r.days) || 0), 0);
    const isActive = cat === category;

    if (isActive) {
      return {
        isActive: true,
        prevCount: String(prevCount),
        prevDays: formatLeaveDays(prevDays),
        thisCount: '1',
        thisDays: formatLeaveDays(thisLeaveDays),
        totalCount: String(prevCount + 1),
        totalDays: formatLeaveDays(prevDays + thisLeaveDays),
      };
    }

    return {
      isActive: false,
      prevCount: String(prevCount),
      prevDays: formatLeaveDays(prevDays),
      thisCount: '-',
      thisDays: '-',
      totalCount: String(prevCount),
      totalDays: formatLeaveDays(prevDays),
    };
  };

  return {
    category,
    employeeName,
    title,
    department,
    phoneText,
    email,
    approverName,
    thisLeaveDays,
    reasonText,
    contactLine,
    prevLeave,
    stats: {
      sick: buildRowStats('sick'),
      personal: buildRowStats('personal'),
      maternity: buildRowStats('maternity'),
    },
  };
}

/**
 * Safely strip characters unsupported by Sarabun font (e.g. emojis / variation selectors)
 * to prevent encoding crashes or .notdef square boxes.
 */
function sanitizeTextForFont(font, text) {
  const normalized = String(text || '').replace(/[\r\n\t]+/g, ' ').trim();
  const fkFont = font?.embedder?.font;
  let safe = '';
  for (const ch of normalized) {
    const cp = ch.codePointAt(0);
    if (!cp || cp === 0xfe0e || cp === 0xfe0f || cp === 0x200d) continue;
    try {
      if (fkFont && typeof fkFont.glyphForCodePoint === 'function') {
        const glyph = fkFont.glyphForCodePoint(cp);
        if (!glyph || glyph.id === 0) continue;
      }
      font.widthOfTextAtSize(ch, 10);
      safe += ch;
    } catch (e) {
      // Skip unsupported glyph (e.g. emoji)
    }
  }
  return safe.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Segment Thai/mixed text cleanly into word tokens for line wrapping
 */
function segmentTokens(text) {
  if (!text) return [];
  let raw = [];
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    try {
      const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
      raw = Array.from(segmenter.segment(text), (s) => s.segment);
    } catch (e) {
      raw = text.split(/(\s+)/);
    }
  } else {
    raw = text.split(/(\s+)/);
  }

  // Glue opening bracket '(' / '"' to the following word so it never orphans at line-end
  const glued = [];
  for (let i = 0; i < raw.length; i++) {
    const tok = raw[i];
    if ((tok === '(' || tok === '“' || tok === '"') && i + 1 < raw.length) {
      glued.push(tok + raw[i + 1]);
      i++;
    } else {
      glued.push(tok);
    }
  }
  return glued;
}

/**
 * Wrap text into at most `maxWidths.length` lines using measured font width
 */
function wrapTextForLines(font, rawText, size, maxWidths) {
  const safe = sanitizeTextForFont(font, rawText);
  if (!safe) return maxWidths.map(() => '');

  const tokens = segmentTokens(safe);
  const lines = [];
  let current = '';
  let lineIdx = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const maxW = maxWidths[lineIdx];
    const candidate = current ? current + token : token.trimStart();

    if (lineIdx < maxWidths.length - 1) {
      if (font.widthOfTextAtSize(candidate, size) <= maxW || !current) {
        current = candidate;
      } else {
        lines.push(current.trimEnd());
        lineIdx++;
        current = token.trimStart();
      }
    } else {
      // Last allowed line: append remaining tokens
      current += current ? token : token.trimStart();
    }
  }

  if (current) {
    lines.push(current.trim());
  }

  while (lines.length < maxWidths.length) {
    lines.push('');
  }
  return lines;
}

async function fetchFirstOk(urls) {
  let lastErr = null;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.arrayBuffer();
      }
      lastErr = new Error(`HTTP ${res.status} for ${url}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Failed to load PDF template asset');
}

async function loadFontBytes() {
  if (cachedFonts) {
    return cachedFonts;
  }

  const [fontRegBuf, fontBoldBuf] = await Promise.all([
    fetchFirstOk(['/fonts/Sarabun-Regular.ttf']),
    fetchFirstOk(['/fonts/Sarabun-Bold.ttf']),
  ]);

  cachedFonts = {
    fontRegBytes: new Uint8Array(fontRegBuf),
    fontBoldBytes: new Uint8Array(fontBoldBuf),
  };
  return cachedFonts;
}

async function loadTemplateBytes(key, urls) {
  if (cachedTemplateBytes[key]) {
    return cachedTemplateBytes[key];
  }
  const templateBuf = await fetchFirstOk(urls);
  cachedTemplateBytes[key] = new Uint8Array(templateBuf);
  return cachedTemplateBytes[key];
}

async function loadVacationAssets() {
  const [{ fontRegBytes, fontBoldBytes }, templateBytes] = await Promise.all([
    loadFontBytes(),
    loadTemplateBytes('vacation', ['/vacation-leave-template.pdf', encodeURI('/ใบลาพักผ่อน.pdf')]),
  ]);
  return { templateBytes, fontRegBytes, fontBoldBytes };
}

async function loadSickPersonalMaternityAssets() {
  const [{ fontRegBytes, fontBoldBytes }, templateBytes] = await Promise.all([
    loadFontBytes(),
    loadTemplateBytes('sickPersonalMaternity', [
      '/sick-personal-maternity-template.pdf',
      encodeURI('/ใบลาป่วย กิจ คลอดบุตร.pdf'),
    ]),
  ]);
  return { templateBytes, fontRegBytes, fontBoldBytes };
}

/**
 * Fill the official "ใบลาพักผ่อน.pdf" template directly using pdf-lib & Sarabun Thai font
 */
export async function generateVacationPdfBytes(req) {
  const { templateBytes, fontRegBytes, fontBoldBytes } = await loadVacationAssets();

  const templateDoc = await PDFDocument.load(templateBytes);
  const { width, height } = templateDoc.getPages()[0].getSize();

  // Embed template page into fresh document to isolate its resource tree
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const [embeddedPage] = await pdfDoc.embedPdf(templateBytes, [0]);
  const page = pdfDoc.addPage([width, height]);
  page.drawPage(embeddedPage, { x: 0, y: 0, width, height });

  const font = await pdfDoc.embedFont(fontRegBytes, { subset: false });
  const fontBold = await pdfDoc.embedFont(fontBoldBytes, { subset: false });

  const inkColor = rgb(0.04, 0.08, 0.2);

  const drawFittedCentered = (text, centerX, y, baseSize = 11, maxWidth = 300, useBold = false) => {
    const f = useBold ? fontBold : font;
    const str = sanitizeTextForFont(f, text);
    if (!str) return;
    let size = baseSize;
    let w = f.widthOfTextAtSize(str, size);
    while (w > maxWidth && size > 6.5) {
      size -= 0.4;
      w = f.widthOfTextAtSize(str, size);
    }
    page.drawText(str, {
      x: Math.round((centerX - w / 2) * 10) / 10,
      y,
      size,
      font: f,
      color: inkColor,
    });
  };

  const drawFittedLeft = (text, x, y, baseSize = 10.5, maxWidth = 300, useBold = false) => {
    const f = useBold ? fontBold : font;
    const str = sanitizeTextForFont(f, text);
    if (!str) return;
    let size = baseSize;
    let w = f.widthOfTextAtSize(str, size);
    while (w > maxWidth && size > 6.5) {
      size -= 0.4;
      w = f.widthOfTextAtSize(str, size);
    }
    page.drawText(str, { x, y, size, font: f, color: inkColor });
  };

  const now = new Date();
  const appliedParts = parseDateParts(req.appliedDate, now);
  const startParts = parseDateParts(req.startDate, now);
  const endParts = parseDateParts(req.endDate, req.startDate ? new Date(req.startDate) : now);

  const data = resolveVacationEmployeeData(req);

  // 1. Top-right date (เขียนที่ สำนักงานสหกรณ์จังหวัดขอนแก่น วันที่ ... เดือน ... พ.ศ. ...)
  drawFittedCentered(String(appliedParts.day), 374, 767.5, 11, 34);
  drawFittedCentered(String(appliedParts.month), 444, 767.5, 11, 82);
  drawFittedCentered(String(appliedParts.year), 524, 767.5, 11, 48);

  // 2. Main Body Paragraph Line 1 (ข้าพเจ้า ... ตำแหน่ง ...)
  drawFittedCentered(data.employeeName, 258, 687.5, 11, 195, true);
  drawFittedCentered(data.title, 466, 687.5, 11, 148);

  // 3. Line 2 (สังกัด กลุ่ม/ฝ่าย ...)
  drawFittedCentered(data.department, 243, 666.5, 10.5, 190);

  // 4. Line 3 (มีวันลาพักผ่อนสะสม ... ประจำปีนี้อีก ... รวมเป็น ...)
  drawFittedCentered(String(data.accumulatedDays), 108, 645.5, 11, 36, true);
  drawFittedCentered(String(data.annualQuota), 313, 645.5, 11, 42, true);
  drawFittedCentered(String(data.totalQuota), 432, 645.5, 11, 42, true);

  // 5. Line 4 (ตั้งแต่วันที่ ... เดือน ... พ.ศ. ... ถึงวันที่ ... เดือน ... พ.ศ. ...)
  drawFittedCentered(String(startParts.day), 128, 624.5, 11, 30, true);
  drawFittedCentered(String(startParts.month), 205, 624.5, 11, 82, true);
  drawFittedCentered(String(startParts.year), 283, 624.5, 10.5, 42, true);

  drawFittedCentered(String(endParts.day), 352, 624.5, 11, 30, true);
  drawFittedCentered(String(endParts.month), 440, 624.5, 11, 86, true);
  drawFittedCentered(String(endParts.year), 532, 624.5, 10.5, 42, true);

  // 6. Line 5 & 6 (มีกำหนด ... วัน ในระหว่างการลาในครั้งนี้จะติดต่อกับข้าพเจ้าได้ที่ ...)
  drawFittedCentered(String(data.thisLeaveDays), 124, 603.5, 11, 38, true);
  const [contactL1, contactL2] = wrapTextForLines(font, data.contactLine, 10.5, [168, 468]);
  if (contactL1) drawFittedLeft(contactL1, 376, 603.5, 10.5, 168);
  if (contactL2) drawFittedLeft(contactL2, 74, 583.5, 10.5, 468);

  // 7. Applicant Signoff (ขอแสดงความนับถือ) - leave (ลงชื่อ) dotted line blank for hand-signing; only print full name inside ( ... )
  drawFittedCentered(data.employeeName, 389, 479.5, 10.5, 130);
  drawFittedCentered(data.title, 395, 458.5, 10.5, 128);

  // 8. Leave Statistics Table (สถิติการลาในปีงบประมาณนี้)
  drawFittedCentered(String(data.previouslyUsed), 94, 353, 12, 50, true);
  drawFittedCentered(String(data.thisLeaveDays), 152, 353, 12, 50, true);
  drawFittedCentered(String(data.totalUsedWithThis), 211, 353, 12, 50, true);

  // 9. Handover / Substitute (ในระหว่างที่ข้าพเจ้าลาพักผ่อนมอบหมายให้ ...) - leave upper (ลงชื่อ) dotted lines blank for hand-signing
  if (data.substitute) {
    drawFittedCentered(data.substitute, 130, 135, 11, 124, true);
  }
  drawFittedCentered(data.employeeName, 151, 85, 9.5, 126);
  if (data.substitute) {
    drawFittedCentered(data.substitute, 151, 24, 10, 126);
  }

  // 10. Supervisor Opinion & Official Command are intentionally left blank on exported PDF forms
  // so supervisors/commanders can write opinions, check อนุญาต/ไม่อนุญาต, and sign manually.
  // System approval status (req.status) remains unchanged inside the SmartLeave web application.

  await fixZeroWidthGlyphs(pdfDoc, font);
  await fixZeroWidthGlyphs(pdfDoc, fontBold);

  return await pdfDoc.save();
}

/**
 * Fill the official "ใบลาป่วย กิจ คลอดบุตร.pdf" template directly using pdf-lib & Sarabun Thai font
 */
export async function generateSickPersonalMaternityPdfBytes(req) {
  const { templateBytes, fontRegBytes, fontBoldBytes } = await loadSickPersonalMaternityAssets();

  const templateDoc = await PDFDocument.load(templateBytes);
  const { width, height } = templateDoc.getPages()[0].getSize();

  // Embed template page into fresh document to isolate its resource tree
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const [embeddedPage] = await pdfDoc.embedPdf(templateBytes, [0]);
  const page = pdfDoc.addPage([width, height]);
  page.drawPage(embeddedPage, { x: 0, y: 0, width, height });

  const font = await pdfDoc.embedFont(fontRegBytes, { subset: false });
  const fontBold = await pdfDoc.embedFont(fontBoldBytes, { subset: false });

  const inkColor = rgb(0.04, 0.08, 0.2);

  const drawFittedCentered = (text, centerX, y, baseSize = 10.5, maxWidth = 300, useBold = false) => {
    const f = useBold ? fontBold : font;
    const str = sanitizeTextForFont(f, text);
    if (!str) return;
    let size = baseSize;
    let w = f.widthOfTextAtSize(str, size);
    while (w > maxWidth && size > 6.5) {
      size -= 0.4;
      w = f.widthOfTextAtSize(str, size);
    }
    page.drawText(str, {
      x: Math.round((centerX - w / 2) * 10) / 10,
      y,
      size,
      font: f,
      color: inkColor,
    });
  };

  const drawFittedLeft = (text, x, y, baseSize = 10.5, maxWidth = 300, useBold = false) => {
    const f = useBold ? fontBold : font;
    const str = sanitizeTextForFont(f, text);
    if (!str) return;
    let size = baseSize;
    let w = f.widthOfTextAtSize(str, size);
    while (w > maxWidth && size > 6.5) {
      size -= 0.4;
      w = f.widthOfTextAtSize(str, size);
    }
    page.drawText(str, { x, y, size, font: f, color: inkColor });
  };

  const drawCircleCheck = (cx, cy, color = inkColor) => {
    page.drawLine({
      start: { x: cx - 3.2, y: cy + 0.2 },
      end: { x: cx - 0.6, y: cy - 2.6 },
      thickness: 1.65,
      color,
    });
    page.drawLine({
      start: { x: cx - 0.6, y: cy - 2.6 },
      end: { x: cx + 4.2, y: cy + 3.6 },
      thickness: 1.65,
      color,
    });
  };

  const now = new Date();
  const appliedParts = parseDateParts(req.appliedDate, now);
  const startParts = parseDateParts(req.startDate, now);
  const endParts = parseDateParts(req.endDate, req.startDate ? new Date(req.startDate) : now);

  const startShort = `${startParts.day} ${startParts.shortMonth} ${startParts.year}`;
  const endShort = `${endParts.day} ${endParts.shortMonth} ${endParts.year}`;

  const data = resolveSickPersonalMaternityData(req);
  const thisDaysText = formatLeaveDays(data.thisLeaveDays);

  // 1. Top-right date (เขียนที่ สำนักงานสหกรณ์จังหวัดขอนแก่น วันที่ ... เดือน ... พ.ศ. ...)
  drawFittedCentered(String(appliedParts.day), 363, 742.5, 10.5, 20);
  drawFittedCentered(String(appliedParts.month), 442, 742.5, 10.5, 72);
  drawFittedCentered(String(appliedParts.year), 523, 742.5, 10.5, 38);

  // 2. Subject checkmark (เรื่อง ขออนุญาตลา ○ ป่วย ○ กิจส่วนตัว ○ คลอดบุตร)
  if (data.category === 'sick') drawCircleCheck(186.5, 714);
  else if (data.category === 'personal') drawCircleCheck(246.5, 714);
  else if (data.category === 'maternity') drawCircleCheck(319.5, 714);

  // 3. Applicant Identity (ข้าพเจ้า ... ตำแหน่ง ... / สังกัด ...)
  drawFittedCentered(data.employeeName, 270, 672, 10.5, 165, true);
  drawFittedCentered(data.title, 466, 672, 10.5, 136);
  drawFittedLeft(data.department, 118, 653, 10.5, 412);

  // 4. Body Leave Type Stacked Circles (ขอลา ○ ป่วย / ○ กิจส่วนตัว / ○ คลอดบุตร) & Reason (เนื่องจาก ...)
  if (data.category === 'sick') drawCircleCheck(136.5, 634.5);
  else if (data.category === 'personal') drawCircleCheck(136.5, 615.5);
  else if (data.category === 'maternity') drawCircleCheck(136.5, 596.5);

  drawFittedLeft(data.reasonText, 274, 615.5, 10.5, 258);

  // 5. Leave Dates & Duration (ตั้งแต่วันที่ ... ถึงวันที่ ... มีกำหนด ... วัน ( ... วันทำการ))
  drawFittedCentered(startShort, 180, 576, 10.5, 100, true);
  drawFittedCentered(endShort, 319, 576, 10.5, 86, true);
  drawFittedCentered(thisDaysText, 423, 576, 10.5, 32, true);
  drawFittedCentered(thisDaysText, 472, 576, 10.5, 22, true);

  // 6. Last Leave of Same Category (ข้าพเจ้าได้ลา ○ ป่วย ○ กิจส่วนตัว ○ คลอดบุตร ครั้งสุดท้าย...)
  if (data.prevLeave) {
    if (data.category === 'sick') drawCircleCheck(145, 559);
    else if (data.category === 'personal') drawCircleCheck(206, 559);
    else if (data.category === 'maternity') drawCircleCheck(278.5, 559);

    const prevStartParts = parseDateParts(data.prevLeave.startDate || data.prevLeave.appliedDate, now);
    const prevEndParts = parseDateParts(data.prevLeave.endDate || data.prevLeave.startDate, now);
    const prevStartShort = `${prevStartParts.day} ${prevStartParts.shortMonth} ${prevStartParts.year}`;
    const prevEndShort = `${prevEndParts.day} ${prevEndParts.shortMonth} ${prevEndParts.year}`;
    const prevDaysText = formatLeaveDays(data.prevLeave.days || 1);

    drawFittedCentered(prevStartShort, 488, 557, 9.5, 92);
    drawFittedCentered(prevEndShort, 173, 539, 10, 114);
    drawFittedCentered(prevDaysText, 299.5, 539, 10, 46);
    drawFittedCentered(prevDaysText, 364, 539, 10, 26);
  }

  // 7. Contact Info & Phone Number
  const [contactL1, contactL2] = wrapTextForLines(font, data.contactLine, 10, [296, 444]);
  if (contactL1) drawFittedLeft(contactL1, 234, 521, 10, 296);
  if (contactL2) drawFittedLeft(contactL2, 84, 502, 10, 444);
  drawFittedLeft(data.phoneText, 166, 483, 10.5, 365);

  // 8. Applicant Signoff (ขอแสดงความนับถือ) - leave (ลงชื่อ) dotted line blank for hand-signing; only print full name inside ( ... )
  drawFittedCentered(data.employeeName, 413, 382, 10, 150);
  drawFittedCentered(String(appliedParts.day), 337, 362.5, 10, 22);
  drawFittedCentered(String(appliedParts.month), 405.5, 362.5, 10, 60);
  drawFittedCentered(String(appliedParts.year), 476, 362.5, 10, 32);

  // 9. Leave Statistics Table (สถิติการลา ปีงบประมาณ ...)
  const fiscalYearText = String(req.fiscalYear || appliedParts.year);
  drawFittedCentered(fiscalYearText, 235, 251, 10, 90, true);

  const statRows = [
    { key: 'sick', y: 210 },
    { key: 'personal', y: 195 },
    { key: 'maternity', y: 180 },
  ];
  const statCols = [148, 172.5, 197, 221, 245, 269];

  statRows.forEach(({ key, y }) => {
    const row = data.stats[key];
    if (!row) return;
    drawFittedCentered(row.prevCount, statCols[0], y, 10, 22, false);
    drawFittedCentered(row.prevDays, statCols[1], y, 10, 22, false);
    drawFittedCentered(row.thisCount, statCols[2], y, 10, 22, row.isActive);
    drawFittedCentered(row.thisDays, statCols[3], y, 10, 22, row.isActive);
    drawFittedCentered(row.totalCount, statCols[4], y, 10, 22, row.isActive);
    drawFittedCentered(row.totalDays, statCols[5], y, 10, 22, row.isActive);
  });

  // 10. Supervisor Opinion & Official Command are intentionally left blank on exported PDF forms
  // so supervisors/commanders can write opinions, check อนุญาต/ไม่อนุญาต, and sign manually.
  // System approval status (req.status) remains unchanged inside the SmartLeave web application.

  await fixZeroWidthGlyphs(pdfDoc, font);
  await fixZeroWidthGlyphs(pdfDoc, fontBold);

  return await pdfDoc.save();
}

/**
 * 1. Official Thai Government Form for Vacation Leave (HTML fallback for print preview if needed)
 * Incorporates the official Emblem logo of Khonkaen Provincial Cooperative Office!
 */
export function generateGovernmentVacationLeaveHTML(req) {
  const now = new Date();
  const appliedParts = parseDateParts(req.appliedDate, now);
  const startParts = parseDateParts(req.startDate, now);
  const endParts = parseDateParts(req.endDate, req.startDate ? new Date(req.startDate) : now);

  const data = resolveVacationEmployeeData(req);

  return `
    <div style="font-family: 'Sarabun', 'Prompt', 'TH Sarabun New', sans-serif; color: #000000; padding: 30px 48px 24px 48px; background: #ffffff; width: 794px; min-height: 1120px; box-sizing: border-box; line-height: 1.62; font-size: 13.5pt;">
      <!-- Official Emblem of Khonkaen Provincial Cooperative Office -->
      <div style="text-align: center; margin-bottom: 6px;">
        <img
          src="/logo.png"
          alt="ตราสำนักงานสหกรณ์จังหวัดขอนแก่น"
          style="width: 65px; height: 65px; object-fit: contain; margin: 0 auto; display: block;"
        />
      </div>

      <!-- Title -->
      <div style="text-align: center; font-weight: bold; font-size: 16.5pt; margin-bottom: 12px; letter-spacing: 0.5px;">
        แบบใบลาพักผ่อน
      </div>

      <!-- Top Right Location & Date -->
      <div style="text-align: right; margin-bottom: 12px; line-height: 1.8; font-size: 13pt;">
        <div>
          เขียนที่ <span style="display: inline-block; min-width: 250px; text-align: center; border-bottom: 1px dotted #000; font-weight: 500;">สำนักงานสหกรณ์จังหวัดขอนแก่น</span>
        </div>
        <div style="margin-top: 2px;">
          วันที่ <span style="display: inline-block; min-width: 38px; text-align: center; border-bottom: 1px dotted #000; font-weight: 500;">${appliedParts.day}</span>
          เดือน <span style="display: inline-block; min-width: 105px; text-align: center; border-bottom: 1px dotted #000; font-weight: 500;">${appliedParts.month}</span>
          พ.ศ. <span style="display: inline-block; min-width: 60px; text-align: center; border-bottom: 1px dotted #000; font-weight: 500;">${appliedParts.year}</span>
        </div>
      </div>

      <!-- Subject & Addressee -->
      <div style="margin-bottom: 10px; line-height: 1.7; font-size: 13pt;">
        <div>เรื่อง&nbsp;&nbsp;&nbsp;&nbsp;ขอลาพักผ่อน</div>
        <div>เรียน&nbsp;&nbsp;&nbsp;&nbsp;สหกรณ์จังหวัดขอนแก่น</div>
      </div>

      <!-- Body Paragraph (Government Indented Format) -->
      <div style="text-indent: 48px; text-align: justify; line-height: 1.95; margin-bottom: 16px; font-size: 13pt;">
        ข้าพเจ้า <span style="display: inline-block; min-width: 230px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${data.employeeName}</span>
        ตำแหน่ง <span style="display: inline-block; min-width: 200px; text-align: center; border-bottom: 1px dotted #000; font-weight: 500;">${data.title}</span>
        สังกัด กลุ่ม/ฝ่าย <span style="display: inline-block; min-width: 230px; text-align: center; border-bottom: 1px dotted #000; font-weight: 500;">${data.department}</span>
        สำนักงานสหกรณ์จังหวัดขอนแก่น มีวันลาพักผ่อนสะสม <span style="display: inline-block; min-width: 40px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${data.accumulatedDays}</span> วันทำการ
        มีสิทธิลาพักผ่อนประจำปีนี้อีก <span style="display: inline-block; min-width: 40px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${data.annualQuota}</span> วันทำการ
        รวมเป็น <span style="display: inline-block; min-width: 40px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${data.totalQuota}</span> วันทำการ
        ขอลาพักผ่อนตั้งแต่วันที่ <span style="display: inline-block; min-width: 38px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${startParts.day}</span>
        เดือน <span style="display: inline-block; min-width: 100px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${startParts.month}</span>
        พ.ศ. <span style="display: inline-block; min-width: 58px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${startParts.year}</span>
        ถึงวันที่ <span style="display: inline-block; min-width: 38px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${endParts.day}</span>
        เดือน <span style="display: inline-block; min-width: 100px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${endParts.month}</span>
        พ.ศ. <span style="display: inline-block; min-width: 58px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${endParts.year}</span>
        มีกำหนด <span style="display: inline-block; min-width: 38px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${data.thisLeaveDays}</span> วัน
        ในระหว่างการลาในครั้งนี้จะติดต่อกับข้าพเจ้าได้ที่ <span style="display: inline-block; min-width: 310px; border-bottom: 1px dotted #000; font-weight: 500;">${data.contactLine}</span>
      </div>

      <!-- Applicant Signoff (Right-aligned Block) -->
      <div style="margin-left: 54%; text-align: center; line-height: 1.7; margin-bottom: 16px; font-size: 13pt;">
        <div>ขอแสดงความนับถือ</div>
        <div style="margin-top: 12px;">
          (ลงชื่อ) <span style="display: inline-block; min-width: 170px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span>
        </div>
        <div style="margin-top: 2px;">
          ( <span style="display: inline-block; min-width: 170px; text-align: center; font-weight: bold;">${data.employeeName}</span> )
        </div>
        <div style="margin-top: 2px;">
          ตำแหน่ง <span style="display: inline-block; min-width: 155px; text-align: center; border-bottom: 1px dotted #000;">${data.title}</span>
        </div>
      </div>

      <!-- Bottom 2-Column Section Matching Attached PDF Exactly -->
      <div style="display: flex; justify-content: space-between; gap: 20px; font-size: 11.5pt; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 10px;">
        <!-- Left Column (49%) -->
        <div style="width: 49%;">
          <!-- Leave Statistics Table -->
          <div style="margin-bottom: 12px;">
            <div style="border: 1px solid #000; border-bottom: none; text-align: center; font-weight: bold; padding: 3px; font-size: 11pt;">
              สถิติการลาในปีงบประมาณนี้
            </div>
            <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 10.5pt;">
              <thead>
                <tr>
                  <th style="border: 1px solid #000; padding: 4px; width: 33.3%;">ลามาแล้ว<br>(วันทำการ)</th>
                  <th style="border: 1px solid #000; padding: 4px; width: 33.3%;">ลาครั้งนี้<br>(วันทำการ)</th>
                  <th style="border: 1px solid #000; padding: 4px; width: 33.3%;">รวมเป็น<br>(วันทำการ)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #000; padding: 5px; font-weight: bold; font-size: 12pt;">${data.previouslyUsed}</td>
                  <td style="border: 1px solid #000; padding: 5px; font-weight: bold; font-size: 12pt;">${data.thisLeaveDays}</td>
                  <td style="border: 1px solid #000; padding: 5px; font-weight: bold; font-size: 12pt;">${data.totalUsedWithThis}</td>
                </tr>
              </tbody>
            </table>

            <!-- Checker Signature Block -->
            <div style="margin-top: 8px; line-height: 1.65; font-size: 11pt;">
              <div>ลงชื่อ <span style="display: inline-block; min-width: 150px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span> ผู้ตรวจสอบ</div>
              <div style="margin-top: 2px;">( <span style="display: inline-block; min-width: 150px; text-align: center;">&nbsp;</span> )</div>
              <div style="margin-top: 2px;">ตำแหน่ง <span style="display: inline-block; min-width: 150px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span></div>
              <div style="margin-top: 2px;">วันที่ <span style="display: inline-block; min-width: 32px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span> เดือน <span style="display: inline-block; min-width: 75px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span> พ.ศ. <span style="display: inline-block; min-width: 45px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span></div>
            </div>
          </div>

          <!-- Substitute Handover Block -->
          <div style="margin-top: 14px; line-height: 1.65; font-size: 11pt;">
            <div>ในระหว่างที่ข้าพเจ้าลาพักผ่อนมอบหมายให้</div>
            <div style="margin-top: 2px;">
              <span style="display: inline-block; min-width: 200px; border-bottom: 1px dotted #000; font-weight: bold; text-align: center;">${data.substitute || '-'}</span> ปฏิบัติหน้าที่แทน
            </div>
            <div style="margin-top: 6px;">
              (ลงชื่อ) <span style="display: inline-block; min-width: 155px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span> ผู้มอบ
            </div>
            <div style="margin-top: 2px;">
              ( <span style="display: inline-block; min-width: 155px; text-align: center;">${data.employeeName}</span> )
            </div>
            <div style="margin-top: 6px;">
              (ลงชื่อ) <span style="display: inline-block; min-width: 155px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span> ผู้ปฏิบัติหน้าที่แทน
            </div>
            <div style="margin-top: 2px;">
              ( <span style="display: inline-block; min-width: 155px; text-align: center;">${data.substitute || '&nbsp;'}</span> )
            </div>
          </div>
        </div>

        <!-- Right Column (49%) -->
        <div style="width: 49%; line-height: 1.65; font-size: 11pt;">
          <!-- Supervisor Opinion (intentionally left blank for manual completion) -->
          <div>
            <div style="font-weight: bold;">ความเห็นของผู้บังคับบัญชา</div>
            <div style="border-bottom: 1px dotted #000; min-height: 20px; padding-top: 2px; font-weight: 500;">&nbsp;</div>
            <div style="border-bottom: 1px dotted #000; min-height: 20px;">&nbsp;</div>
            <div style="margin-top: 6px;">
              ลงชื่อ <span style="display: inline-block; min-width: 155px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span>
            </div>
            <div style="margin-top: 2px;">
              ( <span style="display: inline-block; min-width: 155px; text-align: center;">&nbsp;</span> )
            </div>
            <div style="margin-top: 2px;">
              ตำแหน่ง <span style="display: inline-block; min-width: 150px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span>
            </div>
            <div style="margin-top: 2px;">
              วันที่ <span style="display: inline-block; min-width: 32px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span> เดือน <span style="display: inline-block; min-width: 75px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span> พ.ศ. <span style="display: inline-block; min-width: 45px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span>
            </div>
          </div>

          <!-- Official Command / Order (intentionally left blank for manual completion) -->
          <div style="margin-top: 14px;">
            <div style="font-weight: bold;">คำสั่ง</div>
            <div style="margin-top: 3px; display: flex; gap: 20px; font-size: 11.5pt;">
              <span><span style="font-size: 13pt;">○</span> อนุญาต</span>
              <span><span style="font-size: 13pt;">○</span> ไม่อนุญาต</span>
            </div>
            <div style="border-bottom: 1px dotted #000; min-height: 20px; padding-top: 2px; font-size: 10.5pt;">&nbsp;</div>
            <div style="border-bottom: 1px dotted #000; min-height: 20px;">&nbsp;</div>
            <div style="margin-top: 6px;">
              ลงชื่อ <span style="display: inline-block; min-width: 155px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span>
            </div>
            <div style="margin-top: 2px;">
              ( <span style="display: inline-block; min-width: 155px; text-align: center;">&nbsp;</span> )
            </div>
            <div style="margin-top: 2px;">
              ตำแหน่ง <span style="display: inline-block; min-width: 150px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span>
            </div>
            <div style="margin-top: 2px;">
              วันที่ <span style="display: inline-block; min-width: 32px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span> เดือน <span style="display: inline-block; min-width: 75px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span> พ.ศ. <span style="display: inline-block; min-width: 45px; border-bottom: 1px dotted #000; text-align: center;">&nbsp;</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Watermark Footer -->
      <div style="margin-top: 16px; padding-top: 6px; border-top: 1px dashed #cbd5e1; font-size: 9pt; color: #94a3b8; display: flex; justify-content: space-between;">
        <span>แบบใบลาพักผ่อน • สำนักงานสหกรณ์จังหวัดขอนแก่น (ระบบ SmartLeave)</span>
        <span>เลขที่อ้างอิง: ${req.id} • วันที่พิมพ์ ${appliedParts.day} ${appliedParts.month} ${appliedParts.year}</span>
      </div>
    </div>
  `;
}

/**
 * 2. Standard Thai Electronic Leave Slip for other leave types (Sick, Personal, Maternity)
 * With official emblem logo of Khonkaen Provincial Cooperative Office!
 */
export function generateStandardElectronicLeaveSlipHTML(req) {
  const now = new Date();
  const printParts = parseDateParts(null, now);
  const printTime = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const empData = resolveVacationEmployeeData(req);

  const appliedParts = parseDateParts(req.appliedDate, now);
  const appliedFormatted = `${appliedParts.day} ${appliedParts.shortMonth} ${appliedParts.year}`;
  const approvedFormatted = req.approvedDate
    ? (() => {
        const p = parseDateParts(req.approvedDate, now);
        return `${p.day} ${p.shortMonth} ${p.year}`;
      })()
    : req.status === 'อนุมัติ'
    ? appliedFormatted
    : 'รอพิจารณา';

  const statusColors = {
    'อนุมัติ': { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
    'รออนุมัติ': { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
    'ไม่อนุมัติ': { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
    'ยกเลิก': { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
  };
  const sc = statusColors[req.status] || statusColors['อนุมัติ'];

  return `
    <div style="font-family: 'Prompt', 'Sarabun', 'Segoe UI', Tahoma, sans-serif; color: #1e293b; padding: 28px 32px; background: #ffffff; width: 100%; box-sizing: border-box; line-height: 1.4;">
      <!-- Header Banner with Official Emblem -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #15803d; padding-bottom: 16px; margin-bottom: 22px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <img
            src="/logo.png"
            alt="สำนักงานสหกรณ์จังหวัดขอนแก่น"
            style="width: 52px; height: 52px; object-fit: contain; border-radius: 50%;"
          />
          <div>
            <div style="font-size: 20px; font-weight: 800; color: #113C22; margin: 0; line-height: 1.2;">SmartLeave</div>
            <div style="font-size: 11px; color: #15803d; font-weight: 600; letter-spacing: 0.3px;">สำนักงานสหกรณ์จังหวัดขอนแก่น (Khonkaen Provincial Cooperative Office)</div>
            <div style="font-size: 12.5px; font-weight: bold; color: #334155; margin-top: 3px;">แบบฟอร์มคำขออนุมัติการลา (Electronic Leave Slip)</div>
          </div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #64748b; line-height: 1.6;">
          <div>เลขที่เอกสาร: <strong style="color: #0f172a; font-size: 13px;">${req.id}</strong></div>
          <div>วันที่พิมพ์: <strong>${printParts.day} ${printParts.month} ${printParts.year}</strong></div>
          <div>เวลาที่พิมพ์: <strong>${printTime} น.</strong></div>
        </div>
      </div>

      <!-- Status Bar -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 12px; color: #64748b;">
          สถานะคำขอ:
          <span style="display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: ${sc.bg}; color: ${sc.text}; border: 1px solid ${sc.border}; margin-left: 6px;">
            ● ${req.status}
          </span>
        </div>
        <div style="font-size: 12px; color: #64748b;">
          วันที่ยื่นคำขอ: <strong style="color: #1e293b;">${appliedFormatted}</strong>
        </div>
      </div>

      <!-- Section 1: Employee Information -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: 700; color: #14532d; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 12px; letter-spacing: 0.3px;">
          ๑. ข้อมูลผู้ยื่นคำขอลา (Applicant Information)
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="width: 20%; padding: 6px 0; color: #64748b;">ชื่อ - นามสกุล:</td>
            <td style="width: 30%; padding: 6px 0; font-weight: bold; color: #0f172a;">${empData.employeeName || '-'}</td>
            <td style="width: 20%; padding: 6px 0; color: #64748b;">ตำแหน่ง:</td>
            <td style="width: 30%; padding: 6px 0; font-weight: 600; color: #0f172a;">${empData.title || 'พนักงาน'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">สังกัดกลุ่ม/ฝ่าย:</td>
            <td colspan="3" style="padding: 6px 0; font-weight: 600; color: #0f172a;">${empData.department || 'สำนักงานสหกรณ์จังหวัดขอนแก่น'}</td>
          </tr>
        </table>
      </div>

      <!-- Section 2: Leave Request Details -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: 700; color: #14532d; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 12px; letter-spacing: 0.3px;">
          ๒. รายละเอียดการขอลา (Leave Details)
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="width: 18%; padding: 6px 0; color: #64748b;">ประเภทการลา:</td>
            <td style="width: 32%; padding: 6px 0; font-weight: bold; color: #15803d; font-size: 13px;">${req.type}</td>
            <td style="width: 18%; padding: 6px 0; color: #64748b;">จำนวนวันลา:</td>
            <td style="width: 32%; padding: 6px 0; font-weight: bold; color: #0f172a;">${req.days} วัน</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">ช่วงวันที่ลา:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${req.dateRange}</td>
            <td style="padding: 6px 0; color: #64748b;">ผู้ปฏิบัติงานแทน:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${req.substitute || 'ไม่มี'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">ผู้อนุมัติ:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${req.approver || 'นายสมชาย มั่นคง'}</td>
            <td style="padding: 6px 0; color: #64748b;">วันที่อนุมัติ:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${approvedFormatted}</td>
          </tr>
        </table>

        <!-- Reason -->
        <div style="margin-top: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
          <div style="font-size: 11px; color: #64748b; margin-bottom: 4px; font-weight: 600;">เหตุผลความจำเป็นในการลา:</div>
          <div style="font-size: 12px; color: #1e293b; line-height: 1.5;">${req.reason || 'ไม่ได้ระบุเหตุผล'}</div>
        </div>

        ${req.note ? `
        <div style="margin-top: 8px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 8px 14px;">
          <div style="font-size: 11px; color: #065f46; margin-bottom: 2px; font-weight: 600;">ความเห็นของผู้อนุมัติ / หมายเหตุ:</div>
          <div style="font-size: 12px; color: #047857;">${req.note}</div>
        </div>
        ` : ''}
      </div>

      <!-- Section 3: Signatures -->
      <div style="margin-top: 36px; padding-top: 14px; border-top: 1.5px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 11px;">
          <tr>
            <td style="width: 33.33%; padding: 0 10px; vertical-align: top;">
              <div style="height: 38px; border-bottom: 1px dotted #94a3b8; margin-bottom: 8px;"></div>
              <div style="font-weight: 600; color: #0f172a;">( ${req.employeeName || 'ผู้ยื่นคำขอ'} )</div>
              <div style="color: #64748b; margin-top: 2px;">ผู้ยื่นคำขอลา</div>
              <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">วันที่ ${appliedFormatted}</div>
            </td>
            <td style="width: 33.33%; padding: 0 10px; vertical-align: top;">
              <div style="height: 38px; border-bottom: 1px dotted #94a3b8; margin-bottom: 8px;"></div>
              <div style="font-weight: 600; color: #0f172a;">( ${req.substitute || '...........................................'} )</div>
              <div style="color: #64748b; margin-top: 2px;">ผู้ปฏิบัติงานแทน</div>
              <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">วันที่ ...../...../..........</div>
            </td>
            <td style="width: 33.33%; padding: 0 10px; vertical-align: top;">
              <div style="height: 38px; border-bottom: 1px dotted #94a3b8; margin-bottom: 8px; display: flex; align-items: flex-end; justify-content: center;">
                ${req.status === 'อนุมัติ' ? '<span style="color: #15803d; font-weight: bold; font-size: 11px;">✓ อนุมัติผ่านระบบอิเล็กทรอนิกส์</span>' : ''}
              </div>
              <div style="font-weight: 600; color: #0f172a;">( ${req.approver || 'นายสมชาย มั่นคง'} )</div>
              <div style="color: #64748b; margin-top: 2px;">ผู้อนุมัติ / ผู้บังคับบัญชา</div>
              <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">วันที่ ${req.approvedDate || req.status === 'อนุมัติ' ? approvedFormatted : '...../...../..........'}</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Watermark Footer -->
      <div style="margin-top: 36px; padding-top: 12px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8;">
        <div>🔒 สำนักงานสหกรณ์จังหวัดขอนแก่น • ระบบบริหารจัดการวันเวลาของการลา SmartLeave</div>
        <div>รหัสอ้างอิง: SL-${req.id}-${now.getTime().toString(36).toUpperCase()}</div>
      </div>
    </div>
  `;
}

/**
 * Universal Slip Generator:
 * Routes to Official "แบบใบลาพักผ่อน" when the leave type is vacation/พักผ่อน,
 * and routes to Standard Electronic Slip for other leaves.
 */
export function generateLeaveSlipHTML(req) {
  if (isVacationLeaveRequest(req)) {
    return generateGovernmentVacationLeaveHTML(req);
  }
  return generateStandardElectronicLeaveSlipHTML(req);
}

function getSlipFilenamePrefix(category) {
  switch (category) {
    case 'vacation':
      return 'แบบใบลาพักผ่อน';
    case 'sick':
      return 'แบบใบลาป่วย';
    case 'personal':
      return 'แบบใบลากิจส่วนตัว';
    case 'maternity':
      return 'แบบใบลาคลอดบุตร';
    default:
      return 'ใบขออนุมัติการลา';
  }
}

/**
 * Direct Download of Leave Slip as PDF file.
 * Loads official government PDF templates ("ใบลาพักผ่อน.pdf" or "ใบลาป่วย กิจ คลอดบุตร.pdf")
 * and fills existing employee details directly into the form blanks.
 */
export async function downloadLeaveSlipPdf(req) {
  const category = getLeaveCategory(req);
  const cleanName = (req.employeeName || 'ผู้ขอลา').replace(/\s+/g, '_');
  const filenamePrefix = getSlipFilenamePrefix(category);
  const filename = `${filenamePrefix}_${req.id}_${cleanName}.pdf`;

  const useOfficialTemplate =
    category === 'vacation' ||
    category === 'sick' ||
    category === 'personal' ||
    category === 'maternity';

  if (useOfficialTemplate) {
    try {
      const pdfBytes =
        category === 'vacation'
          ? await generateVacationPdfBytes(req)
          : await generateSickPersonalMaternityPdfBytes(req);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      return true;
    } catch (err) {
      console.error('Error generating filled PDF from official template:', err);
      throw err;
    }
  }

  const html = generateLeaveSlipHTML(req);

  const opt = {
    margin: [8, 8, 8, 8],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, scrollX: 0, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(html).save();
    return true;
  } catch (err) {
    console.error('Error generating PDF with html2pdf, falling back to print window:', err);
    printLeaveSlip(req);
    return false;
  }
}

/**
 * Open Print Window for browser print-to-PDF (uses filled official PDF templates)
 */
export async function printLeaveSlip(req) {
  const category = getLeaveCategory(req);
  const filenamePrefix = getSlipFilenamePrefix(category);
  const title = `${filenamePrefix}_${req.id}`;

  const useOfficialTemplate =
    category === 'vacation' ||
    category === 'sick' ||
    category === 'personal' ||
    category === 'maternity';

  const printWindow = window.open('', '_blank');

  if (useOfficialTemplate) {
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="th">
          <head><meta charset="UTF-8"><title>${title}</title></head>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #334155;">
            <div>กำลังจัดเตรียม${filenamePrefix} PDF...</div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }

    try {
      const pdfBytes =
        category === 'vacation'
          ? await generateVacationPdfBytes(req)
          : await generateSickPersonalMaternityPdfBytes(req);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      if (printWindow && !printWindow.closed) {
        printWindow.location.replace(url);
      } else {
        window.open(url, '_blank');
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error('Error opening official PDF for print:', err);
      if (printWindow && !printWindow.closed) {
        printWindow.close();
      }
      throw err;
    }
    return;
  }

  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: 'Sarabun', 'Prompt', sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        </style>
      </head>
      <body>
        ${generateLeaveSlipHTML(req)}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Export leave requests summary report as PDF
 */
export async function downloadLeaveSummaryPdf(requests, title = 'รายงานสรุปประวัติการลา') {
  const now = new Date();
  const monthsThai = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const printDate = `${now.getDate()} ${monthsThai[now.getMonth()]} ${now.getFullYear() + 543}`;

  const rowsHtml = requests.map((r, i) => `
    <tr style="border-bottom: 1px solid #f1f5f9; ${i % 2 === 0 ? 'background: #ffffff;' : 'background: #f8fafc;'}">
      <td style="padding: 8px 10px; font-weight: 600; font-size: 11px;">${r.id}</td>
      <td style="padding: 8px 10px; font-size: 11px;">${r.employeeName || '-'}</td>
      <td style="padding: 8px 10px; font-size: 11px; color: #15803d; font-weight: 600;">${r.type}</td>
      <td style="padding: 8px 10px; font-size: 11px;">${r.dateRange}</td>
      <td style="padding: 8px 10px; text-align: center; font-size: 11px; font-weight: bold;">${r.days}</td>
      <td style="padding: 8px 10px; text-align: center; font-size: 11px;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-weight: bold; font-size: 10px; ${
          r.status === 'อนุมัติ' ? 'background: #dcfce7; color: #15803d;' : r.status === 'รออนุมัติ' ? 'background: #fef3c7; color: #b45309;' : 'background: #fee2e2; color: #b91c1c;'
        }">
          ${r.status}
        </span>
      </td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: 'Prompt', 'Sarabun', sans-serif; color: #1e293b; padding: 32px 36px; background: #ffffff;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #15803d; padding-bottom: 14px; margin-bottom: 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="/logo.png" style="width: 44px; height: 44px; object-fit: contain;" />
          <div>
            <h1 style="font-size: 18px; font-weight: 800; color: #113C22; margin: 0;">SmartLeave - ${title}</h1>
            <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">สำนักงานสหกรณ์จังหวัดขอนแก่น • ทั้งสิ้น ${requests.length} รายการ</p>
          </div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #64748b;">
          วันที่ออกรายงาน: <strong>${printDate}</strong>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 11px;">
        <thead>
          <tr style="background: #155A32; color: #ffffff;">
            <th style="padding: 8px 10px; border-radius: 6px 0 0 0;">รหัสคำขอ</th>
            <th style="padding: 8px 10px;">ชื่อผู้ขอ</th>
            <th style="padding: 8px 10px;">ประเภทการลา</th>
            <th style="padding: 8px 10px;">ช่วงวันที่ลา</th>
            <th style="padding: 8px 10px; text-align: center;">จำนวนวัน</th>
            <th style="padding: 8px 10px; text-align: center; border-radius: 0 6px 0 0;">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="margin-top: 24px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
        <span>ออกรายงานโดยระบบ SmartLeave • สำนักงานสหกรณ์จังหวัดขอนแก่น</span>
        <span>หน้า 1/1</span>
      </div>
    </div>
  `;

  const opt = {
    margin: [8, 8, 8, 8],
    filename: `รายงานการลา_สหกรณ์ขอนแก่น_${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, scrollX: 0, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(html).save();
    return true;
  } catch (e) {
    console.error('Error downloading summary PDF:', e);
    return false;
  }
}
