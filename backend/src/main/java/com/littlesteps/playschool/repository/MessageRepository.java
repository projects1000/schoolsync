package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByClassId(String classId);

    List<Message> findBySenderId(String senderId);

    List<Message> findByRecipientId(String recipientId);

    List<Message> findByClassIdAndRecipientId(String classId, String recipientId);
}
