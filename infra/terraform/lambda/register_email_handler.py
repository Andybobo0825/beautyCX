import json
import os

import boto3


ses = boto3.client("ses")


def _response(status_code: int, payload: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload),
    }


def lambda_handler(event, context):
    body = event.get("body") or "{}"

    if isinstance(body, str):
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            return _response(400, {"message": "Invalid JSON body"})
    else:
        payload = body

    to_email = payload.get("email")
    customer_name = payload.get("cName", "beautyCX user")
    client_id = payload.get("clientId", "")
    sender = os.environ.get("FROM_EMAIL", "")

    if not sender:
        return _response(500, {"message": "Missing FROM_EMAIL"})

    if not to_email:
        return _response(400, {"message": "Missing email"})

    subject = "Welcome to beautyCX"
    body_text = (
        f"Hello {customer_name},\n\n"
        "Your beautyCX account has been created successfully.\n"
        f"Client ID: {client_id}\n\n"
        "You can now sign in and start tracking products.\n"
    )

    ses.send_email(
        Source=sender,
        Destination={"ToAddresses": [to_email]},
        Message={
            "Subject": {"Data": subject},
            "Body": {"Text": {"Data": body_text}},
        },
    )

    return _response(200, {"message": "Email sent"})
