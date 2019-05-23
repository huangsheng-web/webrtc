function a () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('1000')
    }, 1000)
  })
}
function b () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('2000')
    }, 2000)
  })
}
function c () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('3000')
    }, 3000)
  })
}
async function run () {
  await c().then(res => {console.log(res)});
  await b().then(res => {console.log(res)});
  await a().then(res => {console.log(res)});
}
run ()