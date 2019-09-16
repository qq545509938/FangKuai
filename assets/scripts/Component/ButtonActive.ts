import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;

@ccclass
class ButtonActive extends cc.Component {
    @property(cc.Node)
    activeNode: cc.Node = null;

    button;

    onEnable() {
        this.node.on("click", this.Active, this);
    }

    onDisable() {
        this.node.off("click", this.Active, this);
    }


    Active() {
        if (this.activeNode) {
            this.activeNode.active = true;
        }
    }
}