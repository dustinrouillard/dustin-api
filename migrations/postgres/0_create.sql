CREATE TABLE "public"."location_history" (
    "since" timestamp NOT NULL DEFAULT now(),
    "left" timestamp,
    "place" text NOT NULL DEFAULT 'other'::text,
    PRIMARY KEY ("since")
);