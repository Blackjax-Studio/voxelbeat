-- Enable RLS on tracks table
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all tracks (for public landing page)
CREATE POLICY "Allow public read access to tracks"
ON tracks
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow users to insert their own tracks
CREATE POLICY "Users can insert their own tracks"
ON tracks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own tracks
CREATE POLICY "Users can update their own tracks"
ON tracks
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own tracks
CREATE POLICY "Users can delete their own tracks"
ON tracks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read user profiles
CREATE POLICY "Allow public read access to user profiles"
ON users
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
