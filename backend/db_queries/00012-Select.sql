-- Get all users
SELECT * FROM users;

-- Get user by id
SELECT 
    id, 
    first_name, 
    last_name, 
    email, 
    is_shop_owner, 
    created_at, 
    updated_at
FROM users
WHERE id = :id;

-- Get user by email
SELECT 
    id, 
    first_name, 
    last_name, 
    email, 
    password, 
    is_shop_owner
FROM users
WHERE email = :email;

-- Get all products
SELECT id, title, description, price, img_url, created_at, updated_at
FROM products;

-- Get product by id
SELECT id, title, description, price, img_url, created_at, updated_at
FROM products
WHERE id = :id;

-- Search products by title (case-insensitive)
SELECT id, title, description, price, img_url
FROM products
WHERE LOWER(title) LIKE LOWER('%' || :title || '%');
