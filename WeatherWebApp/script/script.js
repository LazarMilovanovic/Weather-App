const chosenCity = document.getElementById("city-name");
const dailyResutl = document.getElementById("daily-report");
const currentCity = document.getElementById("current-city");
const currentTemp = document.getElementById("current-temp");
const heroSection = document.getElementById("hero");
const weaklyWeather = document.getElementById("weakly-weather");

// Start Call Belgrade For Load //
getWeatherForCity(44.804, 20.4651);
currentCity.textContent = "Belgrade";
axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/Belgrade`).then((response) => (heroSection.style.backgroundImage = `url(${response.data.originalimage.source})`));
// End Call Belgrade For Load

///////////////////////
// Get Inputed City //
/////////////////////
chosenCity.onsearch = searchCity;

async function searchCity() {
  const city = document.getElementById("city-name").value.trim();

  try {
    // paralelno dohvatamo grad info i sliku
    const [cityName, cityPicture] = await axios.all([
      axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`),
      axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${city}`),
    ]);
    heroSection.style.backgroundImage = `url(${cityPicture.data.originalimage.source})`;
    getWeatherForCity(cityName.data.results[0].latitude, cityName.data.results[0].longitude);

    currentCity.textContent = city;
  } catch (err) {
    console.error(err);
  }
}

///////////////////////////////
// Get Weather For The City //
/////////////////////////////
async function getWeatherForCity(latitude, longitude) {
  const response = await axios.get(
    `https://api.open-meteo.com/v1/forecast?
latitude=${latitude}&longitude=${longitude}&
daily=weather_code,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,rain_sum,showers_sum,snowfall_sum,precipitation_sum,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_probability_mean&
hourly=temperature_2m,rain,showers,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,uv_index,snowfall,snow_depth,weathercode&
current_weather=true&
timezone=auto&
forecast_days=7&utm_source=chatgpt.com
`
  );
  console.log(response.data);

  dailyResutl.textContent = "";
  for (let i = 0; i < 24; i++) {
    const hourlyWeather = document.createElement("ul");
    const time = document.createElement("li");
    time.className = "hourly-time";
    time.textContent = response.data.hourly.time[i].split("T")[1];
    const icon = document.createElement("li");
    const weatherCode = response.data.hourly.weathercode[i];
    if (weatherCode === 0) {
      icon.className = "hourly-weather-sun";
    } else if ([1, 2, 3, 45, 48].includes(weatherCode)) {
      icon.className = "hourly-weather-cloud";
    } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode)) {
      icon.className = "hourly-weather-rain";
    } else if ([71, 73, 75].includes(weatherCode)) {
      icon.className = "hourly-weather-snow";
    }

    const temp = document.createElement("li");
    temp.textContent = response.data.hourly.temperature_2m[i];
    temp.className = "hourly-temp";
    const perception = document.createElement("li");
    perception.textContent = `${response.data.hourly.precipitation_probability[i]}%`;
    perception.className = "hourly-perception";

    hourlyWeather.append(time, icon, temp, perception);
    dailyResutl.append(hourlyWeather);
  }

  weaklyWeather.textContent = "";
  for (let i = 0; i < 7; i++) {
    const dayWeatherListElement = document.createElement("li");
    const dayName = document.createElement("p");
    const weatherPic = document.createElement("img");
    weatherPic.src = "/images/cloudy.png";
    weatherPic.className = "weather-pic";
    // const weatherInfo = document.createElement("p");
    const sunRise = document.createElement("p");
    sunRise.classList = "sunrise";
    const sunSet = document.createElement("p");
    sunSet.className = "sunset";
    const minTemperature = document.createElement("p");
    minTemperature.className = "min-temp";
    const maxTemperature = document.createElement("p");
    maxTemperature.className = "max-temp";

    dayName.textContent = `${response.data.daily.time[i]}`;
    sunRise.textContent = `${response.data.daily.sunrise[i].split("T")[1]}`;
    sunSet.textContent = `${response.data.daily.sunset[i].split("T")[1]}`;
    minTemperature.textContent = `${response.data.daily.temperature_2m_max[i]}`;
    maxTemperature.textContent = ` ${response.data.daily.temperature_2m_min[i]}`;
    dayWeatherListElement.append(dayName, sunRise, sunSet, minTemperature, maxTemperature);
    weaklyWeather.append(dayWeatherListElement);
  }

  currentTemp.textContent = response.data.current_weather.temperature;
}
