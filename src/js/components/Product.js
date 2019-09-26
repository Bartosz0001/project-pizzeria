import {select, templates, classNames} from './settings.js';
import utils from './utils.js';
import AmountWidget from './components/AmountWidget.js';

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
		  //const thisProduct = this;
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
		  //app.cart.add(thisProduct);
		  const event = new CustomEvent('add-to-cart', {
			  bubbles: true,
			  detail: {
				  product: thisProduct,
			  }
		  });
		  
		  thisProduct.element.dispatchEvent(event);
	  }
  }
  
  export default Product;