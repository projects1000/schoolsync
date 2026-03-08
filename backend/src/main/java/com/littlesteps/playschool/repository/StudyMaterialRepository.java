package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.StudyMaterial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface StudyMaterialRepository extends MongoRepository<StudyMaterial, String> {
    List<StudyMaterial> findByClassId(String classId);
    Page<StudyMaterial> findByClassId(String classId, Pageable pageable);

    List<StudyMaterial> findByClassIdAndType(String classId, String type);
}
