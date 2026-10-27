import logging

from rest_framework.views import exception_handler

logger = logging.getLogger('bikeerp')


def logging_exception_handler(exc, context):
    response = exception_handler(exc, context)
    request = context.get('request')
    where = f'{request.method} {request.path}' if request else '-'
    if response is None:
        logger.exception('unhandled error at %s', where, exc_info=exc)
    elif response.status_code >= 400:
        logger.warning('%s -> %s %s', where, response.status_code, getattr(exc, 'detail', exc))
    return response
