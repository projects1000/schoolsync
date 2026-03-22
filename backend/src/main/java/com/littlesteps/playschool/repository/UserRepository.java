package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Optional<User> findByEmailAndActive(String email, Boolean active);

    List<User> findByRoleInAndActive(List<User.Role> roles, Boolean active);

    long countByRoleAndActive(User.Role role, boolean active);

    long countByRole(User.Role role);

    List<User> findByRole(User.Role role);
    Page<User> findByRole(User.Role role, Pageable pageable);

    List<User> findBySchoolIdAndRole(String schoolId, User.Role role);

    List<User> findBySchoolIdAndRoleAndStatusNot(String schoolId, User.Role role, User.Status status);

    boolean existsBySchoolIdAndRole(String schoolId, User.Role role);

    // Check if email exists within a specific school for a specific role
    boolean existsBySchoolIdAndEmailAndRole(String schoolId, String email, User.Role role);

    // Get teacher users by school with optional status filter
    List<User> findBySchoolIdAndRoleAndStatus(String schoolId, User.Role role, User.Status status);

    // Count teachers by school and role
    long countBySchoolIdAndRoleAndStatus(String schoolId, User.Role role, User.Status status);

    List<User> findTop5ByRoleAndStatusOrderByCreatedAtDesc(User.Role role, User.Status status);
}