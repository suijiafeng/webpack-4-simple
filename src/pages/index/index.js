
import "./main.scss";
console.log(`I'm a silly entry point`);

document.querySelector(".sayHi").innerHTML="你好吗？";

let arr = ['a','b','c',]
let arr1 = []

arr.forEach(v=>{
arr1.push(v)
})

console.log(arr1)

let rr = [1,2,3].map(function(r){return r+1})
console.log(rr)

let aa = [...arr,'22',...arr]

console.log(aa)