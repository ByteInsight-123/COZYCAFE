const navButtons =
    document.querySelectorAll(
        ".nav-btn"
    );

const sections =
    document.querySelectorAll(
        ".page-section"
    );

const pageTitle =
    document.getElementById(
        "pageTitle"
    );

const toast =
    document.getElementById(
        "toast"
    );


/* ========================================
   NAVIGATION
======================================== */

navButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const sectionName =
                    button.dataset.section;


                navButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                sections.forEach(
                    section => {

                        section.classList.remove(
                            "active-section"
                        );

                    }
                );


                const section =
                    document.getElementById(
                        sectionName
                    );


                section.classList.add(
                    "active-section"
                );


                pageTitle.textContent =
                    button.textContent
                    .replace(
                        /[^\w\s]/gi,
                        ""
                    )
                    .trim();


                if (
                    sectionName ===
                    "dashboard"
                ) {

                    loadDashboard();

                }


                if (
                    sectionName ===
                    "orders"
                ) {

                    loadOrders();

                }


                if (
                    sectionName ===
                    "customers"
                ) {

                    loadCustomers();

                }


                if (
                    sectionName ===
                    "reservations"
                ) {

                    loadReservations();

                }


                if (
                    sectionName ===
                    "menu"
                ) {

                    loadMenu();

                }

            }
        );

    }
);


/* ========================================
   TOAST
======================================== */

function showToast(
    message
) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* ========================================
   DASHBOARD
======================================== */

async function loadDashboard() {

    try {

        const response =
            await fetch(
                "/api/dashboard"
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Dashboard failed"
            );

        }


        document.getElementById(
            "totalCustomers"
        ).textContent =
            data.totalCustomers;


        document.getElementById(
            "totalOrders"
        ).textContent =
            data.totalOrders;


        document.getElementById(
            "totalReservations"
        ).textContent =
            data.totalReservations;


        document.getElementById(
            "totalMenuItems"
        ).textContent =
            data.totalMenuItems;

    }

    catch (error) {

        console.error(
            error
        );

        showToast(
            "Unable to load dashboard"
        );

    }

}


/* ========================================
   CUSTOMERS
======================================== */

async function loadCustomers() {

    const table =
        document.getElementById(
            "customersTable"
        );


    table.innerHTML = `
        <tr>
            <td colspan="4">
                Loading customers...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                "/api/users"
            );


        const users =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                users.message ||
                "Failed to load customers"
            );

        }


        if (
            users.length === 0
        ) {

            table.innerHTML = `
                <tr>
                    <td colspan="4">
                        No customers found.
                    </td>
                </tr>
            `;

            return;

        }


        table.innerHTML =
            users.map(
                user => `

                    <tr>

                        <td>
                            ${user.id}
                        </td>

                        <td>
                            ${escapeHtml(
                                user.name
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                user.email
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                user.created_at
                            )}
                        </td>

                    </tr>

                `
            ).join("");

    }

    catch (error) {

        console.error(
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    Unable to load customers.
                </td>
            </tr>
        `;

    }

}


/* ========================================
   ORDERS
======================================== */

async function loadOrders() {

    const table =
        document.getElementById(
            "ordersTable"
        );


    table.innerHTML = `
        <tr>
            <td colspan="8">
                Loading orders...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                "/api/orders"
            );


        const orders =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                orders.message ||
                "Failed to load orders"
            );

        }


        if (
            orders.length === 0
        ) {

            table.innerHTML = `
                <tr>
                    <td colspan="8">
                        No orders found.
                    </td>
                </tr>
            `;

            return;

        }


        table.innerHTML =
            orders.map(
                order => `

                    <tr>

                        <td>
                            ${order.id}
                        </td>

                        <td>
                            <strong>
                                ${escapeHtml(
                                    order.order_number
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHtml(
                                order.customer_name ||
                                "Guest"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                order.customer_email
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                order.customer_phone
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                order.payment_method
                            )}
                        </td>

                        <td>
                            ₹${Number(
                                order.total_amount
                            ).toFixed(0)}
                        </td>

                        <td>

                            <select
                                class="status-select"
                                onchange="
                                    updateOrderStatus(
                                        ${order.id},
                                        this.value
                                    )
                                "
                            >

                                ${orderStatusOptions(
                                    order.status
                                )}

                            </select>

                        </td>

                    </tr>

                `
            ).join("");

    }

    catch (error) {

        console.error(
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="8">
                    Unable to load orders.
                </td>
            </tr>
        `;

    }

}


