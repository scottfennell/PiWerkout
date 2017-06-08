import math

class WorkoutStats(): 
    
    grade = [] # Meters per meter, 1 is really steep
    grade_steps = 1; #Meters
    gravity = 9.8067 #m/s^2
    weight = 100 #kg
    resistance = 0.1 #Not really sure
    air_drag = 0.32 # Drag coef * area
    air_density = 1.225 #kg/m^3 1.225 sea level 15c
    average_velocity = 10 #mps no idea
    
    def __init__(self):
        self.grade = []
        
    def get_grade(self, distance):
        return self.grade[math.floor(distance * grade_steps) % len(self.grade)]
    
    def calculate_speed(self, rpm, distance):
        #https://www.gribble.org/cycling/power_v_speed.html
        G = self.get_grade(distance)
        #gravity force
        g_force = self.gravity * math.sin(math.arctan(G / 100)) * self.weight
        #rolling force
        r_force = self.gravity * math.cos(math.arctan(G / 100)) * self.weight * self.resistance
        
        f_drag = 0.5 * self.air_drag * self.air_density * ((self.average_velocity ^ 2) / 2)
        
        total_resistance = g_force + r_force + f_drag
        
        
        
        