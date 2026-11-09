-- N1 Hub / Draft 0.1 / 2026-10-28
-- Предложение для обсуждения; не миграция существующего приложения.
-- UUID генерирует приложение. Каталог инфраструктуры намеренно не заполнен.
BEGIN;

CREATE TYPE availability_state AS ENUM ('available', 'degraded', 'unavailable', 'unknown');
CREATE TYPE event_kind AS ENUM ('incident', 'maintenance');
CREATE TYPE event_lifecycle AS ENUM ('draft', 'scheduled', 'active', 'completed', 'cancelled');
CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE notification_status AS ENUM ('draft', 'queued', 'sending', 'sent', 'partially_failed', 'failed', 'cancelled');
CREATE TYPE delivery_status AS ENUM ('pending', 'sending', 'accepted', 'delivered', 'failed', 'skipped');

CREATE TABLE service (
    id uuid PRIMARY KEY,
    code text NOT NULL UNIQUE,
    name text NOT NULL CHECK (btrim(name) <> ''),
    is_global boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE region (
    id uuid PRIMARY KEY,
    code text NOT NULL UNIQUE,
    name text NOT NULL
);
CREATE TABLE landscape (
    id uuid PRIMARY KEY,
    code text NOT NULL UNIQUE,
    name text NOT NULL
);
-- Отдельная ось классификации, если команда подтвердит её необходимость.
-- ЦДМЗ / иЦДМЗ не распределяются автоматически между landscape и placement_zone.
CREATE TABLE placement_zone (
    id uuid PRIMARY KEY,
    code text NOT NULL UNIQUE,
    name text NOT NULL
);
CREATE TABLE cluster (
    id uuid PRIMARY KEY,
    catalog_key text NOT NULL UNIQUE,
    name text NOT NULL,
    region_id uuid REFERENCES region(id),
    landscape_id uuid NOT NULL REFERENCES landscape(id),
    zone_id uuid REFERENCES placement_zone(id),
    is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE service_component (
    id uuid PRIMARY KEY,
    service_id uuid NOT NULL REFERENCES service(id),
    code text NOT NULL,
    name text NOT NULL,
    UNIQUE (service_id, code),
    UNIQUE (id, service_id)
);
CREATE TABLE availability_object (
    id uuid PRIMARY KEY,
    service_id uuid NOT NULL REFERENCES service(id),
    object_key text NOT NULL,
    label text NOT NULL,
    landscape_id uuid NOT NULL REFERENCES landscape(id),
    region_id uuid REFERENCES region(id),
    zone_id uuid REFERENCES placement_zone(id),
    cluster_id uuid REFERENCES cluster(id),
    component_id uuid,
    is_active boolean NOT NULL DEFAULT true,
    UNIQUE (service_id, object_key),
    FOREIGN KEY (component_id, service_id) REFERENCES service_component(id, service_id)
);
CREATE INDEX availability_object_scope_idx ON availability_object (service_id, landscape_id, region_id);
CREATE INDEX availability_object_cluster_idx ON availability_object (cluster_id);

CREATE TABLE app_user (
    id uuid PRIMARY KEY,
    identity_provider text NOT NULL,
    external_subject text NOT NULL,
    display_name text,
    email text,
    is_active boolean NOT NULL DEFAULT true,
    UNIQUE (identity_provider, external_subject)
);
CREATE TABLE project (
    id uuid PRIMARY KEY,
    source_system text NOT NULL,
    external_id text NOT NULL,
    name text NOT NULL,
    UNIQUE (source_system, external_id)
);
CREATE TABLE role (
    code text PRIMARY KEY,
    name text NOT NULL,
    is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE project_role_assignment (
    project_id uuid NOT NULL REFERENCES project(id),
    user_id uuid NOT NULL REFERENCES app_user(id),
    role_code text NOT NULL REFERENCES role(code),
    PRIMARY KEY (project_id, user_id, role_code)
);
-- Предложенная связь потребления, источник которой нужно определить (Q7).
CREATE TABLE project_availability_object (
    project_id uuid NOT NULL REFERENCES project(id),
    availability_object_id uuid NOT NULL REFERENCES availability_object(id),
    PRIMARY KEY (project_id, availability_object_id)
);
CREATE INDEX project_object_reverse_idx ON project_availability_object (availability_object_id, project_id);
CREATE TABLE notification_default_role (
    role_code text PRIMARY KEY REFERENCES role(code)
);

CREATE TABLE platform_event (
    id uuid PRIMARY KEY,
    public_number text NOT NULL UNIQUE,
    kind event_kind NOT NULL,
    lifecycle_status event_lifecycle NOT NULL,
    title text NOT NULL CHECK (btrim(title) <> ''),
    actual_started_at timestamptz,
    actual_ended_at timestamptz,
    created_by uuid NOT NULL REFERENCES app_user(id),
    updated_by uuid NOT NULL REFERENCES app_user(id),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version integer NOT NULL DEFAULT 1 CHECK (version > 0),
    CHECK (actual_ended_at IS NULL OR
           (actual_started_at IS NOT NULL AND actual_ended_at > actual_started_at)),
    CHECK (kind <> 'incident' OR lifecycle_status <> 'scheduled'),
    CHECK (kind <> 'incident' OR lifecycle_status NOT IN ('active', 'completed') OR actual_started_at IS NOT NULL),
    CHECK (lifecycle_status <> 'completed' OR actual_ended_at IS NOT NULL)
);
CREATE INDEX platform_event_lifecycle_idx ON platform_event (kind, lifecycle_status);
CREATE INDEX platform_event_period_idx ON platform_event (actual_started_at, actual_ended_at);
CREATE TABLE incident_detail (
    event_id uuid PRIMARY KEY REFERENCES platform_event(id),
    severity incident_severity NOT NULL,
    declared_impact availability_state NOT NULL DEFAULT 'unavailable',
    recovery_duration_seconds bigint CHECK (recovery_duration_seconds > 0),
    problem_description text NOT NULL CHECK (btrim(problem_description) <> ''),
    cause text,
    CHECK (declared_impact IN ('degraded', 'unavailable', 'unknown'))
);
CREATE TABLE maintenance_detail (
    event_id uuid PRIMARY KEY REFERENCES platform_event(id),
    planned_started_at timestamptz NOT NULL,
    planned_ended_at timestamptz NOT NULL,
    work_description text NOT NULL CHECK (btrim(work_description) <> ''),
    CHECK (planned_ended_at > planned_started_at)
);
CREATE INDEX maintenance_planned_period_idx ON maintenance_detail (planned_started_at, planned_ended_at);
CREATE TABLE event_target (
    event_id uuid NOT NULL REFERENCES platform_event(id),
    availability_object_id uuid NOT NULL REFERENCES availability_object(id),
    PRIMARY KEY (event_id, availability_object_id)
);
CREATE INDEX event_target_reverse_idx ON event_target (availability_object_id, event_id);
CREATE TABLE event_revision (
    event_id uuid NOT NULL REFERENCES platform_event(id),
    version integer NOT NULL CHECK (version > 0),
    snapshot jsonb NOT NULL CHECK (jsonb_typeof(snapshot) = 'object'),
    changed_by uuid NOT NULL REFERENCES app_user(id),
    changed_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, version)
);

CREATE TABLE telemetry_source (
    id uuid PRIMARY KEY,
    code text NOT NULL UNIQUE,
    name text NOT NULL
);
CREATE TABLE telemetry_observation (
    id uuid PRIMARY KEY,
    source_id uuid NOT NULL REFERENCES telemetry_source(id),
    availability_object_id uuid NOT NULL REFERENCES availability_object(id),
    source_message_id text NOT NULL,
    state availability_state NOT NULL,
    observed_at timestamptz NOT NULL,
    received_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (source_id, source_message_id)
);
CREATE INDEX telemetry_object_time_idx ON telemetry_observation (availability_object_id, observed_at DESC);
-- Пересчитываемая проекция, а не первичный источник правды.
CREATE TABLE availability_snapshot (
    availability_object_id uuid PRIMARY KEY REFERENCES availability_object(id),
    state availability_state NOT NULL,
    calculated_at timestamptz NOT NULL,
    rule_version text NOT NULL,
    last_observation_id uuid REFERENCES telemetry_observation(id),
    basis jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(basis) = 'object')
);

CREATE TABLE notification_batch (
    id uuid PRIMARY KEY,
    event_id uuid NOT NULL,
    event_version integer NOT NULL,
    status notification_status NOT NULL DEFAULT 'draft',
    subject text NOT NULL CHECK (btrim(subject) <> ''),
    body text NOT NULL CHECK (btrim(body) <> ''),
    audience_policy_version text NOT NULL,
    created_by uuid NOT NULL REFERENCES app_user(id),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    queued_at timestamptz,
    idempotency_key text UNIQUE,
    FOREIGN KEY (event_id, event_version) REFERENCES event_revision(event_id, version),
    CHECK (status = 'draft' OR status = 'cancelled' OR (queued_at IS NOT NULL AND idempotency_key IS NOT NULL))
);
CREATE TABLE notification_batch_role (
    notification_batch_id uuid NOT NULL REFERENCES notification_batch(id),
    role_code text NOT NULL REFERENCES role(code),
    PRIMARY KEY (notification_batch_id, role_code)
);
CREATE TABLE notification_batch_project (
    notification_batch_id uuid NOT NULL REFERENCES notification_batch(id),
    project_id uuid NOT NULL REFERENCES project(id),
    PRIMARY KEY (notification_batch_id, project_id)
);
CREATE TABLE notification_delivery (
    id uuid PRIMARY KEY,
    notification_batch_id uuid NOT NULL REFERENCES notification_batch(id),
    user_id uuid NOT NULL REFERENCES app_user(id),
    channel text NOT NULL CHECK (channel = 'email'),
    destination text NOT NULL CHECK (btrim(destination) <> ''),
    status delivery_status NOT NULL DEFAULT 'pending',
    provider_message_id text,
    attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
    next_attempt_at timestamptz,
    last_error_code text,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (notification_batch_id, user_id, channel)
);
CREATE INDEX notification_delivery_work_idx ON notification_delivery (status, next_attempt_at);
CREATE TABLE notification_outbox (
    id uuid PRIMARY KEY,
    notification_batch_id uuid NOT NULL REFERENCES notification_batch(id),
    deduplication_key text NOT NULL UNIQUE,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    available_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at timestamptz,
    attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
    locked_until timestamptz
);
CREATE INDEX notification_outbox_work_idx ON notification_outbox (available_at) WHERE processed_at IS NULL;

-- Вариант MVP: подписка на завершение конкретного события.
-- Подписка на объект доступности потребует отдельного согласованного правила.
CREATE TABLE recovery_subscription (
    user_id uuid NOT NULL REFERENCES app_user(id),
    event_id uuid NOT NULL REFERENCES platform_event(id),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, event_id)
);

