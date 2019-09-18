/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
	  cartProduct: '#template-cart-product',
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
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
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
	cart: {
	  wrapperActive: 'active',
	},
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
	cart: {
	  defaultDeliveryFee: 20,
	},
	db: {
	  url: '//localhost:3131',
	  product: 'product',
	  order: 'order',
	},
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
	cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product{
	  constructor(id, data){
		  const thisProduct = this;
		  thisProduct.id = id;
		  thisProduct.data = data;
		  thisProduct.renderInMenu();
		  thisProduct.getElements();
		  thisProduct.initAccordion();
		  thisProduct.initOrderForm();
		  thisProduct.initAmountWidget();
		  thisProduct.processOrder();
		  //console.log('new Product:', thisProduct);
	  }
	  
	  renderInMenu(){
		  const thisProduct = this;
		  /* generate HTML based on template */
		  const generatedHTML = templates.menuProduct(thisProduct.data);
		  /* create element using utils.createElementFromHTML */
		  thisProduct.element = utils.createDOMFromHTML(generatedHTML);
		  /* find menu container */
		  const menuContainer = document.querySelector(select.containerOf.menu);
		  /* add element to menu */
		  menuContainer.appendChild(thisProduct.element);
	  }
	  
	  getElements(){
	  const thisProduct = this;

	  thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
	  thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
	  thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
	  thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
	  thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
	  thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
	  thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
	  }
	  
	  initAccordion(){
		  const thisProduct = this;
		  /* find the clickable trigger (the element that should react to clicking) */
		  const articles = document.querySelectorAll('.product');
		  
		  for(let article of articles){
			  const clickableTrigger = article.querySelector('.product__header i');
			  clickableTrigger.addEventListener('click', function(){
				  event.preventDefault();
				  const allActive = document.querySelectorAll('.product.active');
			      //.product && .active
				  /* remove class avtive to the previous articles */
				  for(let active of allActive){
					  //if(!active==article)
					  active.classList.remove('active');
				  }
				  article.classList.add('active');
			  });
		  }
		  
	  }
	  
	  initOrderForm(){
		  const thisProduct = this;
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
			thisProduct.addToCart();
		  });
	  }
	  
	  processOrder(){
		  const thisProduct = this;
		  const formData = utils.serializeFormToObject(thisProduct.form);
		  //console.log('formData', formData);
		  thisProduct.params = {};
		  let price = thisProduct.data.price;
		  //console.log('thisProduct', thisProduct);
		  
		  //console.log(formData);
		  for(let paramId in thisProduct.data.params){
			  const param = thisProduct.data.params[paramId];
			  for(let optionId in param.options){
				  const option = param.options[optionId];
				  let notSelected = true;
				  for(let paramSelected in formData){
					const selected = formData[paramSelected];
					for(let optionSelectedId of selected){
						if(optionId == optionSelectedId){
							if(!thisProduct.params[paramId]){
								thisProduct.params[paramId] = {
									label: param.label,
									options: {},
								};
							}
							thisProduct.params[paramId].options[optionId] = option.label;
							notSelected = false;
							const imageClass = '.product__images .' + paramId + '-' + optionId;
							const image = document.querySelector(imageClass);
							if(image) image.classList.add(classNames.menuProduct.imageVisible);
						} 
						if(optionId == optionSelectedId && !option.default) {
							price += option.price;
						}
					}
				  } 
				  if(notSelected == true && option.default) price -= option.price;  
				  if(notSelected == true){
					  const imageClass = '.product__images .' + paramId + '-' + optionId;
					  const image = document.querySelector(imageClass);
					  if(image) image.classList.remove(classNames.menuProduct.imageVisible);
				  }
			  }
		  }
		  thisProduct.priceSingle = price;
		  thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
		  thisProduct.priceElem.innerHTML = thisProduct.price;
	  }
	  initAmountWidget(){
		  const thisProduct = this;
		  
		  thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
		  thisProduct.amountWidgetElem.addEventListener('updated', function(){
			  thisProduct.processOrder();
		  });
	  }
	  
	  addToCart(){
		  const thisProduct = this;
		  thisProduct.name = thisProduct.data.name;
		  thisProduct.amount = thisProduct.amountWidget.value;
		  app.cart.add(thisProduct);
	  }
  }
  
  class AmountWidget{
	  constructor(element){
		  const thisWidget = this;
		  thisWidget.getElements(element);
		  thisWidget.value = settings.amountWidget.defaultValue;
		  thisWidget.setValue(thisWidget.input.value);
		  thisWidget.initActions();
		  
		  //console.log('AmountWidget:', thisWidget);
		  //console.log('constructor arguments:', element);
	  }
	  
	  getElements(element){
		  const thisWidget = this;

		  thisWidget.element = element;
		  thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
		  thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
		  thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
	  }
	  
	  setValue(value){
		  const thisWidget = this;
		  const newValue = parseInt(value);
		  if(newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
			thisWidget.value = newValue;
			thisWidget.announce();
		  }
		  thisWidget.input.value = thisWidget.value;
	  }
	  
	  initActions(){
		  const thisWidget = this;
		  
		  thisWidget.input.addEventListener('change', function(){
			  thisWidget.setValue(thisWidget.input.value);
		  });
		  
		  thisWidget.linkDecrease.addEventListener('click', function(){
			  event.preventDefault();
			  thisWidget.setValue(thisWidget.value - 1);
		  });
		  
		  thisWidget.linkIncrease.addEventListener('click', function(){
			  event.preventDefault();
			  thisWidget.setValue(thisWidget.value + 1);
		  });
	  }
	  
	  announce(){
		  const thisWidget = this;
		  
		  //const event = new Event('updated');
		  const event = new CustomEvent('updated', {
			  bubbles: true 
		  });
		  thisWidget.element.dispatchEvent(event);
	  }
  }
  
  class Cart{
	  constructor(element){ //#cart
		  const thisCart = this;
		  thisCart.products = [];
		  thisCart.getElements(element);
		  thisCart.initActions();
		  thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
		  //console.log('new Cart', thisCart);
	  }
	  
	  getElements(element){
		  const thisCart = this;
		  thisCart.dom = {};
		  thisCart.dom.wrapper = element;
		  thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
		  thisCart.dom.productList = document.querySelector(select.containerOf.cart);
		  
		  thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

		  for(let key of thisCart.renderTotalsKeys){
			thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
		  }
		  
		  thisCart.dom.form = document.querySelector(select.cart.form);
		  thisCart.dom.phone = document.querySelector(select.cart.phone);
		  thisCart.dom.address = document.querySelector(select.cart.address);
	  }
	  
	  initActions(){
		  const thisCart = this;
		  thisCart.dom.toggleTrigger.addEventListener('click', function(){
			  thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
		  });
		  thisCart.dom.productList.addEventListener('updated', function(){
			  thisCart.update();
		  });
		  thisCart.dom.productList.addEventListener('remove', function(){
			  thisCart.remove(event.detail.cartProduct);
		  });
		  thisCart.dom.form.addEventListener('submit', function(){
			  event.preventDefault();
			  thisCart.sendOrder();
		  });
	  }
	  
	  sendOrder(){
		  const thisCart = this;
		  const url = settings.db.url + '/' + settings.db.order;
		  const payload = {
			  address: thisCart.dom.address.value,
			  totalPrice: thisCart.totalPrice,
			  phone: thisCart.dom.phone.value,
			  totalNumber: thisCart.totalNumber,
			  subtotalPrice: thisCart.subtotalPrice,
			  deliveryFee: thisCart.deliveryFee,
			  products: [],
		  };
		  
		  for(let product of thisCart.products){
			  const data = product.getData();
			  payload.products.push(data);
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
	  
	  add(menuProduct){
		  const thisCart = this;
		  
		  console.log('adding product', menuProduct);
		  
		  const generatedHTML = templates.cartProduct(menuProduct);
		  const generatedDOM = utils.createDOMFromHTML(generatedHTML);
		  thisCart.dom.productList.appendChild(generatedDOM);
		  thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
		  thisCart.update();
		  //console.log('thisCart.products', thisCart.products);
	  }
	  
	  update(){
		  const thisCart = this;
		  thisCart.totalNumber = 0;
		  thisCart.subtotalPrice = 0;
		  
		  for(let product of thisCart.products){
			  thisCart.subtotalPrice += product.price;
			  thisCart.totalNumber += product.amount;
		  }
		  
		  thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
		  console.log('totalNumber, subtotalPrice, thisCart.totalPrice', thisCart.totalNumber, ' ', thisCart.subtotalPrice, ' ', thisCart.totalPrice);
		  
		  for(let key of thisCart.renderTotalsKeys){
			  for(let elem of thisCart.dom[key]){
				  elem.innerHTML = thisCart[key];
			  }
		  }
		  
		  console.log('thisCart.products[]', thisCart.products);
	  }
	  
	  remove(cartProduct){
		  const thisCart = this;
		  const index = thisCart.products.indexOf(cartProduct);
		  alert(index);
		  thisCart.products.splice(index, 1);
		  cartProduct.dom.wrapper.remove();
		  thisCart.update();
	  }
  }
  
  class CartProduct{
	  constructor(menuProduct, element){
		  const thisCartProduct = this;
		  thisCartProduct.id = menuProduct.id;
		  thisCartProduct.name = menuProduct.name;
		  thisCartProduct.price = menuProduct.price;
		  thisCartProduct.priceSingle = menuProduct.priceSingle;
		  thisCartProduct.amount = menuProduct.amount;
		  thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
		  thisCartProduct.getElements(element);
		  thisCartProduct.initAmountWidget();
		  thisCartProduct.initActions();
		  console.log('thisCartProduct', thisCartProduct);
	  }
	  
	  getElements(element){
		  const thisCartProduct = this;
		  thisCartProduct.dom = {};
		  thisCartProduct.dom.wrapper = element;
		  thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
		  thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
		  thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
		  thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
	  }
	  
	  initAmountWidget(){
		  const thisCartProduct = this;
		  
		  thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
		  thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
			  thisCartProduct.amount = thisCartProduct.amountWidget.value;
			  thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;  
			  thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
		  });
	  }
	  
	  remove(){
		  const thisCartProduct = this;
		  const event = new CustomEvent('remove', {
			  bubbles: true,
			  detail: {
				  cartProduct: thisCartProduct,
			  },
		  });
		  
		  thisCartProduct.dom.wrapper.dispatchEvent(event);
	  }
	  
	  initActions(){
		  const thisCartProduct = this;
		  thisCartProduct.dom.edit.addEventListener('click', function(){
			  event.preventDefault();
		  });
		  thisCartProduct.dom.remove.addEventListener('click', function(){
			  event.preventDefault();
			  thisCartProduct.remove();
		  });
	  }
	  
	  getData(){
		  const thisCartProduct = this;
		  const product = {
			  id: thisCartProduct.id,
			  amount: thisCartProduct.amount,
			  price: thisCartProduct.price,
			  priceSingle: thisCartProduct.priceSingle,
			  params: thisCartProduct.params,
		  };
		  return product;
	  }
  }
  
  const app = {
	initData: function(){
		const thisApp = this;
		thisApp.data = {};
		const url = settings.db.url + '/' + settings.db.product;
		fetch(url)
			.then(function(rawResponse){
				return rawResponse.json();
			})
			.then(function(parsedResponse){
				console.log('parsedResponse', parsedResponse);
				thisApp.data.products = parsedResponse;
				thisApp.initMenu();
			});
		console.log('thisApp.data', JSON.stringify(thisApp.data));
	},
	
	initMenu: function(){
	  const thisApp = this;
	  //console.log('thisApp.data:', thisApp.data);
	  for(let productData in thisApp.data.products){
		  new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
	  }
	},
	
	initCart: function(){
		const thisApp = this;
		const cartElem = document.querySelector(select.containerOf.cart);
		thisApp.cart = new Cart(cartElem);
	},
	
    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);
	  
	  thisApp.initData();
	  thisApp.initCart();
    }
  };
  
  app.init();
}
