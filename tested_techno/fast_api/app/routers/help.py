from fastapi import APIRouter

router = APIRouter()

@router.get("/help/")
def get_help():
    return {"message": "Bienvenue dans l'API FastAPI"}