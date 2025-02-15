--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: estimation_path; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estimation_path AS ENUM (
    'NEW_LIFE_PRODUCT',
    'EXISTING_LIFE_PRODUCT',
    'ADD_RIDER',
    'CHANGE_STATIC_CONTENT',
    'ADD_FILE_TRANSFER'
);


--
-- Name: node_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.node_type AS ENUM (
    'decision',
    'leaf'
);


--
-- Name: question_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.question_type AS ENUM (
    'SINGLE_SELECT',
    'MULTI_SELECT',
    'YES_NO',
    'NUMBER'
);


--
-- Name: template_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.template_category AS ENUM (
    'insurance',
    'banking',
    'other'
);


--
-- Name: update_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;

END;

$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: completed_intakes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.completed_intakes (
    id integer NOT NULL,
    entry_point_id integer,
    template_id integer,
    answers jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: completed_intakes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.completed_intakes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: completed_intakes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.completed_intakes_id_seq OWNED BY public.completed_intakes.id;


--
-- Name: entry_points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entry_points (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    template_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: entry_points_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entry_points_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: entry_points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.entry_points_id_seq OWNED BY public.entry_points.id;


--
-- Name: estimation_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estimation_answers (
    id integer NOT NULL,
    result_id uuid,
    question_id character varying(50),
    answer text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: estimation_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estimation_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: estimation_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estimation_answers_id_seq OWNED BY public.estimation_answers.id;


--
-- Name: estimation_flows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estimation_flows (
    id character varying(50) NOT NULL,
    path public.estimation_path NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: estimation_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estimation_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    path public.estimation_path NOT NULL,
    user_id character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: estimation_team_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estimation_team_hours (
    id integer NOT NULL,
    result_id uuid,
    team_id character varying(50),
    hours numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: estimation_team_hours_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estimation_team_hours_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: estimation_team_hours_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estimation_team_hours_id_seq OWNED BY public.estimation_team_hours.id;


--
-- Name: node_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node_options (
    id integer NOT NULL,
    node_id integer,
    text text NOT NULL,
    next_node_id integer,
    display_order integer DEFAULT 0
);


--
-- Name: node_options_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.node_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: node_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.node_options_id_seq OWNED BY public.node_options.id;


--
-- Name: question_impacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_impacts (
    id integer NOT NULL,
    question_id character varying(50),
    team_id character varying(50),
    condition text NOT NULL,
    multiplier numeric(4,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: question_impacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.question_impacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: question_impacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.question_impacts_id_seq OWNED BY public.question_impacts.id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id character varying(50) NOT NULL,
    flow_id character varying(50),
    text text NOT NULL,
    type public.question_type NOT NULL,
    options text[],
    depends_on_question_id character varying(50),
    depends_on_value text,
    sequence_number integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: team_multipliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_multipliers (
    id integer NOT NULL,
    team_id character varying(50),
    condition_key character varying(50) NOT NULL,
    multiplier numeric(4,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: team_multipliers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.team_multipliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: team_multipliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.team_multipliers_id_seq OWNED BY public.team_multipliers.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    base_hours integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: template_nodes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.template_nodes (
    id integer NOT NULL,
    template_id integer,
    node_type public.node_type NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: template_nodes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.template_nodes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: template_nodes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.template_nodes_id_seq OWNED BY public.template_nodes.id;


--
-- Name: templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.templates (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    complexity character varying(50),
    estimated_duration character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true
);


--
-- Name: templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.templates_id_seq OWNED BY public.templates.id;


--
-- Name: work_units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_units (
    id character varying(50) NOT NULL,
    node_id integer,
    team_id character varying(50),
    name character varying(255) NOT NULL,
    hours integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: completed_intakes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.completed_intakes ALTER COLUMN id SET DEFAULT nextval('public.completed_intakes_id_seq'::regclass);


--
-- Name: entry_points id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entry_points ALTER COLUMN id SET DEFAULT nextval('public.entry_points_id_seq'::regclass);


--
-- Name: estimation_answers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimation_answers ALTER COLUMN id SET DEFAULT nextval('public.estimation_answers_id_seq'::regclass);


--
-- Name: estimation_team_hours id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimation_team_hours ALTER COLUMN id SET DEFAULT nextval('public.estimation_team_hours_id_seq'::regclass);


--
-- Name: node_options id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node_options ALTER COLUMN id SET DEFAULT nextval('public.node_options_id_seq'::regclass);


--
-- Name: question_impacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_impacts ALTER COLUMN id SET DEFAULT nextval('public.question_impacts_id_seq'::regclass);


--
-- Name: team_multipliers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_multipliers ALTER COLUMN id SET DEFAULT nextval('public.team_multipliers_id_seq'::regclass);


--
-- Name: template_nodes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_nodes ALTER COLUMN id SET DEFAULT nextval('public.template_nodes_id_seq'::regclass);


--
-- Name: templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates ALTER COLUMN id SET DEFAULT nextval('public.templates_id_seq'::regclass);


--
-- Name: completed_intakes completed_intakes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.completed_intakes
    ADD CONSTRAINT completed_intakes_pkey PRIMARY KEY (id);


--
-- Name: entry_points entry_points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entry_points
    ADD CONSTRAINT entry_points_pkey PRIMARY KEY (id);


--
-- Name: estimation_answers estimation_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimation_answers
    ADD CONSTRAINT estimation_answers_pkey PRIMARY KEY (id);


--
-- Name: estimation_flows estimation_flows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimation_flows
    ADD CONSTRAINT estimation_flows_pkey PRIMARY KEY (id);


--
-- Name: estimation_results estimation_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimation_results
    ADD CONSTRAINT estimation_results_pkey PRIMARY KEY (id);


--
-- Name: estimation_team_hours estimation_team_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimation_team_hours
    ADD CONSTRAINT estimation_team_hours_pkey PRIMARY KEY (id);


--
-- Name: node_options node_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node_options
    ADD CONSTRAINT node_options_pkey PRIMARY KEY (id);


--
-- Name: question_impacts question_impacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_impacts
    ADD CONSTRAINT question_impacts_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: team_multipliers team_multipliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_multipliers
    ADD CONSTRAINT team_multipliers_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: template_nodes template_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_nodes
    ADD CONSTRAINT template_nodes_pkey PRIMARY KEY (id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: work_units work_units_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_units
    ADD CONSTRAINT work_units_pkey PRIMARY KEY (id);


--
-- Name: idx_node_options_node; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_node_options_node ON public.node_options USING btree (node_id);


--
-- Name: idx_template_nodes_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_template_nodes_template ON public.template_nodes USING btree (template_id);


--
-- Name: idx_templates_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_active ON public.templates USING btree (is_active);


--
-- Name: idx_work_units_node; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_units_node ON public.work_units USING btree (node_id);


--
-- Name: entry_points update_entry_points_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_entry_points_timestamp BEFORE UPDATE ON public.entry_points FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: template_nodes update_template_nodes_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_template_nodes_timestamp BEFORE UPDATE ON public.template_nodes FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: templates update_templates_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_templates_timestamp BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: work_units update_work_units_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_work_units_timestamp BEFORE UPDATE ON public.work_units FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: completed_intakes completed_intakes_entry_point_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.completed_intakes
    ADD CONSTRAINT completed_intakes_entry_point_id_fkey FOREIGN KEY (entry_point_id) REFERENCES public.entry_points(id);


--
-- Name: completed_intakes completed_intakes_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.completed_intakes
    ADD CONSTRAINT completed_intakes_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(id);


--
-- Name: entry_points entry_points_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entry_points
    ADD CONSTRAINT entry_points_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(id);


--
-- Name: estimation_answers estimation_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimation_answers
    ADD CONSTRAINT estimation_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: estimation_answers estimation_answers_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimation_answers
    ADD CONSTRAINT estimation_answers_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.estimation_results(id);


--
-- Name: estimation_team_hours estimation_team_hours_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimation_team_hours
    ADD CONSTRAINT estimation_team_hours_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.estimation_results(id);


--
-- Name: node_options node_options_next_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node_options
    ADD CONSTRAINT node_options_next_node_id_fkey FOREIGN KEY (next_node_id) REFERENCES public.template_nodes(id);


--
-- Name: node_options node_options_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node_options
    ADD CONSTRAINT node_options_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.template_nodes(id) ON DELETE CASCADE;


--
-- Name: question_impacts question_impacts_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_impacts
    ADD CONSTRAINT question_impacts_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: questions questions_depends_on_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_depends_on_question_id_fkey FOREIGN KEY (depends_on_question_id) REFERENCES public.questions(id);


--
-- Name: questions questions_flow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES public.estimation_flows(id);


--
-- Name: template_nodes template_nodes_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_nodes
    ADD CONSTRAINT template_nodes_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(id) ON DELETE CASCADE;


--
-- Name: work_units work_units_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_units
    ADD CONSTRAINT work_units_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.template_nodes(id) ON DELETE CASCADE;


--
-- Name: work_units work_units_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_units
    ADD CONSTRAINT work_units_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- PostgreSQL database dump complete
--

