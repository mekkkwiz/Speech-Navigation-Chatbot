// // const fs = require('fs');
// const csv = require('csv-parser');
// const moment = require('moment');
// const { Storage } = require('@google-cloud/storage');
// const axios = require('axios');
// const qrcode = require('qrcode');
// const { Payload } = require('dialogflow-fulfillment');

// const storage = new Storage();
// const bucket = storage.bucket("chat-bot-project-tr9v.appspot.com");
// const csv_timetable_new = bucket.file("data/timetable_new.csv");
// const csv_profName_room = bucket.file("data/profName-room.csv");

// const profNameDict = {
//     "จักรพงศ์": "juggapong",
//     "ลัชนา": "lachana",
//     "กานต์": "karn",
//     "โดม": "dome",
//     "ศันสนีย์": "sansanee",
//     "ชินวัตร": "chinawat",
//     "ภาสกร": "paskorn",
//     "ณัฐพล": "natthanan",
//     "ณาริศรา": "narissara",
//     "ยุทธพงษ์": "yuthapong",
//     "สันพวาส": "sanpawat",
//     "เกษมสิทธิ์": "kasemsit",
//     "ปทิเวศ": "patiwet",
//     "อัญญา": "anya",
//     "ศักดิ์กษิต": "sakgasit",
//     "กำพล": "kampol",
//     "พฤกษ์": "pruet",
//     "เมียว": "myo",
//     "อานันท์": "arnan",
//     "เกิดศักดิ์": "ken",
//     "ทรัสพงศ์": "trasapong"
//     // add more here
// };

// function checkInDict(name, dict) {
//     if (dict[name]) {
//         return dict[name];
//     } else {
//         return `data [${name}] not found in dictionary [${dict}]`;
//     }
// }


// async function askForProf(profName, askedTime) {
//     let location = null;
//     let subject = null;


//     csv_timetable_new.createReadStream()
//         .pipe(csv())
//         .on('data', (row) => {
//             const prof = row['Who'];
//             const startDate = moment(row['Start Date'], 'DD/MM/YYYY').format('dddd');
//             // const endDate = moment(row['End Date'], 'MM/DD/YYYY').toDate();
//             const startTime = moment(row['Start Time'], 'HH:mm A');
//             const endTime = moment(row['End Time'], 'HH:mm A');

//             const askedTimeStr = askedTime.format('HH:mm:ss');
//             const startTimeStr = startTime.format('HH:mm:ss');
//             const endTimeStr = endTime.format('HH:mm:ss');

//             const professors = prof.split(',').map((name) => name.trim());

//             // Check if profName matches any of the names in the professors array
//             const isProfMatch = professors.reduce((acc, curr) => {
//               // If the accumulator is already true, keep it true
//                 if (acc) return acc;
//               // Check if the current name matches profName using checkInDict
//                 return checkInDict(profName, profNameDict) === curr;
//             }, false);
//             const isDateInRange = startDate === askedTime.format('dddd');
//             const isTimeInRange = askedTimeStr >= startTimeStr && askedTimeStr <= endTimeStr;

//             if (isProfMatch && isDateInRange && isTimeInRange) {
//                 location = row['Location'];
//                 subject = row['Subject'];
//             }
//         })
//         .on('end', () => {
//             if (location && subject) {
//                 console.log(`อาจารย์${profName}ตอนนี้อยู่ที่ห้อง ${location} กำลังสอนวิชา ${subject} อยู่ค่ะ`);
//             } else {
//                 console.log(`ไม่มีข้อมูลของอาจารย์${profName}ในเวลาที่ให้มาค่ะ`);
//             }
//         });
// }

// function askWhereIsProfRoomHandler(profName) {
//     // const profName = agent.parameters.profName;
//     let room = null;

//     // Read the CSV file
//     const stream = csv_profName_room.createReadStream().pipe(csv())

//     stream.on('data', (data) => {
//         if (checkInDict(profName, profNameDict) == data.ProfName) {
//             room = data.Room;
//         }
//     })

