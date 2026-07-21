# DOMAIN_MODEL.md

> **Document Purpose**
>
> This document defines the core business entities of the AI Hospitality Operations Platform.
>
> It serves as the canonical domain model for the product and should remain independent of any specific database technology.
>
> Every database schema, API, backend service, and AI workflow must align with this domain model.

---

# Philosophy

The platform is built around **business entities**, not UI screens or departments.

Every entity represents a real-world object inside a hospitality business.

Examples include:

- Guest
- Booking
- Task
- Workflow
- Room
- Property
- Vendor
- Asset

The database is an implementation of this domain model—not the other way around.

---

# Core Domain Model

```
Property
│
├── Departments
│
├── Users
│
├── Rooms
│
├── Guests
│
├── Bookings
│
├── Assets
│
├── Inventory
│
├── Vendors
│
└── SOPs

Everything above can generate

↓

Events

↓

Workflows

↓

Tasks

↓

Notifications

↓

Audit Logs

↓

AI Recommendations
```

---

# Core Entities

---

# Property

## Purpose

Represents a hospitality business.

Examples:

- Hotel
- Resort
- Villa
- Homestay
- Hotel Chain Property

---

## Relationships

- Has many Departments
- Has many Rooms
- Has many Users
- Has many Guests
- Has many Bookings
- Has many Tasks
- Has many Assets

---

## Core Fields

- Property ID
- Name
- Type
- Address
- Timezone
- Status

---

# Department

## Purpose

Represents operational teams.

Examples:

- Reception
- Housekeeping
- Kitchen
- Maintenance
- Security

---

## Relationships

- Belongs to Property
- Has many Users
- Owns many Tasks

---

## Core Fields

- Department ID
- Property ID
- Name
- Description
- Active

---

# User

## Purpose

Represents hotel employees.

---

## Relationships

- Belongs to Property
- Belongs to Department
- Has one Role
- Assigned many Tasks

---

## Core Fields

- User ID
- Name
- Email
- Phone
- Department
- Role
- Status

---

# Role

## Purpose

Defines permissions.

Examples

- Receptionist
- Housekeeper
- Manager
- Owner
- Chef

---

## Relationships

- Assigned to many Users

---

## Core Fields

- Role ID
- Name
- Permissions

---

# Guest

## Purpose

Represents customers.

---

## Relationships

- Has many Bookings
- Has many Requests
- Has many Notifications

---

## Core Fields

- Guest ID
- Name
- Phone
- Email
- Preferences
- Loyalty Status

---

# Room

## Purpose

Represents rooms or accommodation units.

---

## Relationships

- Belongs to Property
- Has many Bookings
- Has many Tasks
- Has many Maintenance Records

---

## Core Fields

- Room ID
- Room Number
- Room Type
- Status

---

# Booking

## Purpose

Represents guest reservations.

---

## Relationships

- Belongs to Guest
- Belongs to Room
- Generates Events
- Generates Workflows

---

## Core Fields

- Booking ID
- Guest ID
- Room ID
- Check-In
- Check-Out
- Booking Status

---

# Workflow

## Purpose

Represents a complete operational process.

Examples

- Guest Request
- VIP Arrival
- Wedding Setup
- Maintenance
- Inventory Refill

---

## Relationships

- Has many Tasks
- Created by Event

---

## Core Fields

- Workflow ID
- Type
- Status
- Started At
- Completed At

---

# Task

## Purpose

Represents one unit of operational work.

This is the most important entity.

Everything eventually becomes a task.

---

## Relationships

- Belongs to Workflow
- Assigned to User
- Assigned to Department
- Has many Comments
- Has many Attachments

---

## Core Fields

- Task ID
- Workflow ID
- Department ID
- Assigned User
- Title
- Description
- Priority
- Status
- Due Date

---

# Event

## Purpose

Represents something that happened.

Everything starts as an Event.

Examples

- Booking Created
- Guest Request
- Task Completed
- Inventory Low
- Maintenance Due

---

