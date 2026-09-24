-- +migrate Down

ALTER TABLE products
    DROP CONSTRAINT IF EXISTS discount_price_below_price,
    DROP COLUMN IF EXISTS stock,
    DROP COLUMN IF EXISTS sizes,
    DROP COLUMN IF EXISTS discount_price,
    DROP COLUMN IF EXISTS category_id;

DROP TABLE IF EXISTS categories;
