var GAME_STATE = cc.Enum({
    NONE:99,
    HOME:0,
    MATCHING:1,
    CHESS:2,
    EXCERCISES:3,
    WATCHING:4,
    WAITING_OPPONENT:5,//等待对手
    END:6,//游戏结束,
    CHIKEN_MATCHING:7,
    CHIKEN_ANSWERING:8,
    CHIKEN_GET_RESULT:9,
    CHIKEN_READY:10,
});
var GameConst ={
    INTERVAL_MATCHING:0.5,//匹配轮询间隔
    INTERVAL_CHECKNEXTROUND:0.5,
    INTERVAL_CHECKCHESS_STATE:0.5,
    INTERVAL_ROUND_BETWEEN_ROUND:3,//每轮间隔
    DELAY_GAME_START:0.2,//请求棋盘信息延时秒数
    DELAY_SHOW_EXCERCISES:.2,//显示题目延时秒数
    DELAY_SHOW_EXCERCISES_WATCHER:1,//显示题目延时秒数
    DELAY_SHOW_GAME_RESULT:2,
    ANSWER_TIME:20,//答题时间
    GRAB_WAIT_time:3,//抢答等待时间
    GRAB_AUTO_time:3,//自动抢答时间,
    SELF_TEST_ROUND:10,//自测总轮数

    INTERVAL_CHICKEN_SITUATION:1,//吃鸡检查当前其他玩家选项
    INTERVAL_CHICKEN_GET_RESULT:.5,
    INTERVAL_CHICKEN_ANSWER_TIME: 10, //吃鸡答题时间
};
var GameMode={
    CHESS:0,//九宫格模式
    CHIKEN_DINNER:1,//吃机模式
}
module.exports = {
    GAME_STATE: GAME_STATE,
    GameConst:GameConst,
    GameMode:GameMode
};