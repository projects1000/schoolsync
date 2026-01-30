package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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

    List<User> findBySchoolIdAndRole(String schoolId, User.Role role);

    boolean existsBySchoolIdAndRole(String schoolId, User.Role role);
}