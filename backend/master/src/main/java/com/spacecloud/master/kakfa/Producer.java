package com.spacecloud.master.kakfa;
import com.spacecloud.master.dto.ChunkMapResponse;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class Producer {

    private static final String TOPIC = "ai-embedding-topic";

    private final KafkaTemplate<String, ChunkMapResponse> kafkaTemplate;

    public Producer(KafkaTemplate<String, ChunkMapResponse> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendEmbedEvent(ChunkMapResponse event) {
        kafkaTemplate.send(TOPIC, event.getFileId(), event);
    }
}