# Multi-service container: Flask (Python) + Express (Node)
# Useful if you want a single Railway service. Otherwise, deploy services separately.

FROM node:20-bullseye as nodebase
WORKDIR /app/Server
COPY Server/package.json Server/tsconfig.json ./
RUN npm install
COPY Server/src ./src
RUN npm run build

FROM python:3.12-slim as pybase
WORKDIR /app/Server
COPY Server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY Server/src ./src

FROM python:3.12-slim
WORKDIR /app
COPY --from=nodebase /app/Server/dist /app/Server/dist
COPY --from=pybase /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY --from=pybase /usr/local/bin /usr/local/bin
COPY Server/start_prod.sh /app/Server/start_prod.sh
COPY Server/src /app/Server/src

# Optional: install libgl for OpenCV if needed
RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/* && chmod +x /app/Server/start_prod.sh

ENV FLASK_PORT=5000
ENV NODE_PORT=3001

EXPOSE 5000 3001

CMD ["/bin/bash", "/app/Server/start_prod.sh"]
