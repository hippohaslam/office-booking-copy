resource "aws_amplify_app" "frontend_app" {
  name         = "hippo-booking-front-end-${var.env_suffix}"
  repository   = var.github_repo
  access_token = var.github_access_token

  #  environment_variables = {
  #    #Get these values from the output of the Beanstalk module
  #    VITE_API_BASE_URL     = aws_elastic_beanstalk_environment.hippo-booking-api-env.cname
  #    VITE_GOOGLE_CLIENT_ID = var.google_client_id
  #  }

  custom_rule {
    source = "/<*>"
    target = "/index.html"
    status = "404-200"
  }


  build_spec = <<BUILD_SPEC
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use v20
        - cd src/web/hippo-booking
        - yarn install
    build:
      commands:
        - yarn build
  artifacts:
    baseDirectory: src/web/hippo-booking/dist
    files:
      - '**/*'
  cache:
    paths:
      - src/web/hippo-booking/node_modules/**/*

BUILD_SPEC

  enable_branch_auto_build = false

  tags = local.tags
}

resource "aws_amplify_branch" "main_branch" {
  app_id      = aws_amplify_app.frontend_app.id
  branch_name = "main" # Replace with your branch name

  stage = "PRODUCTION"

  enable_auto_build = false

  tags = merge(local.tags, {
    Name = "MainBranch"
  })
}

resource "aws_amplify_domain_association" "example" {
  app_id      = aws_amplify_app.frontend_app.id
  domain_name = "${var.frontend_subdomain}.${var.hosted_zone_url}"

  sub_domain {
    branch_name = aws_amplify_branch.main_branch.branch_name
    prefix      = ""
  }
}

output "amplify_app_name" {
  value = aws_amplify_app.frontend_app.name
}
