from .models import Persona, Conexion

"""format:
{'connections': [{'node1': 1, 'node2': 0, 'width': 1}],
 'nodes': [{'color': 'blue', 'radius': 50, 'text': 'lucio', 'x': 463, 'y': 208},
           {'color': 'red', 'radius': 50, 'text': 'jorge', 'x': 563, 'y': 175}]}
"""

def saveState(data):
    # delete nodes

    # save nodes
    for node in data["nodes"]:
        persona = Persona.objects.get(id=node["id"])
        persona.size = node["radius"]
        persona.x = node["x"]
        persona.y = node["y"]
        persona.save()
    
    #delete connections
    Conexion.objects.all().delete()

    # save new connections
    for connection in data["connections"]:
        persona1 = Persona.objects.get(id=connection["node1"])
        persona2 = Persona.objects.get(id=connection["node2"])
        peso = connection["width"]
        conexion = Conexion(persona1=persona1, persona2=persona2, peso=peso)
        conexion.save()
    
    return True

def loadState():
    data = {"nodes": [], "connections": []}
    personas = Persona.objects.all()
    conexiones = Conexion.objects.all()

    for persona in personas:
        data["nodes"].append({
            "id": persona.id,
            "text": persona.nombre,
            "x": persona.x,
            "y": persona.y,
            "radius": persona.size,
            "color": persona.color
        })
    
    for conexion in conexiones:
        data["connections"].append({
            "node1": conexion.persona1.id,
            "node2": conexion.persona2.id,
            "width": conexion.peso
        })
    
    return data
    