## Relationships

- Generates Workflow

---

## Core Fields

- Event ID
- Event Type
- Source
- Timestamp
- Metadata

---

# Notification

## Purpose

Represents communication sent by the platform.

---

## Relationships

- Linked to Task
- Linked to Workflow
- Linked to User

---

## Core Fields

- Notification ID
- Channel
- Recipient
- Status
- Message

---

# SOP

## Purpose

Represents recurring operational procedures.

Examples

- Morning Opening
- Fire Inspection
- Pool Cleaning

---

## Relationships

- Generates Workflows
- Generates Tasks

---

## Core Fields

- SOP ID
- Name
- Schedule
- Active

---

# Asset

## Purpose

Represents physical hotel assets.

Examples

- Generator
- Elevator
- AC
- Swimming Pool

---

## Relationships

- Generates Maintenance Tasks

---

## Core Fields

- Asset ID
- Name
- Category
- Status

---

# Inventory Item

## Purpose

Represents consumable inventory.

Examples

- Milk
- Soap
- Towels

---

## Relationships

- Belongs to Department
- Generates Inventory Events

---

## Core Fields

- Item ID
- Name
- Unit
- Quantity
- Minimum Level

---

# Vendor

## Purpose

Represents suppliers.

Examples

- Laundry Vendor
- Vegetable Supplier
- Taxi Partner

---

## Relationships

- Supplies Inventory
- Linked to Purchase Orders

---

## Core Fields

- Vendor ID
- Name
- Category
- Contact Information

---

# Comment

## Purpose

Represents discussion on any entity.

Supports:

- Tasks
- Bookings
- Guests
- Maintenance
- Inventory

---

## Core Fields

- Comment ID
- Entity Type
- Entity ID
- User ID
- Message
- Created At

---

# Attachment

## Purpose

Stores files linked to business entities.

Examples

- Photos
- Invoices
- PDFs
- Videos

---

## Core Fields

- Attachment ID
- Entity Type
- Entity ID
- File URL
- Uploaded By

---

# Audit Log

## Purpose

Stores every important system action.

Examples

- Task Created
- Task Completed
- Booking Modified
- Inventory Updated

---

## Core Fields

- Log ID
- User
- Action
- Entity
- Timestamp

---

# AI Recommendation

## Purpose

Stores AI-generated operational recommendations.

Examples

- Increase housekeeping priority.
- Order more inventory.
- Schedule maintenance.

---

## Relationships

- Linked to Event
- Linked to Workflow
- Linked to Manager

---

## Core Fields

- Recommendation ID
- Type
- Confidence
- Reason
- Status
- Created At

---

# Entity Relationships

```
Property
│
├── Departments
│      │
│      └── Users
│
├── Rooms
│      │
│      └── Bookings
│             │
│             └── Guests
│
├── Assets
│
├── Inventory Items
│
├── Vendors
│
└── SOPs

Everything generates

↓

Events

↓

Workflows

↓

Tasks

↓

Notifications

↓

Audit Logs

↓

AI Recommendations
```

---

# Domain Rules

The following rules apply across the entire platform.

## Every Task belongs to one Workflow.

## Every Workflow begins with one Event.

## Every Task belongs to one Department.

## Every User belongs to at least one Department.

## Every Property owns its own data.

## Every Notification is linked to a business event.

## Every important action generates an Audit Log.

## AI never modifies business data directly.

## Critical business actions require human approval.

---

# Design Principles

The domain model follows these principles:

- Business-first, not UI-first.
- Modular and extensible.
- Technology-independent.
- Event-driven.
- Workflow-oriented.
- Multi-property ready.
- AI-assisted.
- Auditable.
- Secure by design.

---

# Summary

The AI Hospitality Operations Platform is built around a small set of stable business entities.

These entities form the foundation for:

- Database schemas
- APIs
- Backend services
- AI agents
- Workflows
- Integrations
- User interfaces

As the platform grows, new features should extend this domain model rather than introducing new, isolated structures.