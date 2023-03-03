'use strict';

const express = require('express');
const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const admin = require("firebase-admin");

const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment');


const app = express();
app.use(express.json());

const axios = require('axios');

admin.initializeApp({
    credential: admin.credential.cert({
        "type": "service_account",
        "project_id": "chat-bot-project-tr9v",
        "private_key_id": "c96b9173fa061ee4ca4fe6198f713be4759aed26",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDYYzFa3bICBRYb\nyB5aI3dbbaPXbyLCP4fDScm5iI+8QDe8BkPo/3+gKrn7wXc4wP49BcitZWUyIsLd\nwnYxEOOyOwQMMNWDaxpa04JMIz2eIZ/VFz+n0yb6xdHy3xoc7GfJYBTEDalQ3lCE\nDrZHb4otZ2MKDqF4VxCIlb6cY8qLYOYtoiqgaT7FT487Yv9ZPUbiKMGBfzQwI91i\nEUadywG6OYMy2AsvrzQxfw6Lg4X38VvgVApqs7OXMif33Nu7ybRAaVXgwVyVa75x\n77lwoBb0EVBF9wR6GDrENeTgqO+g6bOCuPzrjbHvcmms8Ov4XzI8PUjsCRIXyL9F\nP1iCMEk5AgMBAAECggEAFOzGrYxJtfNK94XLFZlfZep80QzwtgsRtFtS1Au2JpSp\nLxgGAiaO72yiToufXVAgZcNE7CuldQsyf+JZrpX9BtO5KPqh8xLs2gKhE37G6x9C\nRwd4AuEi4FY33r4fVtOvl6QgbfMKQAU3kQWhL9hD6u8X/zV5/NqigSrF43as8/xN\nq+KUq3Pg6j4KovpqSQ/AyLc28iwz4OaEtbgfUx7cbutOY2gVcctPVHgaNfvrTJLi\nTb+aVO6WnrBb/ZSqrwvt6rdse2yMARzKe8BJjk7OKy+o8jTPqCmnuDSgDT3a8PZF\nNkSgPEpMfhpA06hWjQswiY2iuatYgDI42cbtkmeieQKBgQD+2l0SvdYuD3aIZnga\nnPR7AKbp1bICKHvD4/uiO5mYMEQdBZuDxfNAV96nNA/0Y0yp8hBKLstZrsyzShXW\nYYYdt+/U9BK8lFufBFx+fiiHAlEPfLru3jUCjxeFaWMlB4A+xBQhtaKCfGR0jOdf\nRJ1OJOhWWaQioQf4v4tsUSL2bQKBgQDZXIKSTJZ75Gd2ZoRxRNDumeh1RlMZ3q48\nLojOFL/SIQthqgQfxAaYtXnrsMx8VVulhjZWMnVi7L1To3hxZjIt8icr8NJGqlL4\nxND1+D/CHVfy/eDmP1n2wP2kmz9m1RDngP0EYEAvIVjFXL5YzM/8QeaO8l5idxuK\nO8o0zrQOfQKBgQDq9F5CXQoMxOy+q9mmj3VFwUAg7IaEPtZ7rr/avZ/JExZ4uya4\nwdKVS21WMUVURgfz1dr2yVVohSLrWC3xy09eLqnJZouvmAcv/1FWvPCYJ6ab5J5i\ngjHU/h7tPE/PX674LsVwnogITK5AVXcp+ZQc6yHYGiScWGGFDvJ3FgZpsQKBgEDj\nwkNExAQWiuCo+E8MWUdyARjJttNZTDDBP6wuO5nSraApbnPBRKrgOpanQFS58tM2\nfxA6nhq7TEYk3jcUaFSZHyKaEVxxSrXjo/Jae0ZLFk9/hV2XehcVRGOYyVO8tgA2\n3NIqnd60GNlKt7Sw6EKJtffk2VKR9lHNSa98KfrNAoGAFXjMesPgCKi4mM5uitX3\nq4036gLO9xBD9ygNuM3reHTRyPQCfVEJP5Nd0b/kzyDdnRgpNWZGxqN/2SzNx9uG\nw3+O44+5WliWxbecOVmCsds2EalmfMdiH94iIW1eliUi2cj9j/fyi5TQ4QPGRHnI\nbhGnEV21NK0ZC/wY4yRMOQo=\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-9ufjy@chat-bot-project-tr9v.iam.gserviceaccount.com",
        "client_id": "116500959000825783272",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-9ufjy%40chat-bot-project-tr9v.iam.gserviceaccount.com"
    }),
    databaseURL: "https://chat-bot-project-tr9v.firebaseio.com/"
});

