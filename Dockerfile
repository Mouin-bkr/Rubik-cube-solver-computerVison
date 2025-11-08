# Multi-service container: Flask (Python) + Express (Node)
# Useful if you want a single Railway service. Otherwise, deploy services separately.

FROM node:20-bullseye

WORKDIR /app

# Install python, pip and nginx
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 python3-pip nginx procps gettext-base \
	&& rm -rf /var/lib/apt/lists/*

# Copy whole Server directory into the image (avoids path/copy issues)
COPY Server /app/Server
WORKDIR /app/Server

# Install Node deps and build Express
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps || npm install --legacy-peer-deps; else npm install --legacy-peer-deps || true; fi
RUN npm run build || echo "npm build did not produce dist (check build logs)"

# Install Python requirements for Flask
# Ensure pip and build tools are recent so wheels (numpy, etc.) can be installed
RUN python3 -m pip install --upgrade pip setuptools wheel
RUN python3 -m pip install --no-cache-dir -r requirements.txt

# Copy start scripts and nginx template (already present under /app/Server from COPY)
RUN chmod +x /app/Server/start_prod.sh || true
COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /app/Server/start_prod.sh /entrypoint.sh || true

ENV FLASK_PORT=5000
ENV NODE_PORT=3001

# Render will set PORT; default to 8080 for local testing
ENV PORT=8080

EXPOSE 8080

CMD ["/entrypoint.sh"]
