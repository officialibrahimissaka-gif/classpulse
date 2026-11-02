# Data dictionary

Phase 3 design baseline: 1 November 2026. Proposed contracts; no application implementation or production migration.

## DD-001 — Conventions and ownership

[prisma/schema.prisma](prisma/schema.prisma) is the machine-readable relational model. [prisma/constraints.sql](prisma/constraints.sql) is mandatory for RLS, checks, temporal exclusions and protected history. A Prisma-only deployment is incomplete. Tenant is the only routing/provisioning root; its id is its ownership key and RLS predicate. Every other model has required tenantId, a composite `(tenantId,id)` primary key and explicit Tenant FK. No global customer Person/Identity table exists.

All FK relations include tenantId; Restrict is the deletion/update default. Business-code uniqueness is tenant-scoped, with the listed parent keys where needed. UUIDs are identifiers, not authorization tokens. Object/audit/external-mapping references use a registered typed domain lookup when a relational FK would outlive a deleted target; such references cannot grant access. Approval targets use real typed foreign keys and exactly-one checks instead.

S1 internal metadata; S2 personal/commercial confidential; S3 restricted. Model classification is a maximum, and field/record permissions remain mandatory. Hashes/pseudonymous IDs that can be linked back to people remain protected; they are not guaranteed anonymous. Bytes are encrypted envelopes, never JSON base64 write fields through generic APIs. Monetary Decimals serialize as strings, BigInt as integer strings, UUID as UUID strings, date as YYYY-MM-DD, instants as RFC3339 UTC. JSON fields are only versioned validated configuration or evidence metadata; normalize relationship, ledger and financial records.

Retention classes: operational/contact/candidate records use approved T-OPS/T-PERSON; employment records T-HR; pay/finance records approved T-PAY/finance schedule; audit T-AUDIT; generated files/snapshots T-REPORT seven-day default; import/error/staging maximum 30-day default; credentials T-SECRET. These are proposed service defaults from the PRD and require lawful record-purpose/entity schedules. No new statutory retention rule is invented. Erasure, holds and backup tombstones apply independently of module state.

Generic base fields below exist on every tenant table, including append-only records. Append-only guard prevents ordinary archival/soft-delete edits on immutable evidence; approved retention deletes/pseudonymization use the separate maintenance path and audit, never a business PATCH.

| Shared field | Type | Meaning |
|---|---|---|
| id | String @db.Uuid | Immutable opaque record UUID; unique with tenantId, never recycled. |
| tenantId | String @db.Uuid | Required owning tenant; composite identity/FK and forced RLS boundary. |
| version | Int  | Optimistic concurrency revision; every allowed mutation increments exactly once. |
| createdAt | DateTime @db.Timestamptz(6) | UTC creation/recording instant; immutable. |
| updatedAt | DateTime @db.Timestamptz(6) | UTC last allowed mutation; database trigger sets it on updates. |
| archivedAt | DateTime? @db.Timestamptz(6) | UTC archival instant; stops ordinary active views without erasing history. |
| deletedAt | DateTime? @db.Timestamptz(6) | Logical deletion instant; not physical erasure or a substitute for retention. |

## Tenant (routing/provisioning root)

Tenant is the only root model and has no tenantId FK to itself. Its own id is the RLS ownership predicate. Provisioning/closure uses a separately authorized operator path, not generic tenant CRUD. Tenant is protected internal company metadata; name can contain confidential customer business information.

| Field | Type / key | Meaning |
|---|---|---|
| id | UUID primary key | Immutable owning tenant identifier |
| slug | varchar(80), globally unique | Non-personal regional routing key; never an authorization grant |
| name | varchar(240) | Company display name, scoped to authorized tenant context |
| residencyCell | varchar(80) | Approved home cell, changed only through controlled relocation |
| status | varchar(30) | Tenant lifecycle/security/commercial projection; current policy remains authoritative |
| entitlementRevision | integer, default 1 | Authoritative commercial-policy revision and module-state fence |
| createdAt | timestamptz(6) | Creation instant, immutable |
| updatedAt | timestamptz(6) | Last controlled root update |

## LegalEntity

Domain: **Tenancy**. Table: `legal_entity`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,code)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| code | `String @db.VarChar(40)` | No | code; bounded typed business value, allowlisted where a code. |
| name | `String @db.VarChar(240)` | No | name; bounded typed business value, allowlisted where a code. |
| countryCode | `String @db.Char(2)` | No | country code; bounded typed business value, allowlisted where a code. |
| authorityCode | `String @db.VarChar(80)` | No | authority code; bounded typed business value, allowlisted where a code. |
| timeZone | `String @db.VarChar(80)` | No | time zone; bounded typed business value, allowlisted where a code. |
| defaultCurrency | `String @db.Char(3)` | No | default currency; bounded typed business value, allowlisted where a code. |

## Team

Domain: **Tenancy**. Table: `team`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,code)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| code | `String @db.VarChar(60)` | No | code; bounded typed business value, allowlisted where a code. |
| name | `String @db.VarChar(160)` | No | name; bounded typed business value, allowlisted where a code. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |
| parentId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,parentId)` → Team `(tenantId,id)`; record/context permission independently required. |

## WorkCalendar

Domain: **Global configuration**. Table: `work_calendar`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,entityId,name)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| name | `String @db.VarChar(160)` | No | name; bounded typed business value, allowlisted where a code. |
| timeZone | `String @db.VarChar(80)` | No | time zone; bounded typed business value, allowlisted where a code. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |

## CalendarVersion

Domain: **Global configuration**. Table: `calendar_version`. Sensitivity: **S2**. Lifecycle: **effective**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| validFrom | `DateTime @db.Date` | No | Inclusive business-effective date; not publication/recording date. |
| validTo | `DateTime? @db.Date` | Yes | Exclusive business-effective end; null means unbounded, never zero-length. |
| recordedAt | `DateTime @default(now()) @db.Timestamptz(6)` | No | UTC instant this version became known; used with supersededAt for as-known history. |
| weekMask | `Int @db.SmallInt` | No | week mask; bounded typed business value, allowlisted where a code. |
| sourceReference | `String @db.VarChar(500)` | No | Attributable source/provider/evidence reference; validate type and purpose, not proof of approval by itself. |
| approvalState | `String @db.VarChar(30)` | No | approval state; bounded typed business value, allowlisted where a code. |
| calendarId | `String @db.Uuid` | No | Composite FK `(tenantId,calendarId)` → WorkCalendar `(tenantId,id)`; record/context permission independently required. |
| approvedById | `String? @db.Uuid` | Yes | Composite FK `(tenantId,approvedById)` → Membership `(tenantId,id)`; record/context permission independently required. |
| supersededAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC end of system-time validity. Prior content immutable; correction inserts replacement intervals. |

## CalendarDay

Domain: **Global configuration**. Table: `calendar_day`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,calendarVersionId,localDate)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| localDate | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| kind | `String @db.VarChar(30)` | No | kind; bounded typed business value, allowlisted where a code. |
| workingMinutes | `Int ` | No | working minutes; bounded typed business value, allowlisted where a code. |
| label | `String @db.VarChar(200)` | No | label; bounded typed business value, allowlisted where a code. |
| calendarVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,calendarVersionId)` → CalendarVersion `(tenantId,id)`; record/context permission independently required. |

## JurisdictionPack

Domain: **Compliance**. Table: `jurisdiction_pack`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,packKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| packKey | `String @db.VarChar(100)` | No | pack key; bounded typed business value, allowlisted where a code. |
| regimeCode | `String @db.VarChar(60)` | No | regime code; bounded typed business value, allowlisted where a code. |
| countryCode | `String @db.Char(2)` | No | country code; bounded typed business value, allowlisted where a code. |
| state | `String @default("unavailable") @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |

## RuleVersion

Domain: **Compliance**. Table: `rule_version`. Sensitivity: **S1**. Lifecycle: **effective**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,packId,semanticVersion)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| semanticVersion | `String @db.VarChar(30)` | No | semantic version; bounded typed business value, allowlisted where a code. |
| validFrom | `DateTime @db.Date` | No | Inclusive business-effective date; not publication/recording date. |
| validTo | `DateTime? @db.Date` | Yes | Exclusive business-effective end; null means unbounded, never zero-length. |
| recordedAt | `DateTime @default(now()) @db.Timestamptz(6)` | No | UTC instant this version became known; used with supersededAt for as-known history. |
| sourceUrl | `String @db.VarChar(1000)` | No | source url; bounded typed business value, allowlisted where a code. |
| sourceHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| coverageCode | `String @db.VarChar(100)` | No | coverage code; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| fixtureHash | `String? @db.Char(64)` | Yes | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| packId | `String @db.Uuid` | No | Composite FK `(tenantId,packId)` → JurisdictionPack `(tenantId,id)`; record/context permission independently required. |
| legalReviewerId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,legalReviewerId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| engineeringReviewerId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,engineeringReviewerId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| supersededAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC end of system-time validity. Prior content immutable; correction inserts replacement intervals. |

## ApplicabilityAssignment

Domain: **Compliance**. Table: `applicability_assignment`. Sensitivity: **S2**. Lifecycle: **effective**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| domainCode | `String @db.VarChar(40)` | No | domain code; bounded typed business value, allowlisted where a code. |
| workerCategory | `String @db.VarChar(80)` | No | worker category; bounded typed business value, allowlisted where a code. |
| validFrom | `DateTime @db.Date` | No | Inclusive business-effective date; not publication/recording date. |
| validTo | `DateTime? @db.Date` | Yes | Exclusive business-effective end; null means unbounded, never zero-length. |
| recordedAt | `DateTime @default(now()) @db.Timestamptz(6)` | No | UTC instant this version became known; used with supersededAt for as-known history. |
| decisionReference | `String @db.VarChar(500)` | No | Attributable source/provider/evidence reference; validate type and purpose, not proof of approval by itself. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |
| ruleVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,ruleVersionId)` → RuleVersion `(tenantId,id)`; record/context permission independently required. |
| reviewerId | `String @db.Uuid` | No | Composite FK `(tenantId,reviewerId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| supersededAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC end of system-time validity. Prior content immutable; correction inserts replacement intervals. |

## RetentionPolicy

Domain: **Privacy**. Table: `retention_policy`. Sensitivity: **S1**. Lifecycle: **effective**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,recordClass,policyVersion)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| recordClass | `String @db.VarChar(80)` | No | record class; bounded typed business value, allowlisted where a code. |
| triggerCode | `String @db.VarChar(40)` | No | trigger code; bounded typed business value, allowlisted where a code. |
| retentionDays | `Int ` | No | retention days; bounded typed business value, allowlisted where a code. |
| policyVersion | `Int ` | No | policy version; bounded typed business value, allowlisted where a code. |
| validFrom | `DateTime @db.Date` | No | Inclusive business-effective date; not publication/recording date. |
| validTo | `DateTime? @db.Date` | Yes | Exclusive business-effective end; null means unbounded, never zero-length. |
| recordedAt | `DateTime @default(now()) @db.Timestamptz(6)` | No | UTC instant this version became known; used with supersededAt for as-known history. |
| authorityReference | `String @db.VarChar(500)` | No | Attributable source/provider/evidence reference; validate type and purpose, not proof of approval by itself. |
| entityId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |
| reviewerId | `String @db.Uuid` | No | Composite FK `(tenantId,reviewerId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| supersededAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC end of system-time validity. Prior content immutable; correction inserts replacement intervals. |

## LegalHold

Domain: **Privacy**. Table: `legal_hold`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| reasonCode | `String @db.VarChar(60)` | No | reason code; bounded typed business value, allowlisted where a code. |
| authorityReference | `String @db.VarChar(500)` | No | Attributable source/provider/evidence reference; validate type and purpose, not proof of approval by itself. |
| reviewDueAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| releasedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## HeldRecord

Domain: **Privacy**. Table: `held_record`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. Typed retention target registry, validated by maintenance function; does not expose a generic write API.

Primary key: `(tenantId,id)`. Unique keys: (tenantId,holdId,recordType,recordId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| recordType | `String @db.VarChar(100)` | No | record type; bounded typed business value, allowlisted where a code. |
| recordId | `String @db.Uuid` | No | record id; bounded typed business value, allowlisted where a code. |
| holdId | `String @db.Uuid` | No | Composite FK `(tenantId,holdId)` → LegalHold `(tenantId,id)`; record/context permission independently required. |

## PrivacyRequest

Domain: **Privacy**. Table: `privacy_request`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| requestType | `String @db.VarChar(30)` | No | request type; bounded typed business value, allowlisted where a code. |
| subjectReferenceHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| verifiedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| dueAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| completedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## DeletionTombstone

Domain: **Privacy**. Table: `deletion_tombstone`. Sensitivity: **S1**. Lifecycle: **append**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,recordType,recordId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| recordType | `String @db.VarChar(100)` | No | record type; bounded typed business value, allowlisted where a code. |
| recordId | `String @db.Uuid` | No | record id; bounded typed business value, allowlisted where a code. |
| deletedAtEvent | `DateTime @db.Timestamptz(6)` | No | deleted at event; bounded typed business value, allowlisted where a code. |
| reasonCode | `String @db.VarChar(60)` | No | reason code; bounded typed business value, allowlisted where a code. |

## Principal

Domain: **Identity**. Table: `principal`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,issuer,subject)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| issuer | `String @db.VarChar(240)` | No | issuer; bounded typed business value, allowlisted where a code. |
| subject | `String @db.VarChar(240)` | No | subject; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |

## Membership

Domain: **Identity**. Table: `membership`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,principalId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| status | `String @db.VarChar(30)` | No | Domain lifecycle code; legal eligibility is not inferred from this value. |
| membershipRevision | `Int @default(1)` | No | membership revision; bounded typed business value, allowlisted where a code. |
| displayName | `String @db.VarChar(200)` | No | display name; bounded typed business value, allowlisted where a code. |
| workEmail | `String @db.VarChar(320)` | No | work email; bounded typed business value, allowlisted where a code. |
| principalId | `String @db.Uuid` | No | Composite FK `(tenantId,principalId)` → Principal `(tenantId,id)`; record/context permission independently required. |

## Role

Domain: **Access**. Table: `role`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,roleKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| roleKey | `String @db.VarChar(80)` | No | role key; bounded typed business value, allowlisted where a code. |
| name | `String @db.VarChar(160)` | No | name; bounded typed business value, allowlisted where a code. |
| bundleVersion | `Int @default(1)` | No | bundle version; bounded typed business value, allowlisted where a code. |

## RolePermission

Domain: **Access**. Table: `role_permission`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,roleId,permissionKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| permissionKey | `String @db.VarChar(120)` | No | permission key; bounded typed business value, allowlisted where a code. |
| roleId | `String @db.Uuid` | No | Composite FK `(tenantId,roleId)` → Role `(tenantId,id)`; record/context permission independently required. |

## RoleGrant

Domain: **Access**. Table: `role_grant`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. Exactly one scope target, or tenant/self with no target; enforced SQL check.

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| scopeType | `String @db.VarChar(30)` | No | scope type; bounded typed business value, allowlisted where a code. |
| validFrom | `DateTime @db.Timestamptz(6)` | No | Inclusive business-effective date; not publication/recording date. |
| expiresAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| revokedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| membershipId | `String @db.Uuid` | No | Composite FK `(tenantId,membershipId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| roleId | `String @db.Uuid` | No | Composite FK `(tenantId,roleId)` → Role `(tenantId,id)`; record/context permission independently required. |
| entityId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |
| teamId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,teamId)` → Team `(tenantId,id)`; record/context permission independently required. |
| clientId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,clientId)` → ClientAccount `(tenantId,id)`; record/context permission independently required. |
| placementId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,placementId)` → Placement `(tenantId,id)`; record/context permission independently required. |

