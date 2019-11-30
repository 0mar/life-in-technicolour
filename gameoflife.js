let scene;
let size_x = window.innerWidth;
let size_y = window.innerHeight;

function setup() {
  createCanvas(size_x, size_y);
  scene = new Scene();
  frameRate(60);
}

function draw() {
  background(255);
  scene.counter++
  scene.update();
  scene.display();
}

class Params {
  constructor() {
    this.n_rows = 50;
    this.n_columns = this.n_rows/size_y*size_x;
    this.seed = 10;
    this.initial_fill = 0.2;
    this.decay = 0.9;
  }
}

class Scene {
  constructor() {
    this.counter = 0;
    this.params = new Params();
    this.grid = [[]];
    this.last_on = [[]];
    this.identifier = [[]];

    this.cell_size =[size_y / this.params.n_rows, size_x / this.params.n_columns];
    this.fill_grid();
  }

  get_current_color() {
    return this.counter*2%360|0;
  }

  num_alive_neighbours(c_row,c_column) {
    let tot = 0;
    for (let row=c_row-1;row<= c_row + 1; row++) {
      for (let column=c_column-1; column <= c_column+1;column++) {
        if (row >= 0 && row < this.params.n_rows && column >=0 && column < this.params.n_columns) {
          tot += this.grid[row][column];
        }
      }
    }
    return tot - this.grid[c_row][c_column];
  }

  fill_grid() {
    let size = 70;
    for (let row = 0; row < this.params.n_rows; row++) {
      this.grid[row] = [];
      this.last_on[row] = [];
      this.identifier[row] = [];
      for (let column = 0; column < this.params.n_columns; column++) {
        this.last_on[row][column] = 0;
        this.identifier[row][column] = 0;

        if (row >=  this.params.n_rows/2 - size && row <  this.params.n_rows/2 + size) {
          if (column >=  this.params.n_columns/2 - size && column <  this.params.n_columns/2 + size) {
            if (random() < this.params.initial_fill) {
              this.grid[row][column] = 1;
              this.last_on[row][column] = 1;
              this.identifier[row][column] = this.get_current_color();
            } else {
              this.grid[row][column] = 0;
              this.last_on[row][column] = 0;
              this.identifier[row][column] = 0;
            }
          }
        }
        
        // if (row > 2 && row <= 5 && column == 3) {
        //   this.grid[row][column] = 1;
        // } else {
        //   this.grid[row][column] = 0;
        // }
      }
    }
  }

  update() {
    let mouse_col = mouseX/size_x * this.params.n_columns | 0;
    let mouse_row = mouseY/size_y * this.params.n_rows | 0;
    let new_grid = [[]];
    let new_on = [[]];
    for (let row = 0; row < this.params.n_rows; row++) {
      new_grid[row] = [];
      new_on[row] = [];
      for (let column = 0; column < this.params.n_columns; column++) {
        new_on[row][column] = this.last_on[row][column];
        let num_n = this.num_alive_neighbours(row,column);
        if (this.grid[row][column]===1 && (num_n === 2 || num_n === 3)) {
          new_grid[row][column] =1;
          new_on[row][column] = 1;
          } else if (this.grid[row][column]===0 && num_n === 3)  {
            new_grid[row][column] = 1;
            new_on[row][column] = 1;
            this.identifier[row][column] = this.get_current_color();
        } else {
          new_grid[row][column] = 0;
          new_on[row][column] = this.params.decay*this.last_on[row][column];
          if ( new_on[row][column] < 0.1) new_on[row][column] = 0;
        }
      }
    }
    this.grid = new_grid;
    this.last_on = new_on;
    this.grid[mouse_row][mouse_col] = 1 - this.grid[mouse_row][mouse_col];
    // console.log(this.identifier[mouse_row][mouse_col]);
  }


  display() {
    for (let row = 0; row < this.params.n_rows; row++) {
      for (let column = 0; column < this.params.n_columns; column++) {
        let c = color('hsba('+(this.identifier[row][column])+', 100%, 50%, '+this.last_on[row][column]+')');
        // let c = color('hsba('+(this.identifier[row][column])+', 100%, 50%, '+1+')');
        
        fill(c);
        stroke(200,1-this.last_on[row][column]);
        rect(column*this.cell_size[1],row*this.cell_size[0],this.cell_size[1],this.cell_size[0]);
      }
    }
  }
}
