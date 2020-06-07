let scene;
let size_x = document.getElementById("gol_canvas").offsetWidth;
let size_y = window.innerHeight;
let gliders = [[1, 0, 0], [0, 1, 1], [1, 1, 0]];
let lwss = [[1,0,0,1,0],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,0]];
let mwss = [[0,0,0,0,0,0,0],[0,1,1,1,0,0,0],[1,1,1,1,1,0,0],[1,1,1,0,1,1,0],[0,0,0,1,1,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];
let hwss = [[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,1,1,1,1,0,0],[1,1,1,1,1,1,0],[1,1,1,1,0,1,1],[0,0,0,0,1,1,0],[0,0,0,0,0,0,0]];
let shapes = [gliders,lwss, mwss, hwss];

function setup() {
  /**
   * Create a P5.js canvas
   * This reads the HTML page the script runs on to make the width equal to the width of the `div` component.
   * It also sets the background color of the GOL to the page background.
   */
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
  /**
   * Main loop: update the canvas
   */
  background(scene.background['r'], scene.background['g'], scene.background['b']);
  scene.counter++
  scene.update();
  scene.display();
}

function mouseReleased() {
  /**
   * Draw a glider when the mouse is released.
   * Different objects can be inserted here
   */
  let mouse_col = mouseX / size_x * scene.params.n_columns | 0;
  let mouse_row = mouseY / size_y * scene.params.n_rows | 0;
  scene.draw_shape(mouse_row, mouse_col);
}

function site_background() {
  /**
   * Obtain the background color of the page
   */
  let rgb_string = window.getComputedStyle(document.body, null).getPropertyValue('background-color');
  let vals = rgb_string.substring(rgb_string.indexOf('(') + 1, rgb_string.length - 1).split(', ');
  return {
    'r': Number(vals[0]),
    'g': Number(vals[1]),
    'b': Number(vals[2])
  };
}

class Params {
  /**
   * Parameters for the game of life simulation
   * Number of rows (and size of the circles)
   * Number of columns (given by the number of rows and the screen)
   * Seed (to reproduce certain configurations
   * Number of initially alive cells
   * Decay rate of the lighting up
   */
  constructor() {
    this.n_rows = 50;
    this.n_columns = (this.n_rows / size_y * size_x) | 0;
    this.seed = random() * 360;
    this.initial_fill = 0.01;
    this.decay = 0.8;
  }
}

class Scene {
  /**
   * Abstraction of the canvas to progress the GOL on
   */
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
    /**
     * We cycle through colours. This is how the color of the current coming-alive cells is determined.
     */
    return (this.counter * 2 + this.params.seed) % 360 | 0;
  }

  num_alive_neighbours(c_row, c_column) {
    /**
     * Method that counts the number of neigbours alive of the current cell
     */
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
    /**
     * Create a new grid based on the initial alive ratio specified in the parameters.
     */
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

  draw_shape(row, column) {
    let shape_number = (random()*shapes.length) | 0;
    let rand_bin = (random()*2) | 0;
    let hor_dir = rand_bin*2 - 1;
    rand_bin = (random()*2) | 0;
    let ver_dir = rand_bin*2 - 1;
    let i = (this.counter) % 2;
    let shape = shapes[shape_number];
    let radius = (shape.length-1)/2;
    for (let c_row = - radius; c_row <= radius; c_row++) {
      for (let c_col = -radius; c_col <= radius; c_col++) {
        let new_row = c_row*hor_dir+ row;
        let new_column = c_col*ver_dir+ column;
        if (this.valid_index(new_row, new_column)) {
          this.grids[i][new_row][new_column] = shape[c_row + radius][c_col + radius];
          this.identifiers[i][new_row][new_column] = this.get_current_color();
        }
      }
    }
  }

  update() {
    /**
     * Compute the new representation of game of life from the old representation and draw it on the Canvas
     * To save memory and computing power, we do some tricks:
     * - Store the previous state in the same array as the current state, so we don't need to reinitialize
     *   the same datastructures each time
     */
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
    /**
     * Draw the current state of the GOL to a canvas. For efficiency, we:
     * - Only draw in locations where a cell has a certain brightness (was alive less than n stages ago)
     */
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
