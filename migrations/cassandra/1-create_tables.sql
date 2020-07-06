CREATE TABLE daily_development_hours (
    date TIMESTAMP,
    seconds DOUBLE,
    PRIMARY KEY
(date)
)

CREATE TABLE daily_commands_run
(
    date TIMESTAMP,
    commands BIGINT,
    PRIMARY KEY (date)
);

CREATE TABLE daily_docker_builds
(
    date TIMESTAMP,
    builds BIGINT,
    PRIMARY KEY (date)
);

CREATE TABLE spotify_song_history
(
    date TIMESTAMP,
    device_name TEXT,
    device_type TEXT,
    item_name TEXT,
    item_author TEXT,
    item_type TEXT,
    item_id TEXT,
    item_image TEXT,
    item_length_ms VARINT,
    PRIMARY KEY (date)
);