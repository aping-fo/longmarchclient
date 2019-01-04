var GameManager = require("GameManager");
var _this;
cc.Class({
    extends: cc.Component,

    properties: {
        data:null,
        lbl_pts: {
            default: null,                                  
            type: cc.Label, 
            serializable: true,   
        },
        lbl_progress: {
            default: null,                                  
            type: cc.Label, 
            serializable: true,   
        },
        progress: {
            default: null,                                  
            type: cc.ProgressBar, 
            serializable: true,   
        },
        icon: {
            default: null,                                  
            type: cc.Sprite, 
            serializable: true,   
        },
        btn_invite: {
            default: null,                                  
            type: cc.Button, 
            serializable: true,   
        },
        lbl_myPts: {
            default: null,                                  
            type: cc.Label, 
            serializable: true,   
        },
        btn_add: {
            default: null,                                  
            type: cc.Button, 
            serializable: true,   
        },
        lbl_title: {
            default: null,                                  
            type: cc.Label, 
            serializable: true,   
        },
        apartSign: {
            default: null,                                  
            type: cc.Node, 
            serializable: true,   
        },
        idx:0,
    },
    onInvite()
    {

    },
    onAdd(){
        
    },
    onLoad()
    {
        _this=this;
    },
    setStaticInfo(cfg,idx,spriteFrame){
        this.apartSign.active=false;
        this.cfg=cfg;
        this.lbl_title.string=cfg.title;
        this.lbl_pts.string="参与要求："+cfg.needStep;
        this.setCurrentParticipantCount(0);
        this.idx=idx;
        this.lbl_myPts.string="x"+GameManager.getInstance().myInfo.step;
        this.btn_add.node.active=false;
        this.btn_invite.node.active=false;
        this.icon.spriteFrame=spriteFrame;
       
    },
    setCurrentParticipantCount(count)
    {
        this.progress.progress=count/ this.cfg.maxCount;
        this.lbl_progress.string=count+"/"+this.cfg.maxCount+"人";
        this.btn_add.node.active=true;
        this.btn_invite.node.active=true;
    },
    updateMyStep()
    {
        this.lbl_myPts.string=GameManager.getInstance().myInfo.step;
    },
    clear()
    {
        this.apartSign.active=false;
        this.btn_add.node.active=false;
        this.btn_invite.node.active=false;
    }
});
