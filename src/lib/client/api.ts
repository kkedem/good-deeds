import type { SanitisedUser, DecoratedOpportunity } from "@/lib/server/services";

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;
  constructor(message: string, status: number, data: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.message || "Something went wrong", res.status, data);
  }
  return data as T;
}

export type Signup = {
  id: string;
  opportunity_id: string;
  user_id: string;
  status: string;
  joined_at: string;
  done_at: string;
  confirmed_at: string;
  points_awarded: string;
};

export type HistoryEntry = {
  signup_id: string;
  opportunity_id: string;
  title: string;
  date: string;
  hours: number;
  status: string;
  category: string;
  points_awarded: string;
};

export type Voucher = {
  code: string;
  offer_title: string;
  business_name: string;
  redeemed_at: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  default_indoor_outdoor: string;
};

export type Offer = {
  id: string;
  title: string;
  points_cost: number;
  business_name: string;
  business_area: string;
};

export type Attendee = {
  signup_id: string;
  user_id: string;
  name: string;
  status: string;
};

export const Api = {
  login: (email: string, password: string) =>
    request<{ user: SanitisedUser }>("POST", "/api/login", { email, password }),
  signup: (payload: Record<string, unknown>) => request<{ user: SanitisedUser }>("POST", "/api/signup", payload),
  verify: (userId: string) => request<{ user: SanitisedUser }>("POST", `/api/users/${userId}/verify`),
  getUser: (userId: string) => request<{ user: SanitisedUser }>("GET", `/api/users/${userId}`),
  updateUser: (userId: string, patch: Record<string, unknown>) =>
    request<{ user: SanitisedUser }>("PATCH", `/api/users/${userId}`, patch),
  getHistory: (userId: string) => request<{ history: HistoryEntry[] }>("GET", `/api/users/${userId}/history`),
  getPosts: (userId: string) => request<{ posts: DecoratedOpportunity[] }>("GET", `/api/users/${userId}/posts`),
  getVouchers: (userId: string) => request<{ vouchers: Voucher[] }>("GET", `/api/users/${userId}/vouchers`),
  getCategories: () => request<{ categories: Category[] }>("GET", "/api/categories"),
  getOpportunities: (postcode?: string) =>
    request<{ opportunities: DecoratedOpportunity[] }>(
      "GET",
      `/api/opportunities?postcode=${encodeURIComponent(postcode || "")}`,
    ),
  getRecommended: (userId: string) =>
    request<{ opportunities: DecoratedOpportunity[] }>("GET", `/api/opportunities/recommended?userId=${userId}`),
  getOpportunity: (id: string, viewerPostcode?: string) =>
    request<{ opportunity: DecoratedOpportunity; attendees: Attendee[] }>(
      "GET",
      `/api/opportunities/${id}?viewerPostcode=${encodeURIComponent(viewerPostcode || "")}`,
    ),
  uploadImage: (userId: string, dataUrl: string) =>
    request<{ image_url: string }>("POST", "/api/images", { user_id: userId, data_url: dataUrl }),
  createOpportunity: (payload: Record<string, unknown>) =>
    request<{ opportunity: DecoratedOpportunity }>("POST", "/api/opportunities", payload),
  join: (oppId: string, userId: string) =>
    request<{ signup: Signup }>("POST", `/api/opportunities/${oppId}/join`, { user_id: userId }),
  cancelSignup: (signupId: string) => request<{ signup: Signup }>("POST", `/api/signups/${signupId}/cancel`),
  markDone: (signupId: string) =>
    request<{ signup: Signup; message: string }>("POST", `/api/signups/${signupId}/done`),
  completeOpportunity: (oppId: string, attendeeSignupIds: string[]) =>
    request<{ message: string }>("POST", `/api/opportunities/${oppId}/complete`, {
      attendee_signup_ids: attendeeSignupIds,
    }),
  getOffers: () => request<{ offers: Offer[] }>("GET", "/api/offers"),
  redeem: (offerId: string, userId: string) =>
    request<{ redemption: { id: string; voucher_code: string } }>("POST", `/api/offers/${offerId}/redeem`, {
      user_id: userId,
    }),
};
