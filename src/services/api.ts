// Client API service for CLW VAW 2026 Quiz Portal

export interface PublicHomeData {
  ok: boolean;
  departments: string[];
  units: string[];
  schedule: {
    id: number;
    department: string;
    starts_at: string;
    ends_at: string;
    updated_at: string;
  }[];
  settings: {
    cvo_name: string;
    cvo_designation: string;
    cvo_organization: string;
    seal_text: string;
    logo_url: string;
    has_signature: boolean;
    quiz_seconds: number;
    quiz_count: number;
  };
}

export interface ParticipantData {
  id: number;
  pf: string;
  name: string;
  designation: string;
  department: string;
  unit: string;
}

export interface QuizQuestionData {
  id: number;
  question: string;
  options: string[];
}

export interface QuizStartData {
  ok: boolean;
  seconds: number;
  questions: QuizQuestionData[];
  answers: Record<string, string>;
  attemptId: number;
  error?: string;
  done?: boolean;
}

export interface CertificateData {
  certificate_no: string;
  name: string;
  pf: string;
  designation: string;
  department: string;
  unit: string;
  score: number;
  max: number;
  submitted_at: string;
  cvo_name: string;
  cvo_designation: string;
  cvo_organization: string;
  signature_photo: string | null;
  seal_text: string;
  logo_url: string;
}

export interface AdminQuestionItem {
  id: number;
  department: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_index: number;
  sort_order: number;
  source: string;
  created_at: string;
}

export interface AdminSettingsData {
  cvo_name: string;
  cvo_designation: string;
  cvo_organization: string;
  signature_photo: string | null;
  seal_text: string;
  logo_url: string;
  quiz_seconds: number;
  quiz_count: number;
  updated_at: string;
}

class ApiService {
  private adminToken: string | null = null;

  constructor() {
    this.adminToken = localStorage.getItem('clw_admin_token');
  }

  public setAdminToken(token: string | null) {
    this.adminToken = token;
    if (token) {
      localStorage.setItem('clw_admin_token', token);
    } else {
      localStorage.removeItem('clw_admin_token');
    }
  }

  public getAdminToken(): string | null {
    return this.adminToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.adminToken) {
      headers['Authorization'] = `Bearer ${this.adminToken}`;
      headers['x-admin-token'] = this.adminToken;
    }

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({ ok: false, error: 'Unexpected server response' }));
    if (!response.ok || data.ok === false) {
      const err = new Error(data.error || 'Request failed');
      (err as unknown as { data: unknown }).data = data;
      throw err;
    }

    return data as T;
  }

  // --- Public APIs ---
  public async getHome(): Promise<PublicHomeData> {
    return this.request<PublicHomeData>('/home', { method: 'GET' });
  }

  public async register(payload: {
    pf: string;
    name: string;
    designation: string;
    department: string;
    unit: string;
    mobile: string;
  }) {
    return this.request<{
      ok: boolean;
      participant: ParticipantData;
      attempt: { status: string; score: number; max: number } | null;
    }>('/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async startQuiz(pf: string): Promise<QuizStartData> {
    return this.request<QuizStartData>('/start', {
      method: 'POST',
      body: JSON.stringify({ pf })
    });
  }

  public async saveAnswer(pf: string, question_id: number, selected: string) {
    return this.request<{ ok: boolean }>('/save_answer', {
      method: 'POST',
      body: JSON.stringify({ pf, question_id, selected })
    });
  }

  public async submitQuiz(pf: string) {
    return this.request<{ ok: boolean; score: number; max: number; submitted_at: string }>('/submit', {
      method: 'POST',
      body: JSON.stringify({ pf })
    });
  }

  public async getCertificate(pf: string) {
    return this.request<{ ok: boolean; certificate: CertificateData }>(`/certificate?pf=${encodeURIComponent(pf)}`, {
      method: 'GET'
    });
  }

  // --- Admin APIs ---
  public async loginAdmin(username: string, password: string) {
    const data = await this.request<{
      ok: boolean;
      token: string;
      admin: { id: number; username: string; display_name: string; must_change: boolean };
    }>('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    this.setAdminToken(data.token);
    return data;
  }

  public async logoutAdmin() {
    try {
      await this.request<{ ok: boolean }>('/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    this.setAdminToken(null);
  }

  public async getAdminMe() {
    return this.request<{
      ok: boolean;
      admin: { id: number; username: string; display_name: string; must_change: boolean } | null;
    }>('/me', { method: 'GET' });
  }

  public async getDashboard() {
    return this.request<{
      ok: boolean;
      counts: {
        questions: number;
        participants: number;
        submitted: number;
        audit: number;
        sample_questions: number;
      };
    }>('/admin/dashboard', { method: 'GET' });
  }

  // Question CRUD
  public async getAdminQuestions(department?: string) {
    const query = department && department !== 'All' ? `?department=${encodeURIComponent(department)}` : '';
    return this.request<{ ok: boolean; questions: AdminQuestionItem[] }>(`/admin/questions${query}`, {
      method: 'GET'
    });
  }

  public async addQuestion(question: {
    department: string;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_index: number;
  }) {
    return this.request<{ ok: boolean; question: AdminQuestionItem }>('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(question)
    });
  }

  public async updateQuestion(
    id: number,
    question: {
      department: string;
      question: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      correct_index: number;
    }
  ) {
    return this.request<{ ok: boolean; question: AdminQuestionItem }>(`/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(question)
    });
  }

  public async deleteQuestion(id: number) {
    return this.request<{ ok: boolean; message: string }>(`/admin/questions/${id}`, {
      method: 'DELETE'
    });
  }

  public async uploadQuestionsCsv(csvText: string, mode: 'replace_all' | 'replace_department', fallbackDepartment?: string) {
    return this.request<{ ok: boolean; imported: number }>('/admin/upload', {
      method: 'POST',
      body: JSON.stringify({ csvText, mode, fallbackDepartment })
    });
  }

  // Settings & Signature
  public async getAdminSettings() {
    return this.request<{ ok: boolean; settings: AdminSettingsData }>('/admin/settings', {
      method: 'GET'
    });
  }

  public async updateAdminSettings(settings: Partial<AdminSettingsData>) {
    return this.request<{ ok: boolean; settings: AdminSettingsData }>('/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    });
  }

  // Schedules
  public async saveSchedules(rows: { department: string; starts_at: string; ends_at: string }[]) {
    return this.request<{ ok: boolean }>('/admin/schedule_save', {
      method: 'POST',
      body: JSON.stringify({ rows })
    });
  }

  // Results & Audit
  public async getAdminResults() {
    return this.request<{
      ok: boolean;
      results: {
        pf_no: string;
        name: string;
        designation: string;
        department: string;
        unit_name: string;
        mobile: string;
        status: string;
        score: number | null;
        max_score: number | null;
        submitted_at: string | null;
      }[];
    }>('/admin/results', { method: 'GET' });
  }

  public async getAdminAudit(search?: string) {
    const q = search ? `?q=${encodeURIComponent(search)}` : '';
    return this.request<{
      ok: boolean;
      total: number;
      rows: { id: number; created_at: string; actor: string; action: string; detail: string; ip: string }[];
    }>(`/admin/audit${q}`, { method: 'GET' });
  }

  public async changePassword(current: string, next: string) {
    return this.request<{ ok: boolean; message: string }>('/admin/change_password', {
      method: 'POST',
      body: JSON.stringify({ current, next })
    });
  }
}

export const api = new ApiService();
