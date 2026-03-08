package com.littlesteps.playschool.service;

import com.littlesteps.playschool.entity.Communication;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.CommunicationRepository;
import com.littlesteps.playschool.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class SuperAdminCommunicationService {

    @Autowired
    private CommunicationRepository communicationRepository;

    @Autowired
    private UserRepository userRepository;

    public Communication sendDirectMessage(String email, Map<String, String> payload) {
        User superAdmin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("SuperAdmin not found"));

        if (!superAdmin.getRole().equals(User.Role.SUPERADMIN)) {
            throw new RuntimeException("Unauthorized: Only SuperAdmins can use this endpoint");
        }

        String subject = payload.get("subject");
        String body = payload.get("body");
        String recipientId = payload.get("recipientId");

        // Verify recipient is an admin
        User admin = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Recipient must be an Admin");
        }

        Communication comm = new Communication(
                subject, body, Communication.MessageType.INDIVIDUAL,
                superAdmin.getId(), superAdmin.getName(), Communication.SenderRole.SUPERADMIN, null);

        comm.setRecipientType(Communication.RecipientType.ADMIN);
        comm.addRecipient(admin.getId(), admin.getName());
        comm.markAsReadBy(superAdmin.getId());

        return communicationRepository.save(comm);
    }

    public Communication sendBroadcast(String email, Map<String, String> payload) {
        User superAdmin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("SuperAdmin not found"));

        if (!superAdmin.getRole().equals(User.Role.SUPERADMIN)) {
            throw new RuntimeException("Unauthorized: Only SuperAdmins can use this endpoint");
        }

        String subject = payload.get("subject");
        String body = payload.get("body");

        Communication comm = new Communication(
                subject, body, Communication.MessageType.BROADCAST,
                superAdmin.getId(), superAdmin.getName(), Communication.SenderRole.SUPERADMIN, null);

        comm.setRecipientType(Communication.RecipientType.ALL_ADMINS);

        // Add all admins as recipients
        List<User> admins = userRepository.findByRole(User.Role.ADMIN);
        for (User admin : admins) {
            comm.addRecipient(admin.getId(), admin.getName());
        }

        comm.markAsReadBy(superAdmin.getId());
        return communicationRepository.save(comm);
    }

    public Page<Communication> getPaginatedHistory(String email, Pageable pageable) {
        User superAdmin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("SuperAdmin not found"));

        if (!superAdmin.getRole().equals(User.Role.SUPERADMIN)) {
            throw new RuntimeException("Unauthorized: Only SuperAdmins can view this");
        }

        return communicationRepository.findBySenderId(superAdmin.getId(), pageable);
    }

    public List<Communication> getHistory(String email) {
        User superAdmin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("SuperAdmin not found"));

        if (!superAdmin.getRole().equals(User.Role.SUPERADMIN)) {
            throw new RuntimeException("Unauthorized: Only SuperAdmins can view this");
        }

        return communicationRepository.findBySenderIdOrderByCreatedAtDesc(superAdmin.getId());
    }

    public List<User> getAllAdmins() {
        return userRepository.findByRole(User.Role.ADMIN);
    }
}
