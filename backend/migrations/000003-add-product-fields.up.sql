-- +migrate Up

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

ALTER TABLE products
    ADD COLUMN stock INT NOT NULL DEFAULT 0,
    ADD COLUMN sizes TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN discount_price DOUBLE PRECISION,
    ADD COLUMN category_id INT REFERENCES categories(id) ON DELETE SET NULL;

-- discount_price must be a real discount, never >= the regular price.
ALTER TABLE products
    ADD CONSTRAINT discount_price_below_price
    CHECK (discount_price IS NULL OR discount_price < price);

INSERT INTO categories (name, slug) VALUES
    ('Match Jerseys', 'jerseys'),
    ('Jersey Pants', 'jersey-pants'),
    ('Training Tees', 'tshirts');
