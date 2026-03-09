from slowapi import Limiter
from slowapi.util import get_remote_address

# Single limiter instance reused across routers.
limiter = Limiter(key_func=get_remote_address)
