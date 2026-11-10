import html2pdf from 'html2pdf.js';

/**
 * Robust Thai Date Parser Helper
 */
function parseDateParts(dateVal, fallbackDate = new Date()) {
  const monthsThaiFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const monthsThaiShort = {
    'ม.ค.': 0, 'ก.พ.': 1, 'มี.ค.': 2, 'เม.ย.': 3, 'พ.ค.': 4, 'มิ.ย.': 5,
    'ก.ค.': 6, 'ส.ค.': 7, 'ก.ย.': 8, 'ต.ค.': 9, 'พ.ย.': 10, 'ธ.ค.': 11
  };

  if (!dateVal) {
    const d = fallbackDate;
    return {
      day: d.getDate(),
      month: monthsThaiFull[d.getMonth()],
      year: d.getFullYear() + 543,
    };
  }

  // ISO Date string: '2026-11-20'
  if (typeof dateVal === 'string' && dateVal.includes('-')) {
    const parts = dateVal.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return {
        day: isNaN(day) ? fallbackDate.getDate() : day,
        month: monthsThaiFull[m] || monthsThaiFull[fallbackDate.getMonth()],
        year: (isNaN(y) ? fallbackDate.getFullYear() : y) + 543,
      };
    }
  }

  // Thai Date String: '20 พ.ย. 2569'
  if (typeof dateVal === 'string') {
    const match = dateVal.match(/(\d+)\s+([^\s]+)\s+(\d+)/);
    if (match) {
      const d = parseInt(match[1], 10);
      const mStr = match[2];
      const y = parseInt(match[3], 10);
      const mIdx = monthsThaiShort[mStr] !== undefined ? monthsThaiShort[mStr] : monthsThaiFull.indexOf(mStr);
      return {
        day: d,
        month: mIdx >= 0 ? monthsThaiFull[mIdx] : mStr,
        year: y,
      };
    }
  }

  const d = new Date(dateVal);
  if (!isNaN(d.getTime())) {
    return {
      day: d.getDate(),
      month: monthsThaiFull[d.getMonth()],
      year: d.getFullYear() + 543,
    };
  }

  return {
    day: fallbackDate.getDate(),
    month: monthsThaiFull[fallbackDate.getMonth()],
    year: fallbackDate.getFullYear() + 543,
  };
}

/**
 * 1. Official Thai Government Form for Vacation Leave
 * Exactly replicates the attached "ใบลาพักผ่อน.pdf" (สำนักงานสหกรณ์จังหวัดขอนแก่น)
 * Incorporates the official Emblem logo of Khonkaen Provincial Cooperative Office!
 */
