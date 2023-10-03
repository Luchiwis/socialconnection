from django.shortcuts import render
from django.http import JsonResponse
from pprint import pprint
from json import loads, dumps
from .models import Persona, Conexion
from .savestate import saveState, loadState

# Create your views here.
def index(request):
    if request.method == "POST":
        values = request.body.decode('utf-8')
        values = loads(values)
        # pprint(values)
        # return json
        # return JsonResponse({"status": saveState(values)})

    data = loadState()
    data = dumps(data)
    return render(request, "index.html", {"state": data})