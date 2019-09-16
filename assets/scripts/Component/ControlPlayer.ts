import ccclass = cc._decorator.ccclass;
import Control from "./Control";
import {ItemState} from "../Enum";
import FightManager = require("../Mananger/FightManager");

@ccclass
export default class ControlPlayer extends Control {

    onEnable() {
        this.node.on("touchstart", this.onTouchStart, this);
        this.node.on("touchend", this.onTouchEnd, this);
        this.node.on("touchcancel", this.onTouchEnd, this);
    }

    onDisable() {
        this.node.off("touchstart", this.onTouchStart, this);
        this.node.off("touchend", this.onTouchEnd, this);
        this.node.off("touchcancel", this.onTouchEnd, this);
    }

    toggleLeftState(time, speed) {
        let destX = 0;
        switch (this.leftState) {
            case ItemState.Open:
            case ItemState.ChangeToOpen:
                this.leftState = ItemState.ChangeToClose;
                destX = -this.left.width * 0.5;//闭合目标位置
                break;
            case ItemState.Close:
            case ItemState.ChangeToClose:
                this.leftState = ItemState.ChangeToOpen;
                destX = -(this.left.width + this.left.width * 0.5);//开启目标位置
                break;
            default:
                this.leftState = ItemState.ChangeToOpen;
                destX = -(this.left.width + this.left.width * 0.5);
                break;
        }
        this.left.stopAllActions();
        let timeLeft = Math.abs(destX - this.left.x) / this.left.width * time;
        this.left.runAction(cc.sequence(cc.moveTo(timeLeft / speed, destX, 0), cc.callFunc(() => {
            if (this.leftState == ItemState.ChangeToClose) {
                this.leftState = ItemState.Close;
            } else if (this.leftState == ItemState.ChangeToOpen) {
                this.leftState = ItemState.Open;
            }
        })));
    }

    toggleRightState(time, speed) {
        let destX = 0;
        switch (this.rightState) {
            case ItemState.Open:
            case ItemState.ChangeToOpen:
                this.rightState = ItemState.ChangeToClose;
                destX = this.right.width * 0.5;
                break;
            case ItemState.Close:
            case ItemState.ChangeToClose:
                this.rightState = ItemState.ChangeToOpen;
                destX = this.right.width + this.right.width * 0.5;
                break;
            default:
                this.rightState = ItemState.ChangeToOpen;
                destX = this.right.width + this.right.width * 0.5;
                break;
        }
        this.right.stopAllActions();
        let timeRight = Math.abs(destX - this.right.x) / this.right.width * time;
        this.right.runAction(cc.sequence(cc.moveTo(timeRight / speed, destX, 0), cc.callFunc(() => {
            if (this.rightState == ItemState.ChangeToClose) {
                this.rightState = ItemState.Close;
            } else if (this.rightState == ItemState.ChangeToOpen) {
                this.rightState = ItemState.Open;
            }
        })));
    }


    onTouchStart() {
        let fightMgr = FightManager.getInstance();
        this.toggleLeftState(fightMgr.changeTime, fightMgr.timeSpeed);
        this.toggleRightState(fightMgr.changeTime, fightMgr.timeSpeed);
    }

    onTouchEnd() {
        let fightMgr = FightManager.getInstance();
        this.toggleLeftState(fightMgr.changeTime, fightMgr.timeSpeed);
        this.toggleRightState(fightMgr.changeTime, fightMgr.timeSpeed);
    }

    onCollisionEnter(other, self) {
        let fightMgr = FightManager.getInstance();
        let item = other.getComponent(Control);
        if (fightMgr.invincibleTime <= 0 && !this.success(item)) {
            cc.error("撞到了");
            fightMgr.gameEnd();
        }
    }

    onCollisionStay(other, self) {
        let fightMgr = FightManager.getInstance();
        let item = other.getComponent(Control);
        if (fightMgr.invincibleTime <= 0 && !this.success(item)) {
            fightMgr.gameEnd();
        }
    }

    onCollisionExit(other, self) {
        let fightMgr = FightManager.getInstance();
        let item = other.getComponent(Control);
        if (fightMgr.invincibleTime > 0 || this.success(item)) {
            cc.error("得分");
            fightMgr.addScore();
        } else {
            fightMgr.gameEnd();
        }
    }

    success(item: Control) {
        let leftCheck = (item.leftState == ItemState.Open && this.leftState == ItemState.Close)
            || (item.leftState == ItemState.Close && this.leftState == ItemState.Open);

        let rightCheck = (item.rightState == ItemState.Open && this.rightState == ItemState.Close)
            || (item.rightState == ItemState.Close && this.rightState == ItemState.Open);

        return leftCheck && rightCheck;
    }
}