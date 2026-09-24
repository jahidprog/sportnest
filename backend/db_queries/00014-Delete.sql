-- Delete user by id
DELETE FROM users
WHERE id = :id
RETURNING id;

-- Delete product by id
DELETE FROM products
WHERE id = :id
RETURNING id;
