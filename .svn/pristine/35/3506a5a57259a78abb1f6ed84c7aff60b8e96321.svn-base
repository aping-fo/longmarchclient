// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var UIHelper    = require("UIHelper");
var GameManager = require("GameManager");
var MapPoint    = require("MapPoint");
var WXTool      = require("WXTool");

cc.Class({
    extends: cc.Component,

    properties: {
        graphic: cc.Graphics,
        mapPieceContainer: cc.Node,
        mapPointContainer: cc.Node,
        roleContainer: cc.Node,
        
        camera: cc.Camera,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var _this = this;
    },

    start () {
        this.mapPoints = [];
        this.mapPiece = [];
        this.mapRoadPoints = [];
        this.nextMapPoint = null;

        this.myRoleNode = null;
        this.roleNodes = [];
        
        this.deltaPos = cc.Vec2.ZERO;
        this.isMoving = false;

        this.camera.zoomRatio = cc.visibleRect.width / this.node.width;
        
        var self = this;
        var oldTouchPos = null;
        
        self.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            var touches = event.getTouches();
            oldTouchPos = touches[0].getLocation();
            self.isMoving = true;

        }, self.node);
        
        self.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            var touches = event.getTouches();
            var newTouchPos = touches[0].getLocation();

            self.deltaPos = newTouchPos.sub(oldTouchPos);
            oldTouchPos = newTouchPos;
        }, self.node);

        self.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            self.isMoving = false;
        }, self.node);
        
        self.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            self.isMoving = false;
        }, self.node);
    },

    update(dt){
        if(!this.isMoving) return;

        this.moveMap(this.node.position.add(this.deltaPos));
    },

    init(){
    },

    roleMove(){
        var step = GameManager.getInstance().myInfo.totalStep;
        var mapConfig = GameManager.getInstance().mapConfig;
        
        //人物
        if(this.myRoleNode == null){
            var roleNode = cc.instantiate(GameManager.getInstance().roleNode);
            roleNode.setParent(this.roleContainer);
            
            UIHelper.SetImageFromUrl(roleNode.getChildByName("img_avatar"), GameManager.getInstance().myInfo.iconUrl, true);
            roleNode.getChildByName("lb_name").getComponent(cc.Label).string = GameManager.getInstance().myInfo.wxName;
            roleNode.getChildByName("light").active = true;
            this.myRoleNode = roleNode;
        }
        //地图点
        for(var i = 0; i < mapConfig.length; i++){
            if(mapConfig[i].step <= step){
                //走过的地点
                if(this.mapPoints.length <= i){
                    var node = cc.instantiate(GameManager.getInstance().mapPointNode);
                    node.setParent(this.mapPointContainer);
    
                    var mapPoint = node.getComponent(MapPoint);
                    mapPoint.initWithId(mapConfig[i].id);
                    this.mapPoints.push(mapPoint);
                }
            }else{
                //下一个地点
                if(this.nextMapPoint == null || this.nextMapPoint.getConfig().id != mapConfig[i].id){
                    var node = cc.instantiate(GameManager.getInstance().mapPointNode);
                    node.setParent(this.mapPointContainer);
    
                    var mapPoint = node.getComponent(MapPoint);
                    mapPoint.initWithId(mapConfig[i].id);
    
                    this.nextMapPoint = mapPoint;
                }
                break;
            }
        }

        var rolePos = this.getRolePos(step);
        this.myRoleNode.position = rolePos;

        this.moveMap(rolePos);

        this.updateMapPiece();
        this.updateMapRoad();
    },
    
    //更新人物位置
    updateOtherRolePositions(data){
        var step = data.step;
        var node = this.roleNodes[data.openId];

        if(node == null){
            node = cc.instantiate(GameManager.getInstance().roleNode);
            node.setParent(this.roleContainer);

            UIHelper.SetImageFromUrl(node.getChildByName("img_avatar").getComponent(cc.Sprite), data.iconUrl, true);
            node.getChildByName("lb_name").getComponent(cc.Label).string = data.name;
            node.getChildByName("light").active = false;
        }

        //设置位置
        node.position = this.getRolePos(step);
    },

    //更新地图块
    updateMapPiece(){
        var _this = this;

        function loadMapPiece(mapPieceId){
            var node = cc.instantiate(GameManager.getInstance().mapPieceNode);
            node.setParent(_this.mapPieceContainer);
            
            var mapPieceConfig = GameManager.getInstance().mapPieceCfg[mapPieceId];
            UIHelper.SetImageFromUrl(node.getComponent(cc.Sprite), mapPieceConfig.url, false);
            node.position = new cc.Vec2(mapPieceConfig.position[0], mapPieceConfig.position[1]);

            _this.mapPiece[mapPieceId] = node;
        }
        for(var i = 0; i < this.mapPoints.length; i++){
            var mapConfig = this.mapPoints[i].getConfig();
            if(this.mapPiece[mapConfig.mapPieceId] == null){
                loadMapPiece(mapConfig.mapPieceId);
            }
        }

        if(this.nextMapPoint != null){
            var mapConfig = this.nextMapPoint.getConfig();
            if(this.mapPiece[mapConfig.mapPieceId] == null){
                loadMapPiece(mapConfig.mapPieceId);
            }
        }
    },

    //更新路径点
    updateMapRoad(){
        var step = GameManager.getInstance().myInfo.totalStep;
        var roadPointCount = 0;
        for(var i = 0; i < this.mapPoints.length - 1; i++){
            var mapConfig = this.mapPoints[i].getConfig();
            
            if(mapConfig.roadPoints != null){
                for(var j = 0; j < mapConfig.roadPoints.length; j++){
                    if(this.mapRoadPoints[roadPointCount] == null){
                        var node = cc.instantiate(GameManager.getInstance().mapRoadPointNode);
                        node.setPosition(new cc.Vec2(mapConfig.roadPoints[j][0], mapConfig.roadPoints[j][1]));
                        node.setParent(this.mapPointContainer);

                        this.mapRoadPoints.push(node);
                    }
                    roadPointCount++;
                }
            }
        }

        var curMapConfig = this.mapPoints[this.mapPoints.length - 1].getConfig();
        var nextMapCofig = this.nextMapPoint.getConfig();

        //完成了百分比
        var ratio   = 0;
        if(nextMapCofig != null){
            ratio = (step - curMapConfig.step)/(nextMapCofig.step - curMapConfig.step);
        }

        if(curMapConfig.roadPoints != null){
            var perRoadPointRatio = 1 / (curMapConfig.roadPoints.length + 1);
            for(var j = 0; j < curMapConfig.roadPoints.length; j++){
                if(ratio > perRoadPointRatio * (j + 1) && this.mapRoadPoints[roadPointCount] == null){
                    var node = cc.instantiate(GameManager.getInstance().mapRoadPointNode);
                    node.setPosition(new cc.Vec2(curMapConfig.roadPoints[j][0], curMapConfig.roadPoints[j][1]));
                    node.setParent(this.mapPointContainer);

                    this.mapRoadPoints.push(node);
                }
                roadPointCount++;
            }
        }
    },

    moveMap(position){
        var node = this.node;
        node.position = new cc.Vec3(position.x, position.y, 0);

        //修正位置
        var rect = node.getBoundingBoxToWorld();
        
        node.x = 0;
        if(node.y > 0){
            node.y = 0;
        }else if(node.y < -rect.height){
            node.y = -rect.height;
        }
    },
    
    //查找某步数当前和下个的点配置
    getRolePos(step){
        var mapConfig = GameManager.getInstance().mapConfig;
        var curMapConfig = null;
        var nextMapCofig = null;

        //地图点
        for(var i = 0; i < mapConfig.length; i++){
            if(mapConfig[i].step <= step){
                //走过的地点
                curMapConfig = mapConfig[i];
            }else{
                //下一个地点
                nextMapCofig = mapConfig[i];
                break;
            }
        }

        //完成了百分比
        var pos = new cc.Vec2(curMapConfig.position[0], curMapConfig.position[1]);
        if(nextMapCofig != null && curMapConfig.roadPoints != null){
            var ratio = (step - curMapConfig.step)/(nextMapCofig.step - curMapConfig.step);
            var perRoadPointRatio = 1 / (curMapConfig.roadPoints.length + 1);

            for(var i = 0; i < curMapConfig.roadPoints.length; i++){
                if(ratio > perRoadPointRatio * (i + 1)){
                    pos = new cc.Vec2(curMapConfig.roadPoints[i][0], curMapConfig.roadPoints[i][1]);
                }
            }
        }
        
        return pos;
    },
});
