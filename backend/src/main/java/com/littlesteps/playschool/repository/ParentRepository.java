package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Parent;
import com.littlesteps.playschool.entity.Parent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentRepository extends MongoRepository<Parent, String> {

    Optional<Parent> findByEmail(String email);

    List<Parent> findByStatus(Parent.Status status);

    @Query("{ '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'email': { '$regex': ?0, '$options': 'i' } } ] }")
    List<Parent> searchByNameOrEmail(String searchTerm);

    // Complex joins are difficult in Mongo Repository interface.
    // It's better to fetch parents and filter in service or store class info in
    // student/parent more denormalized
    // For now, I will comment out this join and handle it in service if needed, or
    // approximate it.
    // @Query("SELECT p FROM Parent p JOIN p.children c WHERE c.className =
    // :className")
    // List<Parent> findByChildrenClassName(@Param("className") String className);

    boolean existsByEmail(String email);

    @Query("{ 'user.id': ?0 }")
    Optional<Parent> findByUserId(String userId);
}