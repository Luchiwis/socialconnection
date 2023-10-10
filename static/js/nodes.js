console.log("nodes.js loaded");
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
    this.i_disconnect = document.querySelector("#disconnect");
    this.connect = document.querySelector("#connect");
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

  getNode(name) {
    for (const node of this.nodeManager.nodes) {
      if (node.text === name) {
        return node;
      }
    }
    return null;
  }

  #create() {
    const form_input = document.createElement("div");
    const component = `<div id="${this.id}" class="input-group flex-nowrap collapse">
        <!-- name -->
        <span class="input-group-text" id="addon-wrapping">Name</span>
        <input type="text" class="form-control" placeholder="Name" aria-label="Name" aria-describedby="addon-wrapping" id="name">
        <!-- size (range) -->

        <span class="input-group-text" id="addon-wrapping">Size</span>
        <input type="range" class="form-control" placeholder="Size" aria-label="Size" aria-describedby="addon-wrapping" id="size" min="20" max="200">
        <!-- color (color picker) -->
        <span class="input-group-text" id="addon-wrapping">Color</span>
        <input type="color" class="form-control m-auto" placeholder="Color" aria-label="Color" aria-describedby="addon-wrapping" id="color">
        <!-- connect (dropdown with checkboxes) -->
        <span class="input-group-text" id="addon-wrapping">Disconnect</span>
        <select class="form-select" aria-label="Connect" id="disconnect">
            <option selected>Choose...</option>
            <option value="1">One</option>
            <option value="2">Two</option>
        </select>
        <!-- connect (dropdown with checkboxes) -->
            <span class="input-group-text" id="addon-wrapping">Connect</span>
            <select class="form-select" aria-label="Connect" id="connect">
                <option selected>Choose...</option>
            </select>
        <!-- remove -->
        <button type="button" class="btn btn-danger" id="remove">Remove Node</button>
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

    this.i_disconnect.innerHTML = "<option selected>Choose...</option>";
    connections.forEach((connection) => {
      const option = document.createElement("option");
      option.value =
        connection.node1 === this.nodeManager.editing
          ? connection.node2.text
          : connection.node1.text;
      option.innerHTML =
        connection.node1 === this.nodeManager.editing
          ? connection.node2.text
          : connection.node1.text;
      this.i_disconnect.appendChild(option);
    });

    this.connect.innerHTML = "<option selected>Choose...</option>";
    this.nodeManager.nodes.forEach((node) => {
      if (node !== this.nodeManager.editing) {
        const option = document.createElement("option");
        option.value = node.text;
        option.innerHTML = node.text;
        this.connect.appendChild(option);
      }
    });
  }

  #addEvents() {
    // change name
    this.i_name.addEventListener("input", (e) => {
      this.nodeManager.editing.text = e.target.value;
    });
    // change size
    this.i_size.addEventListener("input", (e) => {
      this.nodeManager.editing.radius = e.target.value;
    });
    // change color
    this.i_color.addEventListener("input", (e) => {
      this.nodeManager.editing.color = e.target.value;
    });
    // disconnect
    this.i_disconnect.addEventListener("input", (e) => {
      this.nodeManager.disconnect(
        this.nodeManager.editing,
        this.getNode(e.target.value)
      );
      this.show(this.nodeManager.editing);
    });
    // connect
    this.connect.addEventListener("input", (e) => {
      this.nodeManager.connect(
        this.nodeManager.editing,
        this.getNode(e.target.value)
      );
      this.show(this.nodeManager.editing);
    });
    //remove
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
    });
  }
}

class NodeManager {
  constructor(id_canvas) {
    this.canvas = document.querySelector(id_canvas);
    this.nodes = [];
    this.connections = [];
    this.grabbing = null;
    this.editing = null;
    this.onChangeFunctions = [];
    this.#createEvents();
    this.#update();
  }

  addNode(node) {
    this.nodes.push(node);
  }

  removeNode(node) {
    //remove node and all connections
    this.nodes = this.nodes.filter((n) => n !== node);
    this.connections = this.connections.filter(
      (c) => c.node1 !== node && c.node2 !== node
    );
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

  getState() {
    const nodes = [];
    this.nodes.forEach((node) => {
      nodes.push(node.getData());
    });
    const connections = [];
    this.connections.forEach((connection) => {
      connections.push(connection.getData());
    });
    return {
      nodes: nodes,
      connections: connections,
    };
  }

  loadFromState(state) {
    this.nodes = [];
    this.connections = [];
    state.nodes.forEach((node) => {
      this.nodes.push(
        new Node(node.id, node.x, node.y, node.radius, node.text, node.color)
      );
    });
    state.connections.forEach((connection) => {
      this.connect(
        this.getNodeFromId(connection.node1),
        this.getNodeFromId(connection.node2),
        connection.width
      );
    });
  }

  getNodeFromId(id) {
    for (const node of this.nodes) {
      if (node.id === id) {
        return node;
      }
    }
    return null;
  }

  bindChanges(func) {
    this.onChangeFunctions.push(func);
  }

  changed() {
    // call all binded functions
    this.onChangeFunctions.forEach((func) => func());
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

    // Grab node
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

    // Release node
    canvas.addEventListener("mouseup", (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      this.nodes.forEach((node) => {
        if (node.checkMouseIn(x, y)) {
          canvas.style.cursor = "pointer";
          this.grabbing = null;
        }
      });
      this.changed();
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
  constructor(id, x, y, radius = 50, text = "", color = "lightgray") {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.text = text;
    this.connections = [];
  }

  getData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      radius: this.radius,
      color: this.color,
      text: this.text,
    };
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();

    //proporcionar el tipo de letra y el tamaño
    ctx.font = this.radius / 2 + "px Arial";
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

  getData() {
    return {
      node1: this.node1.id,
      node2: this.node2.id,
      width: this.width,
    };
  }
}

// functions
function ajaxRequest(url, method, data) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      return this.responseText;
    }
  };
  request.open(method, url, true);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("X-CSRFToken", csrfToken);
  request.send(JSON.stringify(data));
}

function save() {
  response = ajaxRequest("", "POST", nodes.getState());
  // console.log(response)
}

function autoSave(time = 10000) {
  setInterval(save, time);
}

// events
window.addEventListener("load", () => {
  console.log("loaded");
  console.log("recieved last state : \n" + state);
  state = JSON.parse(state);
  nodes.loadFromState(state);
});

// execution
nodes = new NodeManager("#nodes");
editor = new Editor("#edit-nodes", nodes);

nodes.bindChanges(save); // save state
autoSave(5000);

// create nodes
// persona1 = new Node(0, 40, 40, 50, "lucio", "blue");
// persona2 = new Node(1, 200, 200, 50, "jorge", "red");
// nodes.addNode(persona1);
// nodes.addNode(persona2);

// nodes.connect(persona2, persona1);