document.getElementById("searchcity").addEventListener("click", getCity);
document.getElementById("city").addEventListener("keydown", function(e) {
  if (e.keyCode === 13) {
    getCity();
  }
});

function getCity() {
  var city = document.getElementById("city").value;
  if (city == "") {
    swal("Error", "Please, input city name", "error");
  } else {
    document.getElementById("city").value = "";
    return getWeather(city);
  }
}

function getWeather(city) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://api.openweathermap.org/data/2.5/forecast" + "?q=" + city + "&appid=2b400fcfbb9667f0b901ace06cbaba0d&units=metric");
  xhr.timeout = 5000;
  xhr.ontimeout = function() {
    swal("Error", "Request timeout, repeat late", "error");
  };
  xhr.send();
  xhr.onreadystatechange = function() {
    if (this.readyState != 4) {
      return;
    }
    changeCursorStyle();
    if (this.status != 200) {
      if (this.status == 0) {
        swal("Error", "Check your Internet connection", "error");
      } else {
        if (this.responseText.length != 0) {
          swal("Error", this.status + ": " + this.statusText + " (" + JSON.parse(this.responseText).message + ")", "error");
        } else {
          swal("Error", this.status + ": " + this.statusText, "error");
        }
      }
    } else {
      drawWeather(JSON.parse(this.responseText));
    }
  }
  changeCursorStyle("wait");
}

function drawWeather(obj) {
  var arrTemp = [];
  document.getElementById("bigweather").src = chooseWeatherPic(obj.list[0].weather[0].id, "light", obj.list[0].sys.pod);
  document.getElementById("bigtemp").innerHTML = Math.round(obj.list[0].main.temp) + "°C";
  var description = obj.list[0].weather[0].description;
  document.getElementById("textweather").innerHTML = description[0].toUpperCase() + description.slice(1);
  document.getElementById("locationanddate").innerHTML = obj.city.name + " - " + createDate("long");
  var days = document.getElementById("3daysweather");
  for (var i = 0; i < 3; i++) {
    var temp = [];
    var weather;
    days.children[i].children[1].children[0].innerHTML = createDate("short", i + 1);
    for (var j = 0; j < obj.list.length; j++) {
      if (new Date(obj.list[j].dt * 1000).getDate() == new Date(Date.now() + 24 * 60 * 60 * 1000 * (i + 1)).getDate()) {
        temp.push(obj.list[j].main.temp_max);
        if (new Date(obj.list[j].dt * 1000).getHours() == 12) {
          weather = j + 1;
        }
      }
    }
    days.children[i].children[0].children[0].src = chooseWeatherPic(obj.list[weather].weather[0].id, "dark", "d");
    days.children[i].children[2].children[0].innerHTML = Math.round(Math.max.apply(null, temp)) + "°C";
    days.children[i].children[3].children[0].innerHTML = Math.round(Math.min.apply(null, temp)) + "°C";
    arrTemp.push(Math.round(Math.max.apply(null, temp)));
    arrTemp.push(Math.round(Math.min.apply(null, temp)));
  }
  document.getElementById("svggraph").replaceChild(createSVG(arrTemp), document.getElementById("svggraph").children[0]);
  var timer = setTimeout(function() {
    getWeather(obj.city.name)
  }, 300000);
  sendNotification();
}

function createDate(param, day) {
  var date = new Date();
  var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  switch (param) {
    case "long":
      return days[date.getDay()] + ", " + month[date.getMonth()] + " " + date.getDate();
      break;
    case "short":
      date.setDate(date.getDate() + day);
      return daysShort[date.getDay()];
      break;
  }
}

function chooseWeatherPic(code, color, pod) {
  var path;
  var codeSymbol;
  var pathtofolder;
  code += "";
  if (code == 800) {
    codeSymbol = 800;
  } else if (code[0] == 8 && code % 100 != 0) {
    codeSymbol = 80;
  } else {
    codeSymbol = +code[0];
  }
  if (color == "dark") {
    pathtofolder = "images/weather_dark/";
  } else {
    pathtofolder = "images/weather_light/";
  }
  switch (codeSymbol) {
    case 800:
      if (pod == "d") {
        path = pathtofolder + "clear-d.svg";
      } else {
        path = pathtofolder + "clear-n.svg";
      }
      break;
    case 80:
      if (pod == "d") {
        path = pathtofolder + "cloudy-d.svg";
      } else {
        path = pathtofolder + "cloudy-n.svg";
      }
      break;
    case 2:
      path = pathtofolder + "lighting.svg";
      break;
    case 3:
      path = pathtofolder + "pour-rain.svg";
      break;
    case 5:
      path = pathtofolder + "rain.svg";
      break;
    case 6:
      path = pathtofolder + "snow.svg";
      break;
    case 7:
      path = pathtofolder + "mist.svg";
      break;
    case 9:
      path = pathtofolder + "bad.svg";
      break;
  }
  return path;
}

function createSVG(arrTemp) {
  var y = [];
  var maxT = Math.max.apply(null, arrTemp);
  var minT = Math.min.apply(null, arrTemp);
  var pixelStep = 45 / (maxT - minT);
  for (var i = 0; i < arrTemp.length; i++) {
    y.push(Math.round((maxT - arrTemp[i]) * pixelStep) + 4);
  }
  var svg = document.getElementById("svggraph").children[0].cloneNode(true);
  var points = "4," + y[0] + " 42," + y[1] + " 84," + y[2] + " 126," + y[3] + " 166," + y[4] + " 204," + y[5];
  svg.children[0].setAttribute("points", points);
  for (var i = 0; i < y.length; i++) {
    svg.children[i + 1].setAttribute("cy", y[i]);
  }
  return svg;
}

function changeCursorStyle(status) {
  if (status == "wait") {
    document.body.className = "wait";
  } else {
    document.body.className = "";
  }
}

function sendNotification() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://api.telegram.org/bot462917948:AAFMA8H0d0taOJYIli-twcQWq_JIAILc338/sendMessage?chat_id=57578883&text=started_at:" + new Date);
  xhr.send();
}
