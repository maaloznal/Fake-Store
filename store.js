document.addEventListener('DOMContentLoaded', function () {
  const categorySelect = document.getElementById('category-select');
  const limitInput = document.getElementById('limit-input');
  const filterBtn = document.getElementById('filter-btn');
  const productsCountainer = document.getElementById('products-container');
  const myCard = document.querySelector('.my-card');
  const myProduct = document.querySelector('.my-product');
  const burgerMenu = document.querySelector('#burger-menu');
  const productMenu = document.querySelector('#product-menu');
  const moreBtn = document.querySelector('.more-btn');

  let addProductSiteBtn = document.querySelector('.add-products-site-btn');
  let addProductSite = document.querySelector('.add-products-site');

  let adminPanel = document.createElement('div');
  adminPanel.classList.add('admin-panel');
  addProductSite.appendChild(adminPanel);
  adminPanel.innerHTML = `
      <button class="closed-admin-panel">Закрыть</button>
      <form class="my-inputs">
        <label for="img-upload">Выберите изображение:</label>
        <input type="file" class="img-upload" name="file-upload" />
        <label for="title">Название товара</label>
        <input type="text" name="title" class="title-product" placeholder="Введите название" />
        <label for="category-product">Категория товара</label>
        <select name="category-product" id="category-product" class="category-product">
          <option value="">Выберите категорию</option>
          <option value="all">All</option>
          <option value="tv">Tv</option>
          <option value="audio">Audio</option>
          <option value="laptop">Laptop</option>
          <option value="mobile">Mobile</option>
          <option value="gaming">Gaming</option>
          <option value="appliances">Appliances</option>
        </select>
        <label for="price-product">Укажите цену</label>
        <input type="number" class="price-product">
        <label for="description-product">Добавьте описание</label>
        <input type="text" name="description-product" class="description-product" placeholder="Добавьте описание">
        <button class="button-add-product">Добавить товар</button>
      </form>
    `;

  let closedAdminPanel = document.querySelector('.closed-admin-panel');
  closedAdminPanel.addEventListener('click', toggleStyleAdminPanel);

  addProductSiteBtn.addEventListener('click', () => {
    toggleStyleAdminPanel();
    console.log('нажал');
  });

  function toggleStyleAdminPanel() {
    if (
      adminPanel.style.display === 'none' ||
      adminPanel.style.display === ''
    ) {
      adminPanel.style.display = 'flex';
    } else {
      adminPanel.style.display = 'none';
    }
  }

  const imgUpload = document.querySelector('.img-upload');
  let selectedImage = null;

  imgUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImage = e.target.result;
        const imgPreview = document.createElement('img');
        imgPreview.src = selectedImage;
        imgPreview.classList.add('img-preview');
        adminPanel.appendChild(imgPreview);
      };
      reader.readAsDataURL(file);
    }
  });

  const buttonAddProduct = document.querySelector('.button-add-product');
  buttonAddProduct.addEventListener('click', async (event) => {
    event.preventDefault();
    await eventButtonAddProduct();
    toggleStyleAdminPanel();
  });

  async function eventButtonAddProduct() {
    const titleProduct = document.querySelector('.title-product');
    const categoryProduct = document.querySelector('.category-product');
    const priceProduct = document.querySelector('.price-product');
    const descriptionProduct = document.querySelector('.description-product');

    const eventTitleProduct = titleProduct.value;
    const eventCategoryProduct = categoryProduct.value;
    const eventPriceProduct = parseFloat(priceProduct.value);
    const eventDescriptionProduct = descriptionProduct.value;

    console.log('Название:', eventTitleProduct);
    console.log('Категория:', eventCategoryProduct);
    console.log('Цена:', eventPriceProduct);
    console.log('Описание:', eventDescriptionProduct);

    if (
      !eventTitleProduct ||
      !eventCategoryProduct ||
      isNaN(eventPriceProduct) ||
      !eventDescriptionProduct
    ) {
      alert(
        'Пожалуйста, заполните все обязательные поля и выберите изображение.',
      );
      return;
    }

    try {
      const productData = await postProduct(
        eventTitleProduct,
        eventCategoryProduct,
        eventPriceProduct.toString(),
        eventDescriptionProduct,
      );

      console.log('Полученные данные о товаре:', productData);

      productData.image = selectedImage;
      displayProducts([productData]);

      titleProduct.value = '';
      categoryProduct.value = '';
      priceProduct.value = '';
      descriptionProduct.value = '';
      imgUpload.value = '';
      selectedImage = null;

      const imgPreview = adminPanel.querySelector('.img-preview');
      if (imgPreview) {
        adminPanel.removeChild(imgPreview);
      }
    } catch (error) {
      console.error('Ошибка при обработке товара:', error);
    }
  }

  async function postProduct(title, category, price, description) {
    try {
      const response = await fetch('https://fakestoreapi.in/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          price: price,
          category: category,
          description: description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Ошибка HTTP! статус: ${response.status}, сообщение: ${JSON.stringify(
            errorData,
          )}`,
        );
      }

      const data = await response.json();
      console.log('Данные, полученные с сервера:', data);
      alert('Товар успешно добавлен на сервер');
      return data.product;
    } catch (error) {
      console.error('Ошибка при добавлении товара:', error);
      throw error;
    }
  }

  function displayProducts(products) {
    products.forEach((product) => {
      const card = document.createElement('div');
      card.classList.add('product-card');
      card.innerHTML = `
          <div class="deleted-card-product"><button class="deleted-product" data-product-id="${
            product.id
          }">Удалить</button></div>
          <img src="${product.image}" alt="${product.title}">
          <h3 class="title-card">${product.title}</h3>
          <p>Цена: ${product.price} $</p>
          <p class="category-card">Категория: ${product.category}</p>
          <p class="description-card">Описание: ${product.description}</p>
          <button class="pay" data-product='${JSON.stringify(product).replace(
            /'/g,
            '&apos;',
          )}'>В корзину</button>`;
      productsCountainer.appendChild(card);
    });
    addPayButtonListeners();
    addDeletedProductListeners();
    scrollToLastBook();

    const titleElements = document.querySelectorAll('.title-card');
    const descriptionElements = document.querySelectorAll('.description-card');

    titleElements.forEach((element) => {
      truncateText(element, 20);
    });

    descriptionElements.forEach((element) => {
      truncateText(element, 50);
    });
  }

  function addDeletedProductListeners() {
    const deletedProducts = document.querySelectorAll('.deleted-product');
    deletedProducts.forEach((button) => {
      button.addEventListener('click', async (event) => {
        const productId = event.target.getAttribute('data-product-id');
        if (productId) {
          try {
            await deleteProduct(productId);
            event.target.closest('.product-card').remove();
          } catch (error) {
            console.error('Ошибка при удалении товара:', error);
          }
        } else {
          console.error('Идентификатор товара не найден');
        }
      });
    });
  }

  async function deleteProduct(productId) {
    try {
      const response = await fetch(
        `https://fakestoreapi.in/api/products/${productId}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error(`Ошибка HTTP! статус: ${response.status}`);
      }

      const data = await response.json();
      console.log('Товар удален:', data);
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      throw error;
    }
  }

  function addPayButtonListeners() {
    const payButtons = document.querySelectorAll('.pay');
    payButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const product = JSON.parse(button.getAttribute('data-product'));
        const addCard = document.createElement('div');
        addCard.classList.add('add-card');
        addCard.innerHTML = `<img src="${product.image}" alt="${
          product.title
        }"> 
            <h5>${product.title}</h5>
            <p>Цена: ${product.price} $</p>
            <button class="deleted-card-btn">Удалить</button> 
            <button class="pay-card-btn" data-product='${JSON.stringify(
              product,
            ).replace(/'/g, '&apos;')}'>Купить</button>`;
        myCard.appendChild(addCard);
        updateMessagesInMyCard();
        deletedCardButton(addCard.querySelector('.deleted-card-btn'));
        addPayButtonEvent(addCard.querySelector('.pay-card-btn'));
        saveCart();
      });
    });
  }

  let currentPage = 1;
  const itemsPerPage = 5;
  let currentCategory = '';

  loadCart();
  loadPurchases();

  const myMessageCard = document.createElement('span');
  myMessageCard.classList.add('message-card');
  myMessageCard.textContent = 'Ваша корзина пуста';
  myCard.appendChild(myMessageCard);

  const myMessageProduct = document.createElement('span');
  myMessageProduct.classList.add('message-product');
  myMessageProduct.textContent = 'У вас нет покупок';
  myProduct.appendChild(myMessageProduct);

  function updateMessagesInMyCard() {
    myMessageCard.style.display = myCard.querySelector('.add-card')
      ? 'none'
      : 'block';
  }

  function updateMessagesInMyProduct() {
    myMessageProduct.style.display = myProduct.querySelector('.add-product')
      ? 'none'
      : 'block';
  }

  updateMessagesInMyProduct();
  updateMessagesInMyCard();

  function saveCart() {
    const cartItems = Array.from(myCard.children).map((item) => item.outerHTML);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }

  function savePurchases() {
    const purchasedItems = Array.from(myProduct.children).map(
      (item) => item.outerHTML,
    );
    localStorage.setItem('purchasedItems', JSON.stringify(purchasedItems));
  }

  function loadCart() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    myCard.innerHTML = cartItems.join('');
    document
      .querySelectorAll('.deleted-card-btn')
      .forEach((button) => deletedCardButton(button));
    document
      .querySelectorAll('.pay-card-btn')
      .forEach((button) => addPayButtonEvent(button));
  }

  function loadPurchases() {
    const purchasedItems = JSON.parse(
      localStorage.getItem('purchasedItems') || '[]',
    );
    myProduct.innerHTML = purchasedItems.join('');
    document
      .querySelectorAll('.deleted-product-btn')
      .forEach((button) => deletedProductButton(button));
  }

  function toggleStyle(myCard, productsCountainer) {
    if (myCard.style.display === 'none' || myCard.style.display === '') {
      myCard.style.display = 'flex';
      productsCountainer.style.margin = '0';
    } else {
      myCard.style.display = 'none';
      productsCountainer.style.margin = '0 auto';
    }
  }

  burgerMenu.addEventListener('click', () => {
    toggleStyle(myCard, productsCountainer);
  });

  function toggleStyleProductMenu(myProduct, productsCountainer) {
    if (myProduct.style.display === 'none' || myProduct.style.display === '') {
      myProduct.style.display = 'flex';
      productsCountainer.style.margin = '0 0px 0 auto';
    } else {
      myProduct.style.display = 'none';
      productsCountainer.style.margin = '0 auto';
    }
  }

  productMenu.addEventListener('click', () => {
    toggleStyleProductMenu(myProduct, productsCountainer);
  });

  const savedCategory = localStorage.getItem('selectedCategory');
  const savedLimit = localStorage.getItem('limit');

  if (savedLimit) {
    limitInput.value = savedLimit;
  }

  async function getCategories() {
    try {
      const response = await fetch(
        'https://fakestoreapi.in/api/products/category',
      );
      if (!response.ok) {
        throw new Error('Ошибка сети: ' + response.statusText);
      }
      const data = await response.json();
      console.log('Полученные категории:', data);
      if (Array.isArray(data.categories)) {
        renderCategories(data.categories);
      } else {
        console.error(
          'Ожидался массив категорий, но получен другой тип данных:',
          data,
        );
      }
    } catch (error) {
      console.log('Ошибка при получении категорий: ' + error);
    }
  }

  function renderCategories(categories) {
    categorySelect.innerHTML = '';
    categorySelect.innerHTML += `<option value="">All</option>`;
    categories.forEach((category) => {
      categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
    });
    if (savedCategory) {
      categorySelect.value = savedCategory;
    }
  }
  getCategories();

  filterBtn.addEventListener('click', () => {
    const selectedCategory = categorySelect.value;
    const limit = limitInput.value;

    localStorage.setItem('selectedCategory', selectedCategory);
    localStorage.setItem('limit', limit);
    currentCategory = selectedCategory;
    currentPage = 1;
    fetchProducts(selectedCategory, limit);
  });

  async function fetchProducts(category, limit) {
    let apiUrl = 'https://fakestoreapi.in/api/products';
    if (category && category !== 'All') {
      apiUrl += `/category?type=${category}`;
    }
    if (limit) {
      apiUrl += `${category ? '&' : '?'}limit=${limit}`;
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Ошибка сети: ' + response.statusText);
      }
      const data = await response.json();
      console.log('Полученные продукты:', data);
      if (Array.isArray(data.products)) {
        productsCountainer.innerHTML = '';
        displayProducts(data.products);
      } else {
        console.error(
          'Ожидался массив продуктов, но получен другой тип данных:',
          data,
        );
      }
    } catch (error) {
      console.log('Ошибка: ' + error);
    }
  }

  moreBtn.addEventListener('click', () => {
    scrollToLastBook();
    async function pagination() {
      let apiUrl = `https://fakestoreapi.in/api/products?limit=${itemsPerPage}&page=${currentPage}`;
      if (currentCategory && currentCategory !== 'All') {
        apiUrl = `https://fakestoreapi.in/api/products/category?type=${currentCategory}&limit=${itemsPerPage}&page=${currentPage}`;
      }

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (Array.isArray(data.products)) {
          displayProducts(data.products);
        } else {
          console.error(
            'Ожидался массив продуктов, но получен другой тип данных:',
            data,
          );
        }

        currentPage++;
      } catch (error) {
        console.log('Ошибка: ' + error);
      }
    }

    pagination();
  });

  function deletedCardButton(button) {
    button.addEventListener('click', () => {
      const addCard = button.closest('.add-card');
      addCard.remove();
      saveCart();
      updateMessagesInMyCard();
    });
  }

  function addPayButtonEvent(button) {
    button.addEventListener('click', () => {
      const product = JSON.parse(button.getAttribute('data-product'));
      const addProduct = document.createElement('div');
      addProduct.classList.add('add-product');
      addProduct.innerHTML = `<img src="${product.image}" alt="${product.title}"> 
        <h5>${product.title}</h5>
        <p>Цена: ${product.price} $</p>
        <button class="deleted-product-btn">Удалить</button>`;
      myProduct.appendChild(addProduct);
      updateMessagesInMyProduct();
      deletedProductButton(addProduct.querySelector('.deleted-product-btn'));
      savePurchases();
    });
  }

  function deletedProductButton(button) {
    button.addEventListener('click', () => {
      const addProduct = button.closest('.add-product');
      addProduct.remove();
      savePurchases();
      updateMessagesInMyProduct();
    });
  }

  fetchProducts(savedCategory, savedLimit || 6);
  function truncateText(element, maxLength) {
    const text = element.textContent;
    if (text.length > maxLength) {
      const truncatedText = text.substring(0, maxLength) + '...';
      const fullText = text;
      element.textContent = truncatedText;

      let toggleButton = element.nextElementSibling;
      if (
        !toggleButton ||
        !toggleButton.classList.contains('toggle-text-button')
      ) {
        toggleButton = document.createElement('button');
        toggleButton.textContent = 'Показать больше';
        toggleButton.classList.add('toggle-text-button');
        element.parentNode.insertBefore(toggleButton, element.nextSibling);
      }

      toggleButton.addEventListener('click', () => {
        if (element.textContent === truncatedText) {
          element.textContent = fullText;
          toggleButton.textContent = 'Скрыть';
        } else {
          element.textContent = truncatedText;
          toggleButton.textContent = 'Показать больше';
        }
      });
    }
  }

  function scrollToLastBook() {
    const lastBook = productsCountainer.lastElementChild;
    if (lastBook) {
      lastBook.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  }
});