export function generateGovernmentVacationLeaveHTML(req) {
  const now = new Date();
  const appliedParts = parseDateParts(req.appliedDate, now);
  const startParts = parseDateParts(req.startDate, now);
  const endParts = parseDateParts(req.endDate, req.startDate ? new Date(req.startDate) : now);
  const approvedParts = parseDateParts(req.approvedDate, now);

  const days = req.days || 1;
  const vacationUsed = 2; // Previous used days in fiscal year
  const vacationSum = vacationUsed + days;
  const contactAddress = req.reason ? `${req.reason} (โทร. 081-234-5678)` : 'ติดต่อได้ที่เบอร์โทรศัพท์ 081-234-5678';
  const departmentName = req.department || 'ฝ่ายบริหารงานทั่วไป';

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
        ข้าพเจ้า <span style="display: inline-block; min-width: 230px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${req.employeeName}</span>
        ตำแหน่ง <span style="display: inline-block; min-width: 200px; text-align: center; border-bottom: 1px dotted #000; font-weight: 500;">${req.title || 'พนักงาน'}</span>
        สังกัด กลุ่ม/ฝ่าย <span style="display: inline-block; min-width: 230px; text-align: center; border-bottom: 1px dotted #000; font-weight: 500;">${departmentName}</span>
        สำนักงานสหกรณ์จังหวัดขอนแก่น มีวันลาพักผ่อนสะสม <span style="display: inline-block; min-width: 40px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">0</span> วันทำการ
        มีสิทธิลาพักผ่อนประจำปีนี้อีก <span style="display: inline-block; min-width: 40px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">10</span> วันทำการ
        รวมเป็น <span style="display: inline-block; min-width: 40px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">10</span> วันทำการ
        ขอลาพักผ่อนตั้งแต่วันที่ <span style="display: inline-block; min-width: 38px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${startParts.day}</span>
        เดือน <span style="display: inline-block; min-width: 100px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${startParts.month}</span>
        พ.ศ. <span style="display: inline-block; min-width: 58px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${startParts.year}</span>
        ถึงวันที่ <span style="display: inline-block; min-width: 38px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${endParts.day}</span>
        เดือน <span style="display: inline-block; min-width: 100px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${endParts.month}</span>
        พ.ศ. <span style="display: inline-block; min-width: 58px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${endParts.year}</span>
        มีกำหนด <span style="display: inline-block; min-width: 38px; text-align: center; border-bottom: 1px dotted #000; font-weight: bold;">${days}</span> วัน
        ในระหว่างการลาในครั้งนี้จะติดต่อกับข้าพเจ้าได้ที่ <span style="display: inline-block; min-width: 310px; border-bottom: 1px dotted #000; font-weight: 500;">${contactAddress}</span>
      </div>

      <!-- Applicant Signoff (Right-aligned Block) -->
      <div style="margin-left: 54%; text-align: center; line-height: 1.7; margin-bottom: 16px; font-size: 13pt;">
        <div>ขอแสดงความนับถือ</div>
        <div style="margin-top: 12px;">
          (ลงชื่อ) <span style="display: inline-block; min-width: 170px; border-bottom: 1px dotted #000; text-align: center; font-weight: bold;">${req.employeeName}</span>
        </div>
        <div style="margin-top: 2px;">
          ( <span style="display: inline-block; min-width: 170px; text-align: center; font-weight: bold;">${req.employeeName}</span> )
        </div>
        <div style="margin-top: 2px;">
          ตำแหน่ง <span style="display: inline-block; min-width: 155px; text-align: center; border-bottom: 1px dotted #000;">${req.title || 'พนักงาน'}</span>
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
                  <td style="border: 1px solid #000; padding: 5px; font-weight: bold; font-size: 12pt;">${vacationUsed}</td>
                  <td style="border: 1px solid #000; padding: 5px; font-weight: bold; font-size: 12pt;">${days}</td>
                  <td style="border: 1px solid #000; padding: 5px; font-weight: bold; font-size: 12pt;">${vacationSum}</td>
                </tr>
              </tbody>
            </table>

            <!-- Checker Signature Block -->
            <div style="margin-top: 8px; line-height: 1.65; font-size: 11pt;">
              <div>ลงชื่อ <span style="display: inline-block; min-width: 150px; border-bottom: 1px dotted #000; text-align: center;">นางสาวพนิกา ธรรมเมือง</span> ผู้ตรวจสอบ</div>
              <div style="margin-top: 2px;">( <span style="display: inline-block; min-width: 150px; text-align: center;">นางสาวพนิกา ธรรมเมือง</span> )</div>
              <div style="margin-top: 2px;">ตำแหน่ง <span style="display: inline-block; min-width: 150px; border-bottom: 1px dotted #000; text-align: center;">เจ้าหน้าที่ทรัพยากรบุคคล</span></div>
              <div style="margin-top: 2px;">วันที่ <span style="display: inline-block; min-width: 32px; border-bottom: 1px dotted #000; text-align: center;">${appliedParts.day}</span> เดือน <span style="display: inline-block; min-width: 75px; border-bottom: 1px dotted #000; text-align: center;">${appliedParts.month}</span> พ.ศ. <span style="display: inline-block; min-width: 45px; border-bottom: 1px dotted #000; text-align: center;">${appliedParts.year}</span></div>
            </div>
          </div>

          <!-- Substitute Handover Block -->
          <div style="margin-top: 14px; line-height: 1.65; font-size: 11pt;">
            <div>ในระหว่างที่ข้าพเจ้าลาพักผ่อนมอบหมายให้</div>
            <div style="margin-top: 2px;">
              <span style="display: inline-block; min-width: 200px; border-bottom: 1px dotted #000; font-weight: bold; text-align: center;">${req.substitute || '-'}</span> ปฏิบัติหน้าที่แทน
            </div>
            <div style="margin-top: 6px;">
              (ลงชื่อ) <span style="display: inline-block; min-width: 155px; border-bottom: 1px dotted #000; text-align: center; font-weight: bold;">${req.employeeName}</span> ผู้มอบ
            </div>
            <div style="margin-top: 2px;">
              ( <span style="display: inline-block; min-width: 155px; text-align: center;">${req.employeeName}</span> )
            </div>
            <div style="margin-top: 6px;">
              (ลงชื่อ) <span style="display: inline-block; min-width: 155px; border-bottom: 1px dotted #000; text-align: center; font-weight: bold;">${req.substitute || '...........................................'}</span> ผู้ปฏิบัติหน้าที่แทน
            </div>
            <div style="margin-top: 2px;">
              ( <span style="display: inline-block; min-width: 155px; text-align: center;">${req.substitute || '...........................................'}</span> )
            </div>
          </div>
        </div>

        <!-- Right Column (49%) -->
        <div style="width: 49%; line-height: 1.65; font-size: 11pt;">
          <!-- Supervisor Opinion -->
          <div>
            <div style="font-weight: bold;">ความเห็นของผู้บังคับบัญชา</div>
            <div style="border-bottom: 1px dotted #000; min-height: 20px; padding-top: 2px; font-weight: 500;">
              ${req.note || 'เห็นควรอนุญาตตามระเบียบ'}
            </div>
            <div style="border-bottom: 1px dotted #000; min-height: 20px;">&nbsp;</div>
            <div style="margin-top: 6px;">
              ลงชื่อ <span style="display: inline-block; min-width: 155px; border-bottom: 1px dotted #000; text-align: center; font-weight: bold;">${req.approver || 'นายสมชาย มั่นคง'}</span>
            </div>
            <div style="margin-top: 2px;">
              ( <span style="display: inline-block; min-width: 155px; text-align: center;">${req.approver || 'นายสมชาย มั่นคง'}</span> )
            </div>
            <div style="margin-top: 2px;">
              ตำแหน่ง <span style="display: inline-block; min-width: 150px; border-bottom: 1px dotted #000; text-align: center;">ผู้จัดการแผนก / ผู้อนุมัติ</span>
            </div>
            <div style="margin-top: 2px;">
              วันที่ <span style="display: inline-block; min-width: 32px; border-bottom: 1px dotted #000; text-align: center;">${appliedParts.day}</span> เดือน <span style="display: inline-block; min-width: 75px; border-bottom: 1px dotted #000; text-align: center;">${appliedParts.month}</span> พ.ศ. <span style="display: inline-block; min-width: 45px; border-bottom: 1px dotted #000; text-align: center;">${appliedParts.year}</span>
            </div>
          </div>

          <!-- Official Command / Order -->
          <div style="margin-top: 14px;">
            <div style="font-weight: bold;">คำสั่ง</div>
            <div style="margin-top: 3px; display: flex; gap: 20px; font-size: 11.5pt;">
              <span style="font-weight: ${req.status === 'อนุมัติ' ? 'bold' : 'normal'};">
                <span style="font-size: 13pt;">${req.status === 'อนุมัติ' ? '●' : '○'}</span> อนุญาต
              </span>
              <span style="font-weight: ${req.status === 'ไม่อนุมัติ' ? 'bold' : 'normal'};">
                <span style="font-size: 13pt;">${req.status === 'ไม่อนุมัติ' ? '●' : '○'}</span> ไม่อนุญาต
              </span>
            </div>
            <div style="border-bottom: 1px dotted #000; min-height: 20px; padding-top: 2px; font-size: 10.5pt;">
              ${req.status === 'อนุมัติ' ? 'อนุมัติตามที่เสนอ' : req.status === 'ไม่อนุมัติ' ? req.note || 'ไม่อนุญาต' : '&nbsp;'}
            </div>
            <div style="border-bottom: 1px dotted #000; min-height: 20px;">&nbsp;</div>
            <div style="margin-top: 6px;">
              ลงชื่อ <span style="display: inline-block; min-width: 155px; border-bottom: 1px dotted #000; text-align: center; font-weight: bold;">${req.approver || 'นายสมชาย มั่นคง'}</span>
            </div>
            <div style="margin-top: 2px;">
              ( <span style="display: inline-block; min-width: 155px; text-align: center;">${req.approver || 'นายสมชาย มั่นคง'}</span> )
            </div>
            <div style="margin-top: 2px;">
              ตำแหน่ง <span style="display: inline-block; min-width: 150px; border-bottom: 1px dotted #000; text-align: center;">สหกรณ์จังหวัดขอนแก่น</span>
            </div>
            <div style="margin-top: 2px;">
              วันที่ <span style="display: inline-block; min-width: 32px; border-bottom: 1px dotted #000; text-align: center;">${approvedParts.day}</span> เดือน <span style="display: inline-block; min-width: 75px; border-bottom: 1px dotted #000; text-align: center;">${approvedParts.month}</span> พ.ศ. <span style="display: inline-block; min-width: 45px; border-bottom: 1px dotted #000; text-align: center;">${approvedParts.year}</span>
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

  const statusColors = {
    'อนุมัติ': { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
    'รออนุมัติ': { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
    'ไม่อนุมัติ': { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
    'ยกเลิก': { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
  };
  const sc = statusColors[req.status] || statusColors['อนุมัติ'];

  return `
    <div style="font-family: 'Prompt', 'Sarabun', 'Segoe UI', Tahoma, sans-serif; color: #1e293b; padding: 36px 40px; background: #ffffff; width: 794px; min-height: 1120px; box-sizing: border-box; line-height: 1.4;">
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
          วันที่ยื่นคำขอ: <strong style="color: #1e293b;">${req.appliedDate || `${printParts.day} ${printParts.month} ${printParts.year}`}</strong>
        </div>
      </div>

      <!-- Section 1: Employee Information -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: 700; color: #14532d; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 12px; letter-spacing: 0.3px;">
          ๑. ข้อมูลผู้ยื่นคำขอลา (Applicant Information)
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="width: 18%; padding: 6px 0; color: #64748b;">ชื่อ - นามสกุล:</td>
            <td style="width: 32%; padding: 6px 0; font-weight: bold; color: #0f172a;">${req.employeeName || '-'}</td>
            <td style="width: 18%; padding: 6px 0; color: #64748b;">รหัสพนักงาน:</td>
            <td style="width: 32%; padding: 6px 0; font-weight: bold; color: #0f172a;">${req.employeeId || 'EMP-2569-089'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">สังกัดกลุ่ม/ฝ่าย:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${req.department || 'สำนักงานสหกรณ์จังหวัดขอนแก่น'}</td>
            <td style="padding: 6px 0; color: #64748b;">ตำแหน่ง:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${req.title || 'พนักงาน'}</td>
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
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${req.approvedDate || (req.status === 'อนุมัติ' ? req.appliedDate : 'รอพิจารณา')}</td>
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
              <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">วันที่ ${req.appliedDate || '...../...../..........'}</div>
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
              <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">วันที่ ${req.approvedDate || '...../...../..........'}</div>
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
  const isVacation =
    req.typeKey === 'vacation' ||
    (req.type && (req.type.includes('พักผ่อน') || req.type.includes('พักร้อน')));

  if (isVacation) {
    return generateGovernmentVacationLeaveHTML(req);
  }
  return generateStandardElectronicLeaveSlipHTML(req);
}

/**
 * Direct Download of Leave Slip as PDF file using html2pdf.js
 */
export async function downloadLeaveSlipPdf(req) {
  const isVacation =
    req.typeKey === 'vacation' ||
    (req.type && (req.type.includes('พักผ่อน') || req.type.includes('พักร้อน')));

  const container = document.createElement('div');
  container.innerHTML = generateLeaveSlipHTML(req);
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '794px';
  document.body.appendChild(container);

  const cleanName = (req.employeeName || 'ผู้ขอลา').replace(/\s+/g, '_');
  const filenamePrefix = isVacation ? 'แบบใบลาพักผ่อน' : 'ใบขออนุมัติการลา';
  const filename = `${filenamePrefix}_${req.id}_${cleanName}.pdf`;

  const opt = {
    margin: isVacation ? [6, 6, 6, 6] : [8, 8, 8, 8],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(container).save();
    return true;
  } catch (err) {
    console.error('Error generating PDF with html2pdf, falling back to print window:', err);
    printLeaveSlip(req);
    return false;
  } finally {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Open Print Window for browser print-to-PDF
 */
export function printLeaveSlip(req) {
  const isVacation =
    req.typeKey === 'vacation' ||
    (req.type && (req.type.includes('พักผ่อน') || req.type.includes('พักร้อน')));

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const title = isVacation ? `แบบใบลาพักผ่อน_${req.id}` : `ใบขออนุมัติการลา_${req.id}`;

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
            margin: ${isVacation ? '6mm' : '10mm'};
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

  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '794px';
  document.body.appendChild(container);

  const opt = {
    margin: [8, 8, 8, 8],
    filename: `รายงานการลา_สหกรณ์ขอนแก่น_${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(container).save();
    return true;
  } catch (e) {
    console.error('Error downloading summary PDF:', e);
    return false;
  } finally {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}
