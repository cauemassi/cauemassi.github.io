class GameController {
  constructor(context, screen){
    this.context = context
    this.snake = new Snake(screen, true)
    this.food = new Food()
    this.snakeEating = false
    this.frame = 0
    this.points = 0
  }

  start(){
    this.render()
    this.snakeMove()
    this.controllSnakeCollision()
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

  snakeMove(){
    if(this.frame == this.snake.velocity){
      this.snake.move()
      this.frame = 0
    }
  }

  controllSnakeCollision(){
    if(this.snake.detectCollisionWith(this.food)){
      this.food.updatePosition()
      this.snake.eating = true
    }

    if(this.snake.crashWithBody()){
      console.log('game over')
    }
  }

  controllSnake(direction){
    if(direction == undefined) return
    if(this.snake.updateDirection(direction)){
      this.snake.move()
      this.frame = 0
    }
  }

}

class Snake {
  constructor(screen, goesThroughWall){
    this.direction = 'right'
    this.eating = false
    this.body = [
      new SnakePiece(9, 9, 'tail'),
      new SnakePiece(10, 9, 'body'),
      new SnakePiece(11, 9, 'head')
    ]
    this.updateEntireBody()
    this.velocity = 15
    this.color = 'white'
    this.screen = screen
    this.goesThroughWall = goesThroughWall
  }

  updateEntireBody(){
    this.head = this.body[this.body.length - 1]
    this.middleBody = this.body.slice(1, this.body.length - 1)
    this.tail = this.body[0]
  }

  move(){
    this.growUp()
    this.eating ? this.eating = false : this.body.shift()
    this.updateEntireBody()
  }

  growUp(){
    switch(this.direction){

      case 'right':
        if(this.goesThroughWall && this.head.positionX + 1 >= this.screen.width) {
          this.body.push(new SnakePiece(0, this.head.positionY))
        }
        else {
          this.body.push(new SnakePiece(this.head.positionX + 1, this.head.positionY))
        }
        break

      case 'left':
        if(this.goesThroughWall && this.head.positionX - 1 <= -1) {
          this.body.push(new SnakePiece(this.screen.width - 1, this.head.positionY))
        }
        else {
          this.body.push(new SnakePiece(this.head.positionX - 1, this.head.positionY))
        }
        break

      case 'up':
        if(this.goesThroughWall && this.head.positionY - 1 <= -1) {
          this.body.push(new SnakePiece(this.head.positionX, this.screen.height - 1))
        }
        else {
          this.body.push(new SnakePiece(this.head.positionX, this.head.positionY - 1))
        }
        break

      case 'down':
        if(this.goesThroughWall && this.head.positionY + 1 >= this.screen.height){
          this.body.push(new SnakePiece(this.head.positionX, 0))
        }
        else{
          this.body.push(new SnakePiece(this.head.positionX, this.head.positionY + 1))
        }
        break
    }
  }

  crashWithBody(){
    if(this.detectCollisionWith(this.tail)) return true
    for(let bodyPieceId in this.middleBody){
      if(this.detectCollisionWith(this.middleBody[bodyPieceId])) return true
    }

    return false
  }

  detectCollisionWith(object){
    return object.positionY == this.head.positionY && object.positionX == this.head.positionX
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

class SnakePiece{
  constructor(positionX, positionY, type){
    this.width = 1
    this.height = 1
    this.positionX = positionX
    this.positionY = positionY
    this.type = type
  }

  changeType(newType){
    this.type = newType
  }
}