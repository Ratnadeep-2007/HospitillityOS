# CONTRIBUTING.md

> **Development Constitution**
>
> This document defines the engineering principles, architectural rules, coding standards, documentation requirements, and contribution guidelines for the AI Hospitality Operations Platform.
>
> Every human developer and AI coding agent must follow these rules when contributing to the platform.
>
> These principles are mandatory and exist to ensure long-term maintainability, consistency, scalability, and product integrity.

---

# Purpose

The platform is expected to evolve over many years.

To prevent architectural drift, duplicated logic, inconsistent implementations, and technical debt, every contribution must follow the principles described here.

When in doubt:

**Follow these rules instead of introducing shortcuts.**

---

# Guiding Principles

## 1. Product First

Every implementation must solve a real operational problem.

Do not build features simply because they are technically interesting.

Every feature should improve:

- Operational efficiency
- Guest experience
- Staff productivity
- Visibility
- Automation

---

## 2. Event-Driven Architecture

Everything begins with an operational event.

Never create isolated business logic.

Examples

Guest Request

↓

Event

↓

Workflow

↓

Task

↓

Completion

All modules must integrate through the Event Engine.

---

## 3. Workflow Before UI

Never design screens first.

Always define:

Trigger

↓

Workflow

↓

Business Rules

↓

API

↓

Database

↓

UI

The workflow is the source of truth.

---

## 4. AI Assists Humans

AI is an assistant.

AI is never the final authority.

Critical business actions must always require human approval.

Examples include:

- Pricing
- Refunds
- Vendor Approval
- Purchase Orders
- Financial Decisions

---

## 5. Integration Before Replacement

Never replace customer software without necessity.

The platform integrates with:

- PMS
- POS
- Channel Managers
- Booking Engines
- Accounting Systems
- Messaging Platforms

Assume these systems remain the source of truth.

---

## 6. Every Feature Must Be Measurable

Every new capability should include measurable outcomes.

Examples

- Completion Rate
- SLA
- Usage
- Response Time
- Adoption

If success cannot be measured, the feature is incomplete.

---

# Architecture Rules

## Never Bypass the Workflow Engine

No module should directly assign work.

Everything becomes a workflow.

---

## Never Bypass the Event Engine

Every meaningful action must generate an event.

No hidden state changes.

---

## Never Duplicate Business Logic

Business rules belong in one location only.

Avoid copying validation or workflow logic across modules.

---

## Modules Must Remain Independent

Modules communicate only through shared platform services.

Never tightly couple two modules together.

---

## Single Responsibility

Each service should solve one problem.

Avoid "god services" that handle multiple unrelated concerns.

---

# AI Development Rules

AI coding agents must:

- Read README.md before coding.
- Read MASTER_PRODUCT_BLUEPRINT.md before implementation.
- Follow V1_PRODUCT_SPEC.md when building MVP features.
- Respect SYSTEM_ARCHITECTURE.md.
- Follow WORKFLOWS.md for business logic.
- Use MODULES.md to understand ownership.

AI must never invent business rules that are not documented.

If documentation is unclear, stop and request clarification rather than making assumptions.

---

# Coding Principles

## Readability First

Code should optimize for maintainability.

Readable code is preferred over clever code.

---

## Consistency

Follow existing naming conventions.

Avoid introducing new patterns unless necessary.

---

## Simplicity

Prefer simple solutions over complex abstractions.

Avoid unnecessary frameworks or layers.

---

## Reusability

Extract shared logic into reusable components and services.

Do not duplicate implementations.

---

## Scalability

Design features with future platform expansion in mind.

Avoid hardcoding assumptions that limit growth.

---

# Documentation Rules

Every significant feature must update relevant documentation.

Examples

New Workflow

→ Update WORKFLOWS.md

New Module

→ Update MODULES.md

Architecture Change

→ Update SYSTEM_ARCHITECTURE.md

AI Capability

→ Update AI_ARCHITECTURE.md

Version Scope

→ Update V1_PRODUCT_SPEC.md or ROADMAP.md

Documentation is part of the implementation.

---

# API Rules

APIs should:

- Be RESTful
- Use predictable naming
- Return consistent response formats
- Validate input
- Handle errors gracefully
- Support pagination where required
- Be versioned when introducing breaking changes

Never expose internal implementation details.

---

# Database Rules

Normalize where appropriate.

Avoid premature optimization.

Maintain referential integrity.

Soft-delete operational records when business history is required.

Never delete audit history.

---

# Security Rules

Every request must be authenticated.

Every action must be authorized.

Use Role-Based Access Control (RBAC).

Audit all critical actions.

Encrypt sensitive information in transit and at rest.

Never trust client-side validation.

---

# Testing Standards

Every new feature should include:

- Unit Tests
- Integration Tests (where applicable)
- Workflow Validation
- Edge Case Handling

Critical workflows should be tested end-to-end.

---

# UI Principles

The platform is operational software.

Prioritize:

- Speed
- Clarity
- Accessibility
- Minimal clicks
- Mobile usability

Avoid unnecessary visual complexity.

---

# Performance Principles

Optimize for:

- Fast page loads
- Responsive interactions
- Efficient database queries
- Low API latency
- Background processing where appropriate

Performance should improve user productivity.

---

# AI Principles

AI recommendations must be:

- Explainable
- Context-aware
- Traceable
- Auditable

Never allow AI to silently modify operational data.

Every recommendation should include reasoning when appropriate.

---

# Pull Request Checklist

Before submitting changes:

- Feature aligns with product vision.
- Business rules follow documented workflows.
- Documentation updated.
- Tests added or updated.
- No duplicated logic introduced.
- Security reviewed.
- Performance considered.

---

# Decision Hierarchy

When making implementation decisions, follow this priority:

1. CONTRIBUTING.md
2. MASTER_PRODUCT_BLUEPRINT.md
3. V1_PRODUCT_SPEC.md
4. SYSTEM_ARCHITECTURE.md
5. WORKFLOWS.md
6. MODULES.md
7. AI_ARCHITECTURE.md

If two documents conflict, update the documentation before updating the code.

---

# Long-Term Philosophy

The goal is not simply to build software.

The goal is to build an operational platform that remains:

- Scalable
- Maintainable
- Explainable
- Modular
- AI-assisted
- Reliable

Every contribution should move the platform closer to becoming the operational brain of hospitality businesses.

---

# Final Rule

When faced with multiple implementation choices, always choose the solution that:

- Simplifies operations.
- Reduces complexity.
- Preserves architectural consistency.
- Improves long-term maintainability.
- Delivers measurable value to hospitality businesses.

If a contribution does not improve the product in one of these ways, it should be reconsidered.