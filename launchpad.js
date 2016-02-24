// See: https://www.w3.org/TR/webmidi/

// Approach 1: Alternate columns with "raw" sample and "melody" samples.
// Approach 2: Sound does not change across columns. Have some melody samples.

function main()
{
    var MIDI = null;
    var STATUS = document.getElementById("status");
    var INPUT = null;
    var OUTPUT = null;
    var COLOR = 32;

    var SAMPLE0 = {buffer: null};
    var SAMPLE1 = {buffer: null};
    var SAMPLE2 = {buffer: null};
    var SAMPLE3 = {buffer: null};
    var SAMPLE4 = {buffer: null};
    var SAMPLE5 = {buffer: null};
    var SAMPLE6 = {buffer: null};
    var SAMPLE7 = {buffer: null};

    var AudioContext = AudioContext || webkitAudioContext; // for ios/safari
    var CONTEXT = new AudioContext();

    LoadSample(CONTEXT, SAMPLE0, "assets/B/bubbles.mp3");
    LoadSample(CONTEXT, SAMPLE1, "assets/B/clay.mp3");
    LoadSample(CONTEXT, SAMPLE2, "assets/B/confetti.mp3");
    LoadSample(CONTEXT, SAMPLE3, "assets/B/corona.mp3");
    LoadSample(CONTEXT, SAMPLE4, "assets/B/dotted-spiral.mp3");
    LoadSample(CONTEXT, SAMPLE5, "assets/B/flash-1.mp3");
    LoadSample(CONTEXT, SAMPLE6, "assets/B/flash-2.mp3");
    LoadSample(CONTEXT, SAMPLE7, "assets/B/flash-3.mp3");

    function OnMidiMessage(event)
    {
        console.log(event);
        var button = event.data[1];
        var down = event.data[2] == 0;

        // Simple example functionality:
        // SESSION button turns off all lights
        // UP arrow increases next color value
        // DOWN arrow decreases next color value
        // Pushing a button sets its light and plays a sound
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
            if (button == 71)
                PlaySample(CONTEXT, SAMPLE0, 1.0, 1.0);
            else if (button == 72)
                PlaySample(CONTEXT, SAMPLE1, 1.0, 1.0);
            else if (button == 73)
                PlaySample(CONTEXT, SAMPLE2, 1.0, 1.0);
            else if (button == 74)
                PlaySample(CONTEXT, SAMPLE3, 1.0, 1.0);
            else if (button == 81)
                PlaySample(CONTEXT, SAMPLE4, 1.0, 1.0);
            else if (button == 82)
                PlaySample(CONTEXT, SAMPLE5, 1.0, 1.0);
            else if (button == 83)
                PlaySample(CONTEXT, SAMPLE6, 1.0, 1.0);
            else if (button == 84)
                PlaySample(CONTEXT, SAMPLE7, 1.0, 1.0);
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

    function PlaySample(context, sample, gain, rate)
    {
        var s = context.createBufferSource();
        var g = context.createGain();
        s.buffer = sample.buffer;
        s.playbackRate.value = rate;
        s.connect(g);
        g.gain.value = gain;
        g.connect(context.destination);
        s.start();
        sample.s = s;
    }

    function StopSample(context, sample)
    {
        sample.s.stop();
    }

    function LoadSample(context, sample, url)
    {
        console.log(context);
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            context.decodeAudioData(request.response, function(buffer) {
                sample.buffer = buffer;
            });
        }
        request.send();
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
        MIDI.onstatechange = OnStateChange;
        DiscoverIO();
    }

    function OnMidiFailure(msg)
    {
        STATUS.innerHTML = "Failed to get MIDI access - " + msg;
    }

    navigator.requestMIDIAccess({sysex: true}).then(OnMidiSuccess, OnMidiFailure);
}
