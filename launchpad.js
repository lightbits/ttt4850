function main()
{
    var MIDI = null;
    var STATUS = document.getElementById("status");
    var INPUT = null;
    var OUTPUT = null;
    var COLOR = 32;

    console.log("Starting Tonematrix");

    function OnMidiMessage(event)
    {
        console.log(event);
        var button = event.data[1];
        var down = event.data[2] == 0;

        // Simple example functionality:
        // SESSION button turns off all lights
        // UP arrow increases next color value
        // DOWN arrow decreases next color value
        // Pushing a button sets its light
        if (down && button == 104)
        {
            if (COLOR < 128) COLOR++;
        }
        else if (down && button == 105)
        {
            if (COLOR > 0) COLOR--;
        }
        else if (down && button == 108)
        {
            for (var button = 0; button < 128; button++)
            {
                NoteColor(button, 0);
            }
        }
        else if (down)
        {
            console.log("Setting color " + COLOR);
            NoteColor(button, COLOR);
        }
    }

    function SendNoteMessage(data)
    {
        var valid = (data[0] == 0x90 || data[0] == 0x91 || data[0] == 0x92) &&
                    (data[1] >= 0 && data[1] <= 127) &&
                    (data[2] >= 0 && data[2] <= 127);
        if (OUTPUT && valid)
        {
            console.log("Sending " + data);
            OUTPUT.send(data);
        }
    }

    function NoteStrobe(button, color)
    {
        SendNoteMessage([0x92, button, color]);
    }

    function NoteBlink(button, color)
    {
        SendNoteMessage([0x91, button, color]);
    }

    function NoteColor(button, color)
    {
        SendNoteMessage([0x90, button, color]);
    }

    function DiscoverIO()
    {
        INPUT = null;
        for (var entry of MIDI.inputs)
        {
            var input = entry[1];
            console.log(input);
            if (input.name == "Launchpad MK2")
            {
                INPUT = input;
                INPUT.onmidimessage = OnMidiMessage;
            }
        }

        OUTPUT = null;
        for (var entry of MIDI.outputs)
        {
            var output = entry[1];
            console.log(output);
            if (output.name == "Launchpad MK2")
            {
                OUTPUT = output;
            }
        }
    }

    function OnStateChange()
    {
        console.log("Connection changed");
        DiscoverIO();
    }

    function OnMidiSuccess(midiAccess)
    {
        console.log("MIDI ready!");
        MIDI = midiAccess;
        STATUS.innerHTML = "MIDI is OK";
        DiscoverIO();
        MIDI.onstatechange = OnStateChange;
    }

    function OnMidiFailure(msg)
    {
        STATUS.innerHTML = "Failed to get MIDI access - " + msg;
    }

    navigator.requestMIDIAccess({sysex: true}).then(OnMidiSuccess, OnMidiFailure);
}
