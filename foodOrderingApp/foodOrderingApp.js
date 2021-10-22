// Search, sort, responsive , tags (can be used in filtering)

class LocalCache {
    constructor() {
        this.food = [];
        if(!localStorage.getItem("fooditems")) {
            localStorage.setItem("fooditems", JSON.stringify(this.food));
        }
    }
    getData() {
        return JSON.parse(localStorage.getItem("fooditems"));
    }
    saveData(data) {
        return localStorage.setItem("fooditems", JSON.stringify(data));
    }
}

class API {
    constructor(page) {
       this.page = page || 1;
    }
    randomTime() {
        const currentDate = new Date();
        return new Date(currentDate.getTime() + Math.random() * 60)
    }
    //fetch the api from the url if any
    apiCall(index) {
        const page = index || this.page;
        const startIndex = (page - 1) * 15;
        const restaurantNames = ["Subway(MCF)","Prince Ki Rasoi","Aggarwal Sweets & Restaurant",
        "Fork with Sticks","South Store","Chinese Corner","Sandburg Shakes","Royal Spice","Madurai Meenakshi Bhawan","Punjabi Chaap Corner","The Burger Homes"];
        const tagsNames = ["American", "South Indian","Chinese", "Fast Food","Cafe", "Italian", "Healthy Food","Indian","Snacks","Mughlai", "North Indian", "Street Food"]
        const foodItems = [];
        for(let i = 0;i<Math.min(45-startIndex, 15);i++) {
            const restaName = restaurantNames[Math.floor(Math.random() * restaurantNames.length)];
            foodItems.push({
                id: `rest${startIndex + i + 1}`,
                // name: `Restaurant ${startIndex + i + 1}`,
                name: restaName,
                menu: [],
                url: `../images/item${i + 1}.jpeg`,
                eta: Math.floor(new Date().getMinutes() + (Math.random() * new Date().getMinutes())),
                description: `${Math.floor(Math.random() * 1000)}+ orders placed from here recently, Follows all Max Safety measures to ensure your food is safe`,
                tags:[tagsNames[Math.floor(Math.random() * tagsNames.length)],tagsNames[Math.floor(Math.random() * tagsNames.length)]],
                costForOne: Math.floor(Math.random() * 500 + 100),
                rating: (Math.random() * 5).toFixed(1)
            })
        }
        for(let i = 0;i<foodItems.length;i++) {
            for(let j = 0;j<Math.min(45-startIndex, 15);j++) {
                foodItems[i].menu.push({
                    id: `menu${j + 1}`,
                    name: `Food ${j + 1}`,
                    url: `../images/item${j + 1}.jpeg`,
                    description: "",
                    price: `${startIndex + i + 1 * (Math.floor(Math.random() * 200)) }`,
                    rating: Math.floor(Math.random() * 5)
                })
            }
        }
        return {
            items: foodItems,
            hasMore: startIndex === 45,
            cart: [],
        }
    }

    fetch(index,callback) {
        const data = this.apiCall(index)
        callback(data);
    }

}

class OrderFood {
    constructor(cache, api, initialData) {
        this.api = api;
        this.cache = cache;
        this.apidata = initialData;
        this.init();

    }

    getMenuOfRest(restaId) {
        return this.cache.getData().items.filter((item) => item.id === restaId)[0]
    }

    showToggleCartView(event) {
        return event.target.nextElementSibling.style.display = 'block';
    }

    setRecursiveOnItems(allItems, value) {        
        const filteredData =  [];
        allItems.forEach((item) => {
            if(item.name.toLowerCase().includes(value)) {
                filteredData.push(item);
            } else if(item.menu) {
                const isFoodPresentInMenu = item.menu.some((menu) => menu.name.toLowerCase().includes(value));
                if(isFoodPresentInMenu) {
                    filteredData.push(item);
                }
            }
        })
       return filteredData;
    }

