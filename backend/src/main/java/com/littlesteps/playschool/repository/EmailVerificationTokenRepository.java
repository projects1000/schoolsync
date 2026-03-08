package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.EmailVerificationToken;
import com.littlesteps.playschool.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends MongoRepository<EmailVerificationToken, String> {
    Optional<EmailVerificationToken> findByToken(String token);
    void deleteByUser(User user);
}
