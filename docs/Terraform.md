<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | 5.64.0 |
| <a name="requirement_random"></a> [random](#requirement\_random) | 3.6.2 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | 5.64.0 |
| <a name="provider_random"></a> [random](#provider\_random) | 3.6.2 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [aws_acm_certificate.backend_certificate](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/acm_certificate) | resource |
| [aws_acm_certificate_validation.backend_cert_validation](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/acm_certificate_validation) | resource |
| [aws_amplify_app.frontend_app](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/amplify_app) | resource |
| [aws_amplify_branch.main_branch](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/amplify_branch) | resource |
| [aws_amplify_domain_association.example](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/amplify_domain_association) | resource |
| [aws_db_instance.hippo-booking-db](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/db_instance) | resource |
| [aws_db_subnet_group.db-subnet](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/db_subnet_group) | resource |
| [aws_elastic_beanstalk_application.hippo-booking-api](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/elastic_beanstalk_application) | resource |
| [aws_elastic_beanstalk_environment.hippo-booking-api-env](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/elastic_beanstalk_environment) | resource |
| [aws_iam_instance_profile.eb_instance_profile](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/iam_instance_profile) | resource |
| [aws_iam_role.eb_instance_role](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/iam_role) | resource |
| [aws_internet_gateway.gw](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/internet_gateway) | resource |
| [aws_route53_record.backend_cert_route53_record](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/route53_record) | resource |
| [aws_route53_record.backend_record](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/route53_record) | resource |
| [aws_route_table.private_route_table](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/route_table) | resource |
| [aws_route_table.public_route_table](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/route_table) | resource |
| [aws_route_table_association.hippo-booking-api-subnet-a-routing](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/route_table_association) | resource |
| [aws_route_table_association.hippo-booking-api-subnet-b-routing](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/route_table_association) | resource |
| [aws_route_table_association.hippo-booking-subnet-c-routing](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/route_table_association) | resource |
| [aws_route_table_association.hippo-booking-subnet-db-a-routing](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/route_table_association) | resource |
| [aws_route_table_association.hippo-booking-subnet-db-b-routing](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/route_table_association) | resource |
| [aws_security_group.beanstalk_sg](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/security_group) | resource |
| [aws_security_group.db-security-group](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/security_group) | resource |
| [aws_subnet.hippo-booking-api-subnet-a](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/subnet) | resource |
| [aws_subnet.hippo-booking-api-subnet-b](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/subnet) | resource |
| [aws_subnet.hippo-booking-subnet-db-a](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/subnet) | resource |
| [aws_subnet.hippo-booking-subnet-db-b](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/subnet) | resource |
| [aws_subnet.hippo-booking-subnet-db-c](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/subnet) | resource |
| [aws_vpc.hippo-booking-vpc](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/vpc) | resource |
| [aws_vpc_security_group_egress_rule.allow_all_traffic_ipv4](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/vpc_security_group_egress_rule) | resource |
| [aws_vpc_security_group_egress_rule.allow_all_traffic_ipv6](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/vpc_security_group_egress_rule) | resource |
| [aws_vpc_security_group_ingress_rule.allow_hippo_office_ipv4](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/vpc_security_group_ingress_rule) | resource |
| [aws_vpc_security_group_ingress_rule.allow_tls_ipv4](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/resources/vpc_security_group_ingress_rule) | resource |
| [random_password.db_password](https://registry.terraform.io/providers/hashicorp/random/3.6.2/docs/resources/password) | resource |
| [aws_elastic_beanstalk_hosted_zone.current](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/data-sources/elastic_beanstalk_hosted_zone) | data source |
| [aws_route53_zone.hippo-internal-zone](https://registry.terraform.io/providers/hashicorp/aws/5.64.0/docs/data-sources/route53_zone) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_aws_access_key_id"></a> [aws\_access\_key\_id](#input\_aws\_access\_key\_id) | AWS Access Key ID | `string` | n/a | yes |
| <a name="input_aws_secret_access_key"></a> [aws\_secret\_access\_key](#input\_aws\_secret\_access\_key) | AWS Secret Access Key | `string` | n/a | yes |
| <a name="input_backend_subdomain"></a> [backend\_subdomain](#input\_backend\_subdomain) | Backend Subdomain | `string` | n/a | yes |
| <a name="input_db_instance_size"></a> [db\_instance\_size](#input\_db\_instance\_size) | DB Instance Size | `string` | n/a | yes |
| <a name="input_env_suffix"></a> [env\_suffix](#input\_env\_suffix) | Environment Suffix | `string` | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | Environment | `string` | n/a | yes |
| <a name="input_frontend_subdomain"></a> [frontend\_subdomain](#input\_frontend\_subdomain) | Frontend Subdomain | `string` | n/a | yes |
| <a name="input_github_access_token"></a> [github\_access\_token](#input\_github\_access\_token) | Github access token | `string` | n/a | yes |
| <a name="input_github_repo"></a> [github\_repo](#input\_github\_repo) | Github repository URL | `string` | n/a | yes |
| <a name="input_google_client_secret"></a> [google\_client\_secret](#input\_google\_client\_secret) | Google Client Secret | `string` | n/a | yes |
| <a name="input_hosted_zone_url"></a> [hosted\_zone\_url](#input\_hosted\_zone\_url) | Hosted Zone URL | `string` | n/a | yes |
| <a name="input_slack_signing_secret"></a> [slack\_signing\_secret](#input\_slack\_signing\_secret) | Slack Signing Secret | `string` | n/a | yes |
| <a name="input_slack_token"></a> [slack\_token](#input\_slack\_token) | Slack Token | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_amplify_app_name"></a> [amplify\_app\_name](#output\_amplify\_app\_name) | n/a |
| <a name="output_elastic_beanstalk_application_name"></a> [elastic\_beanstalk\_application\_name](#output\_elastic\_beanstalk\_application\_name) | n/a |
| <a name="output_elastic_beanstalk_environment_name"></a> [elastic\_beanstalk\_environment\_name](#output\_elastic\_beanstalk\_environment\_name) | n/a |
<!-- END_TF_DOCS -->