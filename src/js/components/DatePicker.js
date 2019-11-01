import {settings, select} from './../settings.js';
import BaseWidget from './BaseWidget.js';
import utils from './../utils.js';

class DatePicker extends BaseWidget{
    constructor(wrapper){
        super(wrapper, utils.dateToStr(new Date()));
        const thisWidget = this;

        thisWidget.dom.wrapper = wrapper;
        thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
        thisWidget.initPlugin();
    }

    initPlugin(){
        const thisWidget = this;
        thisWidget.minDate = new Date(thisWidget.value);
        thisWidget.maxDate = new Date(utils.addDays(thisWidget.value, settings.datePicker.maxDaysInFuture));
        const flatpickrOptions = {};
        flatpickrOptions.defaultDate = thisWidget.minDate;
        flatpickrOptions.minDate = thisWidget.minDate;
        flatpickrOptions.maxDate = thisWidget.maxDate;
        flatpickrOptions.locale = {firstDayOfWeek: 1};
        flatpickrOptions.disable = [function(date){
            if(date.getDay() === 0 || date.getDay() === 6){
                return true;
            }
            else{
                return false;
            }
        }];
        flatpickrOptions.onChange = function(dateObj, dateStr, instance){
            thisWidget.value = dateStr;
        }
        flatpickr(thisWidget.dom.input, flatpickrOptions);
    }

    parseValue(value){
        const thisWidget = this;

        return value;
    }

    isValid(value){
        return true;
    }

    renderValue(){
        return true;
    }
}

export default DatePicker;