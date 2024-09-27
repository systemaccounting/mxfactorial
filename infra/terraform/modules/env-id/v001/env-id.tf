locals {
  PATH  = "../../../../../.env"
  # split file content into lines
  LINES = split("\n", data.local_file.env_file.content)
  # match line starting with ENV_ID
  MATCH = join("", [for line in local.LINES : line if length(regexall("^ENV_ID", line)) > 0])
  # parse assigned value
  ENV_ID = regex("ENV_ID=(.*)", local.MATCH)[0]
}

data "local_file" "env_file" {
  filename = local.PATH
}

output "ENV_ID" {
  value = local.ENV_ID
}