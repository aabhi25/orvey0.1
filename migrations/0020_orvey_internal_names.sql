-- Orvey rename: chroney_enabled -> orvey_enabled, product tier values 'chroney' -> 'orvey'.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'business_accounts' AND column_name = 'chroney_enabled'
  ) THEN
    ALTER TABLE "business_accounts" RENAME COLUMN "chroney_enabled" TO "orvey_enabled";
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "business_accounts" ALTER COLUMN "product_tier" SET DEFAULT 'orvey';--> statement-breakpoint
UPDATE "business_accounts" SET "product_tier" = 'orvey' WHERE "product_tier" = 'chroney';--> statement-breakpoint
UPDATE "business_accounts" SET "product_tier" = 'jewelry_showcase_orvey' WHERE "product_tier" = 'jewelry_showcase_chroney';
