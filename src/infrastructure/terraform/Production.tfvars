environment             = "Production"
env_suffix              = "prod"
frontend_subdomain      = "reserve"
backend_subdomain       = "reserveapi"
beanstalk_instance_type = "t3.micro"
db_instance_size        = "db.t3.micro"
db_retention_period     = 7
enable_db_public_access = false
email_recipients_alarms = [
  "tom.baker@hippodigital.co.uk",
  "harry.young@hippodigital.co.uk",
  "stuart.maskell@hippodigital.co.uk",
  "adam.clarkson@hippodigital.co.uk"
]