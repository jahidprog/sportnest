-- +migrate Down

DROP INDEX IF EXISTS idx_orders_created_at;
DROP INDEX IF EXISTS idx_orders_shipping_phone;
ALTER TABLE orders
    DROP COLUMN IF EXISTS delivery_instructions,
    DROP COLUMN IF EXISTS delivery_landmark,
    DROP COLUMN IF EXISTS delivery_postal_code,
    DROP COLUMN IF EXISTS delivery_area,
    DROP COLUMN IF EXISTS delivery_city,
    DROP COLUMN IF EXISTS recipient_email,
    DROP COLUMN IF EXISTS recipient_name;
