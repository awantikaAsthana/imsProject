from flask import jsonify


def api_response(
    status_code=200,
    message=None,
    data=None,
    error=None
):
    """
    Universal API response handler
    """

    # Default messages based on status code
    default_messages = {
        200: "Success",
        201: "Resource created successfully",
        204: "No content",
        400: "Bad request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Resource not found",
        422: "Validation error",
        500: "Internal server error",
    }

    response = {
        "success": 200 <= status_code < 300,
        "message": message or default_messages.get(status_code, ""),
        "data": data if status_code != 204 else None,
        "error": error,
    }

    # For 204, return empty body (REST standard)
    if status_code == 204:
        return "", 204

    return jsonify(response), status_code