# SpaceCloud
Google Drive like distributed cloud storage platform

### Frontend
Single page file management page
```
cd frontend/
npm run dev
```

### Backend/master
```
./mvnw clean package # it creates gRPC proto stubs
./mvnw spring-boot:run
```

### Backend/datanodes
```
./mvnw clean package # it creates gRPC proto stubs

# start other instances 1,2,3 as well
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=8081 --spring.grpc.server.port=9091 --storage.path=data-node1 --datanode.index=0"
```

### TODO

- Create architecture diagram for storage logic
- Plan AI smart search integration

