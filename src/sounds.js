
const SoundManager = {
    isInit: false,
    musicName: null,
    sounds: {},
    muted: false,
    toAdd: [],
    muteAll: () => {
        PIXI.sound?.muteAll()
        SoundManager.muted= true
    },

    unmuteAll: () => {
        PIXI.sound?.unmuteAll()
        SoundManager.muted = false
    },

    play: (soundName) => {
        PIXI.sound?.play(soundName)
    },
    playSound: (sound) => {
        if (sound) {
            sound.play()
        } else {

        }
    },
    playMusic: (musicname) => {
        PIXI.sound?.stopAll();
        PIXI.sound?.play(musicname, {loop: true})
        SoundManager.musicName = musicname
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
        SoundManager.toAdd.forEach(s => {
            SoundManager.add(s.name, s.url)
        })
        if (SoundManager.musicName) {
            SoundManager.playMusic(SoundManager.musicName)
        } 
    }
}

