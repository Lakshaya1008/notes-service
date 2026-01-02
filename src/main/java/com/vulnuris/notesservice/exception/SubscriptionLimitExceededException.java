package com.vulnuris.notesservice.exception;

/**
 * Exception thrown when a tenant exceeds their subscription plan limits.
 * For example, FREE plan users trying to create more than the allowed number of notes.
 */
public class SubscriptionLimitExceededException extends RuntimeException {
    public SubscriptionLimitExceededException(String message) {
        super(message);
    }
}

