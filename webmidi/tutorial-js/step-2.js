/*
If the browser supports Web MIDI, the requestMIDIAccess() method returns a 'MIDI Access' object, which contains all of our connected device's info, which we'll be exploring soon. This 'MIDI Access' object gets passed to the onMIDISuccess function for us to use. If the browser doesn't suport Web MIDI, then the onMIDIFailure function gets called, ending all of the fun you could have had. *You may have noticed that System Exclusive messages, or 'sysex', are also supported if set to 'true', but that's for another article.

Now that we have an active MIDI connection and our device info, we need to do something with it. If you open up Chrome Developer Tools (Console), you will see our MIDIAccess object, which shows inputs, outputs and sysex status. <screenshot> What we're after in this object is 'inputs', specifically their values, which we need to loop over.
In the body of the for loop you will see that everytime we send a message, our onMIDIMessage function gets called. Press a key on your MIDI keyboard and you will see a series of messages. Clicking on the triangle will show you all of the info you get on every key-press
<screenshot>. As cool as that is, it's still not very usable. What we want to get at is the 'data' property.
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
    data = message.data; // this gives us our [command/channel, note, velocity] data.
    console.log('MIDI data', data); // MIDI data [144, 63, 73]
    logger('MIDI data', data);
}

function logger(label, data) {
    messages = label + " [channel: " + (data[0] & 0xf) + ", cmd: " + (data[0] >> 4) + ", type: " + (data[0] & 0xf0) + " , note: " + data[1] + " , velocity: " + data[2] + "]";
    document.getElementById('log').textContent = messages;
}