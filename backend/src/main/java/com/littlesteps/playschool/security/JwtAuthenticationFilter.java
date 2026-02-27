package com.littlesteps.playschool.security;

import com.littlesteps.playschool.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final com.littlesteps.playschool.repository.UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil,
            com.littlesteps.playschool.repository.UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);

            try {
                String username = jwtUtil.getEmailFromToken(jwt);
                String role = jwtUtil.getRoleFromToken(jwt);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    if (role == null) {
                        logger.warn("TOKEN_DEBUG: role is missing in token for user " + username);
                        role = "USER"; // Default or handle as error
                    }

                    List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                            new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));

                    logger.info("TOKEN_DEBUG: username=" + username + ", role=" + role + ", authority="
                            + authorities.get(0).getAuthority());

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username, null, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    logger.info("CONTEXT_DEBUG: Authentication set in SecurityContext for " + username);

                    // Validate User Status from DB
                    com.littlesteps.playschool.entity.User user = userRepository.findByEmail(username).orElse(null);
                    if (user == null) {
                        logger.warn("USER_DEBUG: User not found in database: " + username);
                    } else if (!user.getActive()) {
                        logger.warn("USER_DEBUG: User is inactive: " + username);
                    }

                    boolean isActive = false;
                    com.littlesteps.playschool.entity.User.Status status = null;

                    if (user != null) {
                        isActive = user.getActive() != null && user.getActive();
                        status = user.getStatus();
                    }

                    if (user == null || !isActive || status == com.littlesteps.playschool.entity.User.Status.BLOCKED
                            || status == com.littlesteps.playschool.entity.User.Status.INACTIVE) {
                        logger.warn("AUTH_REJECT: User " + username + " not found or inactive. Status: " + status
                                + ". Denying access.");
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Account is disabled");
                        return;
                    }

                    // Set SchoolContext
                    String schoolId = jwtUtil.getSchoolIdFromToken(jwt);
                    logger.info(
                            "JWT Filter - User: " + username + ", Role: " + role + ", SchoolId in Token: " + schoolId);

                    if (schoolId != null) {
                        SchoolContext.setSchoolId(schoolId);
                        logger.info("Set SchoolContext to: " + schoolId);
                    } else if ("SUPERADMIN".equalsIgnoreCase(role)) {
                        // Super Admin has global access, clear context contextually or handle as needed
                        SchoolContext.clear();
                        logger.info("Cleared SchoolContext for SUPERADMIN (no schoolId in token)");
                    } else {
                        logger.warn("No schoolId in token for non-superadmin user: " + username);
                    }
                }
            } catch (Exception e) {
                logger.error("JWT token validation failed: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}