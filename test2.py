import pygame
import pygame.midi as midi

####################
# Button interface #
####################

# Initialize the matrix
Buttons = []
for Index in range(0, 127):
    Button = [Index, False, 0]
    Buttons.append(Button)

def button_GetMidiIndex(Button):
    return Button[0]

def button_IsPlaying(Button):
    return Button[1] == True

def button_SetPlaying(Button, Playing):
    Button[1] = Playing

def button_EnableMidi(Button):
    if button_IsPlaying(Button):
        Output.note_on(Button[0], Button[2])
    Output.note_on(Button[0], Button[])

####################

pygame.init()
midi.init()
Count = midi.get_count()

for i in range(Count):
    # (interf, name, input, output, opened)
    # intef: string describing device interface
    # input: 0 or 1 if the device is an input
    # output: 0 or 1 if the device is an output
    # opened: 0 or 1 if the device is opened
    print "id", i, midi.get_device_info(i)

Input = midi.Input(1)
Output = midi.Output(3)

while True:
    if Input.poll():
        Events = Input.read(1000)
        for Event in Events:
            Index = Event[0][1]
            Velocity = Event[0][2]
            Button = Buttons[Index]
            if button_IsPlaying(Button):
                button_SetPlaying(Button, True)
            else:
                button_SetPlaying(Button, False)

        for Button in Buttons:
            if button_IsPlaying(Button):
                Output.note_on(button_GetMidiIndex(Button))

    pygame.time.wait(10)

del Input
del Output
midi.quit()
