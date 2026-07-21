# SYSTEM_ARCHITECTURE.md

> **Document Purpose**
>
> This document defines the core architecture of the AI Hospitality Operations Platform.
>
> It describes how information flows through the platform, how operational events are processed, how AI interacts with workflows, and how different systems integrate into one operational ecosystem.
>
> This document is technology-agnostic. It describes the logical architecture rather than implementation details.

---

# Architecture Philosophy

The platform follows an **Event-Driven Operational Architecture**.

Everything that happens inside a hospitality property is treated as an operational event.

Examples include:

- Guest Request
- Booking Created
- Check-In
- Check-Out
- Room Ready
- Maintenance Due
- Inventory Low
- Purchase Approved
- SOP Started
- Task Completed
- Complaint Raised

Every event enters the platform through the same processing pipeline.

---

# High-Level Architecture

```
                External Systems

 PMS      POS      WhatsApp      Website

 Booking Engine     Email     Mobile App

          │

          ▼

==============================

      Integration Layer

==============================

          │

          ▼

==============================

        Event Engine

==============================

          │

          ▼

==============================

      Workflow Engine

==============================

          │

 ┌────────┼─────────┐

 ▼        ▼         ▼

Task   Notification  Analytics

 │

 ▼

AI Decision Engine

 │

 ▼

Users & Departments

```

---

# Core Entities

The platform revolves around a small number of business entities.

These entities represent the operational state of the hotel.

---

## Property

Represents a hotel, resort, villa, or hospitality business.

One company may own multiple properties.

---

## Department

Examples:

- Front Desk
- Housekeeping
- Kitchen
- Restaurant
- Spa
- Maintenance
- Procurement
- Security
- Laundry

Departments own operational work.

---

## User

Represents hotel staff.

Examples:

- Receptionist
- Housekeeper
- Manager
- Technician
- Chef

Each user belongs to one or more departments.

---

## Guest

Represents a customer staying at the property.

Stores:

- Profile
- Stay History
- Preferences
- Requests

---

## Booking

Represents a reservation.

Generates operational events.

---

## Task

The most important entity.

Every operational activity becomes a task.

Examples

- Clean Room
- Deliver Towels
- Repair AC
- Buy Milk

Everything eventually becomes a task.

---

## Workflow

Represents a collection of related tasks.

Example

Birthday Celebration

↓

Cake

↓

Decoration

↓

Photography

↓

Restaurant Setup

↓

Guest Notification

---

## SOP

Represents recurring operational procedures.

Examples

Morning Opening

Fire Safety Inspection

Pool Cleaning

---

## Asset

Physical hotel assets.

Examples

- Generator
- AC
- Elevator
- Pool
- Fire System

---

## Inventory Item

Represents consumable stock.

Examples

- Milk
- Towels
- Soap
- Vegetables

---

## Vendor

External suppliers.

Examples

- Laundry Vendor
- Fish Supplier
- Taxi Provider

---

## Notification

Represents every communication sent by the platform.

Examples

- Push
- Email
- SMS
- WhatsApp
- In-App

---

# Data Flow

Every operation follows the same lifecycle.

```
Trigger

↓

Operational Event

↓

Workflow Engine

↓

Task Generation

↓

Assignment

↓

Execution

↓

Completion

↓

Analytics

↓

AI Learning
```

This lifecycle remains consistent regardless of department.

---

# Event Engine

The Event Engine is the heart of the platform.

Every meaningful occurrence becomes an event.

Examples

Guest Request

Booking Created

Guest Checked In

Inventory Low

Task Completed

Vendor Delivered

Maintenance Due

Complaint Raised

Manager Created Task

SOP Started

Emergency Alert

Every event contains:

- Event Type
- Source
- Timestamp
- Property
- Department
- Priority
- Metadata

The Event Engine never performs business logic.

It simply records and distributes operational events.

---

# Workflow Engine

The Workflow Engine converts events into operational work.

Its responsibilities include:

- Creating tasks
- Assigning departments
- Setting priorities
- Managing dependencies
- Tracking SLAs
- Escalating delays

Every workflow passes through this engine.

---

# AI Layer

The AI Layer enhances operational decision-making.

It does not replace business logic.

Instead, it provides intelligence.

Current capabilities

- Natural Language Understanding
- Task Extraction
- Intent Detection
- Priority Suggestions
- Operational Summaries

Future capabilities

- Predictive Maintenance
- Dynamic Pricing
- Resource Optimization
- Occupancy Prediction
- Staff Scheduling
- Revenue Recommendations

The AI layer always works alongside human operators.

---

# Integration Layer

The platform is designed to integrate with existing hotel systems.

Examples include:

## PMS

- Reservations
- Room Status
- Guest Information

---

## POS

- Restaurant Orders
- Billing Events

---

## Booking Engines

- New Reservations
- Cancellations

---

## Channel Managers

- OTA Updates
- Availability

---

## WhatsApp

- Guest Requests
- Notifications

---

## Email

- Confirmations
- Reports
- Alerts

---

## Payment Systems

- Payment Status
- Invoice Events

---

## IoT Devices (Future)

- Smart Locks
- Energy Systems
- Temperature Sensors

---

The Integration Layer converts external data into standardized operational events.

---

# Notification Layer

Responsible for informing users.

Supported channels

- Push Notifications
- In-App Notifications
- Email
- WhatsApp
- SMS

Notification triggers include:

- Task Assignment
- Task Escalation
- SLA Breach
- Guest Updates
- Inventory Alerts
- Maintenance Alerts

Every notification is generated from an operational event.

---

# Security Architecture

Security follows Role-Based Access Control (RBAC).

Users receive permissions based on:

- Property
- Department
- Role

Examples

Reception

Can manage guest requests.

Cannot approve procurement.

---

Manager

Can view all departments.

Can reassign work.

Can approve escalations.

---

Owner

Read-only operational visibility.

No operational execution.

---

Security Principles

- Least Privilege Access
- Audit Logging
- Encrypted Communication
- Secure Authentication
- Role-Based Authorization
- Complete Activity History

Every operational action is traceable.

---

# Multi-Property Support

The platform is designed to support:

Single Hotel

↓

Multiple Hotels

↓

Hotel Chains

↓

Resort Groups

↓

Villa Collections

Each property has:

- Independent users
- Independent departments
- Independent workflows
- Independent inventory
- Independent assets

Organizations can monitor all properties from one centralized dashboard.

Cross-property reporting is supported while maintaining complete data isolation.

---

# Architectural Principles

The platform follows these principles.

## Event-Driven

Everything begins with an event.

---

## Workflow-Oriented

Every event creates structured work.

---

## Modular

Business capabilities remain independent.

---

## AI-Assisted

AI enhances decisions but does not replace human authority.

---

## Integration-First

Integrate existing systems before replacing them.

---

## Observable

Every event, task, and workflow is traceable.

---

## Scalable

Support one property or thousands without changing the architecture.

---

# Architecture Summary

The AI Hospitality Operations Platform is built around three core engines:

### Event Engine

Captures everything happening inside and outside the property.

↓

### Workflow Engine

Transforms operational events into structured work.

↓

### AI Decision Layer

Continuously analyzes operations, recommends actions, identifies risks, and improves operational efficiency.

Together, these layers create a unified operational platform that coordinates every department, every workflow, and every operational event across the hospitality business.

The architecture is intentionally modular, event-driven, integration-first, and AI-assisted, enabling the platform to evolve from workflow automation into a true operational intelligence system.