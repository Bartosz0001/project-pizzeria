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

  class Product{
	  constructor(id, data){
		  const thisProduct = this;
		  thisProduct.id = id;
		  thisProduct.data = data;
		  thisProduct.renderInMenu();
		  thisProduct.getElements();
		  thisProduct.initAccordion();
		  thisProduct.initOrderForm();
		  thisProduct.processOrder();
		  console.log('new Product:', thisProduct);
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
		  });
	  }
	  
	  processOrder(){
		  const thisProduct = this;
		  const formData = utils.serializeFormToObject(thisProduct.form);
		  console.log('formData', formData);
		  let price = thisProduct.data.price;
		  if(formData.sauce == 'cream') price += 2;
		  /*const map = new Map(Object.entries(formData));
		  console.log(map);*/ 
		  //alert(formData.toppings);
		  const toppingsArray = formData.toppings;
		  if(toppingsArray){
			  price -= 10;
			  for(let i = 0; i<toppingsArray.length; i++){
				if(toppingsArray[i] == 'olives') price += 2;
			    if(toppingsArray[i] == 'redPeppers') price +=2;
			    if(toppingsArray[i] == 'greenPeppers') price +=2;
			    if(toppingsArray[i] == 'mushrooms') price +=2;
			    if(toppingsArray[i] == 'basil') price +=2;
			    if(toppingsArray[i] == 'salami') price += 3;
			  }
		  }
		  else if(formData.sauce == 'cream' || formData.sauce == 'tomato'){
			  price -= 10;
		  }
		  /*for(let topping of formData.toppings){
			  alert(topping);
		  }*/
		  /*for(let i = 0; i<formData.toppings.length; i++){
			  alert(formData.toppings[i]);
		  }*/
		  thisProduct.priceElem.innerHTML = price;
	  }
  }
  
  const app = {
	initData: function(){
		const thisApp = this;
		thisApp.data = dataSource;
	},
	
	initMenu: function(){
	  const thisApp = this;
	  console.log('thisApp.data:', thisApp.data);
	  for(let productData in thisApp.data.products){
		  new Product(productData, thisApp.data.products[productData]);
	  }
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
    }
  };
  
  app.init();
}
