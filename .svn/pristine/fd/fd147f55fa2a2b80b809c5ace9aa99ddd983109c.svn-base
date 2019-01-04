import { ENFILE } from "constants";

var PopupContact = {
    _contact: null,           // prefab
    _input_name:   null,   // 内容
    _input_phone:   null,   // 内容
    _input_address:   null,   // 内容
    _enterButton:   null,   // 取消按钮
    _enterCallBack: null,   // 回调事件
    _animSpeed:     0.3,    // 动画速度
};

cc.Class({
    extends: cc.Component,

    properties: {


    },


    statics:{

        /**
         * detailString :   内容 string 类型.
         * enterCallBack:   确定点击事件回调  function 类型.
         * neeCancel:       是否展示取消按钮 bool 类型 default YES.
         * spritePath:      动态加载弹框中精灵图片的resources路径
         * duration:        动画速度 default = 0.3.
        */
        show(enterCallBack, animSpeed) {

            var self = this;
        
            // 判断
            if (PopupContact._contact != undefined) return;
        
            PopupContact._animSpeed = animSpeed ? animSpeed : PopupContact._animSpeed;
            cc.loader.loadRes("prefabs/PopupContact", cc.Prefab, function (error, prefab) {
        
                if (error) {
                    cc.error(error);
                    return;
                }
        
                var contact = cc.instantiate(prefab);
                PopupContact._contact = contact;
        
                // 动画 
                var cbFadeOut = cc.callFunc(self.onFadeOutFinish, self);
                var cbFadeIn = cc.callFunc(self.onFadeInFinish, self);
                self.actionFadeIn = cc.sequence(cc.spawn(cc.fadeTo(PopupContact._animSpeed, 255), cc.scaleTo(PopupContact._animSpeed, 1.0)), cbFadeIn);
                self.actionFadeOut = cc.sequence(cc.spawn(cc.fadeTo(PopupContact._animSpeed, 0), cc.scaleTo(PopupContact._animSpeed, 1.2)), cbFadeOut);
        
                
                PopupContact._input_name = cc.find("contactBackground/eb_name", PopupContact._contact).getComponent(cc.EditBox);
                PopupContact._input_phone = cc.find("contactBackground/eb_phone", PopupContact._contact).getComponent(cc.EditBox);
                PopupContact._input_address = cc.find("contactBackground/eb_address", PopupContact._contact).getComponent(cc.EditBox);
                PopupContact._enterButton = cc.find("contactBackground/enterButton", PopupContact._contact);
                
                // 添加点击事件
                PopupContact._enterButton.on('click', self.onButtonClicked, self);
    
                // 父视图
                PopupContact._contact.parent = cc.find("Canvas");
        
                // 展现 PopupContact
                self.startFadeIn();
        
                self.configPopupContact(enterCallBack,animSpeed);
                
            });
        
            // 参数
            self.configPopupContact = function (enterCallBack, animSpeed) {
        
                // 回调
                self._enterCallBack = enterCallBack;

            };
        
            // 执行弹进动画
            self.startFadeIn = function () {
                cc.eventManager.pauseTarget(PopupContact._contact, true);
                PopupContact._contact.position = cc.p(0, 0);
                PopupContact._contact.setScale(1.2);
                PopupContact._contact.opacity = 0;
                PopupContact._contact.runAction(self.actionFadeIn);
            };
        
            // 执行弹出动画
            self.startFadeOut = function () {
                cc.eventManager.pauseTarget(PopupContact._contact, true);
                if(PopupContact._contact != null)
                {
                    PopupContact._contact.runAction(self.actionFadeOut);
                }
            
            };
        
            // 弹进动画完成回调
            self.onFadeInFinish = function () {
                cc.eventManager.resumeTarget(PopupContact._contact, true);
            };
        
            // 弹出动画完成回调
            self.onFadeOutFinish = function () {
                self.onDestory();
            };
        
            // 按钮点击事件
            self.onButtonClicked = function(event){
                if(event.target.name == "enterButton"){
                    console.log("确认按钮");
                    if(self._enterCallBack){
                    
                        self._enterCallBack(PopupContact._input_name.string,PopupContact._input_phone.string,PopupContact._input_address.string);
                        self.onDestory();
                    }
                }else{
                    console.log("取消按钮");
                    self.startFadeOut();
                }
               
            };
        
            // 销毁 PopupContact 
            self.onDestory = function () {
                PopupContact._contact.destroy();
                PopupContact._enterCallBack = null;
               
                PopupContact._contact = null;
                PopupContact._enterButton = null;
                PopupContact._input_name=null;
                PopupContact._input_phone=null;
                PopupContact._input_address=null;
                PopupContact._animSpeed = 0.3;


            };
        }


    },

    start () {

    },

   
});