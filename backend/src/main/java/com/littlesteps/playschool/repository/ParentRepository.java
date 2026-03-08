package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Parent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParentRepository extends MongoRepository<Parent, String> {

    List<Parent> findBySchoolId(String schoolId);

    List<Parent> findBySchoolIdAndStatusNot(String schoolId, Parent.Status status);
    Page<Parent> findBySchoolIdAndStatusNot(String schoolId, Parent.Status status, Pageable pageable);

    List<Parent> findBySchoolIdAndStatus(String schoolId, Parent.Status status);
    Page<Parent> findBySchoolIdAndStatus(String schoolId, Parent.Status status, Pageable pageable);

    Optional<Parent> findByIdAndSchoolId(String id, String schoolId);

    Optional<Parent> findBySchoolIdAndEmail(String schoolId, String email);

    @Query("{ 'schoolId': ?0, '$or': [ { 'name': { '$regex': ?1, '$options': 'i' } }, { 'email': { '$regex': ?1, '$options': 'i' } } ] }")
    List<Parent> searchParents(String schoolId, String searchTerm);

    // Complex joins are difficult in Mongo Repository interface.
    // It's better to fetch parents and filter in service or store class info in
    // student/parent more denormalized
    // For now, I will comment out this join and handle it in service if needed, or
    // approximate it.
    // @Query("SELECT p FROM Parent p JOIN p.children c WHERE c.className =
    // :className")
    // List<Parent> findByChildrenClassName(@Param("className") String className);

    boolean existsByEmail(String email);

    @Query("{ 'userId': ?0 }")
    Optional<Parent> findByUserId(String userId);
}