// A stepped pyramid is drawn part by part as in the original, and its workers stand on the courses. The stepped style
// still drew each ring as one course worked out from the blocks laid over the whole pyramid, so a layer seemed to go
// down at once, ahead of the masons, and the 2x2 parts the block engine fills one by one were never seen. The
// workers were drawn on the ground under the stones (Brendan, Saqqara: "laying entire layers", "masons hidden under
// the stones"). Parts of one kind on one course with different block counts must look different, and every worker standing
// on a raised course must be drawn at its height and after the pyramid's front row ("Saqqara money" save).
// Needs the Duo save in the Pharaoh folder's Save/DuoSaves/; without it the test logs a skip and passes.
// Markers:
//   [test-marker] t909_parts_drawn_by_blocks
//   [test-marker] t909_workers_on_courses
//   [test-marker] t909_save_skipped

function run_test() {
    if (!__game_load_savegame(__test_data_dir() + '/Save/DuoSaves/Saqqara money.svx')) {
        __log_marker('t909_save_skipped')
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
    var before = __pyramid_remaining_blocks(mon)
    for (var k = 0; k < 40 && __pyramid_remaining_blocks(mon) > before - 4; k++) {
        __test_pump_frames(400)
        if (ui.window_is('window_message_dialog')) {
            window_go_back()
        }
    }
    var images = __test_pyramid_part_images(mon).split(',')
    __test_camera_center_building(mon)
    __test_pump_frames(3)
    var workers = __test_pyramid_workers_raised().split(',')
    __log_info_native('[test:909] pyramid ' + mon + ': part pairs with different blocks ' + images[0]
        + ', drawn alike ' + images[1] + '; workers on raised courses ' + workers[0] + ', drawn on them ' + workers[1])
    if (+images[0] > 0 && +images[1] == 0) {
        __log_marker('t909_parts_drawn_by_blocks')
    }
    if (+workers[0] > 0 && workers[0] == workers[1]) {
        __log_marker('t909_workers_on_courses')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return (__test_find_inlog('[test-marker] t909_parts_drawn_by_blocks')
        && __test_find_inlog('[test-marker] t909_workers_on_courses'))
        || __test_find_inlog('[test-marker] t909_save_skipped')
}
