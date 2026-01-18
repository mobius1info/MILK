/*
  # Create Keep-Alive System
  
  1. New Features
    - Enable pg_cron extension for scheduled tasks
    - Create keep-alive function that runs every 5 days
    - Create activity log table to track database pings
  
  2. Security
    - Only allow system to insert into activity_log
    - Enable RLS on activity_log table
*/

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow admins to view activity logs
CREATE POLICY "Admins can view activity logs"
  ON activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create keep-alive function
CREATE OR REPLACE FUNCTION keep_database_active()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert activity record
  INSERT INTO activity_log (activity_type, details)
  VALUES (
    'keep_alive_ping',
    jsonb_build_object(
      'timestamp', now(),
      'user_count', (SELECT COUNT(*) FROM profiles),
      'vip_purchases_count', (SELECT COUNT(*) FROM vip_purchases)
    )
  );
  
  -- Clean up old logs (keep only last 30 days)
  DELETE FROM activity_log
  WHERE created_at < now() - interval '30 days';
END;
$$;

-- Schedule keep-alive to run every 5 days
-- This prevents Supabase free tier from pausing the database (happens after 7 days of inactivity)
SELECT cron.schedule(
  'keep-database-active',
  '0 0 */5 * *',  -- Every 5 days at midnight
  'SELECT keep_database_active();'
);

-- Run immediately to test
SELECT keep_database_active();
