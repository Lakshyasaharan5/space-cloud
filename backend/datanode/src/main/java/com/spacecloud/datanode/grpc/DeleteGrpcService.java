package com.spacecloud.datanode.grpc;

import com.spacecloud.grpc.proto.DeleteRequest;
import com.spacecloud.grpc.proto.DeleteResponse;
import com.spacecloud.grpc.proto.DeleteServiceGrpc;
import com.spacecloud.datanode.service.ChunkStorageService;
import io.grpc.stub.StreamObserver;
import org.springframework.grpc.server.service.GrpcService;

import java.io.IOException;

@GrpcService
public class DeleteGrpcService extends DeleteServiceGrpc.DeleteServiceImplBase {

    private final ChunkStorageService chunkStorageService;

    public DeleteGrpcService(ChunkStorageService chunkStorageService) {
        this.chunkStorageService = chunkStorageService;
    }

    @Override
    public void deleteFile(DeleteRequest request, StreamObserver<DeleteResponse> responseObserver) {
        String fileId = request.getFileId();

        try {
            chunkStorageService.deleteFile(fileId);
        } catch (IOException e) {
            // still return success (idempotent design)
        }

        DeleteResponse response = DeleteResponse.newBuilder()
                .setStatus("OK")
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}