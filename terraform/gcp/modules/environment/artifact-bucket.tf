resource "google_storage_bucket" "artifact_bucket" {
  name = "artifacts-mxfactorial-${var.environment}"
}

resource "google_storage_bucket_object" "graphql_archive" {
  name   = "graphql-src.zip"
  bucket = google_storage_bucket.artifact_bucket.name
  source = "../../../../services/graphql-faas/graphql-src.zip"
}
