package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.StudyMaterial;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface StudyMaterialRepository extends MongoRepository<StudyMaterial, String> {
    List<StudyMaterial> findByClassId(String classId);

    List<StudyMaterial> findByClassIdAndType(String classId, String type);
}
