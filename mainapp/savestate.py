from .models import Persona, Conexion

"""format:
{'connections': [{'node1': 1, 'node2': 0, 'width': 1}],
 'nodes': [{'color': 'blue', 'radius': 50, 'text': 'lucio', 'x': 463, 'y': 208},
           {'color': 'red', 'radius': 50, 'text': 'jorge', 'x': 563, 'y': 175}]}
"""

def saveState(data):
    # save nodes
    for node in data["nodes"]:
        persona = Persona.objects.get(nombre=node["text"])
        persona.x = node["x"]
        persona.y = node["y"]
        persona.save()
    
    # save connections
    for connection in data["connections"]:
        persona1 = Persona.objects.get(nombre=data["nodes"][connection["node1"]]["text"])
        persona2 = Persona.objects.get(nombre=data["nodes"][connection["node2"]]["text"])
        conexion = Conexion.objects.get(persona1=persona1, persona2=persona2)
        conexion.peso = connection["width"]
        conexion.save()
    
    return True

def loadState():
    data = {"nodes": [], "connections": []}
    personas = Persona.objects.all()
    conexiones = Conexion.objects.all()

    for persona in personas:
        data["nodes"].append({
            "text": persona.nombre,
            "x": persona.x,
            "y": persona.y,
            "radius": persona.size,
            "color": persona.color
        })
    
    for conexion in conexiones:
        data["connections"].append({
            "node1": personas.index(conexion.persona1),
            "node2": personas.index(conexion.persona2),
            "width": conexion.peso
        })
    
    return data
    