package com.littlesteps.playschool;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class PlayschoolManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(PlayschoolManagementApplication.class, args);
    }
}