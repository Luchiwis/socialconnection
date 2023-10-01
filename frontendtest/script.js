const canvas = document.querySelector("#nodes");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Nodes {
  constructor() {
    this.nodes = [];
    this.connections = [];
    this.grabbing = null;
    this.editing = null;
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
    this.connections.forEach((connection) => connection.draw());

    this.nodes.forEach((node) => node.draw());
  }

  connect(node1, node2) {
    const connection = new Connection(node1, node2);
    this.connections.push(connection);
    return connection
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
        if (node.checkMouseIn(x, y)) {
          //   nodes.removeNode(node);
        }
      });
    });

    // Update cursor style and move node if grabbing
    canvas.addEventListener("mousemove", (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      if (this.grabbing) {
        this.grabbing.x = x;
        this.grabbing.y = y;
        return;
      }
      for (const node of this.nodes) {
        if (node.checkMouseIn(x, y)) {
          canvas.style.cursor = "pointer";
          break;
        } else {
          canvas.style.cursor = "default";
        }
      }
    });

    canvas.addEventListener("mousedown", (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      this.nodes.forEach((node) => {
        if (node.checkMouseIn(x, y)) {
          canvas.style.cursor = "grabbing";
          this.grabbing = node;
        }
      });
    });

    canvas.addEventListener("mouseup", (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      this.nodes.forEach((node) => {
        if (node.checkMouseIn(x, y)) {
          canvas.style.cursor = "pointer";
          this.grabbing = null;
        }
      });
    });

    // Edit on double click
    canvas.addEventListener("dblclick", (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      this.nodes.forEach((node) => {
        if (node.checkMouseIn(x, y)) {
          this.editing = node;
        }
      });
    });
  }
}

class Node {
  constructor(x, y, radius = 50, text = "", color = "lightgray") {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.text = text;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(this.text, this.x, this.y + 5);
  }

  move() {
    this.x += 1;
    this.y += 1;
    this.draw();
  }

  checkMouseIn(x, y) {
    const distance = Math.sqrt(
      Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2)
    );
    return distance < this.radius;
  }
}

class Connection {
  constructor(node1, node2) {
    this.node1 = node1;
    this.node2 = node2;
    this.draw();
  }

  draw() {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(this.node1.x, this.node1.y);
    ctx.lineTo(this.node2.x, this.node2.y);
    ctx.stroke();
  }
}

// execution

nodes = new Nodes();

nombres = [
  "juan",
  "pedro",
  "maria",
  "jose",
  "luis",
  "carlos",
  "jorge",
  "laura",
  "ana",
  "lucia",
  "daniel",
  "david",
  "diego",
  "daniela",
];
persona1 = new Node(40, 40, 50, "lucio", "blue");
persona2 = new Node(200, 200, 50, "jorge", "red");
nodes.addNode(persona1);
nodes.addNode(persona2);

for (let i = 0; i < 10; i++) {
  nodes.addNode(
    new Node(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      50,
      nombres[i]
    )
  );
}

nodes.connect(persona2,persona1)