-- Названия ролей из согласованного списка; код роли — предлагаемое стабильное значение.
INSERT INTO role (code, name) VALUES
 ('project_lead', 'Руководитель проекта'),
 ('project_architect', 'Архитектор проекта'),
 ('project_developer', 'Разработчик проекта'),
 ('project_tester', 'Тестировщик проекта'),
 ('project_member', 'Участник проекта'),
 ('project_release_engineer', 'Релиз-инженер проекта'),
 ('data_engineer', 'Инженер данных'),
 ('data_analyst', 'Аналитик данных'),
 ('information_security_specialist', 'Специалист ИБ'),
 ('security_qa_engineer', 'Sequrity QA инженер'),
 ('development_lead', 'Руководитель разработки');
INSERT INTO notification_default_role (role_code) VALUES
 ('project_lead'), ('project_architect'), ('development_lead');

-- ВАЖНО: транзакционная валидация сервиса/API должна дополнительно обеспечивать:
-- * ровно одну detail-запись правильного типа у опубликованного события;
-- * не менее одной event_target у опубликованного события;
-- * единообразие измерений availability_object с выбранным cluster;
-- * global-сервис: Prod, region_id/cluster_id/component_id IS NULL;
-- * снимок event_revision соответствует version, включая все targets;
-- * непустые роли и разрешённая аудитория перед отправкой;
-- * после queued текст/версия/аудитория batch неизменяемы;
-- * оптимистическую блокировку version при редактировании.
-- Эти межтабличные правила не объявляются выполненными обычными FK/CHECK.
COMMIT;
