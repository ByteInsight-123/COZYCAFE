# ☕ CozyCafe

### A complete full-stack café ordering & management system

CozyCafe is a modern café web application that allows customers to explore the menu, search and filter products, manage their cart, place orders, make reservations and save their favorite items.

The project also includes an administrative dashboard for managing customers, orders and reservations.

---

## 🌐 Live Demo

### 🚀 [Visit CozyCafe](https://cozycafe-production.up.railway.app)

> 🚧 The live deployment is currently being finalized. The application runs locally with the complete backend and MySQL integration.

---

## ✨ Features

| Feature | Description |
|---|---|
| 👤 Authentication | Customer signup and login |
| ☕ Menu | Browse café products |
| 🔎 Search | Search menu items |
| 🏷️ Categories | Filter coffee, tea, food and desserts |
| 🛒 Cart | Add, remove and update items |
| 💳 Checkout | Complete the order process |
| 📦 Orders | Generate unique order numbers |
| ❤️ Favorites | Save favorite menu items |
| 📅 Reservations | Reserve tables at the café |
| 📊 Admin Dashboard | Manage café information |
| 🗄️ MySQL | Persistent database storage |
| 🚀 Deployment | Railway deployment |

---

# 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js

### Database

- MySQL
- MySQL Workbench

### Tools

- Visual Studio Code
- Git
- GitHub

---

# 🏗️ Architecture

```text
                    ┌───────────────────┐
                    │      Customer     │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │     Frontend      │
                    │   HTML / CSS / JS  │
                    └─────────┬─────────┘
                              │
                         HTTP Requests
                              │
                              ▼
                    ┌───────────────────┐
                    │   Node.js +       │
                    │     Express       │
                    └─────────┬─────────┘
                              │
                          SQL Queries
                              │
                              ▼
                    ┌───────────────────┐
                    │       MySQL       │
                    │      Database     │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Admin Dashboard  │
                    └───────────────────┘
