-- Migration: Allow same slug under different parents
-- Enforce uniqueness for root slugs and for (parentId, slug) among children

CREATE UNIQUE INDEX IF NOT EXISTS unique_root_category_slug
ON "Category" ("slug")
WHERE "parentId" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_parent_slug
ON "Category" ("parentId", "slug")
WHERE "parentId" IS NOT NULL;
