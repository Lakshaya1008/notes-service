package com.vulnuris.notesservice.controller;

import com.vulnuris.notesservice.model.SubscriptionPlan;
import com.vulnuris.notesservice.model.Tenant;
import com.vulnuris.notesservice.repository.TenantRepository;
import com.vulnuris.notesservice.tenant.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for tenant management operations.
 *
 * Note: Only ADMIN users can manage tenant subscription plans.
 * Tenant ID is obtained from JWT token via TenantContext (never from request).
 */
@RestController
@RequestMapping("/api/tenants")
public class TenantController {

    private final TenantRepository tenantRepository;

    public TenantController(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    /**
     * Upgrade the current tenant's subscription plan to PRO.
     *
     * ADMIN only endpoint - uses tenant ID from JWT token.
     *
     * @return Success message or error
     */
    @PutMapping("/upgrade")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> upgradeTenant() {
        // Get tenant ID from JWT token (via TenantContext)
        Long tenantId = TenantContext.getTenantId();

        // Find tenant
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        // Check if already PRO
        if (tenant.getSubscriptionPlan() == SubscriptionPlan.PRO) {
            return ResponseEntity.ok("Tenant already on PRO plan");
        }

        // Upgrade to PRO
        tenant.setSubscriptionPlan(SubscriptionPlan.PRO);
        tenantRepository.save(tenant);

        return ResponseEntity.ok("Tenant successfully upgraded to PRO plan");
    }
}

