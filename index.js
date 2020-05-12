require("dotenv").config();
const login = require("./app/login");
const { Sequelize, sequelize, Op } = require("./database");
const logger = require("./app/modules/log.js");
const { appStateFile } = require("./config");
const fs = require("fs");
const __GLOBAL = new Object({
	threadBlocked: new Array(),
	userBlocked: new Array(),
	confirm: new Array()
});
const express = require("express");
const app = express();
const cmd = require('node-cmd');
const request = require("request");

app.get("/", function(request, response) {
	response.sendFile(__dirname + "/view/index.html");
});

app.get("/dbviewer", function(request, response) {
	response.sendFile(__dirname + "/config/dbviewer/index.html");
});

app.use(express.static(__dirname + '/config'));

app.use(express.static(__dirname + '/config/dbviewer'));

const listener = app.listen(process.env.PORT, function() {
	console.log("Port: " + listener.address().port);
});

setInterval(() => {
	console.log("Tự động làm mới sau 10 phút");
	cmd.run("pm2 restart 0");
}, 600000);

setInterval(() => {
	request(`http://${process.env.PROJECT_DOMAIN}.glitch.me`, (err, response, body) => {
	});
}, 60000);

request(`https://raw.githubusercontent.com/roxtigger2003/Sumi-chan-bot/master/package.json`, (err, response, body) => {
	if (err) return logger(`không thể gửi request tới server github!`, 2);
	var requestData = parseInt(JSON.parse(body).version);
	fs.readFile(__dirname + "/package.json", "utf-8", (err, data) => {
		if (err) return logger(`không thể đọc file package!`, 2);
		var localData = parseInt(JSON.parse(data).version);
		if (localData < requestData)
			return logger(`Bot đã có bản cập nhật mới! xin vui lòng update`, -1);
		else
			return logger(`hiện tại bot chưa có bản cập nhật nào mới!`, -1);
	});
});

var facebook = ({ Op, models }) => {
	login({ appState: require(appStateFile) }, (error, api) => {
		if (error) return logger(error, 2);
		fs.writeFileSync(appStateFile, JSON.stringify(api.getAppState(), null, "\t"));
		logger("Đăng nhập thành công!", 0);
		logger("source code gốc được đăng tại https://github.com/roxtigger2003/Sumi-chan-bot | Quyền sở hữu thuộc về Catalizcs và SpermLord!")
		api.listenMqtt(require("./app/listen")({ api, Op, models, __GLOBAL }));
	});
}

sequelize.authenticate().then(
	() => logger("Connect database thành công!", 0),
	() => logger("Connect database thất bại!", 2)
).then(() => {
	let models = require("./database/model")({ Sequelize, sequelize });
	facebook({ Op, models });
}).catch(e => {
	logger(`${e.stack}`, 2);
});
// full code by Catalizcs and SpermLord
