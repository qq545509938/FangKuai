import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import FightManager = require("../Mananger/FightManager");

@ccclass
export default class Setting extends cc.Component {

    @property(cc.Slider)
    sliderSound: cc.Slider = null;
    @property(cc.ProgressBar)
    progressSound: cc.ProgressBar = null;

    @property(cc.Slider)
    sliderMusic: cc.Slider = null;
    @property(cc.ProgressBar)
    progressMusic: cc.ProgressBar = null;

    start() {
        let soundValue = parseFloat(cc.sys.localStorage.getItem("soundValue") || 1);
        this.sliderSound.progress = soundValue;
        this.progressSound.progress = soundValue;
        let event = new cc.Button.EventHandler();
        event.target = this.node;
        event.component = "Setting";
        event.handler = "onSliderSound";
        this.sliderSound.slideEvents.push(event);

        let musicValue = parseFloat(cc.sys.localStorage.getItem("musicValue") || 1);
        this.sliderMusic.progress = musicValue;
        this.progressMusic.progress = musicValue;
        event = new cc.Button.EventHandler();
        event.target = this.node;
        event.component = "Setting";
        event.handler = "onSliderMusic";
        this.sliderMusic.slideEvents.push(event);
    }

    onSliderSound() {
        this.progressSound.progress = this.sliderSound.progress;
        cc.sys.localStorage.setItem("soundValue", this.sliderSound.progress.toString());
    }

    onSliderMusic() {
        this.progressMusic.progress = this.sliderMusic.progress;
        cc.sys.localStorage.setItem("musicValue", this.sliderMusic.progress.toString());
        let audioID = FightManager.getInstance().musicAudioID;
        cc.audioEngine.setVolume(audioID, this.sliderMusic.progress);
    }
}