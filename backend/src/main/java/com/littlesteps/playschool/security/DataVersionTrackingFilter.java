package com.littlesteps.playschool.security;

import com.littlesteps.playschool.service.DataVersionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class DataVersionTrackingFilter extends OncePerRequestFilter {

    private final DataVersionService dataVersionService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        filterChain.doFilter(request, response);

        String method = request.getMethod();
        String path = request.getRequestURI();
        int status = response.getStatus();

        boolean isWriteMethod = "POST".equalsIgnoreCase(method)
                || "PUT".equalsIgnoreCase(method)
                || "PATCH".equalsIgnoreCase(method)
                || "DELETE".equalsIgnoreCase(method);
        boolean isApiRequest = path.startsWith("/api/");
        boolean isAuthRequest = path.startsWith("/api/auth/");
        boolean isSuccessful = status >= 200 && status < 400;

        if (isWriteMethod && isApiRequest && !isAuthRequest && isSuccessful) {
            dataVersionService.bumpVersion();
        }
    }
}
