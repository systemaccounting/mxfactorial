resource "google_sql_database_instance" "master" {
  name             = "db-${var.environment}"
  database_version = "MYSQL_5_6"
  region           = "us-central1"

  settings {
    # https://cloud.google.com/sql/pricing
    tier = "db-f1-micro"
  }
}

resource "google_sql_user" "admin" {
  name     = var.db_master_username
  password = var.db_master_password
  instance = google_sql_database_instance.master.name
}
