const heroSection = document.getElementById("hero");
const chosenCity = document.getElementById("city-input");
const currentCity = document.getElementById("current-city");
const currentTemp = document.getElementById("current-temp");
const dailyResult = document.getElementById("daily-report");
const weeklyWeather = document.getElementById("weekly-report");
const errorMsg = document.getElementById("error-msg");
const errorMsgBtn = document.getElementById("error-msg__btn");
const weatherData = document.getElementById("weather-data");

// Error Message Button Function //
errorMsgBtn.onclick = cancelErrorMsg;
function cancelErrorMsg() {
  errorMsg.className = "hide-error-msg";
}
errorMsg.className = "hide-error-msg";

///////////////////////////
// Weekly weather chart //
/////////////////////////
const ctx = document.getElementById("chart");
const prevChartBtn = document.getElementById("chart__previous");
const nextChartBtn = document.getElementById("chart__next");

/////////////////////
// Axios Base URL //
///////////////////
const wikiApi = axios.create({
  baseURL: "https://en.wikipedia.org/api/rest_v1/page/summary/",
});

// Start Call Belgrade For Load ///////////////////////
getWeatherForCity(44.804, 20.4651); //44.804, 20.4651
currentCity.textContent = "Belgrade";
wikiApi.get(`Belgrade`).then((response) => (heroSection.style.backgroundImage = `url(${response.data.originalimage.source})`));
// End Call Belgrade For Load/////////////////////////

// Chart JS Variables
let chart;
let currentChartIndex = 0;

///////////////
// Get City //
/////////////
chosenCity.onsearch = searchCity;
async function searchCity() {
  const cityInput = document.getElementById("city-input").value.trim();
  const city = cityInput.replace(/\s+/g, " ");

  if (!city) {
    return;
  }

  try {
    const cityName = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
    const cityPicture = await wikiApi.get(`${city}`);
    // const [cityName, cityPicture] = await Promise.all([axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`), wikiApi.get(`${city}`)]);

    heroSection.style.backgroundImage = `url(${cityPicture.data.originalimage.source})`;
    getWeatherForCity(cityName.data.results[0].latitude, cityName.data.results[0].longitude);

    currentCity.textContent = city
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } catch (err) {
    errorMsg.className = "error-msg";
  }
}

/////////////////////////
// Making DOM element //
///////////////////////
function makeEl({ elTag, elClass, elText }) {
  const element = document.createElement(elTag);
  if (elClass) element.className = elClass;
  if (elText) element.textContent = elText;
  return element;
}

/////////////////////////////////
// Get Weather Class Function //
///////////////////////////////
function getWeatherClass(code, isDay = true) {
  if ([0].includes(code)) return isDay ? "weather-sun" : "weather-moon";
  if ([1, 2, 3].includes(code)) return isDay ? "weather-partly-cloudy-sun" : "weather-partly-cloudy-moon";
  if ([45, 48].includes(code)) return "weather-fog";
  if ([51, 53, 55].includes(code)) return "weather-drizzle";
  if ([56, 57].includes(code)) return "weather-freezing-drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "weather-rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "weather-snow";
  if ([80, 81, 82].includes(code)) return "weather-rain-shower";
  if ([95].includes(code)) return "weather-thunderstorm";
  if ([96, 99].includes(code)) return "weather-hail";
}

