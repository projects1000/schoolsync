package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Section;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SectionRepository extends MongoRepository<Section, String> {
    List<Section> findByClassId(String classId);

    boolean existsByClassIdAndName(String classId, String name);

    void deleteByClassId(String classId);
}
