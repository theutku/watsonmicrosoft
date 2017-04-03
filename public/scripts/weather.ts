import * as http from 'http';
import * as $ from 'jquery';

class WeatherApi {

    unit: string;
    data_timestamp: number;

    geolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.getcoordinates, this.showError);
        }
        else {
            return "Geolocation is not supported by this browser."
        }
    }

    getcoordinates(position) {
        var lat = position.coords.latitude;
        var long = position.coords.longitude;
        var units = localStorage.getItem("Units");
        var CurrentWeatherURL = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + long + "&units=" + units + '&APPID=7904cb95b212d74ed9dd29bfc979221b';
        var DailyForecastURL = "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + lat + "&lon=" + long + "&units=" + units + "&cnt=1" + '&APPID=7904cb95b212d74ed9dd29bfc979221b';
        if (units == "imperial") {
            this.getWeather(CurrentWeatherURL, DailyForecastURL, "F", "mph")
        }
        else {
            this.getWeather(CurrentWeatherURL, DailyForecastURL, "C", "m\/s")
        }
    }

    showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                return 'User denied the request for Geolocation.'
            case error.POSITION_UNAVAILABLE:
                return 'Location information is unavailable.'
            case error.TIMEOUT:
                return 'The request to get user location timed out.'
            case error.UNKNOWN_ERROR:
                return 'An unknown error occurred.'
        }
    }

    getWeather(data_url, forecast_url, temp, wind) {
        $.get(data_url).then((dataRes) => {
            localStorage.WeatherCache = JSON.stringify(dataRes.data);
        })
        $.get(forecast_url).then((forecastRes) => {
            localStorage.WeatherCache = JSON.stringify(forecastRes.data);
            this.displayData(temp, wind);
        }).fail((err) => {
            return "Error retrieving current weather data :: " + err.status;
        });
        localStorage.timestamp = this.data_timestamp;

    };

    init() {
        if (localStorage.getItem("Units") == null) {
            if (window.navigator.language == "en-US") {
                localStorage.Units = "imperial";
            }
            else {
                localStorage.Units = "metric";
            }
            this.geolocation();
        }
    }

    displayData(temp_units, wind_units) {
        try {
            // If the timestamp is newer  than 30 minutes, parse data from cache
            if (localStorage.getItem('timestamp') > this.data_timestamp - 1800) {
                var data = JSON.parse(localStorage.WeatherCache);
                var forecast = JSON.parse(localStorage.ForecastCache);
                document.querySelector('.weather-container').style.background = "url('../../assets/backgrounds/" + data.weather[0].icon + ".jpg') no-repeat fixed 50% 50%";
                document.querySelector('.weather-container').style.backgroundSize = "cover";
                self.querySelector('#weather').innerHTML = '<h2>' + data.name + '</h2><img class="icon" src="../../assets/icons/' + data.weather[0].icon + '.png"><span id="temp">' + data.main.temp + ' </span><span id="units">&deg;' + temp_units + '</span><p id="description">' + data.weather[0].description + '</p><p><span id="humidity">' + data.main.humidity + '% humidity</span>&nbsp;&nbsp;&nbsp;&nbsp;' + Math.round(data.wind.speed) + wind_units + ' wind</p>' + '<p id="daily">Today\'s Forecast: ' + forecast.list[0].weather[0].main + '</p><p>max: ' + Math.round(forecast.list[0].temp.max) + '&deg;' + temp_units + ' &nbsp;&nbsp;&nbsp;&nbsp;min: ' + Math.round(forecast.list[0].temp.min) + '&deg;' + temp_units + '</p>';
            }
            else {
                this.geolocation();
            }
        }
        catch (error) {
            window.console && console.error(error);
        }
    }

    constructor() {
        this.data_timestamp = Math.round(new Date().getTime() / 1000);
    }
}