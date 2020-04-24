class GameController {
  constructor(context){
    this.context = context
    this.snake = new Snake()
    this.food = new Food()
    this.frame = 0
  }

  start(){
    this.render()
    this.snakeMove()
  }

  render(){
    context.fillStyle = 'black'
    context.fillRect(0, 0, 20, 20)

    context.fillStyle = 'white'
    for(let pieceId in this.snake.body){
      let snakePiece = this.snake.body[pieceId]
      context.fillRect(snakePiece.positionX, snakePiece.positionY, 1, 1)
    }

    context.fillRect(this.food.positionX, this.food.positionY, 1, 1)

    this.frame += 1
  }

  controllSnake(direction){
    if(direction == undefined) return;
    if(this.snake.updateDirection(direction)){
      this.snake.move()
      this.frame = 0
    }
  }

  snakeMove(){
    if(this.frame == this.snake.velocity){
      this.snake.move()
      this.frame = 0
    }
  }

}

class Food {
  constructor(){
    this.positionX = Math.floor(Math.random() * 20)
    this.positionY = Math.floor(Math.random() * 20)
    this.color = 'white'
  }

  updatePosition(){
    this.positionX = Math.floor(Math.random() * 20)
    this.positionY = Math.floor(Math.random() * 20)
  }
}


class Snake {
  constructor(){
    this.direction = 'right'
    this.body = [
      new SnakePiece(9, 9, 'tail'),
      new SnakePiece(10, 9, 'body'),
      new SnakePiece(11, 9, 'head')
    ]
    this.velocity = 15
    this.color = 'white'
  }

  move(){
    let head = this.body[this.body.length - 1]

    switch(this.direction){
      case 'right':
        this.body.push(new SnakePiece(head.positionX + 1, head.positionY))
        break
      case 'left':
        this.body.push(new SnakePiece(head.positionX - 1, head.positionY))
        break
      case 'up':
        this.body.push(new SnakePiece(head.positionX, head.positionY - 1))
        break
      case 'down':
        this.body.push(new SnakePiece(head.positionX, head.positionY + 1))
        break
    }

    this.body.shift()
  }

  updateDirection(newDirection){
    let change = true
    switch(this.direction){
      case 'right':
        if(newDirection == 'left'){
          change = false
        }
        break
      case 'left':
        if(newDirection == 'right'){
          change = false
        }
        break
      case 'up':
        if(newDirection == 'down'){
          change = false
        }
        break
      case 'down':
        if(newDirection == 'up'){
          change = false
        }
        break
    }
    if(change){
      this.direction = newDirection
    }
    return change
  }
}

class SnakePiece{
  constructor(positionX, positionY){
    this.width = 1
    this.height = 1
    this.positionX = positionX
    this.positionY = positionY
    this.type = 'head'
  }

  changeType(newType){
    this.type = newType
  }
}