// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var UIHelper = require("UIHelper");
var GameManager = require("GameManager");
var gameEnum = require("GameEnum");
var isMoving=false;
// var colors=[cc.color(255,127,127),cc.color(155,124,255),cc.color(124,187,255),cc.color(202,236,92),cc.color(236,150,92),cc.color(255,133,117),cc.color(92,113,128),cc.color(255,255,255)]
var colors=[cc.color(244,216,146)];

cc.Class({
    extends: cc.Component,

    properties: {
        renderNode: {
            type: cc.Node,
            default: null
        },

        avatarImg: {
            type: cc.Sprite,
            default: null
        },

        nameLb: {
            type: cc.Label, 
            default: null
        },

        dragonBoneDisplay: {
            type: dragonBones.ArmatureDisplay,
            default: null
        },

        openId: "",
        side:0,
        holeIdx:-1,
        isAlive:false,
        isDead:false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
       
    },

    reset()
    {
        var img=cc.find('img',this.renderNode);
        img.color=this.myColor;
        // var _armatureDisPlay = img.getComponent(dragonBones.ArmatureDisplay)
        // //获取 Armatrue
        // var _armature = _armatureDisPlay.armature()
        // var slots=_armature.getSlots();
        // for(var slot of slots)
        // {
        //     slot._color=this.myColor;
           
        // }
    },

    start () {
      
        this.m_answerTimer = 0;
        this.dragonBoneDisplay.playAnimation("normal", 0);
        this.dragonBoneDisplay.addEventListener(dragonBones.EventObject.COMPLETE, this.onAnimationComplete, this);
    },

    update (dt) {
        // if(this.isDead)
        // {
        //     var oldWorldPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
        //     if(oldWorldPos.y<200)
        //     {
        //         this.node.active=false;
        //     }
        //     return;
        // }
        if(!this.m_isRobot){
            return;
        }

        if(!this.isAlive){
            return;
        }
        
        if(GameManager.getInstance().gameState != gameEnum.GAME_STATE.CHIKEN_ANSWERING){
            return;
        }

        this.m_answerTimer -= dt;
        if(this.m_answerTimer <= 0){
            var answer = 0;
            if(Math.random() > 0.5){
                answer = 1;
            }
            if(this.m_question != null)
            {
                GameManager.getInstance().Chicken_SubmitAnswer(this.openId, answer, this.m_question.id, function(){

                });
                this.resetAnswerTime();
            }
          
        }
    },
    
    updateWithData(data){
        this.m_isRobot = data.robot;

        this.openId = data.openId;
        this.nameLb.string = data.nickName;
        var ran=Math.round(Math.random()*(colors.length-1))
        this.myColor=colors[ran];
        if( data.openId == GameManager.getInstance().myInfo.openId)
        {
            this.reset();
        }
       
        // UIHelper.SetImageFromUrl(this.avatarImg.getComponent(cc.Sprite), data.iconUrl, true);
    },

    startAnswer(question){
        this.m_question = question;
        this.resetAnswerTime();
        
    },

    resetAnswerTime(){
        if(Math.random() > 0.5){
            this.m_answerTimer = Math.floor(Math.random() * gameEnum.GameConst.INTERVAL_CHICKEN_ANSWER_TIME);
        }
    },

    setPosition(x,y,motion,isMe)
    {
        if(this.isDead)
        {
            return;
        }
        // this.reset();
        if(!motion)
        {
            this.node.setPosition(cc.v2(x,y));
        }
        else
        {
            this.node.stopAllActions();
            var delayTime=(isMe || isMoving)?0:Math.round(Math.random()*5)*.1;
            var moveTo = cc.sequence(cc.delayTime(delayTime),cc.callFunc(function(){isMoving=true}),cc.moveTo(0.3, cc.v2(x,y)),cc.callFunc(function(){isMoving=false}));
            this.node.runAction(moveTo);
        }
    },

    playDeadAnim(){
        // this.dragonBoneDisplay.playAnimation("unnormal", 1);
        // var img=cc.find('img',this.renderNode);
        // var _armatureDisPlay = img.getComponent(dragonBones.ArmatureDisplay)
        // //获取 Armatrue
        // var _armature = _armatureDisPlay.armature()
        // var slots=_armature.getSlots();
        // for(var slot of slots)
        // {
        //     if(slot.name == 'eye_1' || slot.name == 'eye_2')
        //     {
        //         slot.visible=true;
        //     }
        //     else
        //     {
        //         slot._color=cc.color(0,0,0)
    
        //     }   
        // }
        var th=this;
        var cb=cc.callFunc(function(){ th.node.active = false;})
        var action=cc.sequence(cc.delayTime(Math.random()/2),cc.fadeOut(1),cb);
        this.node.runAction(action);
        // this.scheduleOnce(function(){th.node.active = false;},1);
    },

    onAnimationComplete(event){
        if(this.dragonBoneDisplay.animationName != "unnormal"){
            return;
        }
        this.node.active = false;
        
    },

    onCollisionEnter(other, self){
        if(other.node.name != "spray"){
            return;
        }
        var _this=this;
        this.playDeadAnim();
        this.isDead=true;
        // this.scheduleOnce(function(){ var parent=cc.find("Canvas/background/deadCanvas")

        // var oldWorldPos = _this.node.parent.convertToWorldSpaceAR(_this.node.position);
        // _this.node.setParent(parent);

        // var newPos = parent.convertToNodeSpaceAR(oldWorldPos);
        // _this.node.position = newPos;},2)
       
    }
});
