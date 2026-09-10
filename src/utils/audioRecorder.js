let mediaRecorder = null
let audioChunks = []

export async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
    });

    audioChunks = [];

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunks.push(event.data);
        }
    };

    mediaRecorder.start();
}



export function stopRecording() {
    return new Promise((resolve, reject) => {
        if (!mediaRecorder) {
            reject(new Error("No active recording"));
            return;
        }

        const recorder = mediaRecorder;

        recorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, {
                type: recorder.mimeType,
            });

            recorder.stream
                .getTracks()
                .forEach((track) => track.stop());

            mediaRecorder = null;
            audioChunks = [];

            resolve(audioBlob);
        };

        recorder.onerror = (event) => {
            reject(event.error);
        };

        recorder.stop();
    });
}



export function pauseRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.pause();
    }
}

export function resumeRecording() {
    if (mediaRecorder && mediaRecorder.state === "paused") {
        mediaRecorder.resume();
    }
}


export function cancelRecording() {
    if (!mediaRecorder) return;

    if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }

    mediaRecorder.stream
        .getTracks()
        .forEach((track) => track.stop());

    mediaRecorder = null;
    audioChunks = [];
}




export function getAudioDuration(audioBlob) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();

        const audioUrl = URL.createObjectURL(audioBlob);

        audio.src = audioUrl;

        audio.onloadedmetadata = () => {
            URL.revokeObjectURL(audioUrl);

            resolve(Math.round(audio.duration));
        };

        audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);

            reject(new Error("Failed to get audio duration"));
        };
    });
}




export async function generateWaveform(audioBlob, barCount = 30) {
    const audioContext = new AudioContext();

    const arrayBuffer = await audioBlob.arrayBuffer();

    const audioBuffer = await audioContext.decodeAudioData(
        arrayBuffer
    );

    const channelData = audioBuffer.getChannelData(0);

    const samplesPerBar = Math.floor(
        channelData.length / barCount
    );

    const waveform = [];

    for (let i = 0; i < barCount; i++) {
        const start = i * samplesPerBar;
        const end = start + samplesPerBar;

        let sum = 0;

        for (let j = start; j < end; j++) {
            sum += Math.abs(channelData[j]);
        }

        const average = sum / samplesPerBar;

        waveform.push(average);
    }

    await audioContext.close();

    return waveform;
}