## Session

Domain: **Identity**. Table: `session`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,tokenHash)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| tokenHash | `String @db.Char(64)` | No | SHA-256 of high-entropy random bearer material; plaintext token is never persisted/logged. |
| expiresAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| idleExpiresAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| revokedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| lastMfaAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| membershipRevision | `Int ` | No | membership revision; bounded typed business value, allowlisted where a code. |
| membershipId | `String @db.Uuid` | No | Composite FK `(tenantId,membershipId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## Invitation

Domain: **Identity**. Table: `invitation`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,tokenHash)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| tokenHash | `String @db.Char(64)` | No | SHA-256 of high-entropy random bearer material; plaintext token is never persisted/logged. |
| emailHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| expiresAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| acceptedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| scopeType | `String @db.VarChar(30)` | No | scope type; bounded typed business value, allowlisted where a code. |
| roleId | `String @db.Uuid` | No | Composite FK `(tenantId,roleId)` → Role `(tenantId,id)`; record/context permission independently required. |
| inviterId | `String @db.Uuid` | No | Composite FK `(tenantId,inviterId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| placementId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,placementId)` → Placement `(tenantId,id)`; record/context permission independently required. |
| contactId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,contactId)` → Contact `(tenantId,id)`; record/context permission independently required. |

## OperatorAccessGrant

Domain: **Access**. Table: `operator_access_grant`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| operatorSubjectHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| purposeCode | `String @db.VarChar(60)` | No | purpose code; bounded typed business value, allowlisted where a code. |
| expiresAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| approvedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| revokedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| approvedById | `String @db.Uuid` | No | Composite FK `(tenantId,approvedById)` → Membership `(tenantId,id)`; record/context permission independently required. |

## ClientAccount

Domain: **CRM**. Table: `client_account`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,accountCode)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| accountCode | `String @db.VarChar(60)` | No | account code; bounded typed business value, allowlisted where a code. |
| name | `String @db.VarChar(240)` | No | name; bounded typed business value, allowlisted where a code. |
| status | `String @db.VarChar(30)` | No | Domain lifecycle code; legal eligibility is not inferred from this value. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## Contact

Domain: **CRM**. Table: `contact`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| displayName | `String @db.VarChar(200)` | No | display name; bounded typed business value, allowlisted where a code. |
| workEmail | `String? @db.VarChar(320)` | Yes | work email; bounded typed business value, allowlisted where a code. |
| workPhone | `String? @db.VarChar(40)` | Yes | work phone; bounded typed business value, allowlisted where a code. |
| clientId | `String @db.Uuid` | No | Composite FK `(tenantId,clientId)` → ClientAccount `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## Candidate

Domain: **Agency**. Table: `candidate`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. Minimal agency-owned reference; not employee or ATS authorization.

Primary key: `(tenantId,id)`. Unique keys: (tenantId,sourceProfile,sourceKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| sourceProfile | `String @db.VarChar(80)` | No | Registered source-system/profile namespace. |
| sourceKey | `String @db.VarChar(160)` | No | Source-system key scoped to tenant/profile; email is not a merge identity. |
| displayName | `String @db.VarChar(200)` | No | display name; bounded typed business value, allowlisted where a code. |
| workEmail | `String? @db.VarChar(320)` | Yes | work email; bounded typed business value, allowlisted where a code. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## WorkflowTemplate

Domain: **Workflow**. Table: `workflow_template`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,templateKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| templateKey | `String @db.VarChar(100)` | No | template key; bounded typed business value, allowlisted where a code. |
| name | `String @db.VarChar(200)` | No | name; bounded typed business value, allowlisted where a code. |
| moduleKey | `String @db.VarChar(80)` | No | module key; bounded typed business value, allowlisted where a code. |

## TemplateVersion

Domain: **Workflow**. Table: `template_version`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,templateId,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| publishedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| templateId | `String @db.Uuid` | No | Composite FK `(tenantId,templateId)` → WorkflowTemplate `(tenantId,id)`; record/context permission independently required. |
| publisherId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,publisherId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## TaskDefinition

Domain: **Workflow**. Table: `task_definition`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,templateVersionId,taskKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| taskKey | `String @db.VarChar(80)` | No | task key; bounded typed business value, allowlisted where a code. |
| label | `String @db.VarChar(200)` | No | label; bounded typed business value, allowlisted where a code. |
| milestoneKey | `String @db.VarChar(80)` | No | milestone key; bounded typed business value, allowlisted where a code. |
| required | `Boolean ` | No | required; bounded typed business value, allowlisted where a code. |
| sortOrder | `Int ` | No | sort order; bounded typed business value, allowlisted where a code. |
| dueOffsetDays | `Int ` | No | due offset days; bounded typed business value, allowlisted where a code. |
| templateVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,templateVersionId)` → TemplateVersion `(tenantId,id)`; record/context permission independently required. |

## Placement

Domain: **Agency**. Table: `placement`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,sourceProfile,sourceKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| status | `String @default("accepted") @db.VarChar(30)` | No | Domain lifecycle code; legal eligibility is not inferred from this value. Values: accepted, coordinating, ready, started, canceled. |
| acceptedOn | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| originalPlannedStart | `DateTime @db.Date` | No | Original agreed business date preserved for start KPIs; immutable after creation. |
| currentPlannedStart | `DateTime @db.Date` | No | Current revised plan; changes require append-only PlacementDateRevision. |
| actualStart | `DateTime? @db.Date` | Yes | Confirmed business date, not permit approval or pay enrollment. |
| timeZone | `String @db.VarChar(80)` | No | time zone; bounded typed business value, allowlisted where a code. |
| sourceProfile | `String @db.VarChar(80)` | No | Registered source-system/profile namespace. |
| sourceKey | `String @db.VarChar(160)` | No | Source-system key scoped to tenant/profile; email is not a merge identity. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |
| clientId | `String @db.Uuid` | No | Composite FK `(tenantId,clientId)` → ClientAccount `(tenantId,id)`; record/context permission independently required. |
| candidateId | `String @db.Uuid` | No | Composite FK `(tenantId,candidateId)` → Candidate `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| templateVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,templateVersionId)` → TemplateVersion `(tenantId,id)`; record/context permission independently required. |

## PlacementDateRevision

