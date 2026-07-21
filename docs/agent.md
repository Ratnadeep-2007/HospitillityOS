# IMPORTANT: READ BEFORE WRITING ANY CODE

You are not building a hotel management system.

You are building an **AI-powered Hospitality Operations Platform** whose purpose is to coordinate daily hotel operations through an event-driven architecture.

## Product Philosophy

Do NOT think in terms of pages or CRUD.

Think in terms of operations.

Everything happening inside a hotel is an operational event.

Every operational event becomes a workflow.

Every workflow generates one or more tasks.

Departments execute tasks.

Managers monitor workflows.

AI understands, recommends, predicts and optimizes.

The platform is NOT the PMS.

The platform sits above existing systems and coordinates operations.

Existing PMS, POS, Booking Engines and Accounting systems remain the transactional source of truth.

Our platform becomes the operational source of truth.

---

# Core Mental Model

Everything follows this lifecycle.

Event

↓

Workflow

↓

Tasks

↓

Departments

↓

Notifications

↓

Completion

↓

Analytics

↓

Operational Intelligence

Nothing bypasses this pipeline.

---

# Golden Rules

Never create tasks directly.

Every task must belong to a workflow.

Every workflow must originate from an event.

Every event must be persisted.

Every important action must generate an audit log.

Everything must be explainable.

Everything must be measurable.

Everything must be modular.

Everything must support future AI.

---

# What the Platform Does

The platform coordinates daily operations across every department.

Examples:

Guest requests

Housekeeping

Maintenance

Inventory

Procurement

Restaurant

Kitchen

Security

Laundry

Reception

Management

SOP Checklists

Bookings

Vendor coordination

Every one of these ultimately becomes structured operational work.

---

# Communication Philosophy

The platform does NOT force users into one interface.

It supports multiple communication channels.

Examples:

- Web Dashboard
- Progressive Web App
- WhatsApp
- Email
- Push Notifications

Regardless of where communication originates, it always enters the same Event → Workflow → Task pipeline.

WhatsApp is only a communication interface.

The platform remains the operational source of truth.

---

# AI Philosophy

AI is NOT the product.

AI is an operational intelligence layer.

AI should:

- Understand
- Recommend
- Prioritize
- Predict
- Optimize

AI should NEVER silently execute critical business decisions.

Critical decisions require human approval.

Examples:

Pricing

Vendor Approval

Purchase Orders

Refunds

Financial Decisions

---

# Architecture Philosophy

Everything is generic.

Never hardcode departments.

Never create department-specific business logic.

Bad:

HousekeepingTask

KitchenTask

MaintenanceTask

Good:

Task

department_id

workflow_id

assigned_user_id

priority

status

Everything should be configurable.

---

# Database Philosophy

The database models business entities.

Not screens.

Not pages.

Core entities include:

Property

Department

User

Role

Guest

Room

Booking

Workflow

Task

Event

Notification

InventoryItem

Vendor

Asset

Comment

Attachment

AuditLog

AIRecommendation

These entities should remain stable as the platform grows.

---

# Workflow Philosophy

Every workflow has:

Trigger

↓

Workflow

↓

Tasks

↓

Execution

↓

Completion

↓

Audit

↓

Analytics

↓

Learning

Workflows are reusable.

Examples:

Guest Request Workflow

Booking Workflow

Maintenance Workflow

Inventory Workflow

SOP Workflow

Vendor Workflow

Never implement business logic outside workflows.

---

# Event Philosophy

Everything begins as an event.

Examples:

Guest Request

Booking Created

Booking Cancelled

Inventory Low

Maintenance Due

Manager Instruction

Vendor Delivery

Complaint Raised

SOP Triggered

Every event must be stored.

---

# Product Goal

The goal is NOT task management.

The goal is operational coordination.

Managers should no longer spend time asking:

"Who is doing what?"

Instead, the platform should always know:

What happened.

What needs to happen.

Who is responsible.

What is delayed.

What should happen next.

---

# Long-Term Vision

The platform gradually evolves.

Stage 1

Coordinate Operations.

↓

Stage 2

Connect Departments.

↓

Stage 3

Generate Operational Intelligence.

↓

Stage 4

Predict Operations.

↓

Stage 5

Optimize Operations.

↓

Stage 6

Become the operational intelligence layer for hospitality businesses.

---

# Development Principles

Always optimize for:

Maintainability

Scalability

Reusability

Loose coupling

Event-driven architecture

Workflow orchestration

Human-centered AI

Explainability

Auditability

Never optimize for quick hacks.

---

# Anti-Patterns (Never Do These)

❌ Never create tasks without workflows.

❌ Never bypass the Event Engine.

❌ Never duplicate business logic.

❌ Never hardcode departments.

❌ Never tightly couple modules.

❌ Never let AI modify business data automatically.

❌ Never build features that don't align with the Event → Workflow → Task architecture.

---

# Priority

When implementing new functionality always ask:

1. What event triggered this?
2. Which workflow should be created?
3. Which tasks should be generated?
4. Which departments own those tasks?
5. How should users be notified?
6. How should AI assist?
7. How will this improve operational visibility?

If a feature cannot answer these questions, redesign it before implementation.

The objective is not to build another hotel software.

The objective is to build the operational brain of hospitality.