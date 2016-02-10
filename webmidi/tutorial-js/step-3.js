/*
Now we need to build out our onMIDIMessage function so that we can use the incoming data. Our switch statement uses the first part of our MIDI data : [144, 63, 73], 144 to choose what we'll do next. 
This first byte typically represents the type of MIDI Message, like on, off, pitchbend, etc... We will also check for velocity just to make sure we are getting a noteOff message when we expect one.
Now, when you press a key you will see that you have noteOn and NoteOff messages for you to use, all you need to do is pass that key data into a function to. 
For instance, you could convert the MIDI note value to frequency with this function:
<code>
function frequencyFromNoteNumber( note ) {
   return 440 * Math.pow(2,(note-69)/12);
}
</code>
In future posts, i'll cover how to use the the Web Audio API to generate and use sounds in detail, but just to give you a taste of using Web Audio with Web MIDI, 
i've created a simple sample player that responds to MIDI, qwerty keyboard [q,w,e,r,t], and mouse click.
For now, i will let you try and disect what the code does from my comments.

Looking forward to getting our hands dirty with Web Audio and Web MIDI!
*/

var midi, data, cmd, channel, type, note, velocity;
// request MIDI access
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
        sysex: false
    }).then(onMIDISuccess, onMIDIFailure);
} else {
    alert("No MIDI support in your browser.");
}

// midi functions
function onMIDISuccess(midiAccess) {
    // when we get a succesful response, run this code
    midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status

    var inputs = midi.inputs.values();
    // loop over all available inputs and listen for any MIDI input
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        // each time there is a midi message call the onMIDIMessage function
        input.value.onmidimessage = onMIDIMessage;
    }
}

function onMIDIFailure(error) {
    // when we get a failed response, run this code
    log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + error);
}

function onMIDIMessage(message) {
    data = event.data,
    cmd = data[0] >> 4,
    channel = data[0] & 0xf,
    type = data[0] & 0xf0, // channel agnostic message type. Thanks, Phil Burk.
    note = data[1],
    velocity = data[2];
    // with pressure and tilt off
    // note off: 128, cmd: 8 
    // note on: 144, cmd: 9
    // pressure / tilt on
    // pressure: 176, cmd 11: 
    // bend: 224, cmd: 14
    // log('MIDI data', data);
    switch(type){
        case 144: // noteOn message 
            noteOn(note, velocity);
            break;
        case 128: // noteOff message 
            noteOff(note, velocity);
            break;
    }
    logger('MIDI data', data);
}

function noteOn(midiNote, velocity){
    // do something when note is pressed
}

function noteOff(midiNote, velocity){
    // do something when note is released
}



function logger(label, data) {
    data = data || null;
    messages = label + " [channel: " + (data[0] & 0xf) + ", cmd: " + (data[0] >> 4) + ", type: " + (data[0] & 0xf0) + " , note: " + data[1] + " , velocity: " + data[2] + "]";
    document.getElementById('log').textContent = messages;
}