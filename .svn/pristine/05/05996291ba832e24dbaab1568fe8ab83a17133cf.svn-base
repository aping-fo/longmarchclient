function SetLastSiblingIndex(node, parent){
    if(parent == null){
        parent = node.parent;
    }

    let lastIndex = 0;
    for(var i = 0; i < parent.children.length; i++){
        lastIndex = Math.max(lastIndex, parent.children[i].getSiblingIndex());
    }

    node.setSiblingIndex(lastIndex + 1);
}


function SetImageFromUrl(sprite, url, isRemote, callback) {
    if(sprite instanceof cc.Node){
        sprite = sprite.getComponent(cc.Sprite);
    }
    
    if (url == "") {
        sprite.spriteFrame = null;
        return;
    }

    if (isRemote == null) {
        isRemote = false;
    }

    if (isRemote) {
        url += "?aaa=aa.jpg";
        // console.log("load image" + url);
        cc.loader.load(url, function (err, tex) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            sprite.spriteFrame = new cc.SpriteFrame(tex);
            
            if(callback){
                callback();
            }
        });
    } else {
        cc.loader.loadRes(url, cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            sprite.spriteFrame = spriteFrame;

            if(callback){
                callback();
            }
        });
    }
}

module.exports = {
    SetLastSiblingIndex: SetLastSiblingIndex,
    SetImageFromUrl: SetImageFromUrl,
}