var express = require('express');
var router = express.Router();
var captcha = require(__dirname + "/../public/javascripts/CaptchaParser.js");
var fs = require("fs");
var cheerio = require("cheerio");
var request = require("request");
var imgDir = __dirname + "/../public/images/";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


router.get('/', function (req, res, next) {
    var write = fs.createWriteStream(imgDir + "captcha.bmp");
    request.defaults({jar: true});

    var global_cookie;

    request({
        url: "https://vtop.vit.ac.in/student/stud_login.asp",
        jar: true
    }, function (err, resp, body) {


        // var session_id = resp.headers['set-cookie'][1].split('=')[1].split(';')[0];
        // var id_for_cookie=resp.headers['set-cookie'][2].split('=')[1].split(';')[0];
        // var cookie_data="logstudregno=; ASPSESSIONIDSWRDCRRR="+session_id+"; NSC_MCWT-wupq.wju.bd.jo_iuuqt="+id_for_cookie;


        global_cookie = resp.headers['set-cookie'];

        console.log(global_cookie);

        initiate(global_cookie);
    });


    function initiate(cookie) {
        request({
                "url": "https://vtop.vit.ac.in/student/captcha.asp",
                timeout: 20000,
                jar: true,
                "headers": {
                    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "en-US,en;q=0.8",
                    "Connection": "keep-alive",
                    "Cookie": cookie,
                    "Host": "vtop.vit.ac.in",
                    "Referer": "https://vtop.vit.ac.in/student/stud_login.asp",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36"
                }
            }, function (err, resp, body) {

            }
        ).pipe(write).on('close', function () {
            var buf = fs.readFileSync(imgDir + "captcha.bmp");
            var pixMap = captcha.getPixelMapFromBuffer(buf);
            var cap = captcha.getCaptcha(pixMap);
            login(cap, cookie);
        });
    }


    function login(vrfcd, cookie) {
        var reqHeaders = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.8",
            "Cache-Control": "max-age=0",
            "Connection": "keep-alive",
            "Content-Length": "59",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "vtop.vit.ac.in",
            "Cookie": cookie,
            "Origin": "https://vtop.vit.ac.in",
            "Referer": "https://vtop.vit.ac.in/student/stud_login.asp",
            "Upgrade-Insecure-Requests": 1,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36"
        };

        request.post({
                url: 'https://vtop.vit.ac.in/student/stud_login_submit.asp',
                body: "message=&regno=15BEC0584&passwd=Aa1%40bcdebkkb&vrfcd=" + vrfcd,
                headers: reqHeaders,
                followAllRedirects: true,
                jar: true,
                timeout: 10000
            },
            function (err, response, body) {
                global_cookie[0] = response.headers['set-cookie'][0];
                //res.send(body);
                showProfile(global_cookie);

                console.log(global_cookie); // second

                console.log(response.headers['set-cookie']); // third
            }
        );
        function showProfile(cookie) {
            var headers = {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "en-US,en;q=0.8",
                "Connection": "keep-alive",
                "Cookie": cookie,
                "Host": "vtop.vit.ac.in",
                "Referer": "https://vtop.vit.ac.in/student/content.asp",
                "Upgrade-Insecure-Requests": 1,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36"
            };
            request({
                "url": "https://vtop.vit.ac.in/student/course_regular.asp?sem=WS",
                "headers": headers,
                jar:true,
                followAllRedirects:true

            }, function (err, resp, body) {
                res.send(body);

                console.log(cookie); // last one to check
            });
        }
    }


// request("http://pk-insta-messenger.herokuapp.com/", function (error, resp, body) {
//     data = new SetData(resp);
//     var $ = cheerio.load(data.data.body);
//     var formdetails = ($(":input[name='authenticity_token']").attr("value"));
//     login(formdetails);
// });
});

module.exports = router;




