const canvas = document.querySelector("#nodes");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Editor {
  constructor(parent_selector, nodeManager, id = "editor") {
    this.id = id;
    this.parent = document.querySelector(parent_selector);
    this.nodeManager = nodeManager;
    this.#create();
    
    this.i_name = document.querySelector("#name");
    this.i_size = document.querySelector("#size");
    this.i_color = document.querySelector("#color");
    this.i_connect = document.querySelector("#connect");
    this.i_remove = document.querySelector("#remove");

    this.#addEvents();
  }
  show(node) {
    this.#setValues(node.text, node.radius, node.color, node.connections);
    this.bsCollapse.show();
  }
  hide() {
    this.bsCollapse.hide();
  }
  #create() {
    const form_input = document.createElement("div");
    const component = `<div id="${this.id}" class="input-group flex-nowrap collapse">
        <!-- name -->
        <span class="input-group-text" id="addon-wrapping">Name</span>
        <input type="text" class="form-control" placeholder="Name" aria-label="Name" aria-describedby="addon-wrapping" id="name">
        <!-- size (range) -->

        <span class="input-group-text" id="addon-wrapping">Size</span>
        <input type="range" class="form-control" placeholder="Size" aria-label="Size" aria-describedby="addon-wrapping" id="size" min="1" max="100">
        <!-- color (color picker) -->
        <span class="input-group-text" id="addon-wrapping">Color</span>
        <input type="color" class="form-control" placeholder="Color" aria-label="Color" aria-describedby="addon-wrapping" id="color">
        <!-- connect (dropdown with checkboxes) -->
        <span class="input-group-text" id="addon-wrapping">Connect</span>
        <select class="form-select" aria-label="Connect" id="connect">
            <option selected>Choose...</option>
            <option value="1">One</option>
            <option value="2">Two</option>
        </select>
        <!-- remove -->
        <button type="button" class="btn btn-danger" id="remove">Remove</button>
    </div>`;

    form_input.innerHTML = component;
    this.parent.appendChild(form_input.firstChild);

    this.bsCollapse = new bootstrap.Collapse("#" + this.id, {
      toggle: false,
    });
  }

  #setValues(nombre, size, color, connections) {
    this.i_name.value = nombre;
    this.i_size.value = size;
    this.i_color.value = color;
    this.i_connect.innerHTML = "";
    connections.forEach((connection) => {
      const option = document.createElement("option");
      option.value = connection;
      option.innerHTML = connection;
      this.i_connect.appendChild(option);
    });
  }

  #addEvents() {
    this.i_name.addEventListener("input", (e) => {
        this.nodeManager.editing.text = e.target.value;
    });
    this.i_size.addEventListener("input", (e) => {
        this.nodeManager.editing.radius = e.target.value;
    });
    this.i_color.addEventListener("input", (e) => {
        this.nodeManager.editing.color = e.target.value;
    });
    this.i_connect.addEventListener("input", (e) => {
      this.nodeManager.connect(this.nodeManager.editing, e.target.value);
    });
    this.i_remove.addEventListener("click", (e) => {
      nodes.removeNode(this.nodeManager.editing);
      this.hide();
    });
    // show on double click if editing
    this.nodeManager.canvas.addEventListener("dblclick", (e) => {
      if (this.nodeManager.editing) {
        this.show(this.nodeManager.editing);
      }
    });
    // hide on click outside
    this.nodeManager.canvas.addEventListener("click", (e) => {
        if (!this.nodeManager.editing) {
            this.hide();
        }
        }
    );
  }
}

class NodeManager {
  constructor(id_canvas) {
    this.canvas = document.querySelector(id_canvas);
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

  connect(node1, node2, width = 1) {
    // check if connection exists
    for (const connection of this.connections) {
      if (
        (connection.node1 === node1 && connection.node2 === node2) ||
        (connection.node1 === node2 && connection.node2 === node1)
      ) {
        return connection;
      }
    }
    // create connection
    const connection = new Connection(node1, node2, width);
    this.connections.push(connection);
    node1.connections.push(connection);
    node2.connections.push(connection);
    return connection;
  }
  disconnect(node1, node2) {
    // check if connection exists
    for (const connection of this.connections) {
      if (
        (connection.node1 === node1 && connection.node2 === node2) ||
        (connection.node1 === node2 && connection.node2 === node1)
      ) {
        this.connections = this.connections.filter((c) => c !== connection);
        node1.connections = node1.connections.filter((c) => c !== connection);
        node2.connections = node2.connections.filter((c) => c !== connection);
        return connection;
      }
    }
    return null;
  }

  #update() {
    // remove everything and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.draw();
    requestAnimationFrame(this.#update.bind(this));
  }

  #createEvents() {
    // Edit on double click
    canvas.addEventListener("click", (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      let clicked = false;
      this.nodes.forEach((node) => {
        if (node.checkMouseIn(x, y)) {
          clicked = true;
        }
      });
      if (!clicked) {
        this.editing = null;
      }
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
      let clicked = false;
      this.nodes.forEach((node) => {
        if (node.checkMouseIn(x, y)) {
          this.editing = node;
          clicked = true;
        }
      });
      if (!clicked) {
        this.editing = null;
      }
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
    this.connections = [];
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
  constructor(node1, node2, width) {
    this.node1 = node1;
    this.node2 = node2;
    this.width = width;
    this.draw();
  }

  draw() {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = this.width;
    ctx.moveTo(this.node1.x, this.node1.y);
    ctx.lineTo(this.node2.x, this.node2.y);
    ctx.stroke();
  }
}

// execution
nodes = new NodeManager("#nodes");
editor = new Editor("#edit-nodes", nodes);

nombres = [
  "juan",
  "pedro",
  "maria",
  "jose",
  "luis",
  "carlos",
  "josefina",
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

nodes.connect(persona2, persona1);
nodes.connect(persona1, nodes.nodes[5], 5);
