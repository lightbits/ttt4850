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
    var COLUMN = 0;

    var SAMPLE0 = {buffer: null};
    var SAMPLE1 = {buffer: null};
    var SAMPLE2 = {buffer: null};
    var SAMPLE3 = {buffer: null};
    var SAMPLE4 = {buffer: null};
    var SAMPLE5 = {buffer: null};
    var SAMPLE6 = {buffer: null};
    var SAMPLE7 = {buffer: null};

    // The Launchpad button layout
    // is represented as a 2D array
    // of 8x8 buttons mapped to the
    // following MIDI button indices.
    //                    [USB]
    //                      |
    //     +------------------+------+
    //     | 104 ... ... ... ... 111 |
    //     +-------------------------+
    //   7 | 81 82 83 84 85 86 87 88 | Volume:     89
    //   6 | 71 72 73 74 75 76 77 78 | Pan:        79
    //   5 | 61 62 63 64 65 66 67 68 | Send A:     69
    // Y 4 | 51 52 53 54 55 56 57 58 | Send B:     59
    //   3 | 41 42 43 44 45 46 47 48 | Stop:       49
    //   2 | 31 32 33 34 35 36 37 38 | Mute:       39
    //   1 | 21 22 23 24 25 26 27 28 | Solo:       29
    //   0 | 11 12 13 14 15 16 17 18 | Record Arm: 19
    //     +-------------------------+
    //        0  1  2  3  4  5  6  7
    //                  X

    function XYToMidiIndex(x, y)
    {
        if (x < 0) x = 0;
        if (x > 7) x = 7;
        if (y < 0) y = 0;
        if (y > 7) y = 7;
        return 11 + y*10 + x;
    }

    function MidiIndexToXY(index)
    {
        x = (index-11)%10;
        y = (index-11)/10;
        return [x, y];
    }

    var AudioContext = AudioContext || webkitAudioContext; // for ios/safari
    var CONTEXT = new AudioContext();

    LoadSample(SAMPLE0, "assets/B/bubbles.mp3");
    LoadSample(SAMPLE1, "assets/B/clay.mp3");
    LoadSample(SAMPLE2, "assets/B/confetti.mp3");
    LoadSample(SAMPLE3, "assets/B/corona.mp3");
    LoadSample(SAMPLE4, "assets/B/dotted-spiral.mp3");
    LoadSample(SAMPLE5, "assets/B/flash-1.mp3");
    LoadSample(SAMPLE6, "assets/B/flash-2.mp3");
    LoadSample(SAMPLE7, "assets/B/flash-3.mp3");

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
                PlaySample(SAMPLE0, 1.0, 1.0);
            else if (button == 72)
                PlaySample(SAMPLE1, 1.0, 1.0);
            else if (button == 73)
                PlaySample(SAMPLE2, 1.0, 1.0);
            else if (button == 74)
                PlaySample(SAMPLE3, 1.0, 1.0);
            else if (button == 81)
                PlaySample(SAMPLE4, 1.0, 1.0);
            else if (button == 82)
                PlaySample(SAMPLE5, 1.0, 1.0);
            else if (button == 83)
                PlaySample(SAMPLE6, 1.0, 1.0);
            else if (button == 84)
                PlaySample(SAMPLE7, 1.0, 1.0);
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

    function PlaySample(sample, gain, rate)
    {
        var s = CONTEXT.createBufferSource();
        var g = CONTEXT.createGain();
        s.buffer = sample.buffer;
        s.playbackRate.value = rate;
        s.connect(g);
        g.gain.value = gain;
        g.connect(CONTEXT.destination);
        s.start();
        sample.s = s;
    }

    function StopSample(sample)
    {
        sample.s.stop();
    }

    function LoadSample(sample, url)
    {
        console.log(CONTEXT);
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            CONTEXT.decodeAudioData(request.response, function(buffer) {
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

    function StartMusicLoop(interval) 
    {
        return window.setInterval(PlayColumn, interval);
    }

    function StopMusicLoop(loop) {
        window.clearInterval(loop);
    }

    function PlayColumn() 
    {
        samples = getSampleColumn(COLUMN);
        for (var i = 0; i < samples.length; i++) {
            PlaySample(column[i],gain,rate);
        }
    }
    navigator.requestMIDIAccess({sysex: true}).then(OnMidiSuccess, OnMidiFailure);
}
