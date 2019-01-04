/**
 * 微信工具
 */
const enable = false;   //微信是否开启。方便本地调试
const AdUnitID = "adunit-1f9bfa04c0bd5e7f";
const ShareImages = ["resources/shareImg/share.png"];

var Const = {
    OpenDataKey_Step: "totalStep",

    StorageKey_NewPlayer: "newPlayer",
};

var WXTool = cc.Class({
    statics: {
        instance: null,
        getInstance: function () {
            return this.instance || (this.instance = new WXTool()), this.instance;
        },
        enable: enable,
    },

    ctor: function () {
        this.m_isLogin = false;
        this.m_loginBtn = null;

        this.m_advertiseVideo = null;
        this.advertiseVideoReady = false;

        this.initShare();
    },
    reset() {
        this.m_isLogin = false;
        this.m_loginBtn = null;
    },

    //登陆
    login() {
        if (this.m_isLogin) {
            return;
        }

        if (!enable) {
            this.setOpenId();
            this.getUserInfo();
            return;
        }
        var _this = this;

        wx.login({
            success: res => {
                console.log("login success");
                console.log(res['code']);
                _this.setCode(res['code']);
                //获取用户授权
                wx.getSetting({
                    success: function (res) {
                        var authSetting = res.authSetting;
                        var userInfoSetting = authSetting['scope.userInfo'];
                        if (userInfoSetting === true) {
                            //用户成功授权
                            console.log("Request WX UserInfo Success");
                            _this.getUserInfo();
                        } else {
                            if (userInfoSetting === false) {
                                // 处理用户拒绝授权的情况
                                console.log("Request WX UserInfo False");
                            } else {
                                console.log("Request WX UserInfo Ask");
                            }

                            //弹出询问框
                            let { screenWidth, screenHeight } = wx.getSystemInfoSync();
                            console.log(screenWidth);
                            console.log(screenHeight);
                            var button = wx.createUserInfoButton({
                                type: 'image',
                                image: cc.loader.md5Pipe.transformURL(cc.url.raw("resources/startBtn.png")),
                                style: {
                                    left: (screenWidth - 125) / 2,
                                    top: (screenHeight - 60),
                                    width: 125,
                                    height: 54.5
                                }
                            });

                            button.onTap((res) => {
                                _this.getUserInfo();
                            });

                            _this.m_loginBtn = button;
                        }
                    }
                });

            },
            fail: () => {
                console.log("login fail");
            }
        });
    },

    //获取Openid
    setOpenId(openId) {
        this.m_openId = openId ? openId : "";
    },
    //获取Openid
    getOpenId() {
        return enable ? this.m_openId : parseInt(Math.random() * 99);
    },
    //登录code
    setCode(code) {
        this.m_code = code;
    },

    getCode() {
        return enable ? this.m_code : ""
    },
    //获取用户头像和名字信息
    getUserInfo() {
        if (!enable) {
            this.getUserInfoSuccess();
            return;
        }
        var _this = this;
        wx.getUserInfo({
            success: function (res) {
                console.log("getUserInfo success");
                console.log(res);
                _this.getUserInfoSuccess(res);

                if (_this.m_loginBtn != null) {
                    _this.m_loginBtn.hide();
                    _this.m_loginBtn = null;
                }
            },

            fail: function (res) {
                // iOS 和 Android 对于拒绝授权的回调 errMsg 没有统一，需要做一下兼容处理
                if (res.errMsg.indexOf('auth deny') > -1 || res.errMsg.indexOf('auth denied') > -1) {
                    // 处理用户拒绝授权的情况
                    console.log("Request WX UserInfo False");
                }
            }
        });
    },
    getRunData(callback) {
        if (!enable) {
            callback(null);
            return;
        }

        new Promise(function (resolve, reject) {
            wx.authorize({
                scope: "scope.werun",
                success: function () {
                    resolve();
                },

                fail: function () {
                    reject();
                }
            })
        }).then(function () {
            wx.getWeRunData({
                success: function (res) {
                    console.log(res);
                    console.log("encryptedData:" + res.encryptedData + "iv:" + res.iv);
                    var encryptedData = res.encryptedData;
                    var iv = res.iv;
                    if (callback != null) {
                        callback(encryptedData, iv);
                    }
                },
                fail: function (res) {
                    wx.showModal({
                        title: '提示',
                        content: '开发者未开通微信运动，请关注“微信运动”公众号后重试',
                        showCancel: false,
                        confirmText: '知道了'
                    })
                    if (callback != null) {
                        callback(null);
                    }
                }
            });
        }).catch(function () {
            if (callback) {
                callback(null);
            }
        });
    },
    getUserInfoSuccess(res) {
        if (res) {
            this.m_avatarUrl = res.userInfo.avatarUrl;
            this.m_nickName = res.userInfo.nickName;
        }

        this.loginSuccess();
    },
    getWxName() {
        return enable ? this.m_nickName : "测试";
    },
    getAvatarUrl() {
        return enable ? this.m_avatarUrl : "";
    },
    //登陆成功
    loginSuccess() {
        this.m_isLogin = true;

        this.initOpenData();
        this.initAdvertiseVideo();

        cc.director.emit("WXLoginSuccess");
    },

    /**
     * 分享
     */
    initShare() {
        if (!enable) {
            return;
        }

        wx.updateShareMenu({
            withShareTicket: true
        });

        wx.showShareMenu();
    },

    //分享指定图片
    share() {
        if (!enable) {
            return;
        }

        var rand = Math.floor(Math.random() * ShareImages.length);

        wx.shareAppMessage({
            title: '新长征',
            imageUrl: cc.loader.md5Pipe.transformURL(cc.url.raw(ShareImages[rand])),
            success: function (res) {
                cc.director.emit("RecoverEnerge");
            },

            fail: function (res) {
            }
        });
    },
    //邀请好友
    shareToPlayTogether(invitorName, roomId, callback, failCallBack) {
        if (!enable) {
            callback();
            return;
        }

        var rand = Math.floor(Math.random() * ShareImages.length);
        var text = invitorName + "邀请你加入挑战";
        wx.shareAppMessage({
            title: text,
            imageUrl: cc.loader.md5Pipe.transformURL(cc.url.raw(ShareImages[rand])),
            query: "roomId=" + roomId,
            success: function (res) {
                callback();
            },

            fail: function (res) {
                if (failCallBack != null) {
                    failCallBack();
                }
            }
        });
    },

    //邀请好友加入组织
    shareToJoinGroup(groupId, groupName, invitorName, callback, failCallBack) {
        if (!enable) {
            callback();
            return;
        }

        var rand = Math.floor(Math.random() * ShareImages.length);
        var text = invitorName + "邀请您加入组织：" + groupName;

        wx.shareAppMessage({
            title: text,
            imageUrl: cc.loader.md5Pipe.transformURL(cc.url.raw(ShareImages[rand])),
            query: "groupId=" + groupId + "&invitorName=" + invitorName,
            success: function (res) {
                callback();
            },

            fail: function (res) {
                if (failCallBack != null) {
                    failCallBack();
                }
            }
        });
    },
    
    //邀请好友捐献步数
    shareToGiveStep(invitorOpenId, invitorName, callback, failCallBack) {
        if (!enable) {
            callback();
            return;
        }

        var rand = Math.floor(Math.random() * ShareImages.length);
        var text = invitorName + "邀请您把今天的步数给到他";

        wx.shareAppMessage({
            title: text,
            imageUrl: cc.loader.md5Pipe.transformURL(cc.url.raw(ShareImages[rand])),
            query: "openId=" + invitorOpenId + "&invitorName=" + invitorName,
            success: function (res) {
                callback();
            },

            fail: function (res) {
                if (failCallBack != null) {
                    failCallBack();
                }
            }
        });
    },

    //分享屏幕截图
    shareWithImage() {
        if (!enable) {
            return;
        }

        wx.shareAppMessage({
            title: '求婚101',
            imageUrl: canvas.toTempFilePathSync({
                destWidth: 500,
                destHeight: 400
            }),
            success: function (res) {
                cc.director.emit("Reborn");
            },

            fail: function (res) {
            }
        });
    },

    /**
     * 广告
     */
    initAdvertiseVideo() {
        if (!enable) {
            return;
        }

        var advertiseVideo = wx.createRewardedVideoAd({ adUnitId: AdUnitID });
        var _this = this;
        advertiseVideo.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                cc.director.emit("PlayAdvertiseVideoDone", true);
            }
            else {
                // 播放中途退出，不下发游戏奖励
                cc.director.emit("PlayAdvertiseVideoDone", false);
            }
        });

        advertiseVideo.onLoad(() => {
            _this.advertiseVideoReady = true;
        });

        advertiseVideo.onError((err) => {
            console.log('load AdvertiseVideo Error', err);
            _this.advertiseVideoReady = false;
        });

        this.m_advertiseVideo = advertiseVideo;
    },

    showAdvertiseVideo(successCallback, failCallback) {
        if (!enable) {
            return;
        }

        var _this = this;
        this.m_advertiseVideo.show().then(() => {
            if (successCallback) {
                successCallback();
            }
            _this.advertiseVideoReady = false;
        }).catch((err) => {
            console.log('show AdvertiseVideo Error', err);
            this.m_advertiseVideo.load().then(() => {
                this.m_advertiseVideo.show()
                if (successCallback) {
                    successCallback();
                }
                _this.advertiseVideoReady = false;
            }).catch((err) => {
                console.log('load AdvertiseVideo Error', err);
                if (failCallback) {
                    failCallback();
                }
            });
        });
    },

    /**
     * OpenData
     */
    //初始化openData
    initOpenData(){
        if (!enable) {
            return;
        }

        var openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage({ eventType: 0, openId: this.m_openId });
    },

    updateOpenData(eventType, datas){
        if (!enable) {
            return;
        }

        var openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage({ eventType: eventType, datas: datas });
    },
    
    //切换好友排行
    openFriendRank(myInfo) {
        if (!enable) {
            return;
        }

        var openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage({ eventType: 1, myInfo: myInfo});
    },

    //切换世界排行
    openWorldRank(data, groupInfo) {
        if (!enable) {
            return;
        }

        var openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage({eventType: 2, data: data, myGroupInfo: groupInfo});
    },

    //上报步数
    reportStep(step) {
        if (!enable) {
            return;
        }
        wx.setUserCloudStorage({
            KVDataList: [{ key: Const.OpenDataKey_Step, value: String(step)}],
            success: res => {
                console.log(res);
            },
            fail: res => {
                console.log(res);
            }
        });
    },

    //获取卡片传入参数
    getLaunchOptionsSync() {
        if (!enable) {
            return null;
        }
        return wx.getLaunchOptionsSync();
    },

    wxOnShow(callback) {
        if (enable) {
            wx.onShow(function (res) {
                callback(res)
            });
        }
    },

    ensureDirFor(path, callback) {
        // cc.log('mkdir:' + path);
        if (!enable) {
            return;
        }

        var _this = this;
        var fs = wx.getFileSystemManager();
        var ensureDir = cc.path.dirname(path);
        if (ensureDir === "wxfile://usr" || ensureDir === "http://usr") {
            callback();
            return;
        }
        fs.access({
            path: ensureDir,
            success: callback,
            fail: function (res) {
                _this.ensureDirFor(ensureDir, function () {
                    fs.mkdir({
                        dirPath: ensureDir,
                        complete: callback,
                    });
                });
            },
        });
    },

    saveFileToLocal(fromPath, callback) {
        if (!enable) {
            return;
        }

        // var localPath = wx.env.USER_DATA_PATH + '/' + toPath;
        var fs = wx.getFileSystemManager();
        fs.saveFile({
            tempFilePath: fromPath,
            success: function (res) {
                if (callback) {
                    callback("success", res.savedFilePath);
                }
            },

            fail: function (res) {
                console.log(res.errMsg);
                if (callback) {
                    callback("fail");
                }
            }
        });
        // this.ensureDirFor(localPath, function () {
        //     fs.saveFile({
        //         tempFilePath: fromPath, 
        //         filePath: toPath,
        //         success: function(res){
        //             if(callback){
        //                 callback("success", res.savedFilePath);
        //             }
        //         },

        //         fail: function(res){
        //             console.log(res.errMsg);
        //             if(callback){
        //                 callback("fail");
        //             }
        //         }
        //     });
        // });
    },

    //保存图片到相册
    saveImageToAlbum(path, callback) {
        if (!enable) {
            return;
        }

        new Promise(function (resolve, reject) {
            wx.authorize({
                scope: "scope.writePhotosAlbum",
                success: function () {
                    resolve();
                },

                fail: function () {
                    reject();
                }
            })
        }).then(function () {
            wx.saveImageToPhotosAlbum({
                filePath: path,
                success: function () {
                    if (callback) {
                        callback("success");
                    }
                },

                fail: function () {
                    if (callback) {
                        callback("fail");
                    }
                }
            });
        }).catch(function () {
            if (callback) {
                callback("fail");
            }
        });
    },
    
    //从相册选择图片
    chooseImageFromAlbum(){
        if(!enable){
            return;
        }

        wx.chooseImage({
            count: 1,
            sizeType: ['original'],
            success: function (res) {
                const tempFilePaths = res.tempFilePaths
                console.log(tempFilePaths);
                wx.uploadFile({
                    url: 'http://192.168.0.156:8129/upload', //仅为示例，非真实的接口地址
                    filePath: tempFilePaths[0],
                    name: 'file',
                    formData:{
                      'user': 'test'
                    },
                    success: function(res){
                      var data = res.data
                      console.log(data);
                      //do something
                    }
                  })
            },

            fail: function () {
                if (callback) {
                    callback("fail");
                }
            }
        });
    },
});