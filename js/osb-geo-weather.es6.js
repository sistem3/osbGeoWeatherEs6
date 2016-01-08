"use strict";

(function() {
    let template = `
        <style>
            @import url('https://fonts.googleapis.com/css?family=Roboto:400,300');
            @import url('https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css');
            @import url('/bower_components/weather-icons/css/weather-icons.css');

            @import url('/css/osb-geo-weather.css');
        </style>
        <main class="osb-geo-weather-holder">
            <h2>Local Weather <i class="fa fa-refresh"></i></h2>
            <section class="weather">
                <article class="forecast-data">
                    <h3 class="today-weather">
                        <span></span> <i></i> <span class="temp"></span><sup>&deg;</sup>
                    </h3>
                    <h4 class="today-high-low">
                        <i class="fa fa-chevron-up"></i> High: <span class="high"></span><sup>&deg;</sup> |
                        <i class="fa fa-chevron-down"></i> Low: <span class="low"></span><sup>&deg;</sup>
                    </h4>
                    <p class="location">Location <i class="fa fa-map-marker"></i>: <span></span></p>
                    <p class="sunrise-sunset">
                        <i class="wi wi-sunrise"></i> Sunrise: <span class="sunrise"></span> |
                        <i class="wi wi-sunset"></i> Sunset: <span class="sunset"></span>
                    </p>
                </article>
                <article>
                    <h3><i class="fa fa-calendar"></i> Weather Forecast <i class="fa fa-chevron-up"></i></h3>
                    <ul class="forecast-list"></ul>
                </article>
            </section>
            <section class="weather-loader">
                <i class="icon"></i>
                <p class="message"></p>
            </section>
            <section class="background"></section>
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
            this.$location = this.shadowRoot.querySelector('.location span');

            this.$todayWeather = this.shadowRoot.querySelector('.today-weather span');
            this.$todayWeatherIcon = this.shadowRoot.querySelector('.today-weather i');
            this.$todayTemp = this.shadowRoot.querySelector('.today-weather .temp');
            this.$todayHighLow = this.shadowRoot.querySelector('.today-high-low');

            this.$forecastListHolder = this.shadowRoot.querySelector('.forecast-list');

            this.getLocation();
        };

        attachedCallback() {};

        attributeChangedCallback(attrName, oldVal, newVal) {
            //console.log(attrName);
            if (attrName === 'location') {
                this.getTodayWeather(newVal);
            } else if (attrName === 'weather') {
                if (this.getAttribute('show-forecast')) {
                    //console.log('show forecast');
                    var location = this.getAttribute('location');
                    this.getWeatherForecast(location);
                }

                var weatherData = JSON.parse(newVal);
                this.updateWeatherTemplate(weatherData);
            } else if (attrName === 'forecast') {
                var forecastData = JSON.parse(newVal);
                this.updateForecastTemplate(forecastData);
            }
        };

        updateWeatherTemplate(data) {
            console.log(data);
            this.$location.innerHTML = data.name;
            this.$todayWeather.innerHTML = data.weather[0].description;
            this.$todayTemp.innerHTML = data.main.temp;
            var weatherIcon = this.getWeatherIcon(data.weather[0].description);
            this.$todayWeatherIcon.setAttribute('class', weatherIcon);
            this.$todayHighLow.querySelector('.high').innerHTML = data.main.temp_max;
            this.$todayHighLow.querySelector('.low').innerHTML = data.main.temp_min;
        };

        updateForecastTemplate(data) {
            console.log(data);
            var templateHolder = this.$forecastListHolder;
            data.list.forEach(function(element, index, array) {
                var date = new Date(element.dt);
                templateHolder.innerHTML +=
                    '<li><h3>' +
                    date.toDateString().slice(0, 3) + ' ' +
                    date.getDate() + ' ' +
                    date.toDateString().slice(4, 7) + '</h3><h4>' +
                    element.weather[0].description + ' <i class="' +
                    osbGeoWeather.prototype.getWeatherIcon(element.weather[0].description) + '"></i></h4></li>';
            });
        };
        // Get location from device or default then get long/lat from Google Maps
        getLocation() {
            if ('geolocation' in navigator) {
                //console.log('Has geolocation');
                // Get Location from Google if available else use default
                var base, apiKey, holder;
                base = this.googleMapsApiBase;
                apiKey = this.googleMapsApiKey;
                holder = this;
                navigator.geolocation.getCurrentPosition(function(position) {
                    fetch(base + position.coords.latitude + ',' + position.coords.longitude + '&key=' + apiKey)
                        .then(function(response) {
                            //console.log('Location Success');
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
        // Get Today's weather from openWeatherApi
        getTodayWeather(location) {
            //console.log('Getting today's weather');
            var holder = this;
            fetch(this.weatherApiBase + 'weather?q=' + location + '&units=metric&APPID=' + this.weatherApiKey)
                .then(function(response) {
                    //console.log('Weather Success');
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
        // Get Weather forecast from openWeatherApi
        getWeatherForecast(location) {
            var holder = this;
            fetch(this.weatherApiBase + 'forecast/daily?q=' + location + '&units=metric&APPID=' + this.weatherApiKey)
                .then(function(response) {
                    //console.log('Weather forecast Success');
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
        // Get correct icon class
        getWeatherIcon(weather) {
            switch(weather) {
                case 'thunderstorm with light rain':
                case 'thunderstorm with rain':
                case 'thunderstorm with heavy rain':
                    return 'wi wi-storm-showers';
                    break;
                case 'light thunderstorm':
                case 'thunderstorm with light drizzle':
                case 'thunderstorm with drizzle':
                case 'thunderstorm with heavy drizzle':
                    return 'wi wi-day-storm-showers';
                    break;
                case 'thunderstorm':
                    return 'wi wi-day-thunderstorm';
                    break;
                case 'heavy thunderstorm':
                case 'ragged thunderstorm':
                    return 'wi wi-thunderstorm';
                    break;
                case 'light intensity drizzle':
                    return 'wi wi-day-sprinkle';
                    break;
                case 'drizzle':
                case 'light intensity shower rain':
                    return 'wi wi-sprinkle';
                    break;
                case 'heavy intensity drizzle':
                case 'light intensity drizzle rain':
                case 'drizzle rain':
                case 'shower drizzle':
                case 'shower rain and drizzle':
                case 'heavy intensity drizzle rain':
                case 'heavy shower rain and drizzle':
                case 'shower rain':
                case 'heavy intensity shower rain':
                    return 'wi wi-showers';
                    break;
                case 'light rain':
                case 'moderate rain':
                case 'ragged shower rain':
                    return 'wi wi-rain-mix';
                    break;
                case 'heavy intensity rain':
                case 'very heavy rain':
                    return 'wi wi-rain';
                    break;
                case 'extreme rain':
                    return 'wi wi-rain-wind';
                    break;
                case 'light snow':
                case 'snow':
                case 'heavy snow':
                case 'light rain and snow':
                case 'rain and snow':
                    return 'wi wwi-snow';
                    break;
                case 'sleet':
                case 'shower sleet':
                case 'light shower snow':
                case 'shower snow':
                case 'heavy shower snow':
                    return 'wi wwi-sleet';
                    break;
                case 'clear sky':
                    return 'wi wi-day-sunny';
                    break;
                case 'few clouds':
                case 'scattered clouds':
                case 'broken clouds':
                    return 'wi wi-day-cloudy';
                    break;
                case 'overcast clouds':
                    return 'wi wi-cloudy';
                    break;
                case 'tornado':
                    return 'wi wi-tornado';
                    break;
                case 'tropical storm':
                    return 'wi wi-storm-showers';
                    break;
                case 'hurricane':
                    return 'wi wi-hurricane';
                    break;
                case 'cold':
                    return 'wi wi-snowflake-cold';
                    break;
                case 'hot':
                    return 'wi wi-hot';
                    break;
                case 'windy':
                    return 'wi wi-cloudy-windy';
                    break;
                case 'hail':
                    return 'wi wi-hail';
                    break;
                case 'calm':
                    return 'wi wi-day-sunny';
                    break;
                case 'light breeze':
                case 'gentle breeze':
                case 'moderate breeze':
                case 'fresh breeze':
                    return 'wi wi-windy';
                    break;
                case 'strong breeze':
                    return 'wi wi-strong-wind';
                    break;
                default:
                    return 'wi wi-day-sunny';
                    break;
            }
        }
    }
    // Register Element
    document.registerElement('osb-geo-weather', osbGeoWeather);
})();