import os
import psycopg2
from psycopg2 import sql

# Obtén la URL de la base de datos desde las variables de entorno
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:xN3a_!D/FzY.w@localhost:5432/education_ai_db")

def create_database():
    connection = None  # Inicializamos la variable
    try:
        # Conectarse a la base de datos
        connection = psycopg2.connect(DATABASE_URL)
        connection.autocommit = True
        cursor = connection.cursor()

        # Crea una tabla de ejemplo
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS nodes (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            attributes JSONB NOT NULL
        );
        """)
        print("Base de datos y tabla creadas exitosamente.")
    except Exception as e:
        print("Error al conectar o crear la base de datos:")
        print(e)
    finally:
        # Cerramos la conexión si está inicializada
        if connection:
            cursor.close()
            connection.close()

if __name__ == "__main__":
    create_database()