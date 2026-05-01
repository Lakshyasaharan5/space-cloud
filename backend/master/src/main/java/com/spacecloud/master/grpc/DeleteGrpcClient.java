package com.spacecloud.master.grpc;

import com.spacecloud.grpc.proto.DeleteRequest;
import com.spacecloud.grpc.proto.DeleteServiceGrpc;
import org.springframework.grpc.client.GrpcChannelFactory;
import org.springframework.stereotype.Service;

@Service
public class DeleteGrpcClient {

    private final DeleteServiceGrpc.DeleteServiceBlockingStub dn1;
    private final DeleteServiceGrpc.DeleteServiceBlockingStub dn2;
    private final DeleteServiceGrpc.DeleteServiceBlockingStub dn3;

    public DeleteGrpcClient(GrpcChannelFactory channels) {
        this.dn1 = DeleteServiceGrpc.newBlockingStub(channels.createChannel("datanode1"));
        this.dn2 = DeleteServiceGrpc.newBlockingStub(channels.createChannel("datanode2"));
        this.dn3 = DeleteServiceGrpc.newBlockingStub(channels.createChannel("datanode3"));
    }

    public void deleteFileOnAll(String fileId) {
        DeleteRequest request = DeleteRequest.newBuilder()
                .setFileId(fileId)
                .build();

        try { dn1.deleteFile(request); } catch (Exception ignored) {}
        try { dn2.deleteFile(request); } catch (Exception ignored) {}
        try { dn3.deleteFile(request); } catch (Exception ignored) {}
    }
}