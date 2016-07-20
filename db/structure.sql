CREATE TABLE "schema_migrations" ("version" varchar NOT NULL);
CREATE UNIQUE INDEX "unique_schema_migrations" ON "schema_migrations" ("version");
CREATE TABLE "tests" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer, "title" varchar, "tester" varchar, "testHash" varchar, "parentHash" varchar, "access" varchar, "stateURL" varchar, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);
CREATE INDEX "index_tests_on_user_id" ON "tests" ("user_id");
CREATE TABLE "users" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "provider" varchar DEFAULT 'email' NOT NULL, "uid" varchar DEFAULT '' NOT NULL, "encrypted_password" varchar DEFAULT '' NOT NULL, "reset_password_token" varchar, "reset_password_sent_at" datetime, "remember_created_at" datetime, "sign_in_count" integer DEFAULT 0 NOT NULL, "current_sign_in_at" datetime, "last_sign_in_at" datetime, "current_sign_in_ip" varchar, "last_sign_in_ip" varchar, "name" varchar, "nickname" varchar, "image" varchar, "email" varchar, "tokens" text, "created_at" datetime, "updated_at" datetime);
CREATE INDEX "index_users_on_email" ON "users" ("email");
CREATE UNIQUE INDEX "index_users_on_uid_and_provider" ON "users" ("uid", "provider");
CREATE UNIQUE INDEX "index_users_on_reset_password_token" ON "users" ("reset_password_token");
CREATE TABLE "test_states" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "testHash" varchar, "testState" varchar, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);
CREATE TABLE "variable_attributes" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);
CREATE TABLE "attribute_values" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "variable_id" integer, "variable_attribute_id" integer, "attval" varchar, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);
CREATE INDEX "index_attribute_values_on_variable_id" ON "attribute_values" ("variable_id");
CREATE TABLE "property_aliases" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "property_id" integer, "name" varchar, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);
CREATE INDEX "index_property_aliases_on_property_id" ON "property_aliases" ("property_id");
CREATE TABLE "properties" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "dims" varchar, "user_id" integer, "shared" boolean, "deleted" time, "txn" varchar, "oldId" integer, "lock_version" integer DEFAULT 0 NOT NULL);
CREATE INDEX "index_properties_on_user_id" ON "properties" ("user_id");
CREATE TABLE "units" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "property_id" integer, "name" varchar, "system" varchar, "baseunit" boolean, "symbol" varchar, "prefix" varchar, "extend" varchar, "definition" varchar, "description" varchar, "approx" boolean, "factor" varchar, "repeat" integer, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "user_id" integer, "shared" boolean, "deleted" time, "txn" varchar, "oldId" integer, "lock_version" integer DEFAULT 0 NOT NULL);
CREATE INDEX "index_units_on_property_id" ON "units" ("property_id");
CREATE INDEX "index_units_on_user_id" ON "units" ("user_id");
CREATE TABLE "globals" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "symbol" varchar, "name" varchar, "unit_id" integer, "value" varchar, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "user_id" integer, "shared" boolean, "category_id" integer, "deleted" time, "txn" varchar, "oldId" integer, "lock_version" integer DEFAULT 0 NOT NULL);
CREATE INDEX "index_globals_on_user_id" ON "globals" ("user_id");
CREATE INDEX "index_globals_on_category_id" ON "globals" ("category_id");
CREATE TABLE "formulas" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "latex" varchar, "name" varchar, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "symbol" varchar, "unit_id" integer, "property_id" integer, "user_id" integer, "shared" boolean, "category_id" integer, "deleted" time, "txn" varchar, "oldId" integer, "lock_version" integer DEFAULT 0 NOT NULL);
CREATE INDEX "index_formulas_on_unit_id" ON "formulas" ("unit_id");
CREATE INDEX "index_formulas_on_property_id" ON "formulas" ("property_id");
CREATE INDEX "index_formulas_on_user_id" ON "formulas" ("user_id");
CREATE INDEX "index_formulas_on_category_id" ON "formulas" ("category_id");
CREATE TABLE "categories" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar, "parent_id" integer, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "deleted" time, "txn" varchar, "oldId" integer, "lock_version" integer DEFAULT 0 NOT NULL);
CREATE TABLE "favorites" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer, "favoritable_id" integer, "favoritable_type" varchar, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "deleted" time, "lock_version" integer DEFAULT 0 NOT NULL);
CREATE INDEX "index_favorites_on_user_id" ON "favorites" ("user_id");
CREATE UNIQUE INDEX "user_id_type" ON "favorites" ("user_id", "favoritable_id", "favoritable_type");
CREATE TABLE "variables" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "symbol" varchar, "name" varchar, "unit_id" integer, "formula_id" integer, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "property_id" integer, "deleted" time, "txn" varchar, "oldId" integer, "lock_version" integer DEFAULT 0 NOT NULL);
CREATE INDEX "index_variables_on_unit_id" ON "variables" ("unit_id");
CREATE INDEX "index_variables_on_formula_id" ON "variables" ("formula_id");
CREATE INDEX "index_variables_on_property_id" ON "variables" ("property_id");
CREATE INDEX "index_properties_on_deleted" ON "properties" ("deleted");
CREATE INDEX "index_units_on_deleted" ON "units" ("deleted");
CREATE INDEX "index_globals_on_deleted" ON "globals" ("deleted");
CREATE INDEX "index_formulas_on_deleted" ON "formulas" ("deleted");
CREATE INDEX "index_categories_on_deleted" ON "categories" ("deleted");
CREATE INDEX "index_favorites_on_deleted" ON "favorites" ("deleted");
CREATE INDEX "index_variables_on_deleted" ON "variables" ("deleted");
CREATE TABLE "fgs" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "formula_id" integer, "global_id" integer, "lock_version" integer DEFAULT 0 NOT NULL, "deleted" time, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);
CREATE INDEX "index_fgs_on_formula_id" ON "fgs" ("formula_id");
CREATE INDEX "index_fgs_on_global_id" ON "fgs" ("global_id");
CREATE UNIQUE INDEX "index_fgs_on_formula_id_and_global_id" ON "fgs" ("formula_id", "global_id");
CREATE INDEX "index_fgs_on_deleted" ON "fgs" ("deleted");
INSERT INTO schema_migrations (version) VALUES ('20150127094622');

