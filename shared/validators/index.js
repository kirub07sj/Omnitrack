"use strict";
// Shared validation schemas (using basic TypeScript validation)
// Can be extended with Zod or other validation libraries if needed
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBusiness = validateBusiness;
exports.validateEmployee = validateEmployee;
exports.validateProduct = validateProduct;
exports.validateLoginCredentials = validateLoginCredentials;
exports.validateRegistration = validateRegistration;
/**
 * Validate business creation data
 */
function validateBusiness(data) {
    const errors = [];
    if (!data.name || data.name.trim().length === 0) {
        errors.push('Business name is required');
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Invalid email format');
    }
    if (data.tax_rate && (data.tax_rate < 0 || data.tax_rate > 100)) {
        errors.push('Tax rate must be between 0 and 100');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * Validate employee data
 */
function validateEmployee(data) {
    const errors = [];
    if (!data.first_name || data.first_name.trim().length === 0) {
        errors.push('First name is required');
    }
    if (!data.last_name || data.last_name.trim().length === 0) {
        errors.push('Last name is required');
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Invalid email format');
    }
    if (data.salary && data.salary < 0) {
        errors.push('Salary cannot be negative');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * Validate product data
 */
function validateProduct(data) {
    const errors = [];
    if (!data.name || data.name.trim().length === 0) {
        errors.push('Product name is required');
    }
    if (!data.price || data.price <= 0) {
        errors.push('Price must be greater than 0');
    }
    if (data.cost && data.cost < 0) {
        errors.push('Cost cannot be negative');
    }
    if (data.min_stock && data.min_stock < 0) {
        errors.push('Minimum stock cannot be negative');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * Validate login credentials
 */
function validateLoginCredentials(data) {
    const errors = [];
    if (!data.username || data.username.trim().length === 0) {
        errors.push('Username is required');
    }
    if (!data.password || data.password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * Validate registration data (cloud)
 */
function validateRegistration(data) {
    const errors = [];
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Valid email is required');
    }
    if (!data.password || data.password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (data.firstName && data.firstName.trim().length === 0) {
        errors.push('First name cannot be empty if provided');
    }
    if (data.lastName && data.lastName.trim().length === 0) {
        errors.push('Last name cannot be empty if provided');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