const host = 'https://api.openweathermap.org/data/2.5';
const apiKey = 'd5f48b6e1364b0d26d4fbdaadadc75a3';

const db = admin.database();

app.post('/', (req, res) => {
    const agent = new WebhookClient({ request: req, response: res });
    console.log('Dialogflow Request intent: ' + agent.intent);

    function findLocationHandler(agent) {
        const roomName = agent.parameters.locationName;
        var ref = db.ref(`rooms/${roomName}`);
        return ref.once("value", function (snapshot) {
            if (snapshot.val().video_url) {
                const payloadJson = {
                    video_url: snapshot.val().video_url,
                };
                let payload = new Payload('DB', payloadJson, { rawPayload: true, sendAsMessage: true });
                agent.add(`ตามแผนที่ของ${roomName}มาได้เลยค่ะ`);
                agent.add(payload);
            } else {
                agent.add(`เหมือนว่าจะไม่มีห้องนี้อยู่นะ`);
            }
        });
    }

    function askForWeatherHandler(agent) {
        const location = agent.parameters.location;
        return new Promise((resolve, reject) => {
            axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`).then(res => {
                if (res.data[0].lat && res.data[0].lon) {
                    let lat = res.data[0].lat;
                    let lon = res.data[0].lon;
                    let path = `${host}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=th`;
                    axios.get(path).then(res => {
                        let temp_c = res.data.main.temp;
                        let condition = res.data.weather[0].description;

                        let result = "";

                        if (res.data.main.temp && res.data.weather[0].description) {
                            result = `สภาพอากาศที่${location}มีอุณหภูมิอยู่ที่ ${temp_c} องศาเซลเซียสและมี${condition}`;
                            agent.add(result);
                        } else {
                            result = `ดูเหมือนว่าฉันจะหาข้อมูลสภาพอากาศของ${location}ไม่เจอนะ`;
                            agent.add(result);
                        }
                        return resolve(result);
                    }).catch(error => { console.error(error); return reject(error); });

                } else {
                    agent.add(`ดูเหมือนว่าฉันจะหาข้อมูลสภาพอากาศของ${location}ไม่เจอนะ`);
                    return resolve(`ดูเหมือนว่าฉันจะหาข้อมูลสภาพอากาศของ${location}ไม่เจอนะ`);
                }

            }).catch(error => { console.error(error); return reject(error); });

        });
    }
    function askForAirQualityHandler(agent) {
        const location = agent.parameters.location;
        return new Promise((resolve, reject) => {
            axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`).then(res => {
                if (res.data[0].lat && res.data[0].lon) {
                    let lat = res.data[0].lat;
                    let lon = res.data[0].lon;
                    let path = `${host}/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
                    axios.get(path).then(res => {
                        let pm2_5 = res.data.list[0].components.pm2_5;
                        let result = "";

                        if (res.data.list[0].components.pm2_5) {
                            result = `ตอนนี้ที่${location}มีดัชนีคุณภาพอากาศอยู่ที่ ${pm2_5} AQI`;
                            agent.add(result);
                        } else {
                            result = `ดูเหมือนว่าฉันจะหาข้อมูลสภาพอากาศของ${location}ไม่เจอนะ`;
                            agent.add(result);
                        }
                        return resolve(result);
                    }).catch(error => { console.error(error); return reject(error); });

                } else {
                    agent.add(`ดูเหมือนว่าฉันจะหาข้อมูลของ${location}ไม่เจอนะ`);
                    return resolve(`ดูเหมือนว่าฉันจะหาข้อมูลของ${location}ไม่เจอนะ`);
                }

            }).catch(error => { console.error(error); return reject(error); });

        });
    }

    function askForProfHandler(agent) {
        const profName = agent.parameters.profName;
        const askedTime = moment(agent.parameters.time.date_time);



        let location = null;
        let subject = null;

        const thaiDayDict = {
            "Monday" : "วันจันทร์",
            "Tuesday" : "วันอังคาร",
            "Wednesday" : "วันพุธ",
            "Thursday" : "วันพฤหัสบดี",
            "Friday" : "วันศุกร์",
            "Saturday" : "วันเสาร์",
        };

        const profNameDict = {
            "จักรพงศ์": "juggapong",
            "ลัชนา": "lachana",
            "กานต์": "karn",
            "โดม": "dome",
            "ศันสนีย์": "sansanee",
            "ชินวัตร": "chinawat",
            "ภาสกร": "paskorn"
            // have more //
        };

        function checkInDict(name, dict) {
            if (dict[name]) {
                return dict[name];
            } else {
                return "data not found in dictionary";
            }
        }

        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream('./timetable.csv')
                .pipe(csv());

            stream.on('data', (row) => {
                const prof = row['Who'];
                const startDate = moment(row['Start Date'], 'MM/DD/YYYY').format('dddd');
                const startTime = moment(row['Start Time'], 'HH:mm A');
                const endTime = moment(row['End Time'], 'HH:mm A');

                const askedTimeStr = askedTime.format('HH:mm:ss');
                const startTimeStr = startTime.format('HH:mm:ss');
                const endTimeStr = endTime.format('HH:mm:ss');

                const isProfMatch = prof === checkInDict(profName,profNameDict);
                const isDateInRange = startDate === askedTime.format('dddd');
                const isTimeInRange = askedTimeStr >= startTimeStr && askedTimeStr <= endTimeStr;

                if (isProfMatch && isDateInRange && isTimeInRange) {
                    location = row['Location'];
                    subject = row['Subject'];
                }
            });

            stream.on('end', () => {
                if (location && subject) {
                    agent.add(`เวลา ${askedTime.format("HH:mm")} ของ${checkInDict(askedTime.format('dddd'),thaiDayDict)}อาจารย์${profName}อยู่ที่ห้อง ${location} และกำลังสอนวิชา ${subject} อยู่ค่ะ`);
                    resolve(`เวลา ${askedTime.format("HH:mm")} ของ${checkInDict(askedTime.format('dddd'),thaiDayDict)}อาจารย์${profName}อยู่ที่ห้อง ${location} และกำลังสอนวิชา ${subject} อยู่ค่ะ`);
                } else {
                    agent.add(`ไม่มีข้อมูลของอาจารย์${profName}ในเวลา ${askedTime.format("HH:mm")} ของ${checkInDict(askedTime.format('dddd'),thaiDayDict)}ค่ะ`);
                    resolve(`ไม่มีข้อมูลของอาจารย์${profName}ในเวลา ${askedTime.format("HH:mm")} ของ${checkInDict(askedTime.format('dddd'),thaiDayDict)}ค่ะ`);
                }
            });

            stream.on('error', (err) => {
                reject(err);
            });
        });
    }


    function askWhereIsProfRoomHandler(agent) {
        const profName = agent.parameters.profName;
        var ref = db.ref(`prof/${profName}`);
        return ref.once("value", function (snapshot) {
            if (snapshot.val().room) {
                agent.add(`${profName}อยู่ห้อง ${snapshot.val().room}`);
            } else {
                agent.add(`เหมือนว่าจะไม่มีอาจารย์นี้อยู่นะ`);
            }
        });

    }

    let intentMap = new Map();
    intentMap.set('askForRoomLocation', findLocationHandler);
    intentMap.set('askForWeather', askForWeatherHandler);
    intentMap.set('askForWeather - andAirQuality', askForAirQualityHandler);
    intentMap.set('askForProf', askForProfHandler);
    intentMap.set('askForProf - whereIsProfRoom', askWhereIsProfRoomHandler);
    agent.handleRequest(intentMap);
});


app.listen(3030, () => {
    console.log('Server listening on port 3030');
});
