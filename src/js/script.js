/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data= data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();

      

      console.log('new Product:', thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;
      
      const generatedHTML = templates.menuProduct(thisProduct.data);

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      const menuContainer = document.querySelector(select.containerOf.menu);

      menuContainer.appendChild(thisProduct.element);
      console.log(thisProduct.element);
    }


    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      console.log(thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    }


    initAccordion() {
      const thisProduct = this;

      

      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        console.log('clicked');
        event.preventDefault();
        const activeProduct = document.querySelector(classNames.menuProduct.wrapperActive);
        if (!activeProduct == 0 & activeProduct != thisProduct.element) {
          thisProduct.element.classList.remove(classNames.menuProduct.wrapperActive);
        }
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        console.log(thisProduct.element);
        

      });
      
    }

    initOrderForm() {
      const thisProduct = this;
      console.log(this.initOrderForm);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this;
      console.log(this.processOrder);
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          console.log(optionId, option);

          const imageForOption = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          if(imageForOption){
            if(formData[paramId] && formData[paramId].includes(optionId)) {
              imageForOption.classList.add(classNames.menuProduct.imageVisible);
            }
            else{
              imageForOption.classList.remove(classNames.menuProduct.imageVisible);
            }
          }

          // check if there is param with a name of paramId in formData and if it includes optionId
          if(formData[paramId] && formData[paramId].includes(optionId)) {
          // check if the option is not default
            if(!option.default) {
              price = price + option.price;
              // add option price to price variable
            }
          } else {
          // check if the option is default
            if(option.default) {
            // reduce price variable
              price = price - option.price;
            }
          }
          // update calculated price in the HTML
          thisProduct.priceElem.innerHTML = price;         
        }
      }  
    }
  }



  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);
      for(let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
      const testProducts = new Product();
      console.log('testProduct:', testProducts);

    },
    initData: function() {
      const thisApp = this;

      thisApp.data = dataSource;

    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
