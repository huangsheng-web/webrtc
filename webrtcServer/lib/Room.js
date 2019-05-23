class Room {
  constructor(data) {
    this.roomId = data.roomId;
    this.members = []; // 加入房间成员集合
    this.roomOwner = 1; // 当前房主
    this.maxMember = 5; // 最大成员数
  }
  // 关闭当前房间
  close () {
    console.log(this.roomId)
  }
}
module.exports = Room;