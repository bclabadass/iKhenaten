// Brendan's Saqqara pyramid stopped: no block in months with 128 loads of stone in the yards. Its sled train waited at
// the foot of a ramp that a carpenter has to build, and the carpenters' guild never got timber: deliveries went only to
// buildings flagged as workshops, and a load that reached a guild was dropped. Guilds that work from a raw material are
// supplied like workshops now. On the way: a laborer kept following the slot of a stonemason that was gone (now another
// kind of figure), and parts stayed claimed by such slots; both now go to live masons.
// Needs the Duo save in the Pharaoh folder's Save/DuoSaves/; without it the test logs a skip and passes.
// Markers:
//   [test-marker] t907_pyramid_resumes
//   [test-marker] t907_save_skipped

var T907_SAVE = __test_data_dir() + '/Save/DuoSaves/Saqqara stalled pyramid.svx'

function run_test() {
    if (!__game_load_savegame(T907_SAVE)) {
        __log_marker('t907_save_skipped')
        __test_signal_ready()
        return
    }
    __test_pump_frames(2)
    var mon = 0
    for (var i = 1; i < 4000 && !mon; i++) {
        var b = city.get_building(i)
        if (b && b.state && b.type == BUILDING_MEDIUM_STEPPED_PYRAMID && __building_main_id(i) == i) {
            mon = i
        }
    }
    var before = __pyramid_remaining_blocks(mon)
    for (var k = 0; k < 24 && __pyramid_remaining_blocks(mon) >= before; k++) {
        __test_pump_frames(400)
        if (ui.window_is('window_message_dialog')) {
            window_go_back()
        }
    }
    var after = __pyramid_remaining_blocks(mon)
    __log_info_native('[test:907] pyramid ' + mon + ' blocks left ' + before + ' -> ' + after)
    if (mon && after < before) {
        __log_marker('t907_pyramid_resumes')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t907_pyramid_resumes') || __test_find_inlog('[test-marker] t907_save_skipped')
}
