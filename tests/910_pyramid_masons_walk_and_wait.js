// Pyramid workers walk smoothly over the courses, stand on top of the course picture under them, and a stonemason
// waiting for his block stands still. A worker's tile only hops from part to part as he walks the course, and he was
// drawn on that tile, so he jumped a part at a time; he was raised 15 pixels a block, which put him above the upper
// courses and off the part he stood on; and a mason waiting for the sled played his chiseling loop (Brendan,
// Saqqara 10: "stutter across the pyramid", "always chiseling", "no longer aligned with the grid").
// Needs the Duo save in the Pharaoh folder's Save/DuoSaves/; without it the test logs a skip and passes.
// Markers:
//   [test-marker] t910_workers_walk_smoothly
//   [test-marker] t910_workers_on_course_tops
//   [test-marker] t910_waiting_masons_stand
//   [test-marker] t910_save_skipped

function run_test() {
    if (!__game_load_savegame(__test_data_dir() + '/Save/DuoSaves/Saqqara 10.svx')) {
        __log_marker('t910_save_skipped')
        __test_signal_ready()
        return
    }
    __test_screen_resize(1280, 960)
    __test_pump_frames(2)
    var mon = 0
    for (var i = 1; i < 4000 && !mon; i++) {
        var b = city.get_building(i)
        if (b && b.state && b.type == BUILDING_MEDIUM_STEPPED_PYRAMID && __building_main_id(i) == i) {
            mon = i
        }
    }
    __test_camera_center_building(mon)
    __test_pump_frames(3)
    var on = __test_pyramid_workers_raised().split(',')

    var samples = 0, max_jump = 0, waiting = 0, changed = 0
    __test_pyramid_walk_jump()
    __test_pyramid_waiting_masons()
    for (var k = 0; k < 8000 && (samples < 1500 || waiting < 200); k++) {
        __test_pump_frames(1)
        if (ui.window_is('window_message_dialog')) {
            window_go_back()
        }
        var j = __test_pyramid_walk_jump().split(',')
        samples += +j[0]
        max_jump = Math.max(max_jump, +j[1])
        var w = __test_pyramid_waiting_masons().split(',')
        waiting += +w[0]
        changed += +w[1]
    }
    __log_info_native('[test:910] on courses ' + on[0] + ', on the course tops ' + on[1] + '; walking samples ' + samples
        + ', largest step ' + max_jump + ' px; waiting samples ' + waiting + ', sprite changed ' + changed)
    if (+on[0] > 0 && on[0] == on[1]) {
        __log_marker('t910_workers_on_course_tops')
    }
    if (samples > 0 && max_jump <= 8) {
        __log_marker('t910_workers_walk_smoothly')
    }
    if (waiting > 0 && changed == 0) {
        __log_marker('t910_waiting_masons_stand')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return (__test_find_inlog('[test-marker] t910_workers_walk_smoothly')
        && __test_find_inlog('[test-marker] t910_workers_on_course_tops')
        && __test_find_inlog('[test-marker] t910_waiting_masons_stand'))
        || __test_find_inlog('[test-marker] t910_save_skipped')
}
