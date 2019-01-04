var GameManager = require("GameManager");

var StoryPanel = cc.Class({
    extends: cc.Component,

    properties: {
        lb_name: cc.Label,
        lb_nickName: cc.Label,
        lb_desc: cc.Label,
        lb_story: cc.Label,
    },

    start () {

    },

    updateContent(config){
        this.node.active = true;

        this.lb_name.string = config.name;
        this.lb_nickName.string = config.nickName;
        if(this.lb_desc != null){
            this.lb_desc.string = config.desc;
        }
        this.lb_story.string = config.story;
    },

    onCloseBtnClick(){
        GameManager.getInstance().LoadScene("main");
    }
});
