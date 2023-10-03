from django.shortcuts import render

# Create your views here.
def index(request):
    if request.method == "POST":
        values = request.body.decode('utf-8')
        print(values)
    return render(request, "index.html")