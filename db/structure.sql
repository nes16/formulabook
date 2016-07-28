CREATE TABLE "schema_migrations" ("version" varchar NOT NULL);
CREATE UNIQUE INDEX "unique_schema_migrations" ON "schema_migrations" ("version");
CREATE TABLE "properties" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar, "dims" varchar, "user_id" integer, "shared" boolean, "deleted" time, "lock_version" integer DEFAULT 0 NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);
CREATE INDEX "index_properties_on_user_id" ON "properties" ("user_id");
CREATE INDEX "index_properties_on_deleted" ON "properties" ("deleted");
CREATE TABLE "units" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "property_id" integer, "name" varchar, "description" varchar, "system" varchar, "symbol" varchar, "approx" boolean, "factor" varchar, "repeat" integer, "shared" boolean, "user_id" integer, "deleted" time, "lock_version" integer DEFAULT 0 NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);
CREATE INDEX "index_units_on_property_id" ON "units" ("property_id");
CREATE INDEX "index_units_on_user_id" ON "units" ("user_id");
CREATE INDEX "index_units_on_deleted" ON "units" ("deleted");
CREATE TABLE "users" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "provider" varchar DEFAULT 'email' NOT NULL, "uid" varchar DEFAULT '' NOT NULL, "encrypted_password" varchar DEFAULT '' NOT NULL, "reset_password_token" varchar, "reset_password_sent_at" datetime, "remember_created_at" datetime, "sign_in_count" integer DEFAULT 0 NOT NULL, "current_sign_in_at" datetime, "last_sign_in_at" datetime, "current_sign_in_ip" varchar, "last_sign_in_ip" varchar, "name" varchar, "nickname" varchar, "image" varchar, "email" varchar, "tokens" text, "created_at" datetime, "updated_at" datetime);
CREATE INDEX "index_users_on_email" ON "users" ("email");
CREATE UNIQUE INDEX "index_users_on_uid_and_provider" ON "users" ("uid", "provider");
CREATE UNIQUE INDEX "index_users_on_reset_password_token" ON "users" ("reset_password_token");
CREATE TABLE "variables" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar, "symbol" varchar, "unit_id" integer, "property_id" integer, "formula_id" integer, "deleted" time, "lock_version" integer DEFAULT 0 NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);
CREATE INDEX "index_variables_on_formula_id" ON "variables" ("formula_id");
CREATE INDEX "index_variables_on_deleted" ON "variables" ("deleted");
CREATE TABLE "formulas" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar, "symbol" varchar, "latex" varchar, "unit_id" integer, "property_id" integer, "shared" boolean, "user_id" integer, "deleted" time, "lock_version" integer DEFAULT 0 NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);
CREATE INDEX "index_formulas_on_user_id" ON "formulas" ("user_id");
CREATE INDEX "index_formulas_on_deleted" ON "formulas" ("deleted");
CREATE TABLE "favorites" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer, "favoritable_id" integer, "favoritable_type" varchar, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);
CREATE INDEX "index_favorites_on_user_id" ON "favorites" ("user_id");
CREATE UNIQUE INDEX "user_id_type" ON "favorites" ("user_id", "favoritable_id", "favoritable_type");
CREATE TABLE "globals" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "symbol" varchar, "name" varchar, "unit_id" integer, "value" varchar, "shared" boolean, "user_id" integer, "deleted" time, "lock_version" integer DEFAULT 0 NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);
CREATE INDEX "index_globals_on_user_id" ON "globals" ("user_id");
CREATE INDEX "index_globals_on_deleted" ON "globals" ("deleted");
CREATE TABLE "categories" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar, "parent_id" integer, "shared" boolean, "user_id" integer, "deleted" time, "lock_version" integer DEFAULT 0 NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);
CREATE INDEX "index_categories_on_user_id" ON "categories" ("user_id");
CREATE INDEX "index_categories_on_deleted" ON "categories" ("deleted");
CREATE TABLE "fgs" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "formula_id" integer, "global_id" integer);
CREATE INDEX "index_fgs_on_formula_id" ON "fgs" ("formula_id");
CREATE INDEX "index_fgs_on_global_id" ON "fgs" ("global_id");
CREATE UNIQUE INDEX "index_fgs_on_formula_id_and_global_id" ON "fgs" ("formula_id", "global_id");
INSERT INTO schema_migrations (version) VALUES ('20150406051014');

INSERT INTO schema_migrations (version) VALUES ('20150406053840');

INSERT INTO schema_migrations (version) VALUES ('20151014125239');

INSERT INTO schema_migrations (version) VALUES ('20160203181922');

INSERT INTO schema_migrations (version) VALUES ('20160203182022');

INSERT INTO schema_migrations (version) VALUES ('20160215112822');

INSERT INTO schema_migrations (version) VALUES ('20160404053840');

INSERT INTO schema_migrations (version) VALUES ('20160514081422');

INSERT INTO schema_migrations (version) VALUES ('20160712142340');