    displayMenuScreen(event) {
        console.log(event.target)
    }

    renderFilteredItem(items){
        const placeholder = this.appId.querySelector('.search-results-placeholder');
        if(items.length > 0) {
            placeholder.innerHTML = this.createContainer(items, "50px", "50px");
            placeholder.addEventListener('click', this.displayMenuScreen.bind(this));
        } else {
            this.placeholder.innerHTML = "No results"
        }
    }

    filterDataOnList(value) {
       const enteredValue = value.toLowerCase();
        const {items} = this.cache.getData();
        const filteredData = this.setRecursiveOnItems(items, enteredValue);
        this.renderFilteredItem(filteredData)
    }

    debounce(callback,delay) {
        let timerId;
        return function(...args) {
            clearTimeout(timerId);
            timerId = setTimeout(() => {
                callback.apply(this, [...args])
            }, delay);
        }
        
    }

    filterDataOnMenu(value) {
        const enteredValue = value.toLowerCase();
        const filteredData = this.menu.filter((item) => item.name.toLowerCase().includes(enteredValue));
        console.log(filteredData)
        this.menuPlaceholder.innerHTML = '';
        if(filteredData.length > 0) {
            this.menuPlaceholder.innerHTML = this.createMenuListView(filteredData);
        } else {
            this.menuPlaceholder.innerHTML = "No results";
        }
       // this.renderFilteredItem(filteredData)
    }

    handleSearchText = this.debounce(this.filterDataOnList, 1000);

    handleSearchTextOnMenu = this.debounce(this.filterDataOnMenu, 1000);

    searchByValidInput(event) {
        const inputValueEntered = event.target.value;
        if(inputValueEntered.trim().length === 0) {
            this.placeholder.innerHTML = "";
            this.placeholder.innerHTML = this.createContainer(this.cache.getData().items, "350px","300px")
        } else {
            this.handleSearchText(inputValueEntered)
        }
    }

    searchByValidInputMenu(event) {
        const inputValueEntered = event.target.value;
        this.handleSearchTextOnMenu(inputValueEntered);
    }

    getTotalPrice() {
        
    }

    calculatePrice() {
        const cartItem = this.cache.getData().cart;
        return cartItem.reduce((acc,cum) => acc+parseInt(cum.subprice),0);
    }

    getCartCount() {
        return this.cache.getData().cart.reduce((acc,cum) => acc+parseInt(cum.quantity),0);
    }
    renderCountOnCart() {
        this.appId.querySelector('.cartcount').innerHTML = this.getCartCount();
    }
    createCartView(cart) {
        let view ="";
        cart.forEach((cart) => {
            view+= `<div class="cart-view">
                <div class="details">
                    <span>${cart.name}</span>
                    <span class="price">$${cart.price}</span>
                </div>
                <div class="actionbtn" data-parent-id="${cart.id}">
                    <button class="btn">-</button>
                    <span>${cart.quantity}</span>
                    <button class="btn">+</button>
                </div>
            </div>`
        })
        return view;
    }
    addBtnHandler(event){
        const menuId = event.target.parentElement.dataset.parentId;
        if(event.target.innerHTML === "+") {
            this.increasePriceByOne(menuId);
        }
    }
    showCartContainer(){
        const cart = this.cache.getData().cart;
        this.appId.querySelector('.menu-container').innerHTML = "";
        const cartContainer = this.appId.querySelector('.cart-container');
        cartContainer.innerHTML = `<div><h3>Your Cart</h3>${this.createCartView(cart)}</div>`;
        cartContainer.querySelector('.actionbtn').addEventListener('click', this.addBtnHandler.bind(this));
    }
    cartBanner() {
        this.total = this.calculatePrice();
        this.appId.querySelector('.cart-banner').innerHTML = `<div>
            <span>Your Order (${this.getCartCount()})</span>
            <span class="right">
                <span>Subtotal: $${this.total}</span>
                <button class="continue-btn btn">Continue</button>
            </span>
        </div>`;
        this.appId.querySelector('.cart-banner .continue-btn').addEventListener('click', this.showCartContainer.bind(this))
    }

