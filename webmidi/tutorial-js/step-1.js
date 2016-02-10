/*
MIDI has officially hit the web browser! Well, at least in Google Chrome. With the latest version of Google Chrome, MIDI is enabled by default, whereas previously it needed to be enabled by setting a special flag in your browser. This opens up a huge variety of possibilities for not only art and music in the browser, but also allows any hardware that uses MIDI as its communication platform to control and be controlled by your browser.

[MIDI has been available on every major OS for many many years, even on iOS/tablet/mobile, but up until now there has been a glaring lack of MIDI support in something that everyone with a computer, tablet, or smartphone has, the web browser.]

[describe what it’s not, General MIDI playback or MIDI file reader]

In this introductory article to my Web Audio series i'm going to take you through the basics of setting up your MIDI keyboard / controller to interface with your browser. In upcoming articles I will show you how to use the Web Audio API to build simple playback and manipulation applications all the way to building a simple synthesizer in your browser. 

Note: Basic understanding of JavaScript, or another C-based language, will help make this article a lot more digestible.   
You can use Codecademy to get up to speed with JavaScript pretty quickly if you’re interested, or you can consult the Mozilla Developer Network to get a more thorough walkthrough.
Tools: Developer Console<https://developer.chrome.com/devtools/docs/shortcuts> ((Mac) Command + Opt + J, (Windows) Control + Shift + J), Code Editor, such as SublimeText<http://www.sublimetext.com/>.

Let’s get started!

Let’s take a closer look at the following chunk of code.

The very first step we need to take is checking if the browser supports the WebMIDI API by checking for the existence of the web method requestMIDIAccess(). 
* Currently, only Google Chrome supports the Web MIDI API but Mozilla (FireFox) and MicroSoft (Edge) are currently working on implementations and we should see major browser support within the next year or two. 
Fortunately, you can use Web MIDI in all current browsers by using the greatly helpful WebMIDIAPI Polyfill written by Chris Wilson <https://github.com/cwilso/WebMIDIAPIShim>. Ok, back to our code.
*/

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
}

function onMIDIFailure(e) {
    // when we get a failed response, run this code
    log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
}