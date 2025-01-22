
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
        }

        if (PIXI.sound) {
            Promise.resolve(PIXI.sound?.play(musicname, {volume: 0.3, loop: true, muted: SoundManager.mutedMusic})).then((instance) => {
                SoundManager.musicInstance = instance
            })
        }
        
    },
    stopAll: () => {
        PIXI.sound?.stopAll();
    },
    initSafe: function(app) {
        app.stage.once('pointerup', (event) => {
            loadScript('lib/pixi-sound.js')
            .then(() => {
                SoundManager.init()
            })
            .catch((error) => {
                console.error(error);
            });
        
        })
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

