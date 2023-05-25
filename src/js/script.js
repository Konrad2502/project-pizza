/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
 
{
  ('use strict');
 
  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
 
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
 
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };
 
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };
 
  class Product {
    constructor(id, data) {
      const thisProduct = this;
 
      thisProduct.id = id;
      thisProduct.data = data;
 
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      // thisProduct.prepareCartProduct();
    }
 
    renderInMenu() {
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data);
 
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
 
      const menuContainer = document.querySelector(select.containerOf.menu);
 
      menuContainer.appendChild(thisProduct.element);
    }
 
    getElements() {
      const thisProduct = this;
 
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
 
    initAccordion() {
      const thisProduct = this;
 
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        event.preventDefault();
       
        const activeProduct = document.querySelector('.product.active');
        

        console.log(thisProduct.element);
        console.log(activeProduct);
        if (activeProduct && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }
 
    initOrderForm() {
      const thisProduct = this;
 
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
 
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }
 
      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
        // thisProduct.productSummary();
      });
    }
 
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
 
      thisProduct.amountWidgetElem.addEventListener('updated', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
 
    addToCart() {
      const thisProduct = this;
 
      app.cart.add(thisProduct.prepareCartProduct());
    }
 
    prepareCartProduct() {
      const thisProduct = this;
 
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;
    }
 
    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
 
      // for very category (param)
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
 
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {},
        };
 
        // for every option in this category
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
 
          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
 
    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
 
      // set price to default price
      let price = thisProduct.data.price;
 
      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
 
        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
 
          const imageForOption = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          if (imageForOption) {
            if (formData[paramId] && formData[paramId].includes(optionId)) {
              imageForOption.classList.add(classNames.menuProduct.imageVisible);
            } else {
              imageForOption.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
 
          // check if there is param with a name of paramId in formData and if it includes optionId
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            // check if the option is not default
            if (!option.default) {
              price = price + option.price;
              // add option price to price variable
            }
          } else {
            // check if the option is default
            if (option.default) {
              // reduce price variable
              price = price - option.price;
            }
          }
        }
      }
      // update calculated price in the HTML
     
      thisProduct.priceSingle = price;
     
      thisProduct.priceElem.innerHTML = price *= thisProduct.amountWidget.value;
      // -------
    }
  }
 
  class AmountWidget {
    constructor(element, value = 1) {
      const thisWidget = this;
 
      thisWidget.getElements(element);
      thisWidget.setValue(value);
      thisWidget.initActions();
    }
 
    getElements(element) {
      const thisWidget = this;
 
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
 
    setValue(value) {
      const thisWidget = this;
 
      const newValue = parseInt(value);
      /*TODO: Add validation */
      if (thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
      }
      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }
 
    initActions() {
      const thisWidget = this;
 
      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
 
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
 
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
 
    announce() {
      const thisWidget = this;
 
      const event = new CustomEvent('updated', {
        bubbles: true,
      });
      thisWidget.element.dispatchEvent(event);
    }
  }
 
  class Cart {
    constructor(element) {
      const thisCart = this;
 
      thisCart.products = [];
    
 
      thisCart.getElements(element);
      thisCart.initActions();
      thisCart.sendOrder();
    
    }
    getElements(element) {
      const thisCart = this;
 
      thisCart.dom = {};
 
      thisCart.dom.wrapper = element;
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      
    }
 
    initActions() {
      const thisCart = this;
 
      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function (e) {
        thisCart.remove(e.detail.cartProduct);
      });
      thisCart.dom.form.addEventListener('submit', function (e) {
        e.preventDefault();
        thisCart.sendOrder();
      });
    }
    sendOrder() {
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;
      
      

      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice:  thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: []
      };
      console.log(payload);

      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      
      fetch(url, options)
        .then(function(response){
          return response.json();
        }).then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);
        });
    }
    

    add(menuProduct) {
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
 
      thisCart.element = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(thisCart.element);
      thisCart.products.push(new CartProduct(menuProduct, this.element));
      this.update();
    }
 
    remove(cartProduct) {
      cartProduct.dom.wrapper.remove();
      const indexOfProduct = this.products.indexOf(cartProduct);
      this.products.splice(indexOfProduct, 1);
      this.update();
    }
 
    update() {
      const thisCart = this;
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      for (const product of thisCart.products) {
        thisCart.totalNumber += 1;
        thisCart.subtotalPrice += product.price;
      }
      if (thisCart.totalNumber) {
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      } else {
        thisCart.totalPrice = thisCart.subtotalPrice;
        thisCart.deliveryFee = 0;
      }
      console.log(thisCart.dom.totalPrice);
      // Aktualizacja cen
      thisCart.dom.totalNumber.textContent = thisCart.totalNumber;
      thisCart.dom.totalPrice.forEach((el) => (el.textContent = thisCart.totalPrice));
      thisCart.dom.subtotalPrice.textContent = thisCart.subtotalPrice;
      thisCart.dom.deliveryFee.textContent = thisCart.deliveryFee;
    }
  }
 
  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;
      const { amount, id, name, params, price, priceSingle } = menuProduct;
      thisCartProduct.amount = amount;
      thisCartProduct.id = id;
      thisCartProduct.name = name;
      thisCartProduct.params = params;
      thisCartProduct.price = price;
      thisCartProduct.priceSingle = priceSingle;
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
      thisCartProduct.getData();
    }
 
    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }
 
    initAmountWidget() {
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget, thisCartProduct.amount);
 
      thisCartProduct.dom.amountWidget.addEventListener('updated', function (event) {
        event.preventDefault();
        // Aktualizacja ceny
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amountWidget.value;
        thisCartProduct.dom.price.textContent = thisCartProduct.price;
        // Aktualizacja inputa
        thisCartProduct.amountWidget.input.value = thisCartProduct.amountWidget.value;
      });
    }
 
    initActions() {
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function (e) {
        e.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function (e) {
        e.preventDefault();
        thisCartProduct.remove();
      });
    }
 
    remove() {
      const thisCartProduct = this;
 
      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
 
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    getData() {
      const thisCartProduct = this;
  
      const data = {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        name: thisCartProduct.name,
        params: thisCartProduct.params,
      };
      console.log(data);
      return data;
    }
  }
 
  const app = {
    initMenu: function () {
      const thisApp = this;
      for (let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },
 
    initData: function () {
      const thisApp = this;
 
      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;
      fetch(url)
        .then(function(rawResponse) {
          return rawResponse.json();
        })
        .then(function(parsedResponse) {
          thisApp.data.products = parsedResponse;
          console.log('parsedResponse', parsedResponse);
          
          thisApp.initMenu();
        });
      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },
 
    init: function () {
      const thisApp = this;
      thisApp.initData();
      
      thisApp.initCart();
    },
    initCart: function () {
      const thisApp = this;
 
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };
 
  app.init();
}