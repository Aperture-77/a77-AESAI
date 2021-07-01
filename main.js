var Econsole = document.getElementById('consoleText')
var header = document.getElementById('consoleHeader')
var loader = document.getElementById('loader')
var validKeys = 'abcdefghijklmnopqrstuvwxyz0123456789,.\/\\ ~_"'.split('')+['backspace','enter']
var validIndex = 0
var typingPW = false
var onSubmit = function(){}
var helpRan = 0
var screenRestorePoint = ''
var currentPath = []

var userCanType = false
var realInput = ''

if (folderIndex == undefined)
  folderIndex = {'error.txt':'If you\'re seeing this text, that means that the directory tree failed to load. Try again later.'}

document.onwheel = function(e){window.scrollBy(0,Math.max(Math.min(e.deltaY,0.01),-0.01)*800);e.preventDefault()}

function genCode(id) {
  
}

function clearConsole() {
  validIndex = 0
  Econsole.innerText = ''
  realInput = ''
  userCanType = false
}

function prepCommand() {
  validIndex += 4
  if (validIndex > 4)
    addHTML('\n')
    //Econsole.insertAdjacentHTML('beforeend', '<br>>>>');
  addHTML('>>>')
  screenRestorePoint = Econsole.innerHTML
  //Econsole.innerText += '>>>'
}

function setHeaderVisible(x,ft) {
  if (ft) {
  consoleHeader.innerHTML = x
  consoleHeader.style.display = ''
  consoleHeader.nextElementSibling.style.display = ''
  }
  else {
    consoleHeader.style.display = 'none'
    consoleHeader.nextElementSibling.style.display = 'none'
  }
}

function showFooter() {
  pass
}

function setAllVisible(vl) {
  if (vl)
    Econsole.parentNode.style.display = ''
  else
    Econsole.parentNode.style.display = 'None'
}

function setLoader(vl) {
  if (!vl)
    loader.style.display = 'None'
  else
    loader.style.display = ''
}

function addHTML(txt) {
  //Econsole.insertAdjacentHTML('beforeend',txt)
  Econsole.innerText += txt
}

function awaitResponse(isPW,callback) {
  typingPW = isPW
  userCanType = true
  validIndex = Econsole.innerText.length-1
  realInput = ''
  onSubmit = function(){
    typingPW = false
    userCanType = false
    onSubmit = function(){}
    callback(realInput)
    validIndex = Econsole.innerText.length-1
  }
}

function filesAtFolder(dir) { //dir is list
  let cdir = folderIndex
  for (let x = 0; x < dir.length; x++) {
    if (Object.keys(cdir).includes(dir[x]) && !(typeof cdir[dir[x]] == 'string'))
      cdir = cdir[dir[x]]

    else {
      return;
    }
  }
  return cdir
}

document.onkeydown = function(e){
  
  function appendTxt(ltr) {
    realInput += ltr
    if (typingPW) {
      addHTML('*'.repeat(ltr.length))
    }
    else
      addHTML(ltr)
  }
  
  function delChar() {
    realInput = realInput.slice(0,realInput.length-1)
    let ec = Econsole.innerText
    Econsole.innerText = ec.slice(0,ec.length-1)
  }
  
  //console.log(e)
  if (!validKeys.includes(e.key.toLowerCase()))
    return;
  if (e.key == 'Backspace' && userCanType) {
    if (Econsole.innerText.length-1 > validIndex) {
      delChar()
    }
    e.preventDefault()
  }
  else if (e.key == 'Enter') {
    if (userCanType)
      Econsole.insertAdjacentHTML('beforeend','<br>')
    onSubmit()
  }
  else if (e.metaKey && userCanType) {
    if (e.key == 'v') {
      if (navigator.clipboard.readText == undefined) {
        alert('Reading clipboard data is disabled in your browser!')
        return
      }
      navigator.clipboard.readText().then(clipText=>{appendTxt(clipText)})
    }
    return;
  }
  else if (userCanType) {
    appendTxt(e.key)
    e.preventDefault()
  }
}

function slowType(txt,tme,callback,blockType) {
  validIndex += txt.length*blockType
  function typeLetter(txt,id,cb) {
    addHTML(txt.split('')[id])
    if (id < txt.length-1)
    setTimeout(function(){
      typeLetter(txt,id+1,cb)
    },tme)
    else
      cb()
  }
  typeLetter(txt,0,callback)
}

