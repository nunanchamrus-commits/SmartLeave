/**
 * ข้อมูลวันหยุดนักขัตฤกษ์และวันหยุดราชการประจำปี (Official Thai Public Holidays)
 * พร้อมระบบคำนวณวันหยุดที่ใกล้ถึงที่สุดเพื่อปักหมุดในประกาศฝ่ายบุคคล
 */

const THAI_MONTHS_FULL = [
  '',
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

const THAI_MONTHS_SHORT = [
  '',
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

// วันหยุดตามจันทรคติและวันหยุดเคลื่อนที่ตามแต่ละปี
const LUNAR_HOLIDAYS_BY_YEAR = {
  2025: [
    { month: 2, day: 12, name: 'วันมาฆบูชา', desc: 'วันขึ้น 15 ค่ำ เดือน 3' },
    { month: 5, day: 9, name: 'วันพืชมงคลจรดพระนังคัลแรกนาขวัญ', desc: 'พระราชพิธีพืชมงคล' },
    { month: 5, day: 11, name: 'วันวิสาขบูชา', desc: 'วันขึ้น 15 ค่ำ เดือน 6' },
    { month: 5, day: 12, name: 'วันหยุดชดเชยวันวิสาขบูชา', desc: 'วันหยุดชดเชยวันวิสาขบูชา' },
    { month: 7, day: 10, name: 'วันอาสาฬหบูชา', desc: 'วันขึ้น 15 ค่ำ เดือน 8' },
    { month: 7, day: 11, name: 'วันเข้าพรรษา', desc: 'วันแรม 1 ค่ำ เดือน 8' },
  ],
  2026: [
    { month: 3, day: 3, name: 'วันมาฆบูชา', desc: 'วันขึ้น 15 ค่ำ เดือน 3 วันสำคัญทางพระพุทธศาสนา' },
    { month: 5, day: 13, name: 'วันพืชมงคลจรดพระนังคัลแรกนาขวัญ', desc: 'พระราชพิธีพืชมงคลจรดพระนังคัลแรกนาขวัญ' },
    { month: 5, day: 31, name: 'วันวิสาขบูชา', desc: 'วันขึ้น 15 ค่ำ เดือน 6 วันสำคัญสากลของโลก' },
    { month: 6, day: 1, name: 'วันหยุดชดเชยวันวิสาขบูชา', desc: 'วันหยุดราชการชดเชยวันวิสาขบูชา' },
    { month: 7, day: 29, name: 'วันอาสาฬหบูชา', desc: 'วันขึ้น 15 ค่ำ เดือน 8' },
    { month: 7, day: 30, name: 'วันเข้าพรรษา', desc: 'วันแรม 1 ค่ำ เดือน 8' },
    { month: 12, day: 7, name: 'วันหยุดชดเชยวันคล้ายวันพระบรมราชสมภพ ร.9', desc: 'วันหยุดราชการชดเชยวันชาติ และวันพ่อแห่งชาติ' },
  ],
  2027: [
    { month: 2, day: 21, name: 'วันมาฆบูชา', desc: 'วันขึ้น 15 ค่ำ เดือน 3' },
    { month: 2, day: 22, name: 'วันหยุดชดเชยวันมาฆบูชา', desc: 'วันหยุดชดเชยวันมาฆบูชา' },
    { month: 5, day: 14, name: 'วันพืชมงคลจรดพระนังคัลแรกนาขวัญ', desc: 'พระราชพิธีพืชมงคล' },
    { month: 5, day: 20, name: 'วันวิสาขบูชา', desc: 'วันขึ้น 15 ค่ำ เดือน 6' },
    { month: 7, day: 18, name: 'วันอาสาฬหบูชา', desc: 'วันขึ้น 15 ค่ำ เดือน 8' },
    { month: 7, day: 19, name: 'วันเข้าพรรษา', desc: 'วันแรม 1 ค่ำ เดือน 8' },
  ],
};

// วันหยุดตามสุริยคติที่มีวันตรงกันทุกปี
const FIXED_ANNUAL_HOLIDAYS = [
  { month: 1, day: 1, name: 'วันขึ้นปีใหม่', desc: 'วันหยุดเทศกาลต้อนรับปีใหม่' },
  { month: 1, day: 2, name: 'วันหยุดพิเศษเทศกาลปีใหม่', desc: 'วันหยุดราชการต่อเนื่องเทศกาลปีใหม่' },
  { month: 4, day: 6, name: 'วันพระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช และวันที่ระลึกมหาจักรีบรมราชวงศ์ (วันจักรี)', desc: 'วันระลึกมหาจักรีบรมราชวงศ์' },
  { month: 4, day: 13, name: 'วันสงกรานต์', desc: 'วันปีใหม่ไทย' },
  { month: 4, day: 14, name: 'วันสงกรานต์ (วันครอบครัว)', desc: 'เทศกาลสงกรานต์และวันครอบครัว' },
  { month: 4, day: 15, name: 'วันสงกรานต์ (วันผู้สูงอายุแห่งชาติ)', desc: 'เทศกาลสงกรานต์และวันผู้สูงอายุ' },
  { month: 5, day: 1, name: 'วันแรงงานแห่งชาติ', desc: 'วันแรงงานแห่งชาติ' },
  { month: 5, day: 4, name: 'วันฉัตรมงคล', desc: 'วันรำลึกพระราชพิธีบรมราชาภิเษก พระบาทสมเด็จพระเจ้าอยู่หัว' },
  { month: 6, day: 3, name: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ พระบรมราชินี', desc: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสุทิดา พัชรสุธาพิมลลักษณ พระบรมราชินี' },
  { month: 7, day: 28, name: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว', desc: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระวชิรเกล้าเจ้าอยู่หัว (ร.10)' },
  { month: 8, day: 12, name: 'วันเฉลิมพระชนมพรรษาสมเด็จพระบรมราชชนนีพันปีหลวง และวันแม่แห่งชาติ', desc: 'วันแม่แห่งชาติ และวันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ พระบรมราชชนนีพันปีหลวง' },
  { month: 10, day: 13, name: 'วันนวมินทรมหาราช', desc: 'วันคล้ายวันสวรรคตพระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช บรมนาถบพิตร' },
  { month: 10, day: 23, name: 'วันปิยมหาราช', desc: 'วันคล้ายวันสวรรคตพระบาทสมเด็จพระจุลจอมเกล้าเจ้าอยู่หัว (ร.5)' },
  { month: 12, day: 5, name: 'วันคล้ายวันพระบรมราชสมภพ ร.9 วันชาติ และวันพ่อแห่งชาติ', desc: 'วันคล้ายวันพระบรมราชสมภพพระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช บรมนาถบพิตร วันชาติ และวันพ่อแห่งชาติ' },
  { month: 12, day: 10, name: 'วันรัฐธรรมนูญ', desc: 'วันฉลองรัฐธรรมนูญแห่งราชอาณาจักรไทย' },
  { month: 12, day: 31, name: 'วันสิ้นปี', desc: 'วันสิ้นปี ส่งท้ายปีเก่าต้อนรับปีใหม่' },
];

/**
 * ดึงรายการวันหยุดนักขัตฤกษ์สำหรับปี ค.ศ. ที่ระบุ
 */
export function getCalendarHolidays(year) {
  const baseYear = Number(year) || new Date().getFullYear();
  const yearBE = baseYear + 543;

  const fixed = FIXED_ANNUAL_HOLIDAYS.map((h) => ({
    ...h,
    year: baseYear,
  }));

  const lunar = (LUNAR_HOLIDAYS_BY_YEAR[baseYear] || LUNAR_HOLIDAYS_BY_YEAR[2026] || []).map((h) => ({
    ...h,
    year: baseYear,
  }));

  const combined = [...fixed, ...lunar];

  // แปลงและเรียงตามลำดับวันที่
  const list = combined.map((h) => {
    const monthPad = String(h.month).padStart(2, '0');
    const dayPad = String(h.day).padStart(2, '0');
    const dateStr = `${baseYear}-${monthPad}-${dayPad}`;
    const fullDate = `${h.day} ${THAI_MONTHS_FULL[h.month]} ${yearBE}`;
    const shortDate = `${h.day} ${THAI_MONTHS_SHORT[h.month]} ${yearBE}`;

    return {
      id: `hol-${dateStr}`,
      dateStr,
      year: baseYear,
      yearBE,
      month: h.month,
      day: h.day,
      name: h.name,
      description: h.desc,
      fullDate,
      shortDate,
      badge: 'วันหยุดนักขัตฤกษ์',
    };
  });

  // เรียงลำดับวันที่จากน้อยไปมาก และตัดตัวซ้ำ
  const seen = new Set();
  const uniqueList = [];
  list.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

  for (const item of list) {
    if (!seen.has(item.dateStr)) {
      seen.add(item.dateStr);
      uniqueList.push(item);
    }
  }

  return uniqueList;
}

/**
 * ดึงวันหยุดในรูปแบบ Map { 'YYYY-MM-DD': holidayObj } เพื่อใช้งานในปฏิทิน
 */
export function getHolidaysMap(year) {
  const list = getCalendarHolidays(year);
  const map = {};
  list.forEach((h) => {
    map[h.dateStr] = h;
  });
  return map;
}

/**
 * สร้างรายการประกาศจากฝ่ายบุคคล โดยดึงวันหยุดจริงจากปฏิทิน
 * และทำการ "ปักหมุดเฉพาะวันหยุดที่ใกล้ถึงที่สุด" เพียงรายการเดียว
 */
export function generateHolidayAnnouncements(referenceDate = new Date()) {
  const ref = referenceDate instanceof Date && !isNaN(referenceDate) ? referenceDate : new Date();
  const currentYear = ref.getFullYear();
  const todayStr = `${currentYear}-${String(ref.getMonth() + 1).padStart(2, '0')}-${String(ref.getDate()).padStart(2, '0')}`;

  // รวมวันหยุดของปีปัจจุบันและปีถัดไป
  const holidaysCurrent = getCalendarHolidays(currentYear);
  const holidaysNext = getCalendarHolidays(currentYear + 1);
  const allHolidays = [...holidaysCurrent, ...holidaysNext];

  // หาวันหยุดที่ยังไม่เลยวันนี้ (ตั้งแต่วันนี้เป็นต้นไป)
  const upcomingHolidays = allHolidays.filter((h) => h.dateStr >= todayStr);

  // วันหยุดที่ใกล้จะถึงที่สุด
  const closestUpcoming = upcomingHolidays.length > 0 ? upcomingHolidays[0] : allHolidays[0];
  const closestDateStr = closestUpcoming ? closestUpcoming.dateStr : null;

  // แปลงวันหยุดเป็นโครงสร้างประกาศฝ่ายบุคคล (เรียงตามลำดับวันที่)
  const holidayAnnouncements = (upcomingHolidays.length > 0 ? upcomingHolidays.slice(0, 8) : allHolidays.slice(0, 8)).map((h) => {
    const isPinned = h.dateStr === closestDateStr;
    return {
      id: `ann-hol-${h.dateStr}`,
      title: `แจ้งวันหยุดนักขัตฤกษ์: ${h.name}`,
      content: `หยุดราชการวันที่ ${h.fullDate} เนื่องใน${h.name} (${h.description || 'วันหยุดตามประกาศสำนักนายกรัฐมนตรี'})`,
      date: h.shortDate,
      badge: 'วันหยุดนักขัตฤกษ์',
      pinned: isPinned,
      holidayDate: h.dateStr,
      isHoliday: true,
    };
  });

  // ประกาศเกี่ยวกับระเบียบการลาอื่นๆ ของฝ่ายบุคคล (ไม่ปักหมุด ตามเงื่อนไข "ปักหมุดเฉพาะวันหยุดที่ใกล้ถึง")
  const standardAnnouncements = [
    {
      id: 'ann-policy-med',
      title: 'การส่งเอกสารใบรับรองแพทย์สำหรับการลาป่วยเกิน 2 วัน',
      content: 'เจ้าหน้าที่ที่ลาป่วยติดต่อกันเกิน 2 วันทำการ กรุณาแนบใบรับรองแพทย์จากสถานพยาบาลที่ได้รับการรับรองผ่านระบบ SmartLeave ภายใน 3 วันทำการหลังกลับมาปฏิบัติงาน',
      date: '25 ต.ค. 2569',
      badge: 'ระเบียบสหกรณ์',
      pinned: false,
      isHoliday: false,
    },
    {
      id: 'ann-policy-carry',
      title: 'การโอนย้ายวันลาพักผ่อนที่เหลือเข้าสู่รอบปี 2570',
      content: 'ฝ่ายบริหารทั่วไปขอแจ้งเงื่อนไขการสะสมวันลาพักผ่อนคงเหลือ โดยเจ้าหน้าที่สามารถยกยอดสะสมวันลาพักผ่อนได้ตามระเบียบราชการ กรุณาวางแผนการลาล่วงหน้า',
      date: '15 ต.ค. 2569',
      badge: 'แจ้งเตือน',
      pinned: false,
      isHoliday: false,
    },
  ];

  // นำรายการที่ถูกปักหมุด (วันหยุดใกล้ถึง) ขึ้นเป็นอันดับที่ 1 เสมอ
  const combined = [...holidayAnnouncements, ...standardAnnouncements];
  combined.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return combined;
}
