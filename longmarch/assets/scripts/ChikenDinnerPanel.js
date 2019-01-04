var GameManager = require("GameManager");
var AudioManager = require("AudioManager");
var gameEnum = require('GameEnum');
var countDown = require("CountDown");
var FighterNode = require("FighterNode");
var th = null;
var bgAni = require('chickenbgAni');
var Alert = require("Alert")
var UIHelper = require('UIHelper');
var hasLoadedMyIcon=false;


var httpReq = require('HttpReq');
var curQuestion;
var time_matching = 0;
var time_ready = 0;
var time_checkSituation = 0;
var time_checkResult = 0;
// var playerListLeft;
// var playerListRight;
var fighterNodes = [];
var PopupTipsNode = require("PopupTipsNode");
var monster = require("Monster");
var myNode;
var WXTool = require("WXTool")

cc.Class({
    extends: cc.Component,

    properties: {
        lbl_title: {
            default: null,
            type: cc.Label,
            serializable: true,
        },
        btn_right: {
            default: null,
            type: cc.Button,
            serializable: true,
        },
        btn_wrong: {
            default: null,
            type: cc.Button,
            serializable: true,
        },
        reverseTime: {
            default: null,
            type: countDown,
            serializable: true,
        },
        resultPanel: {
            default: null,
            type: cc.Node,
            serializable: true,
        },
        btn_resultConfirm: {
            default: null,
            type: cc.Button,
            serializable: true,
        },
        group_playersLeft: {
            default: null,
            type: cc.Node,
            serializable: true,
        },
        group_playersRight: {
            default: null,
            type: cc.Node,
            serializable: true,
        },
        group_playersInitPos: {
            default: null,
            type: cc.Node,
            serializable: true
        },
        lbl_gameResult: {
            default: null,
            type: cc.Label,
            serializable: true,
        },
        bgAni: {
            default: null,
            type: bgAni,
            serializable: true,
        },
        answerResultBoard: {
            default: null,
            type: cc.Node,
            serializable: true,
        },
        lbl_currentScore: {
            default: null,
            type: cc.Label,
            serializable: true,
        },
        lbl_resultScore: {
            default: null,
            type: cc.Label,
            serializable: true,
        },
        btn_return: {
            default: null,
            type: cc.Button,
            serializable: true,
        },
        sign_me: {
            default: null,
            type: cc.Node,
            serializable: true,
        },
        coin: {
            default: null,
            type: cc.Node,
            serializable: true,
        },
        toggle_tool: {
            default: null,
            type: cc.Toggle,
            serializable: true,
        },
        monster: {
            default: null,
            type: monster,
            serializable: true,
        },
        aniCountDown: {
            default: null,
            type: cc.Animation,
            serializable: true,
        },
        choose: {
            default: null,
            type: cc.Node,
            serializable: true,
        },
        rightAni: {
            default: null,
            type: cc.Animation,
            serializable: true,
        },
        wroghtAni: {
            default: null,
            type: cc.Animation,
            serializable: true,
        },
        btn_invite: {
            default: null,
            type: cc.Button,
            serializable: true,
        },
        btn_begin: {
            default: null,
            type: cc.Button,
            serializable: true,
        },
        leftHole: [cc.Node],
        rightHole: [cc.Node],
        leftHoleState: [],
        rightHoleState: []
    },


    onLoad() {
        th = this;
        curQuestion=null;
        fighterNodes = [];
    },

    start() {
        this.init();

        AudioManager.getInstance().playMusic(AudioManager.MUSIC_TYPE.FIGHT);
    },
    init() {
       
        if(GameManager.getInstance().isRoomOwner)
        {
            th.btn_begin.node.active=true;
            th.btn_invite.node.x=this.btn_right.node.x;
        }
        else
        {
            th.btn_begin.node.active=false;
            th.btn_invite.node.x=0;
        }
        th.choose.active=false;
        th.aniCountDown.node.active=false;
        hasLoadedMyIcon=false;
        // th.toggle_tool.node.active = true;
        th.coin.active = false;
        th.sign_me.active = false;
        th.btn_return.node.active = true;
        th.lbl_currentScore.string = GameManager.getInstance().myInfo.step;
        th.btn_right.node.active = false;
        th.btn_wrong.node.active = false;
        th.reverseTime.label.string = ''
        th.resultPanel.active = false;
        th.answerResultBoard.active = false;
        th.btn_right.node.on('click', this.onClickRight, this);
        th.btn_wrong.node.on('click', this.onClickWrong, this);
        th.btn_resultConfirm.node.on('click', this.onClickConfirmResult, this);
        //匹配计时
        if (GameManager.getInstance().gameState == gameEnum.GAME_STATE.CHIKEN_MATCHING) {
            th.reverseTime.node.active = true;
            // th.reverseTime.startCountDown(20,function(){
            // },'')
        }
        this.toggle_tool.node.on('toggle', this.onUseTool, this);

        // playerListLeft=new Array();
        // playerListRight=new Array();

        // playerListLeft.push(this.itemOrigin_playerLeft);
        // playerListRight.push(this.itemOrigin_playerRight);
        // for(var i=0;i<9;i++)
        // {
        //     var leftItem= cc.instantiate(this.itemOrigin_playerLeft);
        //     leftItem.parent=this.group_playersLeft;
        //     playerListLeft.push(leftItem);

        //     var rightItem= cc.instantiate(this.itemOrigin_playerRight);
        //     rightItem.parent=this.group_playersRight;
        //     playerListRight.push(rightItem);
        // }
        // this.clearAnswerList();
        httpReq.errorHandler['2055' + '_' + '800'] = function () { PopupTipsNode.appearWithText('没有该房间') };
        httpReq.errorHandler['2055' + '_' + '801'] = function () { PopupTipsNode.appearWithText('游戏已经开始') };
        httpReq.errorHandler['2055' + '_' + '802'] = function () { PopupTipsNode.appearWithText('玩家所在房间游戏没开始') };
        httpReq.errorHandler['2055' + '_' + '803'] = function () { PopupTipsNode.appearWithText('玩家不在游戏'); };
        httpReq.errorHandler['2055' + '_' + '804'] = function () { PopupTipsNode.appearWithText('答题不是当前题目'); };
        httpReq.errorHandler['2055' + '_' + '805'] = function () { PopupTipsNode.appearWithText('玩家所在房间游戏答题时间还没结束') };
        httpReq.errorHandler['2062' + '_' + '806'] = function () {
            PopupTipsNode.appearWithText('道具不足')
            th.toggle_tool.isChecked = false;
        };
        httpReq.errorHandler['2059' + '_' + '803'] = th.getResult;
        httpReq.errorHandler['2063' + '_' + '807'] = function () { PopupTipsNode.appearWithText('人数不足') };
        this.leftHole = [];
        this.leftHoleState = [];
        this.rightHole = [];
        this.rightHoleState = [];
        for (var i = 0; i < 20; i++) {
            var node = new cc.Node();
            node.width = 60;
            node.height = 60;
            node.parent = this.group_playersLeft;

            var node2 = new cc.Node();
            node2.width = 60;
            node2.height = 60;
            node2.parent = this.group_playersRight;
            this.leftHole[i] = node;
            this.rightHole[i] = node2;
            this.leftHoleState[i] = 0;
            this.rightHoleState[i] = 0;
        }
        this.group_playersLeft.getComponent(cc.Layout).updateLayout();
        this.group_playersRight.getComponent(cc.Layout).updateLayout();
    },

    initFighter() {
        fighterNodes = [];

        var playersInfo = GameManager.getInstance().chickenGroup;
        th.sign_me.active = true;
        for (var i = 0; i < playersInfo.length; i++) {
            var node = cc.instantiate(GameManager.getInstance().fighterNode);
            var fighterNode = node.getComponent(FighterNode);

            node.setParent(this.group_playersInitPos);
            fighterNode.updateWithData(playersInfo[i]);

            fighterNodes[fighterNode.openId] = fighterNode;
            if(playersInfo[i].openId == GameManager.getInstance().myInfo.openId)
            {
                myNode=fighterNode;
            }
            // if(playersInfo[i].)
        }
    },

    roundStart() {

        // this.clearAnswerList();
        GameManager.getInstance().gameState = gameEnum.GAME_STATE.CHIKEN_ANSWERING;
        th.resultPanel.active = false;
        th.btn_right.node.active = true;
        th.btn_wrong.node.active = true;
        th.answerResultBoard.active = false;
        th.getQuestion();
        th.bgAni.slowDown();
        th.getSituation();

    },
    getQuestion() {
        GameManager.getInstance().Chicken_GetQuestion(function (resp) {
            curQuestion = resp;
            th.lbl_title.string = resp.content;
            // th.reverseTime.startCountDown(gameEnum.GameConst.INTERVAL_CHICKEN_ANSWER_TIME,function(){
            //     th.getResult();
            // },'')
            th.bgAni.startMove();

            for (let openId in fighterNodes) {
                var fighterNode = fighterNodes[openId];
                fighterNode.startAnswer(curQuestion);
            }
        })
    },
    showQustion() {

    },


    getResult() {
        GameManager.getInstance().gameState = gameEnum.GAME_STATE.CHIKEN_GET_RESULT;

    },
    nextRound() {
        th.choose.active=true;
       
        this.roundStart();
    },


    getSituation() {
        GameManager.getInstance().Chicken_GetSituation(function (resp) {
            var fighterAnswers = resp['fighterAnswers'];
            var roomTime = resp['roomTime'];
            var desc = gameEnum.GameConst.INTERVAL_CHICKEN_ANSWER_TIME - roomTime;
            var currentQuestionId = resp['currentQuestionId'];
            desc = desc - 1;
            if (curQuestion != null && currentQuestionId != curQuestion.id) {
                th.getResult();
                curQuestion = null;
            }
            else {
                if (desc >= 0) {
                    desc=Math.min(10,desc);
                    th.reverseTime.label.string = desc;
                    th.updateAnswers(fighterAnswers)
                }
            }



        })
    },

    //本局结果
    showGameResult(result, step) {
        th.resultPanel.active = true;
        th.resultPanel.getComponent(cc.Animation).play();

        cc.find('lose', th.resultPanel).active = !result;
        cc.find('win', th.resultPanel).active = result;
        GameManager.getInstance().myInfo.step += step;
        th.lbl_currentScore.string = GameManager.getInstance().myInfo.step;
        th.lbl_resultScore.string = step;

        // if(result){
        //     //胜利
        //     AudioManager.getInstance().playEffect(AudioManager.EFFECT_TYPE.SUCCESS);
        // }else{
        //     //失败
        //     AudioManager.getInstance().playEffect(AudioManager.EFFECT_TYPE.FAIL);
        // }
    },

    showTips(content) {
        this.tips.node.active = true;
        cc.find("lbl", this.tips.node).getComponent(cc.Label).string = content;
        this.scheduleOnce(function () {
            this.tips.node.active = false;
        }, 1);
    },
    btnBackClick(event) {
        cc.director.loadScene("main", function () {
        })
    },
    btnAgain(event) {
        GameManager.getInstance().Chicken_StartMatch(function (resp) {
            GameManager.getInstance().chickenMode = 3;
            GameManager.getInstance().gameState = gameEnum.GAME_STATE.CHIKEN_MATCHING;
            cc.director.loadScene("game", function () {
            })
        });
    },
    onClickRight(event) {
        if (curQuestion != null && myNode.side != 0) {
            GameManager.getInstance().Chicken_SubmitAnswer(null, 0, curQuestion.id, function (resp) {
                th.choose.setPosition(cc.v2(184.5,1334))
                th.setFighterNodePos(0, myNode, true, true)
                th.getSituation();
            })
        }
    },
    onClickWrong(event) {
        if (curQuestion != null && myNode.side != 1) {
            GameManager.getInstance().Chicken_SubmitAnswer(null, 1, curQuestion.id, function (resp) {
                th.choose.setPosition(cc.v2(566,1334))
                th.setFighterNodePos(1, myNode, true, true)
                th.getSituation();
            })
        }

    },

    onClickConfirmResult(event) {
        cc.director.loadScene('main', function (resp) {

        })
    },
    // clearAnswerList()
    // {
    //     for(var i=0;i<playerListLeft.length;i++)
    //     {
    //         playerListLeft[i].getComponent(cc.Label).string='';
    //         playerListRight[i].getComponent(cc.Label).string='';
    //     }
    // },
    updateAnswers(data) {
        // this.clearAnswerList();
        // var idxLeft=0;
        // var idxRight=0;
        // for(var i=data.length-1;i>=0;i--)
        // {

        // var player=GameManager.getInstance().getChickenPlayer(data[i].openId)
        // if(player != null)
        // {
        //     if(data[i].answer == 0)
        //     {
        //         if(idxLeft<playerListLeft.length)
        //         {
        //             playerListLeft[idxLeft].getComponent(cc.Label).string=player.nickName;
        //         }

        //         idxLeft++;
        //     }
        //     else if(data[i].answer == 1)
        //     {
        //         if(idxRight<playerListRight.length)
        //         {
        //             playerListRight[idxRight].getComponent(cc.Label).string=player.nickName;
        //         }           
        //         idxRight++;
        //     }
        // }
        // }


        for (var i = data.length - 1; i >= 0; i--) {
            var answerVo = data[i];
            var fighterNode = fighterNodes[answerVo.openId];

            if (fighterNode != null) {
                fighterNode.isAlive = true;
                fighterNode.node.active = true;
                if (answerVo.answer == 0) {
                    if (fighterNode.side != 0) {
                        this.setFighterNodePos(0, fighterNode, true, answerVo.openId == GameManager.getInstance().myInfo.openId)
                    }

                } else {
                    if (fighterNode.side != 1) {
                        this.setFighterNodePos(1, fighterNode, true, answerVo.openId == GameManager.getInstance().myInfo.openId)
                    }

                }
            }
        }

        for (let key in fighterNodes) {
            var fighterNode = fighterNodes[key];
            if (!fighterNode.isAlive) {
                var stateArr = fighterNode.side == 0 ? this.leftHoleState : this.rightHoleState;
                if (fighterNode.holeIdx != -1) {
                    stateArr[fighterNode.holeIdx] = 0;
                    fighterNode.holeIdx = -1;
                }
                fighterNode.node.active = false;
            }

        }
    },
    updateMatcher(data) {
        for (let key in fighterNodes) {
            var fighterNode = fighterNodes[key];
            // fighterNode.node.active = false;
        }
        myNode=null;
        for (var i = data.length - 1; i >= 0; i--) {
            var answerVo = data[i];
            var fighterNode = fighterNodes[answerVo.openId];

            if (fighterNode != null) {
                fighterNode.node.active = true;
            }
            else {
                var node = cc.instantiate(GameManager.getInstance().fighterNode);
                var fighterNode = node.getComponent(FighterNode);
               
                node.setParent(this.group_playersInitPos);
                fighterNode.updateWithData(data[i]);

                fighterNodes[fighterNode.openId] = fighterNode;
                if (Math.random() > .5) {
                    this.setFighterNodePos(0, fighterNode, false, answerVo.openId == GameManager.getInstance().myInfo.openId)
                } else {
                    this.setFighterNodePos(1, fighterNode, false, answerVo.openId == GameManager.getInstance().myInfo.openId)
                }
               
            }
            if (answerVo.openId == GameManager.getInstance().myInfo.openId) {
                myNode=fighterNode;
              
            }
        }
        if(myNode != null)
        {
            th.sign_me.active = true;
            th.sign_me.setParent(myNode.renderNode);
            th.sign_me.setPosition(0, 80)
            myNode.node.setSiblingIndex(999)
            if(!hasLoadedMyIcon)
            {
                if(GameManager.getInstance().myInfo.iconUrl != null)
                {
                    UIHelper.SetImageFromUrl(cc.find('mask/icon',th.sign_me).getComponent(cc.Sprite),GameManager.getInstance().myInfo.iconUrl, true);
                    hasLoadedMyIcon=true;
                }
            }
          
           
        }
    },
    OnDoubleReward(event) {
        cc.director.loadScene('main', function (resp) {
        })
    },
    onExitMatch(event) {
        if (GameManager.getInstance().chickenMode == 3) {
            GameManager.getInstance().Chicken_EndMatch(function (resp) {
                cc.director.loadScene('main', function (resp) {

                })
            })
        }
        else {
            GameManager.getInstance().Chicken_ExitRoom(function (resp) {
                cc.director.loadScene('main', function (resp) {

                })
            })
        }

    }
    ,
    onUseTool(event) {
        GameManager.getInstance().Chicken_Use_UnDeadTool(th.toggle_tool.isChecked ? 1 : 0, function (resp) { })
    },
    setFighterNodePos(toSide, fighterNode, motion, isMe) {
        var tostateArr = toSide == 0 ? this.leftHoleState : this.rightHoleState;
        var toholeArr = toSide == 0 ? this.leftHole : this.rightHole;
        var fromstateArr = toSide == 0 ? this.rightHoleState : this.leftHoleState;
        for (var i = 0; i < tostateArr.length; i++) {
            if (tostateArr[i] == 0) {
                fighterNode.side = toSide;
                if (fighterNode.holeIdx != -1) {
                    fromstateArr[fighterNode.holeIdx] = 0;
                }
                tostateArr[i] = 1;
                fighterNode.holeIdx = i;
                var toLocalPos = toholeArr[i].getPosition();
                var toWorldPos = toholeArr[i].parent.convertToWorldSpaceAR(toLocalPos);
                var toPos = fighterNode.node.parent.convertToNodeSpaceAR(toWorldPos);
                fighterNode.setPosition(toPos.x, toPos.y, motion, isMe)
                break;
            }
        }
    },
    playDeadAni(answer,fighters) {
        var deadSide = answer == 1 ? 0 : 1;
        this.monster.moveSideToFire(deadSide)

        for (let key in fighterNodes) {
            var fighterNode = fighterNodes[key];
            var inlist=this.isFightNodeInList(fighterNode,fighters)
            if(fighterNode.side == deadSide && inlist)
            {
                this.setFighterNodePos(deadSide == 0?1:0, fighterNode, true, false)
            }
        }

        this.scheduleOnce(function () {
            for (let key in fighterNodes) {
                var fighterNode = fighterNodes[key];
                if (fighterNode.side == deadSide) {
                    var stateArr = fighterNode.side == 0 ? this.leftHoleState : this.rightHoleState;
                    if (fighterNode.holeIdx != -1) {
                        stateArr[fighterNode.holeIdx] = 0;
                        fighterNode.holeIdx = -1;
                    }
                }
            }

        }, .7);
        // var tohole = deadSide == 0 ? this.leftHole : this.rightHole;
        // var cb=cc.callFunc(function(){ tohole.active = false;})
        // var action=cc.sequence(cc.fadeOut(1),cb);
        // tohole.runAction(action);
    },
    isFightNodeInList(fightNode,list)
    {
        for (var i=0;i<list.length;i++) {
            if(fightNode.openId == list[i].openId)
            {
                return true;
            }
            
        }
        return false;
    },
    playEndAni(isCorrect,fighters)
    {
        var deadSide;
        if(!isCorrect)
        {
            deadSide=myNode.side;
        }
        else
        {
            deadSide=myNode.side == 0?1:0;
        }
        this.monster.moveSideToFire(deadSide)
        for (let key in fighterNodes) {
            var fighterNode = fighterNodes[key];
            var inlist=this.isFightNodeInList(fighterNode,fighters)
            if(fighterNode.side == deadSide && inlist)
            {
                this.setFighterNodePos(deadSide == 0?1:0, fighterNode, true, false)
            }
        }
        this.scheduleOnce(function () {
            for (let key in fighterNodes) {
                var fighterNode = fighterNodes[key];
                if (fighterNode.side == deadSide) {
                    var stateArr = fighterNode.side == 0 ? this.leftHoleState : this.rightHoleState;
                    if (fighterNode.holeIdx != -1) {
                        stateArr[fighterNode.holeIdx] = 0;
                        fighterNode.holeIdx = -1;
                    }
                }
            }

        }, .7);
    },
    onInvite()
    {
        WXTool.getInstance().shareToPlayTogether(GameManager.getInstance().myInfo.wxName, GameManager.getInstance().roomId,function(){
        });
    },
    onStartNow()
    {
        GameManager.getInstance().Chicken_StartNow(function(rest){

        })
        
    },
    update(dt) {
        if (GameManager.getInstance().gameState == gameEnum.GAME_STATE.CHIKEN_MATCHING) {
            time_matching += dt;
            if (time_matching >= gameEnum.GameConst.INTERVAL_MATCHING) {
                time_matching = 0;
                GameManager.getInstance().Chicken_GetRoomState(function (resp) {
                    var state = resp['roomStatus'];
                    th.reverseTime.label.string = 10-resp['roomTime'];
                    th.updateMatcher(resp['players']);
                    if (state == -1) {
                        Alert.show('等待超时', function () {
                            cc.director.loadScene('main', function (resp) {

                            })
                        }, false)
                    }
                    if(state == 2)
                    {
                        th.reverseTime.label.string = 3
                        th.lbl_title.string = '准备开始';
                        time_ready=0;
                        GameManager.getInstance().gameState =gameEnum.GAME_STATE.CHIKEN_READY;
                        th.btn_return.node.active = false;
                        th.aniCountDown.node.active=true;
                        th.toggle_tool.node.active = false;
                        th.btn_invite.node.active=false;
                        th.btn_begin.node.active=false;
                       
                        AudioManager.getInstance().playEffect(AudioManager.EFFECT_TYPE.CHICKEN_GAME_START);
                        th.schedule(function(){AudioManager.getInstance().playEffect(AudioManager.EFFECT_TYPE.CHICKEN_GAME_START);},1,1);
                        th.scheduleOnce(function()
                        {
                            AudioManager.getInstance().playEffect(AudioManager.EFFECT_TYPE.CHICKEN_GAME_START_GO);
                        },3);
                        th.reverseTime.label.string = '';
                        th.aniCountDown.play();
                    }

                });
            }
        }
        if (GameManager.getInstance().gameState == gameEnum.GAME_STATE.CHIKEN_READY) {
            time_ready+=dt;
            if (time_ready >= gameEnum.GameConst.INTERVAL_MATCHING) {
                time_ready = 0;
                GameManager.getInstance().Chicken_GetRoomState(function (resp) {
                    // th.updateMatcher(resp['players']);
                    var state = resp['roomStatus'];
                    // th.reverseTime.label.string = 3-resp['roomTime'];
                    if (state == 1) {
                        
                        // for (let key in fighterNodes) {
                        //     var fighterNode = fighterNodes[key];
                        //     fighterNode.node.active = false;
                        // }
                        GameManager.getInstance().chickenGroup = resp['players'];
                        
                        th.coin.active = true;
    
                        // th.initFighter();
                        th.nextRound();
                    }
    
                });
            }
           
        }
        if (GameManager.getInstance().gameState == gameEnum.GAME_STATE.CHIKEN_ANSWERING) {
            time_checkSituation += dt;
            if (time_checkSituation >= gameEnum.GameConst.INTERVAL_CHICKEN_SITUATION) {
                time_checkSituation = 0;
                th.getSituation();
            }
        }
        if (GameManager.getInstance().gameState == gameEnum.GAME_STATE.CHIKEN_GET_RESULT) {
            time_checkResult += dt;
            if (time_checkResult >= gameEnum.GameConst.INTERVAL_CHICKEN_GET_RESULT) {
                time_checkResult = 0;
                GameManager.getInstance().Chicken_GetResult(function (resp) {
                    GameManager.getInstance().gameState = gameEnum.GAME_STATE.NONE;
                    var isEnd = resp['end'];
                    var isCorrect = resp['correct'];
                    if(isCorrect)
                    {
                        th.rightAni.play();
                    }
                    else
                    {
                        th.wroghtAni.play();
                    }
                    var step = resp['step'];
                    var fighters = resp['fighter']
                    var answer=resp['answer']
                    if (isEnd || !isCorrect) {
                        GameManager.getInstance().gameState = gameEnum.GAME_STATE.END;
                        th.scheduleOnce(function () {
                        th.showGameResult(isCorrect, step)},3);
                        th.playEndAni(isCorrect,fighters)
                    }else{
                        // th.answerResultBoard.active = true;
                        for (let key in fighterNodes) {
                            var fighterNode = fighterNodes[key];
                            fighterNode.isAlive = false;
                        }
                        th.scheduleOnce(function () {
                            th.answerResultBoard.active = false;
                            th.nextRound();
                        }, 3);
                        th.playDeadAni(answer,fighters)
                    }

                   
                })
            }
        }
    },
});
