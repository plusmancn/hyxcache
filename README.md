>会友行app缓存生成脚本

## Usage

    Usage: hyxcache [options]

    Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -p, --platform [type.versionTag]  avaliable platform: ios.v4,android.v6,etc

---
## changeLog
`1.11.1 | **2015-05-04 00:08**
    
* 添加安卓文件头添加列表，强烈建议安卓实现app内加载头尾

    androidWithHead:[
        'meetingShowDetail.ejs',
        'meetingEdit.ejs',
        'meetingShowList.ejs',
        'userEdit.ejs',
        'userSignupPhoneNumber.ejs',
        'userPasswordPhoneNumber.ejs',
        'contactsReq.ejs',
        'userNotification.ejs',
        'meetingEditGuide.ejs',
        'newFeature.ejs',
        'contactExchange.ejs',
        'versionHistory.ejs'
    ]


`1.11.0` | **2015-04-28 11:37**

* 添加版本Tag
* 版本号数据源统一从package.json获取