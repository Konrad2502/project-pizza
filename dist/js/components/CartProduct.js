import {
  select
} from './settings.js';
import AmountWidget from './components/AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    const {
      amount,
      id,
      name,
      params,
      price,
      priceSingle
    } = menuProduct;
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

export default CartProduct;