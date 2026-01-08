const heroSection = document.getElementById("hero");
const chosenCity = document.getElementById("city-name");
const currentCity = document.getElementById("current-city");
const currentTemp = document.getElementById("current-temp");
const dailyResutl = document.getElementById("daily-report");
const weaklyWeather = document.getElementById("weakly-report");

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
    const [cityName, cityPicture] = await axios.all([
      axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`),
      axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${city}`),
    ]);
    heroSection.style.backgroundImage = `url(${cityPicture.data.originalimage.source})`;
    getWeatherForCity(cityName.data.results[0].latitude, cityName.data.results[0].longitude);

    currentCity.textContent = city
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } catch (err) {
    console.error(err);
  }
}

/////////////////////////
// Making DOM element //
///////////////////////
function makeEl(eltag, elClass, elText) {
  const element = document.createElement(eltag);
  if (elClass) element.className = elClass;
  if (elText) element.textContent = elText;
  return element;
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
timezone=auto&hourly=is_day&
forecast_days=7&utm_source=chatgpt.com
`
  );
  console.log(response.data);

  // Making daily report //
  dailyResutl.textContent = "";
  for (let i = 0; i < 24; i++) {
    const hourlyWeather = makeEl("li");
    const time = makeEl("p", "hourly-time", response.data.hourly.time[i].split("T")[1]);
    const icon = makeEl("p");
    const weatherCode = response.data.hourly.weathercode[i];
    if ([0, 1].includes(weatherCode)) {
      if (response.data.hourly.is_day[i] === 0) {
        icon.className = "hourly-weather-moon";
      } else {
        icon.className = "hourly-weather-sun";
      }
    } else if ([2, 3, 45, 48].includes(weatherCode)) {
      icon.className = "hourly-weather-cloud";
    } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weatherCode)) {
      icon.className = "hourly-weather-rain";
    } else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
      icon.className = "hourly-weather-snow";
    }

    // sunrise
    const timeNum = Number(response.data.hourly.time[i].split("T")[1].split(":")[0]);
    if (timeNum - 1 == response.data.daily.sunrise[0].split("T")[1].split(":")[0]) {
      const dailySunrise = makeEl("li");
      const time = makeEl("p", "hourly-time", response.data.daily.sunrise[0].split("T")[1]);
      const sunriseIcon = makeEl("p");
      sunriseIcon.className = "sunrise";
      dailySunrise.append(time, sunriseIcon);
      dailyResutl.append(dailySunrise);
    }

    // sunset
    if (timeNum - 1 == response.data.daily.sunset[0].split("T")[1].split(":")[0]) {
      const dailySunset = makeEl("li");
      const time = makeEl("p", "hourly-time", response.data.daily.sunset[0].split("T")[1]);
      const sunsetIcon = makeEl("p");
      sunsetIcon.className = "sunset";
      dailySunset.append(time, sunsetIcon);
      dailyResutl.append(dailySunset);
    }

    const currentTime = Number(response.data.current_weather.time.split("T")[1].split(":")[0]);
    if (timeNum === currentTime) {
      hourlyWeather.className = "current-houre";
    }

    const temp = makeEl("p", "hourly-temp", `${response.data.hourly.temperature_2m[i]}\u00B0`);
    const perception = makeEl("p", "hourly-perception", ` ${response.data.hourly.precipitation_probability[i]}%`);
    hourlyWeather.append(time, icon, temp, perception);
    dailyResutl.append(hourlyWeather);
  }

  // Weakly Report Header Row //
  weaklyWeather.textContent = "";
  const measuingNames = makeEl("li", "header-row");
  const day = makeEl("p", "dayRepresentaion", "Day");
  const sunrise = makeEl("p", "sunrise");
  const sunset = makeEl("p", "sunset");
  const minTemp = makeEl("p", "min-temp");
  const maxTemp = makeEl("p", "max-temp");
  measuingNames.append(day, sunrise, sunset, minTemp, maxTemp);
  weaklyWeather.append(measuingNames);

  // Weakly Report //
  for (let i = 0; i < 7; i++) {
    const listEl = makeEl("li", "day-element");
    const dayName = new Date(response.data.daily.time[i]).toLocaleDateString("en-GB", {
      weekday: "short",
    });
    const day = makeEl("p", "day-name", dayName);
    const weatherIcon = makeEl("p");
    const weatherCode = response.data.daily.weather_code[i];
    if ([0, 1].includes(weatherCode)) {
      weatherIcon.className = "weekly-weather-sun";
    } else if ([2, 3, 45, 48].includes(weatherCode)) {
      weatherIcon.className = "weekly-weather-cloud";
    } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weatherCode)) {
      weatherIcon.className = "weekly-weather-rain";
    } else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
      weatherIcon.className = "weekly-weather-snow";
    }

    const sunrise = makeEl("p", "weather-param-time", response.data.daily.sunrise[i].split("T")[1]);
    const sunset = makeEl("p", "weather-param-time", response.data.daily.sunset[i].split("T")[1]);
    const minTemp = makeEl("p", "weather-param-temp", `${response.data.daily.temperature_2m_min[i]}\u00B0`);
    const maxTemp = makeEl("p", "weather-param-temp", `${response.data.daily.temperature_2m_max[i]}\u00B0`);

    listEl.append(day, weatherIcon, sunrise, sunset, minTemp, maxTemp);
    weaklyWeather.append(listEl);
  }

  // Adding current temperature to HERO section //
  currentTemp.textContent = `${response.data.current_weather.temperature}\u00B0C`;
}
