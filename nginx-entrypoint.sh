#!/bin/bash

cat <<EOF | tee /etc/nginx/conf.d/default.conf
server {
  listen 80;
  
  server_name ${SERVER_NAME:-'localhost'};

  location /v1/ {
    proxy_pass http://${BACKEND_HOST:-'backend'}:8080/;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /api/ {
    proxy_pass http://${BACKEND_HOST:-'backend'}:8080/;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location / {
    root /var/www/html;
    index index.html;
  }
}
EOF

echo "Starting Nginx"
exec "nginx" "-g" "daemon off;"