import BaseWidget from './BaseWidget.js';
import {select, settings} from './../settings.js';
import utils from './../utils.js';

class HourPicker extends BaseWidget{
    constructor(wrapper){
        super(wrapper, settings.hours.open);
        const thisWidget = this;

        thisWidget.dom.wrapper = wrapper;
        thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
        thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);

        const hourOpen = thisWidget.parseValue(settings.hours.open);
        const hourClose = thisWidget.parseValue(settings.hours.close);
        
        rangeSlider.create(thisWidget.dom.input);

        thisWidget.dom.input.addEventListener('input', function(){
            thisWidget.value = thisWidget.dom.input.value;
        });

        thisWidget.value = thisWidget.dom.input.value;
        thisWidget.renderValue();
    }

    parseValue(value){
        return utils.numberToHour(value);
    }

    isValid(value){
        return true;
    }

    renderValue(){
        const thisWidget = this;
        thisWidget.dom.output.innerHTML = thisWidget.value; 
    }
}

export default HourPicker;