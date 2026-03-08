package com.littlesteps.playschool.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendVerificationEmail(String toEmail, String username, String token) {
        String subject = "Verify Your Little Steps Playschool Account";
        String verificationUrl = frontendUrl + "/verify-email?token=" + token;
        String message = "Hello " + username + ",\n\n" +
                "Welcome to Little Steps Playschool! Please verify your email address to activate your account.\n\n" +
                "Click the link below to verify your email:\n" +
                verificationUrl + "\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "Thank you,\nLittle Steps Playschool Administration";

        if (javaMailSender != null) {
            try {
                SimpleMailMessage email = new SimpleMailMessage();
                email.setTo(toEmail);
                email.setSubject(subject);
                email.setText(message);
                javaMailSender.send(email);
            } catch (Exception e) {
                System.err.println("WARNING: Failed to send email via SMTP. Token URL: " + verificationUrl);
                e.printStackTrace();
            }
        } else {
             System.err.println("WARNING: JavaMailSender not configured. Token URL: " + verificationUrl);
        }
    }
}
