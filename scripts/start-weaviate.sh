#!/bin/bash

echo "Starting Weaviate with Docker Compose..."
docker-compose up -d

echo "Waiting for Weaviate to be ready..."
until curl -s http://localhost:8080/v1/.well-known/ready > /dev/null; do
  sleep 2
  echo "Still waiting..."
done

echo "Weaviate is ready!"
echo "Access Weaviate at: http://localhost:8080"
echo "Access Weaviate Console at: http://localhost:8080/v1/console"