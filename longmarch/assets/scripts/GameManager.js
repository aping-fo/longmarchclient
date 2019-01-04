var httpReq = require('HttpReq');
var gameEnum = require('GameEnum')
var CMD = require("CMD");
var WXTool = require("WXTool");
var LoadingBar = require('LoadingBar');
var AudioManager = require("AudioManager");

const LOCALSTORAGEKEY_HitoryQuestions = "HistoryQuestions";

var GameManager = cc.Class({
    extends: cc.Component,
    properties: {
        gameState: {
            default: gameEnum.GAME_STATE.HOME,
            type: cc.Enum(gameEnum.GAME_STATE),
        },
        myInfo:
        {
            default: null,
            type: Object,
        },
        oppInfo:
        {
            default: null,
            type: Object,
        },

        groupInfo: null,   //组织信息

        lauchOption: null,
        sceneGoingTo: null,
        sceneLoaded: [],
        sceneLoading: [],

        gameMode: 0,
        chickenGroup: null,
        chickenMode: 0,//好友，练习，匹配
        brodcastList: null,
        shopType: 0,//商店类别
    },


    ctor: function () {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.Vec2.ZERO;

        this.mapConfig = null;
        this.mapPieceCfg = null;
        this.groupRecordCfg = null;

        this.fighterNode = null;
        this.roleNode = null;
        this.playerInfoPanel = null;
        this.reviewPanel = null;
        this.popupLiveNode = null;
        this.mapPointNode = null;
        this.mapRoadPointNode = null;
        this.mapPieceNode = null;
        this.bubbleNode = null;

        var _this = this;

        cc.loader.loadRes("prefabs/FighterNode", cc.Prefab, function (err, prefab) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            _this.fighterNode = prefab;
        });

        cc.loader.loadRes("prefabs/RoleNode", cc.Prefab, function (err, prefab) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            _this.roleNode = prefab;
        });

        cc.loader.loadRes("prefabs/MapPointNode", cc.Prefab, function (err, prefab) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            _this.mapPointNode = prefab;
        });
        
        cc.loader.loadRes("prefabs/MapRoadPointNode", cc.Prefab, function (err, prefab) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            _this.mapRoadPointNode = prefab;
        });
        
        cc.loader.loadRes("prefabs/MapPieceNode", cc.Prefab, function (err, prefab) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            _this.mapPieceNode = prefab;
        });

        cc.loader.loadRes("prefabs/BubbleNode", cc.Prefab, function (err, prefab) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            _this.bubbleNode = prefab;
        });

        cc.loader.loadRes('config/MapCfg', cc.JsonAsset, function (err, jsonAsset) {
            _this.mapConfig = jsonAsset.json;
        });
        cc.loader.loadRes('config/MapPieceCfg', cc.JsonAsset, function (err, jsonAsset) {
            _this.mapPieceCfg = jsonAsset.json;
        });
        cc.loader.loadRes('config/GroupRecordCfg', cc.JsonAsset, function (err, jsonAsset) {
            _this.groupRecordCfg = jsonAsset.json;
        });


        this.initSetting();
    },
    // onLoad () {},

    start() {
    },

    GetOpenId(code, callback) {
        var data = { code: code };
        httpReq.Post(CMD.GET_OPENID, data, function (resp) {
            callback(resp);
        });
    },
    GetRunData(encryptedData, iv, callback) {
        var _this = this;

        var data = { encryptedData: encryptedData, iv: iv };
        httpReq.Post(CMD.GET_RUN_DATA, data, function (resp) {
            _this.myInfo.todayStep = resp;
            callback(resp);
        });
    },
    TransferRunData(step, callback) {
        var _this = this;
        var data = { step: step, type: 1 }
        httpReq.Post(CMD.TRANSFER_RUN_DATA, data, function (resp) {
            _this.myInfo.totalStep += resp;
            _this.myInfo.step += resp;
            callback(resp);
        });
    },

    GiveRunData(giveOpenId, step, callback) {
        var data = { giveOpenId: giveOpenId, step: step }
        httpReq.Post(CMD.GIVE_RUN_DATA, data, function (resp) {
            callback(resp);
        });
    },

    GetGiveRunData(callback) {
        var data = {}
        httpReq.Post(CMD.GET_GIVE_RUN_DATA, data, function (resp) {
            callback(resp);
        });
    },
    
    TransferGiveRunData(giveOpenId, callback) {
        httpReq.Post(CMD.TRANSFER_GIVE_RUN_DATA, giveOpenId, function (resp) {
            callback(resp);
        });
    },

    CreateRole(nick, icon, callback) {
        var data = { nickName: nick, iconUrl: icon };
        httpReq.Post(CMD.CREATE_ROLE, data, function (resp) {
            callback(resp);
        });
    },
    UpdateRole(nick, icon, callback) {
        var data = { nickName: nick, iconUrl: icon };
        httpReq.Post(CMD.UPDATE_ROLE, data, function (resp) {
            callback(resp);
        });
    },
    GetRoleInfo(callback) {
        var data = {};
        var _this = this;
        httpReq.Post(CMD.GET_ROLE, data, function (resp) {
            _this.myInfo.step = resp.step;
            _this.myInfo.totalStep = resp.totalStep;

            WXTool.getInstance().reportStep(_this.myInfo.totalStep);
            callback(resp);
        });
    },

    //获取道具
    GainTool(callback) {
        var data = {};
        var _this = this;
        httpReq.Post(CMD.GAIN_TOOL, data, function (resp) {
            _this.myInfo.toolCount = resp;
            callback(resp);
        });
    },

    ///////////////////////// 排行榜 ///////////////////////////
    OpenFriendRank() {
        WXTool.getInstance().openFriendRank(this.myInfo);
    },

    OpenGroupRank() {
        var data = {};
        var _this = this;
        httpReq.Post(CMD.GROUP_RANK, data, function (resp) {
            console.log("GROUP_RANK ", resp.result);

            WXTool.getInstance().openWorldRank(resp.result, _this.groupInfo);
        });
    },

    ////////////////////////大师赛//////////////////////////////
    SignUpMasterMatch(callback) {
        var data = {};
        httpReq.Post(CMD.SIGN_UP_MASTERMATCH, data, callback);
    },
    //--------------------------------------吃鸡-----------------------------------------------//
    Chicken_StartMatch(callback) {
        var data = { mode: 3 };
        httpReq.Post(CMD.CHICKEN_START_MATCH, data, callback);
    },
    Chicken_EndMatch(callback) {
        var data = {};
        httpReq.Post(CMD.CHICKEN_END_MATCH, data, callback);
    },

    Chicken_CreateRoom(modeValue, callback) {
        var data = { mode: modeValue };
        httpReq.Post(CMD.CHICKEN_CREATE_ROOM, data, callback);
    },
    Chicken_JoinRoom(roomIdValue, callback) {
        var data = { roomId: roomIdValue };
        httpReq.Post(CMD.CHICKEN_JOIN_ROOM, data, callback);
    },
    Chicken_GetRoomState(callback) {
        var data = {};
        httpReq.Post(CMD.CHICKEN_GET_ROOM_STATUS, data, callback);
    },
    Chicken_GetQuestion(callback) {
        var data = {};
        httpReq.Post(CMD.CHICKEN_GET_QUESTION, data, callback);
    },
    Chicken_GetSituation(callback) {
        var data = {};
        httpReq.Post(CMD.CHICKEN_GET_PLAYING_SITUATION, data, callback);
    },
    Chicken_SubmitAnswer(openId, answerValue, questionIdValue, callback) {
        openId = openId || GameManager.getInstance().myInfo.openId;
        var data = { answerOpenId: openId, answer: answerValue, questionId: questionIdValue };
        httpReq.Post(CMD.CHICKEN_SUBMIT_ANSWER, data, callback);
    },
    Chicken_GetResult(callback) {
        var data = {};
        httpReq.Post(CMD.CHICKEN_GET_RESULT, data, callback);
    },
    Chicken_ExitRoom(callback) {
        var data = {};
        httpReq.Post(CMD.CHICKEN_EXIT_ROOM, data, callback);
    },
    Chicken_Use_UnDeadTool(count, callback) {
        var data = {
            useCount: count
        };
        httpReq.Post(CMD.CHICEKN_USE_UNDEADTOOL, data, callback);
    },
    Chicken_GET_LIMIT(callback) {
        var data = {
        };
        httpReq.Post(CMD.GET_CHICKEN_LIMIT, data, callback);
    },
    Chicken_GET_LIMIT_RANK_LIST(from, to, callback) {
        var data = {
            fromIndex: from,
            toIndex: to
        };
        httpReq.Post(CMD.GET_CHICKEN_LIMIT_RANK_LIST, data, callback);
    },
    Chicken_GET_LIMIT_RANK(callback) {
        var data = {
        };
        httpReq.Post(CMD.GET_CHICKEN_LIMIT_RANK, data, callback);
    },
    Chicken_StartNow(callback) {
        var data = {
        };
        httpReq.Post(CMD.CHICEKN_SET_GAME_START, data, callback);

    },
    //--------------------------------------团-----------------------------------------------//
    Group_GetInfo(callback) {
        var data = {};
        var _this = this;
        httpReq.Post(CMD.GROUP_INFO, data, function (resp) {
            _this.groupInfo = resp.info;
            _this.groupInfo.rank = resp.rank;

            if (callback) {
                callback(resp);
            }
        });
    },

    Group_GetRecord(callback) {
        var data = {};
        var _this = this;
        httpReq.Post(CMD.GROUP_RECORD, data, function (resp) {
            if (callback) {
                callback(resp);
            }
        });
    },

    Group_Create(name, callback) {
        var data = {
            name: name
        };
        var _this = this;
        httpReq.Post(CMD.GROUP_CREATE, data, function (resp) {
            _this.groupInfo = resp.info;
            _this.groupInfo.rank = resp.rank;

            if (callback) {
                callback(resp.info);
            }
        });
    },

    Group_AddMember(groupId, callback) {
        var data = {
            id: groupId
        };

        var _this = this;
        httpReq.Post(CMD.GROUP_ADD_MEMBER, data, function (resp) {
            _this.groupInfo = resp.info;
            _this.groupInfo.rank = resp.rank;

            if (callback) {
                callback(resp.info);
            }
        });
    },

    Group_RemoveMember(openId, callback) {
        var data = {
            memberOpenId: openId
        };
        var _this = this;
        httpReq.Post(CMD.GROUP_REMOVE_MEMBER, data, function (resp) {
            _this.groupInfo      = resp.info;
            _this.groupInfo.rank = resp.rank;

            if (callback) {
                callback(resp.info);
            }
        });
    },

    Group_Exit(callback) {
        var data = {};
        var _this = this;
        httpReq.Post(CMD.GROUP_EXIT, data, function (resp) {
            _this.groupInfo = null;

            if (callback) {
                callback(resp);
            }
        });
    },

    Group_Dissolve(callback) {
        var data = {};
        var _this = this;
        httpReq.Post(CMD.GROUP_DIS, data, function (resp) {
            _this.groupInfo = null;

            if (callback) {
                callback(resp);
            }
        });
    },

    Group_ModifyName(name, callback) {
        var data = {
            name: name
        };

        var _this = this;
        httpReq.Post(CMD.GROUP_CHANGENAME, data, function (resp) {
            _this.groupInfo = resp.info;
            _this.groupInfo.rank = resp.rank;

            if (callback) {
                callback(resp.info);
            }
        });
    },

    Group_ModifyIcon(iconUrl, callback) {
        var data = {
            iconUrl: iconUrl
        };

        var _this = this;
        httpReq.Post(CMD.GROUP_CHANGEICON, data, function (resp) {
            _this.groupInfo     = resp.info;
            _this.groupInfo.rank = resp.rank;

            if (callback) {
                callback(resp.info);
            }
        });
    },

    Group_Encourage(name, callback) {
        httpReq.Post(CMD.GROUP_ENCOURAGE, name, function (resp) {
            if (callback) {
                callback(resp.info);
            }
        });
    },

    Group_Warn(name, callback) {
        httpReq.Post(CMD.GROUP_WARN, name, function (resp) {
            if (callback) {
                callback(resp.info);
            }
        });
    },
    
    Group_GetInfoNearBy(callback) {
        var data = {};
        httpReq.Post(CMD.GROUP_GETINFO_NEARBY, data, function (resp) {
            if (callback) {
                callback(resp);
            }
        });
    },

    //签到
    Sign(callback, type) {
        var data = { type: type };
        httpReq.Post(CMD.SIGN, data, function (resp) {
            if (callback) {
                callback(resp);
            }
        });
    },

    //获取公告
    getBrodcast(callback) {
        var data = {};
        httpReq.Post(CMD.GET_BROADCAST, data, function (resp) {
            if (callback) {
                callback(resp);
            }
        });
    },
    //--------------------------------------商城-----------------------------------------------//
    GetMallItems(callback) {
        var data = {};
        httpReq.Post(CMD.GET_MALL_ITEMS, data, callback);
    },
    ConsumeMallItems(name, phone, address, itemId, callback) {
        var data = { name: name, phone: phone, address: address, itemId: itemId };
        httpReq.Post(CMD.CONSUME_MALL_ITEMS, data, callback);
    },
    Buy(id, callback) {
        var data = { id: id };
        httpReq.Post(CMD.BUY, data, callback);
    },
    GetRewarder(callback) {
        var data = {};
        httpReq.Post(CMD.GET_REWEARDER, data, callback);
    },
    GetParticipantCount(id, callback) {
        var data = { id: id };
        httpReq.Post(CMD.GET_PARTICIPANT_COUNT, data, callback);
    },
    PreLoadScene(sceneName, callback) {
        var self = GameManager.getInstance();
        if (self.sceneLoading == null) {
            self.sceneLoading = new Array();
        }
        self.sceneLoading.push(sceneName);
        cc.director.preloadScene(sceneName, function () {
            if (self.sceneLoaded == null) {
                self.sceneLoaded = new Array();
            }
            self.sceneLoaded.push(sceneName);
            for (var i = 0; i < self.sceneLoading.length; i++) {
                if (self.sceneLoading[i] == sceneName) {
                    self.sceneLoading[i] = "";
                    break;
                }
            }
            if (callback != null) {
                callback();
            }
            if (sceneName == self.sceneGoingTo) {
                LoadingBar.hide();
                cc.director.loadScene(sceneName, function () { self.sceneGoingTo = null });
            }
        });
    },

    LoadScene(sceneName) {
        var self = GameManager.getInstance();
        if (self.sceneLoaded == null || self.sceneLoaded.indexOf(sceneName) == -1) {
            if (self.sceneLoading == null || self.sceneLoading.indexOf(sceneName) == -1) {
                cc.director.loadScene(sceneName, function () { self.sceneGoingTo = null });
            }
            else {
                self.sceneGoingTo = sceneName;
                LoadingBar.show();
            }

        }
        else {
            cc.director.loadScene(sceneName, function () { self.sceneGoingTo = null });
        }
    },

    getHistoryQuestionsUrl() {
        var str = cc.sys.localStorage.getItem(LOCALSTORAGEKEY_HitoryQuestions);
        if (str == null) {
            str = "";
            cc.sys.localStorage.setItem(LOCALSTORAGEKEY_HitoryQuestions, str);
        }

        return str;
    },

    setHistoryQuestionsUrl(str) {
        cc.sys.localStorage.setItem(LOCALSTORAGEKEY_HitoryQuestions, str);
    },
    getChickenPlayer(openId) {
        if (this.chickenGroup == null) {
            return null;
        }
        for (var i = 0; i < this.chickenGroup.length; i++) {
            if (this.chickenGroup[i].openId == openId) {
                return this.chickenGroup[i];
            }
        }
        return null;
    },

    ///////////////////////设置////////////////////////////////
    initSetting() {
        AudioManager.getInstance().init();
    },
});
GameManager._instance = null;
GameManager.getInstance = function () {
    if (!GameManager._instance) {
        GameManager._instance = new GameManager();
    }
    return GameManager._instance;
}

module.exports = GameManager;

