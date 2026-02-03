let list = [
  {
    word: "Nigga",
    point: 10
  },
  {
    word: "Hello",
    point: 7
  }
]

list.map(item => {
  if (item.word === "Nigga") {
    item.point = 5
  }
})

console.log(list)