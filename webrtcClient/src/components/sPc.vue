<template>
  <div>
    <div class="vl_map_ring" v-for="item in callList" :key="item.id">
      <div class="top">
        <img src="../assets/logo.png" alt="">
        <div style="color: #ffffff;">
          <h4 style="font-size: 20px;">李德兵</h4>
          <p style="font-size: 12px;">{{curStatus}}...</p>
        </div>
      </div>
      <video id="remoteVideo" autoplay="autoplay"></video>
      <video style="width: 0; height: 0;" class="vl_map_sing" src="../assets/8521.mp3" autoplay></video>
      <div class="control" style="z-index: 99;position: absolute;bottom: 10px;left: 10px;">
        <el-button type="primary">切换</el-button>
        <el-button type="primary">取消</el-button>
        <el-button type="primary">静音</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  import {socketio} from '@/utils/util.js'
  export default {
    props: ['addCall', 'myNo'],
    data () {
      return {
        callList: [],
        ws: null,
        maxConnect: 5, // 最大连接数
        iceServer: {
          "iceServers": [{
            "url": "stun:stun.l.google.com:19302"
          }]
        },
        localStream: null, // 本地流
        curStatus: '等待对方接听',
        rooms: []
      }
    },
    watch: {
      addCall () {
        console.log('2')
        this.addConnect(this.addCall)
      }
    },
    created () {
      this.init(); // 初始化连接websocket ,监听各个状态
    },
    mounted () {
      // this.sendInvite();
    },
    methods: {
      addConnect (obj) {
        // 判断是否已经在发送通话列表中了
        if (this.callList.findIndex(x => x.remoteId === obj.remoteId) !== -1) {
          this.$message.error('这个号码已经在通话中了');
        } else {
          // 把peer实例放进新增加的call当中
          if (this.callList >= this.maxConnect) {
            this.$message.error('最多同时与' + this.maxConnect + '个人通话')
          } else {
            this.callList.push(obj);
            this.sendInvite(obj)
          }
        }
      },
      init () {
        this.ws = socketio.connect('http://10.116.64.108:8383')
        this.ws.emit('firstConnect', this.myNo)
        this.ws.on('joinUs', (data) => {
          // 创建offer,发送给房间的远程端
          let _pc = this.rooms.find(x => x.room === data.room)
          _pc.createOffer().then(offer => {
            // 把本地offer发送给远程端
            this.ws.emit('sendOffer', {room: data.room, offer: offer})
            return _pc.setLocalDescription(new RTCSessionDescription(offer))
          })
          console.log(_pc)
        })
        this.ws.on('refuseUs', () => {
          console.log('拒绝加入，解散房间')
        })
        // 收到ICE onCandidate
        this.ws.on('onCandidate', (data) => {
          console.log(data)
          let _pc = this.rooms.find(x => x.room === data.room)
          _pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        })
        this.ws.on('onAnswer', (data) => {
          let _pc = this.rooms.find(x => x.room === data.room)
          _pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          console.log(_pc)
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
      sendInvite (obj) {
        let room = (Math.random() + '').substring(2);
        this.ws.emit('sendInvite', {room: room, targetId: obj.remoteId})
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
        let pc = new PeerConnection(this.iceServer);
        // 把该pc放入房间里
        let _r = {
          room: room,
          pc: pc
        }
        this.rooms.push(_r)
        this.createMedia();
        // 检测到远程流
        pc.ontrack = event => {
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
        pc.onicecandidate = event => {
          console.log('1')
          if (event.candidate) {
            this.ws.emit('sendCandidate', {room: room, candidate: event.candidate})
          }
        };

        // 监听ICE连接状态
        pc.oniceconnectionstatechange = evt => {
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
  .vl_map_ring {
    width: 250px;
    height: 200px;
    background: #36404E;
    position: relative;
  }
  .vl_map_ring #remoteVideo {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
  }
  .vl_map_ring .top {
    width: 100%;
    height: 46px;
    display: flex;
  }
  .vl_map_ring .top img {
    width: 46px;
    height: 46px;
  }
  .vl_map_ring .top div h4 {
    
  }
</style>
