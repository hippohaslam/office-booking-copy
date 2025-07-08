
resource "aws_cloudwatch_metric_alarm" "beanstalk_health_alarm" {
  alarm_name          = "${local.beanstalk-api-name}-alarm-activated"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "EnvironmentHealth"
  namespace           = "AWS/ElasticBeanstalk"
  period              = 120
  statistic           = "Sum"
  threshold           = 2
  alarm_description   = "Activates when an alarm triggers for the Elastic Beanstalk instance. Usually to capture degradation or performance bottlenecks"
  actions_enabled     = "true"
  dimensions = {
    EnvironmentName = local.beanstalk-api-name
  }
}

resource "aws_cloudwatch_metric_alarm" "cpu_utilization_too_high" {
  alarm_name          = "Booking ${var.environment} Database CPU too high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Average database CPU utilization over last 5 minutes too high"
  actions_enabled     = "true"
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.hippo-booking-db.identifier
  }
}