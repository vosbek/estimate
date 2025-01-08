-- Create enum types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estimation_path') THEN
        CREATE TYPE estimation_path AS ENUM (
            'NEW_LIFE_PRODUCT',
            'EXISTING_LIFE_PRODUCT',
            'ADD_RIDER',
            'CHANGE_STATIC_CONTENT',
            'ADD_FILE_TRANSFER'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'node_type') THEN
        CREATE TYPE node_type AS ENUM (
            'decision',
            'leaf'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
        CREATE TYPE question_type AS ENUM (
            'SINGLE_SELECT',
            'MULTI_SELECT',
            'YES_NO',
            'NUMBER'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'template_category') THEN
        CREATE TYPE template_category AS ENUM (
            'insurance',
            'banking',
            'other'
        );
    END IF;
END $$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create tables
CREATE TABLE IF NOT EXISTS completed_intakes (
    id SERIAL PRIMARY KEY,
    entry_point_id INTEGER,
    template_id INTEGER,
    answers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entry_points (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_id INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS estimation_answers (
    id SERIAL PRIMARY KEY,
    result_id UUID,
    question_id VARCHAR(50),
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS estimation_flows (
    id VARCHAR(50) PRIMARY KEY,
    path estimation_path NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS estimation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path estimation_path NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS estimation_team_hours (
    id SERIAL PRIMARY KEY,
    result_id UUID,
    team_id VARCHAR(50),
    hours NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS node_options (
    id SERIAL PRIMARY KEY,
    node_id INTEGER,
    text TEXT NOT NULL,
    next_node_id INTEGER,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS question_impacts (
    id SERIAL PRIMARY KEY,
    question_id VARCHAR(50),
    team_id VARCHAR(50),
    condition TEXT NOT NULL,
    multiplier NUMERIC(4,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(50) PRIMARY KEY,
    flow_id VARCHAR(50),
    text TEXT NOT NULL,
    type question_type NOT NULL,
    options TEXT[],
    depends_on_question_id VARCHAR(50),
    depends_on_value TEXT,
    sequence_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_multipliers (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(50),
    condition_key VARCHAR(50) NOT NULL,
    multiplier NUMERIC(4,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    base_hours INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS template_nodes (
    id SERIAL PRIMARY KEY,
    template_id INTEGER,
    type node_type NOT NULL,
    content TEXT NOT NULL,
    parent_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category template_category NOT NULL,
    complexity INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_units (
    id SERIAL PRIMARY KEY,
    node_id INTEGER,
    team_id VARCHAR(50),
    hours INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_completed_intakes_entry_point') THEN
        ALTER TABLE completed_intakes
            ADD CONSTRAINT fk_completed_intakes_entry_point FOREIGN KEY (entry_point_id) REFERENCES entry_points(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_completed_intakes_template') THEN
        ALTER TABLE completed_intakes
            ADD CONSTRAINT fk_completed_intakes_template FOREIGN KEY (template_id) REFERENCES templates(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_entry_points_template') THEN
        ALTER TABLE entry_points
            ADD CONSTRAINT fk_entry_points_template FOREIGN KEY (template_id) REFERENCES templates(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_estimation_answers_result') THEN
        ALTER TABLE estimation_answers
            ADD CONSTRAINT fk_estimation_answers_result FOREIGN KEY (result_id) REFERENCES estimation_results(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_estimation_answers_question') THEN
        ALTER TABLE estimation_answers
            ADD CONSTRAINT fk_estimation_answers_question FOREIGN KEY (question_id) REFERENCES questions(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_estimation_team_hours_result') THEN
        ALTER TABLE estimation_team_hours
            ADD CONSTRAINT fk_estimation_team_hours_result FOREIGN KEY (result_id) REFERENCES estimation_results(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_estimation_team_hours_team') THEN
        ALTER TABLE estimation_team_hours
            ADD CONSTRAINT fk_estimation_team_hours_team FOREIGN KEY (team_id) REFERENCES teams(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_node_options_node') THEN
        ALTER TABLE node_options
            ADD CONSTRAINT fk_node_options_node FOREIGN KEY (node_id) REFERENCES template_nodes(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_node_options_next_node') THEN
        ALTER TABLE node_options
            ADD CONSTRAINT fk_node_options_next_node FOREIGN KEY (next_node_id) REFERENCES template_nodes(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_question_impacts_question') THEN
        ALTER TABLE question_impacts
            ADD CONSTRAINT fk_question_impacts_question FOREIGN KEY (question_id) REFERENCES questions(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_question_impacts_team') THEN
        ALTER TABLE question_impacts
            ADD CONSTRAINT fk_question_impacts_team FOREIGN KEY (team_id) REFERENCES teams(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_questions_flow') THEN
        ALTER TABLE questions
            ADD CONSTRAINT fk_questions_flow FOREIGN KEY (flow_id) REFERENCES estimation_flows(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_questions_depends_on') THEN
        ALTER TABLE questions
            ADD CONSTRAINT fk_questions_depends_on FOREIGN KEY (depends_on_question_id) REFERENCES questions(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_team_multipliers_team') THEN
        ALTER TABLE team_multipliers
            ADD CONSTRAINT fk_team_multipliers_team FOREIGN KEY (team_id) REFERENCES teams(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_template_nodes_template') THEN
        ALTER TABLE template_nodes
            ADD CONSTRAINT fk_template_nodes_template FOREIGN KEY (template_id) REFERENCES templates(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_template_nodes_parent') THEN
        ALTER TABLE template_nodes
            ADD CONSTRAINT fk_template_nodes_parent FOREIGN KEY (parent_id) REFERENCES template_nodes(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_work_units_node') THEN
        ALTER TABLE work_units
            ADD CONSTRAINT fk_work_units_node FOREIGN KEY (node_id) REFERENCES template_nodes(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_work_units_team') THEN
        ALTER TABLE work_units
            ADD CONSTRAINT fk_work_units_team FOREIGN KEY (team_id) REFERENCES teams(id);
    END IF;
END $$;

-- Create triggers for timestamp updates (dropping if they exist)
DROP TRIGGER IF EXISTS update_completed_intakes_timestamp ON completed_intakes;
DROP TRIGGER IF EXISTS update_entry_points_timestamp ON entry_points;
DROP TRIGGER IF EXISTS update_node_options_timestamp ON node_options;
DROP TRIGGER IF EXISTS update_template_nodes_timestamp ON template_nodes;
DROP TRIGGER IF EXISTS update_templates_timestamp ON templates;
DROP TRIGGER IF EXISTS update_work_units_timestamp ON work_units;

CREATE TRIGGER update_completed_intakes_timestamp
    BEFORE UPDATE ON completed_intakes
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_entry_points_timestamp
    BEFORE UPDATE ON entry_points
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_node_options_timestamp
    BEFORE UPDATE ON node_options
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_template_nodes_timestamp
    BEFORE UPDATE ON template_nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_templates_timestamp
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_work_units_timestamp
    BEFORE UPDATE ON work_units
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add complexity column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'templates'
        AND column_name = 'complexity'
    ) THEN
        ALTER TABLE templates ADD COLUMN complexity INTEGER DEFAULT 1;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_completed_intakes_template ON completed_intakes(template_id);
CREATE INDEX IF NOT EXISTS idx_completed_intakes_entry_point ON completed_intakes(entry_point_id);
CREATE INDEX IF NOT EXISTS idx_entry_points_template ON entry_points(template_id);
CREATE INDEX IF NOT EXISTS idx_estimation_answers_result ON estimation_answers(result_id);
CREATE INDEX IF NOT EXISTS idx_estimation_team_hours_result ON estimation_team_hours(result_id);
CREATE INDEX IF NOT EXISTS idx_node_options_node ON node_options(node_id);
CREATE INDEX IF NOT EXISTS idx_question_impacts_question ON question_impacts(question_id);
CREATE INDEX IF NOT EXISTS idx_questions_flow ON questions(flow_id);
CREATE INDEX IF NOT EXISTS idx_template_nodes_template ON template_nodes(template_id);
CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active);
CREATE INDEX IF NOT EXISTS idx_work_units_node ON work_units(node_id);
CREATE INDEX IF NOT EXISTS idx_templates_complexity ON templates(complexity); 