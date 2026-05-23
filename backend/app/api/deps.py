import time
from collections import defaultdict
from fastapi import Request, HTTPException, status

from app.core.config import Settings, get_settings
from app.core.exceptions import VapiNotConfiguredException
from app.models.call_store import CallStore
from app.services.scenario_service import ScenarioService
from app.services.vapi_service import VapiService


class InMemoryRateLimiter:
    def __init__(self, requests_limit: int, window_seconds: int):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.history = defaultdict(list)

    def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Keep only timestamps within the sliding window
        self.history[client_ip] = [
            t for t in self.history[client_ip]
            if now - t < self.window_seconds
        ]
        
        if len(self.history[client_ip]) >= self.requests_limit:
            retry_after = int(self.window_seconds - (now - self.history[client_ip][0]))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Please try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)}
            )
        
        self.history[client_ip].append(now)


# Max 5 calls per minute per client IP to prevent carrier call storming
call_rate_limiter = InMemoryRateLimiter(requests_limit=5, window_seconds=60)


def get_settings_dep() -> Settings:
    return get_settings()


def get_call_store(request: Request) -> CallStore:
    return request.app.state.call_store


def get_scenario_service(request: Request) -> ScenarioService:
    return request.app.state.scenario_service


def get_vapi_service(request: Request) -> VapiService:
    settings = get_settings()
    if not settings.is_vapi_configured:
        raise VapiNotConfiguredException("Vapi is not configured.")
    return request.app.state.vapi_service
