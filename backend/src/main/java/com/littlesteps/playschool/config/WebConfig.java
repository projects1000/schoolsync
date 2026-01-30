package com.littlesteps.playschool.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded profile photos
        registry.addResourceHandler("/uploads/profile-photos/**")
                .addResourceLocations("file:uploads/profile-photos/")
                .setCachePeriod(86400); // Cache for 24 hours
    }
}