# CN7-01 — Marketplace mesajlaşma (Supabase Realtime)

## Ne yapıldı (kod)

- Web + app: `useMarketplaceConversationRealtime` — `postgres_changes` INSERT on `marketplace_messages`
- Clerk JWT template **`supabase`** → `createAuthenticatedBrowserSupabase` + `realtime.setAuth(token)`
- RLS: katılımcılar `SELECT` (`is_marketplace_conversation_participant`)
- Mesaj **insert** server action (service role); Realtime sadece **dinleme** (RLS + JWT)

## 1. Supabase SQL (zorunlu)

Sırayla SQL Editor’de çalıştır:

1. `012_coach_network.sql` (henüz yoksa)
2. **`013_marketplace_messages_realtime.sql`** — publication + `replica identity full`

Doğrulama:

```sql
select schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
  and tablename = 'marketplace_messages';
```

Bir satır dönmeli.

### Dashboard (alternatif)

**Database → Publications → `supabase_realtime`** → `marketplace_messages` tablosu listede olmalı.  
SQL migration bunu otomatik ekler; Dashboard’dan manuel ekleme de yeterli.

## 2. Clerk JWT template `supabase`

1. Clerk Dashboard → **JWT templates** → **New template** → ad: `supabase`
2. Claims (minimum):

```json
{
  "sub": "{{user.id}}",
  "role": "authenticated"
}
```

`sub` değeri `marketplace_conversation_participants.user_id` ile aynı olmalı (Clerk user id).

## 3. Ortam değişkenleri

### Web (`apps/web`)

| Değişken | Amaç |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Realtime endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser client |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk |
| `CLERK_SECRET_KEY` | Server actions |
| `SUPABASE_SERVICE_ROLE_KEY` | Mesaj insert (server) |

### App (`apps/app`)

Aynı Supabase + Clerk; anon key zaten build’de.

Dokploy: `NEXT_PUBLIC_SUPABASE_ANON_KEY` web için **build arg + runtime**.

## 4. Test

1. İki tarayıcı / sporcu + koç hesabı, aynı `conversation_id`
2. `/athlete/messages/[id]` ve `/coach-network/messages/[id]`
3. Bir taraftan mesaj gönder → diğer tarafta **~1 sn içinde** görünmeli (sayfa yenilemeden)
4. Thread üstünde **Live** yeşil nokta = Realtime `SUBSCRIBED`
5. Turuncu **Reconnecting** = JWT/publication/RLS kontrol et

Realtime kapalıysa mesaj yine gelir: gönderen tarafta anında (server response), karşı taraf `router.refresh` veya yenileme ile.

## 5. Sık hatalar

| Belirti | Çözüm |
|---------|--------|
| Hiç anlık gelmiyor | `013_*.sql` çalıştır; anon key web’de var mı |
| `CHANNEL_ERROR` | Clerk `supabase` template yok veya `sub` yanlış |
| Sadece kendi mesajın | Normal; karşı taraf farklı kullanıcıyla test et |
| Prod’da çalışmıyor | `COACH_NETWORK_ENABLED` + rebuild; Realtime proje ayarı kapalı değil |
