from fastapi import APIRouter
from app.api.v1.endpoints import auth, leads, webhooks, users, products

api_router = APIRouter(prefix="/v1")
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(leads.router)
api_router.include_router(webhooks.router)
api_router.include_router(products.router)