Domain: **Agency**. Table: `placement_date_revision`. Sensitivity: **S2**. Lifecycle: **append**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| previousDate | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| newDate | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| reasonCode | `String @db.VarChar(60)` | No | reason code; bounded typed business value, allowlisted where a code. |
| changedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| placementId | `String @db.Uuid` | No | Composite FK `(tenantId,placementId)` → Placement `(tenantId,id)`; record/context permission independently required. |
| actorId | `String @db.Uuid` | No | Composite FK `(tenantId,actorId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## Milestone

Domain: **Agency**. Table: `milestone`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,placementId,milestoneKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| milestoneKey | `String @db.VarChar(80)` | No | milestone key; bounded typed business value, allowlisted where a code. |
| label | `String @db.VarChar(200)` | No | label; bounded typed business value, allowlisted where a code. |
| sortOrder | `Int ` | No | sort order; bounded typed business value, allowlisted where a code. |
| placementId | `String @db.Uuid` | No | Composite FK `(tenantId,placementId)` → Placement `(tenantId,id)`; record/context permission independently required. |

## PlacementTask

Domain: **Agency**. Table: `placement_task`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. Same-placement milestone relation enforced by supplementary compound FK.

Primary key: `(tenantId,id)`. Unique keys: (tenantId,placementId,definitionId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| label | `String @db.VarChar(200)` | No | label; bounded typed business value, allowlisted where a code. |
| required | `Boolean ` | No | required; bounded typed business value, allowlisted where a code. |
| state | `String @default("pending") @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: pending, in_progress, completed, waived. |
| dueAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| completedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| waiverReason | `String? @db.VarChar(300)` | Yes | waiver reason; bounded typed business value, allowlisted where a code. |
| placementId | `String @db.Uuid` | No | Composite FK `(tenantId,placementId)` → Placement `(tenantId,id)`; record/context permission independently required. |
| milestoneId | `String @db.Uuid` | No | Composite FK `(tenantId,milestoneId)` → Milestone `(tenantId,id)`; record/context permission independently required. |
| definitionId | `String @db.Uuid` | No | Composite FK `(tenantId,definitionId)` → TaskDefinition `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| completedById | `String? @db.Uuid` | Yes | Composite FK `(tenantId,completedById)` → Membership `(tenantId,id)`; record/context permission independently required. |
| completionEvidenceReference | `String? @db.VarChar(500)` | Yes | Attributable source/provider/evidence reference; validate type and purpose, not proof of approval by itself. |

## PlacementException

Domain: **Agency**. Table: `placement_exception`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| category | `String @db.VarChar(60)` | No | category; bounded typed business value, allowlisted where a code. |
| state | `String @default("open") @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: open, resolved, dismissed. |
| openedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| closedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| resolutionCode | `String? @db.VarChar(60)` | Yes | resolution code; bounded typed business value, allowlisted where a code. |
| placementId | `String @db.Uuid` | No | Composite FK `(tenantId,placementId)` → Placement `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## ParticipantGrant

Domain: **Agency**. Table: `participant_grant`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,placementId,membershipId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| expiresAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| revokedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| canCompleteAssignedTasks | `Boolean @default(false)` | No | can complete assigned tasks; bounded typed business value, allowlisted where a code. |
| placementId | `String @db.Uuid` | No | Composite FK `(tenantId,placementId)` → Placement `(tenantId,id)`; record/context permission independently required. |
| contactId | `String @db.Uuid` | No | Composite FK `(tenantId,contactId)` → Contact `(tenantId,id)`; record/context permission independently required. |
| membershipId | `String @db.Uuid` | No | Composite FK `(tenantId,membershipId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| grantedById | `String @db.Uuid` | No | Composite FK `(tenantId,grantedById)` → Membership `(tenantId,id)`; record/context permission independently required. |

## SharedField

Domain: **Agency**. Table: `shared_field`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,grantId,fieldKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| fieldKey | `String @db.VarChar(100)` | No | field key; bounded typed business value, allowlisted where a code. |
| grantId | `String @db.Uuid` | No | Composite FK `(tenantId,grantId)` → ParticipantGrant `(tenantId,id)`; record/context permission independently required. |

## ReadinessDecision

Domain: **Agency**. Table: `readiness_decision`. Sensitivity: **S2**. Lifecycle: **append**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| decision | `String @db.VarChar(30)` | No | decision; bounded typed business value, allowlisted where a code. |
| reasonCode | `String @db.VarChar(60)` | No | reason code; bounded typed business value, allowlisted where a code. |
| placementVersion | `Int ` | No | placement version; bounded typed business value, allowlisted where a code. |
| decidedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| placementId | `String @db.Uuid` | No | Composite FK `(tenantId,placementId)` → Placement `(tenantId,id)`; record/context permission independently required. |
| actorId | `String @db.Uuid` | No | Composite FK `(tenantId,actorId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## Person

Domain: **HR**. Table: `person`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| displayName | `String @db.VarChar(200)` | No | display name; bounded typed business value, allowlisted where a code. |
| preferredLocale | `String @db.VarChar(35)` | No | preferred locale; bounded typed business value, allowlisted where a code. |
| workEmail | `String? @db.VarChar(320)` | Yes | work email; bounded typed business value, allowlisted where a code. |

## PersonIdentifier

Domain: **HR**. Table: `person_identifier`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| identifierType | `String @db.VarChar(60)` | No | identifier type; bounded typed business value, allowlisted where a code. |
| issuingCountry | `String @db.Char(2)` | No | issuing country; bounded typed business value, allowlisted where a code. |
| authorityCode | `String @db.VarChar(80)` | No | authority code; bounded typed business value, allowlisted where a code. |
| ciphertext | `Bytes ` | No | Encrypted sensitive payload with separate key version; never exposed in ordinary DTO. |
| keyVersion | `String @db.VarChar(80)` | No | key version; bounded typed business value, allowlisted where a code. |
| validFrom | `DateTime? @db.Date` | Yes | Inclusive business-effective date; not publication/recording date. |
| validTo | `DateTime? @db.Date` | Yes | Exclusive business-effective end; null means unbounded, never zero-length. |
| personId | `String @db.Uuid` | No | Composite FK `(tenantId,personId)` → Person `(tenantId,id)`; record/context permission independently required. |

## Employee

Domain: **HR**. Table: `employee`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,employeeCode)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| employeeCode | `String @db.VarChar(60)` | No | employee code; bounded typed business value, allowlisted where a code. |
| personId | `String @db.Uuid` | No | Composite FK `(tenantId,personId)` → Person `(tenantId,id)`; record/context permission independently required. |

## Position

Domain: **HR**. Table: `position`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,entityId,positionCode)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| positionCode | `String @db.VarChar(60)` | No | position code; bounded typed business value, allowlisted where a code. |
| title | `String @db.VarChar(200)` | No | title; bounded typed business value, allowlisted where a code. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |
| teamId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,teamId)` → Team `(tenantId,id)`; record/context permission independently required. |

## Employment

Domain: **HR**. Table: `employment`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| startDate | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| endDate | `DateTime? @db.Date` | Yes | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| status | `String @db.VarChar(30)` | No | Domain lifecycle code; legal eligibility is not inferred from this value. |
| employmentType | `String @db.VarChar(40)` | No | employment type; bounded typed business value, allowlisted where a code. |
| employeeId | `String @db.Uuid` | No | Composite FK `(tenantId,employeeId)` → Employee `(tenantId,id)`; record/context permission independently required. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |
| managerId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,managerId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| positionId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,positionId)` → Position `(tenantId,id)`; record/context permission independently required. |

## EmploymentTerm

Domain: **HR**. Table: `employment_term`. Sensitivity: **S3**. Lifecycle: **effective**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| validFrom | `DateTime @db.Date` | No | Inclusive business-effective date; not publication/recording date. |
| validTo | `DateTime? @db.Date` | Yes | Exclusive business-effective end; null means unbounded, never zero-length. |
| recordedAt | `DateTime @default(now()) @db.Timestamptz(6)` | No | UTC instant this version became known; used with supersededAt for as-known history. |
| hoursPerWeek | `Decimal @db.Decimal(10,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| basicWage | `Decimal @db.Decimal(20,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| wageUnit | `String @db.VarChar(20)` | No | wage unit; bounded typed business value, allowlisted where a code. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| calendarVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,calendarVersionId)` → CalendarVersion `(tenantId,id)`; record/context permission independently required. |
| approvedById | `String @db.Uuid` | No | Composite FK `(tenantId,approvedById)` → Membership `(tenantId,id)`; record/context permission independently required. |
| supersededAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC end of system-time validity. Prior content immutable; correction inserts replacement intervals. |

## EmploymentContract

Domain: **HR**. Table: `employment_contract`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,employmentId,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| status | `String @db.VarChar(30)` | No | Domain lifecycle code; legal eligibility is not inferred from this value. |
| signedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| deliveredAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| languageCode | `String @db.VarChar(35)` | No | language code; bounded typed business value, allowlisted where a code. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| documentId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,documentId)` → Document `(tenantId,id)`; record/context permission independently required. |

## CandidateConversion

Domain: **HR**. Table: `candidate_conversion`. Sensitivity: **S3**. Lifecycle: **append**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,candidateId,personId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| mappedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| purposeCode | `String @db.VarChar(60)` | No | purpose code; bounded typed business value, allowlisted where a code. |
| candidateId | `String @db.Uuid` | No | Composite FK `(tenantId,candidateId)` → Candidate `(tenantId,id)`; record/context permission independently required. |
| personId | `String @db.Uuid` | No | Composite FK `(tenantId,personId)` → Person `(tenantId,id)`; record/context permission independently required. |
| actorId | `String @db.Uuid` | No | Composite FK `(tenantId,actorId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## CandidateProfile

Domain: **ATS**. Table: `candidate_profile`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,candidateId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| noticeVersion | `String @db.VarChar(60)` | No | notice version; bounded typed business value, allowlisted where a code. |
| processingBasisCode | `String @db.VarChar(60)` | No | processing basis code; bounded typed business value, allowlisted where a code. |
| withdrawnAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| candidateId | `String @db.Uuid` | No | Composite FK `(tenantId,candidateId)` → Candidate `(tenantId,id)`; record/context permission independently required. |

## Requisition

Domain: **ATS**. Table: `requisition`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,requisitionCode)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| requisitionCode | `String @db.VarChar(60)` | No | requisition code; bounded typed business value, allowlisted where a code. |
| title | `String @db.VarChar(200)` | No | title; bounded typed business value, allowlisted where a code. |
| approvedOpenings | `Int ` | No | approved openings; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |
| clientId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,clientId)` → ClientAccount `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## Application

Domain: **ATS**. Table: `application`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,candidateId,requisitionId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: new, screening, interview, offer, hired, rejected, withdrawn. |
| appliedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| sourceCode | `String @db.VarChar(80)` | No | source code; bounded typed business value, allowlisted where a code. |
| candidateId | `String @db.Uuid` | No | Composite FK `(tenantId,candidateId)` → Candidate `(tenantId,id)`; record/context permission independently required. |
| requisitionId | `String @db.Uuid` | No | Composite FK `(tenantId,requisitionId)` → Requisition `(tenantId,id)`; record/context permission independently required. |

## ApplicationStageEvent

