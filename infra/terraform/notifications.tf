data "archive_file" "register_email_lambda" {
  type        = "zip"
  source_file = "${path.module}/lambda/register_email_handler.py"
  output_path = "${path.module}/register_email_handler.zip"
}

resource "aws_iam_role" "lambda_email" {
  name = "${local.name_prefix}-lambda-email-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_email.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_ses" {
  name = "${local.name_prefix}-lambda-ses-policy"
  role = aws_iam_role.lambda_email.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_lambda_function" "register_email" {
  function_name    = "${local.name_prefix}-register-email"
  role             = aws_iam_role.lambda_email.arn
  handler          = "register_email_handler.lambda_handler"
  runtime          = "python3.12"
  filename         = data.archive_file.register_email_lambda.output_path
  source_code_hash = data.archive_file.register_email_lambda.output_base64sha256
  timeout          = 15

  environment {
    variables = {
      FROM_EMAIL = var.ses_sender_email
    }
  }
}

resource "aws_ses_email_identity" "sender" {
  email = var.ses_sender_email
}

resource "aws_api_gateway_rest_api" "email" {
  name        = "${local.name_prefix}-email-api"
  description = "Register notification API for beautyCX."
}

resource "aws_api_gateway_resource" "project_email" {
  rest_api_id = aws_api_gateway_rest_api.email.id
  parent_id   = aws_api_gateway_rest_api.email.root_resource_id
  path_part   = local.api_gateway_path
}

resource "aws_api_gateway_method" "project_email_post" {
  rest_api_id   = aws_api_gateway_rest_api.email.id
  resource_id   = aws_api_gateway_resource.project_email.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "project_email_lambda" {
  rest_api_id             = aws_api_gateway_rest_api.email.id
  resource_id             = aws_api_gateway_resource.project_email.id
  http_method             = aws_api_gateway_method.project_email_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.register_email.invoke_arn
}

resource "aws_lambda_permission" "allow_apigw" {
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.register_email.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.email.execution_arn}/*/POST${aws_api_gateway_resource.project_email.path}"
}

resource "aws_api_gateway_deployment" "email" {
  rest_api_id = aws_api_gateway_rest_api.email.id

  triggers = {
    redeployment = sha1(jsonencode({
      resource_id    = aws_api_gateway_resource.project_email.id
      method_id      = aws_api_gateway_method.project_email_post.id
      integration_id = aws_api_gateway_integration.project_email_lambda.id
      lambda_arn     = aws_lambda_function.register_email.arn
    }))
  }

  depends_on = [aws_api_gateway_integration.project_email_lambda]
}

resource "aws_api_gateway_stage" "email" {
  rest_api_id   = aws_api_gateway_rest_api.email.id
  deployment_id = aws_api_gateway_deployment.email.id
  stage_name    = var.api_gateway_stage_name
}
