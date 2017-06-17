
window.onload = function() {
    var miniontalk = new MinionTalk();
    miniontalk.init();
};
var MinionTalk = function() {
    this.socket = null;
};
MinionTalk.prototype = {
    init: function() {
        
        var that = this;
        
        this.socket = io.connect();
        
        this.socket.on('connect', function() {
            document.getElementById('info').textContent = '사용할 닉네임은?';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
        
        this.socket.on('nickExisted', function() {
            document.getElementById('info').textContent = '이미 사용중인 닉네임입니다.';
        });
        
        this.socket.on('loginSuccess', function() {
            document.title = 'MinionTalk | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';
            document.getElementById('messageInput').focus();
        });
        
        this.socket.on('error', function(err) {
            if (document.getElementById('loginWrapper').style.display == 'none') {
                document.getElementById('status').textContent = '연결 실패!';
            } else {
                document.getElementById('info').textContent = '연결 실패!';
            }
        });
        
        this.socket.on('system', function(nickName, userCount, type) {
            var msg = nickName + (type == 'login' ? ' joined' : ' left');
         
            
            that._displayNewMsg('system', msg, 'red');
        
            
            document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online'; 
        
            
        });
        
        
        
        this.socket.on('roomJoin', function(nickName, userCount, roomName) {
            

            document.getElementById('historyMsg').innerHTML = '';
            
            var msg = "'"+nickName + "'님이" +" 방'" +roomName + "'에 입장하셨습니다.";
         
            
            that._displayNewMsg('system', msg, '#FF904C');
        
            
            document.getElementById('status2').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' in room'; 
        
            
        });
        
        this.socket.on('roomLeave', function(nickName, userCount, roomName) {
            

            
            
            var msg = "'"+nickName + "'님이" +" 방'" +roomName + "'에서 나갔습니다.";
         
            
            that._displayNewMsg('system', msg, '#FF904C');
        
            
            document.getElementById('status2').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' in room'; 
        
            
        });

        
        
                
        this.socket.on('roomList', function(roomlist) {
            
            var container = document.getElementById('roomList'),
                userToDisplay = document.createElement('p');
            
            userToDisplay.innerHTML = '';
            for(var i = 0; i < roomlist.length; i++){
                  
                userToDisplay.innerHTML = roomlist[i];
                

                
            }
            
            container.appendChild(userToDisplay);
            userToDisplay.style.color = '#EC53AB';
        });
        
        
        this.socket.on('userList', function(data, type) {
            
            var container = document.getElementById('userList'),
                userToDisplay = document.createElement('p');
            
            
            for(var i = 0; i < data.length; i++){
                  
                userToDisplay.innerHTML = data[i];
                
                
                if(type == 'logout')
                    document.getElementById('userlist').innerHTML = '';
                
            }
            
            container.appendChild(userToDisplay);
            userToDisplay.style.color = '#FD44FF';
        });
        
        

        
        
        
        
        this.socket.on('roomUser', function(data, usercount, type) {
            
            var container = document.getElementById('userlist'),
                userToDisplay = document.createElement('p');
            
            
            for(var i = 0; i < usercount; i++){
                  
                userToDisplay.innerHTML = data[i];
                
                if(type == 'leave')
                    document.getElementById('userlist').innerHTML = '';  

                
            }
            
            container.appendChild(userToDisplay);
            userToDisplay.style.color = '#FD44FF';
        });        
        
        
        
        
        
        this.socket.on('newMsg', function(user, msg, color) {
            that._displayNewMsg(user, msg, color);
        });
        
        this.socket.on('newImg', function(user, img, color) {
            that._displayImage(user, img, color);
        });
        
        this.socket.on('notification',function(user,config){
            that._consoleText(user,config);
        });
        
        
        
 


        
        
        
        
        
        
        
        document.getElementById('loginBtn').addEventListener('click', function() {
            var nickName = document.getElementById('nicknameInput').value;
            if (nickName.trim().length != 0) {
                that.socket.emit('login', nickName);
            } else {
                document.getElementById('nicknameInput').focus();
            };
        }, false);
        
        
        
        document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                };
            };
        }, false);
        
        
        
        document.getElementById('sendBtn').addEventListener('click', function() {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('me', msg, color);
                return;
            };
        }, false);
        
        
        
        document.getElementById('messageInput').addEventListener('keyup', function(e) {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('me', msg, color);
            };
        }, false);
        
        
        
        
        document.getElementById('clearBtn').addEventListener('click', function() {
            document.getElementById('historyMsg').innerHTML = '';
        }, false);
        
        
        
        
        
        document.getElementById('sendImage').addEventListener('change', function() {
            if (this.files.length != 0) {
                var file = this.files[0],
                    reader = new FileReader(),
                    color = document.getElementById('colorStyle').value;
                if (!reader) {
                    that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
                    this.value = '';
                    return;
                };
                reader.onload = function(e) {
                    this.value = '';
                    that.socket.emit('img', e.target.result, color);
                    that._displayImage('me', e.target.result, color);
                };
                reader.readAsDataURL(file);
            };
        }, false);
        
        
        
        
        
        document.getElementById('notifBtn').addEventListener('click',function(){
          var config = {
                          body: '알림이 있습니다.', //텍스트 내용
                          dir: 'auto',//텍스트 표시 방향 auto ,ltr,rtl
                          lang:'en', //텍스트 언어
                          icon: 'https://image.fmkorea.com/files/attach/new/20161119/486616/12953651/513214366/8be528623a7c40d4cbfe53fb23d48ce6.JPG' 
                                //URL의 사진은, 통지에 아이콘을 표시하는 데 사용됩니다
                      };
          that.socket.emit('noti',config);
          return;
        }, false);

        
        
        
        document.getElementById('btnRoomcrt').addEventListener('click', function() {
            var roomName = document.getElementById('crtRoom').value;
            if (roomName.trim().length != 0) {
                that.socket.emit('createroom', roomName);
                
            };
        }, false);
        
        document.getElementById('btnRoomEnt').addEventListener('click', function() {
            var roomName = document.getElementById('inpRoomName').value;
            if (roomName.trim().length != 0) {
                that.socket.emit('joinroom', roomName);
                
            };
        }, false);
        
        document.getElementById('btnRoomExit').addEventListener('click', function() {

            var roomName = document.getElementById('inpRoomName').value;
            if (roomName.trim().length != 0) {
                that.socket.emit('leaveroom', roomName);
               
                
                document.getElementById('historyMsg').innerHTML = '';
                document.getElementById('userlist').innerHTML = '';
                document.getElementById('status2').innerHTML = '';
                
                
            };

            
        }, false);    
        
        
        
        
        
        
        
        

        
        
        
        
        
        
        
        
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        
        document.body.addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            };
        });
        
        
        document.getElementById('emojiWrapper').addEventListener('click', function(e) {
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            };
        }, false);
    },
    
    
    
    
    _initialEmoji: function() {
        var emojiContainer = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for (var i = 69; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    },
    
    
    
    
    _displayNewMsg: function(user, msg, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8),
            //determine whether the msg contains emoji
            msg = this._showEmoji(msg);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    
    

    


    
    
    
    
    _displayImage: function(user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    
    
    _showEmoji: function(msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');//todo:fix this in chrome it will cause a new request for the image
            };
        };
        return result;
    },
        _consoleText: function(user,config){
      if(window.Notification){
              if(Notification.permission === 'granted'){
                  var notification = new Notification(user,config);
                  delete notification;
              }else{
                  Notification.requestPermission();
              }
          }
    }
    
 
    
    
    
    
    
    
    
};