Domain: **ATS**. Table: `application_stage_event`. Sensitivity: **S3**. Lifecycle: **append**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| fromState | `String @db.VarChar(30)` | No | from state; bounded typed business value, allowlisted where a code. |
| toState | `String @db.VarChar(30)` | No | to state; bounded typed business value, allowlisted where a code. |
| reasonCode | `String @db.VarChar(60)` | No | reason code; bounded typed business value, allowlisted where a code. |
| occurredAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| applicationId | `String @db.Uuid` | No | Composite FK `(tenantId,applicationId)` → Application `(tenantId,id)`; record/context permission independently required. |
| actorId | `String @db.Uuid` | No | Composite FK `(tenantId,actorId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## Interview

Domain: **ATS**. Table: `interview`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| startsAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| endsAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| applicationId | `String @db.Uuid` | No | Composite FK `(tenantId,applicationId)` → Application `(tenantId,id)`; record/context permission independently required. |
| interviewerId | `String @db.Uuid` | No | Composite FK `(tenantId,interviewerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## InterviewFeedback

Domain: **ATS**. Table: `interview_feedback`. Sensitivity: **S3**. Lifecycle: **append**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,interviewId,reviewerId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| rubricVersion | `String @db.VarChar(40)` | No | rubric version; bounded typed business value, allowlisted where a code. |
| score | `Decimal @db.Decimal(8,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| evidenceNote | `String @db.VarChar(2000)` | No | evidence note; bounded typed business value, allowlisted where a code. |
| submittedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| interviewId | `String @db.Uuid` | No | Composite FK `(tenantId,interviewId)` → Interview `(tenantId,id)`; record/context permission independently required. |
| reviewerId | `String @db.Uuid` | No | Composite FK `(tenantId,reviewerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## Offer

Domain: **ATS**. Table: `offer`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,applicationId,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: draft, in_review, approved, issued, accepted, declined, expired, withdrawn. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| amount | `Decimal @db.Decimal(20,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| acceptedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| applicationId | `String @db.Uuid` | No | Composite FK `(tenantId,applicationId)` → Application `(tenantId,id)`; record/context permission independently required. |
| approverId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,approverId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## CareerPosting

Domain: **ATS**. Table: `career_posting`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,slug)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| slug | `String @db.VarChar(160)` | No | slug; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| publishedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| expiresAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| requisitionId | `String @db.Uuid` | No | Composite FK `(tenantId,requisitionId)` → Requisition `(tenantId,id)`; record/context permission independently required. |

## LifecycleCase

Domain: **HR lifecycle**. Table: `lifecycle_case`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| caseType | `String @db.VarChar(30)` | No | case type; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: draft, active, blocked, completed, canceled. |
| originalDueDate | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| completedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| templateVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,templateVersionId)` → TemplateVersion `(tenantId,id)`; record/context permission independently required. |

## LifecycleTask

Domain: **HR lifecycle**. Table: `lifecycle_task`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,caseId,taskKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| taskKey | `String @db.VarChar(80)` | No | task key; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| dueAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| completionEvidence | `String? @db.VarChar(500)` | Yes | completion evidence; bounded typed business value, allowlisted where a code. |
| caseId | `String @db.Uuid` | No | Composite FK `(tenantId,caseId)` → LifecycleCase `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## LeavePolicyVersion

Domain: **Leave**. Table: `leave_policy_version`. Sensitivity: **S2**. Lifecycle: **effective**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,entityId,policyKey,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| policyKey | `String @db.VarChar(80)` | No | policy key; bounded typed business value, allowlisted where a code. |
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| validFrom | `DateTime @db.Date` | No | Inclusive business-effective date; not publication/recording date. |
| validTo | `DateTime? @db.Date` | Yes | Exclusive business-effective end; null means unbounded, never zero-length. |
| recordedAt | `DateTime @default(now()) @db.Timestamptz(6)` | No | UTC instant this version became known; used with supersededAt for as-known history. |
| unit | `String @db.VarChar(20)` | No | unit; bounded typed business value, allowlisted where a code. |
| annualQuantity | `Decimal @db.Decimal(14,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |
| ruleVersionId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,ruleVersionId)` → RuleVersion `(tenantId,id)`; record/context permission independently required. |
| supersededAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC end of system-time validity. Prior content immutable; correction inserts replacement intervals. |

## LeaveAccount

Domain: **Leave**. Table: `leave_account`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,employmentId,policyVersionId,policyYear)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| policyYear | `Int ` | No | policy year; bounded typed business value, allowlisted where a code. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| policyVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,policyVersionId)` → LeavePolicyVersion `(tenantId,id)`; record/context permission independently required. |

## LeaveRequest

Domain: **Leave**. Table: `leave_request`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| startsOn | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| endsOn | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| quantity | `Decimal @db.Decimal(14,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| unit | `String @db.VarChar(20)` | No | unit; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: draft, submitted, approved, rejected, canceled, taken. |
| reasonCode | `String @db.VarChar(60)` | No | reason code; bounded typed business value, allowlisted where a code. |
| accountId | `String @db.Uuid` | No | Composite FK `(tenantId,accountId)` → LeaveAccount `(tenantId,id)`; record/context permission independently required. |
| requesterId | `String @db.Uuid` | No | Composite FK `(tenantId,requesterId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## LeaveLedgerEntry

Domain: **Leave**. Table: `leave_ledger_entry`. Sensitivity: **S3**. Lifecycle: **append**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,operationKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| entryType | `String @db.VarChar(30)` | No | entry type; bounded typed business value, allowlisted where a code. |
| quantity | `Decimal @db.Decimal(14,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| effectiveDate | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| operationKey | `String @db.VarChar(160)` | No | operation key; bounded typed business value, allowlisted where a code. |
| accountId | `String @db.Uuid` | No | Composite FK `(tenantId,accountId)` → LeaveAccount `(tenantId,id)`; record/context permission independently required. |
| requestId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,requestId)` → LeaveRequest `(tenantId,id)`; record/context permission independently required. |
| reversesId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,reversesId)` → LeaveLedgerEntry `(tenantId,id)`; record/context permission independently required. |

## TimeEntry

Domain: **Workforce**. Table: `time_entry`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,sourceProfile,sourceKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| startedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| endedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| timeZone | `String @db.VarChar(80)` | No | time zone; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| sourceKey | `String @db.VarChar(160)` | No | Source-system key scoped to tenant/profile; email is not a merge identity. |
| sourceProfile | `String @db.VarChar(80)` | No | Registered source-system/profile namespace. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| correctsId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,correctsId)` → TimeEntry `(tenantId,id)`; record/context permission independently required. |
| assignmentId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,assignmentId)` → WorkAssignment `(tenantId,id)`; record/context permission independently required. |

## TimeApproval

Domain: **Workforce**. Table: `time_approval`. Sensitivity: **S3**. Lifecycle: **append**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| periodStart | `DateTime @db.Date` | No | period start; bounded typed business value, allowlisted where a code. |
| periodEnd | `DateTime @db.Date` | No | period end; bounded typed business value, allowlisted where a code. |
| approvedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| sourceHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| approverId | `String @db.Uuid` | No | Composite FK `(tenantId,approverId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## TimeApprovalItem

Domain: **Workforce**. Table: `time_approval_item`. Sensitivity: **S3**. Lifecycle: **append**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,approvalId,entryId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| entryVersion | `Int ` | No | entry version; bounded typed business value, allowlisted where a code. |
| approvedMinutes | `Int ` | No | approved minutes; bounded typed business value, allowlisted where a code. |
| approvalId | `String @db.Uuid` | No | Composite FK `(tenantId,approvalId)` → TimeApproval `(tenantId,id)`; record/context permission independently required. |
| entryId | `String @db.Uuid` | No | Composite FK `(tenantId,entryId)` → TimeEntry `(tenantId,id)`; record/context permission independently required. |

## Shift

Domain: **Workforce**. Table: `shift`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| startsAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| endsAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| timeZone | `String @db.VarChar(80)` | No | time zone; bounded typed business value, allowlisted where a code. |
| requiredCount | `Int ` | No | required count; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |
| teamId | `String @db.Uuid` | No | Composite FK `(tenantId,teamId)` → Team `(tenantId,id)`; record/context permission independently required. |

## ShiftAssignment

Domain: **Workforce**. Table: `shift_assignment`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,shiftId,employmentId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| shiftId | `String @db.Uuid` | No | Composite FK `(tenantId,shiftId)` → Shift `(tenantId,id)`; record/context permission independently required. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |

## ShiftSwap

Domain: **Workforce**. Table: `shift_swap`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| expiresAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| sourceAssignmentId | `String @db.Uuid` | No | Composite FK `(tenantId,sourceAssignmentId)` → ShiftAssignment `(tenantId,id)`; record/context permission independently required. |
| targetAssignmentId | `String @db.Uuid` | No | Composite FK `(tenantId,targetAssignmentId)` → ShiftAssignment `(tenantId,id)`; record/context permission independently required. |
| requesterId | `String @db.Uuid` | No | Composite FK `(tenantId,requesterId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| approverId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,approverId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## WorkAssignment

Domain: **Workforce**. Table: `work_assignment`. Sensitivity: **S3**. Lifecycle: **effective**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| validFrom | `DateTime @db.Date` | No | Inclusive business-effective date; not publication/recording date. |
| validTo | `DateTime? @db.Date` | Yes | Exclusive business-effective end; null means unbounded, never zero-length. |
| recordedAt | `DateTime @default(now()) @db.Timestamptz(6)` | No | UTC instant this version became known; used with supersededAt for as-known history. |
| siteCode | `String @db.VarChar(80)` | No | site code; bounded typed business value, allowlisted where a code. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| clientId | `String @db.Uuid` | No | Composite FK `(tenantId,clientId)` → ClientAccount `(tenantId,id)`; record/context permission independently required. |
| supersededAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC end of system-time validity. Prior content immutable; correction inserts replacement intervals. |

## ClientTimeApproval

Domain: **Workforce**. Table: `client_time_approval`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| approvedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| assignmentId | `String @db.Uuid` | No | Composite FK `(tenantId,assignmentId)` → WorkAssignment `(tenantId,id)`; record/context permission independently required. |
| timeApprovalId | `String @db.Uuid` | No | Composite FK `(tenantId,timeApprovalId)` → TimeApproval `(tenantId,id)`; record/context permission independently required. |
| contactId | `String @db.Uuid` | No | Composite FK `(tenantId,contactId)` → Contact `(tenantId,id)`; record/context permission independently required. |

## PayPeriod

Domain: **Payroll**. Table: `pay_period`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,entityId,periodKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| periodKey | `String @db.VarChar(60)` | No | period key; bounded typed business value, allowlisted where a code. |
| startsOn | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| endsOn | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| dueOn | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |

## PayrollInputBatch

Domain: **Payroll**. Table: `payroll_input_batch`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,periodId,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: draft, in_review, approved, exported, rejected, canceled. |
| requirementVersion | `String @db.VarChar(60)` | No | requirement version; bounded typed business value, allowlisted where a code. |
| sourceHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| periodId | `String @db.Uuid` | No | Composite FK `(tenantId,periodId)` → PayPeriod `(tenantId,id)`; record/context permission independently required. |
| preparerId | `String @db.Uuid` | No | Composite FK `(tenantId,preparerId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| approverId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,approverId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| approvedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |

## PayrollInput

Domain: **Payroll**. Table: `payroll_input`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,batchId,employmentId,inputCode,sourceType,sourceKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| inputCode | `String @db.VarChar(60)` | No | input code; bounded typed business value, allowlisted where a code. |
| quantity | `Decimal @db.Decimal(20,6)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| unit | `String @db.VarChar(30)` | No | unit; bounded typed business value, allowlisted where a code. |
| currency | `String? @db.Char(3)` | Yes | ISO currency code validated against approved currency registry; never inferred from locale. |
| sourceType | `String @db.VarChar(60)` | No | source type; bounded typed business value, allowlisted where a code. |
| sourceKey | `String @db.VarChar(160)` | No | Source-system key scoped to tenant/profile; email is not a merge identity. |
| sourceVersion | `Int ` | No | source version; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| batchId | `String @db.Uuid` | No | Composite FK `(tenantId,batchId)` → PayrollInputBatch `(tenantId,id)`; record/context permission independently required. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |

## PayrollException

Domain: **Payroll**. Table: `payroll_exception`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| kind | `String @db.VarChar(60)` | No | kind; bounded typed business value, allowlisted where a code. |
| required | `Boolean ` | No | required; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| resolutionCode | `String? @db.VarChar(60)` | Yes | resolution code; bounded typed business value, allowlisted where a code. |
| batchId | `String @db.Uuid` | No | Composite FK `(tenantId,batchId)` → PayrollInputBatch `(tenantId,id)`; record/context permission independently required. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## PayrollProviderExport

Domain: **Payroll**. Table: `payroll_provider_export`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| formatVersion | `String @db.VarChar(60)` | No | format version; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: generated, approved, exported, provider_accepted, rejected, reconciled. |
| contentHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| providerReference | `String? @db.VarChar(160)` | Yes | Attributable source/provider/evidence reference; validate type and purpose, not proof of approval by itself. |
| reconciledAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| batchId | `String @db.Uuid` | No | Composite FK `(tenantId,batchId)` → PayrollInputBatch `(tenantId,id)`; record/context permission independently required. |
| artifactId | `String @db.Uuid` | No | Composite FK `(tenantId,artifactId)` → ExportArtifact `(tenantId,id)`; record/context permission independently required. |
| ruleVersionId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,ruleVersionId)` → RuleVersion `(tenantId,id)`; record/context permission independently required. |

## PayRun

Domain: **Payroll**. Table: `pay_run`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,batchId,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: draft, calculated, in_review, approved, finalized, failed, canceled. |
| roundingMode | `String @db.VarChar(30)` | No | Approved adapter rounding identifier; apply decimal arithmetic and persist unrounded/rounded evidence. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| finalizedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| batchId | `String @db.Uuid` | No | Composite FK `(tenantId,batchId)` → PayrollInputBatch `(tenantId,id)`; record/context permission independently required. |
| ruleVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,ruleVersionId)` → RuleVersion `(tenantId,id)`; record/context permission independently required. |
| preparerId | `String @db.Uuid` | No | Composite FK `(tenantId,preparerId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| approverId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,approverId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| adjustsRunId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,adjustsRunId)` → PayRun `(tenantId,id)`; record/context permission independently required. |

## PayRunWorker

Domain: **Payroll**. Table: `pay_run_worker`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,runId,employmentId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| gross | `Decimal @db.Decimal(20,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| deductions | `Decimal @db.Decimal(20,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| net | `Decimal @db.Decimal(20,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| employmentTermVersion | `Int ` | No | employment term version; bounded typed business value, allowlisted where a code. |
| runId | `String @db.Uuid` | No | Composite FK `(tenantId,runId)` → PayRun `(tenantId,id)`; record/context permission independently required. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| termId | `String @db.Uuid` | No | Composite FK `(tenantId,termId)` → EmploymentTerm `(tenantId,id)`; record/context permission independently required. |

## PayCalculationLine

Domain: **Payroll**. Table: `pay_calculation_line`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,workerId,lineNumber)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| lineCode | `String @db.VarChar(80)` | No | line code; bounded typed business value, allowlisted where a code. |
| lineNumber | `Int ` | No | line number; bounded typed business value, allowlisted where a code. |
| unroundedAmount | `Decimal @db.Decimal(28,10)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| roundedAmount | `Decimal @db.Decimal(20,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| quantity | `Decimal @db.Decimal(20,6)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| rate | `Decimal @db.Decimal(28,10)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| ruleReference | `String @db.VarChar(160)` | No | Attributable source/provider/evidence reference; validate type and purpose, not proof of approval by itself. |
| workerId | `String @db.Uuid` | No | Composite FK `(tenantId,workerId)` → PayRunWorker `(tenantId,id)`; record/context permission independently required. |

## Payslip

Domain: **Payroll**. Table: `payslip`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,workerId,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| publishedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| workerId | `String @db.Uuid` | No | Composite FK `(tenantId,workerId)` → PayRunWorker `(tenantId,id)`; record/context permission independently required. |
| artifactId | `String @db.Uuid` | No | Composite FK `(tenantId,artifactId)` → ExportArtifact `(tenantId,id)`; record/context permission independently required. |

## FinalSettlement

Domain: **Payroll**. Table: `final_settlement`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,employmentId,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| terminationDate | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| dueDate | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| amount | `Decimal @db.Decimal(20,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| paidAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| ruleVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,ruleVersionId)` → RuleVersion `(tenantId,id)`; record/context permission independently required. |
| approverId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,approverId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| revision | `Int @default(1)` | No | revision; bounded typed business value, allowlisted where a code. |
| supersedesId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,supersedesId)` → FinalSettlement `(tenantId,id)`; record/context permission independently required. |

## PaymentEvidence

Domain: **Payroll**. Table: `payment_evidence`. Sensitivity: **S3**. Lifecycle: **append**. Scope: **Later**. Exactly one typed settlement/provider-export target; no funds custody.

Primary key: `(tenantId,id)`. Unique keys: (tenantId,providerCode,providerAccountKey,providerReference)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| providerReference | `String @db.VarChar(160)` | No | Attributable source/provider/evidence reference; validate type and purpose, not proof of approval by itself. |
| amount | `Decimal @db.Decimal(20,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| acceptedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| settlementId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,settlementId)` → FinalSettlement `(tenantId,id)`; record/context permission independently required. |
| providerExportId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,providerExportId)` → PayrollProviderExport `(tenantId,id)`; record/context permission independently required. |
| providerCode | `String @db.VarChar(80)` | No | provider code; bounded typed business value, allowlisted where a code. |
| providerAccountKey | `String @db.VarChar(100)` | No | provider account key; bounded typed business value, allowlisted where a code. |

## CompensationCycle

Domain: **Compensation**. Table: `compensation_cycle`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| name | `String @db.VarChar(160)` | No | name; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| budget | `Decimal @db.Decimal(20,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## CompensationProposal

Domain: **Compensation**. Table: `compensation_proposal`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,cycleId,employmentId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| amount | `Decimal @db.Decimal(20,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| effectiveDate | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| cycleId | `String @db.Uuid` | No | Composite FK `(tenantId,cycleId)` → CompensationCycle `(tenantId,id)`; record/context permission independently required. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| proposerId | `String @db.Uuid` | No | Composite FK `(tenantId,proposerId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| approverId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,approverId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## BenefitPlan

Domain: **Benefits**. Table: `benefit_plan`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,entityId,planCode)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| planCode | `String @db.VarChar(80)` | No | plan code; bounded typed business value, allowlisted where a code. |
| providerCode | `String @db.VarChar(80)` | No | provider code; bounded typed business value, allowlisted where a code. |
| name | `String @db.VarChar(200)` | No | name; bounded typed business value, allowlisted where a code. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |

## BenefitPlanVersion

Domain: **Benefits**. Table: `benefit_plan_version`. Sensitivity: **S3**. Lifecycle: **effective**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,planId,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| validFrom | `DateTime @db.Date` | No | Inclusive business-effective date; not publication/recording date. |
| validTo | `DateTime? @db.Date` | Yes | Exclusive business-effective end; null means unbounded, never zero-length. |
| recordedAt | `DateTime @default(now()) @db.Timestamptz(6)` | No | UTC instant this version became known; used with supersededAt for as-known history. |
| eligibilityRuleReference | `String @db.VarChar(160)` | No | Attributable source/provider/evidence reference; validate type and purpose, not proof of approval by itself. |
| planId | `String @db.Uuid` | No | Composite FK `(tenantId,planId)` → BenefitPlan `(tenantId,id)`; record/context permission independently required. |
| supersededAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC end of system-time validity. Prior content immutable; correction inserts replacement intervals. |

## BenefitEnrollment

Domain: **Benefits**. Table: `benefit_enrollment`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: requested, in_review, approved, provider_pending, active, rejected, ended. |
| effectiveDate | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| providerReference | `String? @db.VarChar(160)` | Yes | Attributable source/provider/evidence reference; validate type and purpose, not proof of approval by itself. |
| planVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,planVersionId)` → BenefitPlanVersion `(tenantId,id)`; record/context permission independently required. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| approverId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,approverId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## ReviewCycle

Domain: **Performance**. Table: `review_cycle`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| name | `String @db.VarChar(160)` | No | name; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| rubricVersion | `String @db.VarChar(60)` | No | rubric version; bounded typed business value, allowlisted where a code. |
| startsOn | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| endsOn | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## Goal

Domain: **Performance**. Table: `goal`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| title | `String @db.VarChar(240)` | No | title; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| target | `Decimal @db.Decimal(20,6)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| unit | `String @db.VarChar(40)` | No | unit; bounded typed business value, allowlisted where a code. |
| cycleId | `String @db.Uuid` | No | Composite FK `(tenantId,cycleId)` → ReviewCycle `(tenantId,id)`; record/context permission independently required. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |

## ReviewSubmission

Domain: **Performance**. Table: `review_submission`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,cycleId,employmentId,reviewerId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| score | `Decimal? @db.Decimal(10,4)` | Yes | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| feedback | `String @db.VarChar(4000)` | No | feedback; bounded typed business value, allowlisted where a code. |
| submittedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| cycleId | `String @db.Uuid` | No | Composite FK `(tenantId,cycleId)` → ReviewCycle `(tenantId,id)`; record/context permission independently required. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| reviewerId | `String @db.Uuid` | No | Composite FK `(tenantId,reviewerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## CalibrationDecision

Domain: **Performance**. Table: `calibration_decision`. Sensitivity: **S3**. Lifecycle: **append**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| previousScore | `Decimal @db.Decimal(10,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| newScore | `Decimal @db.Decimal(10,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| reasonCode | `String @db.VarChar(80)` | No | reason code; bounded typed business value, allowlisted where a code. |
| decidedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| submissionId | `String @db.Uuid` | No | Composite FK `(tenantId,submissionId)` → ReviewSubmission `(tenantId,id)`; record/context permission independently required. |
| actorId | `String @db.Uuid` | No | Composite FK `(tenantId,actorId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## LearningCourse

Domain: **Learning**. Table: `learning_course`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,courseCode)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| courseCode | `String @db.VarChar(80)` | No | course code; bounded typed business value, allowlisted where a code. |
| name | `String @db.VarChar(200)` | No | name; bounded typed business value, allowlisted where a code. |

## CourseVersion

Domain: **Learning**. Table: `course_version`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,courseId,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| providerCode | `String? @db.VarChar(80)` | Yes | provider code; bounded typed business value, allowlisted where a code. |
| completionRuleReference | `String @db.VarChar(160)` | No | Attributable source/provider/evidence reference; validate type and purpose, not proof of approval by itself. |
| publishedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| courseId | `String @db.Uuid` | No | Composite FK `(tenantId,courseId)` → LearningCourse `(tenantId,id)`; record/context permission independently required. |

## LearningAssignment

Domain: **Learning**. Table: `learning_assignment`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,providerEventKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| dueOn | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| completedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| providerEventKey | `String? @db.VarChar(160)` | Yes | provider event key; bounded typed business value, allowlisted where a code. |
| courseVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,courseVersionId)` → CourseVersion `(tenantId,id)`; record/context permission independently required. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |

## Skill

Domain: **Talent**. Table: `skill`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,skillCode)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| skillCode | `String @db.VarChar(80)` | No | skill code; bounded typed business value, allowlisted where a code. |
| name | `String @db.VarChar(200)` | No | name; bounded typed business value, allowlisted where a code. |

## SkillEvidence

Domain: **Talent**. Table: `skill_evidence`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| levelCode | `String @db.VarChar(60)` | No | level code; bounded typed business value, allowlisted where a code. |
| sourceCode | `String @db.VarChar(80)` | No | source code; bounded typed business value, allowlisted where a code. |
| verifiedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| expiresOn | `DateTime? @db.Date` | Yes | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| skillId | `String @db.Uuid` | No | Composite FK `(tenantId,skillId)` → Skill `(tenantId,id)`; record/context permission independently required. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| reviewerId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,reviewerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## SuccessionPlan

Domain: **Talent**. Table: `succession_plan`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| reviewDueOn | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| positionId | `String @db.Uuid` | No | Composite FK `(tenantId,positionId)` → Position `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## SuccessionCandidate

Domain: **Talent**. Table: `succession_candidate`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,planId,employmentId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| readinessCode | `String @db.VarChar(60)` | No | readiness code; bounded typed business value, allowlisted where a code. |
| assessmentVersion | `String @db.VarChar(60)` | No | assessment version; bounded typed business value, allowlisted where a code. |
| planId | `String @db.Uuid` | No | Composite FK `(tenantId,planId)` → SuccessionPlan `(tenantId,id)`; record/context permission independently required. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |

## Document

Domain: **Documents**. Table: `document`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| documentType | `String @db.VarChar(80)` | No | document type; bounded typed business value, allowlisted where a code. |
| purposeCode | `String @db.VarChar(80)` | No | purpose code; bounded typed business value, allowlisted where a code. |
| classification | `String @db.VarChar(2)` | No | classification; bounded typed business value, allowlisted where a code. |
| objectKey | `String @db.VarChar(500)` | No | object key; bounded typed business value, allowlisted where a code. |
| objectVersion | `String @db.VarChar(200)` | No | object version; bounded typed business value, allowlisted where a code. |
| contentHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| expiresOn | `DateTime? @db.Date` | Yes | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| sizeBytes | `BigInt ` | No | size bytes; bounded typed business value, allowlisted where a code. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## EmploymentDocument

Domain: **Documents**. Table: `employment_document`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,employmentId,documentId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| relationshipCode | `String @db.VarChar(60)` | No | relationship code; bounded typed business value, allowlisted where a code. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| documentId | `String @db.Uuid` | No | Composite FK `(tenantId,documentId)` → Document `(tenantId,id)`; record/context permission independently required. |

## CandidateDocument

Domain: **Documents**. Table: `candidate_document`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,candidateId,documentId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| relationshipCode | `String @db.VarChar(60)` | No | relationship code; bounded typed business value, allowlisted where a code. |
| candidateId | `String @db.Uuid` | No | Composite FK `(tenantId,candidateId)` → Candidate `(tenantId,id)`; record/context permission independently required. |
| documentId | `String @db.Uuid` | No | Composite FK `(tenantId,documentId)` → Document `(tenantId,id)`; record/context permission independently required. |

## Asset

Domain: **Assets**. Table: `asset`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,assetTag)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| assetTag | `String @db.VarChar(80)` | No | asset tag; bounded typed business value, allowlisted where a code. |
| description | `String @db.VarChar(240)` | No | description; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |

## AssetAssignment

Domain: **Assets**. Table: `asset_assignment`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| assignedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| returnedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| returnEvidence | `String? @db.VarChar(500)` | Yes | return evidence; bounded typed business value, allowlisted where a code. |
| assetId | `String @db.Uuid` | No | Composite FK `(tenantId,assetId)` → Asset `(tenantId,id)`; record/context permission independently required. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## ExpenseClaim

Domain: **Expenses**. Table: `expense_claim`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,claimNumber)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| claimNumber | `String @db.VarChar(60)` | No | claim number; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: draft, submitted, in_review, approved, rejected, payment_pending, reimbursed, canceled. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| submittedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| paidAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| claimantId | `String @db.Uuid` | No | Composite FK `(tenantId,claimantId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| approverId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,approverId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## ExpenseLine

Domain: **Expenses**. Table: `expense_line`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,claimId,lineNumber)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| lineNumber | `Int ` | No | line number; bounded typed business value, allowlisted where a code. |
| incurredOn | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| categoryCode | `String @db.VarChar(80)` | No | category code; bounded typed business value, allowlisted where a code. |
| amount | `Decimal @db.Decimal(20,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| claimId | `String @db.Uuid` | No | Composite FK `(tenantId,claimId)` → ExpenseClaim `(tenantId,id)`; record/context permission independently required. |
| receiptId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,receiptId)` → Document `(tenantId,id)`; record/context permission independently required. |

## ReimbursementEvidence

Domain: **Expenses**. Table: `reimbursement_evidence`. Sensitivity: **S3**. Lifecycle: **append**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,providerCode,providerAccountKey,providerReference)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| providerReference | `String @db.VarChar(160)` | No | Attributable source/provider/evidence reference; validate type and purpose, not proof of approval by itself. |
| amount | `Decimal @db.Decimal(20,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| paidAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| claimId | `String @db.Uuid` | No | Composite FK `(tenantId,claimId)` → ExpenseClaim `(tenantId,id)`; record/context permission independently required. |
| providerCode | `String @db.VarChar(80)` | No | provider code; bounded typed business value, allowlisted where a code. |
| providerAccountKey | `String @db.VarChar(100)` | No | provider account key; bounded typed business value, allowlisted where a code. |

## EmployeeCase

Domain: **Employee experience**. Table: `employee_case`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,caseNumber)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| caseNumber | `String @db.VarChar(60)` | No | case number; bounded typed business value, allowlisted where a code. |
| categoryCode | `String @db.VarChar(80)` | No | category code; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| summaryCiphertext | `Bytes ` | No | Encrypted sensitive payload with separate key version; never exposed in ordinary DTO. |
| keyVersion | `String @db.VarChar(80)` | No | key version; bounded typed business value, allowlisted where a code. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## EmployeeCaseAccess

Domain: **Employee experience**. Table: `employee_case_access`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,caseId,membershipId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| expiresAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| caseId | `String @db.Uuid` | No | Composite FK `(tenantId,caseId)` → EmployeeCase `(tenantId,id)`; record/context permission independently required. |
| membershipId | `String @db.Uuid` | No | Composite FK `(tenantId,membershipId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| grantedById | `String @db.Uuid` | No | Composite FK `(tenantId,grantedById)` → Membership `(tenantId,id)`; record/context permission independently required. |

## Announcement

Domain: **Employee experience**. Table: `announcement`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| title | `String @db.VarChar(200)` | No | title; bounded typed business value, allowlisted where a code. |
| body | `String @db.VarChar(8000)` | No | body; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| expiresAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |
| publisherId | `String @db.Uuid` | No | Composite FK `(tenantId,publisherId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## Acknowledgment

Domain: **Employee experience**. Table: `acknowledgment`. Sensitivity: **S2**. Lifecycle: **append**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,announcementId,membershipId,announcementVersion)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| acknowledgedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| announcementVersion | `Int ` | No | announcement version; bounded typed business value, allowlisted where a code. |
| announcementId | `String @db.Uuid` | No | Composite FK `(tenantId,announcementId)` → Announcement `(tenantId,id)`; record/context permission independently required. |
| membershipId | `String @db.Uuid` | No | Composite FK `(tenantId,membershipId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## Survey

Domain: **Employee experience**. Table: `survey`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| name | `String @db.VarChar(160)` | No | name; bounded typed business value, allowlisted where a code. |
| anonymityMode | `String @db.VarChar(30)` | No | anonymity mode; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| noticeVersion | `String @db.VarChar(60)` | No | notice version; bounded typed business value, allowlisted where a code. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## SurveyResponse

Domain: **Employee experience**. Table: `survey_response`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. No employment/membership FK for anonymous responses; anonymity needs separate delivery/anti-differencing review.

Primary key: `(tenantId,id)`. Unique keys: (tenantId,surveyId,responseKeyHash,questionCode)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| responseKeyHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| questionCode | `String @db.VarChar(80)` | No | question code; bounded typed business value, allowlisted where a code. |
| score | `Decimal? @db.Decimal(10,4)` | Yes | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| textCiphertext | `Bytes? ` | Yes | Encrypted sensitive payload with separate key version; never exposed in ordinary DTO. |
| keyVersion | `String? @db.VarChar(80)` | Yes | key version; bounded typed business value, allowlisted where a code. |
| surveyId | `String @db.Uuid` | No | Composite FK `(tenantId,surveyId)` → Survey `(tenantId,id)`; record/context permission independently required. |

## Lead

Domain: **CRM**. Table: `lead`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| displayName | `String @db.VarChar(200)` | No | display name; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| sourceCode | `String @db.VarChar(80)` | No | source code; bounded typed business value, allowlisted where a code. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| convertedClientId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,convertedClientId)` → ClientAccount `(tenantId,id)`; record/context permission independently required. |

## Opportunity

Domain: **Sales**. Table: `opportunity`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| title | `String @db.VarChar(200)` | No | title; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: qualified, discovery, proposal, negotiation, won, lost. |
| amount | `Decimal? @db.Decimal(20,4)` | Yes | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| expectedCloseOn | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| probability | `Decimal @db.Decimal(8,6)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| clientId | `String @db.Uuid` | No | Composite FK `(tenantId,clientId)` → ClientAccount `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## SalesStageEvent

Domain: **Sales**. Table: `sales_stage_event`. Sensitivity: **S2**. Lifecycle: **append**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| fromState | `String @db.VarChar(30)` | No | from state; bounded typed business value, allowlisted where a code. |
| toState | `String @db.VarChar(30)` | No | to state; bounded typed business value, allowlisted where a code. |
| occurredAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| reasonCode | `String @db.VarChar(60)` | No | reason code; bounded typed business value, allowlisted where a code. |
| opportunityId | `String @db.Uuid` | No | Composite FK `(tenantId,opportunityId)` → Opportunity `(tenantId,id)`; record/context permission independently required. |
| actorId | `String @db.Uuid` | No | Composite FK `(tenantId,actorId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## Activity

Domain: **CRM**. Table: `activity`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. Exactly one explicit primary target; related context obtained through authorized joins.

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| activityType | `String @db.VarChar(40)` | No | activity type; bounded typed business value, allowlisted where a code. |
| subject | `String @db.VarChar(240)` | No | subject; bounded typed business value, allowlisted where a code. |
| dueAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| completedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| clientId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,clientId)` → ClientAccount `(tenantId,id)`; record/context permission independently required. |
| contactId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,contactId)` → Contact `(tenantId,id)`; record/context permission independently required. |
| leadId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,leadId)` → Lead `(tenantId,id)`; record/context permission independently required. |
| opportunityId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,opportunityId)` → Opportunity `(tenantId,id)`; record/context permission independently required. |

## CommercialContract

Domain: **Sales**. Table: `commercial_contract`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,contractCode)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| contractCode | `String @db.VarChar(80)` | No | contract code; bounded typed business value, allowlisted where a code. |
| clientId | `String @db.Uuid` | No | Composite FK `(tenantId,clientId)` → ClientAccount `(tenantId,id)`; record/context permission independently required. |
| entityId | `String @db.Uuid` | No | Composite FK `(tenantId,entityId)` → LegalEntity `(tenantId,id)`; record/context permission independently required. |

## ContractVersion

Domain: **Sales**. Table: `contract_version`. Sensitivity: **S2**. Lifecycle: **effective**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,contractId,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| validFrom | `DateTime @db.Date` | No | Inclusive business-effective date; not publication/recording date. |
| validTo | `DateTime? @db.Date` | Yes | Exclusive business-effective end; null means unbounded, never zero-length. |
| recordedAt | `DateTime @default(now()) @db.Timestamptz(6)` | No | UTC instant this version became known; used with supersededAt for as-known history. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| amount | `Decimal @db.Decimal(20,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| contractId | `String @db.Uuid` | No | Composite FK `(tenantId,contractId)` → CommercialContract `(tenantId,id)`; record/context permission independently required. |
| approverId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,approverId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| supersededAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC end of system-time validity. Prior content immutable; correction inserts replacement intervals. |

## Quote

Domain: **Sales**. Table: `quote`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,opportunityId,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| amount | `Decimal @db.Decimal(20,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| issuedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| opportunityId | `String @db.Uuid` | No | Composite FK `(tenantId,opportunityId)` → Opportunity `(tenantId,id)`; record/context permission independently required. |
| approverId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,approverId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## CommercialOrder

Domain: **Sales**. Table: `commercial_order`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,orderCode)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| orderCode | `String @db.VarChar(80)` | No | order code; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| acceptedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| currency | `String @db.Char(3)` | No | ISO currency code validated against approved currency registry; never inferred from locale. |
| amount | `Decimal @db.Decimal(20,4)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| quoteId | `String @db.Uuid` | No | Composite FK `(tenantId,quoteId)` → Quote `(tenantId,id)`; record/context permission independently required. |
| contractVersionId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,contractVersionId)` → ContractVersion `(tenantId,id)`; record/context permission independently required. |

## SuccessPlan

Domain: **Customer success**. Table: `success_plan`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: draft, active, blocked, completed, canceled. |
| startedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| completedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| clientId | `String @db.Uuid` | No | Composite FK `(tenantId,clientId)` → ClientAccount `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## SuccessMilestone

Domain: **Customer success**. Table: `success_milestone`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| title | `String @db.VarChar(200)` | No | title; bounded typed business value, allowlisted where a code. |
| dueAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| completedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| planId | `String @db.Uuid` | No | Composite FK `(tenantId,planId)` → SuccessPlan `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## HealthModelVersion

Domain: **Customer success**. Table: `health_model_version`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,modelKey,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| modelKey | `String @db.VarChar(80)` | No | model key; bounded typed business value, allowlisted where a code. |
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| freshnessHours | `Int ` | No | freshness hours; bounded typed business value, allowlisted where a code. |

## HealthFactor

Domain: **Customer success**. Table: `health_factor`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,modelVersionId,factorCode)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| factorCode | `String @db.VarChar(80)` | No | factor code; bounded typed business value, allowlisted where a code. |
| weight | `Decimal @db.Decimal(10,6)` | No | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| sourceMetricCode | `String @db.VarChar(80)` | No | source metric code; bounded typed business value, allowlisted where a code. |
| modelVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,modelVersionId)` → HealthModelVersion `(tenantId,id)`; record/context permission independently required. |

## HealthSnapshot

Domain: **Customer success**. Table: `health_snapshot`. Sensitivity: **S2**. Lifecycle: **append**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| asOf | `DateTime @db.Timestamptz(6)` | No | as of; bounded typed business value, allowlisted where a code. |
| score | `Decimal? @db.Decimal(10,4)` | Yes | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| validUntil | `DateTime @db.Timestamptz(6)` | No | valid until; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| clientId | `String @db.Uuid` | No | Composite FK `(tenantId,clientId)` → ClientAccount `(tenantId,id)`; record/context permission independently required. |
| modelVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,modelVersionId)` → HealthModelVersion `(tenantId,id)`; record/context permission independently required. |

## HealthFactorResult

Domain: **Customer success**. Table: `health_factor_result`. Sensitivity: **S2**. Lifecycle: **append**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,snapshotId,factorId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| value | `Decimal? @db.Decimal(20,6)` | Yes | Exact decimal business quantity/amount/rate; retain stated unit/currency, scale and approved rounding. Never binary float. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| sourceWatermark | `DateTime? @db.Timestamptz(6)` | Yes | source watermark; bounded typed business value, allowlisted where a code. |
| snapshotId | `String @db.Uuid` | No | Composite FK `(tenantId,snapshotId)` → HealthSnapshot `(tenantId,id)`; record/context permission independently required. |
| factorId | `String @db.Uuid` | No | Composite FK `(tenantId,factorId)` → HealthFactor `(tenantId,id)`; record/context permission independently required. |

## Renewal

Domain: **Customer success**. Table: `renewal`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| dueOn | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| confirmedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| renewable | `Boolean ` | No | renewable; bounded typed business value, allowlisted where a code. |
| contractVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,contractVersionId)` → ContractVersion `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## SupportQueue

