CREATE TABLE IF NOT EXISTS "characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(256) NOT NULL,
	"race" varchar(50) NOT NULL,
	"origin" varchar(50) NOT NULL,
	"faction" varchar(50) NOT NULL,
	"dream" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" integer NOT NULL,
	"strength" integer DEFAULT 0 NOT NULL,
	"agility" integer DEFAULT 0 NOT NULL,
	"durability" integer DEFAULT 0 NOT NULL,
	"intelligence" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "stats_character_id_unique" UNIQUE("character_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"discord_id" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_discord_id_unique" UNIQUE("discord_id")
);
--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stats" ADD CONSTRAINT "stats_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "discord_id_idx" ON "users" USING btree ("discord_id");