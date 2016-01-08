"use strict";

(function() {
    let template = `
        <style>
            @import url('http://fonts.googleapis.com/css?family=Roboto+Condensed:400,300,700');

            .osb-geo-weather-holder h2,
            .osb-geo-weather-holder h3,
            .osb-geo-weather-holder p {
                font-family: 'Roboto Condensed', sans-serif;
            }

            .osb-geo-weather-holder h2 {
                margin-top: 0;
            }

            .osb-geo-weather-holder {
                padding: 10px;
            }

            .osb-geo-weather-holder .today-weather,
            .osb-geo-weather-holder .location
             {
                text-transform: capitalize;
            }
        </style>
        <main class="osb-geo-weather-holder">
            <h2>Local Weather</h2>
            <section>
                <article class="forecast-data">
                    <h3 class="today-weather">
                        <span></span> <i></i> <span class="temp"></span>
                    </h3>
                    <h4 class="today-high-low"><span class="high"></span> | <span class="low"></span></h4>
                    <p class="location">location: <span></span></p>
                </article>
                <article>
                    <h3>Weather Forecast</h3>
                </article>
            </section>
            <section class="weather-loader">
                <i class="icon"></i>
                <p class="message"></p>
            </section>
        </main>
    `;
    class osbGeoWeather extends HTMLElement {
        createdCallback() {
            this.createShadowRoot().innerHTML = template;
            this.googleMapsApiBase = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';
            this.googleMapsApiKey  = 'AIzaSyDI-MPoDrmVJnK2qAYtDZr9aR9pOzHCSiI';
            this.weatherApiBase = 'http://api.openweathermap.org/data/2.5/';
            this.weatherApiKey = '893dd0afe360cf42975f84a9b97cd4ec';
            // Get Selectors
            this.$holder = this.shadowRoot.querySelector('.osb-geo-weather-holder');
            this.$loader = this.shadowRoot.querySelector('.weather-loader');
            this.$todayWeather = this.shadowRoot.querySelector('.today-weather span');
            this.$todayTemp = this.shadowRoot.querySelector('.today-weather .temp');
            this.$location = this.shadowRoot.querySelector('.location span');
            this.getLocation();
        };

        attachedCallback() {

        };

        attributeChangedCallback(attrName, oldVal, newVal) {
            console.log(attrName);
            if (attrName === 'location') {
                this.getTodayWeather(newVal);
            } else if (attrName === 'weather') {
                if (this.getAttribute('show-forecast')) {
                    console.log('show forecast');
                    var location = this.getAttribute('location');
                    this.getWeatherForecast(location);
                }

                var weatherData = JSON.parse(newVal);
                this.updateTemplate(weatherData);
            }
        };

        updateTemplate(data) {
            console.log(data);
            this.$location.innerHTML = data.name;
            this.$todayWeather.innerHTML = data.weather[0].description;
            this.$todayTemp.innerHTML = data.main.temp;
        };

        getLocation() {
            if ('geolocation' in navigator) {
                console.log('Has geolocation');
                // Get Location from Google if available else use default
                var base, apiKey, holder;
                base = this.googleMapsApiBase;
                apiKey = this.googleMapsApiKey;
                holder = this;
                navigator.geolocation.getCurrentPosition(function(position) {
                    fetch(base + position.coords.latitude + ',' + position.coords.longitude + '&key=' + apiKey)
                        .then(function(response) {
                            console.log('Location Success');
                            if (response.status !== 200) {
                                console.log('Looks like there was a problem. Status Code: ' + response.status);
                                return;
                            }
                            response.json().then(function(data) {
                                var location = data.results[0].address_components[3].long_name;
                                return holder.setAttribute('location', location);
                            });
                        })
                        .catch(function(err) {
                            console.log('Failed');
                        });
                });
            } else {
                console.log('No geolocation');
            }
        };

        getTodayWeather(location) {
            console.log('Getting todays weather');
            var holder = this;
            fetch(this.weatherApiBase + 'weather?q=' + location + '&units=metric&APPID=' + this.weatherApiKey)
                .then(function(response) {
                    console.log('Weather Success');
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    response.json().then(function(data) {
                        var weather = JSON.stringify(data);
                        return holder.setAttribute('weather', weather);
                    });
                })
                .catch(function(err) {
                    console.log('Failed');
                });
        };

        getWeatherForecast(location) {
            var holder = this;
            fetch(this.weatherApiBase + 'forecast/daily?q=' + location + '&units=metric&APPID=' + this.weatherApiKey)
                .then(function(response) {
                    console.log('Weather forecast Success');
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    response.json().then(function(data) {
                        var forecast = JSON.stringify(data);
                        return holder.setAttribute('forecast', forecast);
                    });
                })
                .catch(function(err) {
                    console.log('Failed');
                });
        };
    }
    // Register Element
    document.registerElement('osb-geo-weather', osbGeoWeather);
})();