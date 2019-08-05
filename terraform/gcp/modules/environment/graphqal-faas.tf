resource "google_cloudfunctions_function" "graphql" {
  name                  = "graphql-${var.environment}"
  description           = "graphql endpoint for mxfactorial services in ${var.environment}"
  runtime               = "nodejs10"
  region                = "us-central1"
  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.artifact_bucket.name
  source_archive_object = google_storage_bucket_object.graphql_archive.name
  timeout               = 60
  entry_point           = "handler"

  event_trigger {
    event_type = "providers/cloud.storage/eventTypes/object.change"
    resource   = google_storage_bucket.artifact_bucket.name
    failure_policy {
      retry = false
    }
  }
}
