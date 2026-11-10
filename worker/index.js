/**
 * CLOUDFLARE PAGES FUNCTIONS: Backend API Layer
 * ไฟล์นี้ทำหน้าที่เป็น Serverless API เชื่อมต่อระหว่างหน้าเว็บ React และฐานข้อมูล Cloudflare D1
 * Routing Path: /api/*
 */

// Helper สำหรับตอบกลับ JSON พร้อม CORS
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Export สำหรับ Cloudflare Workers (Worker Fetch Event)
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // ถ้าไม่ใช่เส้นทาง API ให้เรียก static assets
    if (!url.pathname.startsWith('/api') && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return onRequest({ request, env, waitUntil: ctx?.waitUntil?.bind(ctx) });
  },
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  // ตัด /api ออก และตัด trailing slash เพื่อป้องกัน route mismatch
  const rawPath = url.pathname.replace(/^\/api/, '');
  const path = (rawPath === '' || rawPath === '/') ? '/' : rawPath.replace(/\/$/, '');
  const method = request.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // ตรวจสอบว่ามี D1 Binding หรือไม่
  if (!env.DB) {
    return jsonResponse(
      { error: 'D1 Database binding (env.DB) not found. กรุณาตรวจสอบ wrangler.toml' },
      500
    );
  }

  // เตรียมข้อมูลตั้งต้นพนักงานสหกรณ์ใน D1 อัตโนมัติหากยังไม่มี
  try {
    const userCount = await env.DB.prepare("SELECT count(*) as count FROM users WHERE employee_code LIKE 'EMP-%' OR employee_code LIKE 'MGR-%'").first();
    if (!userCount || userCount.count < 5) {
      await env.DB.batch([
        env.DB.prepare("INSERT OR IGNORE INTO departments (department_id, code, name_th, name_en) VALUES (1, 'DEP-ADMIN', 'ฝ่ายบริหารทั่วไป', 'General Administration')"),
        env.DB.prepare("INSERT OR IGNORE INTO departments (department_id, code, name_th, name_en) VALUES (2, 'DEP-CP1', 'กลุ่มส่งเสริมและพัฒนาสหกรณ์ 1', 'Cooperative Promotion 1')"),
        env.DB.prepare("INSERT OR IGNORE INTO departments (department_id, code, name_th, name_en) VALUES (3, 'DEP-BIZ', 'กลุ่มส่งเสริมและพัฒนาธุรกิจสหกรณ์', 'Cooperative Business')"),
        env.DB.prepare("INSERT OR IGNORE INTO departments (department_id, code, name_th, name_en) VALUES (4, 'DEP-AUD', 'กลุ่มตรวจการสหกรณ์', 'Cooperative Inspection')"),
        env.DB.prepare("INSERT OR IGNORE INTO departments (department_id, code, name_th, name_en) VALUES (5, 'DEP-CP2', 'กลุ่มส่งเสริมและพัฒนาสหกรณ์ 2', 'Cooperative Promotion 2')"),
        
        env.DB.prepare(`INSERT OR REPLACE INTO users (user_id, employee_code, email, password_hash, prefix, first_name, last_name, gender, phone, department_id, role_id, position, avatar_url, is_active)
          VALUES (2, 'EMP-001', 'panika.t@smartleave.com', 'default_hash', 'นางสาว', 'พนิกา', 'ธรรมเมือง', 'หญิง', '081-234-5678', 2, 4, 'นักวิชาการสหกรณ์ปฏิบัติการ', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80', 1)`),
        env.DB.prepare(`INSERT OR REPLACE INTO users (user_id, employee_code, email, password_hash, prefix, first_name, last_name, gender, phone, department_id, role_id, position, avatar_url, is_active)
          VALUES (3, 'MGR-002', 'somchai.m@smartleave.com', 'default_hash', 'นาย', 'สมชาย', 'มั่นคง', 'ชาย', '089-876-5432', 1, 3, 'ผู้อำนวยการกลุ่มงานบริหาร / ผู้อนุมัติ', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80', 1)`),
        env.DB.prepare(`INSERT OR REPLACE INTO users (user_id, employee_code, email, password_hash, prefix, first_name, last_name, gender, phone, department_id, role_id, position, avatar_url, is_active)
          VALUES (4, 'EMP-003', 'nichaphat.w@smartleave.com', 'default_hash', 'นางสาว', 'ณิชาภัทร', 'วงศ์ษา', 'หญิง', '086-111-2233', 3, 4, 'เจ้าพนักงานส่งเสริมสหกรณ์ชำนาญงาน', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80', 1)`),
        env.DB.prepare(`INSERT OR REPLACE INTO users (user_id, employee_code, email, password_hash, prefix, first_name, last_name, gender, phone, department_id, role_id, position, avatar_url, is_active)
          VALUES (5, 'EMP-004', 'akarapol.c@smartleave.com', 'default_hash', 'นาย', 'อัครพล', 'เจริญผล', 'ชาย', '082-333-4455', 4, 4, 'นักวิชาการมาตรฐานสหกรณ์', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80', 1)`),
        env.DB.prepare(`INSERT OR REPLACE INTO users (user_id, employee_code, email, password_hash, prefix, first_name, last_name, gender, phone, department_id, role_id, position, avatar_url, is_active)
          VALUES (6, 'EMP-005', 'suda.j@smartleave.com', 'default_hash', 'นางสาว', 'สุดา', 'ใจดี', 'หญิง', '084-555-6677', 1, 4, 'เจ้าหน้าที่ธุรการและสารบรรณ', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80', 1)`),
      ]);
    }
  } catch (seedErr) {
    console.log('[D1 Auto-seed Note]:', seedErr.message);
  }

  try {
    // -------------------------------------------------------------
    // 0. ทดสอบการเชื่อมต่อ D1 (Health Check)
    // GET /api/health
    // -------------------------------------------------------------
    if (path === '/health' && method === 'GET') {
      const result = await env.DB.prepare('SELECT 1 as is_connected').first();
      return jsonResponse({
        status: 'ok',
        database: 'Cloudflare D1',
        connected: result?.is_connected === 1,
      });
    }

    // -------------------------------------------------------------
    // 1. เข้าสู่ระบบ (Login)
    // POST /api/auth/login
    // -------------------------------------------------------------
    if (path === '/auth/login' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { email } = body;

      if (!email) {
        return jsonResponse({ message: 'กรุณากรอกอีเมล' }, 400);
      }

      // ดึงข้อมูลผู้ใช้จากตาราง users
      let user = await env.DB.prepare(`
        SELECT u.*, d.name_th as department_name, r.code as role_code
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.department_id
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE (LOWER(u.email) = LOWER(?) OR LOWER(u.employee_code) = LOWER(?)) AND u.is_active = 1
      `).bind(email, email).first();

      // จัดการ Alias อีเมลทดสอบ (เชื่อมต่อกับข้อมูลในตาราง users)
      if (!user) {
        const lower = email.toLowerCase();
        if (lower.includes('panika') || lower === 'user@smartleave.com' || lower.includes('emp-001')) {
          user = await env.DB.prepare(`
            SELECT u.*, d.name_th as department_name, r.code as role_code
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.department_id
            LEFT JOIN roles r ON u.role_id = r.role_id
            WHERE u.employee_code = 'EMP-001' OR u.user_id = 2
            LIMIT 1
          `).first();
        } else if (lower.includes('somchai') || lower === 'manager@smartleave.com' || lower.includes('mgr-002')) {
          user = await env.DB.prepare(`
            SELECT u.*, d.name_th as department_name, r.code as role_code
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.department_id
            LEFT JOIN roles r ON u.role_id = r.role_id
            WHERE u.employee_code = 'MGR-002' OR u.user_id = 3
            LIMIT 1
          `).first();
        }
      }

      // หากไม่พบบัญชี ให้สร้างบัญชีพนักงานชั่วคราวให้ทดสอบได้ทันที
      if (!user) {
        const isApprover = email.includes('manager') || email.includes('approver') || email.includes('admin') || email.includes('somchai');
        const roleId = isApprover ? 3 : 4;
        const namePart = email.split('@')[0];
        const empCode = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

        const insert = await env.DB.prepare(`
          INSERT INTO users (employee_code, email, password_hash, first_name, last_name, role_id, department_id, position)
          VALUES (?, ?, 'default_hash', ?, 'พนักงาน', ?, 1, ?)
        `).bind(empCode, email, namePart, roleId, isApprover ? 'ผู้อำนวยการกลุ่มงานบริหาร / ผู้อนุมัติ' : 'เจ้าหน้าที่สหกรณ์').run();

        const newId = insert.meta.last_row_id;
        user = await env.DB.prepare(`SELECT * FROM users WHERE user_id = ?`).bind(newId).first();
      }

      const gender = user.gender || ((user.prefix?.includes('นาง') || user.first_name?.includes('พนิกา') || user.first_name?.includes('ณิชาภัทร') || user.first_name?.includes('สุดา')) ? 'หญิง' : 'ชาย');
      const prefix = user.prefix ? user.prefix : '';
      const displayName = `${prefix}${user.first_name} ${user.last_name}`.trim();

      return jsonResponse({
        token: `demo-token-${user.user_id}`,
        user: {
          id: `usr-${user.user_id}`,
          name: displayName,
          gender,
          email: user.email,
          phone: user.phone || '081-234-5678',
          title: user.position || (user.role_id === 3 ? 'ผู้อำนวยการกลุ่มงานบริหาร / ผู้อนุมัติ' : 'นักวิชาการสหกรณ์ปฏิบัติการ'),
          role: user.role_id === 3 || user.role_id === 1 ? 'approver' : 'employee',
          department: user.department_name || 'สำนักงานสหกรณ์จังหวัดขอนแก่น',
          employeeId: user.employee_code,
          avatar: user.avatar_url || (gender === 'ชาย' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80' : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80'),
        },
      });
    }

    // -------------------------------------------------------------
    // 2. ลงทะเบียนพนักงานใหม่ (Register)
    // POST /api/auth/register
    // -------------------------------------------------------------
    if (path === '/auth/register' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { firstName, lastName, employeeCode, email, department, position } = body;

      const empCode = employeeCode || `EMP-${Date.now().toString().slice(-4)}`;

      const insert = await env.DB.prepare(`
        INSERT INTO users (employee_code, email, password_hash, first_name, last_name, role_id, department_id, position)
        VALUES (?, ?, 'default_hash', ?, ?, 4, 1, ?)
      `).bind(empCode, email, firstName, lastName, position || 'พนักงาน').run();

      const newUserId = insert.meta.last_row_id;

      // สร้างโควตาวันลาเริ่มต้นประจำปีให้พนักงานใหม่
      const currentYear = new Date().getFullYear();
      await env.DB.batch([
        env.DB.prepare('INSERT OR IGNORE INTO employee_leave_quotas (user_id, leave_type_id, fiscal_year, total_quota, remaining_days) VALUES (?, 1, ?, 10.0, 10.0)').bind(newUserId, currentYear),
        env.DB.prepare('INSERT OR IGNORE INTO employee_leave_quotas (user_id, leave_type_id, fiscal_year, total_quota, remaining_days) VALUES (?, 2, ?, 30.0, 30.0)').bind(newUserId, currentYear),
        env.DB.prepare('INSERT OR IGNORE INTO employee_leave_quotas (user_id, leave_type_id, fiscal_year, total_quota, remaining_days) VALUES (?, 3, ?, 5.0, 5.0)').bind(newUserId, currentYear),
      ]);

      return jsonResponse({
        success: true,
        user: {
          id: `usr-${newUserId}`,
          name: `${firstName} ${lastName}`,
          email,
          role: 'employee',
          department: department || 'ฝ่ายเทคโนโลยีสารสนเทศ',
          employeeId: empCode,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
        },
      });
    }

    // -------------------------------------------------------------
    // 3. ดึงรายการคำขอลางานทั้งหมด (Get Leaves)
    // GET /api/leaves
    // -------------------------------------------------------------
    if (path === '/leaves' && method === 'GET') {
      const { results } = await env.DB.prepare(`
        SELECT 
          lr.request_id as id,
          lr.request_no,
          lr.user_id,
          lr.user_id as userId,
          u.employee_code as employeeId,
          u.email as employeeEmail,
          (u.first_name || ' ' || u.last_name) as employeeName,
          d.name_th as department,
          lt.name_th as type,
          lt.code as typeKey,
          (lr.start_date || ' ถึง ' || lr.end_date) as dateRange,
          lr.start_date as startDate,
          lr.end_date as endDate,
          lr.total_days as days,
          CASE 
            WHEN lr.status = 'pending' THEN 'รออนุมัติ'
            WHEN lr.status = 'approved' THEN 'อนุมัติ'
            WHEN lr.status = 'rejected' THEN 'ไม่อนุมัติ'
            ELSE lr.status
          END as status,
          lr.reason,
          lr.rejection_reason as note,
          lr.created_at as appliedDate
        FROM leave_requests lr
        JOIN users u ON lr.user_id = u.user_id
        JOIN leave_types lt ON lr.leave_type_id = lt.leave_type_id
        LEFT JOIN departments d ON u.department_id = d.department_id
        ORDER BY lr.created_at DESC
      `).all();

      return jsonResponse(results || []);
    }

    // -------------------------------------------------------------
    // 3.0 ดึงรายชื่อพนักงานทั้งหมด (Get All Employees)
    // GET /api/employees
    // -------------------------------------------------------------
    if (path === '/employees' && method === 'GET') {
      const { results } = await env.DB.prepare(`
        SELECT 
          u.user_id as raw_id,
          ('usr-' || u.user_id) as id,
          ((CASE WHEN u.prefix IS NOT NULL AND u.prefix != '' THEN u.prefix ELSE '' END) || u.first_name || ' ' || u.last_name) as name,
          COALESCE(u.gender, CASE WHEN u.prefix LIKE '%นาง%' THEN 'หญิง' ELSE 'ชาย' END) as gender,
          u.email,
          COALESCE(u.phone, '081-234-5678') as phone,
          u.employee_code as employeeId,
          COALESCE(u.position, 'เจ้าหน้าที่สหกรณ์') as title,
          COALESCE(d.name_th, 'สำนักงานสหกรณ์จังหวัดขอนแก่น') as department,
          COALESCE(u.avatar_url, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80') as avatar,
          CASE WHEN u.role_id = 3 OR u.role_id = 1 THEN 'approver' ELSE 'employee' END as role,
          COALESCE(q_vacation.remaining_days, 10.0) as vacationRem,
          COALESCE(q_personal.remaining_days, 15.0) as personalRem,
          COALESCE(q_sick.remaining_days, 30.0) as sickRem,
          COALESCE(q_maternity.remaining_days, 90.0) as maternityRem,
          'ปกติ' as status
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.department_id
        LEFT JOIN employee_leave_quotas q_vacation ON u.user_id = q_vacation.user_id AND q_vacation.leave_type_id = 1
        LEFT JOIN employee_leave_quotas q_personal ON u.user_id = q_personal.user_id AND q_personal.leave_type_id = 3
        LEFT JOIN employee_leave_quotas q_sick ON u.user_id = q_sick.user_id AND q_sick.leave_type_id = 2
        LEFT JOIN employee_leave_quotas q_maternity ON u.user_id = q_maternity.user_id AND q_maternity.leave_type_id = 4
        WHERE u.is_active = 1 AND (u.employee_code LIKE 'EMP-%' OR u.employee_code LIKE 'MGR-%')
        ORDER BY u.user_id ASC
      `).all();

      return jsonResponse(results || []);
    }

    // -------------------------------------------------------------
    // 3.1 ดึงโควตาวันลา (Get Quotas)
    // GET /api/quotas
    // -------------------------------------------------------------
    if (path === '/quotas' && method === 'GET') {
      const email = url.searchParams.get('email') || 'user@SmartLeave.com';
      const user = await env.DB.prepare('SELECT user_id FROM users WHERE email = ? LIMIT 1').bind(email).first();
      const userId = user ? user.user_id : 1;

      const { results } = await env.DB.prepare(`
        SELECT 
          lt.code as typeKey,
          lt.name_th as name,
          q.total_quota as totalLimit,
          q.used_days as used,
          q.remaining_days as remaining,
          lt.color_hex as color
        FROM employee_leave_quotas q
        JOIN leave_types lt ON q.leave_type_id = lt.leave_type_id
        WHERE q.user_id = ?
      `).bind(userId).all();

      return jsonResponse(results || []);
    }

    // -------------------------------------------------------------
    // 3.2 ดึงประกาศ (Get Announcements)
    // GET /api/announcements
    // -------------------------------------------------------------
    if (path === '/announcements' && method === 'GET') {
      const { results } = await env.DB.prepare(`
        SELECT announcement_id as id, title, content, badge, is_pinned as isPinned, created_at as date
        FROM announcements
        ORDER BY is_pinned DESC, created_at DESC
      `).all();

      return jsonResponse(results || []);
    }

    // -------------------------------------------------------------
    // 3.3 ดึงการแจ้งเตือน (Get Notifications)
    // GET /api/notifications
    // -------------------------------------------------------------
    if (path === '/notifications' && method === 'GET') {
      const { results } = await env.DB.prepare(`
        SELECT notification_id as id, title, description, type, is_read as isRead, created_at as time
        FROM notifications
        ORDER BY created_at DESC
      `).all();

      return jsonResponse(results || []);
    }

    // -------------------------------------------------------------
    // 4. ยื่นคำขอลางานใหม่ (Create Leave Request)
    // POST /api/leaves
    // -------------------------------------------------------------
    if (path === '/leaves' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { typeKey, startDate, endDate, days, reason, substitute } = body;

      const reqNo = `LV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // หา leave_type_id จาก code
      const leaveType = await env.DB.prepare('SELECT leave_type_id FROM leave_types WHERE code = ?').bind(typeKey || 'vacation').first();
      const typeId = leaveType ? leaveType.leave_type_id : 1;

      // ดึง user คนแรกมาผูก (หรือจาก Token)
      const firstUser = await env.DB.prepare('SELECT user_id FROM users LIMIT 1').first();
      const userId = firstUser ? firstUser.user_id : 1;

      await env.DB.prepare(`
        INSERT INTO leave_requests (request_no, user_id, leave_type_id, start_date, end_date, total_days, reason, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `).bind(reqNo, userId, typeId, startDate, endDate, days || 1.0, reason).run();

      return jsonResponse({ success: true, request_no: reqNo });
    }

    // -------------------------------------------------------------
    // 5. อนุมัติคำขอลา (Approve Leave)
    // POST /api/leaves/:id/approve
    // -------------------------------------------------------------
    if (path.match(/^\/leaves\/([^/]+)\/approve$/) && method === 'POST') {
      const idMatch = path.match(/^\/leaves\/([^/]+)\/approve$/);
      const leaveId = idMatch[1];
      const body = await request.json().catch(() => ({}));

      await env.DB.prepare(`
        UPDATE leave_requests 
        SET status = 'approved', approved_at = datetime('now', 'localtime'), rejection_reason = ?
        WHERE request_id = ? OR request_no = ?
      `).bind(body.remark || 'อนุมัติเรียบร้อย', leaveId, leaveId).run();

      return jsonResponse({ success: true });
    }

    // -------------------------------------------------------------
    // 6. ปฏิเสธคำขอลา (Reject Leave)
    // POST /api/leaves/:id/reject
    // -------------------------------------------------------------
    if (path.match(/^\/leaves\/([^/]+)\/reject$/) && method === 'POST') {
      const idMatch = path.match(/^\/leaves\/([^/]+)\/reject$/);
      const leaveId = idMatch[1];
      const body = await request.json().catch(() => ({}));

      await env.DB.prepare(`
        UPDATE leave_requests 
        SET status = 'rejected', approved_at = datetime('now', 'localtime'), rejection_reason = ?
        WHERE request_id = ? OR request_no = ?
      `).bind(body.remark || 'ไม่อนุมัติ', leaveId, leaveId).run();

      return jsonResponse({ success: true });
    }

    // -------------------------------------------------------------
    // 7. บันทึกความยินยอม PDPA (Consent)
    // POST /api/pdpa/consent
    // -------------------------------------------------------------
    if (path === '/pdpa/consent' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { healthConsent } = body;

      await env.DB.prepare(`
        INSERT INTO pdpa_audit_logs (action, policy_version, details, ip_address)
        VALUES (?, 'v1.0', ?, 'Cloudflare Edge')
      `).bind(
        healthConsent ? 'AGREE_NOTICE_AND_HEALTH_DATA' : 'AGREE_NOTICE_ONLY',
        `User submitted consent choice: Health=${healthConsent}`
      ).run();

      return jsonResponse({ success: true });
    }

    // -------------------------------------------------------------
    // 8. อัปเดตข้อมูลผู้ใช้ (Update User Profile)
    // PUT or POST /api/users/profile
    // -------------------------------------------------------------
    if ((path === '/users/profile' || path === '/auth/profile') && (method === 'PUT' || method === 'POST')) {
      const body = await request.json().catch(() => ({}));
      const { name, email, phone, title, department, avatar, employeeId, gender } = body;

      let firstName = name;
      let lastName = '';
      let prefix = gender === 'หญิง' ? 'นางสาว' : (gender === 'ชาย' ? 'นาย' : null);

      if (name && name.includes(' ')) {
        const parts = name.trim().split(/\s+/);
        if (['นาย', 'นาง', 'นางสาว'].includes(parts[0])) {
          prefix = parts[0];
          firstName = parts[1];
          lastName = parts.slice(2).join(' ');
        } else {
          firstName = parts[0];
          lastName = parts.slice(1).join(' ');
        }
      }

      if (email || employeeId) {
        try {
          await env.DB.prepare(`
            UPDATE users 
            SET prefix = COALESCE(?, prefix),
                first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                phone = COALESCE(?, phone),
                position = COALESCE(?, position),
                avatar_url = COALESCE(?, avatar_url),
                updated_at = datetime('now', 'localtime')
            WHERE email = ? OR employee_code = ?
          `).bind(prefix, firstName, lastName, phone, title, avatar, email, employeeId).run();
        } catch (dbErr) {
          console.log('[D1 Update Profile Note]:', dbErr.message);
        }
      }

      return jsonResponse({
        success: true,
        message: 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว',
        user: {
          ...body,
          gender: gender || (prefix?.includes('นาง') ? 'หญิง' : 'ชาย'),
        },
      });
    }

    // หากไม่ตรงกับเส้นทางใดๆ
    return jsonResponse({ message: `API endpoint '${path}' not found` }, 404);

  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

