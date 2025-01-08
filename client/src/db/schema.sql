-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS work_units CASCADE;
DROP TABLE IF EXISTS node_options CASCADE;
DROP TABLE IF EXISTS template_nodes CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TYPE IF EXISTS node_type CASCADE;
DROP TYPE IF EXISTS template_category CASCADE;

-- Create custom types
CREATE TYPE node_type AS ENUM ('decision', 'leaf');
CREATE TYPE template_category AS ENUM ('insurance', 'banking', 'other');

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_hours INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    complexity VARCHAR(50),
    estimated_duration VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Decision tree nodes
CREATE TABLE IF NOT EXISTS template_nodes (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES templates(id) ON DELETE CASCADE,
    node_type node_type NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Node options (for question nodes)
CREATE TABLE IF NOT EXISTS node_options (
    id SERIAL PRIMARY KEY,
    node_id INTEGER REFERENCES template_nodes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    next_node_id INTEGER REFERENCES template_nodes(id),
    display_order INTEGER DEFAULT 0
);

-- Work units
CREATE TABLE IF NOT EXISTS work_units (
    id VARCHAR(50) PRIMARY KEY,
    node_id INTEGER REFERENCES template_nodes(id) ON DELETE CASCADE,
    team_id VARCHAR(50) REFERENCES teams(id),
    name VARCHAR(255) NOT NULL,
    hours INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_templates_timestamp
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_template_nodes_timestamp
    BEFORE UPDATE ON template_nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_work_units_timestamp
    BEFORE UPDATE ON work_units
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active);
CREATE INDEX IF NOT EXISTS idx_template_nodes_template ON template_nodes(template_id);
CREATE INDEX IF NOT EXISTS idx_node_options_node ON node_options(node_id);
CREATE INDEX IF NOT EXISTS idx_work_units_node ON work_units(node_id);

-- Insert mock teams
INSERT INTO teams (id, name, base_hours) VALUES
('insurance-config', 'Insurance Configuration', 0),
('integration', 'Integration', 0),
('frontend', 'Frontend', 0),
('backend', 'Backend', 0),
('qa', 'QA', 0),
('documentation', 'Documentation', 0),
('compliance', 'Compliance', 0);

-- Insert mock work units
INSERT INTO work_units (id, name, team_id, hours) VALUES
('wu1', 'Basic Configuration', 'insurance-config', 8),
('wu2', 'Complex Configuration', 'insurance-config', 16),
('wu3', 'Integration Setup', 'integration', 24),
('wu4', 'UI Development', 'frontend', 16),
('wu5', 'API Development', 'backend', 24),
('wu6', 'Testing & QA', 'qa', 16),
('wu7', 'Documentation', 'documentation', 8),
('wu8', 'Compliance Review', 'compliance', 16); 