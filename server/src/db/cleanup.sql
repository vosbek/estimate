-- Drop all tables
DROP TABLE IF EXISTS estimation_team_hours CASCADE;
DROP TABLE IF EXISTS estimation_answers CASCADE;
DROP TABLE IF EXISTS estimation_results CASCADE;
DROP TABLE IF EXISTS question_impacts CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS estimation_flows CASCADE;
DROP TABLE IF EXISTS team_multipliers CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- Drop enum types
DROP TYPE IF EXISTS estimation_path CASCADE;
DROP TYPE IF EXISTS question_type CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS create_enum_if_not_exists CASCADE; 