var GameManager = require("GameManager");
var StoryPanel = require("StoryPanel");

cc.Class({
    extends: cc.Component,

    properties: {
        lb_name: cc.Label,
    },

    onLoad () {
    },

    start () {
    },

    initWithId(id){
        this.id = id;
        var mapConfig = this.getConfig();

        this.lb_name.string = mapConfig.name;
        this.node.position = new cc.Vec2(mapConfig.position[0], mapConfig.position[1]);
    },

    getConfig(){
        return GameManager.getInstance().mapConfig[this.id - 1];;
    },

    onClick(event){
        if(this.id == 0){
            return;
        }
        
        var mapConfig = GameManager.getInstance().mapConfig[this.id - 1];
        if(mapConfig == null){
            return;
        }

        //弹出介绍
        cc.director.loadScene("story", function(error, scene){
            if(error != null){
                return;
            }

            scene.getChildByName("Canvas").getComponent(StoryPanel).updateContent(mapConfig);
        });
    }
});
