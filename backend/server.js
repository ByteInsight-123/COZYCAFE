const express = require("express");
const path = require("path");

const { pool, testDatabase } = require("./db");

const app = express();

const PORT = 5000;


// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ========================================
// FRONTEND
// ========================================

const frontendPath = path.join(
    __dirname,
    ".."
);

console.log(
    "Frontend folder:",
    frontendPath
);

app.use(
    express.static(frontendPath)
);


// ========================================
// FRONTEND PAGES
// ========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            frontendPath,
            "index.html"
        )
    );

});


app.get("/signup.html", (req, res) => {

    res.sendFile(
        path.join(
            frontendPath,
            "signup.html"
        )
    );

});


app.get("/login.html", (req, res) => {

    res.sendFile(
        path.join(
            frontendPath,
            "login.html"
        )
    );

});


app.get("/admin.html", (req, res) => {

    res.sendFile(
        path.join(
            frontendPath,
            "admin.html"
        )
    );

});


app.get("/favorites.html", (req, res) => {

    res.sendFile(
        path.join(
            frontendPath,
            "favorites.html"
        )
    );

});


// ========================================
// HEALTH CHECK
// ========================================

app.get(
    "/api/health",
    async (req, res) => {

        try {

            await pool.query(
                "SELECT 1"
            );

            res.json({

                success: true,

                database: true,

                message:
                    "Cozy Café backend is working!"

            });

        }

        catch (error) {

            console.log(
                "HEALTH ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                database: false,

                message:
                    "Database connection failed"

            });

        }

    }
);


// ========================================
// GET MENU
// ========================================

app.get(
    "/api/menu",
    async (req, res) => {

        try {

            const [rows] =
                await pool.query(
                    `
                    SELECT *
                    FROM menu
                    ORDER BY id
                    `
                );

            res.json(rows);

        }

        catch (error) {

            console.log(
                "MENU ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to load menu"

            });

        }

    }
);


// ========================================
// SIGN UP
// ========================================

app.post(
    "/api/signup",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;


            if (
                !name ||
                !email ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name, email and password are required"

                });

            }


            if (
                password.length < 4
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Password must contain at least 4 characters"

                });

            }


            const [existingUsers] =
                await pool.query(
                    `
                    SELECT id
                    FROM users
                    WHERE email = ?
                    `,
                    [email]
                );


            if (
                existingUsers.length > 0
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "An account with this email already exists"

                });

            }


            const [result] =
                await pool.query(
                    `
                    INSERT INTO users
                    (
                        name,
                        email,
                        password
                    )
                    VALUES (?, ?, ?)
                    `,
                    [
                        name,
                        email,
                        password
                    ]
                );


            res.status(201).json({

                success: true,

                message:
                    "Account created successfully!",

                user: {

                    id:
                        result.insertId,

                    name,

                    email

                }

            });

        }

        catch (error) {

            console.log(
                "SIGNUP ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Something went wrong while creating the account"

            });

        }

    }
);


// ========================================
// SIGN IN
// ========================================

