let menuItems=[];
let cart=JSON.parse(localStorage.getItem("cozyCafeCart"))||[];
let favorites=JSON.parse(localStorage.getItem("cozyCafeFavorites"))||[];
let currentCategory="all";

const menuGrid=document.getElementById("menuGrid");
const menuSearch=document.getElementById("menuSearch");
const noResults=document.getElementById("noResults");
const cartButton=document.getElementById("cartButton");
const cartOverlay=document.getElementById("cartOverlay");
const cartClose=document.getElementById("cartClose");
const cartItems=document.getElementById("cartItems");
const cartCount=document.getElementById("cartCount");
const cartTotal=document.getElementById("cartTotal");
const cartFooter=document.getElementById("cartFooter");
const emptyCart=document.getElementById("emptyCart");
const checkoutButton=document.getElementById("checkoutButton");
const checkoutModal=document.getElementById("checkoutModal");
const checkoutClose=document.getElementById("checkoutClose");
const checkoutForm=document.getElementById("checkoutForm");
const checkoutTotal=document.getElementById("checkoutTotal");
const orderSuccess=document.getElementById("orderSuccess");
const orderNumber=document.getElementById("orderNumber");
const orderDone=document.getElementById("orderDone");
const toast=document.getElementById("toast");

async function loadMenu(){
    try{
        const response=await fetch("http://localhost:5000/api/menu");
        if(!response.ok)throw new Error("Menu failed");
        menuItems=await response.json();
        renderMenu();
        renderCart();
    }catch(error){
        menuGrid.innerHTML=`<div class="loading">Unable to load menu. Please make sure the backend is running. ☕</div>`;
        console.error("Menu loading error:",error);
    }
}
function renderMenu(){
    const searchTerm=menuSearch.value.toLowerCase().trim();

    const filtered=menuItems.filter(item=>{
        const categoryMatch=currentCategory==="all"||item.category===currentCategory;

        const searchMatch=
            item.name.toLowerCase().includes(searchTerm)||
            item.description.toLowerCase().includes(searchTerm)||
            item.category.toLowerCase().includes(searchTerm);

        return categoryMatch&&searchMatch;
    });

    menuGrid.innerHTML="";

    if(filtered.length===0){
        noResults.style.display="block";
        return;
    }

    noResults.style.display="none";

    filtered.forEach(item=>{
        const isFavorite=favorites.includes(item.id);

        const card=document.createElement("article");
        card.className="menu-card";
        card.dataset.category=item.category;
        card.dataset.name=item.name.toLowerCase();

        card.innerHTML=`
            <div class="menu-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
                <span class="badge">${item.badge}</span>
                <button class="favorite ${isFavorite?"active":""}" data-id="${item.id}" title="Favorite">
                    ${isFavorite?"♥":"♡"}
                </button>
            </div>
            <div class="menu-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="menu-bottom">
                    <span class="price">₹${item.price}</span>
                    <button class="add-btn" data-id="${item.id}" title="Add to cart">+</button>
                </div>
            </div>
        `;

        menuGrid.appendChild(card);
    });

    document.querySelectorAll(".add-btn").forEach(button=>{
        button.addEventListener("click",()=>{
            addToCart(Number(button.dataset.id));
        });
    });

    document.querySelectorAll(".favorite").forEach(button=>{
        button.addEventListener("click",()=>{
            toggleFavorite(Number(button.dataset.id));
        });
    });

    document.querySelectorAll(".menu-image img").forEach(image=>{
        image.addEventListener("error",()=>{
            image.style.display="none";
        });
    });
}

function addToCart(id){
    const existing=cart.find(item=>item.id===id);

    if(existing){
        existing.quantity++;
    }else{
        cart.push({
            id,
            quantity:1
        });
    }

    saveCart();
    renderCart();

    const product=menuItems.find(item=>item.id===id);

    if(product){
        showToast(`${product.name} added to your cart ☕`);
    }
}

function removeFromCart(id){
    cart=cart.filter(item=>item.id!==id);
    saveCart();
    renderCart();
}

function changeQuantity(id,change){
    const item=cart.find(cartItem=>cartItem.id===id);

    if(!item)return;

    item.quantity+=change;

    if(item.quantity<=0){
        removeFromCart(id);
        return;
    }

    saveCart();
    renderCart();
}

function saveCart(){
    localStorage.setItem("cozyCafeCart",JSON.stringify(cart));
}

function getCartTotal(){
    return cart.reduce((total,cartItem)=>{
        const product=menuItems.find(item=>item.id===cartItem.id);
        return total+(product?product.price*cartItem.quantity:0);
    },0);
}

function getCartCount(){
    return cart.reduce((total,item)=>total+item.quantity,0);
}

