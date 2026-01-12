const heroSection = document.getElementById("hero");
const chosenCity = document.getElementById("city-input");
const currentCity = document.getElementById("current-city");
const currentTemp = document.getElementById("current-temp");
const dailyResult = document.getElementById("daily-report");
const weeklyWeather = document.getElementById("weekly-report");

// Start Call Belgrade For Load ///////////////////////
getWeatherForCity(44.804, 20.4651);
currentCity.textContent = "Belgrade";
axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/Belgrade`).then((response) => (heroSection.style.backgroundImage = `url(${response.data.originalimage.source})`));
// End Call Belgrade For Load/////////////////////////

// Chart JS Variables
let chart;
let currentChartIndex = 0;

///////////////
// Get City //
/////////////
chosenCity.onsearch = searchCity;

async function searchCity() {
  const city = document.getElementById("city-input").value.trim();

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
  if ([0, 1].includes(code)) return isDay ? "weather-sun" : "weather-moon";
  if ([2, 3, 45, 48].includes(code)) return "weather-cloud";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return "weather-rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "weather-snow";
}

///////////////////////////////
// Get Weather For The City //
/////////////////////////////
async function getWeatherForCity(latitude, longitude) {
  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,rain_sum,showers_sum,snowfall_sum,precipitation_sum,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_probability_mean,wind_speed_10m_max&hourly=temperature_2m,rain,showers,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,uv_index,snowfall,snow_depth,weathercode,is_day&current_weather=true&timezone=auto&forecast_days=7&utm_source=chatgpt.com`
    );
    console.log(response.data);

    // Response paths //////////////////////////////////////
    const currentInfo = response.data.current_weather;
    const hourlyInfo = response.data.hourly;
    const dailyInfo = response.data.daily;

    //////////////////////////
    // Making daily report //
    ////////////////////////
    dailyResult.textContent = "";
    const hoursInADay = 24;
    for (let i = 0; i < hoursInADay; i++) {
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
      const weatherCode = hourlyInfo.weathercode[i];
      icon.className = getWeatherClass(weatherCode, hourlyInfo.is_day[i]);
      const temp = makeEl({ elTag: "p", elClass: "hourly-temp", elText: `${hourlyInfo.temperature_2m[i]}\u00B0` });
      const perception = makeEl({ elTag: "p", elClass: "hourly-perception", elText: ` ${hourlyInfo.precipitation_probability[i]}%` });
      hourlyWeather.append(time, icon, temp, perception);
      dailyResult.append(hourlyWeather);

      ///////////////////////////////////
      // Sunrise And Sunset Variables //
      /////////////////////////////////
      const timeNum = new Date(hourlyInfo.time[i]).getHours();
      const sunriseTime = new Date(dailyInfo.sunrise[0]).getHours();
      const sunsetTime = new Date(dailyInfo.sunset[0]).getHours();

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

      //////////////////////////
      // Select Current Time //
      ////////////////////////
      const currentTime = new Date(currentInfo.time).getHours();
      if (timeNum === currentTime) {
        hourlyWeather.className = "current-hour";

        setTimeout(() => {
          dailyResult.scrollTo({
            left: hourlyWeather.offsetLeft - dailyResult.clientWidth / 3,
            behavior: "smooth",
          });
        }, 0);
      }
    }

    ///////////////////////////////
    // weekly Report Header Row //
    /////////////////////////////
    weeklyWeather.textContent = "";
    const measuingNames = makeEl({ elTag: "li", elClass: "header-row" });
    const day = makeEl({ elTag: "p", elClass: "dayRepresentaion", elText: "Day" });
    const sunrise = makeEl({ elTag: "p", elClass: "sunrise" });
    const sunset = makeEl({ elTag: "p", elClass: "sunset" });
    const minTemp = makeEl({ elTag: "p", elClass: "min-temp" });
    const maxTemp = makeEl({ elTag: "p", elClass: "max-temp" });
    measuingNames.append(day, sunrise, sunset, minTemp, maxTemp);
    weeklyWeather.append(measuingNames);

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

      // Adding Info For Chart Data Variales///////////////////////////////////////
      rainChartData.push(dailyInfo.rain_sum[i]);
      minTempChartData.push(dailyInfo.temperature_2m_min[i]);
      maxTempChartData.push(dailyInfo.temperature_2m_max[i]);
      windSpeedChartData.push(dailyInfo.wind_speed_10m_max[i]);
    }

    ///////////////////////////
    // Weekly weather chart //
    /////////////////////////
    const ctx = document.getElementById("chart");
    const prevChartBtn = document.getElementById("chart__previous");
    const nextChartBtn = document.getElementById("chart__next");

    Chart.defaults.color = "#ffffff";
    // Chart.defaults.font.size = 14;

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
              backgroundColor: "rgb(34, 2, 178)",
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
      if (chart) {
        chart.destroy();
      }
      chart = new Chart(ctx, {
        type: weatherCharts[index].type,
        data: weatherCharts[index].data,

        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
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
    currentTemp.textContent = `${response.data.current_weather.temperature}°C`;
    chosenCity.value = "";
  } catch (errot) {
    console.error(error);
  }
}
