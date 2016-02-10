import pygame
import pygame.midi as midi

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

# Send value 45 (velocity) to button index 81
Output.note_on(81, 45)

while True:
    if Input.poll():
        Events = Input.read(1000)
        print Events

    pygame.time.wait(10)

del Input
del Output
midi.quit()
