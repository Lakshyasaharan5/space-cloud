#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FRONTEND_PID=""
MASTER_PID=""
DN1_PID=""
DN2_PID=""
DN3_PID=""
AI_SERVICE_PID=""
COMPOSE_STARTED=false

stop_process() {
    local pid="${1:-}"

    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null || true
    fi
}

cleanup() {
    local exit_code=$?

    # Prevent cleanup from running more than once.
    trap - EXIT INT TERM

    echo ""
    echo "Stopping all services..."

    stop_process "$AI_SERVICE_PID"
    stop_process "$FRONTEND_PID"
    stop_process "$MASTER_PID"
    stop_process "$DN1_PID"
    stop_process "$DN2_PID"
    stop_process "$DN3_PID"

    if [[ "$COMPOSE_STARTED" == true ]]; then
        echo "Stopping Docker Compose services..."
        (
            cd "$ROOT_DIR"
            docker compose down
        ) || true
    fi

    echo "Cleanup complete."
    exit "$exit_code"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

cd "$ROOT_DIR"

# Docker Compose
echo "Starting Docker Compose services..."
docker compose up -d
COMPOSE_STARTED=true

# Frontend
echo "Starting frontend..."
(
    cd "$ROOT_DIR/frontend"
    exec npm run dev
) &
FRONTEND_PID=$!


# Master
echo "Building master..."
(
    cd "$ROOT_DIR/backend/master"
    ./mvnw clean package
)

echo "Starting master..."
(
    cd "$ROOT_DIR/backend/master"
    exec ./mvnw spring-boot:run
) &
MASTER_PID=$!

# Datanodes
echo "Building datanodes..."
(
    cd "$ROOT_DIR/backend/datanode"
    ./mvnw clean package
)

echo "Starting datanode 1..."
(
    cd "$ROOT_DIR/backend/datanode"
    exec ./mvnw spring-boot:run \
        -Dspring-boot.run.arguments="--server.port=8081 --spring.grpc.server.port=9091 --storage.path=data-node1 --datanode.index=0"
) &
DN1_PID=$!

echo "Starting datanode 2..."
(
    cd "$ROOT_DIR/backend/datanode"
    exec ./mvnw spring-boot:run \
        -Dspring-boot.run.arguments="--server.port=8082 --spring.grpc.server.port=9092 --storage.path=data-node2 --datanode.index=1"
) &
DN2_PID=$!

echo "Starting datanode 3..."
(
    cd "$ROOT_DIR/backend/datanode"
    exec ./mvnw spring-boot:run \
        -Dspring-boot.run.arguments="--server.port=8083 --spring.grpc.server.port=9093 --storage.path=data-node3 --datanode.index=2"
) &
DN3_PID=$!

# AI service
echo "Starting AI service..."
(
    cd "$ROOT_DIR/ai-service"
    exec npm run dev
) &
AI_SERVICE_PID=$!

echo ""
echo "All services started."
echo "Press Ctrl+C to stop everything."

wait
