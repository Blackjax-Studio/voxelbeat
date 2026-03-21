-- Add profile fields to users table
ALTER TABLE users
ADD COLUMN studio_name VARCHAR(255),
ADD COLUMN bio TEXT,
ADD COLUMN spotify_link VARCHAR(500),
ADD COLUMN soundcloud_link VARCHAR(500),
ADD COLUMN discord_username VARCHAR(255),
ADD COLUMN discord_server_link VARCHAR(500),
ADD COLUMN instagram_link VARCHAR(500),
ADD COLUMN contact_email VARCHAR(255),
ADD COLUMN phone_number VARCHAR(50),
ADD COLUMN itch_io_link VARCHAR(500),
ADD COLUMN website_link VARCHAR(500);
