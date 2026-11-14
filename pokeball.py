PokeTop = 255
PokeBottom = 255

def setup() :
    size(600, 600)
    
def draw(): 
    background(155, 78, 29) 
    translate(mouseX, mouseY)
    pushMatrix()
    fill(PokeTop, 0, 0)
    arc(0, 0, 100, 100, PI, TWO_PI)
    fill(255, 255, 255)
    arc(0, 0, 100, 100, 0, PI)
    fill(255, 255, 255)
    ellipse(0, 0, 30, 30)
    popMatrix()