INSERT INTO schema_migrations (version) VALUES ('20150406051014');

INSERT INTO schema_migrations (version) VALUES ('20150406053840');

INSERT INTO schema_migrations (version) VALUES ('20151014125239');

INSERT INTO schema_migrations (version) VALUES ('20151103094622');

INSERT INTO schema_migrations (version) VALUES ('20160203181922');

INSERT INTO schema_migrations (version) VALUES ('20160203182022');

INSERT INTO schema_migrations (version) VALUES ('20160215112822');

INSERT INTO schema_migrations (version) VALUES ('20160323133552');

INSERT INTO schema_migrations (version) VALUES ('20160323133852');

INSERT INTO schema_migrations (version) VALUES ('20160404053840');

INSERT INTO schema_migrations (version) VALUES ('20160404143852');

INSERT INTO schema_migrations (version) VALUES ('20160404153852');

INSERT INTO schema_migrations (version) VALUES ('20160406082822');

INSERT INTO schema_migrations (version) VALUES ('20160406092822');

INSERT INTO schema_migrations (version) VALUES ('20160406093022');

INSERT INTO schema_migrations (version) VALUES ('20160514081422');

INSERT INTO schema_migrations (version) VALUES ('20160514082522');

INSERT INTO schema_migrations (version) VALUES ('20160514132522');

INSERT INTO schema_migrations (version) VALUES ('20160616100352');

INSERT INTO schema_migrations (version) VALUES ('20160616104852');

INSERT INTO schema_migrations (version) VALUES ('20160627113052');

INSERT INTO schema_migrations (version) VALUES ('20160627115752');

INSERT INTO schema_migrations (version) VALUES ('20160628103152');

INSERT INTO schema_migrations (version) VALUES ('20160628123152');

INSERT INTO schema_migrations (version) VALUES ('20160712142340');

