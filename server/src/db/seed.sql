-- Insert teams
INSERT INTO teams (id, name, base_hours) VALUES
  ('life_db', 'Life Database Team', 100),
  ('ui_team', 'UI Development Team', 80),
  ('integration', 'Integration Team', 60),
  ('qa_team', 'Quality Assurance Team', 40);

-- Insert team multipliers
INSERT INTO team_multipliers (team_id, condition_key, multiplier) VALUES
  ('life_db', 'new_rider', 1.2),
  ('life_db', 'complex_integration', 1.5),
  ('ui_team', 'new_screens', 1.3),
  ('ui_team', 'complex_validation', 1.4),
  ('integration', 'external_system', 1.5),
  ('qa_team', 'regression_testing', 1.3);

-- Insert estimation flows
INSERT INTO estimation_flows (id, path, name, description) VALUES
  ('new_life_product', 'NEW_LIFE_PRODUCT', 'New Life Product', 'Create estimation for a new life insurance product'),
  ('existing_life_product', 'EXISTING_LIFE_PRODUCT', 'Existing Life Product, New State', 'Add a new state to an existing life product'),
  ('add_rider', 'ADD_RIDER', 'Add Rider', 'Add a new rider to an existing product');

-- Insert questions for New Life Product flow
INSERT INTO questions (id, flow_id, text, type, options, sequence_number) VALUES
  ('nlp_category', 'new_life_product', 'Category: Fixed, Variable, or Index', 'SINGLE_SELECT', ARRAY['Fixed', 'Variable', 'Index'], 1),
  ('nlp_electronic_delivery', 'new_life_product', 'Do you require electronic delivery via SMS and Email?', 'YES_NO', NULL, 2),
  ('nlp_external_integration', 'new_life_product', 'Will this product require integration with external systems?', 'YES_NO', NULL, 3);

-- Insert question impacts
INSERT INTO question_impacts (question_id, team_id, condition, multiplier) VALUES
  ('nlp_category', 'life_db', 'Variable', 1.5),
  ('nlp_electronic_delivery', 'ui_team', 'true', 1.2),
  ('nlp_external_integration', 'integration', 'true', 1.5); 