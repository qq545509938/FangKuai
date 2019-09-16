import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;

@ccclass
class ButtonClose extends cc.Component {
    @property(cc.Node)
    closeNode: cc.Node = null;

    button;

    onEnable() {
        this.node.on("click", this.Close, this);
    }

    onDisable() {
        this.node.off("click", this.Close, this);
    }


    Close() {
        if (this.closeNode) {
            this.closeNode.active = false;
        }
    }
}