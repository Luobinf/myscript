//注意：不要去用css去控制canvas元素的宽高，如果用css控制得到的是等比的宽高。
//直接写在canvas元素里面就可以了。
// let canvas = document.querySelector('canvas')
// //获取绘画元素的平面(2d)上下文
// let context = canvas.getContext('2d')
// // context.fillStyle = 'orange'
// // context.fillRect(0,0,150,150)


let canvas = document.querySelector('canvas')
let context = canvas.getContext('2d')
let lineWidth = 2   //线的宽度默认是5

getClient()
window.onresize = function (event) {
    getClient()
}

let using = false    //使用标志用于判断是否在画线或者使用橡皮擦
let lastPoint = {
    'x': undefined,
    'y': undefined
}


//特性检测:检测元素里面有没有这个属性,因为元素也是一个对象.若元素有这个属性的话,那么就为null(初始化为null)
//没有这个属性的话就为undefined.
if (canvas.ontouchstart !== undefined) {
    //是触屏设备
    canvas.ontouchstart = function (event) {

        let xPosition = event.touches[0].clientX
        let yPosition = event.touches[0].clientY

        if (eraserEnabled) {
            using = true
            context.clearRect(xPosition - 5, yPosition - 5, 10, 10)
        } else if (eraserEnabled === false) {
            using = true
            lastPoint.x = xPosition
            lastPoint.y = yPosition
        }
    }

    canvas.ontouchmove = function (event) {

        let xPosition = event.touches[0].clientX
        let yPosition = event.touches[0].clientY

        if (!using) { return }

        if (eraserEnabled) {
            context.clearRect(xPosition - 5, yPosition - 5, 10, 10)
        } else if (eraserEnabled === false) {
            let newPoint = {
                'x': undefined,
                'y': undefined
            }
            newPoint.x = xPosition
            newPoint.y = yPosition
            drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
            lastPoint = newPoint
        }

    }

    canvas.ontouchend = function (event) {

        using = false
    }

} else {

    //非触摸屏设备
    canvas.onmousedown = function (event) {
        let xPosition = event.clientX
        let yPosition = event.clientY

        if (eraserEnabled === true) {
            using = true
            context.clearRect(xPosition - 5, yPosition - 5, 10, 10)
        } else if (eraserEnabled === false) {
            using = true
            lastPoint.x = xPosition
            lastPoint.y = yPosition
        }
    }


    canvas.onmousemove = function (event) {
        let xPosition = event.clientX
        let yPosition = event.clientY

        if (!using) { return }

        if (eraserEnabled) {
            context.clearRect(xPosition - 5, yPosition - 5, 10, 10)
        } else if (eraserEnabled === false) {
            let newPoint = {
                'x': undefined,
                'y': undefined
            }
            newPoint.x = xPosition
            newPoint.y = yPosition
            drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y, lineWidth)
            lastPoint = newPoint
        }
    }

    canvas.onmouseup = function (event) {
        using = false
    }
}

// 判断是否使用橡皮檫或者铅笔
let eraserEnabled = false
eraser.onclick = function () {
    eraserEnabled = true
    this.classList.add('active')
    brush.classList.remove('active')
}
brush.onclick = function (event) {
    eraserEnabled  = false
    this.classList.add('active')
    eraser.classList.remove('active')

}
clearScreen.onclick = function () {
    context.clearRect(0, 0, canvas.width, canvas.height)
}
save.onclick = function () {
    let url = canvas.toDataURL()
    let a = document.createElement('a')
    document.body.append(a)
    a.href = url
    a.target = '_blank'
    a.download = 'test.png' //filename
    a.click()
}


red.onclick = function () {
    context.strokeStyle = 'red'
}
green.onclick = function () {
    context.strokeStyle = 'green'
}
blue.onclick = function () {
    context.strokeStyle = 'blue'
}

thin.onclick = function () {
    lineWidth = 2
}
thick.onclick = function () {
    lineWidth = 5
}


//画一条线 
function drawLine(x1, y1, x2, y2, lineWidth) {
    context.beginPath()
    context.moveTo(x1, y1)
    context.lineWidth = lineWidth   //线的宽度默认是5
    context.lineTo(x2, y2)
    context.stroke()
}

//获取html文档可视区的宽高
function getClient() {
    let pageWidth = document.documentElement.clientWidth
    let pageHeight = document.documentElement.clientHeight
    canvas.width = pageWidth
    canvas.height = pageHeight
}