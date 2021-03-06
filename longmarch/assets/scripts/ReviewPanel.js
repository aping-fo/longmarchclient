// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var HistoryQuestionModel = require("HistoryQuestionModel");
var GameManager = require("GameManager");
var UIHelper = require("UIHelper");
var WXTool = require("WXTool");

cc.Class({
    extends: cc.Component,

    properties: {
        // pageView: {
        //     type: cc.PageView,
        //     default: null
        // },

        leftPageBtn: {
            type: cc.Button,
            default: null
        },

        rightPageBtn: {
            type: cc.Button,
            default: null
        },

        contentNode: {
            type: cc.Node,
            default: null
        },

        shareNode: {
            type: cc.Node,
            default: null
        },

        saveWithoutNodes: [cc.Node],

        pageNumLb: {
            type: cc.Label,
            default: null
        },

        saveHeigth: 1000
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    },

    start () {
        this.m_datas = null;
        this.m_pageIndex = 0;

        var _this = this;

        HistoryQuestionModel.getInstance().getDatas(function(resp){
            console.log("HistoryQuestionModel", resp);
            _this.m_datas = resp.questions;
            _this.updateContent();
        });

        this.shareNode.active = false;
        this.node.getComponent(cc.Animation).play("review_2");
    },

    onEnable(){

    },

    updateContent(){
        var item = this.contentNode;
        var data = this.m_datas[this.m_pageIndex];

        if(data != null){
            cc.find("pop_1/lb_question", item).active = true;
            cc.find("pop_3/lb_explain", item).active = true;
            cc.find("pop_2/right", item).active = true;
            cc.find("pop_2/wrong", item).active = true;

            cc.find("pop_1/lb_question", item).getComponent(cc.Label).string = data.content;
            cc.find("pop_3/lb_explain", item).getComponent(cc.Label).string = data.explain;
            cc.find("pop_2/right", item).active = data.answer == "正确";
            cc.find("pop_2/wrong", item).active = data.answer != "正确";
        }else{
            cc.find("pop_1/lb_question", item).active = false;
            cc.find("pop_3/lb_explain", item).active = false;
            cc.find("pop_2/right", item).active = false;
            cc.find("pop_2/wrong", item).active = false;
        }

        var maxPageIndex = this.m_datas.length;
        this.pageNumLb.string = (this.m_pageIndex + 1) + "/" + maxPageIndex;

        this.leftPageBtn.node.active = this.m_pageIndex > 0;
        this.rightPageBtn.node.active = this.m_pageIndex + 1 < maxPageIndex;
    },

    saveImageToAlbum(){
        UIHelper.SaveCanvas(this.saveWithoutNodes, false, function(path){
            if(path != ""){
                WXTool.getInstance().saveImageToAlbum(path, function(result){
                    if(result == "success"){
                        console.log("成功");
                    }else{
                        console.log("失败");
                    }
                });
            }
        });
    },

    onLeftPageBtnClick(btn){
        if(this.m_datas == null){
            return;
        }
        this.m_pageIndex--;
        this.updateContent();
    },

    onRightPageBtnClick(btn){
        if(this.m_datas == null){
            return;
        }
        this.m_pageIndex++;
        this.updateContent();
    },

    onSaveBtnClick(btn){
        if(this.m_datas == null){
            return;
        }
        this.shareNode.active = true;
    },

    onCloseBtnClick(btn){
        GameManager.getInstance().LoadScene("main");
    },

    ////////////////////////////  分享弹框  ////////////////////////////
    onShareCloseBtnClick(btn){
        this.shareNode.active = false;
    },

    onShareBtnClick(btn){
        WXTool.getInstance().share();
    },

    onSaveCanvasBtnClick(btn){
        this.saveImageToAlbum();
    }
});
