CREATE TABLE daily_development_hours (
    date TIMESTAMP,
    seconds DOUBLE,
    PRIMARY KEY (date)
)

CREATE TABLE daily_commands_run (
    date TIMESTAMP,
    commands BIGINT,
    PRIMARY KEY (date)
);

CREATE TABLE daily_docker_builds (
    date TIMESTAMP,
    builds BIGINT,
    PRIMARY KEY (date)
);