function login(callback) {
  slowType('USER: ',100,function(){
    awaitResponse(false,function(b){
      slowType('PASSWORD: ',50,function(){
        awaitResponse(true,function(c){
          callback(b,c)
        })
      },true)
    })
  },true)
}

function awaitCommand() {
  awaitResponse(false,function(x){
    let args = x.split(' ')
    let res
    function cb() {
      if (res != undefined && res != null)
        Econsole.innerText += res
      prepCommand()
      awaitCommand()
    }
    let cFolder = filesAtFolder(currentPath)
    if (Object.keys(commandIndex).includes(args[0])) {
      res = commandIndex[args[0]].action(args,cb)
      if (res != undefined)
        cb()
    }
    else if (Object.keys(cFolder).includes(args[0])) {
      clearConsole()
      addHTML('Reading '+(currentPath.join('/'))+'/'+args[0])
      Econsole.innerHTML += '<br>-----------------------<br>'
      addHTML(cFolder[args[0]])
      onSubmit = function(){
        Econsole.innerHTML = screenRestorePoint
        //clearConsole()
        prepCommand()
        awaitCommand()
      }
    }
    else {
      addHTML('Command invalid!')
      prepCommand()
      awaitCommand()
    }
  })
}

function initiateLogin() {
  login(function(x,y){
    if (x == 'admin' && y == 'test') {
      clearConsole()
      setHeaderVisible('',false)
      consoleHeader.innerHTML = " "
      setAllVisible(false)
      setTimeout(function(){
        setAllVisible(true)
        /*let possibleHeaders = {
          "ALERT: RESERVE POWER DRAINAGE LEVEL ABNORMAL. RESERVE POWER AT 18% CAPACITY [<p class='blinker'>▓▓▓▓</p>        ]"
          "ALERT: <p class='blinker'>REACTOR MELTDOWN IMMINENT</p>"
        }*/
        setHeaderVisible("ALERT: RESERVE POWER DRAINAGE LEVEL ABNORMAL. RESERVE POWER AT 18% CAPACITY [<p class='blinker'>██</p><p class='inverted'>██████████</p>]",true)
      },1000)
      prepCommand()
      awaitCommand()
    }
    else {
      addHTML('Login invalid!')
      onSubmit = function() {
        clearConsole()
        initiateLogin()
      }
    }
  })
}

setAllVisible(false)
setLoader(false)
setTimeout(()=>{
  setTimeout(()=>{
    consoleHeader.innerHTML = "APERTURE INNOVATORS A.E.S.A.I. COPYRIGHT 1981"
    //Aperture External Server Access Interface
    setAllVisible(true)
    setLoader(false)
    initiateLogin()
  },1000)
  setLoader(true)
},1000)


var commandIndex = {
  //string commands
  'help':{
    'action':function(args,cback){
      if (args.length == 1)
        slowType(`
--- HELP ---

help: show this message
dir [path optional]: show all files in the current directory
cd <path>: move to a specified directory
<path>: open the file specified
`   ,5,function(){cback()},true)
    else {
      return 'ERR: Expected 0 arguments, given 1.'
    }
    },
    'errCode':0
  },
  'cd':{
    'action':function(args,cback){
      if (args.length > 1) {
        //return 'ERR: Not implemented ya twat.'
        if (args[1] == '/') {
          currentPath = []
          return '';
        }
        let asplit
        if (!args[1].startsWith('/'))
          asplit = currentPath.concat(args[1].split('/'))
        else
          asplit = args[1].endsWith('/') ? args[1].slice(1,-1).split('/') : args[1].slice(1).split('/')
        //console.log(asplit)
        let cfol = folderIndex
        if (filesAtFolder(asplit) == undefined)
          return 'ERR: Invalid directory!'
        currentPath = asplit
        return '';
        //goToLocation(args[0])
      }
      else {
        return 'ERR: No directory provided!'
      }
    }
  },
  'dir': {
    'action':function(args,cback) {
      let cfol = folderIndex
      for (let x = 0; x < currentPath.length; x++) {
        cfol = cfol[currentPath[x]]
      }
      return '| '+Object.keys(cfol).join('\n| ')
    }
  }
}
