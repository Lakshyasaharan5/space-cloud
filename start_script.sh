#!/bin/bash

set -e

cleanup() {
    echo ""
    echo "Stopping all services..."

    kill $FRONTEND_PID 2>/dev/null || true
    kill $MASTER_PID 2>/dev/null || true
    kill $DN1_PID 2>/dev/null || true
    kill $DN2_PID 2>/dev/null || true
    kill $DN3_PID 2>/dev/null || true

    echo "Cleanup complete."
}

trap cleanup EXIT INT TERM

# frontend
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# master
echo "Starting master..."
cd backend/master
./mvnw clean package
./mvnw spring-boot:run &
MASTER_PID=$!
cd ../..

# datanodes
echo "Starting datanode1..."
cd backend/datanode

./mvnw clean package

./mvnw spring-boot:run \
-Dspring-boot.run.arguments="--server.port=8081 --spring.grpc.server.port=9091 --storage.path=data-node1 --datanode.index=0" &
DN1_PID=$!

echo "Starting datanode2..."
./mvnw spring-boot:run \
-Dspring-boot.run.arguments="--server.port=8082 --spring.grpc.server.port=9092 --storage.path=data-node2 --datanode.index=1" &
DN2_PID=$!

echo "Starting datanode3..."
./mvnw spring-boot:run \
-Dspring-boot.run.arguments="--server.port=8083 --spring.grpc.server.port=9093 --storage.path=data-node3 --datanode.index=2" &
DN3_PID=$!

cd ../..

echo "All services started."

wait
