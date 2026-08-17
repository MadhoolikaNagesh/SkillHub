package com.skillhub.auth.model;

/**
 * Must match exactly with the Role enum in the monolith — same values, same DB column.
 */
public enum Role {
    CANDIDATE,
    EMPLOYER,
    ADMIN
}
