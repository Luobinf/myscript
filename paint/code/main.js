let thicknessWrapper = document.getElementsByClassName('thickness-wrapper')[0]
let thicknessSettingWrapper = document.getElementsByClassName('thickness-setting-wrapper')[0]
let closeDown = document.getElementById('closeDown')
let line = thicknessSettingWrapper.getElementsByClassName('line')[0]
let circle = document.getElementById('circle')  //获取颜色左边的小圆点
let firstLine = document.getElementsByClassName('line')[0]
let save = document.querySelector('.save-wrapper')
let clearWrapper = document.querySelector('#clear-wrapper')
let backWrapper = document.querySelector('#back-wrapper')
let forwardWrapper = document.querySelector('#forward-wrapper')
let canvas = document.querySelector('#canvas')
let context = canvas.getContext('2d')  //默认值
context.width = 2
context.strokeStyle = 'black'

//设置画布大小并且改变窗口大小时能够保存之前的内容
setCanvasSize()
window.onresize = function () {
    setCanvasSize()
}


let using = false    //设置是否再绘画或者使用橡皮的标志
let lastPosition = {
    x: undefined,
    y: undefined
}
canvas.addEventListener('mousedown', function (event) {


    let positionX = event.clientX - this.offsetLeft
    let positionY = event.clientY - this.offsetTop

    if (penUsing) {
        using = true
        lastPosition['x'] = positionX
        lastPosition['y'] = positionY
    } else {
        using = true
        context.clearRect(positionX - 6, positionY - 6, 12, 12)
    }
})
//画笔粗细设置
canvas.addEventListener('mousemove', function (event) {
    let positionX = event.clientX
    let positionY = event.clientY - this.offsetTop

    if (!using) return

    if (penUsing) {
        drawLine(lastPosition['x'], lastPosition['y'], positionX, positionY, lastLineWidth, lastColor)
        //更新最新点的坐标
        lastPosition['x'] = positionX
        lastPosition['y'] = positionY
    } else {
        context.clearRect(positionX - 6, positionY - 6, 12, 12)
    }
})
//防止鼠标移动到canvas元素外面时再将鼠标抬起，然后再回到canvas元素里面还可以画图
canvas.addEventListener('mouseup', function (event) {
    using = false
    //当鼠标抬起的时候保存一次画布数据
    saveCanvasData()
})




//画笔和橡皮擦点击事件,默认是可以直接绘画的，故将penUsing设置为true。
let penUsing = true
pen.addEventListener('click', function () {
    firstLine.className = 'line first'
    penUsing = true
})

eraser.addEventListener('click', function () {
    firstLine.className = 'line last'
    penUsing = false
})



//获取修改设置画笔粗细的位置
//当文档出现滚动条时，以便在页面滚动时元素仍能保留在那里。因此文档相对坐标是从文档的左上角开始计算，而不是窗口。
thicknessWrapper.addEventListener('click', function () {
    let coords = this.getBoundingClientRect()
    thicknessSettingWrapper.classList.add('active')
    thicknessSettingWrapper.style.left = coords.left + window.pageXOffset + 'px'
    thicknessSettingWrapper.style.top = coords.top + window.pageYOffset - 3 + 'px'  //稍微往下了点，因此上移一点
})

//点击x按钮时关闭这个画笔选择框,需要停止冒泡，不然事件冒泡到父亲那里又会将active给加在class身上。
closeDown.addEventListener('click', function (event) {
    thicknessSettingWrapper.classList.remove('active')
    event.stopPropagation()
})

let lastLineWidth = 2
thicknessSettingWrapper.addEventListener('click', function (event) {
    let li = event.target.closest('li')

    if (li == null) { return }

    let liFirstEle = li.firstElementChild
    if (liFirstEle.classList.contains('one')) {
        settingPenThickness('line one')
        settingPen(2)
    } else if (liFirstEle.classList.contains('two')) {
        settingPenThickness('line two')
        settingPen(4)
    } else if (liFirstEle.classList.contains('three')) {
        settingPenThickness('line three')
        settingPen(6)
    } else if (liFirstEle.classList.contains('four')) {
        settingPenThickness('line four')
        settingPen(8)
    } else {
        settingPenThickness('line five')
        settingPen(10)
    }

    function settingPenThickness(className) {
        line.className = className
        circle.style.width = li.firstElementChild.offsetWidth + 'px'
        circle.style.height = li.firstElementChild.offsetHeight + 'px'
        circle.nextElementSibling.innerHTML = li.firstElementChild.nextElementSibling.innerHTML
    }
})

//清空画布
clearWrapper.addEventListener('click', function (event) {
    let clear = event.target.closest('button')
    if (clear != null) {
        this.style.backgroundColor = '#ececec'
        let coords = canvas.getBoundingClientRect()
        context.clearRect(0, 0, canvas.width, canvas.height)   //坐标是从canvas的左上角开始计算的
    }
})
//撤销
backWrapper.addEventListener('click', function (event) {
    let clear = event.target.closest('button')
    if (clear != null) {
        forwardWrapper.style.backgroundColor = '#1a9fff'
        canvasCancel()
    }
})
//反撤销
forwardWrapper.addEventListener('click', function (event) {
    let clear = event.target.closest('button')
    if (clear != null) {
        antiCanvasCancel()
    }
})
//保存
save.addEventListener('click', function (event) {
    let imgUrl,a
    let filename = prompt("请输入你想要保存的文件名: ")
    if (filename) {
        imgUrl = canvas.toDataURL('image/png')
        a = document.createElement('a')
        a.target = '_blank'
        a.href = imgUrl
        a.download = filename
        document.body.append(a)
        a.click() 
    }
})