function renderCart(){
    cartCount.textContent=getCartCount();

    const total=getCartTotal();

    cartTotal.textContent=`₹${total}`;
    checkoutTotal.textContent=`₹${total}`;

    if(cart.length===0){
        cartItems.innerHTML="";
        cartItems.style.display="none";
        emptyCart.style.display="block";
        cartFooter.style.display="none";
        return;
    }

    cartItems.style.display="block";
    emptyCart.style.display="none";
    cartFooter.style.display="block";

    cartItems.innerHTML="";

    cart.forEach(cartItem=>{
        const product=menuItems.find(item=>item.id===cartItem.id);

        if(!product)return;

        const element=document.createElement("div");
        element.className="cart-item";

        element.innerHTML=`
            <img src="${product.image}" alt="${product.name}">
            <div>
                <h4>${product.name}</h4>
                <p>₹${product.price}</p>
                <div class="quantity-controls">
                    <button data-id="${product.id}" class="minus">−</button>
                    <strong>${cartItem.quantity}</strong>
                    <button data-id="${product.id}" class="plus">+</button>
                </div>
            </div>
            <button class="remove-item" data-id="${product.id}">Remove</button>
        `;

        cartItems.appendChild(element);
    });

    document.querySelectorAll(".minus").forEach(button=>{
        button.addEventListener("click",()=>{
            changeQuantity(Number(button.dataset.id),-1);
        });
    });

    document.querySelectorAll(".plus").forEach(button=>{
        button.addEventListener("click",()=>{
            changeQuantity(Number(button.dataset.id),1);
        });
    });

    document.querySelectorAll(".remove-item").forEach(button=>{
        button.addEventListener("click",()=>{
            removeFromCart(Number(button.dataset.id));
        });
    });
}

async function toggleFavorite(id){
    try{
        const response=await fetch("/api/favorites",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                productId:id
            })
        });

        const data=await response.json();

        if(!response.ok){
            throw new Error(data.message||"Favorite failed");
        }

        favorites=data.favorites;

        localStorage.setItem(
            "cozyCafeFavorites",
            JSON.stringify(favorites)
        );

        renderMenu();
    }catch(error){
        console.error(error);
        showToast("Unable to update favorite.");
    }
}

document.querySelectorAll(".filter-btn").forEach(button=>{
    button.addEventListener("click",()=>{
        document.querySelectorAll(".filter-btn").forEach(btn=>{
            btn.classList.remove("active");
        });

        button.classList.add("active");

        currentCategory=button.dataset.category;

        renderMenu();
    });
});

menuSearch.addEventListener("input",renderMenu);

const clearSearch=document.getElementById("clearSearch");

if(clearSearch){
    clearSearch.addEventListener("click",()=>{
        menuSearch.value="";
        renderMenu();
        menuSearch.focus();
    });
}

cartButton.addEventListener("click",()=>{
    cartOverlay.classList.add("show");
    document.body.style.overflow="hidden";
});

cartClose.addEventListener("click",closeCart);

cartOverlay.addEventListener("click",event=>{
    if(event.target===cartOverlay){
        closeCart();
    }
});

function closeCart(){
    cartOverlay.classList.remove("show");
    document.body.style.overflow="";
}

document.getElementById("startShopping").addEventListener("click",()=>{
    closeCart();
    document.getElementById("menu").scrollIntoView({
        behavior:"smooth"
    });
});

checkoutButton.addEventListener("click",()=>{
    if(cart.length===0){
        showToast("Your cart is empty.");
        return;
    }

    checkoutTotal.textContent=`₹${getCartTotal()}`;

    checkoutModal.classList.add("show");
});

checkoutClose.addEventListener("click",()=>{
    checkoutModal.classList.remove("show");
});

checkoutModal.addEventListener("click",event=>{
    if(event.target===checkoutModal){
        checkoutModal.classList.remove("show");
    }
});

checkoutForm.addEventListener("submit",async event=>{
    event.preventDefault();

    const customer=document.getElementById("customerName").value.trim();
    const email=document.getElementById("customerEmail").value.trim();
    const phone=document.getElementById("customerPhone").value.trim();

    const selectedPayment=document.querySelector(
        'input[name="payment"]:checked'
    );

    const paymentMethod=selectedPayment
        ?selectedPayment.value
        :"cash";

    if(customer.length<2){
        showToast("Please enter your name.");
        return;
    }

    if(phone.length<10){
        showToast("Please enter a valid phone number.");
        return;
    }

    try{
        const response=await fetch("/api/orders",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                customer,
                email,
                phone,
                paymentMethod,
                items:cart
            })
        });

        const data=await response.json();

        if(!response.ok){
            throw new Error(data.message||"Order failed");
        }

        orderNumber.textContent=data.order.orderNumber;

        checkoutForm.reset();
        checkoutModal.classList.remove("show");

        cart=[];

        saveCart();
        renderCart();
        closeCart();

        orderSuccess.classList.add("show");

    }catch(error){
        console.error(error);
        showToast(error.message);
    }
});

orderDone.addEventListener("click",()=>{
    orderSuccess.classList.remove("show");
});

orderSuccess.addEventListener("click",event=>{
    if(event.target===orderSuccess){
        orderSuccess.classList.remove("show");
    }
});

const reservationForm=document.getElementById("reservationForm");
const formSuccess=document.getElementById("formSuccess");
const reservationMessage=document.getElementById("reservationMessage");

