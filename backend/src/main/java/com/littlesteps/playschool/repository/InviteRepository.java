package com.littlesteps.playschool.repository;

import com.littlesteps.playschool.entity.Invite;
import com.littlesteps.playschool.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InviteRepository extends MongoRepository<Invite, String> {

    Optional<Invite> findByInviteCode(String inviteCode);

    List<Invite> findByStatus(Invite.Status status);

    List<Invite> findByRole(Invite.Role role);

    List<Invite> findByCreatedBy(User createdBy);

    List<Invite> findByEmail(String email);

    Optional<Invite> findByEmailAndRoleAndStatus(String email, Invite.Role role, Invite.Status status);

    Long countByStatus(Invite.Status status);

    @Query("{ 'status': 'PENDING', 'expiresAt': { '$lt': ?0 } }")
    List<Invite> findExpiredInvites(LocalDateTime now);

    @Query("{ 'email': ?0, 'status': 'PENDING' }")
    List<Invite> findPendingInvitesByEmail(String email);

    boolean existsByInviteCode(String inviteCode);

    boolean existsByEmailAndStatus(String email, Invite.Status status);

    @Query(value = "{ 'createdBy': ?0, 'createdAt': { '$gte': ?1 } }", count = true)
    long countInvitesByUserSince(User user, LocalDateTime since);

    // Use sort feature of MongoRepository query derivation
    List<Invite> findByStatusOrderByCreatedAtDesc(Invite.Status status);

    org.springframework.data.domain.Page<Invite> findByRoleAndStatus(Invite.Role role, Invite.Status status,
            org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Invite> findByRole(Invite.Role role,
            org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Invite> findByStatus(Invite.Status status,
            org.springframework.data.domain.Pageable pageable);
}