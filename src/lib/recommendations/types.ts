/**
 * Shared types for recommendations. Kept separate so client components
 * can import types without pulling in server-only engine code.
 */
export interface RecommendedAPI {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  logo_url: string | null;
  avg_rating: number | null;
  total_reviews: number | null;
  total_subscribers: number | null;
  organization: { name: string; slug: string; logo_url: string | null } | null;
  category: { name: string; slug: string } | null;
  minPrice?: number;
  maxPrice?: number;
}
