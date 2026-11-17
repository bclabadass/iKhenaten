// The hippo asks for Wavs/hippoatk.wav every frame of a fight, and Pharaoh has no such file (the hyena's and
// crocodile's attack sounds are missing too): every frame searched the disk and logged a warning (2169 times
// in one session on the Duo). A missing speech file is now looked up once.

var __test370_ok = false

function run_test() {
    __log_info_native('[test:370] missing speech file looked up once')
    var speech_prev = game_features.get('gameopt_sound_speech_enabled') === true
    game_features.set('gameopt_sound_speech_enabled', true)

    var name = 'Wavs/test370_no_such_attack.wav'
    var before = __test_speech_lookup(name)
    var after = before
    for (var i = 0; i < 50; ++i) {
        after = __test_speech_lookup(name)
    }
    var other = __test_speech_lookup('Wavs/test370_another.wav')

    game_features.set('gameopt_sound_speech_enabled', speech_prev)
    __log_info_native('[test:370] lookups: first ' + before + ', after 50 more ' + after + ', another file ' + other)
    __test370_ok = before > 0 && after == before && other == before + 1
    __test_signal_ready()
}

function check_valid() {
    return __test370_ok
}
