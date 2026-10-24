export type UserRole = "breeder" | "buyer" | "service_seeker";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole | null;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Kennel {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  website: string | null;
  logo_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Dog {
  id: string;
  kennel_id: string;
  name: string;
  breed: string;
  sex: "male" | "female" | null;
  date_of_birth: string | null;
  color: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  microchip_number: string | null;
  registration_number: string | null;
  status: string | null;
  is_listed: boolean;
  listing_type: string | null;
  listing_price: number | null;
  bio: string | null;
  profile_photo_url: string | null;
  photos: string[] | null;
  custom_fields: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}
