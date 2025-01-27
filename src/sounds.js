
const SoundManager = {
    isInit: false,
    musicInstance: null,
    musicName: null,
    sounds: {},
    muted: false,
    mutedMusic: false,
    toAdd: [],

    muteMusic: () => {
        SoundManager.mutedMusic= true
        if (SoundManager.musicInstance) {
            SoundManager.musicInstance.muted = true
        }
    },

    unmuteMusic: () => {
        SoundManager.mutedMusic= false
        if (SoundManager.musicInstance) {
            SoundManager.musicInstance.muted = false
        }
    },
    muteAll: () => {
        PIXI.sound?.muteAll()
        SoundManager.muted= true
    },

    unmuteAll: () => {
        PIXI.sound?.unmuteAll()
        SoundManager.muted = false
    },

    play: (soundName, options = {}) => {
        return PIXI.sound?.play(soundName, {...options, muted: SoundManager.muted})
    },

    playMusic: (musicname) => {
        SoundManager.musicName = musicname
        
        if (SoundManager.musicInstance) {
            SoundManager.musicInstance.stop()
            SoundManager.musicInstance = null;
        }

        if (PIXI.sound) {
            Promise.resolve(PIXI.sound?.play(musicname, {volume: 0.3, loop: true, muted: SoundManager.mutedMusic, singleInstance : true})).then((instance) => {
                SoundManager.musicInstance = instance
            })
        }
        
    },
    stopAll: () => {
        PIXI.sound?.stopAll();
    },
    initSafe: function(app) {
        
        let loadAndInit = () => {
            if (!SoundManager.isInit) {
                SoundManager.isInit = true
                loadScript('lib/pixi-sound.js')
                .then(() => {
                    SoundManager.init()
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
    add: function(name, url) {
        if (PIXI.sound) {
            PIXI.sound.add(name,url )
        } else {
            SoundManager.toAdd.push({name,url})
        }
        
    },
    init: function() {
        PIXI.sound.disableAutoPause = true
        SoundManager.toAdd.forEach(s => {
            SoundManager.add(s.name, s.url)
        })
        if (SoundManager.musicName) {
            SoundManager.playMusic(SoundManager.musicName)
        } 
    }
}

