package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Announcement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends MongoRepository<Announcement, String> {

    List<Announcement> findBySchoolIdOrderByCreatedAtDesc(String schoolId);

    List<Announcement> findBySchoolIdAndAudienceOrderByCreatedAtDesc(String schoolId, Announcement.Audience audience);
}
