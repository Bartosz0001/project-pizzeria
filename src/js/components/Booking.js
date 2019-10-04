import {select, templates, settings} from './../settings.js';
import utils from './../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import hourPicker from './HourPicker.js';

class Booking{
    constructor(element){
        const thisBooking = this;

        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
    }

    getData(){
        const thisBooking = this;

        const startDayParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDayParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            booking: [
                startDayParam,
                endDayParam
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDayParam,
                endDayParam
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDayParam
            ],
        };

        const urls = {
            booking:       settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.event   + '?' + params.eventsCurrent.join('&'),
            eventsRepeat:  settings.db.url + '/' + settings.db.event   + '?' + params.eventsRepeat.join('&'),
        };

        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
          .then(function(allResponses){
              const bookingsResponse = allResponses[0];
              const eventsCurrentResponse = allResponses[1];
              const eventsRepeatResponse = allResponses[2];
              return Promise.all([
                  bookingsResponse.json(),
                  eventsCurrentResponse.json(),
                  eventsRepeatResponse.json(),
              ]);
          })
          .then(function([bookings, eventsCurrent, eventsRepeat]){
              console.log('zamowienie', bookings);
              console.log('zamowienie', eventsCurrent);
              console.log('zamowienie', eventsRepeat);
          });
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
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    }

    initWidgets(){
        const thisBooking = this;
        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new hourPicker(thisBooking.dom.hourPicker);
    }
}

export default Booking;