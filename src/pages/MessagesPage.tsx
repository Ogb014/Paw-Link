import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { MessageSquare, Send, Paperclip, ArrowLeft, Loader as Loader2, CircleAlert as AlertCircle, X, Image as ImageIcon, Video, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  fetchConversations, findOrCreateConversation, fetchMessages,
  sendMessageWithMedia, fetchMessageAttachments,
  fetchBreederRatingStats, upsertBreederRating,
} from "../lib/api";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/States";
import type { Conversation, Message, MessageAttachment } from "../types/database";

export function MessagesPage() {
  const { user } = useAuth();
  const { conversationId } = useParams<{ conversationId: string }>();
  const [searchParams] = useSearchParams();
  const newBreederId = searchParams.get("breeder");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Map<string, MessageAttachment[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const convs = await fetchConversations(user.id);
        setConversations(convs);

        if (conversationId) {
          const conv = convs.find((c) => c.id === conversationId);
          if (conv) {
            setActiveConv(conv);
            await loadMessages(conv.id);
          }
        } else if (newBreederId) {
          const conv = await findOrCreateConversation(newBreederId, user.id);
          setActiveConv(conv);
          setConversations((prev) => prev.some((c) => c.id === conv.id) ? prev : [conv, ...prev]);
          await loadMessages(conv.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, conversationId, newBreederId]);

  async function loadMessages(convId: string) {
    try {
      const msgs = await fetchMessages(convId);
      setMessages(msgs);

      if (msgs.length > 0) {
        const msgIds = msgs.map((m) => m.id);
        const atts = await fetchMessageAttachments(msgIds);
        const attMap = new Map<string, MessageAttachment[]>();
        for (const att of atts) {
          const list = attMap.get(att.message_id) ?? [];
          list.push(att);
          attMap.set(att.message_id, list);
        }
        setAttachments(attMap);
      } else {
        setAttachments(new Map());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!user || !activeConv) return;
    if (!text.trim() && files.length === 0) return;

    setSending(true);
    setError(null);
    try {
      await sendMessageWithMedia(activeConv.id, user.id, text, files);
      setText("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadMessages(activeConv.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;
    const valid = Array.from(selected).filter((f) => {
      if (f.type.startsWith("image/") || f.type.startsWith("video/")) return true;
      setError("Only image and video files are supported.");
      return false;
    });
    setFiles((prev) => [...prev, ...valid]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  if (loading) return <LoadingState message="Loading messages..." />;
  if (error && !activeConv) return <ErrorState message={error} />;

  return (
    <div className="animate-fade-in space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Messages</h1>

      <div className="flex h-[calc(100vh-180px)] gap-4 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-neutral-100">
        {/* Conversation list */}
        <div className={`flex flex-col border-r border-neutral-100 ${activeConv ? "hidden w-72 shrink-0 md:flex" : "w-full md:w-72"}`}>
          <div className="border-b border-neutral-100 px-4 py-3">
            <p className="text-sm font-semibold text-neutral-700">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-neutral-400">No conversations yet.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConv(conv);
                    loadMessages(conv.id);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeConv?.id === conv.id ? "bg-primary-50" : "hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {conv.breeder_id === user?.id ? "Buyer" : "Breeder"}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        {activeConv ? (
          <div className="flex flex-1 flex-col">
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
              <button onClick={() => setActiveConv(null)} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-900">
                  {activeConv.breeder_id === user?.id ? "Buyer conversation" : "Breeder conversation"}
                </p>
                <p className="text-xs text-neutral-500">Started {new Date(activeConv.created_at).toLocaleDateString()}</p>
              </div>
              {activeConv.breeder_id !== user?.id && (
                <RatingButton breederId={activeConv.breeder_id} buyerId={user?.id ?? ""} />
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-neutral-400">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === user?.id;
                  const atts = attachments.get(msg.id) ?? [];
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-900"}`}>
                        {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                        {atts.length > 0 && (
                          <div className={`mt-2 grid gap-2 ${atts.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                            {atts.map((att) => (
                              <div key={att.id} className="overflow-hidden rounded-lg">
                                {att.media_type === "photo" ? (
                                  <img src={att.url} alt="Shared photo" className="max-h-48 w-full object-cover" />
                                ) : (
                                  <video src={att.url} controls className="max-h-48 w-full object-cover" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <p className={`mt-1 text-xs ${isMine ? "text-primary-100" : "text-neutral-400"}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-neutral-100 p-3">
              {error && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-error-50 px-3 py-2 text-xs text-error-700">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {error}
                  <button onClick={() => setError(null)} className="ml-auto"><X className="h-3.5 w-3.5" /></button>
                </div>
              )}

              {files.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700">
                      {file.type.startsWith("video/") ? <Video className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                      <span className="max-w-[120px] truncate">{file.name}</span>
                      <button onClick={() => removeFile(idx)} className="text-neutral-400 hover:text-error-600"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="msg-file-upload"
                />
                <label htmlFor="msg-file-upload" className="cursor-pointer rounded-xl p-2.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
                  <Paperclip className="h-5 w-5" />
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  className="input-field flex-1 resize-none min-h-[44px] max-h-32"
                  placeholder="Type a message..."
                />
                <button onClick={handleSend} disabled={sending || (!text.trim() && files.length === 0)} className="btn-primary shrink-0 px-3.5">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden flex-1 items-center justify-center md:flex">
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a conversation from the list, or start a new one from a breeder's profile."
            />
          </div>
        )}
      </div>
    </div>
  );
}

function RatingButton({ breederId, buyerId }: { breederId: string; buyerId: string }) {
  const [stats, setStats] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });
  const [showRater, setShowRater] = useState(false);
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBreederRatingStats(breederId).then(setStats).catch(() => {});
  }, [breederId]);

  async function handleRate() {
    if (rating === 0) return;
    setSaving(true);
    try {
      await upsertBreederRating(breederId, buyerId, rating);
      const s = await fetchBreederRatingStats(breederId);
      setStats(s);
      setShowRater(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setShowRater((v) => !v)} className="flex items-center gap-1.5 rounded-lg bg-accent-50 px-2.5 py-1.5 text-xs font-medium text-accent-700 hover:bg-accent-100 transition-colors">
        <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
        {stats.count > 0 ? stats.avg.toFixed(1) : "Rate"}
      </button>
      {showRater && (
        <div className="absolute right-0 top-full mt-2 z-20 rounded-xl bg-white p-4 shadow-card ring-1 ring-neutral-100">
          <p className="text-sm font-semibold text-neutral-900 mb-2">Rate this breeder</p>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)}>
                <Star className={`h-6 w-6 ${s <= rating ? "fill-accent-400 text-accent-400" : "text-neutral-300 hover:text-accent-300"}`} />
              </button>
            ))}
          </div>
          <button onClick={handleRate} disabled={saving || rating === 0} className="btn-primary w-full text-xs">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
}
