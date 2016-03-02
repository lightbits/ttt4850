// See: https://www.w3.org/TR/webmidi/

// Approach 1: Alternate columns with "raw" sample and "melody" samples.
// Approach 2: Sound does not change across columns. Have some melody samples.
// Ide: Lyder dør ut etterhvert -> tvinger deg til å lage ny lyd
// Ide: Midlertidige lyder, to moduser, holde inne versus trykke

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
    y = Math.floor((index-11)/10);
    return [x, y];
}

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

    var AudioContext = AudioContext || webkitAudioContext; // for ios/safari
    var CONTEXT = new AudioContext();

    // LoadSample(SAMPLE0, "assets/A/bubbles.mp3");
    // LoadSample(SAMPLE1, "assets/A/clay.mp3");
    // LoadSample(SAMPLE2, "assets/A/confetti.mp3");
    // LoadSample(SAMPLE3, "assets/A/corona.mp3");
    // LoadSample(SAMPLE4, "assets/A/dotted-spiral.mp3");
    // LoadSample(SAMPLE5, "assets/A/flash-1.mp3");
    // LoadSample(SAMPLE6, "assets/A/flash-2.mp3");
    // LoadSample(SAMPLE7, "assets/A/flash-3.mp3");

    LoadSample(SAMPLE0, "assets/M1/sound1.wav");
    LoadSample(SAMPLE1, "assets/M1/sound2.wav");
    LoadSample(SAMPLE2, "assets/M1/sound3.wav");
    LoadSample(SAMPLE3, "assets/M1/sound4.wav");
    LoadSample(SAMPLE4, "assets/M1/sound5.wav");
    LoadSample(SAMPLE5, "assets/M1/sound6.wav");
    LoadSample(SAMPLE6, "assets/M1/sound7.wav");
    LoadSample(SAMPLE7, "assets/M1/sound8.wav");

    var BUTTONS = [128];
    for (var index = 0; index < 128; index++)
    {
        BUTTONS.push({sample: null, is_set: false, is_down: false});
    }
    for (var x = 0; x < 8; x++)
    {
        BUTTONS[XYToMidiIndex(x, 0)] = {sample: SAMPLE0, is_set: false, is_down: false};
        BUTTONS[XYToMidiIndex(x, 1)] = {sample: SAMPLE1, is_set: false, is_down: false};
        BUTTONS[XYToMidiIndex(x, 2)] = {sample: SAMPLE2, is_set: false, is_down: false};
        BUTTONS[XYToMidiIndex(x, 3)] = {sample: SAMPLE3, is_set: false, is_down: false};
        BUTTONS[XYToMidiIndex(x, 4)] = {sample: SAMPLE4, is_set: false, is_down: false};
        BUTTONS[XYToMidiIndex(x, 5)] = {sample: SAMPLE5, is_set: false, is_down: false};
        BUTTONS[XYToMidiIndex(x, 6)] = {sample: SAMPLE6, is_set: false, is_down: false};
        BUTTONS[XYToMidiIndex(x, 7)] = {sample: SAMPLE7, is_set: false, is_down: false};
    }

    var SPEED_INDEX = 2;
    var SPEEDS = [ 200, 250, 300, 350, 400, 450, 500 ];
    var LOOP = StartMusicLoop(SPEEDS[SPEED_INDEX]);

    function PlayButton(x, y)
    {
        if (x >= 0 && x <= 7 && y >= 0 && y <= 7)
        {
            button = BUTTONS[XYToMidiIndex(x, y)];
            if (button.is_set)
                PlaySample(button.sample, 1.0, 1.0);
        }
        else
        {
            console.log("@PlayButton: Indices out of range");
        }
    }

    function IsButtonOn(x, y)
    {
        return BUTTONS[XYToMidiIndex(x, y)].is_set;
    }

    function OnMidiMessage(event)
    {
        // console.log(event);
        var button_index = event.data[1];
        var released = event.data[2] == 0;
        var down = event.data[2] == 127;
        var x = MidiIndexToXY(button_index)[0];
        var y = MidiIndexToXY(button_index)[1];

        console.log("Input: " + button_index + "(" + x + ", " + y + ")");

        if (x >= 0 && x <= 7 && y >= 0 && y <= 7)
        {
            if (released)
            {
                console.log("Setting array button");
                if (BUTTONS[button_index].is_set)
                {
                    BUTTONS[button_index].is_set = false;
                    NoteColor(button_index, 0);
                }
                else
                {
                    BUTTONS[button_index].is_set = true;
                    NoteColor(button_index, 9);
                }
                BUTTONS[button_index].is_down = false;
            }
            if (down)
            {
                BUTTONS[button_index].is_down = true;
                NoteColor(button_index, 119);
            }
        }

        if (released && button_index == 105)
        {
            if (SPEED_INDEX < SPEEDS.length-1)
            {
                SPEED_INDEX++;
                window.clearInterval(LOOP);
                LOOP = StartMusicLoop(SPEEDS[SPEED_INDEX]);
            }
        }

        if (released && button_index == 104)
        {
            if (SPEED_INDEX > 0)
            {
                SPEED_INDEX--;
                window.clearInterval(LOOP);
                LOOP = StartMusicLoop(SPEEDS[SPEED_INDEX]);
            }
        }

        if (released && button_index == 108)
        {
            console.log("Resetting all buttons");
            for (var index = 0; index < 128; index++)
            {
                BUTTONS[index].is_set = false;
                ZeroAllLightsFast();
            }
        }
    }

    function ZeroAllLightsFast()
    {
        // Reset-all
        OUTPUT.send([240, 0, 32, 41, 2,  24, 14, 0, 247]);
    }

    function WriteHelloWorld()
    {
        // Syntax: 240, 0, 32, 41, 2,  24, 20, <Colour> <Loop> <Text> 247
        OUTPUT.send([240, 0, 32, 41, 2, 4, 20, 124, 1, 5, 72, 101, 108, 108, 111, 32, 2, 119, 111, 114, 108, 100, 33, 247]);
    }

    function SendNoteMessage(data)
    {
        var valid = (data[0] == 0x90 || data[0] == 0x91 || data[0] == 0x92) &&
                    (data[1] >= 0 && data[1] <= 127) &&
                    (data[2] >= 0 && data[2] <= 127);
        if (OUTPUT && valid)
        {
            // console.log("Sending " + data);
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

    function DrawState()
    {
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                if (BUTTONS[XYToMidiIndex(x, y)].is_set) {
                    NoteColor(XYToMidiIndex(x, y),9);
                } else if (!BUTTONS[XYToMidiIndex(x, y)].is_down) {
                    NoteColor(XYToMidiIndex(x, y),0);
                }
            }
        }

        for (var i = 0; i < 8; i++) {
            if (BUTTONS[XYToMidiIndex(COLUMN%8, i)].is_set) {
                NoteColor(XYToMidiIndex(COLUMN%8, i),120);
            } else {
                NoteStrobe(XYToMidiIndex(COLUMN%8, i),35);
            }
        }
    }

    function PlayColumn()
    {
        DrawState();
        for (var i = 0; i < 8; i++) {
            PlayButton(COLUMN%8, i);
        }
        COLUMN+=1;
    }
    navigator.requestMIDIAccess({sysex: true}).then(OnMidiSuccess, OnMidiFailure);
}
