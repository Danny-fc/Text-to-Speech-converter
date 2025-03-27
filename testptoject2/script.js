document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const voiceSelect = document.getElementById('voice-select');
    const languageSelect = document.getElementById('language-select');
    const rateInput = document.getElementById('rate');
    const pitchInput = document.getElementById('pitch');
    const speakBtn = document.getElementById('speak-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const micBtn = document.getElementById('mic-btn');
    const previewBtn = document.getElementById('preview-btn');
    const clearBtn = document.getElementById('clear-btn');

    let speech = new SpeechSynthesisUtterance();
    let voices = [];
    let isPaused = false;
    let isRecording = false;
    let recognition = null;

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = languageSelect.value;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            textInput.value = transcript;
            stopRecording();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopRecording();
        };

        recognition.onend = () => {
            stopRecording();
        };
    } else {
        micBtn.style.display = 'none';
        console.log('Speech recognition not supported');
    }

    // Clear text function
    function clearText() {
        textInput.value = '';
        // Stop any ongoing speech
        speechSynthesis.cancel();
        isPaused = false;
        pauseBtn.textContent = 'Pause';
    }

    // Get available voices
    function loadVoices() {
        voices = speechSynthesis.getVoices();
        voiceSelect.innerHTML = '<option value="">Select a voice</option>';
        
        // Filter voices by selected language
        const selectedLang = languageSelect.value;
        const filteredVoices = voices.filter(voice => voice.lang.startsWith(selectedLang));
        
        // Sort voices to prioritize female voices
        filteredVoices.sort((a, b) => {
            const aIsFemale = a.name.toLowerCase().includes('female') || a.name.toLowerCase().includes('woman');
            const bIsFemale = b.name.toLowerCase().includes('female') || b.name.toLowerCase().includes('woman');
            if (aIsFemale && !bIsFemale) return -1;
            if (!aIsFemale && bIsFemale) return 1;
            return 0;
        });
        
        filteredVoices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });

        // Auto-select first female voice if available
        const femaleVoice = filteredVoices.find(voice => 
            voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman')
        );
        if (femaleVoice) {
            voiceSelect.value = femaleVoice.name;
        }
    }

    // Load voices when they are available
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Preview voice function
    function previewVoice() {
        if (textInput.value === '') {
            textInput.value = "Hello! I'm a text-to-speech voice. How can I help you today?";
        }

        // Stop any ongoing speech
        speechSynthesis.cancel();

        // Set speech parameters
        speech.text = textInput.value;
        speech.rate = rateInput.value;
        speech.pitch = pitchInput.value;
        
        // Set voice if selected
        if (voiceSelect.value) {
            speech.voice = voices.find(voice => voice.name === voiceSelect.value);
        }

        // Speak the text
        speechSynthesis.speak(speech);
    }

    // Speak function
    function speak() {
        if (textInput.value === '') return;

        // Stop any ongoing speech
        speechSynthesis.cancel();

        // Set speech parameters
        speech.text = textInput.value;
        speech.rate = rateInput.value;
        speech.pitch = pitchInput.value;
        
        // Set voice if selected
        if (voiceSelect.value) {
            speech.voice = voices.find(voice => voice.name === voiceSelect.value);
        }

        // Speak the text
        speechSynthesis.speak(speech);
    }

    // Pause function
    function pause() {
        if (speechSynthesis.speaking) {
            if (isPaused) {
                speechSynthesis.resume();
                isPaused = false;
                pauseBtn.textContent = 'Pause';
            } else {
                speechSynthesis.pause();
                isPaused = true;
                pauseBtn.textContent = 'Resume';
            }
        }
    }

    // Stop function
    function stop() {
        speechSynthesis.cancel();
        isPaused = false;
        pauseBtn.textContent = 'Pause';
    }

    // Start recording
    function startRecording() {
        if (recognition) {
            recognition.start();
            isRecording = true;
            micBtn.classList.add('recording');
            micBtn.innerHTML = '<i class="fas fa-stop"></i>';
        }
    }

    // Stop recording
    function stopRecording() {
        if (recognition) {
            recognition.stop();
            isRecording = false;
            micBtn.classList.remove('recording');
            micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        }
    }

    // Toggle recording
    function toggleRecording() {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    // Event listeners
    speakBtn.addEventListener('click', speak);
    pauseBtn.addEventListener('click', pause);
    stopBtn.addEventListener('click', stop);
    micBtn.addEventListener('click', toggleRecording);
    previewBtn.addEventListener('click', previewVoice);
    clearBtn.addEventListener('click', clearText);

    // Update speech parameters when sliders change
    rateInput.addEventListener('input', () => {
        if (speechSynthesis.speaking) {
            speech.rate = rateInput.value;
            speechSynthesis.cancel();
            speechSynthesis.speak(speech);
        }
    });

    pitchInput.addEventListener('input', () => {
        if (speechSynthesis.speaking) {
            speech.pitch = pitchInput.value;
            speechSynthesis.cancel();
            speechSynthesis.speak(speech);
        }
    });

    // Handle voice selection change
    voiceSelect.addEventListener('change', () => {
        if (speechSynthesis.speaking) {
            speech.voice = voices.find(voice => voice.name === voiceSelect.value);
            speechSynthesis.cancel();
            speechSynthesis.speak(speech);
        }
    });

    // Handle language selection change
    languageSelect.addEventListener('change', () => {
        if (recognition) {
            recognition.lang = languageSelect.value;
        }
        loadVoices();
    });
}); 