app.post(
    "/api/signin",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (
                !email ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email and password are required"

                });

            }


            const [users] =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        email,
                        password
                    FROM users
                    WHERE email = ?
                    `,
                    [email]
                );


            if (
                users.length === 0
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"

                });

            }


            const user =
                users[0];


            if (
                user.password !== password
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"

                });

            }


            res.json({

                success: true,

                message:
                    "Sign in successful!",

                user: {

                    id:
                        user.id,

                    name:
                        user.name,

                    email:
                        user.email

                }

            });

        }

        catch (error) {

            console.log(
                "SIGNIN ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Something went wrong while signing in"

            });

        }

    }
);


// ========================================
// FAVORITES - ADD / REMOVE
// ========================================

app.post(
    "/api/favorites",
    async (req, res) => {

        try {

            const {
                productId,
                userId,
                email
            } = req.body;


            if (!productId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product ID is required"

                });

            }


            let currentUserId =
                userId || null;


            // Find user by email

            if (
                !currentUserId &&
                email
            ) {

                const [users] =
                    await pool.query(
                        `
                        SELECT id
                        FROM users
                        WHERE email = ?
                        `,
                        [email]
                    );


                if (
                    users.length > 0
                ) {

                    currentUserId =
                        users[0].id;

                }

            }


            // Fallback to first user

            if (!currentUserId) {

                const [users] =
                    await pool.query(
                        `
                        SELECT id
                        FROM users
                        ORDER BY id
                        LIMIT 1
                        `
                    );


                if (
                    users.length > 0
                ) {

                    currentUserId =
                        users[0].id;

                }

            }


            if (!currentUserId) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Please sign in before adding favorites"

                });

            }


            // Check existing favorite

            const [existing] =
                await pool.query(
                    `
                    SELECT id
                    FROM favorites
                    WHERE user_id = ?
                    AND menu_id = ?
                    `,
                    [
                        currentUserId,
                        productId
                    ]
                );


            // Remove

            if (
                existing.length > 0
            ) {

                await pool.query(
                    `
                    DELETE FROM favorites
                    WHERE user_id = ?
                    AND menu_id = ?
                    `,
                    [
                        currentUserId,
                        productId
                    ]
                );

            }

            // Add

            else {

                await pool.query(
                    `
                    INSERT INTO favorites
                    (
                        user_id,
                        menu_id
                    )
                    VALUES (?, ?)
                    `,
                    [
                        currentUserId,
                        productId
                    ]
                );

            }


            const [favorites] =
                await pool.query(
                    `
                    SELECT menu_id
                    FROM favorites
                    WHERE user_id = ?
                    ORDER BY id
                    `,
                    [currentUserId]
                );


            res.json({

                success: true,

                favorites:
                    favorites.map(
                        item =>
                            item.menu_id
                    )

            });

        }

        catch (error) {

            console.log(
                "FAVORITES ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to update favorite"

            });

        }

    }
);


// ========================================
// GET FAVORITES
// ========================================

app.get(
    "/api/favorites",
    async (req, res) => {

        try {

            const {
                userId,
                email
            } = req.query;


            let currentUserId =
                userId || null;


            if (
                !currentUserId &&
                email
            ) {

                const [users] =
                    await pool.query(
                        `
                        SELECT id
                        FROM users
                        WHERE email = ?
                        `,
                        [email]
                    );


                if (
                    users.length > 0
                ) {

                    currentUserId =
                        users[0].id;

                }

            }


            if (!currentUserId) {

                const [users] =
                    await pool.query(
                        `
                        SELECT id
                        FROM users
                        ORDER BY id
                        LIMIT 1
                        `
                    );


                if (
                    users.length > 0
                ) {

                    currentUserId =
                        users[0].id;

                }

            }


            if (!currentUserId) {

                return res.json({

                    success: true,

                    favorites: []

                });

            }


            const [rows] =
                await pool.query(
                    `
                    SELECT
                        m.*
                    FROM favorites f
                    INNER JOIN menu m
                        ON f.menu_id = m.id
                    WHERE f.user_id = ?
                    ORDER BY f.id DESC
                    `,
                    [currentUserId]
                );


            res.json({

                success: true,

                favorites: rows

            });

        }

        catch (error) {

            console.log(
                "GET FAVORITES ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to load favorites"

            });

        }

    }
);


// ========================================
// CREATE ORDER
// ========================================

app.post(
    "/api/orders",
    async (req, res) => {

        const connection =
            await pool.getConnection();


        try {

            const {
                customer,
                email,
                phone,
                paymentMethod,
                items
            } = req.body;


            console.log(
                "ORDER REQUEST:",
                email
            );


            if (
                !customer ||
                !email ||
                !phone ||
                !paymentMethod ||
                !Array.isArray(items) ||
                items.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Complete order details are required"

                });

            }


            await connection.beginTransaction();


            let userId = null;


            const [users] =
                await connection.query(
                    `
                    SELECT id
                    FROM users
                    WHERE email = ?
                    `,
                    [email]
                );


            if (
                users.length > 0
            ) {

                userId =
                    users[0].id;

            }


            let total = 0;

            const orderItems = [];


            for (
                const item of items
            ) {

                const itemId =
                    Number(item.id);

                const quantity =
                    Number(item.quantity);


                if (
                    !Number.isInteger(itemId) ||
                    !Number.isInteger(quantity) ||
                    quantity <= 0
                ) {

                    throw new Error(
                        "Invalid order item"
                    );

                }


                const [products] =
                    await connection.query(
                        `
                        SELECT
                            id,
                            price
                        FROM menu
                        WHERE id = ?
                        `,
                        [itemId]
                    );


                if (
                    products.length === 0
                ) {

                    throw new Error(
                        `Menu item ${itemId} not found`
                    );

                }


                const product =
                    products[0];


                total +=
                    Number(product.price) *
                    quantity;


                orderItems.push({

                    menuId:
                        product.id,

                    quantity,

                    price:
                        product.price

                });

            }


            const orderNumber =
                "CC-" +
                Date.now();


            // IMPORTANT:
            // These match your CURRENT orders table.

            const [orderResult] =
                await connection.query(
                    `
                    INSERT INTO orders
                    (
                        order_number,
                        user_id,
                        email,
                        phone,
                        payment_method,
                        total,
                        status
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        orderNumber,
                        userId,
                        email,
                        phone,
                        paymentMethod,
                        total,
                        "Pending"
                    ]
                );


            const orderId =
                orderResult.insertId;


            for (
                const item of orderItems
            ) {

                await connection.query(
                    `
                    INSERT INTO order_items
                    (
                        order_id,
                        menu_id,
                        quantity,
                        price
                    )
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        orderId,
                        item.menuId,
                        item.quantity,
                        item.price
                    ]
                );

            }


            await connection.commit();


            console.log(
                "ORDER CREATED:",
                orderNumber
            );


            res.status(201).json({

                success: true,

                message:
                    "Order placed successfully!",

                order: {

                    id:
                        orderId,

                    orderNumber,

                    total

                }

            });

        }

        catch (error) {

            await connection.rollback();


            console.log(
                "ORDER ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Something went wrong while placing the order"

            });

        }

        finally {

            connection.release();

        }

    }
);


// ========================================
// CREATE RESERVATION
// ========================================

app.post(
    "/api/reservations",
    async (req, res) => {

        try {

            const {
                name,
                email,
                date,
                guests,
                specialRequest
            } = req.body;


            if (
                !name ||
                !email ||
                !date ||
                !guests
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name, email, date and guests are required"

                });

            }


            const guestCount =
                Number(guests);


            if (
                !Number.isInteger(guestCount) ||
                guestCount < 1 ||
                guestCount > 8
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Guests must be between 1 and 8"

                });

            }


            const reservationNumber =
                "RES-" +
                Date.now();


            /*
             * IMPORTANT:
             * Your reservations table previously
             * showed a column mismatch.
             *
             * We detect whether your database uses
             * reservation_date or date.
             */

            const [columns] =
                await pool.query(
                    `
                    SELECT COLUMN_NAME
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'reservations'
                    `
                );


            const columnNames =
                columns.map(
                    row =>
                        row.COLUMN_NAME
                );


            let dateColumn =
                "reservation_date";


            if (
                !columnNames.includes(
                    "reservation_date"
                ) &&
                columnNames.includes("date")
            ) {

                dateColumn = "date";

            }


            if (
                !columnNames.includes(
                    dateColumn
                )
            ) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Reservation date column was not found in the database"

                });

            }


            const sql =
                `
                INSERT INTO reservations
                (
                    reservation_number,
                    name,
                    email,
                    ${dateColumn},
                    guests,
                    special_request,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `;


            const [result] =
                await pool.query(
                    sql,
                    [
                        reservationNumber,
                        name,
                        email,
                        date,
                        guestCount,
                        specialRequest || "",
                        "Confirmed"
                    ]
                );


            console.log(
                "RESERVATION CREATED:",
                reservationNumber
            );


            res.status(201).json({

                success: true,

                message:
                    "Reservation confirmed!",

                reservation: {

                    id:
                        result.insertId,

                    reservationNumber,

                    name,

                    date,

                    guests:
                        guestCount

                }

            });

        }

        catch (error) {

            console.log(
                "RESERVATION ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Something went wrong while making the reservation"

            });

        }

    }
);


// ========================================
// GET USERS
// ========================================

app.get(
    "/api/users",
    async (req, res) => {

        try {

            const [users] =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        email,
                        created_at
                    FROM users
                    ORDER BY id DESC
                    `
                );


            res.json(users);

        }

        catch (error) {

            console.log(
                "USERS ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load users"

            });

        }

    }
);


