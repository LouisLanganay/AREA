from fastapi import APIRouter
from tested_techno.fast_api.app.models.item import Item

router = APIRouter()

@router.get("/items/")
def get_items():
    return [{"name": "item1"}, {"name": "item2"}]

@router.post("/items/")
def create_item(item: Item):
    return {"name": item.name, "price": item.price}
