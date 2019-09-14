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
		  });
	  }
	  
	  processOrder(){
		  const thisProduct = this;
		  const formData = utils.serializeFormToObject(thisProduct.form);
		  //console.log('formData', formData);
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
		  price *= thisProduct.amountWidget.value;
		  thisProduct.priceElem.innerHTML = price;
	  }
	  initAmountWidget(){
		  const thisProduct = this;
		  
		  thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
		  thisProduct.amountWidgetElem.addEventListener('updated', function(){
			  thisProduct.processOrder();
		  });
	  }
  }
  
  class AmountWidget{
	  constructor(element){
		  const thisWidget = this;
		  thisWidget.getElements(element);
		  thisWidget.value = settings.amountWidget.defaultValue;
		  thisWidget.setValue(thisWidget.input.value);
		  thisWidget.initActions();
		  
		  console.log('AmountWidget:', thisWidget);
		  console.log('constructor arguments:', element);
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
		  
		  const event = new Event('updated');
		  thisWidget.element.dispatchEvent(event);
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
