cc.Class({
    extends: cc.Component,
 
    properties: {
       far_bg:[cc.Node],
       dead_Canvas:cc.Node,
       far_speed:0.2,
       isStart:false,
       speed:0,
       accelerate:5,
       targetSpeed:0,
    },
 
   onLoad :function() {
       this.fixBgPos(this.far_bg[0],this.far_bg[1]);
   },
 
   fixBgPos:function(bg1,bg2){
       bg1.x = 0;
       //利用前一张图片的边框大小设置下一张图片的位置
       var bg1BoundingBox = bg1.getBoundingBox();
       bg2.setPosition(bg1BoundingBox.xMin,bg1BoundingBox.yMax)
   },
 
   update:function(dt){
       if(this.isStart)
       {
           if(this.targetSpeed>this.speed)
           {
            this.speed+=dt*this.accelerate;
            this.speed=Math.min(this.targetSpeed,this.speed)
           
           }
           if(this.targetSpeed<this.speed)
           {
            this.speed-=dt*this.accelerate;
            this.speed=Math.max(this.targetSpeed,this.speed)
           }
           this.checkBgReset(this.far_bg);
        this.bgMove(this.far_bg,this.speed);
       
       }
     
   },
 
   bgMove:function(bgList,speed){
       for(var index = 0; index < bgList.length; index++){
           var element = bgList[index];
           element.y += speed;
       }
       this.dead_Canvas.y=this.far_bg[0].y;
   },
   //检查是否要重置位置
    checkBgReset:function(bgList){
        var first_yMax = bgList[0].getBoundingBox().yMax;
        if(first_yMax>=bgList[0].height){
            bgList[0].y=0;
            var preFirstBg = bgList.shift();
            bgList.push(preFirstBg);
            var curFirstBg = bgList[0];
            curFirstBg.y = -bgList[0].height;
        }
    },
    startMove()
    {
        this.isStart=true;
        this.targetSpeed=this.far_speed;
    },
    slowDown()
    {
        this.targetSpeed=0;
    },
    stopMove()
    {
        this.isStart=false;
    }
    
});