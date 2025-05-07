resource "aws_secretsmanager_secret" "dotnet_secrets" {
  name = "booking-api-secrets-${lower(var.environment)}"
}

resource "aws_secretsmanager_secret_version" "dotnet_secrets_version" {
  secret_id     = aws_secretsmanager_secret.dotnet_secrets.id
  secret_string = <<EOF
{
    "ConnectionStrings:HippoBookingDbContext": "Server=${aws_db_instance.hippo-booking-db.address};Port=${aws_db_instance.hippo-booking-db.port};User Id=${aws_db_instance.hippo-booking-db.username};Password=${aws_db_instance.hippo-booking-db.password};Database=HippoBooking_${var.environment}",
    "ConnectionStrings:HangfireDbContext": "Server=${aws_db_instance.hippo-booking-db.address};Port=${aws_db_instance.hippo-booking-db.port};User Id=${aws_db_instance.hippo-booking-db.username};Password=${aws_db_instance.hippo-booking-db.password};Database=Hangfire_${var.environment}",
    "Google:ClientSecret": "${var.google_client_secret}",
    "Slack:Token": "${var.slack_token}",
    "Slack:SigningSecret": "${var.slack_signing_secret}",
    "Screen:AuthKey": "${random_password.screen_auth_key.result}",
    "Google:ServiceAccount:Credentials": "${var.google_credentials}"
}
EOF
}

resource "random_password" "screen_auth_key" {
  length  = 16
  special = false
}
