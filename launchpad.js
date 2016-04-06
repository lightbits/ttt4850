// See: https://www.w3.org/TR/webmidi/

// Approach 1: Alternate columns with "raw" sample and "melody" samples.
// Approach 2: Sound does not change across columns. Have some melody samples.
// Ide: Lyder dør ut etterhvert -> tvinger deg til å lage ny lyd
// Ide: Midlertidige lyder, to moduser, holde inne versus trykke
// Ide: Alle lyder dør ut etterhvert

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

    var TICKS_SINCE_LAST_TOUCH = 0;
    var NUM_TICKS_BEFORE_STANDBY = 8*10;

    var AudioContext = AudioContext || webkitAudioContext; // for ios/safari
    var CONTEXT = new AudioContext();

    var NUM_SAMPLE_SETS = 3;
    var SAMPLES = new Array(3);
    for (var i = 0; i < NUM_SAMPLE_SETS; i++)
    {
        SAMPLES[i] = new Array(8);
        for (j = 0; j < 8; j++)
            SAMPLES[i][j] = {buffer: null, gain: 1.0};
    }

    LoadSample(SAMPLES[0][0], "assets/M1/sound1.wav", 0.05);
    LoadSample(SAMPLES[0][1], "assets/M1/sound2.wav", 0.05);
    LoadSample(SAMPLES[0][2], "assets/M1/sound3.wav", 0.05);
    LoadSample(SAMPLES[0][3], "assets/M1/sound4.wav", 0.05);
    LoadSample(SAMPLES[0][4], "assets/M1/sound5.wav", 0.05);
    LoadSample(SAMPLES[0][5], "assets/M1/sound6.wav", 0.05);
    LoadSample(SAMPLES[0][6], "assets/M1/sound7.wav", 0.05);
    LoadSample(SAMPLES[0][7], "assets/M1/sound8.wav", 0.05);

    LoadSample(SAMPLES[1][0], "assets/M2/sound1.wav", 0.025);
    LoadSample(SAMPLES[1][1], "assets/M2/sound2.wav", 0.05);
    LoadSample(SAMPLES[1][2], "assets/M2/sound3.wav", 0.05);
    LoadSample(SAMPLES[1][3], "assets/M2/sound4.wav", 0.05);
    LoadSample(SAMPLES[1][4], "assets/M2/sound5.wav", 0.05);
    LoadSample(SAMPLES[1][5], "assets/M2/sound6.wav", 0.05);
    LoadSample(SAMPLES[1][6], "assets/M2/sound7.wav", 0.05);
    LoadSample(SAMPLES[1][7], "assets/M2/sound8.wav", 0.05);

    LoadSample(SAMPLES[2][0], "assets/M3/sound1.wav", 0.05);
    LoadSample(SAMPLES[2][1], "assets/M3/sound2.wav", 0.05);
    LoadSample(SAMPLES[2][2], "assets/M3/sound3.wav", 0.05);
    LoadSample(SAMPLES[2][3], "assets/M3/sound4.wav", 0.05);
    LoadSample(SAMPLES[2][4], "assets/M3/sound5.wav", 0.05);
    LoadSample(SAMPLES[2][5], "assets/M3/sound6.wav", 0.05);
    LoadSample(SAMPLES[2][6], "assets/M3/sound7.mp3", 0.05);
    LoadSample(SAMPLES[2][7], "assets/M3/sound8.mp3", 0.05);

    var SELECTED_SAMPLE_SET = 0;

    var BUTTONS = [128];
    for (var index = 0; index < 128; index++)
    {
        BUTTONS.push({sample: null, is_set: false, is_down: false, times_played: 0});
    }

    AssignSampleSetToButtons();

    var SPEED_INDEX = 2;
    var SPEEDS = [ 200, 250, 300, 350, 400, 450, 500 ];
    var LOOP = StartMusicLoop(SPEEDS[SPEED_INDEX]);

    function AssignSampleSetToButtons()
    {
        for (var x = 0; x < 8; x++)
        for (var y = 0; y < 8; y++)
        {
            BUTTONS[XYToMidiIndex(x, y)] = {
                sample: SAMPLES[SELECTED_SAMPLE_SET][y],
                is_set: false,
                is_down: false,
                times_played: 0
            };
        }
    }

    function PlayButton(x, y)
    {
        if (x >= 0 && x <= 7 && y >= 0 && y <= 7)
        {
            button = BUTTONS[XYToMidiIndex(x, y)];
            if (button.is_set)
            {
                PlaySample(button.sample, button.sample.gain, 1.0);
                button.times_played++;
                // console.log(button.times_played);
            }
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

        // console.log("Input: " + button_index + "(" + x + ", " + y + ")");

        if (x >= 0 && x <= 7 && y >= 0 && y <= 7)
        {
            if (released)
            {
                // console.log("Setting array button");
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

            TICKS_SINCE_LAST_TOUCH = 0;
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
            for (var index = 0; index < 128; index++)
            {
                BUTTONS[index].is_set = false;
            }
            ZeroAllLightsFast();
            TICKS_SINCE_LAST_TOUCH = 0;
        }

        // if (released && button_index == 19)
        // {
        //     console.log("Refreshing");
        //     location.reload();
        // }
    }

    function ZeroAllLightsFast()
    {
        // Reset-all
        // OUTPUT.send([240, 0, 32, 41, 2,  24, 14, 0, 247]);
    }

    function WriteHelloWorld()
    {
        // Syntax: 240, 0, 32, 41, 2,  24, 20, <Colour> <Loop> <Text> 247
        // OUTPUT.send([240, 0, 32, 41, 2, 4, 20, 124, 1, 5, 72, 101, 108, 108, 111, 32, 2, 119, 111, 114, 108, 100, 33, 247]);
    }

    function SendNoteMessage(data)
    {
        var valid = (data[0] == 0x90 || data[0] == 0x91 || data[0] == 0x92 || data[0] == 0xB0) &&
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

    function LoadSample(sample, url, gain)
    {
        console.log(CONTEXT);
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            CONTEXT.decodeAudioData(request.response, function(buffer) {
                sample.buffer = buffer;
                sample.gain = gain;
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

        // Light up control buttons
        SendNoteMessage([0xB0, 104, 120]); // speed up
        SendNoteMessage([0xB0, 105, 120]); // speed down
        SendNoteMessage([0xB0, 108, 120]); // reset
    }

    function PlayColumn()
    {
        DrawState();
        for (var i = 0; i < 8; i++) {
            PlayButton(COLUMN%8, i);
        }
        COLUMN+=1;

        TICKS_SINCE_LAST_TOUCH+=1;

        if (TICKS_SINCE_LAST_TOUCH >= NUM_TICKS_BEFORE_STANDBY)
        {
            if (TICKS_SINCE_LAST_TOUCH == NUM_TICKS_BEFORE_STANDBY)
            {
                var pattern = [
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 0, 1, 0, 1, 0, 1, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0]
                ];

                SELECTED_SAMPLE_SET += 1;
                SELECTED_SAMPLE_SET = SELECTED_SAMPLE_SET % 3;
                AssignSampleSetToButtons();

                for (var y = 0; y < 8; y++)
                for (var x = 0; x < 8; x++)
                {
                    button_index = XYToMidiIndex(x, y);
                    if (pattern[y][x] == 1)
                    {
                        BUTTONS[button_index].is_set = true;
                        BUTTONS[button_index].times_played = 0;
                        NoteColor(button_index, 9);
                    }
                    else
                    {
                        BUTTONS[button_index].is_set = false;
                        NoteColor(button_index, 0);
                    }
                }
                SPEED_INDEX = 0;
            }
        }
        else
        {
            // Turn off buttons that have been played for more than N rounds
            for (var index = 0; index < 128; index++)
            {
                if (BUTTONS[index].times_played >= 100)
                {
                    BUTTONS[index].times_played = 0;
                    BUTTONS[index].is_set = false;
                }
            }
        }
    }
    navigator.requestMIDIAccess({sysex: false}).then(OnMidiSuccess, OnMidiFailure);
}
