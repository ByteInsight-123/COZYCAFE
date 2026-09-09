const favoritesGrid =
    document.getElementById(
        "favoritesGrid"
    );

const emptyFavorites =
    document.getElementById(
        "emptyFavorites"
    );


function getCurrentUser() {

    try {

        const user =
            JSON.parse(
                localStorage.getItem(
                    "cozyCafeUser"
                )
            );

        return user;

    }

    catch {

        return null;

    }

}


async function loadFavorites() {

    try {

        const user =
            getCurrentUser();


        let url =
            "/api/favorites";


        if (user) {

            url +=
                "?email=" +
                encodeURIComponent(
                    user.email
                );

        }


        const response =
            await fetch(url);


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load favorites"
            );

        }


        renderFavorites(
            data.favorites || []
        );

    }

    catch (error) {

        console.error(
            error
        );

        favoritesGrid.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:50px;
            ">
                <h2>Unable to load favorites</h2>
                <p>Please make sure the server is running.</p>
            </div>
        `;

    }

}


function renderFavorites(
    items
) {

    if (
        items.length === 0
    ) {

        favoritesGrid.style.display =
            "none";

        emptyFavorites.style.display =
            "block";

        return;

    }


    favoritesGrid.style.display =
        "grid";

    emptyFavorites.style.display =
        "none";


    favoritesGrid.innerHTML =
        items.map(
            item => {

                const image =
                    item.image ||
                    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80";


                const description =
                    item.description ||
                    "Freshly prepared at Cozy Café.";


                return `

                    <article
                        class="favorite-card"
                    >

                        <img
                            src="${escapeHtml(image)}"
                            alt="${escapeHtml(item.name)}"
                            onerror="
                                this.src='https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
                            "
                        >

                        <div
                            class="favorite-content"
                        >

                            <h3>
                                ${escapeHtml(item.name)}
                            </h3>

                            <p>
                                ${escapeHtml(description)}
                            </p>

                            <div
                                class="favorite-price"
                            >
                                ₹${Number(item.price).toFixed(0)}
                            </div>

                            <div
                                class="favorite-buttons"
                            >

                                <button
                                    class="remove-favorite"
                                    onclick="
                                        removeFavorite(${item.id})
                                    "
                                >
                                    ❤️ Remove
                                </button>

                                <a
                                    class="back-menu"
                                    href="index.html#menu"
                                >
                                    Order
                                </a>

                            </div>

                        </div>

                    </article>

                `;

            }
        ).join("");

}


async function removeFavorite(
    id
) {

    try {

        const user =
            getCurrentUser();


        const body = {

            productId:
                id

        };


        if (user) {

            body.email =
                user.email;

        }


        const response =
            await fetch(
                "/api/favorites",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(body)
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
                "Unable to remove favorite"
            );

        }


        loadFavorites();

    }

    catch (error) {

        alert(
            error.message
        );

    }

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


loadFavorites();