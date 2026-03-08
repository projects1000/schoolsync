package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends MongoRepository<Subject, String> {
    List<Subject> findBySchoolId(String schoolId);

    Page<Subject> findBySchoolId(String schoolId, Pageable pageable);

    Optional<Subject> findBySchoolIdAndName(String schoolId, String name);

    boolean existsBySchoolIdAndName(String schoolId, String name);
}
