import ccclass = cc._decorator.ccclass;

@ccclass
export default class AnimationDestroy extends cc.Component {

    onLoad() {
        let anim = this.getComponent(cc.Animation);
        anim.on("finished", this.Finished, this);
    }

    Finished() {
        this.node.destroy();
    }
}