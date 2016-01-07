"use strict";

(function() {
    let template = `
        <style>
            @import url('http://fonts.googleapis.com/css?family=Roboto+Condensed:400,300,700');

            h2, h3 {
                font-family: 'Roboto Condensed', sans-serif;
            }
        </style>
        <section class="osb-geo-weather-holder">
            <h2>Local Weather</h2>
            <article>

            </article>
            <h3>Weather Forecast</h3>
        </section>
        <section class="weather-loader">
            <i class="icon"></i>
            <p class="message"></p>
        </section>
    `;
    class osbGeoWeather extends HTMLElement {
        createdCallback() {
            this.createShadowRoot().innerHTML = template;
            this.weatherApiBase = 'http://api.openweathermap.org/data/2.5/';
            this.weatherApiKey = '893dd0afe360cf42975f84a9b97cd4ec';
            this.googleMapsApiKey  = 'AIzaSyDI-MPoDrmVJnK2qAYtDZr9aR9pOzHCSiI';
            // Get Selectors
            this.$holder = this.shadowRoot.querySelector('.osb-geo-weather-holder');
            this.$loader = this.shadowRoot.querySelector('.weather-loader');
            this.getLocation();
            //this.getTodayWeather();
        };

        attachedCallback() {

        };

        attributeChangedCallback(attrName, oldVal, newVal) {

        };

        getLocation() {
            if ('geolocation' in navigator) {
                console.log('Has geolocation');
            } else {
                console.log('No geolocation');
            }
        };

        getTodayWeather() {
            fetch(this.weatherApiBase + '&units=metric&APPID=' + this.weatherApiKey)
                .then(function(data) {
                    console.log('Success');
                })
                .catch(function(data) {
                    console.log('Failed');
                });
        };
    }
    // Register Element
    document.registerElement('osb-geo-weather', osbGeoWeather);
})();