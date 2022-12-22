-- Create two users for the DB, ie postgres_write and postgres_read
DO $do$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres_write') THEN
        CREATE ROLE postgres_write;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres_read') THEN
        CREATE ROLE postgres_read;
        GRANT postgres_read TO postgres_write;
    END IF;
END
$do$;

-- Get the users passwords from env variables.
ALTER ROLE postgres_read WITH LOGIN PASSWORD 'password';
ALTER ROLE postgres_write WITH LOGIN PASSWORD 'password';
GRANT CONNECT ON DATABASE toll_db TO postgres_read;
GRANT ALL PRIVILEGES ON DATABASE toll_db TO postgres_write;

-- Connect to the database to run migrations.
\connect toll_db;

-- Grant all read permissions to pq_read user
GRANT USAGE ON SCHEMA public TO postgres_read;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO postgres_read;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres_read;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO postgres_read;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO postgres_read;
ALTER DEFAULT PRIVILEGES FOR USER postgres_write IN SCHEMA public GRANT SELECT ON TABLES TO postgres_read;
ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public GRANT SELECT ON TABLES TO postgres_read;

-- Grant all read permissions to postgres_write user
GRANT CREATE ON SCHEMA public TO postgres_write;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres_write;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres_write;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO postgres_write;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO postgres_write;
ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO postgres_write;

-- Create all required tables below.
CREATE TABLE IF NOT EXISTS public.toll_booth (
    id BIGSERIAL PRIMARY KEY,
    name TEXT,
    two_wheel_cost JSONB, -- { 1: 100, 2: 150. 3: 200 }
    four_wheel_cost JSONB
);

CREATE TABLE IF NOT EXISTS public.vehicle (
    number VARCHAR(20) PRIMARY KEY,
    type INTEGER NOT NULL -- 1 or 2
);

CREATE TABLE IF NOT EXISTS public.toll_vehicle_pass (
    id BIGSERIAL PRIMARY KEY,
    toll_booth BIGINT NOT NULL,
    pass_type VARCHAR(20) NOT NULL, -- single, round, week
    vehicle_number VARCHAR(20) NOT NULL,
    direction INTEGER, -- 1 or 2
    expiry TIMESTAMP,
    isUsed BOOLEAN,
    CONSTRAINT foreign_toll_pass_booth FOREIGN KEY(toll_booth) REFERENCES public.toll_booth(id) ON DELETE CASCADE,
    CONSTRAINT foreign_vehicle_number FOREIGN KEY(vehicle_number) REFERENCES public.vehicle(number) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.toll_tracking (
    id BIGSERIAL PRIMARY KEY,
    toll_booth BIGINT NOT NULL,
    pass_type VARCHAR(20) NOT NULL, -- single, round, week
    vehicle_number VARCHAR(20) NOT NULL,
    direction INTEGER, -- 1 or 2
    amount_paid FLOAT,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT foreign_tracking_booth FOREIGN KEY(toll_booth) REFERENCES public.toll_booth(id) ON DELETE CASCADE,
    CONSTRAINT foreign_tracking_vehicle_number FOREIGN KEY(vehicle_number) REFERENCES public.vehicle(number) ON DELETE CASCADE
);
