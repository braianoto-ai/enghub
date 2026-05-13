-- Testimonials: curated quotes added by the professional
CREATE TABLE IF NOT EXISTS testimonials (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  author_name  TEXT NOT NULL,
  author_title TEXT,          -- e.g. "CEO at Construtora XYZ"
  content      TEXT NOT NULL,
  avatar_url   TEXT,
  featured     BOOLEAN DEFAULT FALSE,
  position     INT DEFAULT 0, -- display order
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_tenant_id ON testimonials(tenant_id);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read testimonials
CREATE POLICY "Anyone can view testimonials"
  ON testimonials FOR SELECT
  USING (true);

-- Only the tenant owner can manage their testimonials
CREATE POLICY "Owners can manage own testimonials"
  ON testimonials FOR ALL
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );
