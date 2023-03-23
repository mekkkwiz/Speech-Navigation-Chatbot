'use strict';

const express = require('express');
const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const admin = require("firebase-admin");
const { Storage } = require('@google-cloud/storage');

// const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment');
const serviceAccount = require("./serviceAccountKey.json");

const app = express();
app.use(express.json());

const axios = require('axios');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chat-bot-project-tr9v.firebaseio.com/"
});

const iqairHost = 'http://api.airvisual.com/v2/nearest_city';
const iqairApiKey = 'a5a4f94c-09bf-4489-bcea-b76272537f75';
const openWeatherHost = 'https://api.openweathermap.org/data/2.5';
const openWeatherApiKey = 'd5f48b6e1364b0d26d4fbdaadadc75a3';

const db = admin.database();

const storage = new Storage();
const bucket = storage.bucket("chat-bot-project-tr9v.appspot.com");
const csv_timetable_new = bucket.file("data/timetable_new.csv");
const csv_profName_room = bucket.file("data/profName-room.csv");

const thaiDayDict = {
  "Monday": "วันจันทร์",
  "Tuesday": "วันอังคาร",
  "Wednesday": "วันพุธ",
  "Thursday": "วันพฤหัสบดี",
  "Friday": "วันศุกร์",
  "Saturday": "วันเสาร์",
  "Sunday": "วันอาทิตย์"
};

const profNameDict = {
  "จักรพงศ์": "juggapong",
  "ลัชนา": "lachana",
  "กานต์": "karn",
  "โดม": "dome",
  "ศันสนีย์": "sansanee",
  "ชินวัตร": "chinawat",
  "ภาสกร": "paskorn",
  "ณัฐนันท์": "natthanan",
  "นริศรา": "narissara",
  "ยุทธพงษ์": "yuthapong",
  "สรรพวรรธน์": "sanpawat",
  "เกษมสิทธิ์": "kasemsit",
  "ปทิเวศ": "patiwet",
  "อัญญา": "anya",
  "ศักดิ์กษิต": "sakgasit",
  "กำพล": "kampol",
  "พฤษภ์": "pruet",
  "เมียว": "myo",
  "อานันท์": "arnan",
  "Kenneth": "ken",
  "ตรัสพงศ์": "trasapong",
  "นวดนย์": "navadon",
  "ธนาทิพย์": "thanatip",
  // add more here
};

const CURRENT_FLOOR = 5;
const ANOTHER_FLOOR = 4;

function checkInDict(name, dict) {
  if (dict[name]) {
    return dict[name];
  } else {
    return `data [${name}] not found in dictionary [${dict}]`;
  }
}

app.post('/', (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });
  // get sessions
  console.log('Dialogflow Request intent: ' + agent.intent);

  async function findLocationHandler(agent) {
    let roomName = agent.parameters.locationName;
    let room = roomName.includes(".") ? roomName.replace(".", "_").trim() : roomName.trim();

    // Check if the room is on the CURRENT_FLOOR or is a toilet
    if (room == "ห้องน้ำ") {
      room = `${CURRENT_FLOOR}_toilet`;
    }
    console.log("\t", room, room.startsWith(`${CURRENT_FLOOR}`) || room == "ห้องน้ำ");

    if (room.startsWith(`${CURRENT_FLOOR}`) || room == "ห้องน้ำ") {
      var ref = db.ref(`rooms/${room}`);
      try {
        const snapshot = await ref.once("value");
        if (snapshot.val()) {
          const payloadJson = {
            video_url: snapshot.val().video_url,
          };
          let payload = new Payload('VIDEO_URL', payloadJson, { rawPayload: true, sendAsMessage: true });
          let newRoomName = roomName.replace("ห้อง", "").trim();
          agent.add(`ตามแผนที่ของห้อง ${newRoomName} มาได้เลยค่ะ`);
          agent.add(payload);
        } else {
          agent.add(`เหมือนว่าจะไม่มีห้องนี้อยู่ใน database ค่ะ`);
        }
      } catch (error) {
        console.error(error);
        agent.add(`มีข้อผิดพลาดเกี่ยวกับการเชื่อมต่อกับฐานข้อมูล`);
      }
    } else {
      // Check if the room exists in ANOTHER_FLOOR
      ref = db.ref(`rooms/${room}`);
      try {
        const snapshot_1 = await ref.once("value");
        if (snapshot_1.val()) {
          agent.add(`เหมือนว่าห้องนี้อยู่ที่ชั้น ${ANOTHER_FLOOR} ค่ะ ลองไปที่ชั้น ${ANOTHER_FLOOR} และถามเพื่อนของฉันที่อยู่ที่นั่นให้หาห้องนี้ให้นะคะ`);
        } else {
          agent.add(`เหมือนว่าจะไม่มีห้องนี้อยู่ใน database ค่ะ`);
        }
      } catch (error_1) {
        console.error(error_1);
        agent.add(`มีข้อผิดพลาดเกี่ยวกับการเชื่อมต่อกับฐานข้อมูล`);
      }
    }
  }




  function askForWeatherHandler(agent) {
    const location = agent.parameters.location;
    return new Promise((resolve, reject) => {
      axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${openWeatherApiKey}`).then(res => {
        if (res.data[0].lat && res.data[0].lon) {
          let lat = res.data[0].lat;
          let lon = res.data[0].lon;
          let path = `${openWeatherHost}/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric&lang=th`;
          axios.get(path).then(res => {
            let temp_c = res.data.main.temp;
            // let condition = res.data.weather[0].description;
            let conditionCode = res.data.weather[0].id;

            let result = "";

            if (res.data.main.temp && res.data.weather[0].description) {
              if (conditionCode === 800) {
                result = `สภาพอากาศใน${location}ตอนนี้ท้องฟ้าแจ่มใสและมีอุณหภูมิอยู่ที่ ${temp_c} องศาเซลเซียสค่ะ`;
              } else if (conditionCode >= 200 && conditionCode <= 232) {
                result = `ดูเหมือนว่า${location}จะมีฟ้าผ่า ฝนฟ้าคะนอง และมีอุณหภูมิ ${temp_c} องศาเซลเซียสค่ะ`;
              } else if (conditionCode >= 300 && conditionCode <= 321) {
                result = `ดูเหมือนว่า${location}จะมีฝนตกเบาๆ และมีอุณหภูมิอยู่ที่ ${temp_c} องศาเซลเซียสค่ะ`;
              } else if (conditionCode >= 500 && conditionCode <= 531) {
                result = `ดูเหมือนว่า${location}จะมีฝนตกหนัก และมีอุณหภูมิอยู่ที่ ${temp_c} องศาเซลเซียสค่ะ`;
              } else if (conditionCode >= 600 && conditionCode <= 622) {
                result = `ดูเหมือนว่า${location}จะมีหิมะตก และมีอุณหภูมิอยู่ที่ ${temp_c} องศาเซลเซียสค่ะ`;
              } else if (conditionCode >= 701 && conditionCode <= 781) {
                result = `ดูเหมือนว่า${location}จะมีสภาพอากาศแปรปรวน และมีอุณหภูมิอยู่ที่ ${temp_c} องศาเซลเซียสค่ะ`;
              } else if (conditionCode >= 801 && conditionCode <= 804) {
                result = `ดูเหมือนว่า${location}จะมีเมฆเป็นส่วนมาก และมีอุณหภูมิอยู่ที่ ${temp_c} องศาเซลเซียสค่ะ`;
              } else {
                result = `ขออภัยค่ะ ฉันไม่มีข้อมูลเกี่ยวกับสภาพอากาศของ${location}ในขณะนี้`
              }
              agent.add(result);
            } else {
              result = `ดูเหมือนว่าฉันไม่สามารถหาข้อมูลสภาพอากาศของ${location}ได้ค่ะ อาจเป็นเพราะข้อมูลไม่เพียงพอ หรือมีข้อผิดพลาดในการเชื่อมต่อ API กรุณาลองใหม่อีกครั้งในภายหลังค่ะ`;
              agent.add(result);
            }
            if ((conditionCode >= 200 && conditionCode <= 232) ||   // พายุฝนฟ้าคะนอง
              (conditionCode >= 300 && conditionCode <= 321) ||   // ฝนตกเบาๆ
              (conditionCode >= 500 && conditionCode <= 531) ||   // ฝนตกหนัก
              conditionCode >= 701 && conditionCode <= 781        // อาการแปรปรวน
            ) {
              agent.add("ถ้าจะออกไปด้านนอกอย่าลืมพกร่มไปด้วยนะคะ");
            } else if (temp_c >= 30) {
              agent.add("ตอนนี้ร้อนมาก ถ้าจะออกไปด้านนอกทาครีมกันแดดด้วยก็ดีนะคะ");
            } else if (temp_c >= 20) {
              agent.add("อุณหภูมิเหมาะสมสำหรับกิจกรรมกลางแจ้งมากค่ะ");
            } else {
              agent.add("ตอนนี้หนาวมาก อย่าลืมใส่เสื้อกันหนาวด้วยนะคะ");
            }
            return resolve(result);
          }).catch(error => { console.error(error); return reject(error); });

        } else {
          agent.add(`ดูเหมือนว่าฉันไม่สามารถหาข้อมูลสภาพอากาศของ${location}ได้ อาจเป็นเพราะข้อมูลไม่เพียงพอ หรือมีข้อผิดพลาดในการเชื่อมต่อ API กรุณาลองใหม่อีกครั้งในภายหลัง`);
          return resolve(`ดูเหมือนว่าฉันไม่สามารถหาข้อมูลสภาพอากาศของ${location} ได้ อาจเป็นเพราะข้อมูลไม่เพียงพอ หรือมีข้อผิดพลาดในการเชื่อมต่อ API กรุณาลองใหม่อีกครั้งในภายหลัง`);
        }

      }).catch(error => { console.error(error); return reject(error); });

    });
  }
  function askForAirQualityHandler(agent) {
    const location = agent.parameters.location;
    return new Promise((resolve, reject) => {
      axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${openWeatherApiKey}`).then(res => {
        if (res.data[0].lat && res.data[0].lon) {
          let lat = res.data[0].lat;
          let lon = res.data[0].lon;
          let path = `${iqairHost}?lat=${lat}&lon=${lon}&key=${iqairApiKey}`;
          axios.get(path).then(res => {
            let aqius = res.data.data.current.pollution.aqius;
            let result = "";
            let time = new Date(res.data.data.current.weather.ts).toLocaleTimeString(
              'th-TH', {
              hour: 'numeric',
              minute: 'numeric',
              timeZone: 'Asia/Bangkok'
            });
            if (aqius) {
              result = `ตอนนี้ที่${location}เวลา ${time} มีดัชนีคุณภาพอากาศอยู่ที่ ${aqius} USAQI`;
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
    const askedTime = moment(agent.parameters.time.date_time || agent.parameters.time)

    console.log(`Asked for prof ${profName} at ${agent.parameters.time.date_time || agent.parameters.tim}`);

    let location = null;
    let subject = null;

    return new Promise((resolve, reject) => {
      csv_timetable_new.createReadStream()
        .pipe(csv())
        .on('data', (row) => {
          const prof = row['Who'];
          const startDate = moment(row['Start Date'], 'DD/MM/YYYY').format('dddd');
          const startTime = moment(row['Start Time'], 'HH:mm A');
          const endTime = moment(row['End Time'], 'HH:mm A');

          const askedTimeStr = askedTime.format('HH:mm:ss');
          const startTimeStr = startTime.format('HH:mm:ss');
          const endTimeStr = endTime.format('HH:mm:ss');

          // Split the value of row['Who'] using comma as the separator and trim any whitespace
          // For case like kasemsit,navadon as CSV result at prof
          const professors = prof.split(',').map((name) => name.trim());

          // Check if profName matches any of the names in the professors array
          const isProfMatch = professors.reduce((acc, curr) => {
            // If the accumulator is already true, keep it true
            if (acc) return acc;
            // Check if the current name matches profName using checkInDict
            return checkInDict(profName, profNameDict) === curr;
          }, false);
          const isDateInRange = startDate === askedTime.format('dddd');
          const isTimeInRange = askedTimeStr >= startTimeStr && askedTimeStr <= endTimeStr;
          // console.log(isProfMatch,isDateInRange,isTimeInRange)

          if (isProfMatch && isDateInRange && isTimeInRange) {
            location = row['Location'];
            subject = row['Subject'];
            console.log("\t", profName, location, subject)
          }
        })
        .on('end', () => {
          let time = askedTime.format("HH:mm")
          let day = checkInDict(askedTime.format('dddd'), thaiDayDict)
          // Add the `location` parameter to the `resolve` function
          if (location && subject) {
            let text = `เวลา ${time} ของ${day}อาจารย์${profName}อยู่ที่ห้อง ${location} และกำลังสอนวิชา ${subject} อยู่ค่ะ`
            // make agent add the location parameter to context
            agent.context.set({
              name: 'askforprof-followup',
              lifespan: 3,
              parameters: {
                location: location
              }
            });
            agent.add(text);
            resolve(text);
          } else {
            agent.add(`อาจารย์${profName}อาจจะอยู่ที่ห้องพักอาจารย์ค่ะ`);
            agent.add(`เพราะว่าไม่มีข้อมูลของอาจารย์${profName}ในเวลา ${time} ของ${day}ค่ะ`);
            resolve(`ไม่มีข้อมูลของอาจารย์${profName}ในเวลา ${time} ของ${day}ค่ะ`);
          }
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }


  function askWhereIsProfRoomHandler(agent) {
    const profName = agent.parameters.profName;
    let room = null;

    // Read the CSV file
    return new Promise((resolve, reject) => {
      csv_profName_room.createReadStream()
        .pipe(csv())
        .on('data', (data) => {
          if (checkInDict(profName, profNameDict) == data.ProfName) {
            room = data.Room;
          }
        })
        .on('end', () => {
          console.log("\t", profName, room);
          if (room) {
            agent.context.set({
              name: 'askForProf-whereIsProfRoom-followup',
              lifespan: 3,
              parameters: {
                location: room
              }
            });

            agent.add(`อาจารย์${profName}อยู่ห้อง ${room}`);
            resolve(`อาจารย์${profName}อยู่ห้อง ${room}`);
          } else {
            agent.add(`เหมือนว่าจะไม่มีห้องของอาจารย์${profName}นี้อยู่ใน database นะ`);
            reject(`เหมือนว่าจะไม่มีห้องของอาจารย์${profName}นี้อยู่ใน database นะ`);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async function requestQrCodeHandler(agent) {
    const location = agent.parameters.location;
    let roomName = location.replace(".", "_").trim();

    let videoUrl = '';
    const config = {
      action: 'read',
      expires: Date.now() + 1000 * 60 * 5, // 5 minutes
    };

    let videoFound = false;

    try {
      const [files] = await bucket.getFiles({
        prefix: `rooms/${roomName}/`,
        autoPaginate: false,
      });

      for (const file of files) {
        const [metadata] = await file.getMetadata();
        if (metadata.contentType.includes('video')) {
          videoUrl = (await file.getSignedUrl(config))[0];
          videoFound = true;
          break;
        }
      }
    } catch (err) {
      console.error(err);
    }

    if (!videoFound) {
      agent.add(`ขอโทษค่ะ ไม่พบวิดีโอสำหรับห้อง ${location}`);
      return;
    }

    // Function to shorten the URL using Bitly's API
    async function shortenUrl(longUrl) {
      const CUTTLY_API_URL = 'https://cutt.ly/api/api.php';
      const CUTTLY_API_KEY = '8006027b49dbbc9c260cd4cb04113b99141b2'; // Replace with your Cutt.ly API key

      try {
        const response = await axios.get(CUTTLY_API_URL, {
          params: {
            key: CUTTLY_API_KEY,
            short: longUrl
          }
        })
        console.log(response.data)

        if (response.data.url.status === 7) {
          return response.data.url.shortLink;
        } else {
          console.error('Error shortening the URL, status:', response.data.url.status);
          return longUrl; // Return the original URL if shortening fails
        }
      } catch (error) {
        console.error('Error shortening the URL:', error);
        return longUrl; // Return the original URL if shortening fails
      }
    }

    return shortenUrl(videoUrl)
      .then((shortVideoUrl) => {
        const payloadJson = {
          videoUrl: shortVideoUrl, // Add the shortVideoUrl to the payload
        };
        let payload = new Payload('VIDEO_URL', payloadJson, { rawPayload: true, sendAsMessage: true });
        roomName = location.replace("ห้อง", "").trim();
        agent.add(`นี่คือ URL สำหรับวิดีโอของห้อง${roomName} URL นี้มีอายุการใช้งาน 5 นาทีนะคะ`);
        agent.add(payload);
      })
      .catch((error) => {
        console.error('Error shortening the URL:', error);
        agent.add('ไม่สามารถสร้าง URL สำหรับวิดีโอได้');
      });
  }










  let intentMap = new Map();
  intentMap.set('askForRoomLocation', findLocationHandler);
  intentMap.set('askForWeather', askForWeatherHandler);
  intentMap.set('askForWeather - andAirQuality', askForAirQualityHandler);
  intentMap.set('askForProf', askForProfHandler);
  intentMap.set('askForProf - whereIsProfRoom', askWhereIsProfRoomHandler);
  intentMap.set('askForProf - whereIsProfRoom - HowToGetThere', findLocationHandler);
  intentMap.set('askForProf - HowToGetThere', findLocationHandler);
  intentMap.set('askForRoomLocation - requestQrCode', requestQrCodeHandler);
  agent.handleRequest(intentMap);
});


app.listen(3030, () => {
  console.log('Server listening on port 3030');
});
