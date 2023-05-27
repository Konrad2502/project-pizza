/* eslint-disable indent */
import {
    select,
    classNames,
    settings,
    templates
} from './settings.js';
import {utils} from './utils.js';
import CartProduct from './components/CartProduct.js';

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
            subtotalPrice: thisCart.subtotalPrice,
            totalNumber: thisCart.totalNumber,
            deliveryFee: thisCart.deliveryFee,
            products: []
        };
        console.log(payload);

        for (let prod of thisCart.products) {
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
            .then(function (response) {
                return response.json();
            }).then(function (parsedResponse) {
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

export default Cart;