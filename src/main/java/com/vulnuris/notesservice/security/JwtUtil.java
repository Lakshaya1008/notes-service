package com.vulnuris.notesservice.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;
import java.util.Map;

public class JwtUtil {

    private static final String SECRET = "replace_this_with_a_long_secret_key_32_chars_min";
    private static final long EXPIRATION = 1000 * 60 * 60 * 24; // 24 hours

    private static final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    public static String generateToken(Long userId, Long tenantId, String role) {
        return Jwts.builder()
                .setClaims(Map.of(
                        "userId", userId,
                        "tenantId", tenantId,
                        "role", role
                ))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public static Claims validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

