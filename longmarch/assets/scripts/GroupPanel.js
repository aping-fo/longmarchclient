var UIHelper = require("UIHelper");
var PopupTipsNode = require("PopupTipsNode");
var GameManager = require("GameManager");
var WXTool = require("WXTool");
var Util = require("util");

cc.Class({
    extends: cc.Component,

    properties: {
        membersContentNode: cc.Node,
        noticeContentNode: cc.Node,
        illustrationContentNode: cc.Node,
        settingContentNode: cc.Node,

        toggleContainer: cc.ToggleContainer,

        nameLb: cc.Label,
        modifyNameEb: cc.EditBox,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    },

    start () {
        this.membersContentNode.active = false;
        this.noticeContentNode.active = false;
        this.illustrationContentNode.active = false;
        this.settingContentNode.active = false;
        this.m_isOwner = false;

        this.showContentNode = null;
        
        var _this = this;
        GameManager.getInstance().Group_GetInfo(function(resp){
            _this.updateGroupInfo();
            _this.onToggleBtnsClick(_this.toggleContainer.toggleItems[0]);
        });
        this.updateGroupInfo();
    },

    updateGroupInfo(){
        var info = GameManager.getInstance().groupInfo;
        
        if(info == null) return;

        this.nameLb.string = info.name;
        this.m_isOwner = info.creatorOpenId == GameManager.getInstance().myInfo.openId;
    },

    updateNotice(){
        var _this = this;

        GameManager.getInstance().Group_GetRecord(function(resp){
            var records = resp;
            var itemContainer = cc.find("scrollView/view/content", _this.noticeContentNode)
            for(var i = 0; i < itemContainer.childrenCount; i++){
                itemContainer.children[i].active = false;
            }

            for(var i = 0; i < records.length; i++){
                var recordInfo = records[i];
                var item = null;
                if(i < itemContainer.childrenCount){
                    item = itemContainer.children[i]
                }else{
                    item = cc.instantiate(itemContainer.children[0]);
                    item.setParent(itemContainer);
                }
                item.active = true;
                
                var cfg = null;
                for(var j = 0; j < GameManager.getInstance().groupRecordCfg.length; j++){
                    if(GameManager.getInstance().groupRecordCfg[j].id == recordInfo.id){
                        cfg = GameManager.getInstance().groupRecordCfg[j];
                    }
                }
                
                item.getChildByName("lb_content").getComponent(cc.Label).string = Util.formatString(cfg.format, recordInfo.playerName, recordInfo.param);

                item.name = String(i);
            }
        });
    },

    updateMembers(){
        var myOpenId = GameManager.getInstance().myInfo.openId;
        var info = GameManager.getInstance().groupInfo;
        var itemContainer = cc.find("scrollView/view/content", this.membersContentNode)
        var inviteItem = cc.find("inviteItem", itemContainer);

        for(var i = 0; i < itemContainer.childrenCount -1; i++){
            itemContainer.children[i].active = false;
        }

        for(var i = 0; i < info.groupMembers.length; i++){
            var memberInfo = info.groupMembers[i];
            var item = null;
            if(i < itemContainer.childrenCount - 1){
                item = itemContainer.children[i]
            }else{
                item = cc.instantiate(itemContainer.children[0]);
                item.setParent(itemContainer);
                UIHelper.SetLastSiblingIndex(inviteItem);
            }
            item.active = true;
            UIHelper.SetImageFromUrl(item.getChildByName("img_avatar"), memberInfo.avatarUrl, true);
            item.getChildByName("lb_name").getComponent(cc.Label).string = memberInfo.nickName;
            item.getChildByName("lb_contribute").getComponent(cc.Label).string = memberInfo.step;
            item.getChildByName("btn_encourage").active = memberInfo.openId != myOpenId;
            item.getChildByName("btn_warn").active = memberInfo.openId != myOpenId;

            item.name = String(i);
        }
    },

    updateIllustration(){

    },

    updateSetting(){
        if(this.m_isOwner){
            this.settingContentNode.getChildByName("ownerPanel").active = true;
            this.settingContentNode.getChildByName("memberPanel").active = false;
        }else{
            this.settingContentNode.getChildByName("ownerPanel").active = false;
            this.settingContentNode.getChildByName("memberPanel").active = true;
        }
    },

    ///////////////// btn /////////////////
    onEncourageBtnClick(event){
        var btn = event.target;
        var index = Number(btn.parent.name);
        var info = GameManager.getInstance().groupInfo.groupMembers[index];

        if(info != null){
            GameManager.getInstance().Group_Encourage(info.nickName);
        }
    },

    onWarnBtnClick(event){
        var btn = event.target;
        var index = Number(btn.parent.name);
        var info = GameManager.getInstance().groupInfo.groupMembers[index];

        if(info != null){
            GameManager.getInstance().Group_Warn(info.nickName);
        }
    },

    onModifyNameBtnClick(event){
        if(this.modifyNameEb.string.length == 0){ return; }

        var _this = this;
        GameManager.getInstance().Group_ModifyName(this.modifyNameEb.string, function(resp){
            _this.updateGroupInfo();
        });
    },

    onModifyAvatarBtnClick(event){
        WXTool.getInstance().chooseImageFromAlbum();
    },

    onInviteBtnClick(event){
        var info = GameManager.getInstance().groupInfo;

        if(info == null) return;

        WXTool.getInstance().shareToJoinGroup(info.id, info.name, GameManager.getInstance().myInfo.nickName, function(resp){
            PopupTipsNode.appearWithText("邀请成功");
        });
    },
    
    onDismissGroupBtnClick(event){
        var info = GameManager.getInstance().groupInfo;

        if(info == null) return;

        if(!this.m_isOwner){
            PopupTipsNode.appearWithText("不是团长不能解散");
            return;
        }

        var _this = this;
        GameManager.getInstance().Group_Dissolve(function(resp){
            GameManager.getInstance().Group_GetInfo(function(resp){
                _this.updateGroupInfo();
            });
        });
    },
    
    onLeaveGroupBtnClick(event){
        var info = GameManager.getInstance().groupInfo;

        if(info == null) return;

        if(this.m_isOwner){
            PopupTipsNode.appearWithText("不是团员不能退出");
            return;
        }

        GameManager.getInstance().Group_Exit(function(resp){
            GameManager.getInstance().Group_GetInfo(function(resp){
                _this.updateGroupInfo();
            });
        });
    },

    onCloseBtnClick(event){
        GameManager.getInstance().LoadScene("main");
    },

    onToggleBtnsClick(event){
        this.showContentNode && (this.showContentNode.active = false);

        var toggle = event;
        switch(toggle.node.name){
            case "tg_notice":
            {
                this.showContentNode = this.noticeContentNode;
                this.updateNotice();
            }
                break;
            
            
            case "tg_members":
            {
                this.showContentNode = this.membersContentNode;
                this.updateMembers();
            }
                break;
            
            case "tg_illustration":
            {
                this.showContentNode = this.illustrationContentNode;
                this.updateIllustration();
            }
                break;
            
            case "tg_setting":
            {
                this.showContentNode = this.settingContentNode;
                this.updateSetting();
            }
                break;
        }
        this.showContentNode.active = true;
    }

});
