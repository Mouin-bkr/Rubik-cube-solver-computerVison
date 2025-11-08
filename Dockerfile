# Multi-service container: Flask (Python) + Express (Node)
# Useful if you want a single Railway service. Otherwise, deploy services separately.

FROM node:20-bullseye

WORKDIR /app

# Install python, pip and nginx
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 python3-pip nginx procps gettext-base \
	&& rm -rf /var/lib/apt/lists/*

# Copy server source and install Node deps, build Express
COPY Server/package.json Server/package-lock.json* ./Server/
WORKDIR /app/Server
RUN npm install --legacy-peer-deps || npm install || true
COPY Server/src ./src
RUN npm run build

# Install Python requirements for Flask
COPY Server/requirements.txt ./requirements.txt
RUN python3 -m pip install --no-cache-dir -r requirements.txt

# Copy start scripts and nginx template
COPY Server/start_prod.sh /app/Server/start_prod.sh
COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /app/Server/start_prod.sh /entrypoint.sh

ENV FLASK_PORT=5000
ENV NODE_PORT=3001

# Render will set PORT; default to 8080 for local testing
ENV PORT=8080

EXPOSE 8080

CMD ["/entrypoint.sh"]