// ========================================
// GET ORDERS
// ========================================

app.get(
    "/api/orders",
    async (req, res) => {

        try {

            const [orders] =
                await pool.query(
                    `
                    SELECT
                        o.id,
                        o.order_number,
                        u.name AS customer_name,
                        o.email AS customer_email,
                        o.phone AS customer_phone,
                        o.payment_method,
                        o.total AS total_amount,
                        o.status,
                        o.created_at
                    FROM orders o
                    LEFT JOIN users u
                        ON o.user_id = u.id
                    ORDER BY o.id DESC
                    `
                );


            res.json(orders);

        }

        catch (error) {

            console.log(
                "GET ORDERS ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load orders"

            });

        }

    }
);


// ========================================
// UPDATE ORDER STATUS
// ========================================

app.patch(
    "/api/orders/:id/status",
    async (req, res) => {

        try {

            const {
                status
            } = req.body;


            const allowedStatuses = [

                "Pending",
                "Confirmed",
                "Preparing",
                "Ready",
                "Completed",
                "Cancelled"

            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid order status"

                });

            }


            await pool.query(
                `
                UPDATE orders
                SET status = ?
                WHERE id = ?
                `,
                [
                    status,
                    req.params.id
                ]
            );


            res.json({

                success: true,

                message:
                    "Order status updated"

            });

        }

        catch (error) {

            console.log(
                "UPDATE ORDER ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to update order"

            });

        }

    }
);


// ========================================
// GET RESERVATIONS
// ========================================

