FROM node:20.18.1

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Establecer la variable de entorno
ENV NODE_OPTIONS=--openssl-legacy-provider

# Copiar el resto de la aplicación
COPY . .

# Construir el proyecto
RUN npm run build

# Usar una imagen base de Nginx para servir la aplicación
FROM nginx:alpine
COPY --from=0 /usr/src/app/build /usr/share/nginx/html