    updateQuanityValue(element, quantity) {
        return element.innerHTML = quantity;
    }

    getQuantityCount(cart,menuId) {
       return cart.find((menu) => menu.id === menuId).quantity;
    }
    increasePriceByOne(menuId) {
        let getDataFromStorage = this.cache.getData();
        this.cart.find((menu) => {
            if(menu.id === menuId) {
                menu.quantity +=1;
                menu.subprice =menu.price * menu.quantity;
            }
        });
        getDataFromStorage["cart"] = this.cart;
        this.cache.saveData(getDataFromStorage);
        this.updateQuanityValue(event.target.previousElementSibling,this.getQuantityCount(getDataFromStorage.cart,menuId));
        this.renderCountOnCart();
    }
    menuHandler(event) {
       if(event.target.innerHTML === 'Add+') {
           const menuId = event.target.parentElement.id;
           let selectedMenuItem = this.menu.find((menu) => menu.id === menuId);
           selectedMenuItem.quantity = 1;
           selectedMenuItem.subprice = selectedMenuItem.price;

           let getDataFromStorage = this.cache.getData();
           this.cart.push(selectedMenuItem);
           console.log(this.cart)
           getDataFromStorage["cart"] = this.cart;
           this.cache.saveData(getDataFromStorage);
           event.target.style.display = 'none';
           this.showToggleCartView(event);
           this.renderCountOnCart()
           this.cartBanner();
        } else if(event.target.innerHTML === '+') {
                console.log(this.cart)
                const menuId = event.target.parentElement.parentElement.id;
                this.increasePriceByOne(menuId);
                this.cartBanner();
                //this.renderCountOnCart();
                
        } else if(event.target.innerHTML === '-') {
            const menuId = event.target.parentElement.parentElement.id;
            let getDataFromStorage = this.cache.getData();
            this.cart.find((menu) => {
                if(menu.id === menuId) {
                    menu.quantity = menu.quantity === 0 ? 0 : menu.quantity - 1;
                    menu.subprice = menu.quantity === 0 ? 0 : menu.price * menu.quantity;
                }
            });
            getDataFromStorage["cart"] = this.cart;
            this.cache.saveData(getDataFromStorage);
            this.updateQuanityValue(event.target.nextElementSibling,this.getQuantityCount(getDataFromStorage.cart,menuId));
            this.cartBanner();
            this.renderCountOnCart()
        }
    }

    starRating(rating) {
        let star = "";
        for(let i=0;i<5;i++) {
            if(i < rating) {
                star +=`<i class="fa fa-star checked"></i>`
            } else {
                star+=`<i class="fa fa-star-o"></i>`
            }
        }
        return star;
    }

    getQuantity() {
        let getDataFromStorage = this.cache.getData().cart;
        if(getDataFromStorage.length >0){

        }
        return 1;
    }

    createMenuListView(menu) {
        let menuView = "";
        let childView = "";
        menu.forEach((menuItem) => {
            childView +=`<div class="grid-item menu-box" id="${menuItem.id}">
                <div class="image"><img src="${menuItem.url}" alt="${menuItem.name}" width="100px" height="100px" />
                </div>
                <span class="inline">
                    <div class="heading">
                        <strong>${menuItem.name}</strong>
                    </div>
                    <span class="price">$${menuItem.price}</span>
                    <div class="rating">
                       ${this.starRating(menuItem.rating)}
                    </div>
                </span>
                <button class="btn">Add+</button>
                <div class="actionbtn" style="display: none">
                    <button class="btn">-</button>
                    <span>${this.getQuantity()}</span>
                    <button class="btn">+</button>
                </div>
            </div>`
        })
        menuView += `<div class="grid-container menu">
            ${childView}
        </div>`;
        return menuView;
    }