app.get(
    "/api/reservations",
    async (req, res) => {

        try {

            const [columns] =
                await pool.query(
                    `
                    SELECT COLUMN_NAME
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'reservations'
                    `
                );


            const columnNames =
                columns.map(
                    row =>
                        row.COLUMN_NAME
                );


            let dateColumn =
                "reservation_date";


            if (
                !columnNames.includes(
                    "reservation_date"
                ) &&
                columnNames.includes("date")
            ) {

                dateColumn = "date";

            }


            if (
                !columnNames.includes(
                    dateColumn
                )
            ) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Reservation date column was not found"

                });

            }


            const [reservations] =
                await pool.query(
                    `
                    SELECT
                        id,
                        reservation_number,
                        name,
                        email,
                        ${dateColumn} AS reservation_date,
                        guests,
                        special_request,
                        status,
                        created_at
                    FROM reservations
                    ORDER BY id DESC
                    `
                );


            res.json(reservations);

        }

        catch (error) {

            console.log(
                "GET RESERVATIONS ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load reservations"

            });

        }

    }
);


// ========================================
// UPDATE RESERVATION STATUS
// ========================================

app.patch(
    "/api/reservations/:id/status",
    async (req, res) => {

        try {

            const {
                status
            } = req.body;


            const allowedStatuses = [

                "Confirmed",
                "Completed",
                "Cancelled"

            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid reservation status"

                });

            }


            await pool.query(
                `
                UPDATE reservations
                SET status = ?
                WHERE id = ?
                `,
                [
                    status,
                    req.params.id
                ]
            );


            res.json({

                success: true,

                message:
                    "Reservation status updated"

            });

        }

        catch (error) {

            console.log(
                "UPDATE RESERVATION ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to update reservation"

            });

        }

    }
);


// ========================================
// DASHBOARD
// ========================================

app.get(
    "/api/dashboard",
    async (req, res) => {

        try {

            const [customers] =
                await pool.query(
                    `
                    SELECT COUNT(*) AS count
                    FROM users
                    `
                );


            const [orders] =
                await pool.query(
                    `
                    SELECT COUNT(*) AS count
                    FROM orders
                    `
                );


            const [reservations] =
                await pool.query(
                    `
                    SELECT COUNT(*) AS count
                    FROM reservations
                    `
                );


            const [menu] =
                await pool.query(
                    `
                    SELECT COUNT(*) AS count
                    FROM menu
                    `
                );


            res.json({

                success: true,

                totalCustomers:
                    customers[0].count,

                totalOrders:
                    orders[0].count,

                totalReservations:
                    reservations[0].count,

                totalMenuItems:
                    menu[0].count

            });

        }

        catch (error) {

            console.log(
                "DASHBOARD ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load dashboard"

            });

        }

    }
);


// ========================================
// 404
// ========================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "Route not found"

        });

    }
);


// ========================================
// START SERVER
// ========================================

async function startServer() {

    console.log("");
    console.log("====================================");
    console.log("       ☕ COZY CAFE SERVER");
    console.log("====================================");


    const databaseConnected =
        await testDatabase();


    if (
        !databaseConnected
    ) {

        console.log("");
        console.log(
            "❌ Server stopped because MySQL connection failed."
        );

        return;

    }


    app.listen(
        PORT,
        "0.0.0.0",
        () => {

            console.log("");
            console.log("====================================");
            console.log(
                "🚀 SERVER STARTED SUCCESSFULLY"
            );
            console.log("====================================");


            console.log(
                `Server:       http://localhost:${PORT}/`
            );

            console.log(
                `Signup:       http://localhost:${PORT}/signup.html`
            );

            console.log(
                `Signin:       http://localhost:${PORT}/login.html`
            );

            console.log(
                `Favorites:    http://localhost:${PORT}/favorites.html`
            );

            console.log(
                `Admin:        http://localhost:${PORT}/admin.html`
            );


            console.log("");
            console.log("APIs:");

            console.log(
                `Health:       GET  http://localhost:${PORT}/api/health`
            );

            console.log(
                `Menu:         GET  http://localhost:${PORT}/api/menu`
            );

            console.log(
                `Signup:       POST http://localhost:${PORT}/api/signup`
            );

            console.log(
                `Signin:       POST http://localhost:${PORT}/api/signin`
            );

            console.log(
                `Favorites:    POST/GET http://localhost:${PORT}/api/favorites`
            );

            console.log(
                `Orders:       POST/GET http://localhost:${PORT}/api/orders`
            );

            console.log(
                `Reservations: POST/GET http://localhost:${PORT}/api/reservations`
            );

            console.log(
                `Dashboard:    GET  http://localhost:${PORT}/api/dashboard`
            );

            console.log("");
            console.log("====================================");

        }
    );

}


startServer();