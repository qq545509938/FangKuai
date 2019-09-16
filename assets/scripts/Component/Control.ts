// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {ItemState} from "../Enum";
import Item from "./Item";

const {ccclass, property} = cc._decorator;


@ccclass
export default class Control extends Item {

    @property(cc.Node)
    left: cc.Node = null;
    @property(cc.Node)
    right: cc.Node = null;

    initState: ItemState;

    leftState: ItemState;
    rightState: ItemState;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    setInitType(state: ItemState) {
        this.initState = state;
        this.leftState = state;
        this.rightState = state;
        switch (state) {
            case ItemState.Open:
                this.left.x = -(this.left.width + this.left.width * 0.5);
                this.right.x = this.left.width + this.left.width * 0.5;
                break;
            case ItemState.Close:
                this.left.x = -this.left.width * 0.5;
                this.right.x = this.left.width * 0.5;
                break;
        }
    }

    // update (dt) {}
}
