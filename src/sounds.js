
const SoundManager = {
    isInit: false,
    sounds: {},
    musicName: null,
    mutedSounds: false,
    mutedMusic: false,
    toAdd: [],

    getSFXSounds: () => {
        if (PIXI.sound) {
            return Object.keys(PIXI.sound?._sounds).filter(k => k.indexOf('music') === -1).map(k => PIXI.sound._sounds[k])
        } else {
            return []
        }
    },
    getMusicSounds: () => {
        if (PIXI.sound) {
            return Object.keys(PIXI.sound?._sounds).filter(k => k.indexOf('music') > -1).map(k => PIXI.sound._sounds[k])
        } else {
            return []
        }
    },
    muteMusic: () => {
        SoundManager.mutedMusic = true
        if (PIXI.sound) {
            SoundManager.getMusicSounds().filter(s => s.isPlaying).forEach(s => s.muted = true)
        }
    },

    unmuteMusic: () => {
        SoundManager.mutedMusic = false
        if (PIXI.sound) {
            SoundManager.getMusicSounds().filter(s => s.isPlaying).forEach(s => s.muted = false)
            SoundManager.getMusicSounds().filter(s => s.isPlaying).map(s => s.instances).filter(ia => ia[0].muted).forEach(ia => ia[0].muted = false)
        }
    },
    muteSounds: () => {
        SoundManager.mutedSounds = true
        if (PIXI.sound) {
            SoundManager.getSFXSounds().filter(s => s.isPlaying).forEach(s => s.muted = true)
        }
    },

    unmuteSounds: () => {
        SoundManager.mutedSounds = false
        if (PIXI.sound) {
            SoundManager.getSFXSounds().filter(s => s.isPlaying && s.muted === true).forEach(s => s.muted = false)
            SoundManager.getSFXSounds().filter(s => s.isPlaying).map(s => s.instances).filter(ia => ia[0].muted).forEach(ia => ia[0].muted = false)

        }
    },

    playSFX: (soundName, options = {}) => {
        return PIXI.sound?.play(soundName, { ...options, muted: SoundManager.mutedSounds })
    },

    playMusic: async (musicname) => {
        if (PIXI.sound) {
            SoundManager.getMusicSounds().filter(s => s.isPlaying).forEach(s => s.stop())
        }

        SoundManager.musicName = musicname
        let loopTimeout = false;
        setTimeout(() => {
            loopTimeout = true;
        }, 2000);

        while (SoundManager.getMusicSounds().filter(s => s.isPlaying).length > 0) {
            if (loopTimeout) {
                break; // Brich die Schleife ab, wenn der Timeout erreicht ist
            }

            await new Promise(resolve => setTimeout(resolve, 10)); // Beispiel für 10ms Verzögerung

        }

        if (PIXI.sound) {
            PIXI.sound?.play(musicname, { volume: 0.3, loop: true, muted: SoundManager.mutedMusic, singleInstance: true })
        }


    },
    stopMusic: () => {
        SoundManager.musicName = null
        if (PIXI.sound) {
            SoundManager.getMusicSounds().filter(s => s.isPlaying).forEach(s => s.stop())
        }
    },
    initSafe: function (app) {

        let loadAndInit = () => {
            if (!SoundManager.isInit) {
                SoundManager.isInit = true
                loadScript('lib/pixi-sound.js')
                    .then(() => {
                        SoundManager._init()
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        }

        app.stage.once('pointerup', (event) => {
            loadAndInit()
        })


        window.addEventListener('keyup', function handleKeyUpOnce(event) {
            loadAndInit()
            window.removeEventListener('keyup', handleKeyUpOnce);
        });

        window.addEventListener('focus', function () {
            if (SoundManager.mutedMusic) SoundManager.muteMusic();
            if (SoundManager.mutedSounds) SoundManager.muteSounds();
        });

        // Gamepad-Überprüfung
        let gamepadLoop = function () {
            const gamepads = navigator.getGamepads();
            for (const gamepad of gamepads) {
                if (!gamepad) continue;

                // Prüfen, ob irgendein Button gedrückt ist
                if (gamepad.buttons.some(button => button.pressed)) {
                    loadAndInit();
                    return; // Schleife und Loop beenden, da Sound initialisiert wurde
                }
            }

            // Wenn noch keine Taste gedrückt wurde, fortsetzen
            requestAnimationFrame(gamepadLoop);
        };

        gamepadLoop();

    },
    add: function (name, url) {
        if (typeof name === 'string') {
            if (PIXI.sound) {
                PIXI.sound.add(name, url)
            } else {
                SoundManager.toAdd.push({ name, url })
            }
        } else if (Array.isArray(name)) {
            name.forEach(nameUrlPair => this.add(nameUrlPair.name, nameUrlPair.url))
        } else if (typeof name === 'object') {
            this.add(name.name, name.url)
        }
    },
    _init: function () {
        // PIXI.sound.disableAutoPause = true
        SoundManager.toAdd.forEach(s => {
            SoundManager.add(s.name, s.url)
        })
        if (SoundManager.musicName) {
            SoundManager.playMusic(SoundManager.musicName)
        }
    }
}

