aPos = 122
bPos = 115
cPos = 375
dPos = 380
screwdriverTop = 150
screwdriverBottom = 0
def setup():
    size(600, 600)

def draw():
    
    background(255, 255, 255)
    fill(245, 241, 10)
    rect(100, 100, 300, 300)
    pushMatrix()
    translate(mouseX, mouseY)
    rotate(radians(-30));
    fill(screwdriverTop, 152, 152)
    rect(0, 0, 5, 50)
    fill(screwdriverBottom, 0, 0)
    rect(-5, 50, 15, 75)
    popMatrix()
    
    global aPos
    ellipse(aPos, 120, 30, 30)
    pushMatrix()
    if (aPos >= 1000):
        aPos = 1000
    popMatrix()
    if (113 < mouseX and mouseX < 140) and (115 < mouseY < 130):
        aPos = aPos + 4
    
    global bPos
    ellipse(bPos, 380, 30, 30)
    pushMatrix()
    if (bPos >= 1000):
        bPos = 1000
    popMatrix()
    if (109 < mouseX and mouseX < 127) and (373 < mouseY < 392):
        bPos = bPos + 4
        
    global cPos
    ellipse(cPos, 380, 30, 30)
    pushMatrix()
    if (cPos >= 1000):
        cPos = 1000
    popMatrix()
    if (352 < mouseX and mouseX < 380) and (371 < mouseY < 395):
        cPos = cPos + 4    
        
    global dPos
    ellipse(dPos, 115 , 30, 30)
    pushMatrix()
    if (dPos >= 1000):
        dPos = 1000
    popMatrix()
    if (352 < mouseX and mouseX < 380) and (115 < mouseY < 130):
        dPos = dPos + 4   
    
def mousePressed():
    print (mouseX)
    print (mouseY)

#def mousePressed():
    #if (352 < mouseX and mouseX < 380) and (115 < mouseY < 130):
        #background(107, 55, 219)
    #else: 
        #background(255, 255, 255)
    
    