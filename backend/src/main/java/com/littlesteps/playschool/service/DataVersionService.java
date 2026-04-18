package com.littlesteps.playschool.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class DataVersionService {

    private final AtomicLong version = new AtomicLong(1);
    private volatile Instant updatedAt = Instant.now();

    public void bumpVersion() {
        version.incrementAndGet();
        updatedAt = Instant.now();
    }

    public Map<String, Object> getSnapshot() {
        return Map.of(
                "version", version.get(),
                "updatedAt", updatedAt.toString()
        );
    }
}
