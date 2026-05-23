ALTER TABLE business_profiles
  ADD COLUMN company_eik VARCHAR(30) NULL AFTER business_name,
  ADD COLUMN company_representative VARCHAR(160) NULL AFTER company_eik;
