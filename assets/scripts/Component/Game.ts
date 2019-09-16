// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Control from "./Control";
import Item from "./Item";
import ControlPlayer from "./ControlPlayer";
import FightManager = require("../Mananger/FightManager");
import {GameState, ItemState} from "../Enum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends cc.Component {

    @property(cc.Node)
    mainRoot: cc.Node = null;

    @property(cc.Node)
    fightRoot: cc.Node = null;

    @property(cc.Node)
    endRoot: cc.Node = null;

    @property(cc.Prefab)
    prefabItem: cc.Prefab = null;

    @property(cc.Prefab)
    prefabPlayer: cc.Prefab = null;

    @property(cc.Prefab)
    prefabChange: cc.Prefab = null;

    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Prefab)
    dieEffect: cc.Prefab = null;

    @property(cc.Label)
    endScore: cc.Label = null;

    @property(cc.Label)
    bestScore: cc.Label = null;

    leftControl: ControlPlayer;
    rightControl: ControlPlayer;

    itemList: Item[];

    winSize: cc.Size;
    halfSize: number;

    onLoad() {
        window["main"] = this;
        this.destroyItem();
        this.fightRoot.active = false;//战斗节点隐藏
        this.endRoot.active = false;//结束界面隐藏
        let fightMgr = FightManager.getInstance();
        fightMgr.setBeginCallback(this.onStartGame, this);
        fightMgr.setEndCallback(this.onEndGame, this);
        fightMgr.setContinueCallback(this.onContinueGame, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.OnKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.OnKeyUp, this);
    }

    destroyItem() {
        if (this.leftControl) {
            this.leftControl.node.destroy();
        }
        this.leftControl = null;
        if (this.rightControl) {
            this.rightControl.node.destroy();
        }
        this.rightControl = null;
        if (this.itemList) {
            for (let i = 0; i < this.itemList.length; i++) {
                let item = this.itemList[i];
                item.node.destroy();
            }
        }
        this.itemList = [];
        if (this.scoreLabel) {
            this.scoreLabel.string = "0";
        }
    }

    onStartGame() {
        let fightMgr = FightManager.getInstance();
        this.winSize = cc.director.getWinSize();
        this.halfSize = this.winSize.width * 0.5;

        this.fightRoot.active = true;

        let leftNode = cc.instantiate(this.prefabPlayer);
        this.fightRoot.addChild(leftNode);
        leftNode.setPosition(-this.halfSize * 0.5, this.winSize.height * fightMgr.controlPosY);
        this.leftControl = leftNode.getComponent(ControlPlayer);
        this.leftControl.setInitType(Game.RandomType());

        let rightNode = cc.instantiate(this.prefabPlayer);
        this.fightRoot.addChild(rightNode);
        rightNode.setPosition(this.halfSize * 0.5, this.winSize.height * fightMgr.controlPosY);
        this.rightControl = rightNode.getComponent(ControlPlayer);
        this.rightControl.setInitType(Game.RandomType());

        this.itemList = [];
        if (this.scoreLabel) {
            this.scoreLabel.string = "0";
        }
    }

    onEndGame() {
        this.endScore.string = FightManager.getInstance().score;
        this.bestScore.string = cc.sys.localStorage.getItem("score");
        for (let i = 0; i < this.itemList.length; i++) {
            let item = this.itemList[i];
            if (this.dieEffect && item instanceof Control) {
                let control = item as Control;
                let effectLeft = cc.instantiate(this.dieEffect);
                control.node.parent.addChild(effectLeft);
                effectLeft.setPosition(control.node.getPosition().add(control.left.getPosition()));

                let effectRight = cc.instantiate(this.dieEffect);
                control.node.parent.addChild(effectRight);
                effectRight.setPosition(control.node.getPosition().add(control.right.getPosition()));
            }
            item.node.destroy();
        }
        this.itemList = [];
        this.scheduleOnce(()=>{
            let soundValue = parseFloat(cc.sys.localStorage.getItem("soundValue") || 1);
            cc.audioEngine.play(cc.url.raw("resources/Lose.mp3"), false, soundValue);
            //结算界面淡入
            this.endRoot.active = true;//结束界面隐藏
        }, 1.5);
    }

    onContinueGame() {

    }

    onClickStart() {
        if (this.prefabItem == null || this.prefabPlayer == null) {
            return;
        }
        let mainAnim = this.mainRoot.getComponent(cc.Animation);
        let fightMgr = FightManager.getInstance();
        mainAnim.once("finished", fightMgr.gameStart, fightMgr);
        mainAnim.play().wrapMode = cc.WrapMode.Normal;
    }

    //返回主界面   结束界面淡出,  战斗界面隐藏
    onClickReturn() {
        let fightMgr = FightManager.getInstance();
        fightMgr.gameInit();//游戏初始化
        this.fightRoot.active = false;//战斗节点隐藏
        this.destroyItem();//删除所有物体
        //主界面淡入
        let mainAnim = this.mainRoot.getComponent(cc.Animation);
        mainAnim.play().wrapMode = cc.WrapMode.Reverse;
        //结束界面淡出
        this.endRoot.active = false;//结束界面隐藏
    }

    //重新开始  淡出结算界面,开始游戏
    onClickRestart() {
        this.endRoot.active = false;//结束界面隐藏
        this.destroyItem();//删除所有物体
        //结算界面淡出
        FightManager.getInstance().gameStart();
    }

    //继续游戏 当初结算界面,
    onClickContinue() {
        //结算界面淡出
        this.endRoot.active = false;//结束界面隐藏
        FightManager.getInstance().gameContinue();
    }

    update(dt) {
        let fightMgr = FightManager.getInstance();
        if (this.scoreLabel) {
            this.scoreLabel.string = fightMgr.score;
        }
        if (fightMgr.gameState != GameState.Playing) {
            return;
        }
        let updateItem = this.itemList.slice();
        for (let i = 0; i < updateItem.length; i++) {
            let item = updateItem[i];
            let prePos = item.node.getPosition();
            if (prePos.y <= -item.node.height) {
                item.node.destroy();
                this.itemList.splice(this.itemList.indexOf(item), 1);
                continue;
            }
            item.node.setPosition(prePos.x, prePos.y - fightMgr.itemMoveSpeed * fightMgr.timeSpeed * dt);
        }

        if (fightMgr.gameTick(dt)) {
            if (Game.RandomCheck()) {
                let leftNewNode = cc.instantiate(this.prefabItem);
                leftNewNode.name = "leftNode" + fightMgr.createTimes;
                this.fightRoot.addChild(leftNewNode);
                leftNewNode.setSiblingIndex(0);
                leftNewNode.setPosition(-this.halfSize * 0.5, this.winSize.height + leftNewNode.height);
                let leftNewItem: Control = leftNewNode.getComponent(Control);
                leftNewItem.setInitType(Game.RandomType());
                this.itemList.push(leftNewItem);
            }

            if (Game.RandomCheck()) {
                let rightNewNode = cc.instantiate(this.prefabItem);
                rightNewNode.name = "rightNode" + fightMgr.createTimes;
                this.fightRoot.addChild(rightNewNode);
                rightNewNode.setSiblingIndex(0);
                rightNewNode.setPosition(this.halfSize * 0.5, this.winSize.height + rightNewNode.height);
                let rightNewItem: Control = rightNewNode.getComponent(Control);
                rightNewItem.setInitType(Game.RandomType());
                this.itemList.push(rightNewItem);
            }
        }
    }

    static RandomType() {
        let random = Math.floor(Math.random() * 2);
        return random == 0 ? ItemState.Open : ItemState.Close;
    }

    static RandomCheck() {
        let random = Math.floor(Math.random() * FightManager.getInstance().difficulty);
        return random != 0;
    }


    keyCodeList = [];

    private OnKeyDown(event) {
        let keyCode = event.keyCode;
        if (this.keyCodeList.indexOf(keyCode) >= 0) {
            return;
        }
        this.keyCodeList.push(keyCode);
        if (keyCode == 37) {//左
            if (this.leftControl) {
                this.leftControl.onTouchStart();
            }
        } else if (keyCode == 39) {//右
            if (this.rightControl) {
                this.rightControl.onTouchStart();
            }
        }
    }

    private OnKeyUp(event) {
        let keyCode = event.keyCode;
        let index = this.keyCodeList.indexOf(keyCode);
        if (index < 0) {
            return;
        }
        this.keyCodeList.splice(index, 1);
        if (keyCode == 37) {//左
            if (this.leftControl) {
                this.leftControl.onTouchEnd();
            }
        } else if (keyCode == 39) {//右
            if (this.rightControl) {
                this.rightControl.onTouchEnd();
            }
        }
    }
}