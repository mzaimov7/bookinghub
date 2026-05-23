UPDATE business_profiles
SET address = 'Адрес не е въведен'
WHERE address IS NULL OR TRIM(address) = '';

ALTER TABLE business_profiles
MODIFY COLUMN address VARCHAR(255) NOT NULL;
