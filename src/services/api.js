/**
 * API SERVICE CLIENT: SmartLeave & PDPA Integration Layer
 * ชั้นการเชื่อมต่อ API สำหรับส่งและรับข้อมูลระหว่าง Frontend และ Backend Database
 * รองรับการเชื่อมต่อกับ REST API จริง (เช่น Express, Fastify, NestJS หรือ Laravel)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiService {
  /**
   * Helper สำหรับยิง HTTP Request
   */
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('smartleave_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // เมื่อยังไม่ได้เปิด Backend ให้ Fallback ทำงานแบบ Local State ได้อย่างราบรื่น
      console.warn(`[API] ${endpoint} request failed, using local persistence fallback:`, error.message);
      throw error;
    }
  }

  // ==========================================
  // 1. ระบบยืนยันตัวตน (Authentication & User)
  // ==========================================
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  async getEmployees() {
    return this.request('/employees');
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async resetPassword(email, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
  }

  // ==========================================
  // 2. ข้อมูลการลาและโควตา (Leaves & Quotas)
  // ==========================================
  async getLeaveRequests(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/leaves${query ? `?${query}` : ''}`);
  }

  async createLeaveRequest(leaveData) {
    return this.request('/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  }

  async updateLeaveRequest(requestId, leaveData) {
    return this.request(`/leaves/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(leaveData),
    });
  }

  async deleteLeaveRequest(requestId) {
    return this.request(`/leaves/${requestId}`, {
      method: 'DELETE',
    });
  }

  async getLeaveDetail(requestId) {
    return this.request(`/leaves/${requestId}`);
  }

  async approveLeave(requestId, remark) {
    return this.request(`/leaves/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ remark }),
    });
  }

  async rejectLeave(requestId, remark) {
    return this.request(`/leaves/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ remark }),
    });
  }

  async updateLeaveStatus(requestId, status, remark) {
    return this.request(`/leaves/${requestId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, remark }),
    });
  }

  async getUserQuotas(userId, year) {
    return this.request(`/quotas?userId=${userId}&year=${year || new Date().getFullYear()}`);
  }

  async updateEmployeeQuota(userId, quotaData) {
    return this.request(`/employees/${userId}/quotas`, {
      method: 'PUT',
      body: JSON.stringify(quotaData),
    });
  }

  async createEmployee(employeeData) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(employeeId, employeeData) {
    return this.request(`/employees/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  }

  async deleteEmployee(employeeId) {
    return this.request(`/employees/${employeeId}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // 3. กฎหมาย PDPA และความยินยอม (Consent)
  // ==========================================
  async getLatestPrivacyPolicy() {
    return this.request('/pdpa/policy/latest');
  }

  async submitConsent(consentData) {
    return this.request('/pdpa/consent', {
      method: 'POST',
      body: JSON.stringify(consentData),
    });
  }

  async revokeConsent(consentType) {
    return this.request('/pdpa/consent/revoke', {
      method: 'POST',
      body: JSON.stringify({ consentType }),
    });
  }

  async getConsentAuditLogs() {
    return this.request('/pdpa/audit-logs');
  }

  // ==========================================
  // 4. การแจ้งเตือนและประกาศ (Notifications)
  // ==========================================
  async getAnnouncements() {
    return this.request('/announcements');
  }

  async getNotifications(userParam) {
    let query = '';
    if (userParam) {
      if (typeof userParam === 'object') {
        const id = userParam.id || userParam.raw_id;
        const code = userParam.employeeId;
        const email = userParam.email;
        const params = new URLSearchParams();
        if (id) params.set('userId', id);
        if (code) params.set('employeeId', code);
        if (email) params.set('email', email);
        query = `?${params.toString()}`;
      } else {
        query = `?userId=${encodeURIComponent(userParam)}`;
      }
    }
    return this.request(`/notifications${query}`);
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead(userParam) {
    return this.request('/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({ userId: userParam?.id || userParam?.raw_id || userParam }),
    });
  }
}

export const api = new ApiService();
export default api;

