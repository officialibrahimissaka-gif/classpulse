-- Paystack test-mode observations, never entitlement grants or invoice/tax calculation.
DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='app_billing_importer') THEN CREATE ROLE app_billing_importer NOLOGIN NOSUPERUSER NOBYPASSRLS; END IF; END $$;
GRANT USAGE ON SCHEMA public,app TO app_billing_importer;
GRANT EXECUTE ON FUNCTION app.tenant_id() TO app_billing_importer;
CREATE TABLE billing_connection (
 tenant_id uuid PRIMARY KEY REFERENCES tenant(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
 provider_customer_id varchar(100) UNIQUE NOT NULL CHECK(provider_customer_id ~ '^CUS_[A-Za-z0-9]+$'),
 reviewed_reference varchar(160) NOT NULL CHECK(length(reviewed_reference)>=8),
 created_at timestamptz(6) NOT NULL DEFAULT now(), synced_at timestamptz(6)
);
CREATE TABLE billing_payment (
 tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
 provider_reference varchar(100) NOT NULL UNIQUE CHECK(provider_reference ~ '^[A-Za-z0-9._=-]{1,100}$'),
 status varchar(30) NOT NULL CHECK(status IN ('success','failed','abandoned','ongoing','pending','processing','queued','reversed')),
 currency char(3) NOT NULL CHECK(currency IN ('NGN','GHS','ZAR','KES','USD')),
 amount_minor bigint NOT NULL CHECK(amount_minor>=0),
 paid_at timestamptz(6),synced_at timestamptz(6) NOT NULL,
 PRIMARY KEY(tenant_id,provider_reference)
);
CREATE INDEX billing_payment_tenant_id_synced_at_provider_reference_idx ON billing_payment(tenant_id,synced_at,provider_reference);
ALTER TABLE billing_connection ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_connection FORCE ROW LEVEL SECURITY;
ALTER TABLE billing_payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_payment FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_boundary ON billing_connection TO app_runtime,app_billing_importer USING(tenant_id=app.tenant_id()) WITH CHECK(tenant_id=app.tenant_id());
CREATE POLICY tenant_boundary ON billing_payment TO app_runtime,app_billing_importer USING(tenant_id=app.tenant_id()) WITH CHECK(tenant_id=app.tenant_id());
GRANT SELECT ON billing_connection,billing_payment TO app_runtime;
GRANT SELECT,INSERT ON billing_connection TO app_billing_importer;
GRANT UPDATE(synced_at) ON billing_connection TO app_billing_importer;
GRANT SELECT,INSERT ON billing_payment TO app_billing_importer;
GRANT UPDATE(status,paid_at,synced_at) ON billing_payment TO app_billing_importer;
GRANT INSERT ON audit_event TO app_billing_importer;
CREATE POLICY billing_audit_insert ON audit_event FOR INSERT TO app_billing_importer WITH CHECK(tenant_id=app.tenant_id());
-- Customer bindings, references, currencies and amounts are immutable to importer updates.
