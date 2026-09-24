-- +migrate Up

ALTER TABLE orders
    ADD COLUMN recipient_name VARCHAR(200) NOT NULL DEFAULT '',
    ADD COLUMN recipient_email VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN delivery_city VARCHAR(120) NOT NULL DEFAULT '',
    ADD COLUMN delivery_area VARCHAR(160) NOT NULL DEFAULT '',
    ADD COLUMN delivery_postal_code VARCHAR(30) NOT NULL DEFAULT '',
    ADD COLUMN delivery_landmark VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN delivery_instructions TEXT NOT NULL DEFAULT '';

CREATE INDEX idx_orders_shipping_phone ON orders(shipping_phone);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
