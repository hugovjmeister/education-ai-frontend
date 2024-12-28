from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Node(Base):
    __tablename__ = "nodes"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(100), nullable=False)
    attributes = Column(JSON, nullable=False)

# Define la URL de tu base de datos
DATABASE_URL = "postgresql://postgresql://postgres:xN3a_!D/FzY.w@localhost:5432/education_ai_db"

# Conecta el motor a la base de datos
engine = create_engine(DATABASE_URL)

# Usa esto para crear las tablas manualmente (si no usas migraciones)
# Base.metadata.create_all(engine)