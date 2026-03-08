package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByClassId(String classId);
    Page<Message> findByClassId(String classId, Pageable pageable);

    List<Message> findBySenderId(String senderId);
    Page<Message> findBySenderId(String senderId, Pageable pageable);

    List<Message> findByRecipientId(String recipientId);
    Page<Message> findByRecipientId(String recipientId, Pageable pageable);

    List<Message> findByClassIdAndRecipientId(String classId, String recipientId);
    Page<Message> findByClassIdAndRecipientId(String classId, String recipientId, Pageable pageable);
}
