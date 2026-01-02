package com.vulnuris.notesservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Registration request DTO.
 *
 * Supports invitation-based tenant assignment:
 * - No inviteCode: User assigned to Tenant 2 (FREE plan, MEMBER role)
 * - "TENANT1_PRO_INVITE": User assigned to Tenant 1 (PRO plan, ADMIN role)
 *
 * All Tenant 1 users are PRO and ADMIN.
 * In production, this would use cryptographically signed invitation tokens.
 */
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    // Optional invite code for controlled tenant assignment
    private String inviteCode;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getInviteCode() {
        return inviteCode;
    }

    public void setInviteCode(String inviteCode) {
        this.inviteCode = inviteCode;
    }
}

