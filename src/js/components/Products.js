/* eslint-disable indent */
import {
    select,
    classNames,
    templates
} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';


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
        console.log(thisProduct);
       
        // app.cart.add(thisProduct.prepareCartProduct());

        const event = new CustomEvent('add-to-cart', {
            bubbles: true,
            detail: {
                product: thisProduct.prepareCartProduct(),
            },
        });
        thisProduct.element.dispatchEvent(event);
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


export default Product;