Domain: **Support**. Table: `support_queue`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,queueCode)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| queueCode | `String @db.VarChar(60)` | No | queue code; bounded typed business value, allowlisted where a code. |
| name | `String @db.VarChar(160)` | No | name; bounded typed business value, allowlisted where a code. |

## SlaPolicyVersion

Domain: **Support**. Table: `sla_policy_version`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,policyKey,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| policyKey | `String @db.VarChar(80)` | No | policy key; bounded typed business value, allowlisted where a code. |
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| responseMinutes | `Int ` | No | response minutes; bounded typed business value, allowlisted where a code. |
| resolutionMinutes | `Int ` | No | resolution minutes; bounded typed business value, allowlisted where a code. |
| calendarVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,calendarVersionId)` → CalendarVersion `(tenantId,id)`; record/context permission independently required. |

## SupportTicket

Domain: **Support**. Table: `support_ticket`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,ticketNumber)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| ticketNumber | `String @db.VarChar(60)` | No | ticket number; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: open, in_progress, waiting, resolved, closed. |
| priority | `String @db.VarChar(30)` | No | priority; bounded typed business value, allowlisted where a code. |
| subject | `String @db.VarChar(240)` | No | subject; bounded typed business value, allowlisted where a code. |
| resolvedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| clientId | `String @db.Uuid` | No | Composite FK `(tenantId,clientId)` → ClientAccount `(tenantId,id)`; record/context permission independently required. |
| requesterId | `String @db.Uuid` | No | Composite FK `(tenantId,requesterId)` → Contact `(tenantId,id)`; record/context permission independently required. |
| queueId | `String @db.Uuid` | No | Composite FK `(tenantId,queueId)` → SupportQueue `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| slaPolicyVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,slaPolicyVersionId)` → SlaPolicyVersion `(tenantId,id)`; record/context permission independently required. |

## TicketReply

Domain: **Support**. Table: `ticket_reply`. Sensitivity: **S3**. Lifecycle: **append**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| bodyCiphertext | `Bytes ` | No | Encrypted sensitive payload with separate key version; never exposed in ordinary DTO. |
| keyVersion | `String @db.VarChar(80)` | No | key version; bounded typed business value, allowlisted where a code. |
| isPublic | `Boolean ` | No | is public; bounded typed business value, allowlisted where a code. |
| isHuman | `Boolean ` | No | is human; bounded typed business value, allowlisted where a code. |
| sentAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| ticketId | `String @db.Uuid` | No | Composite FK `(tenantId,ticketId)` → SupportTicket `(tenantId,id)`; record/context permission independently required. |
| authorId | `String @db.Uuid` | No | Composite FK `(tenantId,authorId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## SlaClockEvent

Domain: **Support**. Table: `sla_clock_event`. Sensitivity: **S3**. Lifecycle: **append**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| eventType | `String @db.VarChar(30)` | No | event type; bounded typed business value, allowlisted where a code. |
| occurredAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| businessMinutes | `Int ` | No | business minutes; bounded typed business value, allowlisted where a code. |
| policyVersion | `Int ` | No | policy version; bounded typed business value, allowlisted where a code. |
| ticketId | `String @db.Uuid` | No | Composite FK `(tenantId,ticketId)` → SupportTicket `(tenantId,id)`; record/context permission independently required. |

## KnowledgeArticle

Domain: **Support**. Table: `knowledge_article`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,articleKey,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| articleKey | `String @db.VarChar(100)` | No | article key; bounded typed business value, allowlisted where a code. |
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| title | `String @db.VarChar(240)` | No | title; bounded typed business value, allowlisted where a code. |
| body | `String @db.VarChar(16000)` | No | body; bounded typed business value, allowlisted where a code. |
| visibility | `String @db.VarChar(30)` | No | visibility; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| publisherId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,publisherId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## CsatInvitation

Domain: **Support**. Table: `csat_invitation`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,ticketId,surveyVersion); (tenantId,tokenHash)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| tokenHash | `String @db.Char(64)` | No | SHA-256 of high-entropy random bearer material; plaintext token is never persisted/logged. |
| surveyVersion | `String @db.VarChar(60)` | No | survey version; bounded typed business value, allowlisted where a code. |
| expiresAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| ticketId | `String @db.Uuid` | No | Composite FK `(tenantId,ticketId)` → SupportTicket `(tenantId,id)`; record/context permission independently required. |

