'use strict';

const axios = require('axios');

const host = 'https://api.openweathermap.org/data/2.5';
const apiKey = 'd5f48b6e1364b0d26d4fbdaadadc75a3';


function askForWeatherHandler(location) {

return new Promise((resolve, reject) => {
    let path = `${host}/weather?q=${location}&appid=${apiKey}&units=metric&lang=th`;
    axios.get(path).then(function(res) {
    let temp_c = res.data.main.temp;
    let condition = res.data.weather[0].description;

    if (res.data.main.temp && res.data.weather[0].description) {
        console.log(`สภาพอากาศที่${location}มีอุณหภูมิอยู่ที่ ${temp_c} องศาเซลเซียสมี${condition}`);
    } else {
        console.log(`ดูเหมือนว่าจะไม่เจอข้อมูลสภาพอากาศของ${location}นะ`);
    }
    resolve();
    });
});
}

askForWeatherHandler("เชียงใหม่")





