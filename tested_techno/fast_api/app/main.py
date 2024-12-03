from fastapi import FastAPI
from tested_techno.fast_api.app.routers import items  # Importer les routes

app = FastAPI()

# Inclure les routes
app.include_router(items.router)

@app.get("/")
def read_root():
    return {"message": "Bienvenue dans l'API FastAPI"}