reservationForm.addEventListener("submit",async event=>{
    event.preventDefault();

    const name=document.getElementById("name").value.trim();
    const email=document.getElementById("email").value.trim();
    const date=document.getElementById("date").value;
    const guests=document.getElementById("guests").value;

    const specialRequestElement=document.getElementById("specialRequest");

    const specialRequest=specialRequestElement
        ?specialRequestElement.value.trim()
        :"";

    document.getElementById("nameError").textContent="";
    document.getElementById("emailError").textContent="";

    let valid=true;

    if(name.length<2){
        document.getElementById("nameError").textContent=
            "Please enter your name.";

        valid=false;
    }

    const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailPattern.test(email)){
        document.getElementById("emailError").textContent=
            "Please enter a valid email.";

        valid=false;
    }

    if(!date){
        showToast("Please select a reservation date.");
        valid=false;
    }

    if(!guests){
        showToast("Please select the number of guests.");
        valid=false;
    }

    if(!valid)return;

    try{
        const response=await fetch("/api/reservations",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                name,
                email,
                date,
                guests,
                specialRequest
            })
        });

        const data=await response.json();

        if(!response.ok){
            throw new Error(
                data.message||"Reservation failed"
            );
        }

        reservationMessage.textContent=
            `Reservation ${data.reservation.reservationNumber} confirmed for ${guests} guest(s).`;

        formSuccess.classList.add("show");

        reservationForm.reset();

        setTimeout(()=>{
            formSuccess.classList.remove("show");
        },7000);

    }catch(error){
        console.error(error);
        showToast(error.message);
    }
});

const dateInput=document.getElementById("date");

if(dateInput){
    const today=new Date();

    today.setMinutes(
        today.getMinutes()-today.getTimezoneOffset()
    );

    dateInput.min=today.toISOString().split("T")[0];
}

function updateOpeningStatus(){
    const now=new Date();
    const hour=now.getHours();

    const status=document.getElementById("openStatus");
    const dot=document.querySelector(".status-dot");

    if(!status)return;

    if(hour>=8&&hour<22){
        status.textContent="We are currently OPEN";
        status.style.color="#38834b";

        if(dot){
            dot.style.background="#45a65d";
        }
    }else{
        status.textContent="We are currently CLOSED";
        status.style.color="#d9534f";

        if(dot){
            dot.style.background="#d9534f";
        }
    }
}

updateOpeningStatus();
setInterval(updateOpeningStatus,60000);

const menuToggle=document.getElementById("menuToggle");
const navLinks=document.getElementById("navLinks");

if(menuToggle&&navLinks){
    menuToggle.addEventListener("click",()=>{
        navLinks.classList.toggle("open");
    });
}

document.querySelectorAll(".nav-links a").forEach(link=>{
    link.addEventListener("click",()=>{
        if(navLinks){
            navLinks.classList.remove("open");
        }
    });
});

const themeToggle=document.getElementById("themeToggle");
const savedTheme=localStorage.getItem("cozyCafeTheme");

if(savedTheme==="dark"){
    document.body.classList.add("dark-mode");

    if(themeToggle){
        themeToggle.textContent="☀️";
    }
}

if(themeToggle){
    themeToggle.addEventListener("click",()=>{
        document.body.classList.toggle("dark-mode");

        const dark=document.body.classList.contains("dark-mode");

        themeToggle.textContent=dark?"☀️":"🌙";

        localStorage.setItem(
            "cozyCafeTheme",
            dark?"dark":"light"
        );
    });
}

const galleryItems=document.querySelectorAll(".gallery-item");
const lightbox=document.getElementById("lightbox");
const lightboxImage=document.getElementById("lightboxImage");
const lightboxClose=document.getElementById("lightboxClose");

galleryItems.forEach(item=>{
    item.addEventListener("click",()=>{
        lightboxImage.src=item.dataset.image;
        lightbox.classList.add("show");
        document.body.style.overflow="hidden";
    });
});

function closeLightbox(){
    lightbox.classList.remove("show");
    document.body.style.overflow="";
}

lightboxClose.addEventListener("click",closeLightbox);

lightbox.addEventListener("click",event=>{
    if(event.target===lightbox){
        closeLightbox();
    }
});

const backToTop=document.getElementById("backToTop");

window.addEventListener("scroll",()=>{
    if(window.scrollY>500){
        backToTop.classList.add("show");
    }else{
        backToTop.classList.remove("show");
    }
});

backToTop.addEventListener("click",()=>{
    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
});

document.addEventListener("keydown",event=>{
    if(event.key==="Escape"){
        closeLightbox();
        checkoutModal.classList.remove("show");
        orderSuccess.classList.remove("show");
        closeCart();
    }
});

function showToast(message){
    if(!toast)return;

    toast.textContent=message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer=setTimeout(()=>{
        toast.classList.remove("show");
    },2500);
}

const currentYear=document.getElementById("currentYear");

if(currentYear){
    currentYear.textContent=new Date().getFullYear();
}

if("serviceWorker" in navigator){
    window.addEventListener("load",()=>{
        navigator.serviceWorker.register("/sw.js")
            .then(()=>{
                console.log("PWA service worker registered");
            })
            .catch(error=>{
                console.log(
                    "Service worker error:",
                    error
                );
            });
    });
}

loadMenu();