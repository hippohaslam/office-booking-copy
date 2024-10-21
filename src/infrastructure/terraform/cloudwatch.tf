resource "aws_sns_topic" "booking_app_topic" {
  name = "hippo-booking-${var.env_suffix}-degraded-messages"
}

resource "aws_sns_topic_subscription" "booking_app_topic_subscription" {
  for_each  = var.email_recipients_alarms
  topic_arn = aws_sns_topic.booking_app_topic.arn
  protocol  = "email"
  endpoint  = each.key
}

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
  alarm_actions       = [aws_sns_topic.booking_app_topic.arn]
  dimensions = {
    EnvironmentName = local.beanstalk-api-name
  }
}