//画笔颜色修改
let colors = document.querySelector('.colors')
let lastColor = 'black'
let lastActived

colors.addEventListener('click', settingPenColor)


//如何撤销和反撤销的思路：
//每在canvas画布上画一次就将信息保存下来，可以使用canvas的toDataURL()方法，生成的是base64的图片。
//自定义一个数组，将base64码放到数组中进行保存。当你需要撤销的时候将把数组的最后一个base码拿出来，再将它渲染到画布上。
//使用canvas的drawImage()方法可以进行。
let canvasDataHistory = []
let step = 0
let data = canvas.toDataURL()
canvasDataHistory.push(data)    //先进行canvas数据初始化

function saveCanvasData() {
    clearWrapper.style.backgroundColor = '#1a9fff'
    backWrapper.style.backgroundColor = '#1a9fff'
    clearWrapper.classList.remove('disabled')
    backWrapper.classList.remove('disabled')
    step++
    data = canvas.toDataURL()
    canvasDataHistory.push(data)
}

//撤销:之前绘画了几次就有几次操作
function canvasCancel() {
    forwardWrapper.classList.remove('disabled')
    clearWrapper.classList.remove('disabled')
    step--
     //设置新的值之前，需要先清空画布
     context.clearRect(0, 0, canvas.width, canvas.height)
     let img = new Image()
     img.onload = function () {
         context.drawImage(img, 0, 0, canvas.width, canvas.height)
     }
    if ( step < canvasDataHistory.length-1 && step > 0) {
        img.src = canvasDataHistory[step]
        // forwardWrapper.classList.remove('disabled')
    } else {
        step = 0
        img.src = canvasDataHistory[0]
        clearWrapper.style.backgroundColor = '#ececec'
        backWrapper.style.backgroundColor = '#ececec'
        backWrapper.classList.add('disabled')
    }
}
//反撤销
function antiCanvasCancel() {
    backWrapper.classList.remove('disabled')
    clearWrapper.classList.remove('disabled')
    clearWrapper.style.backgroundColor = '#1a9fff'
    backWrapper.style.backgroundColor = '#1a9fff'
    step++
    context.clearRect(0, 0, canvas.width, canvas.height)
    let img = new Image()
    img.onload = function () {
        context.drawImage(img, 0, 0)
    }
    if (step < canvasDataHistory.length - 1) {
        img.src = canvasDataHistory[step]
    } else {
        step = canvasDataHistory.length - 1
        img.src = canvasDataHistory[step]
        forwardWrapper.style.backgroundColor = '#ececec'
        forwardWrapper.classList.add('disabled')
    }
}


//绘制线段，不过不传入参数，线段宽度默认为2，线段颜色默认为黑色。
//默认宽度:lineWidth为2
function drawLine(x1, y1, x2, y2, lineWidth, lineColor) {
    context.beginPath()
    context.lineWidth = lineWidth
    context.lineCap = 'square'
    // context.lineJoin = 'round' 两条线段之间的连接点的形状
    context.strokeStyle = lineColor
    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
    context.stroke()
}

//设置画笔的宽度
function settingPen(lineWidth) {
    lastLineWidth = lineWidth
}

//设置画笔的颜色
function settingPenColor(event) {
    let target = event.target
    if (target.className === 'black') {
        lastActived ? lastActived.classList.remove('active') : ''
        lastActived = target.firstElementChild
        lastActived.classList.add('active')
        lastColor = 'black'
    } else if (target.className === 'gray') {
        lastActived ? lastActived.classList.remove('active') : ''
        lastActived = target.firstElementChild
        lastActived.classList.add('active')
        lastColor = 'gray'
    } else if (target.className === 'white1') {
        lastActived ? lastActived.classList.remove('active') : ''
        lastActived = target.firstElementChild
        lastActived.classList.add('active')
        lastColor = 'white'
    } else if (target.className === 'blue') {
        lastActived ? lastActived.classList.remove('active') : ''
        lastActived = target.firstElementChild
        lastActived.classList.add('active')
        lastColor = 'blue'
    } else if (target.className === 'red') {
        lastActived ? lastActived.classList.remove('active') : ''
        lastActived = target.firstElementChild
        lastActived.classList.add('active')
        lastColor = 'red'
    } else if (target.className === 'green') {
        lastActived ? lastActived.classList.remove('active') : ''
        lastActived = target.firstElementChild
        lastActived.classList.add('active')
        lastColor = 'green'
    } else if (target.className === 'orange') {
        lastActived ? lastActived.classList.remove('active') : ''
        lastActived = target.firstElementChild
        lastActived.classList.add('active')
        lastColor = 'orange'
    } else if (target.className === 'white2') {
        lastActived ? lastActived.classList.remove('active') : ''
        lastActived = target.firstElementChild
        lastActived.classList.add('active')
        lastColor = 'white'
    } else {
        return
    }
}


//设置画布大小
function setCanvasSize() {
    let myImageData = context.getImageData(0, 0, canvas.width, canvas.height)

    //document.documentElement.clientWidth为html宽度，也为viewport宽度，窗口宽度等于html元素宽度。
    let clientWidth = document.documentElement.clientWidth - canvas.offsetLeft
    let clientHeight = document.documentElement.clientHeight - canvas.offsetTop - 20
    canvas.width = clientWidth
    canvas.height = clientHeight
    //获取canvas画布的内容，将它保存起来，以免重新改变窗口时能够保存之前画布上的内容。
    context.putImageData(myImageData, 0, 0)
}