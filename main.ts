bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    受信文字 = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
})
function コマンド解析 () {
    コマンド = 受信文字.charAt(0)
}
function コマンド処理 () {
    if (コマンド == "s") {
        datetime = split.splitNum(受信文字.substr(1, 100))
        rtc.setClockArray(datetime)
    } else if (コマンド == "a") {
        music.playTone(523, music.beat(BeatFraction.Half))
        music.playTone(392, music.beat(BeatFraction.Whole))
    } else if (コマンド == "v") {
        pins.digitalWritePin(DigitalPin.P1, 1)
        basic.pause(200)
        pins.digitalWritePin(DigitalPin.P1, 0)
    }
    受信文字 = ""
}
function 表示方向 () {
    if (input.rotation(Rotation.Pitch) <= -40) {
        watchfont.setRotatation(rotate.under)
    } else {
        watchfont.setRotatation(rotate.top)
    }
    if (input.rotation(Rotation.Roll) < -75) {
        watchfont.setRotatation(rotate.right)
    } else if (input.rotation(Rotation.Roll) > 75) {
        watchfont.setRotatation(rotate.left)
    }
}
function 秒表示 () {
    表示方向()
    watchfont.showNumber2(datetime[rtc.getClockData(clockData.second)])
}
function 時刻合わせ () {
	
}
function 時刻表示 () {
    表示方向()
    watchfont.showSorobanNumber(datetime[rtc.getClockData(clockData.hour)], 0, 2)
    watchfont.showSorobanNumber(datetime[rtc.getClockData(clockData.minute)], 3, 2)
    秒 = datetime[rtc.getClockData(clockData.second)]
    if (秒 != 直前秒) {
        if (秒 < 10) {
            watchfont.plot(2, 1)
            watchfont.plot(2, 3)
        } else {
            watchfont.plot(2, 5 - Math.trunc(秒 / 10))
        }
        秒カウント = 0
    }
    if (秒カウント >= 3) {
        for (let カウンター = 0; カウンター <= 4; カウンター++) {
            watchfont.unplot(2, カウンター)
        }
    }
    直前秒 = 秒
    秒カウント += 1
}
function 日付表示 () {
    basic.clearScreen()
    if (音声有効 == 0) {
        atp3012.write("tada'ima <NUMK VAL=" + datetime[rtc.getClockData(clockData.hour)] + " COUNTER=ji>" + " <NUMK VAL=" + datetime[rtc.getClockData(clockData.minute)] + " COUNTER=funn>desu.")
    }
    basic.showString("" + datetime[rtc.getClockData(clockData.hour)] + ":" + datetime[rtc.getClockData(clockData.minute)])
    if (input.buttonIsPressed(Button.A)) {
        basic.clearScreen()
        basic.showString("" + datetime[rtc.getClockData(clockData.month)] + "/" + datetime[rtc.getClockData(clockData.day)])
    }
    basic.pause(1000)
}
let 秒カウント = 0
let 直前秒 = 0
let 秒 = 0
let datetime: number[] = []
let 受信文字 = ""
let 音声有効 = 0
let コマンド = ""
let 長押し時間 = 10
let 消灯時間 = 600
let 無操作時間 = 0
コマンド = ""
let 時計有効 = rtc.getDevice()
if (時計有効 == rtc.getClockDevice(rtcType.NON)) {
    basic.showIcon(IconNames.Sad)
    basic.pause(2000)
}
音声有効 = rtc.testReadI2c(46)
if (音声有効 == 0) {
    led.plotBrightness(0, 0, 20)
    basic.pause(500)
}
bluetooth.startUartService()
pins.digitalWritePin(DigitalPin.P2, 0)
basic.forever(function () {
    basic.pause(100)
    if (受信文字 != "") {
        コマンド解析()
        コマンド処理()
    }
    datetime = rtc.getClock()
    if (datetime[rtc.getClockData(clockData.minute)] == 0 && datetime[rtc.getClockData(clockData.second)] == 0) {
        pins.digitalWritePin(DigitalPin.P1, 1)
        basic.pause(200)
        pins.digitalWritePin(DigitalPin.P1, 0)
        basic.pause(800)
    }
    if (input.isGesture(Gesture.Shake)) {
        無操作時間 = 0
    }
    if (input.buttonIsPressed(Button.A) && !(input.buttonIsPressed(Button.B))) {
        日付表示()
        無操作時間 = 0
    } else if (input.buttonIsPressed(Button.B) && !(input.buttonIsPressed(Button.A))) {
        秒表示()
        無操作時間 = 0
    } else if (無操作時間 <= 消灯時間) {
        時刻表示()
        無操作時間 += 1
    } else {
        basic.clearScreen()
    }
})
