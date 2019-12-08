let scene;
let size_x = document.getElementById("gol_canvas").offsetWidth;
let size_y = window.innerHeight;
let gliders = [[[1, 0, 0], [0, 1, 1], [1, 1, 0]],
[[0, 1, 0], [0, 1, 1], [1, 0, 1]],
[[0, 1, 1], [1, 1, 0], [0, 0, 1]],
[[1, 0, 1], [1, 1, 0], [0, 1, 0]]];


function setup() {
  let embedded = document.getElementById('gol_canvas').getAttribute('embed');
  if (embedded === "1") {
    size_y = size_x / 1. | 0;
    console.log(size_x, size_y);
  }
  let canvas = createCanvas(size_x, size_y);
  scene = new Scene();
  frameRate(60);
  canvas.parent('gol_canvas');
  scene.background = site_background();
  console.log(scene.background['r'], scene.background['g'], scene.background['b'])
}

function draw() {
  background(scene.background['r'], scene.background['g'], scene.background['b']);
  scene.counter++
  scene.update();
  scene.display();
}

function mouseReleased() {
  let mouse_col = mouseX / size_x * scene.params.n_columns | 0;
  let mouse_row = mouseY / size_y * scene.params.n_rows | 0;
  scene.draw_glider(mouse_row, mouse_col);
}

function site_background() {
  let rgb_string = window.getComputedStyle(document.body, null).getPropertyValue('background-color');
  let vals = rgb_string.substring(rgb_string.indexOf('(') + 1, rgb_string.length - 1).split(', ');
  return {
    'r': Number(vals[0]),
    'g': Number(vals[1]),
    'b': Number(vals[2])
  };
}
class Params {
  constructor() {
    this.n_rows = 50;
    this.n_columns = (this.n_rows / size_y * size_x) | 0;
    this.seed = random() * 360;
    this.initial_fill = 0.2;
    this.decay = 0.8;
  }
}

class Scene {
  constructor() {
    this.counter = 0;
    this.params = new Params();
    this.grids = [[[]], [[]]];
    this.last_ons = [[[]], [[]]];;
    this.identifiers = [[[]], [[]]];;
    this.background =
      this.cell_size = [size_y / this.params.n_rows, size_x / this.params.n_columns];
    this.fill_grid();
  }

  get_current_color() {
    return (this.counter * 2 + this.params.seed) % 360 | 0;
  }

  num_alive_neighbours(c_row, c_column) {
    let i = (this.counter + 1) % 2;
    let tot = 0;
    for (let row = c_row - 1; row <= c_row + 1; row++) {
      for (let column = c_column - 1; column <= c_column + 1; column++) {
        let r_row = row;
        let r_column = column;
        if (row == -1) r_row += this.params.n_rows;
        if (row == this.params.n_rows) r_row = 0;
        if (column == -1) r_column += this.params.n_columns;
        if (column == this.params.n_columns) r_column = 0;
        tot += this.grids[i][r_row][r_column];
      }
    }
    return tot - this.grids[i][c_row][c_column];
  }

  fill_grid() {
    let size = 70;
    for (let i = 0; i < 2; i++) {
      for (let row = 0; row < this.params.n_rows; row++) {
        this.grids[i][row] = [];
        this.last_ons[i][row] = [];
        this.identifiers[i][row] = [];
        for (let column = 0; column < this.params.n_columns; column++) {
          this.last_ons[i][row][column] = 0;
          this.identifiers[i][row][column] = 0;
          if (row >= this.params.n_rows / 2 - size && row < this.params.n_rows / 2 + size) {
            if (column >= this.params.n_columns / 2 - size && column < this.params.n_columns / 2 + size) {
              if (random() < this.params.initial_fill) {
                this.grids[i][row][column] = 1;
                this.last_ons[i][row][column] = 1;
                this.identifiers[i][row][column] = this.get_current_color();
              } else {
                this.grids[i][row][column] = 0;
                this.last_ons[i][row][column] = 0;
                this.identifiers[i][row][column] = 0;
              }
            }
          }
        }
      }
    }
  }

  valid_index(row, column) {
    return (row >= 0 && row < this.params.n_rows && column >= 0 && column < this.params.n_columns);
  }

  draw_glider(row, column) {
    let i = (this.counter) % 2;
    let glider_number = (random() * 4) | 0;
    let glider = gliders[glider_number];
    for (let c_row = - 1; c_row <= 1; c_row++) {
      for (let c_col = -1; c_col <= 1; c_col++) {
        let new_row = c_row + row;
        let new_column = c_col + column;
        if (this.valid_index(new_row, new_column)) {
          this.grids[i][new_row][new_column] = glider[c_row + 1][c_col + 1];
          this.identifiers[i][new_row][new_column] = this.get_current_color();
        }
      }
    }
  }

  update() {
    // let mouse_col = mouseX / size_x * this.params.n_columns | 0;
    // let mouse_row = mouseY/size_y * this.params.n_rows | 0;
    let i = this.counter % 2;
    let i_old = (i + 1) % 2;
    for (let row = 0; row < this.params.n_rows; row++) {
      for (let column = 0; column < this.params.n_columns; column++) {
        this.last_ons[i][row][column] = this.last_ons[i_old][row][column];
        let num_n = this.num_alive_neighbours(row, column);
        if (this.grids[i_old][row][column] === 1 && (num_n === 2 || num_n === 3)) {
          this.grids[i][row][column] = 1;
          this.last_ons[i][row][column] = 1;
          this.identifiers[i][row][column] = this.identifiers[i_old][row][column];
        } else if (this.grids[i_old][row][column] === 0 && num_n === 3) {
          this.grids[i][row][column] = 1;
          this.last_ons[i][row][column] = 1;
          this.identifiers[i][row][column] = this.get_current_color();
        } else {
          this.last_ons[i][row][column] = this.params.decay * this.last_ons[i_old][row][column];
          this.grids[i][row][column] = 0;
          this.identifiers[i][row][column] = this.identifiers[i_old][row][column];
          if (this.last_ons[i_old][row][column] < 0.1) this.last_ons[i][row][column] = 0;
        }
      }
    }
    // console.log(this.identifier[mouse_row][mouse_col]);
  }


  display() {
    let i = this.counter % 2;
    for (let row = 0; row < this.params.n_rows; row++) {
      for (let column = 0; column < this.params.n_columns; column++) {
        if (this.last_ons[i][row][column] > 0.1) {
        let c = color('hsba(' + (this.identifiers[i][row][column]) + ', 100%, 80%, ' + this.last_ons[i][row][column] + ')');
        // let c = color('hsba('+(this.identifier[row][column])+', 100%, 50%, '+1+')');
        fill(c);
        stroke(200, 0);
        ellipse(column * this.cell_size[1], row * this.cell_size[0], this.cell_size[1] * 1, this.cell_size[0] * 1);
        }
      }
    }
  }
}
