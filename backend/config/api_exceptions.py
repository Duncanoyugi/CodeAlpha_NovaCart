from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    code = getattr(exc, "default_code", "error")
    detail = response.data
    fields = {}

    if isinstance(detail, dict):
        message = detail.get("detail")
        if message is None:
            fields = detail
            message = "Please correct the highlighted fields."
    else:
        message = detail

    response.data = {
        "error": {
            "code": str(code),
            "message": str(message),
            "fields": fields,
        }
    }
    return response
