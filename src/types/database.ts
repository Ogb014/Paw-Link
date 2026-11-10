export type UserRole = "breeder" | "buyer" | "service_seeker";

export type DogStatus = "active" | "inactive" | "deceased" | "archived";

export type HealthRecordType =
  | "vaccination"
  | "medication"
  | "illness"
  | "vet_visit"
  | "test_result"
  | "allergy"
  | "deworming"
  | "weight"
  | "other";

export type BreedingRecordType = "heat_cycle" | "mating" | "pregnancy";

export type BreedingStatus =
  | "observed"
  | "planned"
  | "mated"
  | "confirmed_pregnant"
  | "whelped"
  | "unsuccessful";

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
  phone: string | null;
  email: string | null;
  external_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dog {
  id: string;
  kennel_id: string;
  name: string;
  call_name: string | null;
  breed: string;
  breed_secondary: string | null;
  sex: "male" | "female" | null;
  date_of_birth: string | null;
  estimated_age: string | null;
  color: string | null;
  markings: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  microchip_number: string | null;
  registration_number: string | null;
  pedigree_info: string | null;
  status: DogStatus | null;
  is_listed: boolean;
  listing_type: string | null;
  listing_price: number | null;
  available_for_sale: boolean;
  available_for_breeding: boolean;
  sale_price: number | null;
  breeding_fee: number | null;
  is_archived: boolean;
  is_public: boolean;
  bio: string | null;
  profile_photo_url: string | null;
  photos: string[] | null;
  custom_fields: Record<string, unknown> | null;
  acquisition_date: string | null;
  acquisition_source: string | null;
  sire_id: string | null;
  dam_id: string | null;
  temperament_notes: string | null;
  training_notes: string | null;
  socialisation_notes: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DogPhoto {
  id: string;
  dog_id: string;
  storage_path: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface DogVideo {
  id: string;
  dog_id: string;
  storage_path: string;
  url: string;
  title: string | null;
  sort_order: number;
  created_at: string;
}

export interface HealthRecord {
  id: string;
  dog_id: string;
  record_type: HealthRecordType;
  title: string;
  date: string;
  next_due_date: string | null;
  veterinarian: string | null;
  details: string | null;
  dosage: string | null;
  start_date: string | null;
  end_date: string | null;
  result: string | null;
  attachment_url: string | null;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface BreedingRecord {
  id: string;
  dog_id: string;
  sire_id: string | null;
  record_type: BreedingRecordType;
  record_date: string;
  expected_whelping_date: string | null;
  actual_whelping_date: string | null;
  status: BreedingStatus;
  veterinary_confirmation: boolean;
  notes: string | null;
  litter_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Litter {
  id: string;
  kennel_id: string;
  name: string | null;
  sire_id: string | null;
  dam_id: string | null;
  breeding_record_id: string | null;
  mating_date: string | null;
  birth_date: string | null;
  puppies_born: number;
  puppies_alive: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BreederRating {
  id: string;
  breeder_id: string;
  buyer_id: string;
  rating: number;
  review: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  breeder_id: string;
  buyer_id: string;
  kennel_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  created_at: string;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  storage_path: string;
  url: string;
  media_type: "photo" | "video";
  created_at: string;
}

export interface DashboardWidget {
  id: string;
  type: string;
  visible: boolean;
  order: number;
}

export interface BreederDashboardConfig {
  id: string;
  breeder_id: string;
  widgets: DashboardWidget[];
  layout: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BreederWithRating {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  kennel: Kennel | null;
  avg_rating: number;
  rating_count: number;
}
