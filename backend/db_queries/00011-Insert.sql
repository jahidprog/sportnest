-- Insert into users
INSERT INTO users (
    first_name, 
    last_name, 
    email, 
    password, 
    is_shop_owner)
VALUES (
    :first_name, 
    :last_name, 
    :email, :password, 
    :is_shop_owner
    )

RETURNING id;


-- Insert into products
INSERT INTO products (
    title, 
    description, 
    price, 
    img_url)
VALUES (
    :title, 
    :description, 
    :price, 
    :img_url)

RETURNING id;
