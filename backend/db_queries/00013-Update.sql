-- Update user info by id
UPDATE users
SET
    first_name = :first_name,
    last_name  = :last_name,
    email      = :email,
    password   = :password,
    is_shop_owner = :is_shop_owner,
    updated_at = CURRENT_TIMESTAMP
WHERE id = :id
RETURNING *;
