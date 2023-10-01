const canvas = document.querySelector("#nodes");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Nodes {
  constructor() {
    this.nodes = [];
    this.grabbing = null;
    this.#createEvents();
    this.#update();
  }

  addNode(node) {
    this.nodes.push(node);
  }

  removeNode(node) {
    this.nodes = this.nodes.filter((n) => n !== node);
  }

  draw() {
    this.nodes.forEach((node) => node.draw());
  }
  #update() {
    // remove everything and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.draw();
    requestAnimationFrame(this.#update.bind(this));
  }

  #createEvents() {
    //
    canvas.addEventListener("click", (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      this.nodes.forEach((node) => {
        if (node.checkClick(x, y)) {
          //   nodes.removeNode(node);
        }
      });
    });

    // Update cursor style and move node if grabbing
    canvas.addEventListener("mousemove", (e) => {
        const x = e.offsetX;
        const y = e.offsetY;
        this.nodes.forEach((node) => {
            if (this.grabbing) {
                this.grabbing.x = x;
                this.grabbing.y = y;
            }
            else if (node.checkClick(x, y)) {
                canvas.style.cursor = "pointer";
            } else {
                canvas.style.cursor = "default";
            }
        });
    });
    

    canvas.addEventListener("mousedown", (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      this.nodes.forEach((node) => {
        if (node.checkClick(x, y)) {
          canvas.style.cursor = "grabbing";
            this.grabbing = node;
        }
      });
    });

    canvas.addEventListener("mouseup", (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      this.nodes.forEach((node) => {
        if (node.checkClick(x, y)) {
          canvas.style.cursor = "pointer";
          this.grabbing = null;
        }
      });
    });

    // Remove node on double click
    canvas.addEventListener("dblclick", (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      this.nodes.forEach((node) => {
        if (node.checkClick(x, y)) {
          nodes.removeNode(node);
        }
      });
    });
  }
}

class Node {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  move() {
    this.x += 1;
    this.y += 1;
    this.draw();
  }

  checkClick(x, y) {
    const distance = Math.sqrt(
      Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2)
    );
    return distance < this.radius;
  }
}

// execution

nodes = new Nodes();

persona1 = new Node(40, 40, 10, "blue");

// nodes.addNode(new Node(10, 10, 10, "red"));
nodes.addNode(persona1);

nodes.draw();
