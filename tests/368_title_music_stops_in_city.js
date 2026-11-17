// The title track loops. Starting a mission (music_update(1), from the briefing's start and from a save load)
// must replace it with city music, also for missions that music.txt lists, where the city music otherwise
// starts only once nothing plays. The mixer is off in tests, so __test_music_assume_playing keeps the current
// track "playing" the way the looping title track does on a device.

var __test368_ok = false

var PLAYLIST =
    "advent.mp3 M 5 20 0 499\n" +
    "sps.mp3 M 5 20 0 499\n"

function test368_fail(msg) {
    __log_info_native('[test:368] ' + msg)
    return false
}

function test368_case(label, mission, playlist) {
    __test_music_load_playlist(playlist)
    __test_set_campaign_scenario_id(mission)
    __test_set_city_population(200)
    __game_sound.music_stop()

    var menu = __test_music_menu_track_start()
    if (!menu || __test_music_current_track() != menu) {
        return test368_fail(label + ': title track did not start')
    }
    __game_sound.music_update(1)
    var city = __test_music_current_track()
    __log_info_native('[test:368] ' + label + ': title ' + menu + ', after mission start ' + city)
    if (!city || city == menu) {
        return test368_fail(label + ': title track ' + menu + ' still playing after the mission started')
    }

    __test_music_frame()
    __game_sound.music_update(0)
    if (__test_music_current_track() != city) {
        return test368_fail(label + ': city track ' + city + ' was replaced by ' + __test_music_current_track() + ' while playing')
    }
    return true
}

function run_test() {
    __log_info_native('[test:368] title music stops when a mission starts')
    test_reload_city_session('data/default.map')

    var music_prev = game_features.get('gameopt_sound_music_enabled') === true
    game_features.set('gameopt_sound_music_enabled', true)
    __test_music_assume_playing(true)

    var ok = test368_case('music.txt mission', 5, PLAYLIST) && test368_case('population pools', -1, "")

    __test_music_assume_playing(false)
    __game_sound.music_stop()
    __test_music_load_playlist("")
    __test_set_campaign_scenario_id(-1)
    game_features.set('gameopt_sound_music_enabled', music_prev)
    __test368_ok = ok
    __test_signal_ready()
}

function check_valid() {
    return __test368_ok
}
