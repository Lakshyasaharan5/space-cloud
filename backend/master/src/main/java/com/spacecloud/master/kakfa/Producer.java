package com.spacecloud.master.kakfa;

import com.spacecloud.master.dto.ChunkMapResponse;
import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class Producer {

    private static final String TOPIC = "ai-embedding-topic";

    private final KafkaTemplate<String, ChunkMapResponse> kafkaTemplate;
    private final DefaultKafkaProducerFactory<String, ChunkMapResponse> producerFactory;

    private final AtomicBoolean stopped = new AtomicBoolean(false);

    public Producer(
            KafkaTemplate<String, ChunkMapResponse> kafkaTemplate,
            DefaultKafkaProducerFactory<String, ChunkMapResponse> producerFactory
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.producerFactory = producerFactory;
    }

    public void sendEmbedEvent(ChunkMapResponse event) {
        if (stopped.get()) {
            System.out.println("Stopping Producer");
            return;
        }
        System.out.println("Sending event");
        try {
            kafkaTemplate.send(TOPIC, event.getFileId(), event)
                    .whenComplete((result, error) -> {
                        if (error != null && stopped.compareAndSet(false, true)) {
                            System.err.println("Kafka failed. Producer stopped.");
                            producerFactory.reset();
                            return;
                        }
                        System.out.println("Event sent");
                    });
        } catch (Exception error) {
            if (stopped.compareAndSet(false, true)) {
                System.err.println("Kafka failed. Producer stopped.");
                producerFactory.reset();
            }
        }
    }
}