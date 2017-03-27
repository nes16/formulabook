# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160514082522) do

  create_table "attribute_values", force: :cascade do |t|
    t.integer  "variable_id"
    t.integer  "variable_attribute_id"
    t.string   "attval"
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
  end

  add_index "attribute_values", ["variable_id"], name: "index_attribute_values_on_variable_id"

  create_table "categories", force: :cascade do |t|
    t.string   "name"
    t.integer  "parent_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "favorites", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "favoritable_id"
    t.string   "favoritable_type"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
  end

  add_index "favorites", ["user_id", "favoritable_id", "favoritable_type"], name: "user_id_type", unique: true
  add_index "favorites", ["user_id"], name: "index_favorites_on_user_id"

  create_table "formulas", force: :cascade do |t|
    t.string   "latex"
    t.string   "name"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.string   "symbol"
    t.integer  "unit_id"
    t.integer  "property_id"
    t.integer  "user_id"
    t.boolean  "shared"
    t.integer  "category_id"
  end

  add_index "formulas", ["category_id"], name: "index_formulas_on_category_id"
  add_index "formulas", ["property_id"], name: "index_formulas_on_property_id"
  add_index "formulas", ["unit_id"], name: "index_formulas_on_unit_id"
  add_index "formulas", ["user_id"], name: "index_formulas_on_user_id"

  create_table "formulas_globals", id: false, force: :cascade do |t|
    t.integer "formula_id", null: false
    t.integer "global_id",  null: false
  end

  add_index "formulas_globals", ["formula_id"], name: "index_formulas_globals_on_formula_id"

  create_table "globals", force: :cascade do |t|
    t.string   "symbol"
    t.string   "name"
    t.integer  "unit_id"
    t.string   "value"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.integer  "user_id"
    t.boolean  "shared"
    t.integer  "category_id"
  end

  add_index "globals", ["category_id"], name: "index_globals_on_category_id"
  add_index "globals", ["user_id"], name: "index_globals_on_user_id"

  create_table "properties", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string   "dims"
    t.integer  "user_id"
    t.boolean  "shared"
  end

  add_index "properties", ["user_id"], name: "index_properties_on_user_id"

  create_table "property_aliases", force: :cascade do |t|
    t.integer  "property_id"
    t.string   "name"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  add_index "property_aliases", ["property_id"], name: "index_property_aliases_on_property_id"

  create_table "test_states", force: :cascade do |t|
    t.string   "testHash"
    t.string   "testState"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tests", force: :cascade do |t|
    t.integer  "user_id"
    t.string   "title"
    t.string   "tester"
    t.string   "testHash"
    t.string   "parentHash"
    t.string   "access"
    t.string   "stateURL"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "tests", ["user_id"], name: "index_tests_on_user_id"

  create_table "units", force: :cascade do |t|
    t.integer  "property_id"
    t.string   "name"
    t.string   "system"
    t.boolean  "baseunit"
    t.string   "symbol"
    t.string   "prefix"
    t.string   "extend"
    t.string   "definition"
    t.string   "description"
    t.boolean  "approx"
    t.string   "factor"
    t.integer  "repeat"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.integer  "user_id"
    t.boolean  "shared"
  end

  add_index "units", ["property_id"], name: "index_units_on_property_id"
  add_index "units", ["user_id"], name: "index_units_on_user_id"

  create_table "users", force: :cascade do |t|
    t.string   "provider",               default: "email", null: false
    t.string   "uid",                    default: "",      null: false
    t.string   "encrypted_password",     default: "",      null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,       null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "name"
    t.string   "nickname"
    t.string   "image"
    t.string   "email"
    t.text     "tokens"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "users", ["email"], name: "index_users_on_email"
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  add_index "users", ["uid", "provider"], name: "index_users_on_uid_and_provider", unique: true

  create_table "variable_attributes", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "variables", force: :cascade do |t|
    t.string   "symbol"
    t.string   "name"
    t.integer  "unit_id"
    t.integer  "formula_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.integer  "property_id"
  end

  add_index "variables", ["formula_id"], name: "index_variables_on_formula_id"
  add_index "variables", ["property_id"], name: "index_variables_on_property_id"
  add_index "variables", ["unit_id"], name: "index_variables_on_unit_id"

end
