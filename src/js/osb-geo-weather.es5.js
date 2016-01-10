"use strict";

var _temporalUndefined = {};

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _temporalAssertDefined(val, name, undef) { if (val === undef) { throw new ReferenceError(name + ' is not defined - temporal dead zone'); } return true; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
    var template = _temporalUndefined;
    var osbGeoWeather = _temporalUndefined;

    // Register Element
    template = '\n        <style>\n            @import url(\'https://fonts.googleapis.com/css?family=Roboto:400,300\');\n            @import url(\'https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css\');\n            @import url(\'/bower_components/weather-icons/css/weather-icons.css\');\n\n            @import url(\'/src/css/osb-geo-weather.css\');\n        </style>\n        <main class="osb-geo-weather-holder">\n            <h2>Local Weather <i class="fa fa-refresh"></i></h2>\n            <section class="weather">\n                <article class="forecast-data">\n                    <h3 class="today-weather">\n                        <span class="title"></span> <span class="icon"></span> <span class="temp"></span><sup>&deg;</sup>\n                    </h3>\n                    <h4 class="today-high-low">\n                        <i class="fa fa-chevron-up"></i> High: <span class="high"></span><sup>&deg;</sup> |\n                        <i class="fa fa-chevron-down"></i> Low: <span class="low"></span><sup>&deg;</sup>\n                    </h4>\n                    <p class="location">Location <i class="fa fa-map-marker"></i>: <span></span></p>\n                    <p class="today-sunrise-sunset">\n                        <i class="wi wi-sunrise"></i> Sunrise: <span class="sunrise"></span> |\n                        <i class="wi wi-sunset"></i> Sunset: <span class="sunset"></span>\n                    </p>\n                </article>\n                <article>\n                    <h3><i class="fa fa-calendar"></i> Weather Forecast <i class="fa fa-chevron-up"></i></h3>\n                    <ul class="forecast-list"></ul>\n                </article>\n            </section>\n            <section class="weather-loader">\n                <i class="icon"></i>\n                <p class="message"></p>\n            </section>\n            <section class="background defaultBg"></section>\n        </main>\n    ';

    osbGeoWeather = (function (_HTMLElement) {
        _inherits(_temporalAssertDefined(osbGeoWeather, 'osbGeoWeather', _temporalUndefined) && osbGeoWeather, _HTMLElement);

        function osbGeoWeather() {
            _classCallCheck(this, _temporalAssertDefined(osbGeoWeather, 'osbGeoWeather', _temporalUndefined) && osbGeoWeather);

            _get(Object.getPrototypeOf((_temporalAssertDefined(osbGeoWeather, 'osbGeoWeather', _temporalUndefined) && osbGeoWeather).prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(_temporalAssertDefined(osbGeoWeather, 'osbGeoWeather', _temporalUndefined) && osbGeoWeather, [{
            key: 'createdCallback',
            value: function createdCallback() {
                this.createShadowRoot().innerHTML = _temporalAssertDefined(template, 'template', _temporalUndefined) && template;
                this.googleMapsApiBase = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';
                this.googleMapsApiKey = 'AIzaSyDI-MPoDrmVJnK2qAYtDZr9aR9pOzHCSiI';
                this.weatherApiBase = 'http://api.openweathermap.org/data/2.5/';
                this.weatherApiKey = '893dd0afe360cf42975f84a9b97cd4ec';
                // Get Selectors
                this.$holder = this.shadowRoot.querySelector('.osb-geo-weather-holder');
                this.$loader = this.shadowRoot.querySelector('.weather-loader');
                this.$location = this.shadowRoot.querySelector('.location span');

                this.$todayWeather = this.shadowRoot.querySelector('.today-weather .title');
                this.$todayWeatherIcon = this.shadowRoot.querySelector('.today-weather .icon');
                this.$todayTemp = this.shadowRoot.querySelector('.today-weather .temp');
                this.$todayHighLow = this.shadowRoot.querySelector('.today-high-low');
                this.$todaySunriseSunset = this.shadowRoot.querySelector('.today-sunrise-sunset');

                this.$forecastListHolder = this.shadowRoot.querySelector('.forecast-list');

                this.getLocation();
            }
        }, {
            key: 'attachedCallback',
            value: function attachedCallback() {}
        }, {
            key: 'attributeChangedCallback',
            value: function attributeChangedCallback(attrName, oldVal, newVal) {
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
            }
        }, {
            key: 'updateWeatherTemplate',
            value: function updateWeatherTemplate(data) {
                this.$location.innerHTML = data.name;
                this.$todayWeather.innerHTML = data.weather[0].description;
                this.$todayTemp.innerHTML = data.main.temp;
                this.$todayWeatherIcon.innerHTML = '<i class="wi wi-owm-' + data.weather[0].id + '"></i>';
                this.$todayHighLow.querySelector('.high').innerHTML = data.main.temp_max;
                this.$todayHighLow.querySelector('.low').innerHTML = data.main.temp_min;
                this.$todaySunriseSunset.querySelector('.sunrise').innerHTML = (_temporalAssertDefined(osbGeoWeather, 'osbGeoWeather', _temporalUndefined) && osbGeoWeather).parseTime(data.sys.sunrise);
                this.$todaySunriseSunset.querySelector('.sunset').innerHTML = (_temporalAssertDefined(osbGeoWeather, 'osbGeoWeather', _temporalUndefined) && osbGeoWeather).parseTime(data.sys.sunset);
            }
        }, {
            key: 'updateForecastTemplate',
            value: function updateForecastTemplate(data) {
                var templateHolder = this.$forecastListHolder;
                data.list.forEach(function (element, index, array) {
                    var date = new Date(element.dt * 1000);
                    templateHolder.innerHTML += '<li><h3>' + date.toDateString().slice(0, 3) + ' ' + date.getDate() + ' ' + date.toDateString().slice(4, 7) + '</h3><h4>' + element.weather[0].description + ' <i class="wi wi-owm-' + element.weather[0].id + '"></i></h4></li>';
                });
            }
        }, {
            key: 'getLocation',

            // Get location from device or default then get long/lat from Google Maps
            value: function getLocation() {
                if ('geolocation' in navigator) {
                    //console.log('Has geolocation');
                    // Get Location from Google if available else use default
                    var base, apiKey, holder;
                    base = this.googleMapsApiBase;
                    apiKey = this.googleMapsApiKey;
                    holder = this;
                    navigator.geolocation.getCurrentPosition(function (position) {
                        fetch(base + position.coords.latitude + ',' + position.coords.longitude + '&key=' + apiKey).then(function (response) {
                            //console.log('Location Success');
                            if (response.status !== 200) {
                                console.log('Looks like there was a problem. Status Code: ' + response.status);
                                return;
                            }
                            response.json().then(function (data) {
                                var location = data.results[0].address_components[3].long_name;
                                return holder.setAttribute('location', location);
                            });
                        })['catch'](function (err) {
                            console.log('Failed');
                        });
                    });
                } else {
                    console.log('No geolocation');
                }
            }
        }, {
            key: 'getTodayWeather',

            // Get Today's weather from openWeatherApi
            value: function getTodayWeather(location) {
                //console.log('Getting today's weather');
                var holder = this;
                fetch(this.weatherApiBase + 'weather?q=' + location + '&units=metric&APPID=' + this.weatherApiKey).then(function (response) {
                    //console.log('Weather Success');
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    response.json().then(function (data) {
                        var weather = JSON.stringify(data);
                        return holder.setAttribute('weather', weather);
                    });
                })['catch'](function (err) {
                    console.log('Failed');
                });
            }
        }, {
            key: 'getWeatherForecast',

            // Get Weather forecast from openWeatherApi
            value: function getWeatherForecast(location) {
                var holder = this;
                fetch(this.weatherApiBase + 'forecast/daily?q=' + location + '&units=metric&APPID=' + this.weatherApiKey).then(function (response) {
                    //console.log('Weather forecast Success');
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    response.json().then(function (data) {
                        var forecast = JSON.stringify(data);
                        return holder.setAttribute('forecast', forecast);
                    });
                })['catch'](function (err) {
                    console.log('Failed');
                });
            }
        }], [{
            key: 'parseTime',
            value: function parseTime(time) {
                var amPm = 'AM';
                var timeDate = new Date(time * 1000);
                if (timeDate.getHours() > 11) {
                    amPm = 'PM';
                }
                return ('0' + timeDate.getHours()).slice(-2) + ':' + ('0' + timeDate.getMinutes()).slice(-2) + ' ' + amPm;
            }
        }]);

        return _temporalAssertDefined(osbGeoWeather, 'osbGeoWeather', _temporalUndefined) && osbGeoWeather;
    })(HTMLElement);

    document.registerElement('osb-geo-weather', _temporalAssertDefined(osbGeoWeather, 'osbGeoWeather', _temporalUndefined) && osbGeoWeather);
})();