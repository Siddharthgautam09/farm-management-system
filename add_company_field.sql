-- Add company_name field to feeding_logs table
ALTER TABLE feeding_logs 
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Add a comment to the column
COMMENT ON COLUMN feeding_logs.company_name IS 'Name of the company that supplied the feed';
