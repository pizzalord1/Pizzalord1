xPos = 0

def setup():
    size(400, 400)
    background(255, 255, 255)
    
def draw():
    global xPos
    background(255)
    ellipse(xPos, 25, 15, 15)
    pushMatrix()
    if (xPos >= 400):
        xPos = 0
    popMatrix()
    xPos = xPos + 1