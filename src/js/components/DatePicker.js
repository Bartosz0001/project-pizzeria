import {settings, select} from './../settings.js';
import BaseWidget from './BaseWidget.js';
import utils from './../utils.js';
//import flatpickr from "flatpickr";

class DatePicker extends BaseWidget{
    constructor(wrapper){
        super(wrapper, utils.dateToStr(new Date()));
        const thisWidget = this;

        thisWidget.dom.wrapper = wrapper;
        //thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
        thisWidget.initPlugin();
    }

    initPlugin(){
        const thisWidget = this;
        thisWidget.minDate = new Date(thisWidget.value);
        thisWidget.maxDate = new Date(utils.addDays(thisWidget.value, settings.datePicker.maxDaysInFuture));
        //const flatpickr = require("flatpickr");
        const flatpickrOptions = {};
        flatpickrOptions.defaultDate = thisWidget.minDate;
        flatpickrOptions.minDate = thisWidget.minDate;
        flatpickrOptions.maxDate = thisWidget.maxDate;
        flatpickr(thisWidget.dom.input, flatpickrOptions);
    }

    parseValue(value){
        return thisWidget.value;
    }

    isValid(value){
        return true;
    }
}

export default DatePicker;