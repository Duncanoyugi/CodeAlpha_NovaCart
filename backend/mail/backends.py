# backend/mail/backends.py
"""Email backend that sends through the Brevo transactional API (port 443).

Some networks (including this one) block outbound SMTP ports 587/465
entirely, while HTTPS always gets through. Brevo's v3 ``/smtp/email``
endpoint delivers the same mail over HTTPS, so it works everywhere.
"""
import base64
import logging
from email.utils import parseaddr

import requests
from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend

logger = logging.getLogger(__name__)

BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'


def _parse_sender(value):
    """'PlayHouse Gadgets <a@b.c>' or 'a@b.c' -> {'name': ..., 'email': ...}."""
    name, email = parseaddr(str(value or ''))
    if not email:
        raise ValueError('A sender email address is required to send mail.')
    return {'name': name or email, 'email': email}


def _recipients(addresses):
    """Django uses plain strings for to/cc/bcc; keep (name, addr) support too."""
    result = []
    for entry in addresses or []:
        if isinstance(entry, str):
            result.append({'email': entry, 'name': entry})
        else:
            name, addr = entry
            result.append({'email': addr, 'name': name or addr})
    return result


class BrevoApiEmailBackend(BaseEmailBackend):
    """Django email backend that uses the Brevo API instead of SMTP."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.api_key = getattr(settings, 'BREVO_API_KEY', '') or ''
        if not self.api_key:
            raise ValueError('BREVO_API_KEY is not configured.')
        self.default_sender = _parse_sender(getattr(settings, 'DEFAULT_FROM_EMAIL', ''))

    def open(self):
        return True

    def close(self):
        pass

    def _build_payload(self, email_message):
        sender = _parse_sender(email_message.from_email) if email_message.from_email else self.default_sender
        payload = {
            'sender': sender,
            'to': _recipients(email_message.to),
            'subject': email_message.subject or '',
        }

        html = None
        for content_type, content in (email_message.alternatives or []):
            if content_type == 'text/html':
                html = content
        if html:
            payload['htmlContent'] = html
            if email_message.body:
                payload['textContent'] = email_message.body
        else:
            payload['textContent'] = email_message.body

        if email_message.cc:
            payload['cc'] = _recipients(email_message.cc)
        if email_message.bcc:
            payload['bcc'] = _recipients(email_message.bcc)
        if email_message.reply_to:
            payload['replyTo'] = {
                'email': email_message.reply_to[0][1],
                'name': email_message.reply_to[0][0] or email_message.reply_to[0][1],
            }

        attachments = []
        for filename, content, mimetype in (email_message.attachments or []):
            attachments.append({
                'name': filename,
                'content': base64.b64encode(content).decode('ascii'),
                'contentType': mimetype,
            })
        if attachments:
            payload['attachment'] = attachments
        return payload

    def send_messages(self, email_messages):
        sent = 0
        for email_message in email_messages:
            payload = self._build_payload(email_message)
            response = requests.post(
                BREVO_API_URL,
                json=payload,
                headers={'api-key': self.api_key, 'Content-Type': 'application/json'},
                timeout=getattr(settings, 'EMAIL_TIMEOUT', 15),
            )
            if response.status_code >= 400:
                detail = ''
                try:
                    detail = response.json().get('message', '')
                except ValueError:
                    detail = response.text[:200]
                raise ConnectionError(f'Brevo API error {response.status_code}: {detail}')
            sent += 1
        return sent