function orderStatusOptions(
    current
) {

    const statuses = [

        "Pending",
        "Confirmed",
        "Preparing",
        "Ready",
        "Completed",
        "Cancelled"

    ];


    return statuses.map(
        status => `

            <option
                value="${status}"
                ${
                    status === current
                    ? "selected"
                    : ""
                }
            >
                ${status}
            </option>

        `
    ).join("");

}


async function updateOrderStatus(
    id,
    status
) {

    try {

        const response =
            await fetch(
                `/api/orders/${id}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            status
                        })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Failed to update order"
            );

        }


        showToast(
            "Order status updated!"
        );

    }

    catch (error) {

        console.error(
            error
        );

        showToast(
            error.message
        );

        loadOrders();

    }

}


/* ========================================
   RESERVATIONS
======================================== */

async function loadReservations() {

    const table =
        document.getElementById(
            "reservationsTable"
        );


    table.innerHTML = `
        <tr>
            <td colspan="8">
                Loading reservations...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                "/api/reservations"
            );


        const reservations =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                reservations.message ||
                "Failed to load reservations"
            );

        }


        if (
            reservations.length === 0
        ) {

            table.innerHTML = `
                <tr>
                    <td colspan="8">
                        No reservations found.
                    </td>
                </tr>
            `;

            return;

        }


        table.innerHTML =
            reservations.map(
                reservation => `

                    <tr>

                        <td>
                            ${reservation.id}
                        </td>

                        <td>
                            ${escapeHtml(
                                reservation.reservation_number
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                reservation.name
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                reservation.email
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                reservation.reservation_date
                            )}
                        </td>

                        <td>
                            ${reservation.guests}
                        </td>

                        <td>
                            ${escapeHtml(
                                reservation.special_request ||
                                "-"
                            )}
                        </td>

                        <td>

                            <select
                                class="status-select"
                                onchange="
                                    updateReservationStatus(
                                        ${reservation.id},
                                        this.value
                                    )
                                "
                            >

                                ${reservationStatusOptions(
                                    reservation.status
                                )}

                            </select>

                        </td>

                    </tr>

                `
            ).join("");

    }

    catch (error) {

        console.error(
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="8">
                    Unable to load reservations.
                </td>
            </tr>
        `;

    }

}


function reservationStatusOptions(
    current
) {

    const statuses = [

        "Confirmed",
        "Completed",
        "Cancelled"

    ];


    return statuses.map(
        status => `

            <option
                value="${status}"
                ${
                    status === current
                    ? "selected"
                    : ""
                }
            >
                ${status}
            </option>

        `
    ).join("");

}


async function updateReservationStatus(
    id,
    status
) {

    try {

        const response =
            await fetch(
                `/api/reservations/${id}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            status
                        })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Failed to update reservation"
            );

        }


        showToast(
            "Reservation status updated!"
        );

    }

    catch (error) {

        console.error(
            error
        );

        showToast(
            error.message
        );

        loadReservations();

    }

}


/* ========================================
   MENU
======================================== */

async function loadMenu() {

    const grid =
        document.getElementById(
            "menuGrid"
        );


    grid.innerHTML = `
        <p>
            Loading menu...
        </p>
    `;


    try {

        const response =
            await fetch(
                "/api/menu"
            );


        const items =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                items.message ||
                "Failed to load menu"
            );

        }


        if (
            items.length === 0
        ) {

            grid.innerHTML = `
                <p>
                    No menu items found.
                </p>
            `;

            return;

        }


        grid.innerHTML =
            items.map(
                item => {

                    const image =
                        item.image ||
                        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80";


                    return `

                        <article
                            class="admin-menu-card"
                        >

                            <img
                                src="${escapeHtml(
                                    image
                                )}"
                                alt="${escapeHtml(
                                    item.name
                                )}"
                                onerror="
                                    this.src='https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
                                "
                            >

                            <div
                                class="admin-menu-content"
                            >

                                <h3>
                                    ${escapeHtml(
                                        item.name
                                    )}
                                </h3>

                                <p>
                                    ${escapeHtml(
                                        item.description ||
                                        "Freshly prepared."
                                    )}
                                </p>

                                <div
                                    class="menu-price"
                                >
                                    ₹${Number(
                                        item.price
                                    ).toFixed(0)}
                                </div>

                            </div>

                        </article>

                    `;

                }
            ).join("");

    }

    catch (error) {

        console.error(
            error
        );

        grid.innerHTML = `
            <p>
                Unable to load menu.
            </p>
        `;

    }

}


/* ========================================
   HELPERS
======================================== */

function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleDateString(
        "en-IN"
    );

}


function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}


/* ========================================
   INITIAL LOAD
======================================== */

loadDashboard();