export type ProviderType = 'INDIVIDUAL' | 'BUSINESS';
export type ProviderSort = 'rating' | 'newest';

export interface LocationItem {
  id: string;
  parentId: string | null;
  type: 'PROVINCE' | 'DISTRICT' | 'CITY' | 'TOWN';
  slug: string;
  name: string;
  nameSi?: string | null;
  nameTa?: string | null;
  isActive: boolean;
  parent?: LocationItem | null;
  children?: LocationItem[];
}

export interface LocationListResponse {
  items: LocationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProviderService {
  id: string;
  name: string;
  slug: string;
  categoryId?: string;
  category?: { id: string; name: string; slug: string };
}

export interface ProviderProfileSummary {
  id: string;
  providerType: ProviderType;
  displayName: string;
  description: string | null;
  experienceYears: number;
  profileImageId: string | null;
  verificationStatus: 'APPROVED';
  averageRating: string | number;
  totalReviews: number;
  profileCompletion: number;
  providerServices: Array<{ id: string; service: ProviderService }>;
  serviceAreas: Array<{ id: string; location: LocationItem }>;
  businessDetails?: {
    businessName: string;
  } | null;
}

export interface PublicProviderProfile extends ProviderProfileSummary {
  businessDetails?: {
    businessName: string;
    registrationNumber?: string | null;
    businessAddress?: string | null;
    contactPersonName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  } | null;
  providerServices: Array<{
    id: string;
    description: string | null;
    priceFrom: string | null;
    priceTo: string | null;
    currency: string;
    service: ProviderService;
  }>;
  portfolio: Array<{
    id: string;
    title: string | null;
    description: string | null;
    sortOrder: number;
    media: Array<{
      id: string;
      sortOrder: number;
      mediaFile: {
        id: string;
        objectKey: string;
        mimeType: string;
      };
    }>;
  }>;
}

export interface ProviderSearchResponse {
  items: ProviderProfileSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