///////////////////////////////
// Get Weather For The City //
/////////////////////////////
async function getWeatherForCity(latitude, longitude) {
  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,weather_code,temperature_2m_min,sunrise,sunset,rain_sum,wind_speed_10m_max&hourly=temperature_2m,weather_code,is_day,precipitation_probability&current=temperature_2m&timezone=auto&forecast_hours=24`
    );
    console.log(response.data);

    // Response paths //////////////////////////////////////
    const currentInfo = response.data.current;
    const hourlyInfo = response.data.hourly;
    const dailyInfo = response.data.daily;

    ///////////////////////////////////
    // Sunrise And Sunset Variables //
    /////////////////////////////////
    const sunriseTime = new Date(dailyInfo.sunrise[0]).getHours();
    const sunsetTime = new Date(dailyInfo.sunset[0]).getHours();
    const currentTime = new Date(currentInfo.time).getHours();

    //////////////////////////
    // Making daily report //
    ////////////////////////
    dailyResult.textContent = "";
    const hoursInADay = 24;
    for (let i = 0; i < hoursInADay; i++) {
      const timeNum = new Date(hourlyInfo.time[i]).getHours();
      ////////////////////////
      // Make list Element //
      //////////////////////
      const hourlyWeather = makeEl({
        elTag: "li",
      });
      const time = makeEl({
        elTag: "p",
        elClass: "hourly-time",
        elText: hourlyInfo.time[i].split("T")[1],
      });

      const icon = makeEl({
        elTag: "p",
      });
      const weatherCode = hourlyInfo.weather_code[i];
      icon.className = getWeatherClass(weatherCode, hourlyInfo.is_day[i]);
      const temp = makeEl({ elTag: "p", elClass: "hourly-temp", elText: `${hourlyInfo.temperature_2m[i]}\u00B0` });
      const precipitation = makeEl({ elTag: "p", elClass: "hourly-precipitation", elText: ` ${hourlyInfo.precipitation_probability[i]}%` });
      hourlyWeather.append(time, icon, temp, precipitation);
      dailyResult.append(hourlyWeather);

      //////////////
      // sunrise //
      ////////////
      if (timeNum === sunriseTime) {
        const dailySunrise = makeEl({
          elTag: "li",
        });
        const time = makeEl({ elTag: "p", elClass: "hourly-time", elText: dailyInfo.sunrise[0].split("T")[1] });
        const sunriseIcon = makeEl({
          elTag: "p",
        });
        sunriseIcon.className = "sunrise";
        dailySunrise.append(time, sunriseIcon);
        dailyResult.append(dailySunrise);
      }

      /////////////
      // sunset //
      ///////////
      if (timeNum === sunsetTime) {
        const dailySunset = makeEl({
          elTag: "li",
        });
        const time = makeEl({ elTag: "p", elClass: "hourly-time", elText: dailyInfo.sunset[0].split("T")[1] });
        const sunsetIcon = makeEl({
          elTag: "p",
        });
        sunsetIcon.className = "sunset";
        dailySunset.append(time, sunsetIcon);
        dailyResult.append(dailySunset);
      }
    }

    ///////////////////////////////
    // weekly Report Header Row //
    /////////////////////////////
    weeklyWeather.textContent = "";
    const measuringNames = makeEl({ elTag: "li", elClass: "header-row" });
    const day = makeEl({ elTag: "p", elClass: "dayName", elText: "Day" });
    const sunrise = makeEl({ elTag: "p", elClass: "sunrise" });
    const sunset = makeEl({ elTag: "p", elClass: "sunset" });
    const minTemp = makeEl({ elTag: "p", elClass: "min-temp" });
    const maxTemp = makeEl({ elTag: "p", elClass: "max-temp" });
    measuringNames.append(day, sunrise, sunset, minTemp, maxTemp);
    weeklyWeather.append(measuringNames);

    // Chart JS Variables//////////////////////////////////////////////
    const daysNames = [];
    const rainChartData = [];
    const minTempChartData = [];
    const maxTempChartData = [];
    const windSpeedChartData = [];

    ////////////////////
    // weekly Report //
    //////////////////
    const daysInAWeek = 7;
    for (let i = 0; i < daysInAWeek; i++) {
      const listEl = makeEl({ elTag: "li", elClass: "day-element" });
      const dayName = new Date(dailyInfo.time[i]).toLocaleDateString("en-GB", {
        weekday: "short",
      });
      daysNames.push(dayName);
      const day = makeEl({ elTag: "p", elClass: "day-name", elText: dayName });
      const weatherIcon = makeEl({ elTag: "p" });
      const weatherCode = dailyInfo.weather_code[i];
      weatherIcon.className = getWeatherClass(weatherCode);

      const sunrise = makeEl({ elTag: "p", elClass: "weather-parameter", elText: dailyInfo.sunrise[i].split("T")[1] });
      const sunset = makeEl({ elTag: "p", elClass: "weather-parameter", elText: dailyInfo.sunset[i].split("T")[1] });
      const minTemp = makeEl({ elTag: "p", elClass: "weather-parameter", elText: `${dailyInfo.temperature_2m_min[i]}°` });
      const maxTemp = makeEl({ elTag: "p", elClass: "weather-parameter", elText: `${dailyInfo.temperature_2m_max[i]}°` });

      listEl.append(day, weatherIcon, sunrise, sunset, minTemp, maxTemp);
      weeklyWeather.append(listEl);

      // Adding Info For Chart Data Variables///////////////////////////////////////
      rainChartData.push(dailyInfo.rain_sum[i]);
      minTempChartData.push(dailyInfo.temperature_2m_min[i]);
      maxTempChartData.push(dailyInfo.temperature_2m_max[i]);
      windSpeedChartData.push(dailyInfo.wind_speed_10m_max[i]);
    }

    Chart.defaults.color = "#ffffff";

    const weatherCharts = [
      {
        title: "Precipitation",
        type: "bar",
        data: {
          labels: daysNames,
          datasets: [
            {
              label: "Rain sum (mm)",
              data: rainChartData,
              backgroundColor: "rgb(58, 209, 55)",
            },
          ],
        },
      },
      {
        title: "Min / Max Temperature",
        type: "line",
        data: {
          labels: daysNames,
          datasets: [
            {
              label: "Max Temperature",
              data: maxTempChartData,
              borderColor: "rgb(245, 59, 59)",
            },
            {
              label: "Min Temperature",
              data: minTempChartData,
              borderColor: "rgb(134, 177, 223)",
            },
          ],
        },
      },
      {
        title: "Wind Speed",
        type: "line",
        data: {
          labels: daysNames,
          datasets: [
            {
              label: "Wind speed km/h",
              data: windSpeedChartData,
              borderColor: "rgb(0, 234, 255)",
            },
          ],
        },
      },
    ];
    function renderChart(index) {
      const config = weatherCharts[index];

      if (!chart) {
        chart = new Chart(ctx, {
          type: config.type,
          data: config.data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
          },
        });
        return;
      }

      chart.config.type = config.type;
      chart.data = config.data;

      chart.update();
    }

    renderChart(currentChartIndex);

    prevChartBtn.onclick = prevChart;
    function prevChart() {
      currentChartIndex = (currentChartIndex - 1 + weatherCharts.length) % weatherCharts.length;
      renderChart(currentChartIndex);
    }
    nextChartBtn.onclick = nextChart;
    function nextChart() {
      currentChartIndex = (currentChartIndex + 1) % weatherCharts.length;
      renderChart(currentChartIndex);
    }

    // Adding current temperature to HERO section ////////////////////////////////
    currentTemp.textContent = `${currentInfo.temperature_2m}°C`;
    chosenCity.value = "";
  } catch (error) {
    console.error(error);
  }
}
