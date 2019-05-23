class Pc {
  /* 使用socketio作为握手通讯
  options {} =>
  wsUrl 握手地址，
  iceServer ICE服务，
  socketIo,
  * */
  constructor (optiions) {
    this.ws = optiions.socketIo.connect(options.wsUrl);
    this.iceServer = options.iceServer;
    this.pc = null;
    this.localStream = null;
    this.ringStateDes = ''; // ICE连接状态
    this.init();
  }
  // 创建Peer
  init () {
    let PeerConnection = (window.PeerConnection ||
        window.webkitPeerConnection00 ||
        window.webkitRTCPeerConnection ||
        window.mozRTCPeerConnection)
    this.pc = new PeerConnection(this.iceServer);
  }
  // 初始化Peer 加入媒体流，监听ICE状态
  initPeer (room) {
    this.createMedia();
    // 检测到远程流
    this.pc.ontrack = event => {
      console.log(event)
      const stream = event.streams[0];
      let video = document.getElementById('remoteVideo')
      if ('srcObject' in video) {
        video.srcObject = stream;
      } else {
        video.src = window.URL.createObjectURL(stream)
      }
    }
    // 监听A的ICE候选信息
    this.pc.onicecandidate = event => {
      console.log('1')
      if (event.candidate) {
        this.ws.emit('sendCandidate', {room: room, myId: this.myId, candidate: event.candidate})
      }
    };
    // 监听ICE连接状态
    this.pc.oniceconnectionstatechange = evt => {
      let _state = evt.target.iceConnectionState;
      if (_state === 'connected') {
        this.ringStateDes = '已连接';
      } else if (_state === 'disconnected') {
        this.ringStateDes = '断开连接';
      } else if (_state === 'failed') {
        this.ringStateDes = '连接失败';
      } else if (_state === 'closed') {
        this.ringStateDes = '连接关闭';
      }
    }
  }

  // 获取媒体流，加入peer
  createMedia () {
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }
    if (!navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia = function(prams) {
        let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, prams, resolve, reject);
        });
      };
    }
    navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream => {
      this.localStream = stream;
      // 添加到轨道
      stream.getTracks().forEach(track => this.pc.addTrack(track, stream));
    })
  }

}