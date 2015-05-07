/**
 * 会友行App缓存生成脚本
 */
var fs = require('fs');
var path = require('path');
var packageJson = require('../package.json')

var config = {
    platform:'ios', // ios ,android
    versionMark:'v4',
    dist:'www',
    dirView:'cloud/views/f7/',
    dirResource:'public/f7/',
    regDynamicCoe:/\<\%[^\%\>]+\%\>/gi,
    regWxconfig:/\<\%=wxconfig\%\>/gi,
    specialList:[
        'meetingShowDetail.ejs',
    ],
    androidWithHead:[
        // 'meetingShowDetail.ejs',
        // 'meetingEdit.ejs',
        // 'meetingShowList.ejs',
        // 'userEdit.ejs',
        // 'userSignupPhoneNumber.ejs',
        // 'userPasswordPhoneNumber.ejs',
        // 'contactsReq.ejs',
        // 'userNotification.ejs',
        // 'meetingEditGuide.ejs',
        // 'newFeature.ejs',
        // 'contactExchange.ejs',
        // 'versionHistory.ejs'
    ]
}


/**
 * 获取文件名
 */
getFileName = function(path){
    var parts = path.split('/');
    return parts[parts.length -1];
}

/**
 * 文件替换函数
 * @param  {string} 文件路径
 */
finder = function(path,desPath,regExp,replaceText,isReturn){
    console.log('正在处理：' + path);
    var data = fs.readFileSync(path,'utf-8');
    // <%=wxconfig%> 改成 {}  
    var data = data.replace(config.regWxconfig,'{}');

    if (isReturn) {
        return data.replace(regExp,replaceText);
    }else{
        var desPath = desPath + getFileName(path);
        writeTextToFile(desPath,data.replace(regExp,replaceText));
    }
}

/**
 * 强制写入文件
 * 如果路径不存在则创建路径
 */
writeTextToFile = function(path, text) {
    // 将 ejs 转换为 html 后缀
    var path = path.replace(/.ejs$/i,'.html');
 
    if(fs.existsSync(path)){
        //已经存在，直接写入
        fs.writeFileSync(path, text, 'utf-8');
    }else{
        var items = path.split('/');
        var aPath = '.';
        //目录不存在，那么创建之
        for(var i=0; i<items.length - 1; i++){
            aPath += '/' + items[i];
            if(!fs.existsSync(aPath)){
                fs.mkdirSync(aPath);
            }
        }
        fs.writeFileSync(path, text, 'utf-8');
    }
}

/**
 * Look ma, it's cp -R.
 * @param {string} src The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
var copyRecursiveSync = function(src, dest) {
    console.log('正在复制：'+src);

    var exists = fs.existsSync(src);
    var stats = exists && fs.statSync(src);
    var isDirectory = exists && stats.isDirectory();
    if (exists && isDirectory) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
    } else {
    fs.linkSync(src, dest);
    }
};

/**
 * 递归删除文件夹  
 * @param  {string} path 需要删除的文件目录
 */
deleteFolderRecursive = function (path) {
    if(fs.existsSync( path ) ) {
       fs.readdirSync( path ).forEach(function( _file,_index ){
            var _curPath = path + "/" + _file;
            if(fs.statSync( _curPath ).isDirectory() ) { // recurse
                deleteFolderRecursive( _curPath,fs );
            } else { // delete file
               fs.unlinkSync( _curPath );
            }
        });
       fs.rmdirSync( path );
        return true;
    }
    return false;
};


main = function(){
    
    // 清空发布目录 
    deleteFolderRecursive(config.dist);

    // url 更改  jhyx-util.js , 手动更改
    // 设置leanCLoud模式为产品模式， 请在app内更改

    // <%=wxconfig%> 改成 {} ，见 finder 内部

    // comm header class 指定为苹果头
    if (config.platform == 'ios') {
        finder(config.dirView  + 'comm/header.ejs',config.dist + '/comm/',config.regDynamicCoe,'',false);
    }else if (config.platform == 'android') {
        finder(config.dirView + 'comm/header.ejs',config.dist + '/comm/',config.regDynamicCoe,'android android-4',false);
    }

    finder(config.dirView + 'comm/footer.ejs',config.dist + '/comm/',config.regDynamicCoe,'',false);

    
    var dataHeader = fs.readFileSync(config.dist + '/comm/header.html','utf-8');
    var dataFooter = fs.readFileSync(config.dist + '/comm/footer.html','utf-8');
    var dataHeader = dataHeader.replace(/versionMark/gi,config.versionMark);
    var dataFooter = dataFooter.replace(/versionMark/gi,config.versionMark);

    // 更改后再次写入，写入版本号
    writeTextToFile(config.dist + '/comm/header.html',dataHeader);
    writeTextToFile(config.dist + '/comm/footer.html',dataFooter);



    // 详情页面 的 头部判断 navigation效果
    var newData = finder(config.dirView + 'meetingShowDetail.ejs','',config.regDynamicCoe,'',true);
    if (config.platform == 'ios') {
        writeTextToFile(config.dist + '/meetingShowDetail.ejs',newData.replace('<div class="page-content pull-to-refresh-content" id="partDetailHtml">',''));
    }else if(config.platform == 'android'){
        var dataBody = newData.replace('<div class="page-content hide-bars-on-scroll pull-to-refresh-content" id="partDetailHtml">','');
        // var dataHtml = dataHeader + dataBody + dataFooter;
        writeTextToFile(config.dist + '/meetingShowDetail.ejs',dataBody);
    }

    // 去除头尾动态代码，头尾公共头部分，去除所有动态模板语言 （class layout）
    var dirs = fs.readdirSync(config.dirView);

    dirs.forEach(function(DItem){

        if (DItem.indexOf('.ejs') != -1 && config.specialList.indexOf(DItem) == -1) {
            if (config.platform == 'ios' || config.androidWithHead.indexOf(DItem) == -1) {
                finder(config.dirView + DItem,config.dist + '/',config.regDynamicCoe,'',false);
            }else{
                var dataBody = finder(config.dirView + DItem,config.dist + '/',config.regDynamicCoe,'',true);
                var dataHtml = dataHeader + dataBody + dataFooter;
                writeTextToFile(config.dist + '/' + DItem,dataHtml);
            }
        }
        
    });
    
    // 移动js静态文件夹
    copyRecursiveSync(config.dirResource,config.dist + '/f7');
}

exports.version = packageJson.version;
exports.build = function(platform,versionMark){
    config.platform = platform;
    config.versionMark = versionMark;
    // 检测头文件是否存在
    if(!fs.existsSync(config.dirView  + 'comm/')){
        console.log('error: please run command under hyxNodeServer Directory!');
    }else{
        main();
    }
}

