# backend/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from .models import Base, Node
from pydantic import BaseModel
from typing import List

Base.metadata.create_all(bind=engine)

# Configura CORS
origins = [
    "http://localhost:3000",
    # Añade otras URLs según sea necesario
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NodeCreate(BaseModel):
    label: str 
    attributes: List[dict]

class NodeUpdate(BaseModel):
    label: str 
    attributes: List[dict]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/nodes/", response_model=dict)
def create_node(node: NodeCreate, db: Session = Depends(get_db)):
    db_node = Node(label=node.label, attributes=node.attributes)
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return {"id": db_node.id, "label": db_node.label, "attributes": db_node.attributes}

@app.get("/nodes/", response_model=list)
def read_nodes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    nodes = db.query(Node).offset(skip).limit(limit).all()
    return [
        {"id": node.id, "label": node.label, "attributes": node.attributes}
        for node in nodes
    ]

@app.put("/nodes/{node_id}", response_model=dict)
def update_node(node_id: int, node: NodeUpdate, db: Session = Depends(get_db)):
    db_node = db.query(Node).filter(Node.id == node_id).first()
    if db_node is None:
        raise HTTPException(status_code=404, detail="Nodo no encontrado")
    
    # Actualiza los datos del nodo
    db_node.label = node.label
    db_node.attributes = node.attributes
    db.commit()
    db.refresh(db_node)
    
    return {"id": db_node.id, "label": db_node.label, "attributes": db_node.attributes}

@app.delete("/nodes/{node_id}", response_model=dict)
def delete_node(node_id: int, db: Session = Depends(get_db)):
    db_node = db.query(Node).filter(Node.id == node_id).first()
    if db_node is None:
        raise HTTPException(status_code=404, detail="Nodo no encontrado")
    db.delete(db_node)
    db.commit()
    return {"detail": "Nodo eliminado"}
