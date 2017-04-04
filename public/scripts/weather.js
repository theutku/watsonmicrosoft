var self = this;
switch (localStorage.getItem("Units")) {
    case null:
        if (window.navigator.language == "en-US") {
            localStorage.Units = "imperial";
        }
        else {
            localStorage.Units = "metric";
        }
        break;
}

function geolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getcoordinates, showError);
    }
    else {
        $.post('/weather', {
            err: 'Geolocation is not supported by this browser.',
            data: null
        }).then((res) => {
            console.log('Geolocation is not supported by this browser.')
        })
    }
}

function getcoordinates(position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    var units = localStorage.getItem("Units");
    var CurrentWeatherURL = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + long + "&units=" + units + '&APPID=7904cb95b212d74ed9dd29bfc979221b';
    var DailyForecastURL = "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + lat + "&lon=" + long + "&units=" + units + "&cnt=1" + '&APPID=7904cb95b212d74ed9dd29bfc979221b';
    if (units == "imperial") {
        getWeather(CurrentWeatherURL, DailyForecastURL, "F", "mph")
    }
    else {
        getWeather(CurrentWeatherURL, DailyForecastURL, "C", "m\/s")
    }
}
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            $.post('/weather', {
                err: 'User denied the request for Geolocation.',
                data: null
            }).then((res) => {
                console.log('User denied the request for Geolocation.')
            })
            break;
        case error.POSITION_UNAVAILABLE:
            $.post('/weather', {
                err: 'Location information is unavailable.',
                data: null
            }).then((res) => {
                console.log('Location information is unavailable.')
            })
            break;
        case error.TIMEOUT:
            $.post('/weather', {
                err: 'The request to get user location timed out.',
                data: null
            }).then((res) => {
                console.log('The request to get user location timed out.')
            })
            break;
        case error.UNKNOWN_ERROR:
            $.post('/weather', {
                err: 'An unknown error occurred.',
                data: null
            }).then((res) => {
                console.log('An unknown error occurred.')
            })
            break;
    }
}

var data_timestamp = Math.round(new Date().getTime() / 1000);

function getWeather(data_url, forecast_url, temp, wind) {
    $.get(data_url).then((dataRes) => {
        localStorage.WeatherCache = JSON.stringify(dataRes.data);
        $.get(forecast_url).then((forecastRes) => {
            localStorage.ForecastCache = JSON.stringify(forecastRes.data);
            $.post('/weather', {
                err: null,
                data: {
                    weather: dataRes,
                    forecast: forecastRes
                }
            }).then((res) => {
                console.log('The request to get user location timed out.');
            })
        }).fail((err) => {
            $.post('/weather', {
                err: 'Error retrieving current weather data :: ' + err.status,
                data: null
            }).then((res) => {
                console.log('The request to get user location timed out.');
            })
        })
    }).fail((err) => {
        $.post('/weather', {
            err: err,
            data: null
        }).then((res) => {
            console.log('Error: ', err);
        })
    })

    localStorage.timestamp = data_timestamp;
};
function displayData(temp_units, wind_units) {
    try {
        // If the timestamp is newer  than 30 minutes, parse data from cache
        if (localStorage.getItem('timestamp') > data_timestamp - 1800) {
            var data = JSON.parse(localStorage.WeatherCache);
            var forecast = JSON.parse(localStorage.ForecastCache);
            document.querySelector('.weather-container').style.background = "url('../../assets/backgrounds/" + data.weather[0].icon + ".jpg') no-repeat fixed 50% 50%";
            document.querySelector('.weather-container').style.backgroundSize = "cover";
            self.querySelector('#weather').innerHTML = '<h2>' + data.name + '</h2><img class="icon" src="../../assets/icons/' + data.weather[0].icon + '.png"><span id="temp">' + data.main.temp + ' </span><span id="units">&deg;' + temp_units + '</span><p id="description">' + data.weather[0].description + '</p><p><span id="humidity">' + data.main.humidity + '% humidity</span>&nbsp;&nbsp;&nbsp;&nbsp;' + Math.round(data.wind.speed) + wind_units + ' wind</p>' + '<p id="daily">Today\'s Forecast: ' + forecast.list[0].weather[0].main + '</p><p>max: ' + Math.round(forecast.list[0].temp.max) + '&deg;' + temp_units + ' &nbsp;&nbsp;&nbsp;&nbsp;min: ' + Math.round(forecast.list[0].temp.min) + '&deg;' + temp_units + '</p>';
        }
        else {
            geolocation();
        }
    }
    catch (error) {
        window.console && console.error(error);
    }
}

geolocation();
