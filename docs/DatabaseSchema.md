# OhHike CoachOS - Veritabanı Şeması (v4.0 — MVP)

**Güncelleme:** 2026-07-07  
**Veritabanı:** MongoDB (Mongoose)  
**Auth:** Custom Auth (JWT)  
**Veri modeli:** Organization → Team → Athlete → Session → Check-in

---

## 1. Genel Yaklaşım

- MongoDB document-based yapı kullanılır.
- Her collection organizasyon izolasyonuna sahiptir (`organizationId` alanı).
- Kullanıcılar `users` collection'ında tutulur.
- Mongoose schema'ları ile validation sağlanır.

---

## 2. Collections

### users
```javascript
{
  email: String,         // unique
  passwordHash: String,
  displayName: String,
  avatarUrl: String,
  phone: String,
  locale: String,        // default: "tr"
  timezone: String,      // default: "Europe/Istanbul"
  lastActiveAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### organizations
```javascript
{
  name: String,          // required
  slug: String,          // unique, required
  type: String,          // enum: club, academy, individual_coach, school_team, other
  logoUrl: String,
  country: String,
  city: String,
  createdBy: ObjectId,   // ref: users
  createdAt: Date,
  updatedAt: Date
}
```

### organization_members
```javascript
{
  organizationId: ObjectId,  // ref: organizations
  userId: ObjectId,          // ref: users
  role: String,              // enum: owner, admin, head_coach, assistant_coach, analyst, physiotherapist, nutritionist, athlete, viewer
  isActive: Boolean,         // default: true
  invitedBy: String,
  joinedAt: Date
}
// unique: { organizationId, userId }
```

### teams
```javascript
{
  organizationId: ObjectId,
  name: String,
  sportType: String,     // enum: football, basketball, volleyball, running, fitness, tennis, swimming, other
  ageGroup: String,      // U15, U17, Senior vb.
  level: String,
  defaultFormation: String,
  seasonGoal: String,
  weeklyTrainingCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### team_staff
```javascript
{
  teamId: ObjectId,
  userId: String,
  role: String,
  assignedBy: String,
  createdAt: Date
}
// unique: { teamId, userId, role }
```

### athletes
```javascript
{
  organizationId: ObjectId,
  teamId: ObjectId,
  userId: String,        // nullable — sporcu henüz claim etmemiş olabilir
  firstName: String,
  lastName: String,
  displayName: String,
  email: String,
  phone: String,
  number: Number,        // forma numarası
  position: String,
  birthDate: Date,
  heightCm: Number,
  weightKg: Number,
  dominantSide: String,
  status: String,        // enum: active, injured, recovery, inactive
  notes: String,
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### athlete_invites
```javascript
{
  athleteId: ObjectId,
  organizationId: ObjectId,
  teamId: ObjectId,
  email: String,
  token: String,         // unique
  invitedBy: String,
  acceptedBy: String,
  expiresAt: Date,
  acceptedAt: Date,
  createdAt: Date
}
```

### sessions
```javascript
{
  organizationId: ObjectId,
  teamId: ObjectId,
  type: String,          // enum: team_training, match, friendly_match, recovery, test_day, other
  status: String,        // enum: draft, planned, in_progress, completed, cancelled
  title: String,
  description: String,
  opponent: String,
  location: String,
  scheduledAt: Date,
  startedAt: Date,
  endedAt: Date,
  plannedDurationMin: Number,
  actualDurationMin: Number,
  focusArea: String,
  plannedIntensity: Number,  // 1-10
  coachNotes: String,
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### session_attendance
```javascript
{
  sessionId: ObjectId,
  athleteId: ObjectId,
  attended: Boolean,
  absenceReason: String,
  minutesPlayed: Number,
  rpe: Number,           // 1-10
  athleteNote: String,
  coachNote: String,
  painReported: Boolean,
  painArea: String,
  createdAt: Date,
  updatedAt: Date
}
// unique: { sessionId, athleteId }
```

### training_blocks
```javascript
{
  sessionId: ObjectId,
  title: String,
  description: String,
  orderIndex: Number,
  plannedDurationMin: Number,
  actualDurationMin: Number,
  intensity: Number,     // 1-10
  completed: Boolean,
  notes: String,
  createdAt: Date
}
```

### wellness_checkins
```javascript
{
  organizationId: ObjectId,
  teamId: ObjectId,
  athleteId: ObjectId,
  checkinDate: Date,
  sleepHours: Number,
  sleepQuality: Number,     // 1-10
  energyScore: Number,      // 1-10
  sorenessScore: Number,    // 1-10
  stressScore: Number,      // 1-10
  motivationScore: Number,  // 1-10
  readinessScore: Number,   // 0-100
  painReported: Boolean,
  painArea: String,
  illnessSymptoms: Boolean,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
// unique: { athleteId, checkinDate }
```

### nutrition_logs
```javascript
{
  organizationId: ObjectId,
  teamId: ObjectId,
  athleteId: ObjectId,
  logDate: Date,
  waterMl: Number,
  targetWaterMl: Number,
  breakfastLogged: Boolean,
  lunchLogged: Boolean,
  dinnerLogged: Boolean,
  snackLogged: Boolean,
  preTrainingMeal: Boolean,
  postTrainingMeal: Boolean,
  proteinGoalMet: Boolean,
  athleteNotes: String,
  createdAt: Date,
  updatedAt: Date
}
// unique: { athleteId, logDate }
```

### personal_trainings
```javascript
{
  organizationId: ObjectId,
  teamId: ObjectId,
  athleteId: ObjectId,
  title: String,
  trainingType: String,
  startedAt: Date,
  durationMin: Number,
  distanceKm: Number,
  rpe: Number,           // 1-10
  notes: String,
  coachReviewed: Boolean,
  coachNote: String,
  createdAt: Date
}
```

---

## 3. Kaldırılan Tablolar (Eski Supabase yapısından)

Aşağıdaki tablolar MVP'de **yok**:

- `wearable_connections`, `wearable_daily_summaries`, `wearable_activities` (Wearables kaldırıldı)
- `ai_reports`, `ai_report_sections` (AI Reports kaldırıldı)
- `documents`, `document_embeddings`, `assistant_messages` (Team Memory/RAG kaldırıldı)
- `coach_marketplace_profiles`, `coaching_packages`, `coach_network_applications`, `coach_network_offers`, `remote_coaching_relationships` (Coach Network kaldırıldı)
- `billing_entitlements` (Billing ertelendi)
- `drills` (Drill kütüphanesi kaldırıldı)