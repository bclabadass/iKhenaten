// A stonemason waiting at the pyramid for his block rocks back and forth, swinging his mallet (Brendan, 2026-11-24:
// "in the original a stonemason waiting for his block is animated, rocking back and forth"). He held one standing
// frame (walk frame 9). The original's mason sprite switch (0x4ab2b6) gives its waiting states SprMain group 155,
// 12 frames for 8 directions, next to his walk (150), death (151) and work (152).
// Needs the Duo save in the Pharaoh folder's Save/DuoSaves/; without it the test logs a skip and passes.
// Markers:
//   [test-marker] t929_waiting_mason_rocks
//   [test-marker] t929_save_skipped

function run_test() {
    if (!__game_load_savegame(__test_data_dir() + '/Save/DuoSaves/Saqqara 10.svx')) {
        __log_marker('t929_save_skipped')
        __test_signal_ready()
        return
    }
    __test_pump_frames(2)
    var base = __test_image_id_from_group(PACK_SPR_MAIN, 155, 0)
    var mason = 0, samples = 0, outside = 0, dirs = {}, frames = {}, last = -1
    for (var k = 0; k < 9000 && samples < 120; k++) {
        __test_pump_frames(1)
        if (ui.window_is('window_message_dialog')) {
            window_go_back()
        }
        if (mason && (__test_figure_get_action(mason) != ACTION_19_MASON_WAIT_FOR_BLOCK)) {
            mason = 0
        }
        if (!mason) {
            for (var j = 1; j < 3000 && !mason; j++) {
                var f = city.get_figure(j)
                if (f && f.valid && f.type == FIGURE_STONEMASON && f.action_state == ACTION_19_MASON_WAIT_FOR_BLOCK) {
                    mason = j
                }
            }
            continue
        }
        var img = __test_figure_main_image_id(mason)
        samples++
        last = img
        if (img < base || img >= base + 96) {
            outside++
            continue
        }
        dirs[(img - base) % 8] = true
        frames[((img - base) / 8) | 0] = true
    }
    var nframes = Object.keys(frames).length
    __log_info_native('[test:929] waiting mason ' + mason + ' samples ' + samples + ', outside group 155 ' + outside
        + ' (last image ' + last + ', group from ' + base + '), frames seen ' + nframes + ' ['
        + Object.keys(frames).join(',') + '], directions ' + Object.keys(dirs).length)
    if (samples > 0 && outside == 0 && nframes >= 6) {
        __log_marker('t929_waiting_mason_rocks')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t929_waiting_mason_rocks')
        || __test_find_inlog('[test-marker] t929_save_skipped')
}
