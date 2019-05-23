<template>
  <div class="hello">
    <h1>web端--房间ID-- <span style="font-size: 16px">{{myId}}</span></h1>
    <video id="remoteVideo" autoplay="autoplay"></video>
    <input id="myInput" v-model="targetId" type="text">
    <button @click="sendInvite">拨号</button>
  </div>
</template>

<script>
  import {socketio} from '@/utils/util.js'
  export default {
    data () {
      return {
        ws: null,
        myNo: 111,
        targetId: '',
        myId: '',
        iceServer: {
          "iceServers": [{
            "url": "stun:stun.l.google.com:19302"
          }]
        },
        maxConnect: 5,
        localStream: null, // 本地流
        pc: null // peer实例。
      }
    },
    created () {
      this.init(); // 初始化连接websocket ,监听各个状态
    },
    mounted () {
    },
    methods: {
      init () {
        this.ws = socketio.connect('http://10.116.64.108:8383')
        this.ws.emit('firstConnect', this.myNo)
        this.ws.on('joinUs', (data) => {
          // 创建offer,发送给房间的远程端
          this.pc.createOffer().then(offer => {
            // 把本地offer发送给远程端
            this.ws.emit('sendOffer', {room: data.room, offer: offer})
            return this.pc.setLocalDescription(new RTCSessionDescription(offer))
          })
          console.log(this.pc)
        })
        this.ws.on('refuseUs', () => {
          console.log('拒绝加入，解散房间')
        })
        // 收到ICE onCandidate
        this.ws.on('onCandidate', (data) => {
          console.log(data)
          this.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        })
        this.ws.on('onAnswer', (data) => {
          this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          console.log(this.pc)
        })
        // 房间所有人测试
        this.ws.on('rooms', (data) => {
          console.log(data)
        })
        // 呼叫的人不在线
        this.ws.on('offline', () => {
          this.$message.info('您呼叫的用户不在线');
        })
      },
      sendInvite () {
        let room = (Math.random() + '').substring(2);
        this.ws.emit('sendInvite', {room: room, targetId: this.targetId})
        this.initPeer(room);
      },
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
      },
      initPeer (room) {
        let PeerConnection = (window.PeerConnection ||
            window.webkitPeerConnection00 ||
            window.webkitRTCPeerConnection ||
            window.mozRTCPeerConnection)
        this.pc = new PeerConnection(this.iceServer);
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
            this.ws.emit('sendCandidate', {room: room, candidate: event.candidate})
          }
        };

        // 监听ICE连接状态
        this.pc.oniceconnectionstatechange = evt => {
          let _state = evt.target.iceConnectionState;
          if (_state === 'new') {
            // 新建连接
            console.log('wr >>>>> 新建连接');
          } else if (_state === 'connecting') {
            // 连接中
            console.log('wr >>>>> 连接中');
          } else if (_state === 'connected') {
            // 已连接
            console.log('wr >>>>> 已连接');
          } else if (_state === 'disconnected') {
            // 断开连接
            console.log('wr >>>>> 断开连接');
          } else if (_state === 'failed') {
            // 连接失败
            console.log('wr >>>>> 连接失败');
          } else if (_state === 'closed') {
            // 连接关闭
            console.log('wr >>>>> 连接关闭');
          }
        }
      }
    },
    watch: {}
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h3 {
    margin: 40px 0 0;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: #42b983;
  }
</style>