//     stream.on('end', () => {
//         // Check if the professor exists in the map
//         if (room) {
//             console.log(`อาจารย์${profName}อยู่ห้อง ${room}`);
//         } else {
//             console.log(`เหมือนว่าจะไม่มีอาจารย์นี้อยู่นะ`);
//         }
//     });
//     // console.log(`done`);
// }

// const iqairHost = 'http://api.airvisual.com/v2/nearest_city';
// const iqairApiKey = 'a5a4f94c-09bf-4489-bcea-b76272537f75';
// const openWeatherHost = 'https://api.openweathermap.org/data/2.5';
// const openWeatherApiKey = 'd5f48b6e1364b0d26d4fbdaadadc75a3';

// function askForAirQualityHandler(location) {
//     // const location = agent.parameters.location;
//     return new Promise((resolve, reject) => {
//         axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${openWeatherApiKey}`).then(res => {
//             if (res.data[0].lat && res.data[0].lon) {
//                 let lat = res.data[0].lat;
//                 let lon = res.data[0].lon;
//                 let path = `${iqairHost}?lat=${lat}&lon=${lon}&key=${iqairApiKey}`;
//                 axios.get(path).then(res => {
//                     console.log(res.data.data.current.pollution.aqius);

//                     let time = new Date(res.data.data.current.weather.ts).toLocaleTimeString('th-TH', { hour: 'numeric',minute: 'numeric',timeZone: 'Asia/Bangkok' });
//                     console.log(time);
//                     // let pm2_5 = res.data.list[0].components.pm2_5;
//                     // let result = "";

//                     // if (res.data.list[0].components.pm2_5) {
//                     //     result = `ตอนนี้ที่${location}มีดัชนีคุณภาพอากาศอยู่ที่ ${pm2_5} AQI`;
//                     //     console.log(result);
//                     // } else {
//                     //     result = `ดูเหมือนว่าฉันจะหาข้อมูลสภาพอากาศของ${location}ไม่เจอนะ`;
//                     //     console.log(result);
//                     // }
//                     // return resolve(result);
//                 }).catch(error => { console.error(error); return reject(error); });

//             } else {
//                 console.log(`ดูเหมือนว่าฉันจะหาข้อมูลของ${location}ไม่เจอนะ`);
//                 return resolve(`ดูเหมือนว่าฉันจะหาข้อมูลของ${location}ไม่เจอนะ`);
//             }

//         }).catch(error => { console.error(error); return reject(error); });

//     });
// }

// async function requestQrCodeHandler(location) {
//     // const location = agent.parameters.location;
//     let roomName = location.replace(".", "_").trim();

//     let videoUrl = null;
//     const config = {
//         action: 'read',
//         expires: Date.now() + 1000 * 60 * 5, // 5 minutes
//     };

//     try {
//         const [files] = await bucket.getFiles({
//             directory: `rooms/${roomName}`,
//             autoPaginate: false,
//         });

//         console.log(files);
        
//         for (const file of files) {
//             const [metadata] = await file.getMetadata();
//             if (metadata.contentType.includes('video')) {
//                 videoUrl = await file.getSignedUrl(config);
//                 break;
//             }
//         }
//     } catch (err) {
//         console.error(err);
//     }

//     if (!videoUrl) {
//         console.log(`ขอโทษค่ะ ไม่พบวิดีโอสำหรับห้อง ${location}`);
//         return;
//     }

//     return qrcode.toDataURL(videoUrl)
//         .then(dataUrl => {
//             const payloadJson = {
//                 imageUrl: dataUrl
//             };
//             let payload = new Payload('QR_CODE', payloadJson, { rawPayload: true, sendAsMessage: true });
//             roomName = location.replace("ห้อง", "").trim();
//             console.log(`นี่คือ QR Code สำหรับวิดีโอของห้อง${roomName} QR Code นี้มีอายุการใช้งาน 5 นาทีนะคะ`);
//             console.log(payload);
//         })
//         .catch(err => {
//             console.error(err);
//             console.log(`ขอโทษค่ะ ไม่สามารถสร้าง QR Code ได้ในขณะนี้`);
//         });
// }

// // askWhereIsProfRoomHandler("ลัชนา")
// askForProf("อัญญา", moment("2023-03-21T10:00:00+07:00"));