    createBannerOnMenu(menulist) {
        const parentView = `<div class="banner">
            <span><img src="${menulist.url}" width="500px" alt="${menulist.name}"></span>
            <div style="display: flex;">
                <div>
                    <h3>${menulist.name}</h3>
                    <span class="rating ${parseInt(menulist.rating) > 3.5 ? 'green' : parseInt(menulist.rating) < 2 ? 'red' : 'yellow'}">${menulist.rating}<i class="fa fa-star checked"></i></span>
                </div>
                <div class="menu-search">
                    <input id="menu-search-input" placeholder="Search within the menu" type="text" />
                    <i class="fa fa-search search-icon"></i>
                </div>
            </div>
            <p>${menulist.description}</p>
        </div>`;
        this.bannerPlaceholder.innerHTML = parentView;
    }

    renderViewMenu(menulist) {
        this.menu = menulist.menu;
        this.createBannerOnMenu(menulist);
        this.placeholder.style.display = 'none';
        this.menuPlaceholder.innerHTML= this.createMenuListView(menulist.menu);
        document.querySelector('.menu').addEventListener('click', this.menuHandler.bind(this));
        this.appId.querySelector('#menu-search-input').addEventListener('input', this.searchByValidInputMenu.bind(this));
    }

    displayMenu(event) {
        const targetId = event.target.dataset.parentId;
        const getMenuOnRestSelected = this.getMenuOfRest(targetId);
        this.renderViewMenu(getMenuOnRestSelected)
    }

    createContainer(items, width,height) {
        let views = "";
        items.forEach((item) => {
            views +=`<div class="grid-item list-box" id="${item.id}">
                <div class="image" data-parent-id="${item.id}">
                    <img src="${item.url}" data-parent-id="${item.id}" alt="${item.name}" width="${width}" height="${height}" />
                    <span class="eta">${item.eta} mins</span>
                </div>
                <span class="inline two-col" data-parent-id="${item.id}">
                    <div data-parent-id="${item.id}" class="heading col1"><strong>${item.name}</strong>
                    <div data-parent-id="${item.id}" class="rating ${parseInt(item.rating) > 3.5 ? 'green' : parseInt(item.rating) < 2 ? 'red' : 'yellow'}">${item.rating}<i class="fa fa-star checked"></i>
                    </div>
                    </div>
                    <div class="col2">
                        <span>${item.tags[0]},${item.tags[1]}</span>
                        <span class="cost">$${item.costForOne} for one</span>
                    </div>
                </span>
            </div>`
        })
        return views;
    }
    renderView(foodItem) {
        const views = this.createContainer(foodItem.items, "350px", "300px");
        this.placeholder.innerHTML = views;
    }

    renderDataView(data) {
        if(!data.hasMore) {
            this.renderView(data);
        }
    }
    renderData(data) {
        this.apidata = data;
        this.cache.saveData(data);
        this.renderDataView(data);
    }
    fetchData() {
        this.api.fetch(this.index+1, this.renderData.bind(this));
    }

    showPosition(position) {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        const latlon=new google.maps.LatLng(lat, long);
        const mapholder = document.getElementById('mapholder');
        mapholder.style.height='250px';
        mapholder.style.width='100%';
        const options = {
            center:latlon,
            mapTypeId:google.maps.MapTypeId.ROADMAP,
            mapTypeControl:false,
            navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
        };
        const map = new google.maps.Map(document.getElementById("mapholder"),options)
        const marker = new google.maps.Marker({position:latlon,map:map,title:"You are here!"})
    }

    showError(error) {
        const mapholder = document.getElementById('mapholder');
        mapholder.className = "error";
        switch(error.code) {
            case error.PERMISSION_DENIED:
                mapholder.innerHTML="User denied the request for Geolocation."
            break;
            case error.POSITION_UNAVAILABLE:
                mapholder.innerHTML="Location information is unavailable."
            break;
            case error.TIMEOUT:
                mapholder.innerHTML="The request to get user location timed out."
            break;
            case error.UNKNOWN_ERROR:
                mapholder.innerHTML="An unknown error occurred."
            break;
        }
    }

