import { 
  Subject, 
  Rating, 
  Review, 
  Comment, 
  SubjectDetailResponse, 
  UserProfile, 
  AuthUser,
  Certificate
} from '../types'

const API_BASE = '/api'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  })

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`
    try {
      const data = await res.json()
      if (data.error) {
        errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error)
      }
    } catch {}
    throw new Error(errorMsg)
  }

  return res.json()
}

// Auth API
export const authApi = {
  getMe: () => request<{ user: AuthUser }>('/auth/me'),
  login: (credentials: { email: string; password: string }) => 
    request<{ user: AuthUser }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data: { username: string; email: string; password: string; branch?: string; gradYear?: number }) => 
    request<{ user: AuthUser }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  updateProfile: (data: { bio?: string; branch?: string; gradYear?: number }) =>
    request<{ user: AuthUser }>('/auth/me', { method: 'PUT', body: JSON.stringify(data) })
}

// Subjects API
export const subjectsApi = {
  getAll: (params: { search?: string; dept?: string; year?: string; sem?: string; type?: string; sort?: string; page?: number } = {}) => {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.dept) query.set('dept', params.dept)
    if (params.year) query.set('year', params.year)
    if (params.sem) query.set('sem', params.sem)
    if (params.type) query.set('type', params.type)
    if (params.sort) query.set('sort', params.sort)
    if (params.page) query.set('page', params.page.toString())
    return request<{ subjects: Subject[]; total: number; page: number; pages: number }>(`/subjects?${query.toString()}`)
  },
  getBySlug: (slug: string) => request<SubjectDetailResponse>(`/subjects/${slug}`),
}

// Ratings API
export const ratingsApi = {
  submitRate: (subjectId: number, data: {
    overall: number
    survival: number
    brainMelt: number
    realValue: number
    genres: string[]
    statusTag: string
    reviewHeadline?: string
    reviewBody?: string
  }) => request<{ rating: Rating; subject: Subject; certificate: Certificate }>(`/ratings/subjects/${subjectId}/rate`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getMyRating: (subjectId: number) => request<{ rating: Rating | null }>(`/ratings/subjects/${subjectId}/my-rating`),
  deleteRating: (subjectId: number) => request<{ message: string }>(`/ratings/subjects/${subjectId}/rate`, { method: 'DELETE' })
}

// Reviews API
export const reviewsApi = {
  getBySubject: (subjectId: number, params: { sort?: 'recent' | 'top' | 'unhinged'; page?: number } = {}) => {
    const query = new URLSearchParams()
    if (params.sort) query.set('sort', params.sort)
    if (params.page) query.set('page', params.page.toString())
    return request<{ reviews: Review[]; total: number; page: number; pages: number }>(`/reviews/subjects/${subjectId}?${query.toString()}`)
  },
  react: (reviewId: number, reactionType: 'felt_this' | 'trauma' | 'cap') =>
    request<{ toggled: boolean; reactionType: string }>(`/reviews/${reviewId}/react`, {
      method: 'POST',
      body: JSON.stringify({ reactionType })
    }),
  getComments: (reviewId: number) => request<{ comments: Comment[] }>(`/reviews/${reviewId}/comments`),
  addComment: (reviewId: number, body: string) => 
    request<{ comment: Comment }>(`/reviews/${reviewId}/comments`, { method: 'POST', body: JSON.stringify({ body }) })
}

// Charts API
export const chartsApi = {
  getChart: (chartType: 'hall-of-fame' | 'hall-of-pain' | 'gpa-farmers' | 'most-controversial') =>
    request<{ subjects: Subject[] }>(`/charts/${chartType}`)
}

// Users API
export const usersApi = {
  getProfile: (username: string) => request<{ user: UserProfile }>(`/users/${username}`),
  updateTopFour: (subjectIds: number[]) => 
    request<{ message: string; subjectIds: number[] }>('/users/top-four', { method: 'PUT', body: JSON.stringify({ subjectIds }) }),
  getUserRatings: (username: string) => request<{ ratings: Rating[] }>(`/users/${username}/ratings`)
}

// Moderation & Analytics
export const moderationApi = {
  report: (data: { targetType: 'review' | 'comment'; targetId: number; reason: string }) =>
    request<{ report: any }>('/reports', { method: 'POST', body: JSON.stringify(data) }),
  getReports: (status = 'open') => request<{ reports: any[] }>(`/admin/reports?status=${status}`),
  resolveReport: (id: number, status: 'resolved' | 'dismissed', action?: 'hide' | 'none') =>
    request<{ message: string }>(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status, action }) }),
  getPendingSubjects: () => request<{ subjects: Subject[] }>('/admin/subjects/pending'),
  approveSubject: (id: number) => request<{ message: string }>(`/admin/subjects/${id}/approve`, { method: 'PATCH' })
}

export const logEvent = (eventName: string, metadata: Record<string, any> = {}) => {
  request('/events', { method: 'POST', body: JSON.stringify({ eventName, metadata }) }).catch(() => {})
}
