/**
 * 会友行人员名单导入脚本
 */
var fs = require('fs');
var csv = require('csv');
var Q = require('q');
var request = require('request');
var config = require('../package.json');


var importSeeting = {
    meetingId:'554a34cee4b0679ef61499d6',
    contactData:[]
}

readCSVFile('../testFolder/attender.csv')
.then(function(data){
    importSeeting.contactData = data;
    var promises = [];
    data.forEach(function(user){
        promises.push(meetingApply(user[0],user[1]));
    });
    return Q.all(promises);
})
.then(function(afterApply){
    var promises = [];

    for (var i = 0; i < afterApply.length; i++) {
        console.log(afterApply[i]);

        var params = {
            mobilePhoneNumber:importSeeting.contactData[i][1],
            username:importSeeting.contactData[i][0],
            notification:'消息推送测试'
        }

        promises.push(runCloudFunc('smsBoard',params));
    };

    return Q.all(promises);
})
.then(function(success){
    console.log(success);
},function(err){    
    console.log(err);
});


/**
 * 用户注册或者报名，密码为后六位
 */
function meetingApply(userName,mobilePhoneNumber){
    var deferred = Q.defer();
    var params = {
        meetingId:importSeeting.meetingId,
        mobilePhoneNumber:mobilePhoneNumber,
        name:userName,
        message:'主办方名单导入',
    }

    runCloudFunc('',params,'meetingApply').then(function(result){
        deferred.resolve(result);
    });

    return deferred.promise;
}


/**
 * 读取CSV文件
 * @param  path 文件路径
 */
function readCSVFile(path){
    return Q.Promise(function(resolve,reject,notify){
        var attenerString = fs.readFileSync(path,'utf-8');
        csv.parse(attenerString,function(err,data){
            // 去除空格
            data.forEach(function(line){
                for(var i=0;i<line.length;i++){
                    line[i] = line[i].trim();
                }
            });

            if (!err) {
                resolve(data);
            }else{
                reject(new Error(err));
            }
        });
    });
}


/**
 * 发送网络请求
 */
function runCloudFunc(func,params,thirdParty){
    return Q.Promise(function(resolve,reject,notify){
        if (typeof(thirdParty) == 'undefined') {
            thirdParty = "CallCloudFunc";
        } 

        params.func = func;
        var cloudFuncUrl = config.cloudFuncUrl + '/' + thirdParty;
        request.post({url:cloudFuncUrl, json: params}, function(err,httpResponse,body){
            if (!err && httpResponse.statusCode == 200) { 
                resolve(body);
            }else{
                reject(new Error(err))
            }   
        });
    });
}