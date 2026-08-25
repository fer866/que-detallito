# Qué Detallito 🎁💐

[![.NET](https://img.shields.io/badge/.NET-5.0-purple.svg)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-11.0-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.0-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

An e-commerce platform specialized in gifts, floral arrangements, and personalized presents with local delivery services in Mexico City (CDMX) and the State of Mexico.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Architecture & Projects](#-architecture--projects)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Configuration](#2-configuration)
  - [3. Database Setup](#3-database-setup)
  - [4. Running the Application](#4-running-the-application)
- [Security Guidelines](#-security-guidelines)
- [License](#-license)

---

## 🌟 Overview

**Qué Detallito** provides an end-to-end shopping experience for personalized gifts and flower deliveries. It includes:
- A high-performance, SEO-friendly customer storefront with Server-Side Rendering (SSR).
- An administration dashboard for order dispatching, sales statistics, inventory, and delivery tracking.
- Multi-gateway payment integration supporting Credit/Debit Cards, PayPal, and OXXO cash vouchers.

---

## 🏛 Architecture & Projects

The solution consists of three primary ASP.NET Core projects:

1. **`QueDetallitoSSR`**: Customer-facing web application powered by **Angular Universal (SSR)** integrated with ASP.NET Core 5.0 for improved search engine optimization and initial load speeds.
2. **`QueDetallitoAdmin`**: Dedicated administrative portal for store managers to handle orders, products, deliveries, customers, and analytics.
3. **`QueDetallito`**: Single Page Application (SPA) variant of the customer storefront.

---

## 💻 Tech Stack

### Backend
- **Framework**: ASP.NET Core 5.0 (Web API & MVC)
- **Language**: C# 9
- **Data Access**: Dapper ORM & `System.Data.SqlClient`
- **Database**: Microsoft SQL Server
- **Authentication**: JWT (JSON Web Tokens) & BCrypt password hashing
- **Security & Reliability**: `AspNetCoreRateLimit`
- **Mailing**: MailKit & MimeKit (SMTP)
- **Payment Gateways**: Stripe.net SDK & PayPal Checkout .NET SDK

### Frontend
- **Framework**: Angular 11 (with Angular Universal for SSR)
- **UI Components**: Angular Material, FontAwesome, SCSS
- **State & Reactive Programming**: RxJS
- **PWA**: `@angular/pwa` & Service Worker support

---

## ✨ Key Features

- **Product Catalog**: Browsing categorized items (flowers, plushies, balloons, gift boxes).
- **Personalization**: Custom greeting card text with selectable fonts and recipient details.
- **Delivery Scheduling**: Specific delivery date and time window selection for local deliveries.
- **Multiple Payment Methods**:
  - Credit / Debit Cards (Stripe Elements)
  - PayPal Smart Payment Buttons
  - OXXO cash payments (Stripe Voucher)
- **Automated Notifications**: Transactional emails for account confirmation, order receipts, and password resets.
- **Backoffice Administration**:
  - Live order tracking and delivery status updates.
  - Interactive dashboard with sales metrics and charts.
  - Product and inventory management.
  - User role and permission management.

---

## 📁 Project Structure

```text
que-detallito/
├── media/                          # Static media and uploaded product images
├── QueDetallito/                   # SPA storefront project
│   ├── ClientApp/                  # Angular 11 client application
│   ├── Controllers/                # ASP.NET Core API controllers
│   ├── Services/                   # Business logic and external services
│   └── Startup.cs                  # Web application entry configuration
├── QueDetallitoAdmin/              # Admin dashboard project
│   ├── ClientApp/                  # Angular 11 admin portal
│   ├── Controllers/                # Admin endpoints (Sales, Orders, Users)
│   └── Services/                   # Reporting and management services
├── QueDetallitoSSR/                # SSR storefront project (Recommended for production)
│   ├── ClientApp/                  # Angular Universal application
│   ├── Controllers/                # API controllers
│   ├── Middleware/                 # Error handling & Rate limiting
│   └── appsettings.json            # Application configuration
└── QueDetallito.sln                # Visual Studio solution file
