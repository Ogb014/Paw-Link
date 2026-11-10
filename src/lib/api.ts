import { supabase } from "../lib/supabase";
import type { Kennel, Dog, DogPhoto, DogVideo, HealthRecord, BreedingRecord, Litter, BreederRating, Conversation, Message, MessageAttachment, BreederDashboardConfig, BreederWithRating } from "../types/database";

export async function fetchKennel(userId: string): Promise<Kennel | null> {
  const { data, error } = await supabase
    .from("kennels")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Kennel | null;
}

export async function createKennel(kennel: {
  owner_id: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
}): Promise<Kennel> {
  const { data, error } = await supabase
    .from("kennels")
    .insert(kennel)
    .select()
    .single();
  if (error) throw error;
  return data as Kennel;
}

export async function fetchDogs(kennelId: string): Promise<Dog[]> {
  const { data, error } = await supabase
    .from("dogs")
    .select("*")
    .eq("kennel_id", kennelId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Dog[];
}

export async function fetchDog(dogId: string): Promise<Dog | null> {
  const { data, error } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", dogId)
    .maybeSingle();
  if (error) throw error;
  return data as Dog | null;
}

export async function createDog(dog: Partial<Dog> & { kennel_id: string; name: string; breed: string }): Promise<Dog> {
  const { data, error } = await supabase
    .from("dogs")
    .insert(dog)
    .select()
    .single();
  if (error) throw error;
  return data as Dog;
}

export async function updateDog(dogId: string, updates: Partial<Dog>): Promise<Dog> {
  const { data, error } = await supabase
    .from("dogs")
    .update(updates)
    .eq("id", dogId)
    .select()
    .single();
  if (error) throw error;
  return data as Dog;
}

export async function deleteDog(dogId: string): Promise<void> {
  const { error } = await supabase.from("dogs").delete().eq("id", dogId);
  if (error) throw error;
}

export async function fetchDogPhotos(dogId: string): Promise<DogPhoto[]> {
  const { data, error } = await supabase
    .from("dog_photos")
    .select("*")
    .eq("dog_id", dogId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DogPhoto[];
}

export async function uploadDogPhoto(
  userId: string,
  dogId: string,
  file: File
): Promise<DogPhoto> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${dogId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("dog-photos")
    .upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;

  const { data: urlData } = await supabase.storage
    .from("dog-photos")
    .createSignedUrl(path, 31536000);

  const url = urlData?.signedUrl ?? "";

  const { data, error } = await supabase
    .from("dog_photos")
    .insert({
      dog_id: dogId,
      storage_path: path,
      url,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DogPhoto;
}

export async function setPrimaryPhoto(dogId: string, photoId: string): Promise<void> {
  await supabase.from("dog_photos").update({ is_primary: false }).eq("dog_id", dogId);
  const { error } = await supabase
    .from("dog_photos")
    .update({ is_primary: true })
    .eq("id", photoId)
    .eq("dog_id", dogId);
  if (error) throw error;
}

export async function deleteDogPhoto(photo: DogPhoto): Promise<void> {
  const { error: dbError } = await supabase
    .from("dog_photos")
    .delete()
    .eq("id", photo.id);
  if (dbError) throw dbError;

  await supabase.storage.from("dog-photos").remove([photo.storage_path]);
}

export async function fetchHealthRecords(dogId: string): Promise<HealthRecord[]> {
  const { data, error } = await supabase
    .from("health_records")
    .select("*")
    .eq("dog_id", dogId)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as HealthRecord[];
}

export async function createHealthRecord(record: Partial<HealthRecord> & { dog_id: string; record_type: string; title: string }): Promise<HealthRecord> {
  const { data, error } = await supabase
    .from("health_records")
    .insert(record)
    .select()
    .single();
  if (error) throw error;
  return data as HealthRecord;
}

export async function updateHealthRecord(id: string, updates: Partial<HealthRecord>): Promise<HealthRecord> {
  const { data, error } = await supabase
    .from("health_records")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as HealthRecord;
}

export async function deleteHealthRecord(id: string): Promise<void> {
  const { error } = await supabase.from("health_records").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchBreedingRecords(dogId: string): Promise<BreedingRecord[]> {
  const { data, error } = await supabase
    .from("breeding_records")
    .select("*")
    .eq("dog_id", dogId)
    .order("record_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BreedingRecord[];
}

export async function createBreedingRecord(record: Partial<BreedingRecord> & { dog_id: string; record_type: string }): Promise<BreedingRecord> {
  const { data, error } = await supabase
    .from("breeding_records")
    .insert(record)
    .select()
    .single();
  if (error) throw error;
  return data as BreedingRecord;
}

export async function updateBreedingRecord(id: string, updates: Partial<BreedingRecord>): Promise<BreedingRecord> {
  const { data, error } = await supabase
    .from("breeding_records")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as BreedingRecord;
}

export async function deleteBreedingRecord(id: string): Promise<void> {
  const { error } = await supabase.from("breeding_records").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchLitters(kennelId: string): Promise<Litter[]> {
  const { data, error } = await supabase
    .from("litters")
    .select("*")
    .eq("kennel_id", kennelId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Litter[];
}

export async function createLitter(litter: Partial<Litter> & { kennel_id: string }): Promise<Litter> {
  const { data, error } = await supabase
    .from("litters")
    .insert(litter)
    .select()
    .single();
  if (error) throw error;
  return data as Litter;
}

export async function updateLitter(id: string, updates: Partial<Litter>): Promise<Litter> {
  const { data, error } = await supabase
    .from("litters")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Litter;
}

export async function deleteLitter(id: string): Promise<void> {
  const { error } = await supabase.from("litters").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchUpcomingCare(kennelId: string): Promise<HealthRecord[]> {
  const { data, error } = await supabase
    .from("health_records")
    .select(`
      *,
      dogs!inner(kennel_id)
    `)
    .eq("dogs.kennel_id", kennelId)
    .not("next_due_date", "is", null)
    .order("next_due_date", { ascending: true })
    .limit(10);
  if (error) throw error;
  return (data ?? []) as HealthRecord[];
}

// ============================================================
// Dog Videos
// ============================================================

export async function fetchDogVideos(dogId: string): Promise<DogVideo[]> {
  const { data, error } = await supabase
    .from("dog_videos")
    .select("*")
    .eq("dog_id", dogId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DogVideo[];
}

export async function uploadDogVideo(
  userId: string,
  dogId: string,
  file: File,
  title?: string
): Promise<DogVideo> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${dogId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("dog-videos")
    .upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;

  const { data: urlData } = await supabase.storage
    .from("dog-videos")
    .createSignedUrl(path, 31536000);

  const url = urlData?.signedUrl ?? "";

  const { data, error } = await supabase
    .from("dog_videos")
    .insert({
      dog_id: dogId,
      storage_path: path,
      url,
      title: title ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DogVideo;
}

export async function deleteDogVideo(video: DogVideo): Promise<void> {
  const { error: dbError } = await supabase
    .from("dog_videos")
    .delete()
    .eq("id", video.id);
  if (dbError) throw dbError;

  await supabase.storage.from("dog-videos").remove([video.storage_path]);
}

// ============================================================
// Breeder Ratings
// ============================================================

export async function fetchBreederRatings(breederId: string): Promise<BreederRating[]> {
  const { data, error } = await supabase
    .from("breeder_ratings")
    .select("*")
    .eq("breeder_id", breederId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BreederRating[];
}

export async function fetchBreederRatingStats(breederId: string): Promise<{ avg: number; count: number }> {
  const { data, error } = await supabase
    .from("breeder_ratings")
    .select("rating")
    .eq("breeder_id", breederId);
  if (error) throw error;
  const ratings = (data ?? []) as { rating: number }[];
  if (ratings.length === 0) return { avg: 0, count: 0 };
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return { avg: sum / ratings.length, count: ratings.length };
}

export async function upsertBreederRating(
  breederId: string,
  buyerId: string,
  rating: number,
  review?: string
): Promise<void> {
  const { error } = await supabase
    .from("breeder_ratings")
    .upsert({
      breeder_id: breederId,
      buyer_id: buyerId,
      rating,
      review: review?.trim() || null,
    }, { onConflict: "breeder_id,buyer_id" });
  if (error) throw error;
}

// ============================================================
// Marketplace - Browse Breeders
// ============================================================

export async function fetchBreeders(search?: string): Promise<BreederWithRating[]> {
  let query = supabase
    .from("profiles")
    .select(`
      id, full_name, avatar_url, bio, location,
      kennels!kennels_owner_id_fkey(id, name, slug, description, location, website, logo_url, is_public, phone, email, external_link)
    `)
    .eq("role", "breeder");

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,bio.ilike.%${search}%,location.ilike.%${search}%`);
  }

  const { data: profiles, error } = await query;
  if (error) throw error;

  const breederIds = (profiles ?? []).map((p) => p.id);
  if (breederIds.length === 0) return [];

  const { data: ratings } = await supabase
    .from("breeder_ratings")
    .select("breeder_id, rating")
    .in("breeder_id", breederIds);

  const ratingMap = new Map<string, { sum: number; count: number }>();
  for (const r of ratings ?? []) {
    const existing = ratingMap.get(r.breeder_id) ?? { sum: 0, count: 0 };
    existing.sum += r.rating;
    existing.count += 1;
    ratingMap.set(r.breeder_id, existing);
  }

  return (profiles ?? []).map((p) => {
    const stats = ratingMap.get(p.id);
    const kennelData = p.kennels as unknown as Kennel[] | Kennel | null;
    const kennel = Array.isArray(kennelData) ? kennelData[0] : kennelData;
    return {
      id: p.id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      bio: p.bio,
      location: p.location,
      kennel: kennel && kennel.is_public ? kennel : null,
      avg_rating: stats ? stats.sum / stats.count : 0,
      rating_count: stats?.count ?? 0,
    };
  });
}

// ============================================================
// Conversations & Messages
// ============================================================

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`breeder_id.eq.${userId},buyer_id.eq.${userId}`)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Conversation[];
}

export async function findOrCreateConversation(breederId: string, buyerId: string, kennelId?: string): Promise<Conversation> {
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("breeder_id", breederId)
    .eq("buyer_id", buyerId)
    .maybeSingle();

  if (existing) return existing as Conversation;

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      breeder_id: breederId,
      buyer_id: buyerId,
      kennel_id: kennelId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Conversation;
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content.trim() || null,
    })
    .select()
    .single();
  if (error) throw error;

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return data as Message;
}

export async function fetchMessageAttachments(messageIds: string[]): Promise<MessageAttachment[]> {
  if (messageIds.length === 0) return [];
  const { data, error } = await supabase
    .from("message_attachments")
    .select("*")
    .in("message_id", messageIds);
  if (error) throw error;
  return (data ?? []) as MessageAttachment[];
}

export async function sendMessageWithMedia(
  conversationId: string,
  senderId: string,
  content: string,
  files: File[]
): Promise<Message> {
  const message = await sendMessage(conversationId, senderId, content);

  for (const file of files) {
    const isVideo = file.type.startsWith("video/");
    const ext = file.name.split(".").pop();
    const path = `${senderId}/${conversationId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("message-media")
      .upload(path, file, { contentType: file.type });
    if (uploadError) throw uploadError;

    const { data: urlData } = await supabase.storage
      .from("message-media")
      .createSignedUrl(path, 31536000);

    const url = urlData?.signedUrl ?? "";

    const { error: attachError } = await supabase
      .from("message_attachments")
      .insert({
        message_id: message.id,
        storage_path: path,
        url,
        media_type: isVideo ? "video" : "photo",
      });
    if (attachError) throw attachError;
  }

  return message;
}

// ============================================================
// Breeder Dashboard Config
// ============================================================

export async function fetchDashboardConfig(breederId: string): Promise<BreederDashboardConfig | null> {
  const { data, error } = await supabase
    .from("breeder_dashboard_configs")
    .select("*")
    .eq("breeder_id", breederId)
    .maybeSingle();
  if (error) throw error;
  return data as BreederDashboardConfig | null;
}

export async function saveDashboardConfig(
  breederId: string,
  widgets: { id: string; type: string; visible: boolean; order: number }[],
  layout?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from("breeder_dashboard_configs")
    .upsert({
      breeder_id: breederId,
      widgets,
      layout: layout ?? {},
    }, { onConflict: "breeder_id" });
  if (error) throw error;
}
