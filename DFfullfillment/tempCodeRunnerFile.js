const nameDict = {
    "จักรพงศ์" : "juggapong",
    "ลัชนา" : "lachana",
    "กานต์" : "karn",
    "โดม" : "dome",
    "ศันสนีย์" : "sansanee",
    "ชินวัตร" : "chinawat",
    "ภาสกร" : "paskorn"
};

function checkNameInDict(name, dict) {
    if (dict[name]) {
        return dict[name];
    } else {
        return "Name not found in dictionary";
    }
}

console.log(checkNameInDict("ภาสกร", nameDict));