import {select, templates} from './../settings.js';
import utils from './../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';

class Booking{
    constructor(element){
        const thisBooking = this;

        thisBooking.render(element);
        thisBooking.initWidgets();
    }
    
    render(element){
        const thisBooking = this;
        /* generate HTML */
        const generatedHTML = templates.bookingWidget();
        const generatedDOM = utils.createDOMFromHTML(generatedHTML);
        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.appendChild(generatedDOM);
        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    }

    initWidgets(){
        const thisBooking = this;
        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(select.widgets.datePicker.wrapper);
    }
}

export default Booking;