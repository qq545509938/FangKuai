import {GameState} from "../Enum";

class FightManager {
    get musicAudioID(): number {
        return this._musicAudioID;
    }
    set invincibleTime(value: number) {
        this._invincibleTime = value;
    }

    get invincibleTime(): number {
        return this._invincibleTime;
    }

    get interval(): number {
        return this._interval;
    }

    get difficulty(): number {
        return this._difficulty;
    }

    get createTimes(): number {
        return this._createTimes;
    }

    get deltaScore(): number {
        return this._deltaScore;
    }

    get itemMoveSpeed(): number {
        return this._itemMoveSpeed;
    }

    get time(): number {
        return this._time;
    }

    get timeSpeed(): number {
        return this._timeSpeed;
    }

    get gameState(): GameState {
        return this._gameState;
    }

    get changeTime(): number {
        return this._changeTime;
    }

    get controlPosY(): number {
        return this._controlPosY;
    }

    get score(): number {
        return this._score;
    }

    private static g_Instance: FightManager;

    static getInstance() {
        if (!this.g_Instance) {
            this.g_Instance = new FightManager();
        }
        return this.g_Instance;
    }

    private _controlPosY = 0.15;//玩家控制的两个物体水平高度
    private _changeTime = 0.08;//开闭过程时间
    private _itemMoveSpeed = 800;//下落速度
    private _deltaScore = 10;//单次通过加分
    private additionSpeed = 0.005;//每跳一次加速比例
    private maxTimeSpeed = 10;//最大速度
    private _difficulty = 6;//难度  数字越大难度越大
    private _interval: number = 1;//刷新间隔时间
	
    private _gameState: GameState = GameState.Init;//当前游戏状态

    private _score: number = 0;//当前游戏分数

    private _timeSpeed: number = 1;//当前加速

    private _time: number = 0;//当前刷新时间

    private _createTimes: number = 0;//已经刷新次数

    private _invincibleTime: number = 0;//无敌时间

    private callback = {};

    private _musicAudioID = 0;

    constructor() {
        this.gameInit();
        let musicValue = parseFloat(cc.sys.localStorage.getItem("musicValue") || 1);
        this._musicAudioID = cc.audioEngine.play(cc.url.raw("resources/BackGound.mp3"), true, musicValue);
    }

    gameInit() {
        this._gameState = GameState.Init;
        this._score = 0;
        this._timeSpeed = 1;
        this._time = 0;
        this._createTimes = 0;
        this._interval = 1;
    }

    gameStart() {
        this._gameState = GameState.Init;
        this._score = 0;
        this._timeSpeed = 1;
        this._time = 0;
        this._createTimes = 0;
        this._interval = 1;
        this._gameState = GameState.Playing;
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        if (this.callback.hasOwnProperty("begin")) {
            let info = this.callback["begin"];
            info.callback.call(info.target);
        }
    }

    gameEnd() {
        if (this._gameState == GameState.End) {
            return;
        }
        this._gameState = GameState.End;
        let bestScore = cc.sys.localStorage.getItem("score");
        if (!bestScore || this._score > parseInt(bestScore)) {
            cc.sys.localStorage.setItem("score", this._score.toString());
        }
        var manager = cc.director.getCollisionManager();
        manager.enabled = false;
        if (this.callback.hasOwnProperty("end")) {
            let info = this.callback["end"];
            info.callback.call(info.target);
        }
    }

    gameContinue() {
        this._gameState = GameState.Playing;
        this._invincibleTime = 5;
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        if (this.callback.hasOwnProperty("continue")) {
            let info = this.callback["continue"];
            info.callback.call(info.target);
        }
    }

    gameTick(dt) {
        this._time += this._timeSpeed * dt;
        this._invincibleTime -= dt;
        if (this._time >= this._interval) {
            ++this._createTimes;
            this._time -= this._interval;
            this._timeSpeed += this.additionSpeed;
            this._timeSpeed = Math.min(this.maxTimeSpeed, this._timeSpeed);//存在一个上限速度
            let start = 0.8;
            let end = 1;
            this._interval = Math.random() * (end - start) + start;
            return true;
        }
        return false;
    }

    //分数增加
    addScore() {
        this._score += this._deltaScore;
    }

    setBeginCallback(callback, target) {
        this.callback["begin"] = {callback: callback, target: target}
    }

    setEndCallback(callback, target) {
        this.callback["end"] = {callback: callback, target: target}
    }

    setContinueCallback(callback, target) {
        this.callback["continue"] = {callback: callback, target: target}
    }
}

export = FightManager;