## CsatResponse

Domain: **Support**. Table: `csat_response`. Sensitivity: **S3**. Lifecycle: **append**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,invitationId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| rating | `Int @db.SmallInt` | No | rating; bounded typed business value, allowlisted where a code. |
| respondedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| invitationId | `String @db.Uuid` | No | Composite FK `(tenantId,invitationId)` → CsatInvitation `(tenantId,id)`; record/context permission independently required. |

## ApprovalRequest

Domain: **Approvals**. Table: `approval_request`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. Exactly one typed target enforced; no unconstrained polymorphic foreign key.

Primary key: `(tenantId,id)`. Unique keys: (tenantId,operationKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| operationKey | `String @db.VarChar(160)` | No | operation key; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: pending, approved, rejected, canceled. |
| sourceVersion | `Int ` | No | source version; bounded typed business value, allowlisted where a code. |
| dueAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| requesterId | `String @db.Uuid` | No | Composite FK `(tenantId,requesterId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| placementId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,placementId)` → Placement `(tenantId,id)`; record/context permission independently required. |
| leaveRequestId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,leaveRequestId)` → LeaveRequest `(tenantId,id)`; record/context permission independently required. |
| inputBatchId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,inputBatchId)` → PayrollInputBatch `(tenantId,id)`; record/context permission independently required. |
| payRunId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,payRunId)` → PayRun `(tenantId,id)`; record/context permission independently required. |
| expenseClaimId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,expenseClaimId)` → ExpenseClaim `(tenantId,id)`; record/context permission independently required. |
| quoteId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,quoteId)` → Quote `(tenantId,id)`; record/context permission independently required. |
| lifecycleCaseId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,lifecycleCaseId)` → LifecycleCase `(tenantId,id)`; record/context permission independently required. |
| offerId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,offerId)` → Offer `(tenantId,id)`; record/context permission independently required. |

## ApprovalStep

Domain: **Approvals**. Table: `approval_step`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,requestId,sequence)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| sequence | `Int ` | No | sequence; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: pending, approved, rejected, skipped. |
| decidedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| reasonCode | `String? @db.VarChar(80)` | Yes | reason code; bounded typed business value, allowlisted where a code. |
| requestId | `String @db.Uuid` | No | Composite FK `(tenantId,requestId)` → ApprovalRequest `(tenantId,id)`; record/context permission independently required. |
| approverId | `String @db.Uuid` | No | Composite FK `(tenantId,approverId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## AutomationRuleVersion

Domain: **Automation**. Table: `automation_rule_version`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,ruleKey,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| ruleKey | `String @db.VarChar(80)` | No | rule key; bounded typed business value, allowlisted where a code. |
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| triggerCode | `String @db.VarChar(100)` | No | trigger code; bounded typed business value, allowlisted where a code. |
| conditionSchema | `Json ` | No | condition schema; bounded typed business value, allowlisted where a code. |
| actionSchema | `Json ` | No | action schema; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| maxDepth | `Int ` | No | max depth; bounded typed business value, allowlisted where a code. |
| principalId | `String @db.Uuid` | No | Composite FK `(tenantId,principalId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## AutomationRun

Domain: **Automation**. Table: `automation_run`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,operationKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| operationKey | `String @db.VarChar(160)` | No | operation key; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| depth | `Int ` | No | depth; bounded typed business value, allowlisted where a code. |
| sourceEventId | `String @db.Uuid` | No | source event id; bounded typed business value, allowlisted where a code. |
| ruleVersionId | `String @db.Uuid` | No | Composite FK `(tenantId,ruleVersionId)` → AutomationRuleVersion `(tenantId,id)`; record/context permission independently required. |

## Subscription

Domain: **Commercial**. Table: `subscription`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| planKey | `String @db.VarChar(80)` | No | plan key; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| effectiveAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| endsAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| trialEndsAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| orderReference | `String @db.VarChar(160)` | No | Attributable source/provider/evidence reference; validate type and purpose, not proof of approval by itself. |

## ModuleActivation

Domain: **Commercial**. Table: `module_activation`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,moduleKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| moduleKey | `String @db.VarChar(80)` | No | module key; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: unavailable, inactive, provisioning, active, read_only, suspended. |
| entitlementRevision | `Int ` | No | entitlement revision; bounded typed business value, allowlisted where a code. |
| everActivated | `Boolean ` | No | ever activated; bounded typed business value, allowlisted where a code. |
| changedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |

## EntitlementGrant

Domain: **Commercial**. Table: `entitlement_grant`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| grantKey | `String @db.VarChar(160)` | No | grant key; bounded typed business value, allowlisted where a code. |
| grantType | `String @db.VarChar(30)` | No | grant type; bounded typed business value, allowlisted where a code. |
| limitValue | `BigInt? ` | Yes | limit value; bounded typed business value, allowlisted where a code. |
| sourceCode | `String @db.VarChar(60)` | No | source code; bounded typed business value, allowlisted where a code. |
| effectiveAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| expiresAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| subscriptionId | `String @db.Uuid` | No | Composite FK `(tenantId,subscriptionId)` → Subscription `(tenantId,id)`; record/context permission independently required. |
| approverId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,approverId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## UsageCounter

Domain: **Commercial**. Table: `usage_counter`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,resourceKey,periodKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| resourceKey | `String @db.VarChar(80)` | No | resource key; bounded typed business value, allowlisted where a code. |
| periodKey | `String @db.VarChar(60)` | No | period key; bounded typed business value, allowlisted where a code. |
| used | `BigInt @default(0)` | No | used; bounded typed business value, allowlisted where a code. |
| reserved | `BigInt @default(0)` | No | reserved; bounded typed business value, allowlisted where a code. |
| hardLimit | `BigInt ` | No | hard limit; bounded typed business value, allowlisted where a code. |

## UsageReservation

Domain: **Commercial**. Table: `usage_reservation`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,counterId,operationKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| operationKey | `String @db.VarChar(160)` | No | operation key; bounded typed business value, allowlisted where a code. |
| quantity | `BigInt ` | No | quantity; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: reserved, committed, released, expired. |
| expiresAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| counterId | `String @db.Uuid` | No | Composite FK `(tenantId,counterId)` → UsageCounter `(tenantId,id)`; record/context permission independently required. |

## UsageEvent

Domain: **Commercial**. Table: `usage_event`. Sensitivity: **S1**. Lifecycle: **append**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,counterId,operationKey,eventType)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| operationKey | `String @db.VarChar(160)` | No | operation key; bounded typed business value, allowlisted where a code. |
| quantity | `BigInt ` | No | quantity; bounded typed business value, allowlisted where a code. |
| eventType | `String @db.VarChar(30)` | No | event type; bounded typed business value, allowlisted where a code. |
| occurredAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| counterId | `String @db.Uuid` | No | Composite FK `(tenantId,counterId)` → UsageCounter `(tenantId,id)`; record/context permission independently required. |

## MetricDefinition

Domain: **Analytics**. Table: `metric_definition`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,metricKey,revision)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| metricKey | `String @db.VarChar(80)` | No | metric key; bounded typed business value, allowlisted where a code. |
| revision | `Int ` | No | revision; bounded typed business value, allowlisted where a code. |
| sourceModule | `String @db.VarChar(80)` | No | source module; bounded typed business value, allowlisted where a code. |
| definitionHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |

## SavedView

Domain: **Analytics**. Table: `saved_view`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| name | `String @db.VarChar(160)` | No | name; bounded typed business value, allowlisted where a code. |
| visibility | `String @db.VarChar(30)` | No | visibility; bounded typed business value, allowlisted where a code. |
| filterSchema | `Json ` | No | Validated saved-filter AST; no SQL, arbitrary joins or executable expressions. |
| timeZone | `String @db.VarChar(80)` | No | time zone; bounded typed business value, allowlisted where a code. |
| schemaVersion | `Int ` | No | schema version; bounded typed business value, allowlisted where a code. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| teamId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,teamId)` → Team `(tenantId,id)`; record/context permission independently required. |

## ReportSnapshot

Domain: **Analytics**. Table: `report_snapshot`. Sensitivity: **S3**. Lifecycle: **append**. Scope: **R1**. JSON is validated definition/metric metadata, not a duplicate employee master or raw SQL.

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| asOf | `DateTime @db.Timestamptz(6)` | No | as of; bounded typed business value, allowlisted where a code. |
| sourceWatermark | `DateTime @db.Timestamptz(6)` | No | source watermark; bounded typed business value, allowlisted where a code. |
| scopeHash | `String @db.Char(64)` | No | Fingerprint of authorized row/field scope; current scope must still authorize download. |
| entitlementRevision | `Int ` | No | entitlement revision; bounded typed business value, allowlisted where a code. |
| metricVersions | `Json ` | No | Immutable metric-key/version manifest for reproducible reporting. |
| filterSchema | `Json ` | No | Validated saved-filter AST; no SQL, arbitrary joins or executable expressions. |
| timeZone | `String @db.VarChar(80)` | No | time zone; bounded typed business value, allowlisted where a code. |
| currencyPolicy | `String @db.VarChar(80)` | No | currency policy; bounded typed business value, allowlisted where a code. |
| snapshotHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| expiresAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| requesterId | `String @db.Uuid` | No | Composite FK `(tenantId,requesterId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## ExportArtifact

Domain: **Analytics**. Table: `export_artifact`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| format | `String @db.VarChar(10)` | No | format; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: pending, generating, ready, failed, expired. |
| objectKey | `String @db.VarChar(500)` | No | object key; bounded typed business value, allowlisted where a code. |
| objectVersion | `String @db.VarChar(200)` | No | object version; bounded typed business value, allowlisted where a code. |
| contentHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| rowCount | `Int ` | No | row count; bounded typed business value, allowlisted where a code. |
| classification | `String @db.VarChar(2)` | No | classification; bounded typed business value, allowlisted where a code. |
| expiresAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| snapshotId | `String @db.Uuid` | No | Composite FK `(tenantId,snapshotId)` → ReportSnapshot `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## DownloadGrant

Domain: **Analytics**. Table: `download_grant`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,tokenHash)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| tokenHash | `String @db.Char(64)` | No | SHA-256 of high-entropy random bearer material; plaintext token is never persisted/logged. |
| expiresAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| scopeHash | `String @db.Char(64)` | No | Fingerprint of authorized row/field scope; current scope must still authorize download. |
| artifactId | `String @db.Uuid` | No | Composite FK `(tenantId,artifactId)` → ExportArtifact `(tenantId,id)`; record/context permission independently required. |
| membershipId | `String @db.Uuid` | No | Composite FK `(tenantId,membershipId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## ReportSchedule

Domain: **Analytics**. Table: `report_schedule`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| cronExpression | `String @db.VarChar(100)` | No | cron expression; bounded typed business value, allowlisted where a code. |
| timeZone | `String @db.VarChar(80)` | No | time zone; bounded typed business value, allowlisted where a code. |
| dstPolicy | `String @db.VarChar(30)` | No | dst policy; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| nextRunAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| viewId | `String @db.Uuid` | No | Composite FK `(tenantId,viewId)` → SavedView `(tenantId,id)`; record/context permission independently required. |
| ownerId | `String @db.Uuid` | No | Composite FK `(tenantId,ownerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## ReportRecipient

Domain: **Analytics**. Table: `report_recipient`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,scheduleId,membershipId,format)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| format | `String @db.VarChar(10)` | No | format; bounded typed business value, allowlisted where a code. |
| scheduleId | `String @db.Uuid` | No | Composite FK `(tenantId,scheduleId)` → ReportSchedule `(tenantId,id)`; record/context permission independently required. |
| membershipId | `String @db.Uuid` | No | Composite FK `(tenantId,membershipId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## Connector

Domain: **Integrations**. Table: `connector`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| packageKey | `String @db.VarChar(80)` | No | package key; bounded typed business value, allowlisted where a code. |
| providerCode | `String @db.VarChar(80)` | No | provider code; bounded typed business value, allowlisted where a code. |
| providerVersion | `String @db.VarChar(60)` | No | provider version; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| secretReference | `String? @db.VarChar(500)` | Yes | Attributable source/provider/evidence reference; validate type and purpose, not proof of approval by itself. |
| cursorCiphertext | `Bytes? ` | Yes | Encrypted sensitive payload with separate key version; never exposed in ordinary DTO. |
| principalId | `String @db.Uuid` | No | Composite FK `(tenantId,principalId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## ExternalMapping

Domain: **Integrations**. Table: `external_mapping`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. objectType allowlist resolves typed owner-domain lookups; not accepted as a client-supplied arbitrary FK.

Primary key: `(tenantId,id)`. Unique keys: (tenantId,connectorId,objectType,externalKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| objectType | `String @db.VarChar(100)` | No | object type; bounded typed business value, allowlisted where a code. |
| externalKey | `String @db.VarChar(200)` | No | external key; bounded typed business value, allowlisted where a code. |
| recordId | `String @db.Uuid` | No | record id; bounded typed business value, allowlisted where a code. |
| sourceVersion | `String @db.VarChar(100)` | No | source version; bounded typed business value, allowlisted where a code. |
| sourceUpdatedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| connectorId | `String @db.Uuid` | No | Composite FK `(tenantId,connectorId)` → Connector `(tenantId,id)`; record/context permission independently required. |

## ImportBatch

Domain: **Integrations**. Table: `import_batch`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,idempotencyKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| sourceProfile | `String @db.VarChar(80)` | No | Registered source-system/profile namespace. |
| sourceHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| idempotencyKey | `String @db.VarChar(160)` | No | idempotency key; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: staged, validating, ready, committing, committed, failed, expired. |
| rowCount | `Int ` | No | row count; bounded typed business value, allowlisted where a code. |
| errorCount | `Int ` | No | error count; bounded typed business value, allowlisted where a code. |
| stagingObjectKey | `String @db.VarChar(500)` | No | staging object key; bounded typed business value, allowlisted where a code. |
| expiresAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| requesterId | `String @db.Uuid` | No | Composite FK `(tenantId,requesterId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## ImportError

Domain: **Integrations**. Table: `import_error`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. Never stores raw CSV rows/secret values.

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| rowNumber | `Int ` | No | row number; bounded typed business value, allowlisted where a code. |
| columnKey | `String @db.VarChar(100)` | No | column key; bounded typed business value, allowlisted where a code. |
| errorCode | `String @db.VarChar(80)` | No | error code; bounded typed business value, allowlisted where a code. |
| batchId | `String @db.Uuid` | No | Composite FK `(tenantId,batchId)` → ImportBatch `(tenantId,id)`; record/context permission independently required. |

## IdempotencyRecord

Domain: **Reliability**. Table: `idempotency_record`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,actorId,operationType,idempotencyKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| operationType | `String @db.VarChar(100)` | No | operation type; bounded typed business value, allowlisted where a code. |
| idempotencyKey | `String @db.VarChar(160)` | No | idempotency key; bounded typed business value, allowlisted where a code. |
| payloadHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| resourceType | `String? @db.VarChar(80)` | Yes | resource type; bounded typed business value, allowlisted where a code. |
| resourceId | `String? @db.Uuid` | Yes | resource id; bounded typed business value, allowlisted where a code. |
| expiresAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| actorId | `String @db.Uuid` | No | Composite FK `(tenantId,actorId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## OutboxEvent

Domain: **Reliability**. Table: `outbox_event`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **R1**. Payload schema allowlist; opaque refs/minimum facts, never unrestricted personal data.

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| eventType | `String @db.VarChar(100)` | No | event type; bounded typed business value, allowlisted where a code. |
| schemaVersion | `Int ` | No | schema version; bounded typed business value, allowlisted where a code. |
| aggregateType | `String @db.VarChar(80)` | No | aggregate type; bounded typed business value, allowlisted where a code. |
| aggregateId | `String @db.Uuid` | No | aggregate id; bounded typed business value, allowlisted where a code. |
| aggregateVersion | `Int ` | No | aggregate version; bounded typed business value, allowlisted where a code. |
| occurredAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| correlationId | `String @db.Uuid` | No | correlation id; bounded typed business value, allowlisted where a code. |
| payload | `Json ` | No | Versioned allowlisted event metadata; minimum facts/IDs, no free-form personal-data dump. |
| dispatchedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |

## InboxEvent

Domain: **Reliability**. Table: `inbox_event`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,consumerKey,externalEventKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| consumerKey | `String @db.VarChar(100)` | No | consumer key; bounded typed business value, allowlisted where a code. |
| externalEventKey | `String @db.VarChar(200)` | No | external event key; bounded typed business value, allowlisted where a code. |
| payloadHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| receivedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |

## BackgroundJob

Domain: **Reliability**. Table: `background_job`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,operationKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| operationKey | `String @db.VarChar(160)` | No | operation key; bounded typed business value, allowlisted where a code. |
| jobType | `String @db.VarChar(100)` | No | job type; bounded typed business value, allowlisted where a code. |
| moduleKey | `String @db.VarChar(80)` | No | module key; bounded typed business value, allowlisted where a code. |
| resourceType | `String @db.VarChar(80)` | No | resource type; bounded typed business value, allowlisted where a code. |
| resourceId | `String @db.Uuid` | No | resource id; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. Values: pending, running, succeeded, retryable_failed, outcome_unknown, dead_letter, canceled. |
| attemptCount | `Int @default(0)` | No | attempt count; bounded typed business value, allowlisted where a code. |
| availableAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| leaseExpiresAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| lastErrorCode | `String? @db.VarChar(80)` | Yes | last error code; bounded typed business value, allowlisted where a code. |
| principalId | `String @db.Uuid` | No | Composite FK `(tenantId,principalId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## NotificationDelivery

Domain: **Notifications**. Table: `notification_delivery`. Sensitivity: **S2**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,operationKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| operationKey | `String @db.VarChar(160)` | No | operation key; bounded typed business value, allowlisted where a code. |
| channel | `String @db.VarChar(30)` | No | channel; bounded typed business value, allowlisted where a code. |
| state | `String @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| providerReference | `String? @db.VarChar(200)` | Yes | Attributable source/provider/evidence reference; validate type and purpose, not proof of approval by itself. |
| attemptedAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| deliveredAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| jobId | `String @db.Uuid` | No | Composite FK `(tenantId,jobId)` → BackgroundJob `(tenantId,id)`; record/context permission independently required. |
| recipientId | `String @db.Uuid` | No | Composite FK `(tenantId,recipientId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## AuditEvent

Domain: **Audit**. Table: `audit_event`. Sensitivity: **S1**. Lifecycle: **append**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| action | `String @db.VarChar(100)` | No | action; bounded typed business value, allowlisted where a code. |
| resourceType | `String @db.VarChar(100)` | No | resource type; bounded typed business value, allowlisted where a code. |
| resourceId | `String? @db.Uuid` | Yes | resource id; bounded typed business value, allowlisted where a code. |
| occurredAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| correlationId | `String @db.Uuid` | No | correlation id; bounded typed business value, allowlisted where a code. |
| membershipRevision | `Int ` | No | membership revision; bounded typed business value, allowlisted where a code. |
| entitlementRevision | `Int ` | No | entitlement revision; bounded typed business value, allowlisted where a code. |
| reasonCode | `String? @db.VarChar(80)` | Yes | reason code; bounded typed business value, allowlisted where a code. |
| redactedChanges | `Json ` | No | Allowlisted redacted audit delta; no credentials or unrestricted personal values. |
| actorId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,actorId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## RuleProposal

Domain: **Compliance**. Table: `rule_proposal`. Sensitivity: **S1**. Lifecycle: **mutable**. Scope: **Later**. Mutable review proposal; approved publication inserts an immutable RuleVersion.

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| semanticVersion | `String @db.VarChar(30)` | No | semantic version; bounded typed business value, allowlisted where a code. |
| coverageCode | `String @db.VarChar(100)` | No | coverage code; bounded typed business value, allowlisted where a code. |
| sourceUrl | `String @db.VarChar(1000)` | No | source url; bounded typed business value, allowlisted where a code. |
| sourceHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| fixtureHash | `String? @db.Char(64)` | Yes | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| adapterDigest | `String? @db.Char(64)` | Yes | adapter digest; bounded typed business value, allowlisted where a code. |
| proposedValidFrom | `DateTime @db.Date` | No | proposed valid from; bounded typed business value, allowlisted where a code. |
| proposedValidTo | `DateTime? @db.Date` | Yes | proposed valid to; bounded typed business value, allowlisted where a code. |
| state | `String @default("draft") @db.VarChar(30)` | No | Domain lifecycle code; only named command transitions are allowed, never generic PATCH. |
| packId | `String @db.Uuid` | No | Composite FK `(tenantId,packId)` → JurisdictionPack `(tenantId,id)`; record/context permission independently required. |
| legalReviewerId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,legalReviewerId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| engineeringReviewerId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,engineeringReviewerId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## PlacementTransition

Domain: **Agency**. Table: `placement_transition`. Sensitivity: **S2**. Lifecycle: **append**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,placementId,toVersion)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| fromStatus | `String @db.VarChar(30)` | No | from status; bounded typed business value, allowlisted where a code. |
| toStatus | `String @db.VarChar(30)` | No | to status; bounded typed business value, allowlisted where a code. |
| fromVersion | `Int ` | No | from version; bounded typed business value, allowlisted where a code. |
| toVersion | `Int ` | No | to version; bounded typed business value, allowlisted where a code. |
| actualStart | `DateTime? @db.Date` | Yes | Confirmed business date, not permit approval or pay enrollment. |
| previousActualStart | `DateTime? @db.Date` | Yes | previous actual start; bounded typed business value, allowlisted where a code. |
| reasonCode | `String @db.VarChar(80)` | No | reason code; bounded typed business value, allowlisted where a code. |
| occurredAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| placementId | `String @db.Uuid` | No | Composite FK `(tenantId,placementId)` → Placement `(tenantId,id)`; record/context permission independently required. |
| actorId | `String @db.Uuid` | No | Composite FK `(tenantId,actorId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## ReportMetricBinding

Domain: **Analytics**. Table: `report_metric_binding`. Sensitivity: **S1**. Lifecycle: **append**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,snapshotId,metricId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| definitionHash | `String @db.Char(64)` | No | Hex-encoded integrity/deduplication fingerprint; no raw source contents or token. |
| snapshotId | `String @db.Uuid` | No | Composite FK `(tenantId,snapshotId)` → ReportSnapshot `(tenantId,id)`; record/context permission independently required. |
| metricId | `String @db.Uuid` | No | Composite FK `(tenantId,metricId)` → MetricDefinition `(tenantId,id)`; record/context permission independently required. |

## ReportResultRow

Domain: **Analytics**. Table: `report_result_row`. Sensitivity: **S3**. Lifecycle: **append**. Scope: **R1**. Versioned allowlisted immutable report result projection, not a new employee master; expires with snapshot. Reauthorize current source scope before every read/download.

Primary key: `(tenantId,id)`. Unique keys: (tenantId,snapshotId,rowKey)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| rowKey | `String @db.VarChar(160)` | No | row key; bounded typed business value, allowlisted where a code. |
| sourceType | `String @db.VarChar(100)` | No | source type; bounded typed business value, allowlisted where a code. |
| sourceId | `String? @db.Uuid` | Yes | source id; bounded typed business value, allowlisted where a code. |
| sourceVersion | `Int? ` | Yes | source version; bounded typed business value, allowlisted where a code. |
| projection | `Json ` | No | projection; bounded typed business value, allowlisted where a code. |
| classification | `String @db.VarChar(2)` | No | classification; bounded typed business value, allowlisted where a code. |
| snapshotId | `String @db.Uuid` | No | Composite FK `(tenantId,snapshotId)` → ReportSnapshot `(tenantId,id)`; record/context permission independently required. |

## PersonMembershipLink

Domain: **Identity**. Table: `person_membership_link`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **Later**. Explicit verified self-service mapping, never inferred solely from an email match.

Primary key: `(tenantId,id)`. Unique keys: (tenantId,membershipId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| verifiedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| purposeCode | `String @db.VarChar(60)` | No | purpose code; bounded typed business value, allowlisted where a code. |
| personId | `String @db.Uuid` | No | Composite FK `(tenantId,personId)` → Person `(tenantId,id)`; record/context permission independently required. |
| membershipId | `String @db.Uuid` | No | Composite FK `(tenantId,membershipId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| verifiedById | `String @db.Uuid` | No | Composite FK `(tenantId,verifiedById)` → Membership `(tenantId,id)`; record/context permission independently required. |

## ContactMembershipLink

Domain: **Identity**. Table: `contact_membership_link`. Sensitivity: **S3**. Lifecycle: **mutable**. Scope: **R1**. 

Primary key: `(tenantId,id)`. Unique keys: (tenantId,contactId,membershipId)

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| verifiedAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| contactId | `String @db.Uuid` | No | Composite FK `(tenantId,contactId)` → Contact `(tenantId,id)`; record/context permission independently required. |
| membershipId | `String @db.Uuid` | No | Composite FK `(tenantId,membershipId)` → Membership `(tenantId,id)`; record/context permission independently required. |
| verifiedById | `String @db.Uuid` | No | Composite FK `(tenantId,verifiedById)` → Membership `(tenantId,id)`; record/context permission independently required. |

## EmploymentLifecycleEvent

Domain: **HR**. Table: `employment_lifecycle_event`. Sensitivity: **S2**. Lifecycle: **append**. Scope: **Later**. Backdated employment status/termination correction evidence; current Employment status is a projection, not a historical headcount filter.

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| fromStatus | `String @db.VarChar(30)` | No | from status; bounded typed business value, allowlisted where a code. |
| toStatus | `String @db.VarChar(30)` | No | to status; bounded typed business value, allowlisted where a code. |
| effectiveOn | `DateTime @db.Date` | No | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| previousEndDate | `DateTime? @db.Date` | Yes | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| newEndDate | `DateTime? @db.Date` | Yes | Explicit business date in the owning entity/record calendar; no midnight-UTC coercion. |
| occurredAt | `DateTime @db.Timestamptz(6)` | No | UTC lifecycle/evidence instant; emitted by authorized command, not trusted client audit data. |
| reasonCode | `String @db.VarChar(80)` | No | reason code; bounded typed business value, allowlisted where a code. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| actorId | `String @db.Uuid` | No | Composite FK `(tenantId,actorId)` → Membership `(tenantId,id)`; record/context permission independently required. |

## OrganizationAssignment

Domain: **HR**. Table: `organization_assignment`. Sensitivity: **S2**. Lifecycle: **effective**. Scope: **Later**. Historical reporting line/position/team; validate cycles and entity scopes at effective date.

Primary key: `(tenantId,id)`. Unique keys: No additional natural-key uniqueness; never infer email uniqueness.

| Field | Prisma / PostgreSQL representation | Nullable | Meaning / validation |
|---|---|---|---|
| validFrom | `DateTime @db.Date` | No | Inclusive business-effective date; not publication/recording date. |
| validTo | `DateTime? @db.Date` | Yes | Exclusive business-effective end; null means unbounded, never zero-length. |
| recordedAt | `DateTime @default(now()) @db.Timestamptz(6)` | No | UTC instant this version became known; used with supersededAt for as-known history. |
| employmentId | `String @db.Uuid` | No | Composite FK `(tenantId,employmentId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| teamId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,teamId)` → Team `(tenantId,id)`; record/context permission independently required. |
| positionId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,positionId)` → Position `(tenantId,id)`; record/context permission independently required. |
| managerId | `String? @db.Uuid` | Yes | Composite FK `(tenantId,managerId)` → Employment `(tenantId,id)`; record/context permission independently required. |
| supersededAt | `DateTime? @db.Timestamptz(6)` | Yes | UTC end of system-time validity. Prior content immutable; correction inserts replacement intervals. |

## Implemented R1 continuation delta — 2 November 2026

The preserved full-vision design above is not silently regenerated. The deployable R1 `ReportSnapshot` gains nullable `summary` JSONB: `{schemaVersion:1,metrics,drilldowns,distribution,rowCount}`. This is a private derived report record, carrying the same sensitive source classification and original seven-day expiry as its projections. It contains historical central KPI values and drill-down IDs, not new payroll/financial data. Tenant ownership, requester FK, forced RLS and append-only trigger remain unchanged. Null identifies pre-migration snapshots; no automatic backfill/reinterpretation is performed. The existing C2-versus-S0–S3 classification review remains P6-G04. No change to the full-vision Prisma schema.