    getLocation() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.showPosition, this.showError)
        }
    }

    createSortContainerView() {
        const sortList = ["Rating: High to Low","Delivery Time","Cost: Low to High","Cost: High to Low"];
        let view = "";
        sortList.forEach((list) => {
            view += `<section class="sort-list">
                <label class="label">
                    <input name="sort_modal" label="${list}" type="radio" class="sort_input" value="${list}">
                    <svg viewBox="0 0 20 20" id="circle" class="svg-box">
                        <circle cx="10" cy="10" r="8" name="sort_modal" value="${list.toLowerCase()}_desc" label="${list}" class="circle-icon"></circle>
                        <circle cx="10" cy="10" r="5" name="sort_modal" value="${list.toLowerCase()}_desc" label=${list} class="checked"></circle>
                    </svg>
                    <span class="value">${list}</span>
                </label>
            </section>`;
        })
      
        return view;
    }

    searchInputView() {
        return `<section width="100%" class="search-filter-container">
        <div class="">
            <i class="" size="17" color="#B5B5B5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="#B5B5B5" width="17" height="17" viewBox="0 0 20 20" aria-labelledby="icon-svg-title- icon-svg-desc-" role="img" class="sc-rbbb40-0 fajqkJ">
                <title>Search</title>
                <path d="M19.78 19.12l-3.88-3.9c1.28-1.6 2.080-3.6 2.080-5.8 0-5-3.98-9-8.98-9s-9 4-9 9c0 5 4 9 9 9 2.2 0 4.2-0.8 5.8-2.1l3.88 3.9c0.1 0.1 0.3 0.2 0.5 0.2s0.4-0.1 0.5-0.2c0.4-0.3 0.4-0.8 0.1-1.1zM1.5 9.42c0-4.1 3.4-7.5 7.5-7.5s7.48 3.4 7.48 7.5-3.38 7.5-7.48 7.5c-4.1 0-7.5-3.4-7.5-7.5z"></path>
                </svg></i>
                </div>
                <input type="text" width="100%" autocomplete="on" class="filter-search" value="">
                <div class="">
                <i class="" size="17" color="#B5B5B5"><svg xmlns="http://www.w3.org/2000/svg" fill="#B5B5B5" width="17" height="17" viewBox="0 0 20 20" aria-labelledby="icon-svg-title- icon-svg-desc-" role="img" class="sc-rbbb40-0 fajqkJ">
                <title>cross</title><path d="M11.42 10.42l3.54-3.54c0.38-0.4 0.38-1.040 0-1.42s-1.020-0.4-1.42 0l-3.54 3.54-3.54-3.54c-0.4-0.4-1.020-0.4-1.42 0s-0.38 1.020 0 1.42l3.54 3.54-3.54 3.54c-0.38 0.38-0.38 1.020 0 1.42 0.2 0.18 0.46 0.28 0.72 0.28s0.5-0.1 0.7-0.28l3.54-3.56 3.54 3.56c0.2 0.18 0.46 0.28 0.72 0.28s0.5-0.1 0.7-0.28c0.38-0.4 0.38-1.040 0-1.42l-3.54-3.54z"></path></svg></i></div></section>`
    }
    createCuisinesContainerView() {
        const tagsNames = ["American", "South Indian","Chinese", "Fast Food","Cafe", "Italian", "Healthy Food","Indian","Snacks","Mughlai", "North Indian", "Street Food"];
        let view = "";
        tagsNames.forEach((tag) => {
            view +=`<div class="cuisine-content">
                <label label="${tag}" value="1035" color="#EF4F5F" class="">
                <input type="checkbox" aria-checked="false" color="#EF4F5F" class="checkbox" value="${tag}">${tag}</label>
            </div>`
        })
        // ${this.searchInputView()}
        return view;
    }

    handleRadioBtn(event) {
        this.modalContainer.querySelector(`.tab-items-selected[data-parent-id="${event.currentTarget.dataset.parentId}"]`).innerHTML = event.target.value;
        this.filters.sortBy = event.target.value;
        if(event.target.value === 'Popularity') {

        } 
    }

    updateCuisineList(cuisineSelected) {
        if(!this.filters.cuisines[cuisineSelected]) {
            this.filters.cuisines[cuisineSelected] = true;
        }
    }

    handleCheckboxBtn(event){
        if(!this.filters.cuisines) {
            this.filters.cuisines = {};
        }
        const cuisineSelected = event.target.value;
        this.updateCuisineList(cuisineSelected);
    }

    displayCuisinesView(parentId) {
        const container = this.modalContainer.querySelector('.section-two');
        container.innerHTML="";
        container.innerHTML = `<section name="sort_modal" class="sort_modal-container" data-parent-id="${parentId}">${this.createCuisinesContainerView()}</section>`;
        container.querySelector('.sort_modal-container').addEventListener('change', this.handleCheckboxBtn.bind(this))
    }

    displaySortView(parentId) {
        const container = this.modalContainer.querySelector('.section-two');
        container.innerHTML = `<section name="sort_modal" class="sort_modal-container" data-parent-id="${parentId}">${this.createSortContainerView()}</section>`;
        container.querySelector('.sort_modal-container').addEventListener('change', this.handleRadioBtn.bind(this))
    }

    displayRatingView() {
        this.createSlider()
    }

    moveSlider(event) {
        const track = this.modalContainer.querySelector('.slider-track');
        const thumb = this.modalContainer.querySelector('.slider-thumb');
        const rating = this.modalContainer.querySelector('.rating-value');
        if(event.target.dataset.index !== '4'){
            for(let i=parseInt(event.target.dataset.index)-1;i>=0;i--) {
                this.modalContainer.querySelector(`.slider-mark[data-index="${i}"]`).classList.remove('mark-active');
             }
        }
        for(let i=parseInt(event.target.dataset.index);i<4;i++) {
            this.modalContainer.querySelector(`.slider-mark[data-index="${i}"]`).classList.add('mark-active');
        }
        if(event.target.dataset.index === '0'){
            track.style.left ="0%";
            track.style.width ="100%";
            thumb.style.left ="0%";
            rating.innerHTML = 'Any';
            this.filters.rating = 'any'
        }else if(event.target.dataset.index === '1') {
            track.style.left ="25%";
            track.style.width ="75%";
            thumb.style.left ="25%";
            rating.innerHTML = '2.5+';
            this.filters.rating = '2.5'
        }else if(event.target.dataset.index === '2') {
            track.style.left ="50%";
            track.style.width ="50%";
            thumb.style.left ="50%";
            rating.innerHTML = '3.5+';
            this.filters.rating = '3.5'
        }else if(event.target.dataset.index === '3') {
            track.style.left ="75%";
            track.style.width ="25%";
            thumb.style.left ="75%";
            rating.innerHTML = '4.5+';
            this.filters.rating = '4.5'
        }
        console.log(this.filters)
    }

    createSlider() {
        const container = this.modalContainer.querySelector('.section-two');
        const view = `<div class="container-slider">
            <div class="slider-container">
            <h5>Rating</h5>
            <h6 class="rating-value">Any</h6>
            <span class="slider-root root">
            <span class="slider-rail rail"></span>
            <span class="slider-track track" style="left: 0%; width: 100%;"></span>
            <input type="hidden" value="">
            <span data-index="0" class="slider-mark mark Slider-markActive mark-active" style="left: 0%;"></span>
            <span aria-hidden="true" data-index="0" class="slider-markLabel mark-label slider-markLabelActive" style="left: 0%;">Any</span>
            <span data-index="1" class="slider-mark mark Slider-markActive mark-active" style="left: 25%;"></span>
            <span aria-hidden="true" data-index="1" class="slider-markLabel mark-label slider-markLabelActive" style="left: 25%;">2.5</span>
            <span data-index="2" class="slider-mark mark Slider-markActive mark-active" style="left: 50%;"></span>
            <span aria-hidden="true" data-index="2" class="slider-markLabel mark-label slider-markLabelActive" style="left: 50%;">3.5</span>
            <span data-index="3" class="slider-mark mark Slider-markActive mark-active" style="left: 75%;"></span>
            <span aria-hidden="true" data-index="3" class="slider-markLabel mark-label slider-markLabelActive" style="left: 75%;">4.5</span>
            <span data-index="4" class="slider-mark mark Slider-markActive mark-active" style="left: 100%;"></span>
            <span aria-hidden="true" data-index="4" class="slider-markLabel mark-label slider-markLabelActive" style="left: 100%;">5</span>
            <span class="slider-thumb thumb slider-thumbColorPrimary" tabindex="0" role="slider" data-index="0" aria-labelledby="slider" aria-orientation="horizontal" aria-valuemax="4" aria-valuemin="0" aria-valuenow="0" style="left: 0%;"></span>
            <span class="slider-thumb thumb slider-thumbColorPrimary" tabindex="0" role="slider" data-index="1" aria-labelledby="slider" aria-orientation="horizontal" aria-valuemax="4" aria-valuemin="0" aria-valuenow="4" style="left: 100%;"></span>
            </span></div></div>
        `;
        container.innerHTML = "";
        container.innerHTML = view;
        container.querySelector('.slider-root').addEventListener('click', this.moveSlider.bind(this))
    }

    handleFilterSection(event) {
       // const container = this.modalContainer.querySelector('.section-two');
        if(event.target.innerHTML === 'Sort by') {
            this.displaySortView('Sort by');
        } else if(event.target.innerHTML === 'Cuisines'){
            this.displayCuisinesView('Cuisines');

        }else if(event.target.innerHTML === 'Rating') {
            this.displayRatingView('Rating');
        } else {

        }
    }

    sortByFilter(sortBy, data) {
        let filteredData = [];
        if(sortBy === 'Rating: High to Low') {
            filteredData = data.sort((a,b) =>  parseInt(b.rating) - parseInt(a.rating));
        } else if(sortBy=== 'Cost: Low to High') {
            filteredData = data.sort((a,b) =>  parseInt(a.costForOne) - parseInt(b.costForOne));
        } else if(sortBy === 'Delivery Time') {
            filteredData = data.sort((a,b) =>  parseInt(a.eta) - parseInt(b.eta));
        } else if(sortBy === 'Cost: High to Low') {
            filteredData = data.sort((a,b) =>  parseInt(b.costForOne) - parseInt(a.costForOne));
        }
        return filteredData;
    }

    filterByCuisines(tags, data) {
        return data.filter((list) => {
            if(list.tags.some((tag) => tags[tag])) {
                return list;
            }
            return;
        });
    }

    filterByRatingRange(ratings, data) {
        return data.filter((item) => parseInt(item.rating) >= parseInt(ratings))
    }

    applyFilter() {
        const getDataFromStorage = this.cache.getData();
        let filteredData = [];
        if(this.filters.sortBy) {
            filteredData = this.sortByFilter(this.filters.sortBy, getDataFromStorage.items);
        }
        if(this.filters.cuisines) {
            filteredData = this.filterByCuisines(this.filters.cuisines, filteredData.length > 0 ? filteredData : getDataFromStorage.items);
        }
        if(this.filters.rating) {
            filteredData = this.filterByRatingRange(this.filters.rating, filteredData.length > 0 ? filteredData : getDataFromStorage.items);
        }
        if(this.filters.length === 0) {
            filteredData = getDataFromStorage.items;
        }
        return filteredData;
    }

    filtersOnEach() {
        let view = ""
        for(let val in this.filters) {
            if(val !== 'cuisines') {
                view += `<div class="badge" data-filter-id="${val}">${val}:${this.filters[val]}<i class="fa fa-close close-icon-fill"></i></div>`
            } else {
                if(val === 'cuisines') {
                    view += `<div class="badge" data-filter-id="${val}"><span>${val}:</span> ${Object.keys(this.filters[val]).join(',')}<i class="fa fa-close close-icon-fill"></i></div>`
                } else {
                    view += "";
                }
            }
        }
        return view;
    }

    removeFilter(event) {

        if(this.filters[event.target.dataset.filterId]) {
            delete this.filters[event.target.dataset.filterId]
        }
        const filteredData = this.applyFilter()
        this.placeholder.innerHTML = "";
        this.placeholder.innerHTML = this.createContainer(filteredData, "350px", "300px");
        event.target.remove();
        this.renderFilterView();
    }

    renderFilterView() {
        const keys = Object.keys(this.filters).length;
        if(keys > 0) {
            const getfilterView = `<div class="filter-custom-badges">
                <div class="badge"><span>${keys || ''}</span> Filters</div>
                ${this.filtersOnEach()}
            </div>`
            this.filterContainer.innerHTML = getfilterView;
            this.filterContainer.querySelector('.filter-custom-badges').addEventListener('click', this.removeFilter.bind(this))
        } else {
            this.filterContainer.innerHTML = `<button class="filter-btn"><i class="fa fa-filter"></i>Filters</button>`;
            this.filterContainer.querySelector('.filter-btn').addEventListener('click', this.showModal.bind(this));
        }
    }

    handleFilterBtn(event) {
        if(event.target.innerHTML === 'Clear all') {
            this.filters = [];
        } else {
            const filteredData = this.applyFilter()
            this.placeholder.innerHTML = "";
            this.placeholder.innerHTML = this.createContainer(filteredData, "350px", "300px");
            this.hideModal();
            this.renderFilterView();
        }
    }

    hideModal() {
        this.modalContainer.style.display = 'none';
    }

    showModal() {
        this.modalContainer.style.display = 'block';
        this.displaySortView('Sort by');
    }

    attachListener() {
        this.menuPlaceholder = document.querySelector('.menu-placeholder');
        this.bannerPlaceholder = document.querySelector('.banner-placeholder');
        this.placeholder = this.appId.querySelector('.resta-container');
        this.placeholder.addEventListener('click', this.displayMenu.bind(this));
        this.searchId = this.appId.querySelector('#search-input');
        this.searchId.addEventListener('input', this.searchByValidInput.bind(this));
        this.modalContainer = document.querySelector('.modal-container');
        this.modalContainer.querySelector('.close-btn').addEventListener('click', this.hideModal.bind(this));
        this.modalContainer.querySelector('.tablist-box').addEventListener('click', this.handleFilterSection.bind(this));
        this.modalContainer.querySelector('.action-btns').addEventListener('click', this.handleFilterBtn.bind(this));
        this.filterContainer = this.appId.querySelector('.filter-section');
        this.appId.querySelector('.filter-btn').addEventListener('click', this.showModal.bind(this));
    }

    init() {
        this.index = 0;
        this.cart = [];
        this.menu = [];
        this.total = 0;
        this.filters = [];
        this.appId = document.querySelector('.food-ordering-app');
        this.attachListener();
        const getDataFromStorage = this.cache.getData();
        this.getLocation();
        if(getDataFromStorage.length === 0) {
            this.fetchData();
        } else {
            this.renderDataView(getDataFromStorage);
        }
    }
}

const f1 = new OrderFood(new LocalCache(), new API(1), []);
