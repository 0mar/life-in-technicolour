# Game of Life: in Technicolour

This repository contains a Game of Life implementation in JavaScript using the canvas-based animation library [p5.js][2].

This repo is for development. To just play with the animation, click [here][3].

## Installation

Clone the repository, and if needed, download p5.


```bash
git clone https://github.com/0mar/life-in-technicolour.git
cd life-in-technicolour
wget https://github.com/processing/p5.js/releases/download/1.0.0/p5.js # optional, for running locally
```

## Running

The `index.html` loads the p5.js library from a CDN, meaning there's no need to install the library.

To run the script locally, download the p5 library with the last line in the previous code block, then open `index.local.html` in your browser.

## Explanation

[Game of life][1] is one of the first implemented computer simulations, proposed by John Conway in the 1940s.
The simulation was proposed as an experiment to model an evolving population.
The population is represented by a set of squares in a grid followed through a period in time, where each square represents an individual.
Individuals can be either dead or alive, depending on the previous state of their neighbours.

Starting from a chosen initial population, the Game of Life evolves according to the following rules.

 - A live cell remains alive if it has 2 or 3 neighbours who are also alive, otherwise it dies.
 - A dead cell becomes alive if it has 3 neighbours, otherwise it stays dead.

The classical Game of Life is often displayed on a grid where living individuals are black cells and dead individuals are white cells, evolving over time.

As a play on this concept, the Game of Life animation displayed below follows the same concepts, but living individuals have different colors, are presented in circles and slowly fade out. Additionally, by clicking/touching the animation, new shapes are introduced in the animation.

[1]: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
[2]: http://p5js.org/
[3]: https://symbols.hotell.kau.se/gameoflife/
